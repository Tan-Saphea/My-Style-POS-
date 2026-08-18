import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/models/order_tracking.dart';
import 'package:mobile/models/store_settings.dart';

class ApiService {
  final http.Client _client = http.Client();

  // Fetch 100% Live Products from Backend MongoDB API
  Future<List<ProductItem>> fetchProducts({String? audience}) async {
    try {
      final queryParam = (audience != null &&
              audience.toLowerCase() != 'products' &&
              audience.toLowerCase() != 'all products' &&
              audience.toLowerCase() != 'all' &&
              audience.toLowerCase() != 'new offers' &&
              audience.toLowerCase() != 'popular' &&
              audience.toLowerCase() != 'trending')
          ? '?audience=${audience.toLowerCase()}'
          : '';

      final uri = Uri.parse('${AppConstants.baseUrl}/products$queryParam');
      final response = await _client.get(uri).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        final rawList = json['data'] as List<dynamic>?;
        if (rawList != null && rawList.isNotEmpty) {
          return rawList.map((item) {
            final rawAudience = (item['audience'] ?? '').toString().toLowerCase();
            final categoryName = (item['category'] is Map ? item['category']['name'] ?? '' : '').toString();
            final productName = (item['name'] ?? '').toString();

            String cat = 'Men';
            if (rawAudience == 'women' || categoryName.toLowerCase().contains('women') || productName.toLowerCase().contains("women's")) {
              cat = 'Women';
            } else if (rawAudience == 'children' ||
                rawAudience == 'kids' ||
                categoryName.toLowerCase().contains('child') ||
                categoryName.toLowerCase().contains('kid') ||
                productName.toLowerCase().contains('kid')) {
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
                } else if (colorImg.isNotEmpty &&
                    (colorsMap[cId]!.image.isEmpty ||
                        (productImages.isNotEmpty && colorsMap[cId]!.image == productImages[0]))) {
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
              title: item['name'] ?? 'Apparel Product',
              subtitle: '${item['brand'] ?? 'MY STYLE'} • ${item['category']?['name'] ?? 'Collection'}',
              price: minPrice,
              rating: 5.0,
              reviewCount: 24,
              category: cat,
              brand: item['brand'] ?? 'MY STYLE',
              description: item['description'] ?? 'Official luxury apparel piece engineered for daily comfort and style.',
              shippingInfo: 'Express delivery nationwide across Cambodia (1-2 business days).',
              details: [
                '100% Certified luxury fabric composition',
                'Tailored modern silhouette fit',
                'Machine wash cold with similar colors',
              ],
              sizes: sizes.isNotEmpty ? sizes.toList() : ['S', 'M', 'L', 'XL'],
              colors: colorsMap.values.isNotEmpty
                  ? colorsMap.values.toList()
                  : [
                      ProductColor(
                        id: 'c-default',
                        name: 'Standard',
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
      // Return empty list on network error / offline
    }

    return [];
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

  // Submit Online Customer Order directly to Backend API
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

  // Track Live Order by Invoice or Phone from Backend API
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

  // Fetch Live Store & System Settings from Backend API
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
      // Fallback
    }
    return StoreSettings.defaultSettings;
  }
}
