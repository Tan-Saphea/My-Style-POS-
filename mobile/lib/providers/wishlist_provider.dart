import 'package:flutter/foundation.dart';

class WishlistProvider extends ChangeNotifier {
  final Set<String> _wishlistProductIds = {};

  Set<String> get wishlistProductIds => _wishlistProductIds;

  bool isFavorite(String productId) {
    return _wishlistProductIds.contains(productId);
  }

  void toggleFavorite(String productId) {
    if (_wishlistProductIds.contains(productId)) {
      _wishlistProductIds.remove(productId);
    } else {
      _wishlistProductIds.add(productId);
    }
    notifyListeners();
  }

  void clearWishlist() {
    _wishlistProductIds.clear();
    notifyListeners();
  }
}
