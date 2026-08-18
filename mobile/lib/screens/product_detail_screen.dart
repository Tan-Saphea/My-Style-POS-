import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/screens/cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final ProductItem product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late ProductColor _selectedColor;
  late String _selectedSize;
  int _quantity = 1;
  int _selectedImageIndex = 0;
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _selectedColor = widget.product.colors.isNotEmpty
        ? widget.product.colors[0]
        : const ProductColor(id: 'c-default', name: 'Standard', hex: '#09090B', image: '', thumbnails: []);
    _selectedSize = widget.product.sizes.isNotEmpty ? widget.product.sizes[0] : 'M';
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _addToBag(BuildContext context, {bool openCart = false}) {
    final availableStock = widget.product.getStockFor(_selectedSize, _selectedColor.name);
    if (availableStock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.error,
          content: Text('This item variant is currently out of stock.', style: TextStyle(color: Colors.white)),
        ),
      );
      return;
    }

    context.read<CartProvider>().addItem(
      widget.product,
      _selectedColor,
      _selectedSize,
      _quantity,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        content: Text(
          'Added $_quantity x ${widget.product.title} ($_selectedSize) to your Bag',
          style: const TextStyle(color: AppColors.textWhite, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        action: SnackBarAction(
          label: 'VIEW BAG',
          textColor: AppColors.secondaryLight,
          onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CartScreen()));
          },
        ),
      ),
    );

    if (openCart) {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CartScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    // Current active images based on selected color
    final images = _selectedColor.thumbnails.isNotEmpty
        ? _selectedColor.thumbnails
        : (_selectedColor.image.isNotEmpty ? [_selectedColor.image] : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80']);

    final availableStock = widget.product.getStockFor(_selectedSize, _selectedColor.name);
    final isOutOfStock = availableStock <= 0;
    final maxAllowedQty = isOutOfStock ? 1 : availableStock;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.product.brand.toUpperCase(),
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        actions: [
          Consumer<CartProvider>(
            builder: (context, cart, child) => Stack(
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
                      decoration: const BoxDecoration(
                        color: AppColors.secondary,
                        shape: BoxShape.circle,
                      ),
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
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vertical 3:4 Lookbook Image Carousel
            AspectRatio(
              aspectRatio: 0.88,
              child: Stack(
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: images.length,
                    onPageChanged: (idx) => setState(() => _selectedImageIndex = idx),
                    itemBuilder: (context, index) {
                      final rawImg = images[index];
                      if (rawImg.startsWith('data:image') || (rawImg.length > 150 && !rawImg.startsWith('http'))) {
                        try {
                          final clean = rawImg.contains(',') ? rawImg.split(',')[1] : rawImg;
                          final bytes = base64Decode(clean.trim());
                          return Image.memory(bytes, fit: BoxFit.cover, alignment: Alignment.topCenter);
                        } catch (_) {}
                      }
                      if (rawImg.startsWith('http')) {
                        return Image.network(
                          rawImg,
                          fit: BoxFit.cover,
                          alignment: Alignment.topCenter,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: AppColors.cardBg,
                              child: const Center(
                                child: SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textMuted),
                                ),
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: AppColors.cardBg,
                            child: const Center(child: Icon(Icons.checkroom_rounded, size: 40, color: AppColors.textMuted)),
                          ),
                        );
                      }
                      return Container(
                        color: AppColors.cardBg,
                        child: const Center(child: Icon(Icons.checkroom_rounded, size: 40, color: AppColors.textMuted)),
                      );
                    },
                  ),

                  // Carousel Dot Indicators
                  if (images.length > 1)
                    Positioned(
                      bottom: 14,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          images.length,
                          (i) => GestureDetector(
                            onTap: () {
                              setState(() => _selectedImageIndex = i);
                              if (_pageController.hasClients) {
                                _pageController.animateToPage(
                                  i,
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                );
                              }
                            },
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              width: _selectedImageIndex == i ? 18 : 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: _selectedImageIndex == i ? AppColors.secondary : AppColors.border,
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Content Section
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Brand & Category Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          widget.product.category.toUpperCase(),
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textSecondary),
                        ),
                      ),
                      Text(
                        'Rating: ${widget.product.rating.toStringAsFixed(1)} / 5.0 (${widget.product.reviewCount})',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title & Price
                  Text(
                    widget.product.title,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${widget.product.price.toStringAsFixed(2)} USD',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isOutOfStock ? AppColors.errorBg : AppColors.secondaryBg,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isOutOfStock ? AppColors.errorBorder : AppColors.secondaryBorder,
                          ),
                        ),
                        child: Text(
                          isOutOfStock ? 'OUT OF STOCK' : '$availableStock in stock',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: isOutOfStock ? AppColors.error : AppColors.secondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  const Divider(color: AppColors.borderLight),
                  const SizedBox(height: 12),

                  // Color Swatches
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'SELECT COLOR',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary),
                      ),
                      Text(
                        _selectedColor.name.toUpperCase(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: widget.product.colors.map((color) {
                      final isSelected = _selectedColor.id == color.id;
                      final hexColor = _parseHexColor(color.hex);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedColor = color;
                            _selectedImageIndex = 0;
                          });
                          if (_pageController.hasClients) {
                            _pageController.jumpToPage(0);
                          }
                        },
                        child: Container(
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(2.5),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? AppColors.primary : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: hexColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.border, width: 0.8),
                            ),
                            child: isSelected
                                ? Icon(
                                    Icons.check,
                                    size: 14,
                                    color: hexColor.computeLuminance() > 0.5 ? Colors.black : Colors.white,
                                  )
                                : null,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Size Selection
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'SELECT SIZE',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary),
                      ),
                      GestureDetector(
                        onTap: () => _showSizeGuide(context),
                        child: const Text(
                          'Size Guide',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary, decoration: TextDecoration.underline),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: widget.product.sizes.map((size) {
                      final isSelected = _selectedSize == size;
                      final sizeStock = widget.product.getStockFor(size, _selectedColor.name);
                      final isSizeAvailable = sizeStock > 0;

                      return GestureDetector(
                        onTap: isSizeAvailable
                            ? () {
                                setState(() {
                                  _selectedSize = size;
                                });
                              }
                            : null,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary
                                : (isSizeAvailable ? AppColors.surface : AppColors.surfaceMuted),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : (isSizeAvailable ? AppColors.border : AppColors.borderLight),
                            ),
                          ),
                          child: Text(
                            size,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? AppColors.textWhite
                                  : (isSizeAvailable ? AppColors.textPrimary : AppColors.textMuted),
                              decoration: isSizeAvailable ? null : TextDecoration.lineThrough,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Quantity Stepper
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'QUANTITY',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 16),
                              onPressed: isOutOfStock || _quantity <= 1
                                  ? null
                                  : () {
                                      setState(() => _quantity--);
                                    },
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                '$_quantity',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 16),
                              onPressed: isOutOfStock || _quantity >= maxAllowedQty
                                  ? null
                                  : () {
                                      setState(() => _quantity++);
                                    },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description Accordions
                  _buildAccordion(
                    title: 'PRODUCT DETAILS & FABRIC',
                    content: widget.product.description.isNotEmpty
                        ? widget.product.description
                        : 'Designed with premium fabric composition for durable daily comfort and modern tailored aesthetics.',
                  ),
                  _buildAccordion(
                    title: 'SHIPPING & NATIONWIDE DELIVERY',
                    content: 'Express delivery nationwide within Cambodia (1-2 business days). Free delivery on orders exceeding \$150.',
                  ),
                  _buildAccordion(
                    title: 'RETURNS & EXCHANGES',
                    content: 'Hassle-free 30-day returns and size exchanges for unworn items with original tags intact.',
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: const BoxDecoration(
          color: AppColors.background,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: isOutOfStock ? null : () => _addToBag(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'ADD TO BAG',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: isOutOfStock ? null : () => _addToBag(context, openCart: true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: Text(
                    isOutOfStock ? 'SOLD OUT' : 'BUY IT NOW',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.textWhite),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccordion({required String title, required String content}) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        title: Text(
          title,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textPrimary),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              content,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  void _showSizeGuide(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'SIZE GUIDE MEASUREMENTS',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 0.8),
            ),
            const SizedBox(height: 12),
            const Text(
              'Measurements are in inches (Chest x Length):',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            _sizeRow('S (Small)', '36" - 38" chest, 27" length'),
            _sizeRow('M (Medium)', '38" - 40" chest, 28" length'),
            _sizeRow('L (Large)', '40" - 42" chest, 29" length'),
            _sizeRow('XL (Extra Large)', '42" - 44" chest, 30" length'),
            _sizeRow('2XL (Double XL)', '44" - 46" chest, 31" length'),
          ],
        ),
      ),
    );
  }

  Widget _sizeRow(String size, String desc) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(size, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Color _parseHexColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '').trim();
      if (clean.length == 6) {
        return Color(int.parse('0xFF$clean'));
      }
    } catch (_) {}
    return AppColors.textPrimary;
  }
}
