class ProductColor {
  final String id;
  final String name;
  final String hex;
  final String image;
  final List<String> thumbnails;

  const ProductColor({
    required this.id,
    required this.name,
    required this.hex,
    required this.image,
    required this.thumbnails,
  });

  factory ProductColor.fromJson(Map<String, dynamic> json) {
    final img = json['image'] ?? '';
    final rawThumbs = (json['thumbnails'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    return ProductColor(
      id: json['id'] ?? json['_id'] ?? 'default-color',
      name: json['name'] ?? 'Standard',
      hex: json['hex'] ?? json['hexCode'] ?? '#09090B',
      image: img,
      thumbnails: rawThumbs.isNotEmpty ? rawThumbs : (img.isNotEmpty ? [img] : []),
    );
  }
}

class VariantModel {
  final String id;
  final String sku;
  final String size;
  final String color;
  final double salePrice;
  final int quantity;
  final String? image;

  const VariantModel({
    required this.id,
    required this.sku,
    required this.size,
    required this.color,
    required this.salePrice,
    required this.quantity,
    this.image,
  });

  factory VariantModel.fromJson(Map<String, dynamic> json) {
    return VariantModel(
      id: json['_id'] ?? json['id'] ?? '',
      sku: json['sku'] ?? '',
      size: json['size'] is Map ? json['size']['name'] : (json['size'] ?? 'M'),
      color: json['color'] is Map ? json['color']['name'] : (json['color'] ?? 'Standard'),
      salePrice: (json['salePrice'] as num?)?.toDouble() ?? 99.0,
      quantity: json['quantity'] ?? 10,
      image: json['image']?.toString(),
    );
  }
}

class ProductItem {
  final String id;
  final String title;
  final String subtitle;
  final double price;
  final double rating;
  final int reviewCount;
  final String category;
  final String brand;
  final String description;
  final String shippingInfo;
  final List<String> details;
  final List<String> sizes;
  final List<ProductColor> colors;
  final List<VariantModel> variants;

  const ProductItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.price,
    required this.rating,
    required this.reviewCount,
    required this.category,
    required this.brand,
    required this.description,
    required this.shippingInfo,
    required this.details,
    required this.sizes,
    required this.colors,
    this.variants = const [],
  });

  String? getVariantIdFor(String size, String colorName) {
    if (variants.isEmpty) return null;
    final match = variants.firstWhere(
      (v) => v.size.toLowerCase() == size.toLowerCase() && v.color.toLowerCase() == colorName.toLowerCase(),
      orElse: () => variants.firstWhere(
        (v) => v.size.toLowerCase() == size.toLowerCase(),
        orElse: () => variants.first,
      ),
    );
    return match.id.isNotEmpty ? match.id : null;
  }

  int getStockFor(String size, String colorName) {
    if (variants.isEmpty) return 99;
    final match = variants.firstWhere(
      (v) => v.size.toLowerCase() == size.toLowerCase() && v.color.toLowerCase() == colorName.toLowerCase(),
      orElse: () => variants.firstWhere(
        (v) => v.size.toLowerCase() == size.toLowerCase(),
        orElse: () => variants.first,
      ),
    );
    return match.quantity;
  }

  int get totalStock => variants.fold(0, (sum, v) => sum + v.quantity);

  factory ProductItem.fromJson(Map<String, dynamic> json) {
    final rawImages = (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];

    final rawVariants = json['variants'] as List<dynamic>?;
    final parsedVariants = rawVariants != null
        ? rawVariants.map((v) => VariantModel.fromJson(v as Map<String, dynamic>)).toList()
        : <VariantModel>[];

    final rawColors = json['colors'] as List<dynamic>?;
    List<ProductColor> parsedColors = [];

    if (rawColors != null && rawColors.isNotEmpty) {
      parsedColors = rawColors.asMap().entries.map((entry) {
        final idx = entry.key;
        final c = entry.value as Map<String, dynamic>;
        String colImg = c['image']?.toString() ?? '';
        if (colImg.isEmpty) {
          if (idx < rawImages.length) {
            colImg = rawImages[idx];
          } else if (rawImages.isNotEmpty) {
            colImg = rawImages[0];
          }
        }
        final otherImgs = rawImages.where((img) => img != colImg).toList();
        return ProductColor(
          id: c['id'] ?? c['_id'] ?? 'col-$idx',
          name: c['name'] ?? 'Standard',
          hex: c['hex'] ?? c['hexCode'] ?? '#09090B',
          image: colImg,
          thumbnails: [colImg, ...otherImgs],
        );
      }).toList();
    }

    final rawSizes = json['sizes'] as List<dynamic>?;
    final parsedSizes = rawSizes != null ? rawSizes.map((s) => s.toString()).toList() : ['S', 'M', 'L', 'XL'];

    return ProductItem(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? json['name'] ?? 'Product Title',
      subtitle: json['subtitle'] ?? '${json['brand'] ?? 'MY STYLE'} • Apparel',
      price: (json['price'] as num?)?.toDouble() ?? 99.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['reviewCount'] ?? 18,
      category: json['category'] is Map ? json['category']['name'] : (json['category'] ?? 'Products'),
      brand: json['brand'] ?? 'MY STYLE',
      description: json['description'] ?? 'Luxury tailored clothing piece engineered for style and comfort.',
      shippingInfo: json['shippingInfo'] ?? 'Express nationwide delivery within 1-2 business days.',
      details: (json['details'] as List<dynamic>?)?.map((d) => d.toString()).toList() ?? [
        '100% Premium certified fabric',
        'Tailored modern silhouette fit',
        'Machine wash cold with similar colors'
      ],
      sizes: parsedSizes.isNotEmpty ? parsedSizes : ['S', 'M', 'L', 'XL'],
      colors: parsedColors.isNotEmpty
          ? parsedColors
          : [
              ProductColor(
                id: 'c-default',
                name: 'Onyx Black',
                hex: '#09090B',
                image: rawImages.isNotEmpty
                    ? rawImages[0]
                    : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                thumbnails: rawImages.isNotEmpty ? rawImages : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'],
              )
            ],
      variants: parsedVariants,
    );
  }
}
