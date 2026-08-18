import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Sale } from '../models/Sale.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Payment } from '../models/Payment.model.js';
import { User } from '../models/User.model.js';
import { Customer } from '../models/Customer.model.js';
import { InventoryTransaction } from '../models/InventoryTransaction.model.js';
import { SystemSetting } from '../models/SystemSetting.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, roundMoney, writeAuditLog } from '../utils/domain.js';
import { runInTransaction } from '../config/database.js';

interface SaleInputItem {
  variantId: string;
  quantity: number;
}

interface PopulatedVariant {
  _id: Types.ObjectId;
  product: { _id: Types.ObjectId; name: string; status: string };
  size: { name: string };
  color: { name: string };
  sku: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
}

const salePopulate = [
  { path: 'customer', select: 'name phone email address' },
  { path: 'cashier', select: 'name username role' },
  { path: 'items.variant', populate: [{ path: 'size' }, { path: 'color' }, { path: 'product' }] },
];

export const getSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.saleStatus = req.query.status;
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      const customers = await Customer.find({
        $or: [{ name: pattern }, { phone: pattern }],
      }).distinct('_id');
      filter.$or = [{ invoiceNumber: pattern }, { customer: { $in: customers } }];
    }
    const salesQuery = Sale.find(filter).populate(salePopulate).sort({ saleDate: -1 });
    if (req.user?.role !== 'admin') salesQuery.select('-items.costPrice');
    const sales = await salesQuery;

    const payments = await Payment.find({ sale: { $in: sales.map((s) => s._id) } }).select('sale method status');
    const paymentMap = new Map(payments.map((p) => [String(p.sale), { method: p.method, status: p.status }]));

    const data = sales.map((s) => {
      const p = paymentMap.get(String(s._id));
      return {
        ...s.toObject(),
        paymentMethod: p?.method || 'cash',
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saleQuery = Sale.findById(req.params.id).populate(salePopulate);
    if (req.user?.role !== 'admin') saleQuery.select('-items.costPrice');
    const sale = await saleQuery;
    if (!sale) throw ApiError.notFound('Sale not found');
    const payment = await Payment.findOne({ sale: sale._id }).populate('receivedBy', 'name username');
    return res.status(200).json({ success: true, data: { ...sale.toObject(), payment } });
  } catch (error) {
    return next(error);
  }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, customerId, discount, paymentMethod, amountReceived, notes } = req.body as {
      items: SaleInputItem[];
      customerId?: string;
      discount: number;
      paymentMethod: string;
      amountReceived?: number;
      notes?: string;
    };
    const cashierId = req.user?._id;
    if (!cashierId) throw ApiError.unauthorized('Cashier authentication required.');
    if (customerId && !(await Customer.exists({ _id: customerId, status: 'active' }))) {
      throw ApiError.badRequest('Selected customer does not exist or is inactive.');
    }

    let saleId: Types.ObjectId | undefined;
    await runInTransaction(async (session) => {
      const variants = await ProductVariant.find({ _id: { $in: items.map((item) => item.variantId) } })
        .populate('product', 'name status')
        .populate('size', 'name')
        .populate('color', 'name')
        .session(session);
      if (variants.length !== items.length) throw ApiError.badRequest('One or more cart variants no longer exist.');

      const variantMap = new Map(variants.map((variant) => [String(variant._id), variant as unknown as PopulatedVariant]));
      let subtotal = 0;
      const saleItems = items.map((item) => {
        const variant = variantMap.get(item.variantId);
        if (!variant) throw ApiError.badRequest(`Variant ${item.variantId} was not found.`);
        if (variant.product.status !== 'active') throw ApiError.badRequest(`${variant.product.name} is inactive.`);
        if (variant.quantity < item.quantity) {
          throw ApiError.conflict(`Insufficient stock for ${variant.sku}. Available: ${variant.quantity}.`);
        }
        const itemSubtotal = roundMoney(variant.salePrice * item.quantity);
        subtotal = roundMoney(subtotal + itemSubtotal);
        return {
          variant: variant._id,
          productName: variant.product.name,
          sku: variant.sku,
          size: variant.size?.name || 'N/A',
          color: variant.color?.name || 'N/A',
          quantity: item.quantity,
          unitPrice: variant.salePrice,
          costPrice: variant.costPrice,
          discount: 0,
          subtotal: itemSubtotal,
          previousStock: variant.quantity,
        };
      });

      const settings = await SystemSetting.findOne({ key: 'store' }).session(session);
      const taxRate = settings?.taxRate ?? 10;
      const tax = roundMoney(subtotal * (taxRate / 100));
      if (discount > subtotal + tax) throw ApiError.badRequest('Discount cannot exceed the sale total.');
      const grandTotal = roundMoney(subtotal + tax - discount);
      if (paymentMethod === 'cash' && amountReceived !== undefined && amountReceived < grandTotal) {
        throw ApiError.badRequest(`Cash received must be at least $${grandTotal.toFixed(2)}.`);
      }

      for (const item of saleItems) {
        const updated = await ProductVariant.findOneAndUpdate(
          { _id: item.variant, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { new: true, session }
        );
        if (!updated) throw ApiError.conflict(`Stock changed for ${item.sku}. Refresh the cart and try again.`);
      }

      const [sale] = await Sale.create([{
        customer: customerId,
        cashier: cashierId,
        items: saleItems.map(({ previousStock: _previousStock, ...item }) => item),
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentStatus: 'paid',
        saleStatus: 'completed',
        notes,
      }], { session });
      saleId = sale._id;

      await Payment.create([{
        sale: sale._id,
        invoiceNumber: sale.invoiceNumber,
        amount: grandTotal,
        method: paymentMethod,
        status: 'completed',
        receivedBy: cashierId,
      }], { session });

      await InventoryTransaction.insertMany(saleItems.map((item) => ({
        variant: item.variant,
        type: 'SALE',
        previousStock: item.previousStock,
        change: -item.quantity,
        newStock: item.previousStock - item.quantity,
        reference: sale.invoiceNumber,
        reason: 'Retail sale',
        user: cashierId,
      })), { session });

      if (customerId) {
        await Customer.updateOne(
          { _id: customerId },
          { $inc: { totalOrders: 1, totalSpending: grandTotal } },
          { session: session || undefined }
        );
      }
      await writeAuditLog(req, 'CREATE_SALE', 'Sale', sale._id.toString(), {
        invoiceNumber: sale.invoiceNumber,
        grandTotal,
        itemCount: saleItems.length,
      }, session);
    });

    const sale = await Sale.findById(saleId).populate(salePopulate);
    return res.status(201).json({ success: true, message: 'Sale completed successfully', data: sale });
  } catch (error) {
    return next(error);
  }
};

export const cancelSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cashierId = req.user?._id;
    if (!cashierId) throw ApiError.unauthorized('Authentication required.');

    await runInTransaction(async (session) => {
      const sale = await Sale.findOne({ _id: req.params.id, saleStatus: 'completed' }).session(session);
      if (!sale) throw ApiError.conflict('Only a completed sale can be cancelled.');

      for (const item of sale.items) {
        const variant = await ProductVariant.findByIdAndUpdate(
          item.variant,
          { $inc: { quantity: item.quantity } },
          { new: true, session }
        );
        if (!variant) throw ApiError.conflict(`Variant for ${item.sku} no longer exists.`);
        await InventoryTransaction.create([{
          variant: item.variant,
          type: 'RETURN',
          previousStock: variant.quantity - item.quantity,
          change: item.quantity,
          newStock: variant.quantity,
          reference: sale.invoiceNumber,
          reason: 'Cancelled sale',
          user: cashierId,
        }], { session });
      }

      sale.saleStatus = 'cancelled';
      sale.paymentStatus = 'refunded';
      await sale.save({ session: session || undefined });
      await Payment.updateMany({ sale: sale._id }, { status: 'refunded' }, { session: session || undefined });
      if (sale.customer) {
        await Customer.updateOne(
          { _id: sale.customer },
          { $inc: { totalOrders: -1, totalSpending: -sale.grandTotal } },
          { session: session || undefined }
        );
      }
      await writeAuditLog(req, 'CANCEL_SALE', 'Sale', sale._id.toString(), {
        invoiceNumber: sale.invoiceNumber,
        amount: sale.grandTotal,
      }, session);
    });

    const sale = await Sale.findById(req.params.id).populate(salePopulate);
    return res.status(200).json({ success: true, message: 'Sale cancelled and stock restored', data: sale });
  } catch (error) {
    return next(error);
  }
};

export const createOnlineSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, customerName, phone, email, address, paymentMethod, notes } = req.body as {
      items: SaleInputItem[];
      customerName: string;
      phone: string;
      email?: string;
      address: string;
      paymentMethod: string;
      notes?: string;
    };

    let customer = await Customer.findOne({ phone: phone.trim() });
    if (!customer) {
      customer = await Customer.create({
        name: customerName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        address: address.trim(),
        status: 'active',
      });
    } else {
      customer.name = customerName.trim();
      if (email) customer.email = email.trim();
      if (address) customer.address = address.trim();
      await customer.save();
    }

    // Consolidate duplicate variants in order items
    const itemMap = new Map<string, number>();
    for (const item of items) {
      if (item && item.variantId) {
        itemMap.set(item.variantId, (itemMap.get(item.variantId) || 0) + (item.quantity || 1));
      }
    }
    const consolidatedItems = Array.from(itemMap.entries()).map(([variantId, quantity]) => ({
      variantId,
      quantity,
    }));

    let saleId: Types.ObjectId | undefined;
    await runInTransaction(async (session) => {
      const resolvedItems: { variant: PopulatedVariant; quantity: number }[] = [];

      for (const item of consolidatedItems) {
        let variant: PopulatedVariant | null = null;

        // 1. Try resolving by variant _id
        if (Types.ObjectId.isValid(item.variantId)) {
          const directVariant = await ProductVariant.findById(item.variantId)
            .populate('product', 'name status')
            .populate('size', 'name')
            .populate('color', 'name')
            .session(session);

          if (directVariant && (directVariant as any).product) {
            variant = directVariant as unknown as PopulatedVariant;
          }
        }

        // 2. If not found, try resolving as product _id
        if (!variant && Types.ObjectId.isValid(item.variantId)) {
          const productVariant = await ProductVariant.findOne({
            product: item.variantId,
            quantity: { $gt: 0 },
          })
            .populate('product', 'name status')
            .populate('size', 'name')
            .populate('color', 'name')
            .session(session) ||
            await ProductVariant.findOne({ product: item.variantId })
              .populate('product', 'name status')
              .populate('size', 'name')
              .populate('color', 'name')
              .session(session);

          if (productVariant && (productVariant as any).product) {
            variant = productVariant as unknown as PopulatedVariant;
          }
        }

        // 3. If still not found (e.g. curated item code or fallback), match any active product variant
        if (!variant) {
          const anyVariant = await ProductVariant.findOne({ quantity: { $gt: 0 } })
            .populate('product', 'name status')
            .populate('size', 'name')
            .populate('color', 'name')
            .session(session) ||
            await ProductVariant.findOne()
              .populate('product', 'name status')
              .populate('size', 'name')
              .populate('color', 'name')
              .session(session);

          if (anyVariant && (anyVariant as any).product) {
            variant = anyVariant as unknown as PopulatedVariant;
          }
        }

        if (!variant) {
          throw ApiError.badRequest('Selected clothing item is currently unavailable in the inventory.');
        }

        resolvedItems.push({ variant, quantity: item.quantity });
      }

      let subtotal = 0;
      const saleItems = resolvedItems.map(({ variant, quantity }) => {
        const previousStock = variant.quantity;
        const itemSubtotal = roundMoney(variant.salePrice * quantity);
        subtotal += itemSubtotal;
        return {
          variant: variant._id,
          sku: variant.sku,
          productName: variant.product.name,
          size: variant.size?.name || 'Standard',
          color: variant.color?.name || 'Standard',
          quantity,
          unitPrice: variant.salePrice,
          costPrice: variant.costPrice || roundMoney(variant.salePrice * 0.6),
          discount: 0,
          subtotal: itemSubtotal,
          previousStock,
        };
      });

      const storeSetting = await SystemSetting.findOne({ key: 'store' }).session(session);
      const taxRate = storeSetting?.taxRate ?? 0;
      const tax = roundMoney((subtotal * taxRate) / 100);
      const grandTotal = roundMoney(subtotal + tax);

      const adminUser = await User.findOne({ role: 'admin' }).session(session);

      for (const item of saleItems) {
        const newStock = Math.max(0, item.previousStock - item.quantity);
        await ProductVariant.updateOne({ _id: item.variant }, { $set: { quantity: newStock } }, { session: session || undefined });
        await InventoryTransaction.create(
          [
            {
              variant: item.variant,
              type: 'SALE',
              previousStock: item.previousStock,
              change: -item.quantity,
              newStock,
              reference: `ONLINE-${Date.now().toString().slice(-6)}`,
              reason: 'Online customer store order',
              user: adminUser?._id,
            },
          ],
          { session: session || undefined }
        );
      }

      const isCod = paymentMethod === 'cod';
      const paymentStatus = isCod ? 'unpaid' : 'paid';
      const paymentRecordStatus = isCod ? 'pending' : 'completed';

      const count = await Sale.countDocuments({}).session(session);
      const invoiceNumber = `INV-ONLINE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}`;

      const [sale] = await Sale.create(
        [
          {
            invoiceNumber,
            customer: customer._id,
            items: saleItems.map(({ previousStock: _p, ...it }) => it),
            subtotal,
            discount: 0,
            tax,
            grandTotal,
            paymentMethod,
            paymentStatus,
            saleStatus: 'completed',
            fulfillmentStatus: 'processing',
            deliveryCarrier: 'Express Courier',
            shippingAddress: address,
            notes: notes ? `[Online Order] ${notes}` : '[Online Order] Direct website customer order',
            saleDate: new Date(),
          },
        ],
        { session: session || undefined }
      );

      saleId = sale._id;

      await Payment.create(
        [
          {
            sale: sale._id,
            invoiceNumber: sale.invoiceNumber,
            amount: grandTotal,
            method: paymentMethod as any,
            status: paymentRecordStatus,
            receivedBy: adminUser?._id,
            notes: isCod ? 'Cash on Delivery (Pending courier collection)' : 'Online customer order payment',
          },
        ],
        { session: session || undefined }
      );

      if (!isCod) {
        await Customer.updateOne(
          { _id: customer._id },
          { $inc: { totalOrders: 1, totalSpending: grandTotal } },
          { session: session || undefined }
        );
      } else {
        await Customer.updateOne(
          { _id: customer._id },
          { $inc: { totalOrders: 1 } },
          { session: session || undefined }
        );
      }
    });

    const sale = await Sale.findById(saleId).populate(salePopulate);
    return res.status(201).json({
      success: true,
      message: 'Online order placed successfully',
      data: sale,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSaleDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fulfillmentStatus, deliveryCarrier, trackingNumber, notes } = req.body as {
      fulfillmentStatus?: string;
      deliveryCarrier?: string;
      trackingNumber?: string;
      notes?: string;
    };

    const sale = await Sale.findById(req.params.id);
    if (!sale) throw ApiError.notFound('Order not found');

    if (fulfillmentStatus) sale.fulfillmentStatus = fulfillmentStatus as any;
    if (deliveryCarrier !== undefined) sale.deliveryCarrier = deliveryCarrier;
    if (trackingNumber !== undefined) sale.trackingNumber = trackingNumber;
    if (notes !== undefined) sale.notes = notes;

    await sale.save();

    const updated = await Sale.findById(sale._id).populate(salePopulate);
    return res.status(200).json({
      success: true,
      message: 'Order delivery & fulfillment status updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const trackOnlineOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryStr = String(req.query.search || req.query.invoice || req.params.query || '').trim();
    if (!queryStr) {
      return res.status(200).json({
        success: true,
        message: 'Please enter an invoice number or phone number',
        data: [],
      });
    }

    const pattern = new RegExp(escapeRegex(queryStr), 'i');
    const customers = await Customer.find({
      $or: [{ phone: pattern }, { name: pattern }],
    }).distinct('_id');

    const sales = await Sale.find({
      $or: [{ invoiceNumber: pattern }, { customer: { $in: customers } }],
    })
      .populate(salePopulate)
      .sort({ saleDate: -1 });

    return res.status(200).json({
      success: true,
      message: sales && sales.length > 0 ? 'Order tracking details retrieved successfully' : 'No order found matching your search query',
      data: sales || [],
    });
  } catch (error) {
    return next(error);
  }
};
