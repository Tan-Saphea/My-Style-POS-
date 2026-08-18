import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/widgets/product_card.dart';
import 'package:mobile/widgets/category_chip.dart';
import 'package:mobile/screens/cart_screen.dart';

class CategoryScreen extends StatelessWidget {
  const CategoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final cart = context.watch<CartProvider>();
    final categories = ['Products', 'Men', 'Women', 'Children', 'Brands', 'New Offers'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'CATALOG & COLLECTIONS',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.0),
        ),
        centerTitle: true,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.textPrimary),
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CartScreen())),
              ),
              if (cart.totalCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppColors.secondary, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${cart.totalCount}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textWhite, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category Chips Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: categories.map((cat) {
                final isSelected = productProvider.selectedCategory.toLowerCase() == cat.toLowerCase();
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: CategoryChip(
                    label: cat,
                    isSelected: isSelected,
                    onTap: () => productProvider.setCategory(cat),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),

          // Count text
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'SHOWING ${productProvider.filteredProducts.length} ITEMS',
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: 10),

          // Grid View
          Expanded(
            child: productProvider.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : productProvider.filteredProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.textMuted),
                            const SizedBox(height: 12),
                            Text(
                              'No products found in ${productProvider.selectedCategory}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: productProvider.filteredProducts.length,
                        itemBuilder: (_, index) {
                          final product = productProvider.filteredProducts[index];
                          return ProductCard(
                            product: product,
                            onQuickAdd: () {
                              final defaultColor = product.colors.isNotEmpty
                                  ? product.colors[0]
                                  : const ProductColor(id: 'c-def', name: 'Standard', hex: '#09090B', image: '', thumbnails: []);
                              final defaultSize = product.sizes.isNotEmpty ? product.sizes[0] : 'M';
                              cart.addItem(product, defaultColor, defaultSize, 1);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: AppColors.primary,
                                  duration: const Duration(seconds: 2),
                                  content: Text('Added ${product.title} to your Bag'),
                                ),
                              );
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
