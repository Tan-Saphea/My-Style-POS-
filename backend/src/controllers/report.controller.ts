import { Request, Response, NextFunction } from 'express';
import { Sale } from '../models/Sale.model.js';
import { Purchase } from '../models/Purchase.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { roundMoney } from '../utils/domain.js';

const dateFilter = (req: Request, field: string): Record<string, unknown> => {
  const range: Record<string, Date> = {};
  if (req.query.startDate) range.$gte = req.query.startDate as unknown as Date;
  if (req.query.endDate) {
    const end = new Date(req.query.endDate as unknown as Date);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return Object.keys(range).length ? { [field]: range } : {};
};

export const getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Sale.aggregate([
      { $match: { saleStatus: 'completed', ...dateFilter(req, 'saleDate') } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } }, revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
      { $project: { _id: 0, date: '$_id', revenue: { $round: ['$revenue', 2] }, orders: 1, averageOrder: { $round: [{ $divide: ['$revenue', '$orders'] }, 2] } } },
      { $sort: { date: 1 } },
    ]);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getProfitReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await Sale.find({ saleStatus: 'completed', ...dateFilter(req, 'saleDate') });
    const revenue = roundMoney(sales.reduce((sum, sale) => sum + sale.subtotal - sale.discount, 0));
    const taxCollected = roundMoney(sales.reduce((sum, sale) => sum + sale.tax, 0));
    const cost = roundMoney(sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.costPrice * item.quantity, 0),
      0
    ));
    const grossProfit = roundMoney(revenue - cost);
    return res.status(200).json({
      success: true,
      data: { revenue, taxCollected, cost, grossProfit, profitMargin: revenue ? roundMoney((grossProfit / revenue) * 100) : 0 },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPurchaseReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Purchase.aggregate([
      { $match: { status: 'received', ...dateFilter(req, 'purchaseDate') } },
      { $group: { _id: '$supplier', amount: { $sum: '$total' }, purchaseCount: { $sum: 1 } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierDoc' } },
      { $unwind: '$supplierDoc' },
      { $project: { _id: 0, supplier: '$supplierDoc.name', amount: { $round: ['$amount', 2] }, purchaseCount: 1 } },
      { $sort: { amount: -1 } },
    ]);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getInventoryReport = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const variants = await ProductVariant.find();
    const data = {
      stockQuantity: variants.reduce((sum, item) => sum + item.quantity, 0),
      stockCostValue: roundMoney(variants.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)),
      retailValue: roundMoney(variants.reduce((sum, item) => sum + item.quantity * item.salePrice, 0)),
      lowStockCount: variants.filter((item) => item.quantity > 0 && item.quantity <= item.lowStockLevel).length,
      outOfStockCount: variants.filter((item) => item.quantity === 0).length,
    };
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getTopProductsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Sale.aggregate([
      { $match: { saleStatus: 'completed', ...dateFilter(req, 'saleDate') } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.subtotal' } } },
      { $project: { _id: 0, product: '$_id', unitsSold: 1, revenue: { $round: ['$revenue', 2] } } },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 20 },
    ]);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
