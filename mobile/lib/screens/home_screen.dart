import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/widgets/product_card.dart';

class HomeScreen extends StatelessWidget {
  final VoidCallback onSearchTap;
  final VoidCallback onNotificationsTap;

  const HomeScreen({
    super.key,
    required this.onSearchTap,
    required this.onNotificationsTap,
  });

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

    final newArrivals = productProvider.newArrivals;
    final popularProducts = productProvider.popularProducts;
    final trendingProducts = productProvider.trendingProducts;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 16,
        title: Image.asset(
          'assets/images/logo.png',
          height: 32,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) => const Text(
            'MY STYLE',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.2,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.search,
              size: 22,
              color: AppColors.textPrimary,
            ),
            onPressed: onSearchTap,
          ),
          IconButton(
            icon: const Icon(
              Icons.notifications_none_rounded,
              size: 22,
              color: AppColors.textPrimary,
            ),
            onPressed: onNotificationsTap,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.secondary,
        onRefresh: () => productProvider.loadProducts(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category Tab Bar with Solid Underline Indicator
              _CategoryTabBar(
                categories: categories,
                selectedCategory: productProvider.selectedCategory,
                onCategorySelected: (cat) => productProvider.setCategory(cat),
              ),
              const SizedBox(height: 16),

              // Loading State
              if (productProvider.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 60),
                  child: Center(
                    child: CircularProgressIndicator(color: AppColors.secondary),
                  ),
                )
              else ...[
                // 5-Slide Luxury Image Carousel Slider (Placed Above New Arrival)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _HomeCarouselSlider(onExploreTap: onSearchTap),
                ),
                const SizedBox(height: 20),

                // Section 1: New Arrival (Distinct Items)
                if (newArrivals.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _SectionHeader(
                      title: 'New arrival',
                      onViewAll: onSearchTap,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _ProductTwoColumnGrid(products: newArrivals),
                  ),
                  const SizedBox(height: 24),
                ],

                // Section 2: Popular (Guaranteed Distinct from New Arrival)
                if (popularProducts.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _SectionHeader(
                      title: 'Popular',
                      onViewAll: onSearchTap,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _ProductTwoColumnGrid(products: popularProducts),
                  ),
                  const SizedBox(height: 24),
                ],

                // Section 3: You May Also Like (Guaranteed Distinct)
                if (trendingProducts.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _SectionHeader(
                      title: 'You may also like',
                      onViewAll: onSearchTap,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _ProductTwoColumnGrid(products: trendingProducts),
                  ),
                  const SizedBox(height: 24),
                ],
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 5-Slide Luxury Carousel Slider
// ---------------------------------------------------------------------------
class _HomeCarouselSlider extends StatefulWidget {
  final VoidCallback onExploreTap;

  const _HomeCarouselSlider({required this.onExploreTap});

  @override
  State<_HomeCarouselSlider> createState() => _HomeCarouselSliderState();
}

class _HomeCarouselSliderState extends State<_HomeCarouselSlider> {
  late final PageController _pageController;
  Timer? _timer;
  int _currentPage = 0;

  static const List<Map<String, String>> _slides = [
    {
      'image': 'assets/images/banner_1.jpg',
      'tag': 'LIMITED EDITION',
      'title': 'NEW AUTUMN / WINTER\nTAILORED COLLECTION',
      'subtitle': 'Crafted with precision luxury streetwear textiles',
    },
    {
      'image': 'assets/images/banner_2.jpg',
      'tag': 'PREMIUM DENIM',
      'title': 'THE JAPANESE SELVEDGE\nDENIM JACKETS & JEANS',
      'subtitle': 'Handcrafted vintage washes & raw indigo denim',
    },
    {
      'image': 'assets/images/banner_3.jpg',
      'tag': 'SILK & ELEGANCE',
      'title': 'AURELIA LUXURY SILK\nTAILORED SHIRTS',
      'subtitle': 'Fluid drape, minimalist luster & evening elegance',
    },
    {
      'image': 'assets/images/banner_4.jpg',
      'tag': 'HOT DROP',
      'title': 'COTTON DRAWSTRING\nCASUAL SWEAT SHORTS',
      'subtitle': 'Heavyweight French terry in 4 classic colorways',
    },
    {
      'image': 'assets/images/banner_5.jpg',
      'tag': 'SEASONAL EDIT',
      'title': 'LUXURY TRENCH COATS\n& LEATHER JACKETS',
      'subtitle': 'Cinematic outerwear designed for effortless confidence',
    },
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoPlay();
  }

  void _startAutoPlay() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_pageController.hasClients) {
        final nextPage = (_currentPage + 1) % _slides.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 180,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              children: [
                PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemCount: _slides.length,
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    return Stack(
                      fit: StackFit.expand,
                      children: [
                        // Background Campaign Photo
                        Image.asset(
                          slide['image']!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: AppColors.primary,
                          ),
                        ),

                        // Dark Contrast Tint Overlay
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.35),
                                Colors.black.withValues(alpha: 0.75),
                              ],
                            ),
                          ),
                        ),

                        // Text & Action Content
                        Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  slide['tag']!,
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textWhite,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                slide['title']!,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textWhite,
                                  height: 1.15,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              GestureDetector(
                                onTap: widget.onExploreTap,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'EXPLORE NOW',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.textPrimary,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),

                // Slide Navigation Arrow/Dots at Bottom Right
                Positioned(
                  bottom: 12,
                  right: 14,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(_slides.length, (index) {
                      final isActive = _currentPage == index;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 2.5),
                        width: isActive ? 16 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: isActive ? AppColors.secondary : Colors.white.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Category Tab Bar with Solid Underline Indicator
// ---------------------------------------------------------------------------
class _CategoryTabBar extends StatelessWidget {
  final List<String> categories;
  final String selectedCategory;
  final ValueChanged<String> onCategorySelected;

  const _CategoryTabBar({
    required this.categories,
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: categories.map((cat) {
          final isSelected = selectedCategory.toLowerCase() == cat.toLowerCase();

          return GestureDetector(
            onTap: () => onCategorySelected(cat),
            child: Container(
              padding: const EdgeInsets.only(right: 22, top: 4, bottom: 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    cat,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    height: 2,
                    width: isSelected ? 24 : 0,
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.secondary : Colors.transparent,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
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
// Section Header with Title and "View all" Action
// ---------------------------------------------------------------------------
class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback onViewAll;

  const _SectionHeader({
    required this.title,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        GestureDetector(
          onTap: onViewAll,
          child: const Text(
            'View all',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// 2-Column Product Grid
// ---------------------------------------------------------------------------
class _ProductTwoColumnGrid extends StatelessWidget {
  final List<ProductItem> products;

  const _ProductTwoColumnGrid({required this.products});

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return const SizedBox.shrink();
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.68,
        crossAxisSpacing: 14,
        mainAxisSpacing: 18,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        return ProductCard(product: products[index]);
      },
    );
  }
}
