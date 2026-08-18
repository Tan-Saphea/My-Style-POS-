import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/providers/product_provider.dart';

class FilterBottomSheets {
  FilterBottomSheets._();

  static void showMasterFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _MasterFilterModal(),
    );
  }

  static void showPriceFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _PriceFilterModal(),
    );
  }

  static void showSizesFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _SizesFilterModal(),
    );
  }

  static void showColorFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _ColorFilterModal(),
    );
  }

  static void showBrandsFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _BrandsFilterModal(),
    );
  }

  static void showCategoryFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _CategoryFilterModal(),
    );
  }
}

// ---------------------------------------------------------------------------
// Reusable Bottom Sheet Container Wrapper
// ---------------------------------------------------------------------------
class _BottomSheetShell extends StatelessWidget {
  final String title;
  final Widget child;
  final VoidCallback onClear;
  final VoidCallback onDone;

  const _BottomSheetShell({
    required this.title,
    required this.child,
    required this.onClear,
    required this.onDone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle Bar
          const SizedBox(height: 10),
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.dragHandle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Header Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.surfaceMuted,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.close,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Scrollable Content
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: child,
            ),
          ),

          // Footer Action Buttons
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: const BoxDecoration(
              color: AppColors.background,
              border: Border(top: BorderSide(color: AppColors.borderLight)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onClear,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: AppColors.secondary, width: 1.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      backgroundColor: AppColors.background,
                    ),
                    child: const Text(
                      'Clear all',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onDone,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppColors.secondary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Done',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 1. Master Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _MasterFilterModal extends StatelessWidget {
  const _MasterFilterModal();

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    final priceSummary = productProvider.selectedPriceRanges.isNotEmpty
        ? productProvider.selectedPriceRanges.join(', ')
        : '';
    final sizesSummary = productProvider.selectedSizes.isNotEmpty
        ? productProvider.selectedSizes.join(', ')
        : '';
    final colorSummary = productProvider.selectedColors.isNotEmpty
        ? productProvider.selectedColors.join(', ')
        : '';
    final brandsSummary = productProvider.selectedBrands.isNotEmpty
        ? productProvider.selectedBrands.join(', ')
        : '';

    return _BottomSheetShell(
      title: 'Filter',
      onClear: () {
        productProvider.clearAllFilters();
      },
      onDone: () {
        Navigator.of(context).pop();
      },
      child: Column(
        children: [
          _buildFilterRow(
            title: 'Price',
            value: priceSummary,
            onTap: () {
              Navigator.of(context).pop();
              FilterBottomSheets.showPriceFilter(context);
            },
          ),
          _buildFilterRow(
            title: 'Sizes',
            value: sizesSummary,
            onTap: () {
              Navigator.of(context).pop();
              FilterBottomSheets.showSizesFilter(context);
            },
          ),
          _buildFilterRow(
            title: 'Color',
            value: colorSummary,
            onTap: () {
              Navigator.of(context).pop();
              FilterBottomSheets.showColorFilter(context);
            },
          ),
          _buildFilterRow(
            title: 'Brands',
            value: brandsSummary,
            onTap: () {
              Navigator.of(context).pop();
              FilterBottomSheets.showBrandsFilter(context);
            },
          ),
          _buildFilterRow(
            title: 'Material',
            value: '',
            onTap: () {},
          ),
          _buildFilterRow(
            title: 'Type',
            value: '',
            onTap: () {},
          ),
          _buildFilterRow(
            title: 'Gender',
            value: productProvider.selectedCategory,
            onTap: () {
              Navigator.of(context).pop();
              FilterBottomSheets.showCategoryFilter(context);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFilterRow({
    required String title,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
            if (value.isNotEmpty)
              Flexible(
                child: Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            const SizedBox(width: 8),
            const Icon(
              Icons.chevron_right,
              size: 18,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Price Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _PriceFilterModal extends StatelessWidget {
  const _PriceFilterModal();

  static const List<String> priceTiers = [
    '\$0-\$25',
    '\$25-\$50',
    '\$50-\$100',
    '\$100-\$150',
    '\$150-\$200',
    '\$200-\$250',
    '\$250+',
  ];

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return _BottomSheetShell(
      title: 'Price',
      onClear: () => productProvider.clearFilterSection('price'),
      onDone: () => Navigator.of(context).pop(),
      child: Column(
        children: priceTiers.map((tier) {
          final isSelected = productProvider.selectedPriceRanges.contains(tier);
          return InkWell(
            onTap: () => productProvider.togglePriceRange(tier),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    tier,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  _SquareCheckbox(isChecked: isSelected),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Sizes Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _SizesFilterModal extends StatelessWidget {
  const _SizesFilterModal();

  static const List<String> availableSizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
  ];

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return _BottomSheetShell(
      title: 'Sizes',
      onClear: () => productProvider.clearFilterSection('sizes'),
      onDone: () => Navigator.of(context).pop(),
      child: Column(
        children: availableSizes.map((size) {
          final isSelected = productProvider.selectedSizes.contains(size);
          return InkWell(
            onTap: () => productProvider.toggleSize(size),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    size,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  _SquareCheckbox(isChecked: isSelected),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Color Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _ColorFilterModal extends StatelessWidget {
  const _ColorFilterModal();

  static const List<Map<String, dynamic>> colorsList = [
    {'name': 'Green', 'color': Color(0xFF16A34A)},
    {'name': 'Red', 'color': Color(0xFFDC2626)},
    {'name': 'Blue', 'color': Color(0xFF2563EB)},
    {'name': 'Indigo', 'color': Color(0xFF4F46E5)},
    {'name': 'Orange', 'color': Color(0xFFEA580C)},
    {'name': 'Yellow', 'color': Color(0xFFEAB308)},
    {'name': 'Black', 'color': Color(0xFF09090B)},
    {'name': 'White', 'color': Color(0xFFFFFFFF), 'hasBorder': true},
  ];

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return _BottomSheetShell(
      title: 'Color',
      onClear: () => productProvider.clearFilterSection('color'),
      onDone: () => Navigator.of(context).pop(),
      child: Column(
        children: colorsList.map((item) {
          final name = item['name'] as String;
          final color = item['color'] as Color;
          final hasBorder = item['hasBorder'] == true;
          final isSelected = productProvider.selectedColors.contains(name);

          return InkWell(
            onTap: () => productProvider.toggleColor(name),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: hasBorder ? Border.all(color: AppColors.border) : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  _SquareCheckbox(isChecked: isSelected),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Brands Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _BrandsFilterModal extends StatelessWidget {
  const _BrandsFilterModal();

  static const List<String> brands = [
    'Nike',
    'Adidas',
    'Puma',
    'Supreme',
    'Calvin Klein',
    'Tommy',
    'Gucci',
    'Off-White',
    'MY STYLE',
  ];

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return _BottomSheetShell(
      title: 'Brands',
      onClear: () => productProvider.clearFilterSection('brand'),
      onDone: () => Navigator.of(context).pop(),
      child: Column(
        children: brands.map((brand) {
          final isSelected = productProvider.selectedBrands.contains(brand);
          return InkWell(
            onTap: () => productProvider.toggleBrand(brand),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    brand,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  _SquareCheckbox(isChecked: isSelected),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 6. Category Filter Bottom Sheet
// ---------------------------------------------------------------------------
class _CategoryFilterModal extends StatelessWidget {
  const _CategoryFilterModal();

  static const List<String> categories = [
    'Men',
    'Women',
    'Children',
    'New offers',
    'Popular',
  ];

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return _BottomSheetShell(
      title: 'Category',
      onClear: () => productProvider.setCategory('Men'),
      onDone: () => Navigator.of(context).pop(),
      child: Column(
        children: categories.map((cat) {
          final isSelected = productProvider.selectedCategory.toLowerCase() == cat.toLowerCase();
          return InkWell(
            onTap: () => productProvider.setCategory(cat),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    cat,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  _SquareCheckbox(isChecked: isSelected),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Custom Square Checkbox Widget (Matching the Video's minimalist square checkbox)
// ---------------------------------------------------------------------------
class _SquareCheckbox extends StatelessWidget {
  final bool isChecked;

  const _SquareCheckbox({required this.isChecked});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        color: isChecked ? AppColors.secondary : Colors.transparent,
        borderRadius: BorderRadius.circular(3),
        border: Border.all(
          color: isChecked ? AppColors.secondary : AppColors.secondary,
          width: 1.2,
        ),
      ),
      child: isChecked
          ? const Center(
              child: Icon(
                Icons.check,
                size: 13,
                color: AppColors.textWhite,
              ),
            )
          : null,
    );
  }
}
