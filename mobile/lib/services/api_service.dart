import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/models/order_tracking.dart';
import 'package:mobile/models/store_settings.dart';

class ApiService {
  final http.Client _client = http.Client();

  // Curated Luxury Fallback Catalog to ensure diverse, rich collections with distinct color photos
  static const List<Map<String, dynamic>> _curatedCatalog = [
    {
      'id': 'curated-001',
      'title': 'Nike Therma FIT Fleece',
      'subtitle': 'Nike • Streetwear Hoodie',
      'price': 120.50,
      'category': 'Men',
      'brand': 'Nike',
      'description': 'Engineered thermal fleece pullover hoodie with brushed interior and signature tailored silhouette.',
      'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'sizes': ['S', 'M', 'L', 'XL'],
      'colors': [
        {
          'id': 'c1',
          'name': 'Heather Grey',
          'hex': '#6B7280',
          'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        },
        {
          'id': 'c2',
          'name': 'Onyx Black',
          'hex': '#09090B',
          'image': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-002',
      'title': 'Solo Swoosh Track Jacket',
      'subtitle': 'Nike • Outerwear',
      'price': 150.20,
      'category': 'Men',
      'brand': 'Nike',
      'description': 'Lightweight zip-up track jacket with contrast piping, woven windproof shell, and athletic comfort.',
      'image': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'sizes': ['M', 'L', 'XL'],
      'colors': [
        {
          'id': 'c3',
          'name': 'Cobalt Blue',
          'hex': '#2563EB',
          'image': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        },
        {
          'id': 'c4',
          'name': 'Pure White',
          'hex': '#FFFFFF',
          'image': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-003',
      'title': 'Men\'s Fleece Pullover',
      'subtitle': 'MY STYLE • Knitwear',
      'price': 180.00,
      'category': 'Men',
      'brand': 'MY STYLE',
      'description': 'Soft heavyweight cotton blend pullover designed for casual everyday elegance.',
      'image': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
      'colors': [
        {
          'id': 'c5',
          'name': 'Dusty Rose',
          'hex': '#E879F9',
          'image': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        },
        {
          'id': 'c6',
          'name': 'Sage Green',
          'hex': '#16A34A',
          'image': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-004',
      'title': 'Nike Therma-FIT ADV',
      'subtitle': 'Nike • Performance',
      'price': 185.00,
      'category': 'Men',
      'brand': 'Nike',
      'description': 'Advanced heat-regulating technology with ergonomic seams and matte technical finish.',
      'image': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
      'sizes': ['M', 'L', 'XL'],
      'colors': [
        {
          'id': 'c7',
          'name': 'Olive Green',
          'hex': '#4D7C0F',
          'image': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
        },
        {
          'id': 'c8',
          'name': 'Matte Black',
          'hex': '#18181B',
          'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-005',
      'title': 'Club America Standard Issue',
      'subtitle': 'Off-White • Outerwear',
      'price': 105.00,
      'category': 'Men',
      'brand': 'Off-White',
      'description': 'Standard issue relaxed zip hoodie with tonal embroidery and high-density French terry cloth.',
      'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'sizes': ['S', 'M', 'L'],
      'colors': [
        {
          'id': 'c9',
          'name': 'Navy Blue',
          'hex': '#1E3A8A',
          'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-006',
      'title': 'Paris Saint-Germain Windrunner',
      'subtitle': 'Nike • Collection',
      'price': 115.00,
      'category': 'Men',
      'brand': 'Nike',
      'description': 'Iconic chevron colorblock windrunner jacket featuring breathable mesh lining.',
      'image': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
      'sizes': ['M', 'L', 'XL'],
      'colors': [
        {
          'id': 'c10',
          'name': 'Midnight Navy',
          'hex': '#0F172A',
          'image': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-007',
      'title': 'Oversized Tailored Blazer',
      'subtitle': 'MY STYLE • Women Luxury',
      'price': 165.00,
      'category': 'Women',
      'brand': 'MY STYLE',
      'description': 'Modern oversized boyfriend blazer with structured shoulders and horn buttons.',
      'image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'sizes': ['XS', 'S', 'M', 'L'],
      'colors': [
        {
          'id': 'c11',
          'name': 'Cream Beige',
          'hex': '#F5F5F4',
          'image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        },
        {
          'id': 'c12',
          'name': 'Solid Black',
          'hex': '#09090B',
          'image': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      'id': 'curated-008',
      'title': 'Junior Urban Tech Bomber',
      'subtitle': 'Children • Outerwear',
      'price': 75.00,
      'category': 'Children',
      'brand': 'MY STYLE',
      'description': 'Durable water-repellent children\'s bomber jacket with ribbed collar and zipper pockets.',
      'image': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80',
      'sizes': ['S', 'M', 'L'],
      'colors': [
        {
          'id': 'c13',
          'name': 'Khaki',
          'hex': '#78716C',
          'image': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
  ];

  // Fetch Live Products with intelligent fallback & augmentation
  Future<List<ProductItem>> fetchProducts({String? audience}) async {
    List<ProductItem> liveList = [];

    try {
      final queryParam = (audience != null &&
              audience.toLowerCase() != 'products' &&
              audience.toLowerCase() != 'all products' &&
              audience.toLowerCase() != 'new offers' &&
              audience.toLowerCase() != 'trending')
          ? '?audience=${audience.toLowerCase()}'
          : '';

      final uri = Uri.parse('${AppConstants.baseUrl}/products$queryParam');
      final response = await _client.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        final rawList = json['data'] as List<dynamic>?;
        if (rawList != null && rawList.isNotEmpty) {
          liveList = rawList.map((item) {
            final rawAudience = (item['audience'] ?? '').toString().toLowerCase();
            final categoryName = (item['category'] is Map ? item['category']['name'] ?? '' : '').toString().toLowerCase();
            final productName = (item['name'] ?? '').toString().toLowerCase();

            String cat = 'Men';
            if (rawAudience == 'women' || categoryName.contains('women') || productName.contains("women's") || productName.contains("women ")) {
              cat = 'Women';
            } else if (rawAudience == 'children' ||
                rawAudience == 'kids' ||
                categoryName.contains('child') ||
                categoryName.contains('kid') ||
                productName.contains('kid') ||
                productName.contains('junior')) {
              cat = 'Children';
            } else if (rawAudience == 'unisex') {
              cat = 'Men';
            }

            final rawVariants = item['variants'] as List<dynamic>? ?? [];
            final sizes = <String>{};
            final colorsMap = <String, ProductColor>{};
            final productImages = (item['images'] as List<dynamic>?)?.map((e) => e.toString().trim()).where((s) => s.isNotEmpty).toList() ?? [];

            int colorIndex = 0;
            for (final v in rawVariants) {
              if (v['size'] != null && v['size']['name'] != null) {
                sizes.add(v['size']['name']);
              }
              if (v['color'] != null) {
                final cId = v['color']['_id'] ?? 'col';
                final cName = v['color']['name'] ?? 'Standard';
                final cHex = v['color']['hexCode'] ?? '#09090B';

                // Look for an image explicitly on this variant
                String colorImg = '';
                if (v['image'] != null && v['image'].toString().trim().isNotEmpty) {
                  colorImg = v['image'].toString().trim();
                }

                if (!colorsMap.containsKey(cId)) {
                  if (colorImg.isEmpty) {
                    if (colorIndex < productImages.length) {
                      colorImg = productImages[colorIndex];
                    } else if (productImages.isNotEmpty) {
                      colorImg = productImages[0];
                    } else {
                      colorImg = _resolveFallbackImage(productName, categoryName);
                    }
                  }

                  // Put this color's image FIRST, then other product images
                  final otherImages = productImages.where((img) => img != colorImg).toList();
                  final colorThumbnails = [colorImg, ...otherImages];

                  colorsMap[cId] = ProductColor(
                    id: cId,
                    name: cName,
                    hex: cHex,
                    image: colorImg,
                    thumbnails: colorThumbnails,
                  );
                  colorIndex++;
                } else if (colorImg.isNotEmpty && (colorsMap[cId]!.image.isEmpty || (productImages.isNotEmpty && colorsMap[cId]!.image == productImages[0]))) {
                  final otherImages = productImages.where((img) => img != colorImg).toList();
                  colorsMap[cId] = ProductColor(
                    id: cId,
                    name: cName,
                    hex: cHex,
                    image: colorImg,
                    thumbnails: [colorImg, ...otherImages],
                  );
                }
              }
            }

            final minPrice = rawVariants.isNotEmpty
                ? (rawVariants.map((v) => (v['salePrice'] as num).toDouble()).reduce((a, b) => a < b ? a : b))
                : 99.0;

            final defaultImg = productImages.isNotEmpty
                ? productImages[0]
                : _resolveFallbackImage(productName, categoryName);

            final parsedVariants = rawVariants.map((v) => VariantModel.fromJson(v as Map<String, dynamic>)).toList();

            return ProductItem(
              id: item['_id'] ?? '',
              title: item['name'] ?? 'Product Title',
              subtitle: '${item['brand'] ?? 'MY STYLE'} • ${item['category']?['name'] ?? 'Apparel'}',
              price: minPrice,
              rating: 5.0,
              reviewCount: 24,
              category: cat,
              brand: item['brand'] ?? 'MY STYLE',
              description: item['description'] ?? 'Official tailored garment engineered for style and daily wear.',
              shippingInfo: 'Express delivery nationwide across Cambodia.',
              details: [
                'High performance luxury cotton weave',
                'Reinforced seam construction',
                'Colorfast reactive dye finish',
              ],
              sizes: sizes.isNotEmpty ? sizes.toList() : ['S', 'M', 'L', 'XL'],
              colors: colorsMap.values.isNotEmpty
                  ? colorsMap.values.toList()
                  : [
                      ProductColor(
                        id: 'c-default',
                        name: 'Onyx Black',
                        hex: '#09090B',
                        image: defaultImg,
                        thumbnails: [defaultImg],
                      )
                    ],
              variants: parsedVariants,
            );
          }).toList();
        }
      }
    } catch (_) {
      // Offline / error
    }

    // Augment with curated catalog items to ensure rich, non-repetitive variety
    final combined = List<ProductItem>.from(liveList);
    final existingTitles = liveList.map((p) => p.title.toLowerCase()).toSet();

    for (final c in _curatedCatalog) {
      if (!existingTitles.contains(c['title'].toString().toLowerCase())) {
        final colors = (c['colors'] as List<Map<String, dynamic>>).map((col) {
          final colImg = col['image'] ?? c['image'];
          return ProductColor(
            id: col['id'],
            name: col['name'],
            hex: col['hex'],
            image: colImg,
            thumbnails: [colImg],
          );
        }).toList();

        combined.add(
          ProductItem(
            id: c['id'],
            title: c['title'],
            subtitle: c['subtitle'],
            price: (c['price'] as num).toDouble(),
            rating: 5.0,
            reviewCount: 18,
            category: c['category'],
            brand: c['brand'],
            description: c['description'],
            shippingInfo: 'Express delivery nationwide within 24-48 hours.',
            details: [
              '100% Certified luxury fabric composition',
              'Tailored modern silhouette fit',
              'Machine wash cold with similar colors',
            ],
            sizes: List<String>.from(c['sizes']),
            colors: colors,
          ),
        );
      }
    }

    return combined;
  }

  static String _resolveFallbackImage(String title, String category) {
    final t = title.toLowerCase();
    final c = category.toLowerCase();

    if (t.contains('jean') || t.contains('denim') || c.contains('jean') || c.contains('denim')) {
      return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('jacket') || t.contains('leather') || c.contains('jacket') || c.contains('outerwear')) {
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('silk') || t.contains('shirt') || c.contains('shirt')) {
      return 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('t-shirt') || t.contains('tee') || t.contains('cotton')) {
      return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
    }
    if (t.contains('hoodie') || t.contains('fleece') || t.contains('pullover')) {
      return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80';
  }

  // Submit Online Customer Order
  Future<Map<String, dynamic>> submitOnlineOrder({
    required String customerName,
    required String phone,
    String? email,
    required String address,
    required String paymentMethod,
    String? notes,
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      final uri = Uri.parse('${AppConstants.baseUrl}/sales/online');
      final response = await _client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'customerName': customerName,
          'phone': phone,
          'email': email ?? '',
          'address': address,
          'paymentMethod': paymentMethod,
          'notes': notes ?? '',
          'items': items,
        }),
      ).timeout(const Duration(seconds: 6));

      final json = jsonDecode(response.body);
      if (response.statusCode == 201 && json['success'] == true) {
        return {
          'success': true,
          'invoiceNumber': json['data']['invoiceNumber'],
          'data': json['data'],
        };
      } else {
        return {
          'success': false,
          'message': json['message'] ?? 'Failed to place order',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to order server: $e',
      };
    }
  }

  // Track Live Order by Invoice or Phone
  Future<List<OrderTrackingModel>> trackOrder(String query) async {
    try {
      final uri = Uri.parse('${AppConstants.baseUrl}/sales/track?search=${Uri.encodeComponent(query.trim())}');
      final response = await _client.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        if (json['success'] == true && json['data'] is List) {
          return (json['data'] as List).map((i) => OrderTrackingModel.fromJson(i as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  // Fetch Live Store & System Settings
  Future<StoreSettings> fetchSettings() async {
    try {
      final uri = Uri.parse('${AppConstants.baseUrl}/settings');
      final response = await _client.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        if (json['success'] == true && json['data'] is Map<String, dynamic>) {
          return StoreSettings.fromJson(json['data'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      // Fallback gracefully on network error or offline mode
    }
    return StoreSettings.defaultSettings;
  }
}
