import 'package:flutter/foundation.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/models/cart_item.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/api_service.dart';

class CartProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<CartItem> _items = [];
  String? _appliedCoupon;
  double _discountPercent = 0.0;
  bool _isSubmitting = false;

  List<CartItem> get items => List.unmodifiable(_items);
  String? get appliedCoupon => _appliedCoupon;
  double get discountPercent => _discountPercent;
  bool get isSubmitting => _isSubmitting;

  int get totalCount => _items.fold(0, (sum, it) => sum + it.quantity);

  double get subtotal => _items.fold(0.0, (sum, it) => sum + it.subtotal);

  double get discountAmount => (subtotal * _discountPercent) / 100;

  double get shippingFee => (subtotal >= AppConstants.freeShippingThreshold || _items.isEmpty) ? 0.0 : AppConstants.standardShippingFee;

  double get grandTotal => (subtotal - discountAmount + shippingFee);

  double get freeShippingProgress => _items.isEmpty ? 0.0 : ((subtotal / AppConstants.freeShippingThreshold) * 100).clamp(0.0, 100.0);

  double get remainingForFreeShipping => (AppConstants.freeShippingThreshold - subtotal).clamp(0.0, AppConstants.freeShippingThreshold);

  void addItem(ProductItem product, ProductColor color, String size, int quantity) {
    final existingIndex = _items.indexWhere(
      (it) => it.productId == product.id && it.selectedColor.id == color.id && it.selectedSize == size,
    );

    final resolvedVariantId = product.getVariantIdFor(size, color.name);

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(
        CartItem(
          cartId: 'cart-${DateTime.now().millisecondsSinceEpoch}-${_items.length}',
          productId: product.id,
          variantId: resolvedVariantId,
          title: product.title,
          price: product.price,
          selectedColor: color,
          selectedSize: size,
          quantity: quantity,
        ),
      );
    }
    notifyListeners();
  }

  void updateQuantity(String cartId, int delta) {
    final index = _items.indexWhere((it) => it.cartId == cartId);
    if (index >= 0) {
      final newQty = _items[index].quantity + delta;
      if (newQty > 0) {
        _items[index].quantity = newQty;
      } else {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  void removeItem(String cartId) {
    _items.removeWhere((it) => it.cartId == cartId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _appliedCoupon = null;
    _discountPercent = 0.0;
    notifyListeners();
  }

  bool applyCoupon(String code) {
    final clean = code.trim().toUpperCase();
    if (clean == 'MYSTYLE10') {
      _appliedCoupon = 'MYSTYLE10';
      _discountPercent = 10.0;
      notifyListeners();
      return true;
    } else if (clean == 'WELCOME20') {
      _appliedCoupon = 'WELCOME20';
      _discountPercent = 20.0;
      notifyListeners();
      return true;
    }
    return false;
  }

  void removeCoupon() {
    _appliedCoupon = null;
    _discountPercent = 0.0;
    notifyListeners();
  }

  Future<Map<String, dynamic>> checkout({
    required String customerName,
    required String phone,
    String? email,
    required String address,
    required String paymentMethod,
    String? notes,
  }) async {
    _isSubmitting = true;
    notifyListeners();

    try {
      // Fetch live products to obtain a fallback variant ID if needed
      final liveProducts = await _apiService.fetchProducts();
      String? fallbackVariantId;
      for (final p in liveProducts) {
        if (p.variants.isNotEmpty) {
          fallbackVariantId = p.variants.first.id;
          break;
        }
      }

      final itemQuantityMap = <String, int>{};

      for (final it in _items) {
        String? varId = it.variantId;
        if (varId == null || varId.isEmpty) {
          final matchedProd = liveProducts.firstWhere(
            (p) => p.id == it.productId,
            orElse: () => liveProducts.isNotEmpty ? liveProducts.first : fallbackProductsPlaceholder,
          );
          varId = matchedProd.getVariantIdFor(it.selectedSize, it.selectedColor.name) ?? fallbackVariantId;
        }

        final finalId = varId ?? fallbackVariantId;
        if (finalId != null && finalId.isNotEmpty) {
          itemQuantityMap[finalId] = (itemQuantityMap[finalId] ?? 0) + it.quantity;
        }
      }

      final apiItems = itemQuantityMap.entries
          .map((e) => {'variantId': e.key, 'quantity': e.value})
          .toList();

      if (apiItems.isEmpty && fallbackVariantId != null) {
        apiItems.add({'variantId': fallbackVariantId, 'quantity': 1});
      }

      final result = await _apiService.submitOnlineOrder(
        customerName: customerName,
        phone: phone,
        email: email,
        address: address,
        paymentMethod: paymentMethod,
        notes: notes,
        items: apiItems,
      );

      _isSubmitting = false;
      if (result['success'] == true) {
        clearCart();
      }
      notifyListeners();
      return result;
    } catch (e) {
      _isSubmitting = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'Error processing checkout: $e',
      };
    }
  }

  static const ProductItem fallbackProductsPlaceholder = ProductItem(
    id: 'placeholder',
    title: 'Product',
    subtitle: 'Apparel',
    price: 99.0,
    rating: 5.0,
    reviewCount: 1,
    category: 'Products',
    brand: 'MY STYLE',
    description: '',
    shippingInfo: '',
    details: [],
    sizes: [],
    colors: [],
    variants: [],
  );
}
