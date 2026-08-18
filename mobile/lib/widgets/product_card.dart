import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/wishlist_provider.dart';
import 'package:mobile/screens/product_detail_screen.dart';

class ProductCard extends StatelessWidget {
  final ProductItem product;
  final VoidCallback? onQuickAdd;

  const ProductCard({
    super.key,
    required this.product,
    this.onQuickAdd,
  });

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistProvider>();
    final isFavorite = wishlist.isFavorite(product.id);

    final rawImage = product.colors.isNotEmpty && product.colors[0].image.isNotEmpty
        ? product.colors[0].image
        : _resolveFallback(product.title, product.category);

    final totalStock = product.totalStock;
    final isOutOfStock = totalStock <= 0;

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          ),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 3:4 Vertical Image Container with soft neutral background and top-right wishlist heart
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderLight, width: 0.8),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _buildImageWidget(rawImage, product.title, product.category),

                  // Stock Tag if low or out of stock
                  if (isOutOfStock)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'SOLD OUT',
                          style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.textWhite),
                        ),
                      ),
                    )
                  else if (totalStock <= 5)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'ONLY $totalStock LEFT',
                          style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.textWhite),
                        ),
                      ),
                    ),

                  // Top-Right Wishlist Heart Button
                  Positioned(
                    top: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () => wishlist.toggleFavorite(product.id),
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.background.withValues(alpha: 0.85),
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border_rounded,
                          size: 16,
                          color: isFavorite ? AppColors.secondary : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Brand Label
          Text(
            product.brand.toUpperCase(),
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 2),

          // Product Title
          Text(
            product.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 3),

          // Product Price & Color Count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '\$${product.price.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              if (product.colors.length > 1)
                Text(
                  '${product.colors.length} colors',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildImageWidget(String rawImage, String title, String category) {
    // 1. Base64 string handling
    if (rawImage.startsWith('data:image') || (rawImage.length > 150 && !rawImage.startsWith('http'))) {
      try {
        final cleanBase64 = rawImage.contains(',') ? rawImage.split(',')[1] : rawImage;
        final bytes = base64Decode(cleanBase64.trim());
        return Image.memory(
          bytes,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, _, _) => _buildFallbackWidget(title, category),
        );
      } catch (_) {
        return _buildFallbackWidget(title, category);
      }
    }

    // 2. HTTP/HTTPS Network URL with loading placeholder
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return Image.network(
        rawImage,
        fit: BoxFit.cover,
        alignment: Alignment.topCenter,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: AppColors.cardBg,
            child: const Center(
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.textMuted),
              ),
            ),
          );
        },
        errorBuilder: (_, _, _) => _buildFallbackWidget(title, category),
      );
    }

    // 3. Fallback
    return _buildFallbackWidget(title, category);
  }

  Widget _buildFallbackWidget(String title, String category) {
    final url = _resolveFallback(title, category);
    return Image.network(
      url,
      fit: BoxFit.cover,
      alignment: Alignment.topCenter,
      errorBuilder: (_, _, _) => Container(
        color: AppColors.cardBg,
        child: const Center(
          child: Icon(Icons.checkroom_rounded, size: 28, color: AppColors.textMuted),
        ),
      ),
    );
  }

  String _resolveFallback(String title, String category) {
    final t = title.toLowerCase();
    final c = category.toLowerCase();

    if (t.contains('pant') || t.contains('trouser') || t.contains('chino') || c.contains('pant')) {
      return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('shirt') || t.contains('oxford') || t.contains('polo') || c.contains('shirt')) {
      return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('jacket') || t.contains('coat') || t.contains('outerwear') || c.contains('jacket')) {
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('dress') || t.contains('silk') || c.contains('women')) {
      return 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('shoe') || t.contains('sneaker') || t.contains('boot')) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  }
}
