import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Product } from '../models/Product.model.js';
import { Size } from '../models/Size.model.js';
import { Color } from '../models/Color.model.js';
import { InventoryTransaction } from '../models/InventoryTransaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, writeAuditLog } from '../utils/domain.js';
import { runInTransaction } from '../config/database.js';

const variantPopulate = [
  { path: 'product', select: 'name brand status images category', populate: { path: 'category', select: 'name' } },
  { path: 'size', select: 'name description' },
  { path: 'color', select: 'name hexCode description' },
];

const getVariantFilter = async (search?: string): Promise<Record<string, unknown>> => {
  if (!search) return {};
  const pattern = new RegExp(escapeRegex(search), 'i');
  const [products, sizes, colors] = await Promise.all([
    Product.find({ $or: [{ name: pattern }, { brand: pattern }] }).distinct('_id'),
    Size.find({ name: pattern }).distinct('_id'),
    Color.find({ name: pattern }).distinct('_id'),
  ]);
  return {
    $or: [
      { sku: pattern },
      { barcode: pattern },
      { product: { $in: products } },
      { size: { $in: sizes } },
      { color: { $in: colors } },
    ],
  };
};

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = await getVariantFilter(req.query.search ? String(req.query.search) : undefined);
    const variants = await ProductVariant.find(filter).populate(variantPopulate).sort({ sku: 1 });
    return res.status(200).json({
      success: true,
      data: variants.map((variant) => {
        const plain = variant.toObject() as unknown as Record<string, unknown>;
        if (req.user?.role !== 'admin') delete plain.costPrice;
        return {
        ...plain,
        stockStatus: variant.quantity === 0
          ? 'out_of_stock'
          : variant.quantity <= variant.lowStockLevel
            ? 'low_stock'
            : 'in_stock',
      };}),
    });
  } catch (error) {
    return next(error);
  }
};

export const getLowStock = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const variants = await ProductVariant.find({ $expr: { $lte: ['$quantity', '$lowStockLevel'] } })
      .populate(variantPopulate)
      .sort({ quantity: 1 });
    return res.status(200).json({ success: true, data: variants });
  } catch (error) {
    return next(error);
  }
};

export const getInventoryHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      const variants = await ProductVariant.find({ $or: [{ sku: pattern }, { barcode: pattern }] }).distinct('_id');
      filter.$or = [{ reference: pattern }, { reason: pattern }, { variant: { $in: variants } }];
    }
    const history = await InventoryTransaction.find(filter)
      .populate({ path: 'variant', populate: variantPopulate })
      .populate('user', 'name username')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw ApiError.unauthorized('Authentication required.');
    let transactionId: mongoose.Types.ObjectId | undefined;

    await runInTransaction(async (session) => {
      const condition: Record<string, unknown> = { _id: req.body.variantId };
      if (req.body.change < 0) condition.quantity = { $gte: Math.abs(req.body.change) };
      const variant = await ProductVariant.findOneAndUpdate(
        condition,
        { $inc: { quantity: req.body.change } },
        { new: true, session }
      );
      if (!variant) throw ApiError.conflict('Variant was not found or the adjustment would make stock negative.');

      const previousStock = variant.quantity - req.body.change;
      const [transaction] = await InventoryTransaction.create([{
        variant: variant._id,
        type: req.body.type,
        previousStock,
        change: req.body.change,
        newStock: variant.quantity,
        reference: `ADJ-${new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase()}`,
        reason: req.body.reason,
        user: userId,
      }], { session });
      transactionId = transaction._id;

      await writeAuditLog(req, 'STOCK_ADJUSTMENT', 'ProductVariant', variant._id.toString(), {
        change: req.body.change,
        previousStock,
        newStock: variant.quantity,
        reason: req.body.reason,
      }, session);
    });

    const transaction = await InventoryTransaction.findById(transactionId)
      .populate({ path: 'variant', populate: variantPopulate })
      .populate('user', 'name username');
    return res.status(201).json({ success: true, message: 'Stock adjusted successfully', data: transaction });
  } catch (error) {
    return next(error);
  }
};
