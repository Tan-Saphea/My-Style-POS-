import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, writeAuditLog } from '../utils/domain.js';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();
    const counts = await Product.aggregate<{ _id: unknown; count: number }>([
      { $match: { category: { $in: categories.map((category) => category._id) } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    return res.status(200).json({
      success: true,
      data: categories.map((category) => ({
        ...category,
        productCount: countMap.get(String(category._id)) || 0,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.create(req.body);
    await writeAuditLog(req, 'CREATE_CATEGORY', 'Category', category._id.toString(), {
      name: category.name,
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw ApiError.notFound('Category not found');

    await writeAuditLog(req, 'UPDATE_CATEGORY', 'Category', category._id.toString(), {
      fields: Object.keys(req.body),
    });
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productExists = await Product.exists({ category: req.params.id });
    if (productExists) {
      throw ApiError.conflict('Category is used by products. Move or delete those products first.');
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw ApiError.notFound('Category not found');

    await writeAuditLog(req, 'DELETE_CATEGORY', 'Category', category._id.toString(), {
      name: category.name,
    });
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
