import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models/Product.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Category } from '../models/Category.model.js';
import { Size } from '../models/Size.model.js';
import { Color } from '../models/Color.model.js';
import { Sale } from '../models/Sale.model.js';
import { Purchase } from '../models/Purchase.model.js';
import { InventoryTransaction } from '../models/InventoryTransaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, writeAuditLog } from '../utils/domain.js';
import { runInTransaction } from '../config/database.js';

interface VariantPayload {
  _id?: string;
  size: string;
  color: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  lowStockLevel: number;
  image?: string;
}

const productPopulate = [
  { path: 'category', select: 'name description status' },
  {
    path: 'variants',
    populate: [
      { path: 'size', select: 'name description status' },
      { path: 'color', select: 'name hexCode description status' },
    ],
  },
];

const ensureReferences = async (categoryId: string, variants: VariantPayload[]): Promise<void> => {
  const category = await Category.exists({ _id: categoryId, status: 'active' });
  if (!category) throw ApiError.badRequest('Selected category does not exist or is inactive.');

  const sizeIds = [...new Set(variants.map((variant) => variant.size))];
  const colorIds = [...new Set(variants.map((variant) => variant.color))];
  const [sizeCount, colorCount] = await Promise.all([
    Size.countDocuments({ _id: { $in: sizeIds }, status: 'active' }),
    Color.countDocuments({ _id: { $in: colorIds }, status: 'active' }),
  ]);
  if (sizeCount !== sizeIds.length) throw ApiError.badRequest('One or more selected sizes are invalid or inactive.');
  if (colorCount !== colorIds.length) throw ApiError.badRequest('One or more selected colors are invalid or inactive.');

  const combinations = variants.map((variant) => `${variant.size}:${variant.color}`);
  if (new Set(combinations).size !== combinations.length) {
    throw ApiError.badRequest('Each size and color combination may appear only once per product.');
  }
};

const withComputedStock = (product: Record<string, unknown>, includeCost: boolean) => {
  const variants = (product.variants || []) as Array<{ quantity?: number }>;
  return {
    ...product,
    variants: includeCost
      ? variants
      : variants.map((variant) => {
          const { costPrice: _costPrice, ...publicVariant } = variant as { costPrice?: number } & Record<string, unknown>;
          return publicVariant;
        }),
    totalStock: variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0),
  };
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, status, audience } = req.query;
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (audience) filter.audience = audience;

    if (search) {
      const pattern = new RegExp(escapeRegex(String(search)), 'i');
      const productIds = await ProductVariant.distinct('product', {
        $or: [{ sku: pattern }, { barcode: pattern }],
      });
      filter.$or = [{ name: pattern }, { brand: pattern }, { _id: { $in: productIds } }];
    }

    const products = await Product.find(filter).populate(productPopulate).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: products.map((product) => withComputedStock(product.toObject() as unknown as Record<string, unknown>, req.user?.role === 'admin')),
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate(productPopulate);
    if (!product) throw ApiError.notFound('Product not found');
    return res.status(200).json({
      success: true,
      data: withComputedStock(product.toObject() as unknown as Record<string, unknown>, req.user?.role === 'admin'),
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variants, ...productFields } = req.body as { variants: VariantPayload[] } & Record<string, unknown>;
    await ensureReferences(String(productFields.category), variants);

    // Collect all variant images into product images gallery if available
    const variantImages = variants
      .map((v) => v.image)
      .filter((img): img is string => Boolean(img && img.trim().length > 0));
    const initialImages = (productFields.images as string[]) || [];
    productFields.images = Array.from(new Set([...initialImages, ...variantImages]));

    let productId: Types.ObjectId | undefined;
    await runInTransaction(async (session) => {
      const [product] = await Product.create([productFields], { session });
      productId = product._id;
      await ProductVariant.insertMany(
        variants.map((variant) => ({ ...variant, product: product._id })),
        { session }
      );
      await writeAuditLog(req, 'CREATE_PRODUCT', 'Product', product._id.toString(), {
        name: product.name,
        variantCount: variants.length,
      }, session);
    });

    const product = await Product.findById(productId).populate(productPopulate);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product ? withComputedStock(product.toObject() as unknown as Record<string, unknown>, true) : null,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    const { variants, ...productFields } = req.body as { variants?: VariantPayload[] } & Record<string, unknown>;
    const categoryId = String(productFields.category || product.category);
    if (variants) await ensureReferences(categoryId, variants);
    else if (productFields.category && !(await Category.exists({ _id: productFields.category, status: 'active' }))) {
      throw ApiError.badRequest('Selected category does not exist or is inactive.');
    }

    await runInTransaction(async (session) => {
      product.set(productFields);
      await product.save({ session });

      if (variants) {
        for (const variantPayload of variants) {
          const { _id, ...fields } = variantPayload;
          if (_id) {
            const existing = await ProductVariant.findOne({ _id, product: product._id }).session(session);
            if (!existing) throw ApiError.badRequest(`Variant ${_id} does not belong to this product.`);

            const previousStock = existing.quantity;
            existing.set(fields);
            await existing.save({ session });
            if (existing.quantity !== previousStock && req.user?._id) {
              await InventoryTransaction.create([{
                variant: existing._id,
                type: 'ADJUSTMENT',
                previousStock,
                change: existing.quantity - previousStock,
                newStock: existing.quantity,
                reference: `PRODUCT-${product._id}`,
                reason: 'Stock changed while editing product variant',
                user: req.user._id,
              }], { session });
            }
          } else {
            await ProductVariant.create([{ ...fields, product: product._id }], { session });
          }
        }
      }

      await writeAuditLog(req, 'UPDATE_PRODUCT', 'Product', product._id.toString(), {
        fields: Object.keys(req.body),
      }, session);
    });

    const updated = await Product.findById(product._id).populate(productPopulate);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated ? withComputedStock(updated.toObject() as unknown as Record<string, unknown>, true) : null,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    const variantIds = await ProductVariant.find({ product: product._id }).distinct('_id');
    const [hasSales, hasPurchases] = await Promise.all([
      Sale.exists({ 'items.variant': { $in: variantIds } }),
      Purchase.exists({ 'items.variant': { $in: variantIds } }),
    ]);
    if (hasSales || hasPurchases) {
      throw ApiError.conflict('Product has transaction history. Deactivate it instead of deleting it.');
    }

    await runInTransaction(async (session) => {
      await ProductVariant.deleteMany({ product: product._id }).session(session);
      await Product.deleteOne({ _id: product._id }).session(session);
      await writeAuditLog(req, 'DELETE_PRODUCT', 'Product', product._id.toString(), {
        name: product.name,
      }, session);
    });

    return res.status(200).json({ success: true, message: 'Product and variants deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
