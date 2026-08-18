import { Request, Response, NextFunction } from 'express';
import { Sale } from '../models/Sale.model.js';
import { Product } from '../models/Product.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Customer } from '../models/Customer.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { Purchase } from '../models/Purchase.model.js';
import { Payment } from '../models/Payment.model.js';
import { roundMoney } from '../utils/domain.js';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [todaySales, totalProducts, variants, totalCustomers, totalSuppliers, totalPurchases, recentSales] =
      await Promise.all([
        Sale.find({ saleDate: { $gte: today }, saleStatus: 'completed' }),
        Product.countDocuments({ status: 'active' }),
        ProductVariant.find().select('quantity lowStockLevel'),
        Customer.countDocuments({ status: 'active' }),
        Supplier.countDocuments({ status: 'active' }),
        Purchase.countDocuments(),
        Sale.find().populate('customer', 'name').sort({ saleDate: -1 }).limit(5).lean(),
      ]);

    const todayRevenue = roundMoney(todaySales.reduce((sum, sale) => sum + sale.grandTotal, 0));
    const todayCost = roundMoney(todaySales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.costPrice * item.quantity, 0),
      0
    ));
    const todayNetSales = roundMoney(todaySales.reduce((sum, sale) => sum + sale.subtotal - sale.discount, 0));

    const recentPayments = await Payment.find({ sale: { $in: recentSales.map((sale) => sale._id) } })
      .select('sale method')
      .lean();
    const paymentMap = new Map(recentPayments.map((payment) => [String(payment.sale), payment.method]));

    // Use local timezone offset for consistent date grouping
    const tzOffsetMinutes = today.getTimezoneOffset();
    const tzSign = tzOffsetMinutes <= 0 ? '+' : '-';
    const tzHours = String(Math.floor(Math.abs(tzOffsetMinutes) / 60)).padStart(2, '0');
    const tzMins = String(Math.abs(tzOffsetMinutes) % 60).padStart(2, '0');
    const timezone = `${tzSign}${tzHours}:${tzMins}`;

    const trend = await Sale.aggregate<{ _id: string; revenue: number; orders: number; profit: number }>([
      { $match: { saleDate: { $gte: sevenDaysAgo }, saleStatus: 'completed' } },
      {
        $project: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate', timezone } },
          grandTotal: 1,
          netSales: { $subtract: ['$subtotal', '$discount'] },
          cost: {
            $sum: {
              $map: {
                input: '$items',
                as: 'item',
                in: { $multiply: ['$$item.costPrice', '$$item.quantity'] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$day',
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
          profit: { $sum: { $subtract: ['$netSales', '$cost'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendMap = new Map(trend.map((item) => [item._id, item]));
    const salesTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + index);
      // Format as local YYYY-MM-DD to match aggregation timezone grouping
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const item = trendMap.get(key);
      return {
        date: key,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: roundMoney(item?.revenue || 0),
        orders: item?.orders || 0,
        profit: roundMoney(item?.profit || 0),
      };
    });

    const categoryDistribution = await Sale.aggregate<{ category: string; sales: number }>([
      { $match: { saleStatus: 'completed' } },
      { $unwind: '$items' },
      { $lookup: { from: 'productvariants', localField: 'items.variant', foreignField: '_id', as: 'variant' } },
      { $unwind: '$variant' },
      { $lookup: { from: 'products', localField: 'variant.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: '$categoryDoc' },
      { $group: { _id: '$categoryDoc.name', sales: { $sum: '$items.quantity' } } },
      { $sort: { sales: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, category: '$_id', sales: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        todaySalesCount: todaySales.length,
        ...(req.user?.role === 'admin' ? { todayProfit: roundMoney(todayNetSales - todayCost) } : {}),
        totalProducts,
        totalStock: variants.reduce((sum, variant) => sum + variant.quantity, 0),
        lowStockCount: variants.filter((variant) => variant.quantity <= variant.lowStockLevel).length,
        totalCustomers,
        totalSuppliers,
        totalPurchases,
        recentSales: recentSales.map((sale) => ({
          _id: sale._id,
          invoiceNumber: sale.invoiceNumber,
          customer: (sale.customer as unknown as { name?: string } | undefined)?.name || 'Walk-in Customer',
          grandTotal: sale.grandTotal,
          paymentMethod: paymentMap.get(String(sale._id)) || 'unknown',
          saleStatus: sale.saleStatus,
          saleDate: sale.saleDate,
        })),
        salesTrend,
        categoryDistribution,
      },
    });
  } catch (error) {
    return next(error);
  }
};
