import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { Category } from '../models/Category.model.js';
import { Size } from '../models/Size.model.js';
import { Color } from '../models/Color.model.js';
import { Product } from '../models/Product.model.js';
import { ProductVariant } from '../models/ProductVariant.model.js';
import { Supplier } from '../models/Supplier.model.js';
import { Customer } from '../models/Customer.model.js';
import { Sale } from '../models/Sale.model.js';
import { Payment } from '../models/Payment.model.js';
import { USER_ROLES } from '../constants/index.js';
import { Purchase } from '../models/Purchase.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { InventoryTransaction } from '../models/InventoryTransaction.model.js';
import { SystemSetting } from '../models/SystemSetting.model.js';

// ============================================================
// Seed Database with Initial Production & Demo Data
// ============================================================

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB for database seeding...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB:', env.MONGODB_URI);

    // 1. Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Size.deleteMany({});
    await Color.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Payment.deleteMany({});
    await Purchase.deleteMany({});
    await AuditLog.deleteMany({});
    await InventoryTransaction.deleteMany({});
    await SystemSetting.deleteMany({});

    await SystemSetting.create({
      key: 'store',
      storeName: 'My Style Boutique',
      currency: 'USD',
      taxRate: 10,
      receiptNote: 'Thank you for shopping with My Style Boutique!',
    });

    // 2. Create Users
    console.log('👤 Creating initial user accounts...');
    await User.create({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@mystyle.com',
      password: 'admin123',
      role: USER_ROLES.ADMIN,
      position: 'Store Manager',
      status: 'active',
    });

    const cashierUser = await User.create({
      name: 'Chanthy Cashier',
      username: 'cashier',
      email: 'cashier@mystyle.com',
      password: 'cashier123',
      role: USER_ROLES.CASHIER,
      position: 'Senior Cashier',
      status: 'active',
    });

    await User.create({
      name: 'Standard Staff',
      username: 'user',
      email: 'user@mystyle.com',
      password: 'user123',
      role: USER_ROLES.USER,
      position: 'Sales Assistant',
      status: 'active',
    });

    // 3. Create Categories
    console.log('🏷️ Creating categories...');
    const catShirt = await Category.create({ name: "Shirts & Tops", description: "Men and Women's Shirts" });
    const catJeans = await Category.create({ name: "Jeans & Denim", description: "Pants and Denim Wear" });
    const catOuterwear = await Category.create({ name: "Jackets & Outerwear", description: "Jackets, Coats, Hoodies" });
    await Category.create({ name: "Dresses & Skirts", description: "Women's Dresses" });
    await Category.create({ name: "Accessories", description: "Belts, Hats, Scarves" });

    // 4. Create Sizes
    console.log('📏 Creating sizes...');
    await Size.create({ name: 'XS', sortOrder: 1 });
    await Size.create({ name: 'S', sortOrder: 2 });
    const sizeM = await Size.create({ name: 'M', sortOrder: 3 });
    const sizeL = await Size.create({ name: 'L', sortOrder: 4 });
    await Size.create({ name: 'XL', sortOrder: 5 });
    await Size.create({ name: 'XXL', sortOrder: 6 });

    // 5. Create Colors
    console.log('🎨 Creating colors...');
    const colorBlack = await Color.create({ name: 'Black', hexCode: '#000000' });
    const colorWhite = await Color.create({ name: 'White', hexCode: '#FFFFFF' });
    const colorNavy = await Color.create({ name: 'Navy Blue', hexCode: '#000080' });
    await Color.create({ name: 'Burgundy Red', hexCode: '#800020' });
    await Color.create({ name: 'Beige', hexCode: '#F5F5DC' });

    // 6. Create Suppliers
    console.log('🏭 Creating suppliers...');
    await Supplier.create({
      name: 'Angkor Textile Mills Ltd',
      contactPerson: 'Sophea Chan',
      phone: '+855 12 345 678',
      email: 'sales@angkortextile.com',
      address: 'Phnom Penh SEZ, National Road 4, Phnom Penh',
    });

    await Supplier.create({
      name: 'Phnom Penh Garments Co.',
      contactPerson: 'Vannak Heng',
      phone: '+855 92 888 999',
      email: 'contact@ppgarments.com',
      address: 'Veng Sreng Street, Phnom Penh',
    });

    // 7. Create Customers
    console.log('👥 Creating customers...');
    const customer1 = await Customer.create({
      name: 'Dara Sam',
      gender: 'male',
      phone: '+855 10 111 222',
      email: 'dara.sam@gmail.com',
      address: 'BKK1, Phnom Penh',
      totalOrders: 4,
      totalSpending: 280,
    });

    await Customer.create({
      name: 'Bopha Khem',
      gender: 'female',
      phone: '+855 12 333 444',
      email: 'bopha.khem@gmail.com',
      address: 'Toul Kork, Phnom Penh',
      totalOrders: 2,
      totalSpending: 145,
    });

    // 8. Create Products & Variants
    console.log('👕 Creating products & variants...');

    // Product 1: Classic Silk Shirt
    const prod1 = await Product.create({
      name: 'Classic Silk Shirt',
      brand: 'My Style',
      description: 'Premium lightweight silk shirt suitable for formal and casual occasions.',
      category: catShirt._id,
      audience: 'men',
      images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop'],
      status: 'active',
    });

    await ProductVariant.create([
      { product: prod1._id, size: sizeM._id, color: colorBlack._id, sku: 'MS-SILK-M-BLK', costPrice: 18.0, salePrice: 35.0, quantity: 25, lowStockLevel: 5 },
      { product: prod1._id, size: sizeL._id, color: colorWhite._id, sku: 'MS-SILK-L-WHT', costPrice: 18.0, salePrice: 35.0, quantity: 20, lowStockLevel: 5 },
    ]);

    // Product 2: Slim Fit Denim Jeans
    const prod2 = await Product.create({
      name: 'Slim Fit Denim Jeans',
      brand: 'My Style',
      description: 'Comfortable stretch denim jeans with modern slim fit cut.',
      category: catJeans._id,
      audience: 'men',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop'],
      status: 'active',
    });

    await ProductVariant.create([
      { product: prod2._id, size: sizeM._id, color: colorNavy._id, sku: 'MS-JEAN-32-NVY', costPrice: 22.0, salePrice: 45.0, quantity: 18, lowStockLevel: 4 },
      { product: prod2._id, size: sizeL._id, color: colorBlack._id, sku: 'MS-JEAN-34-BLK', costPrice: 22.0, salePrice: 45.0, quantity: 10, lowStockLevel: 4 },
    ]);

    // Product 3: Vintage Leather Jacket
    const prod3 = await Product.create({
      name: 'Vintage Leather Jacket',
      brand: 'My Style',
      description: 'Authentic handcrafted leather jacket with vintage finish.',
      category: catOuterwear._id,
      audience: 'men',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop'],
      status: 'active',
    });

    const v3 = await ProductVariant.create({
      product: prod3._id,
      size: sizeL._id,
      color: colorBlack._id,
      sku: 'MS-LTHR-L-BLK',
      costPrice: 65.0,
      salePrice: 120.0,
      quantity: 8,
      lowStockLevel: 2,
    });

    // Product 4: Casual Cotton T-Shirt
    const prod4 = await Product.create({
      name: 'Casual Cotton T-Shirt',
      brand: 'My Style',
      description: '100% combed cotton basic t-shirt for daily comfort.',
      category: catShirt._id,
      audience: 'unisex',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop'],
      status: 'active',
    });

    const v4 = await ProductVariant.create({
      product: prod4._id,
      size: sizeM._id,
      color: colorWhite._id,
      sku: 'MS-TSHIRT-M-WHT',
      costPrice: 6.0,
      salePrice: 15.0,
      quantity: 50,
      lowStockLevel: 10,
    });

    // 9. Create Sample Sales & Payments
    console.log('💳 Creating initial sales transactions...');
    const sale1 = await Sale.create({
      customer: customer1._id,
      cashier: cashierUser._id,
      items: [
        {
          variant: v3._id,
          productName: prod3.name,
          sku: v3.sku,
          size: 'L',
          color: 'Black',
          quantity: 1,
          unitPrice: 120.0,
          costPrice: 65.0,
          discount: 0,
          subtotal: 120.0,
        },
        {
          variant: v4._id,
          productName: prod4.name,
          sku: v4.sku,
          size: 'M',
          color: 'White',
          quantity: 2,
          unitPrice: 15.0,
          costPrice: 6.0,
          discount: 0,
          subtotal: 30.0,
        },
      ],
      subtotal: 150.0,
      discount: 10.0,
      tax: 14.0,
      grandTotal: 154.0,
      paymentStatus: 'paid',
      saleStatus: 'completed',
    });

    await Payment.create({
      sale: sale1._id,
      invoiceNumber: sale1.invoiceNumber,
      amount: 154.0,
      method: 'aba_khqr',
      status: 'completed',
      receivedBy: cashierUser._id,
    });

    console.log('✨ Database seeding complete successfully!');
    console.log('----------------------------------------------------');
    console.log('User Credentials for Testing:');
    console.log('1. Admin:   admin   / admin123   (Full Access)');
    console.log('2. Cashier: cashier / cashier123 (POS & Sales)');
    console.log('3. User:    user    / user123    (Standard Access)');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
