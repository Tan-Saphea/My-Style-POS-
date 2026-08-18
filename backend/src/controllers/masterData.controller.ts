import { Request, Response, NextFunction } from 'express';
import { Size } from '../models/Size.model.js';
import { Color } from '../models/Color.model.js';
import { Customer } from '../models/Customer.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Sale } from '../models/Sale.model.js';
import { Purchase } from '../models/Purchase.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, writeAuditLog } from '../utils/domain.js';

const textFilter = (req: Request, fields: string[]): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
    filter.$or = fields.map((field) => ({ [field]: pattern }));
  }
  return filter;
};

export const getSizes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Size.find(textFilter(req, ['name', 'description'])).sort({ sortOrder: 1, name: 1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Size.create(req.body);
    await writeAuditLog(req, 'CREATE_SIZE', 'Size', item._id.toString(), { name: item.name });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Size not found');
    await writeAuditLog(req, 'UPDATE_SIZE', 'Size', item._id.toString(), { fields: Object.keys(req.body) });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const deleteSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (await ProductVariant.exists({ size: req.params.id })) {
      throw ApiError.conflict('Size is used by product variants. Deactivate it instead.');
    }
    const item = await Size.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Size not found');
    await writeAuditLog(req, 'DELETE_SIZE', 'Size', item._id.toString(), { name: item.name });
    return res.status(200).json({ success: true, message: 'Size deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getColors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Color.find(textFilter(req, ['name', 'description'])).sort({ name: 1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Color.create(req.body);
    await writeAuditLog(req, 'CREATE_COLOR', 'Color', item._id.toString(), { name: item.name });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Color not found');
    await writeAuditLog(req, 'UPDATE_COLOR', 'Color', item._id.toString(), { fields: Object.keys(req.body) });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const deleteColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (await ProductVariant.exists({ color: req.params.id })) {
      throw ApiError.conflict('Color is used by product variants. Deactivate it instead.');
    }
    const item = await Color.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Color not found');
    await writeAuditLog(req, 'DELETE_COLOR', 'Color', item._id.toString(), { name: item.name });
    return res.status(200).json({ success: true, message: 'Color deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Customer.find(textFilter(req, ['name', 'phone', 'email'])).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Customer.create(req.body);
    await writeAuditLog(req, 'CREATE_CUSTOMER', 'Customer', item._id.toString(), { name: item.name });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Customer not found');
    await writeAuditLog(req, 'UPDATE_CUSTOMER', 'Customer', item._id.toString(), { fields: Object.keys(req.body) });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (await Sale.exists({ customer: req.params.id })) {
      throw ApiError.conflict('Customer has sales history. Deactivate the customer instead.');
    }
    const item = await Customer.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Customer not found');
    await writeAuditLog(req, 'DELETE_CUSTOMER', 'Customer', item._id.toString(), { name: item.name });
    return res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Supplier.find(textFilter(req, ['name', 'contactPerson', 'phone', 'email'])).sort({ name: 1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Supplier.create(req.body);
    await writeAuditLog(req, 'CREATE_SUPPLIER', 'Supplier', item._id.toString(), { name: item.name });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Supplier not found');
    await writeAuditLog(req, 'UPDATE_SUPPLIER', 'Supplier', item._id.toString(), { fields: Object.keys(req.body) });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (await Purchase.exists({ supplier: req.params.id })) {
      throw ApiError.conflict('Supplier has purchase history. Deactivate the supplier instead.');
    }
    const item = await Supplier.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Supplier not found');
    await writeAuditLog(req, 'DELETE_SUPPLIER', 'Supplier', item._id.toString(), { name: item.name });
    return res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
