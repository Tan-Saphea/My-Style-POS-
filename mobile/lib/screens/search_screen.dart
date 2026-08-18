import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/widgets/filter_bottom_sheets.dart';
import 'package:mobile/widgets/product_card.dart';

class SearchScreen extends StatefulWidget {
  final VoidCallback? onCancel;

  const SearchScreen({super.key, this.onCancel});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final productProvider = context.read<ProductProvider>();
    _searchController.text = productProvider.searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final filteredList = productProvider.filteredProducts;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Search Bar Row
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  // Search Input Container
                  Expanded(
                    child: Container(
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.search,
                            size: 18,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _searchController,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w500,
                              ),
                              decoration: const InputDecoration(
                                hintText: 'Search for anything',
                                hintStyle: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textMuted,
                                  fontWeight: FontWeight.w400,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                              onChanged: (val) => productProvider.setSearchQuery(val),
                            ),
                          ),
                          if (_searchController.text.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _searchController.clear();
                                productProvider.setSearchQuery('');
                              },
                              child: const Padding(
                                padding: EdgeInsets.all(4.0),
                                child: Icon(
                                  Icons.close,
                                  size: 16,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  // Cancel Button
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      productProvider.clearAllFilters();
                      if (widget.onCancel != null) {
                        widget.onCancel!();
                      } else if (Navigator.of(context).canPop()) {
                        Navigator.of(context).pop();
                      }
                    },
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Horizontal Filter Chips Row
            Container(
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.borderLight)),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    // Master Filter Icon Button
                    _FilterIconButton(
                      activeCount: productProvider.activeFilterCount,
                      onTap: () => FilterBottomSheets.showMasterFilter(context),
                    ),
                    const SizedBox(width: 8),

                    // Sizes Chip
                    _FilterDropdownChip(
                      label: productProvider.selectedSizes.isNotEmpty
                          ? 'Sizes (${productProvider.selectedSizes.length})'
                          : 'Sizes',
                      isActive: productProvider.selectedSizes.isNotEmpty,
                      onTap: () => FilterBottomSheets.showSizesFilter(context),
                    ),
                    const SizedBox(width: 8),

                    // Color Chip
                    _FilterDropdownChip(
                      label: productProvider.selectedColors.isNotEmpty
                          ? 'Color (${productProvider.selectedColors.length})'
                          : 'Color',
                      isActive: productProvider.selectedColors.isNotEmpty,
                      onTap: () => FilterBottomSheets.showColorFilter(context),
                    ),
                    const SizedBox(width: 8),

                    // Price Chip
                    _FilterDropdownChip(
                      label: productProvider.selectedPriceRanges.isNotEmpty
                          ? 'Price (${productProvider.selectedPriceRanges.length})'
                          : 'Price',
                      isActive: productProvider.selectedPriceRanges.isNotEmpty,
                      onTap: () => FilterBottomSheets.showPriceFilter(context),
                    ),
                    const SizedBox(width: 8),

                    // Category Chip
                    _FilterDropdownChip(
                      label: 'Category',
                      isActive: productProvider.selectedCategory != 'All' &&
                          productProvider.selectedCategory != 'Products',
                      onTap: () => FilterBottomSheets.showCategoryFilter(context),
                    ),
                    const SizedBox(width: 8),

                    // Brands Chip
                    _FilterDropdownChip(
                      label: productProvider.selectedBrands.isNotEmpty
                          ? 'Brands (${productProvider.selectedBrands.length})'
                          : 'Brands',
                      isActive: productProvider.selectedBrands.isNotEmpty,
                      onTap: () => FilterBottomSheets.showBrandsFilter(context),
                    ),
                  ],
                ),
              ),
            ),

            // Product Grid or Empty State
            Expanded(
              child: productProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.secondary),
                    )
                  : filteredList.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.search_off_rounded,
                                  size: 44,
                                  color: AppColors.textMuted,
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'No items found matching your filters',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                OutlinedButton(
                                  onPressed: () {
                                    _searchController.clear();
                                    productProvider.clearAllFilters();
                                  },
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: AppColors.secondary),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: const Text(
                                    'Clear all filters',
                                    style: TextStyle(
                                      color: AppColors.secondary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.68,
                            crossAxisSpacing: 14,
                            mainAxisSpacing: 20,
                          ),
                          itemCount: filteredList.length,
                          itemBuilder: (context, index) {
                            final product = filteredList[index];
                            return ProductCard(product: product);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Master Filter Icon Button
// ---------------------------------------------------------------------------
class _FilterIconButton extends StatelessWidget {
  final int activeCount;
  final VoidCallback onTap;

  const _FilterIconButton({
    required this.activeCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 32,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: activeCount > 0 ? AppColors.secondaryBg : AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: activeCount > 0 ? AppColors.secondary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.tune,
              size: 15,
              color: AppColors.textPrimary,
            ),
            if (activeCount > 0) ...[
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.secondary,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$activeCount',
                  style: const TextStyle(
                    color: AppColors.textWhite,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Filter Dropdown Chip (Sizes ⌄, Color ⌄, Price ⌄, etc.)
// ---------------------------------------------------------------------------
class _FilterDropdownChip extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _FilterDropdownChip({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 32,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.secondaryBg : AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? AppColors.secondary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? AppColors.secondaryDark : AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.keyboard_arrow_down,
              size: 15,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
