import { Request, Response, NextFunction } from 'express';

import { Purchase } from '../models/Purchase.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { InventoryTransaction } from '../models/InventoryTransaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, roundMoney, writeAuditLog } from '../utils/domain.js';
import { runInTransaction } from '../config/database.js';

interface PurchasePayloadItem {
  variantId: string;
  quantity: number;
  costPrice: number;
}

const purchasePopulate = [
  { path: 'supplier', select: 'name contactPerson phone email' },
  { path: 'createdBy', select: 'name username' },
  { path: 'receivedBy', select: 'name username' },
  { path: 'items.variant', populate: [{ path: 'product', select: 'name' }, { path: 'size', select: 'name' }, { path: 'color', select: 'name' }] },
];

const buildPurchaseItems = async (items: PurchasePayloadItem[]) => {
  const variants = await ProductVariant.find({ _id: { $in: items.map((item) => item.variantId) } })
    .populate('product', 'name');
  if (variants.length !== items.length) throw ApiError.badRequest('One or more product variants do not exist.');
  const map = new Map(variants.map((variant) => [String(variant._id), variant]));

  let subtotal = 0;
  const purchaseItems = items.map((item) => {
    const variant = map.get(item.variantId);
    if (!variant) throw ApiError.badRequest(`Variant ${item.variantId} does not exist.`);
    const product = variant.product as unknown as { name: string };
    const lineSubtotal = roundMoney(item.quantity * item.costPrice);
    subtotal = roundMoney(subtotal + lineSubtotal);
    return {
      variant: variant._id,
      productName: product.name,
      sku: variant.sku,
      quantity: item.quantity,
      costPrice: item.costPrice,
      subtotal: lineSubtotal,
    };
  });

  return { purchaseItems, subtotal };
};

export const getPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      const suppliers = await Supplier.find({ name: pattern }).distinct('_id');
      filter.$or = [{ purchaseNumber: pattern }, { supplier: { $in: suppliers } }];
    }
    const purchases = await Purchase.find(filter).populate(purchasePopulate).sort({ purchaseDate: -1 });
    return res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    return next(error);
  }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(purchasePopulate);
    if (!purchase) throw ApiError.notFound('Purchase order not found');
    return res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    return next(error);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await Supplier.exists({ _id: req.body.supplierId, status: 'active' }))) {
      throw ApiError.badRequest('Selected supplier does not exist or is inactive.');
    }
    const { purchaseItems, subtotal } = await buildPurchaseItems(req.body.items);
    if (req.body.discount > subtotal) throw ApiError.badRequest('Discount cannot exceed purchase subtotal.');

    const purchase = await Purchase.create({
      supplier: req.body.supplierId,
      purchaseDate: req.body.purchaseDate,
      items: purchaseItems,
      subtotal,
      discount: req.body.discount,
      total: roundMoney(subtotal - req.body.discount),
      status: req.body.status,
      notes: req.body.notes,
      createdBy: req.user?._id,
    });
    await writeAuditLog(req, 'CREATE_PURCHASE', 'Purchase', purchase._id.toString(), {
      purchaseNumber: purchase.purchaseNumber,
      total: purchase.total,
    });
    const populated = await Purchase.findById(purchase._id).populate(purchasePopulate);
    return res.status(201).json({ success: true, message: 'Purchase order created successfully', data: populated });
  } catch (error) {
    return next(error);
  }
};

export const updatePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) throw ApiError.notFound('Purchase order not found');
    if (!['draft', 'ordered'].includes(purchase.status)) {
      throw ApiError.conflict('Received or cancelled purchase orders cannot be edited.');
    }
    if (req.body.supplierId && !(await Supplier.exists({ _id: req.body.supplierId, status: 'active' }))) {
      throw ApiError.badRequest('Selected supplier does not exist or is inactive.');
    }

    if (req.body.items) {
      const { purchaseItems, subtotal } = await buildPurchaseItems(req.body.items);
      purchase.items = purchaseItems;
      purchase.subtotal = subtotal;
    }
    if (req.body.supplierId) purchase.supplier = req.body.supplierId;
    if (req.body.purchaseDate) purchase.purchaseDate = req.body.purchaseDate;
    if (req.body.discount !== undefined) purchase.discount = req.body.discount;
    if (req.body.status) purchase.status = req.body.status;
    if (req.body.notes !== undefined) purchase.notes = req.body.notes;
    if (purchase.discount > purchase.subtotal) throw ApiError.badRequest('Discount cannot exceed purchase subtotal.');
    purchase.total = roundMoney(purchase.subtotal - purchase.discount);
    await purchase.save();

    await writeAuditLog(req, 'UPDATE_PURCHASE', 'Purchase', purchase._id.toString(), {
      fields: Object.keys(req.body),
    });
    const populated = await Purchase.findById(purchase._id).populate(purchasePopulate);
    return res.status(200).json({ success: true, message: 'Purchase order updated successfully', data: populated });
  } catch (error) {
    return next(error);
  }
};

export const receivePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw ApiError.unauthorized('Authentication required.');

    await runInTransaction(async (session) => {
      const purchase = await Purchase.findOne({ _id: req.params.id, status: 'ordered' }).session(session);
      if (!purchase) throw ApiError.conflict('Only an ordered purchase can be received.');

      for (const item of purchase.items) {
        const variant = await ProductVariant.findById(item.variant).session(session);
        if (!variant) throw ApiError.conflict(`Variant for ${item.sku} no longer exists.`);

        const previousStock = variant.quantity;
        const newStock = previousStock + item.quantity;
        variant.costPrice = newStock === 0
          ? item.costPrice
          : roundMoney(((previousStock * variant.costPrice) + item.subtotal) / newStock);
        variant.quantity = newStock;
        await variant.save({ session });

        await InventoryTransaction.create([{
          variant: variant._id,
          type: 'PURCHASE',
          previousStock,
          change: item.quantity,
          newStock,
          reference: purchase.purchaseNumber,
          reason: 'Purchase order received',
          user: userId,
        }], { session });
      }

      purchase.status = 'received';
      purchase.receivedAt = new Date();
      purchase.receivedBy = userId;
      await purchase.save({ session });
      await writeAuditLog(req, 'RECEIVE_PURCHASE', 'Purchase', purchase._id.toString(), {
        purchaseNumber: purchase.purchaseNumber,
        total: purchase.total,
      }, session);
    });

    const purchase = await Purchase.findById(req.params.id).populate(purchasePopulate);
    return res.status(200).json({ success: true, message: 'Purchase received and inventory updated', data: purchase });
  } catch (error) {
    return next(error);
  }
};

export const cancelPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchase = await Purchase.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['draft', 'ordered'] } },
      { status: 'cancelled' },
      { new: true }
    );
    if (!purchase) throw ApiError.conflict('Only a draft or ordered purchase can be cancelled.');
    await writeAuditLog(req, 'CANCEL_PURCHASE', 'Purchase', purchase._id.toString(), {
      purchaseNumber: purchase.purchaseNumber,
    });
    return res.status(200).json({ success: true, message: 'Purchase order cancelled', data: purchase });
  } catch (error) {
    return next(error);
  }
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchase = await Purchase.findOneAndDelete({ _id: req.params.id, status: 'draft' });
    if (!purchase) throw ApiError.conflict('Only a draft purchase order can be deleted.');
    await writeAuditLog(req, 'DELETE_PURCHASE', 'Purchase', purchase._id.toString(), {
      purchaseNumber: purchase.purchaseNumber,
    });
    return res.status(200).json({ success: true, message: 'Draft purchase order deleted' });
  } catch (error) {
    return next(error);
  }
};
