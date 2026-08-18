import 'package:flutter/foundation.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/api_service.dart';

class ProductProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<ProductItem> _products = [];
  bool _isLoading = false;
  String _selectedCategory = 'Men';
  String _searchQuery = '';

  // Filter state sets
  final Set<String> _selectedPriceRanges = {};
  final Set<String> _selectedSizes = {};
  final Set<String> _selectedColors = {};
  final Set<String> _selectedBrands = {};

  List<ProductItem> get allProducts => _products;
  bool get isLoading => _isLoading;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;

  Set<String> get selectedPriceRanges => _selectedPriceRanges;
  Set<String> get selectedSizes => _selectedSizes;
  Set<String> get selectedColors => _selectedColors;
  Set<String> get selectedBrands => _selectedBrands;

  int get activeFilterCount =>
      _selectedPriceRanges.length +
      _selectedSizes.length +
      _selectedColors.length +
      _selectedBrands.length;

  List<ProductItem> get filteredProducts {
    return _products.filterBy(
      category: _selectedCategory,
      query: _searchQuery,
      priceRanges: _selectedPriceRanges,
      sizes: _selectedSizes,
      colors: _selectedColors,
      brands: _selectedBrands,
    );
  }

  // Guaranteed distinct New Arrivals (first 2-4 items)
  List<ProductItem> get newArrivals {
    final list = _getCategoryBaseList();
    return list.take(2).toList();
  }

  // Guaranteed distinct Popular Products (strictly excludes newArrivals)
  List<ProductItem> get popularProducts {
    final list = _getCategoryBaseList();
    final newArrivalIds = newArrivals.map((p) => p.id).toSet();
    final remaining = list.where((p) => !newArrivalIds.contains(p.id)).toList();

    if (remaining.isNotEmpty) {
      return remaining.take(4).toList();
    }
    // Fallback if catalog is small
    return list.skip(1).take(2).toList();
  }

  // Guaranteed distinct Trending / Curated Products (strictly excludes newArrivals + popularProducts)
  List<ProductItem> get trendingProducts {
    final list = _getCategoryBaseList();
    final usedIds = {...newArrivals.map((p) => p.id), ...popularProducts.map((p) => p.id)};
    final remaining = list.where((p) => !usedIds.contains(p.id)).toList();
    return remaining.take(4).toList();
  }

  List<ProductItem> _getCategoryBaseList() {
    return _products.where((p) {
      if (_selectedCategory.toLowerCase() == 'all' ||
          _selectedCategory.toLowerCase() == 'products' ||
          _selectedCategory.toLowerCase() == 'new offers' ||
          _selectedCategory.toLowerCase() == 'popular') {
        return true;
      }
      return p.category.toLowerCase() == _selectedCategory.toLowerCase();
    }).toList();
  }

  ProductProvider() {
    loadProducts();
  }

  Future<void> loadProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      _products = await _apiService.fetchProducts();
    } catch (_) {
      _products = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void togglePriceRange(String range) {
    if (_selectedPriceRanges.contains(range)) {
      _selectedPriceRanges.remove(range);
    } else {
      _selectedPriceRanges.add(range);
    }
    notifyListeners();
  }

  void setSinglePriceRange(String? range) {
    _selectedPriceRanges.clear();
    if (range != null && range.isNotEmpty) {
      _selectedPriceRanges.add(range);
    }
    notifyListeners();
  }

  void toggleSize(String size) {
    if (_selectedSizes.contains(size)) {
      _selectedSizes.remove(size);
    } else {
      _selectedSizes.add(size);
    }
    notifyListeners();
  }

  void setSingleSize(String? size) {
    _selectedSizes.clear();
    if (size != null && size.isNotEmpty) {
      _selectedSizes.add(size);
    }
    notifyListeners();
  }

  void toggleColor(String color) {
    if (_selectedColors.contains(color)) {
      _selectedColors.remove(color);
    } else {
      _selectedColors.add(color);
    }
    notifyListeners();
  }

  void setSingleColor(String? color) {
    _selectedColors.clear();
    if (color != null && color.isNotEmpty) {
      _selectedColors.add(color);
    }
    notifyListeners();
  }

  void toggleBrand(String brand) {
    if (_selectedBrands.contains(brand)) {
      _selectedBrands.remove(brand);
    } else {
      _selectedBrands.add(brand);
    }
    notifyListeners();
  }

  void setSingleBrand(String? brand) {
    _selectedBrands.clear();
    if (brand != null && brand.isNotEmpty) {
      _selectedBrands.add(brand);
    }
    notifyListeners();
  }

  void clearAllFilters() {
    _selectedPriceRanges.clear();
    _selectedSizes.clear();
    _selectedColors.clear();
    _selectedBrands.clear();
    _searchQuery = '';
    notifyListeners();
  }

  void clearFilterSection(String section) {
    switch (section.toLowerCase()) {
      case 'price':
        _selectedPriceRanges.clear();
        break;
      case 'sizes':
      case 'size':
        _selectedSizes.clear();
        break;
      case 'color':
      case 'colors':
        _selectedColors.clear();
        break;
      case 'brand':
      case 'brands':
        _selectedBrands.clear();
        break;
    }
    notifyListeners();
  }
}

extension ProductFilterExtension on List<ProductItem> {
  List<ProductItem> filterBy({
    required String category,
    required String query,
    Set<String> priceRanges = const {},
    Set<String> sizes = const {},
    Set<String> colors = const {},
    Set<String> brands = const {},
  }) {
    return where((product) {
      // 1. Search Query match
      final matchesSearch = query.trim().isEmpty ||
          product.title.toLowerCase().contains(query.toLowerCase()) ||
          product.brand.toLowerCase().contains(query.toLowerCase()) ||
          product.subtitle.toLowerCase().contains(query.toLowerCase()) ||
          product.description.toLowerCase().contains(query.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Category match
      final cat = category.toLowerCase();
      bool matchesCategory = true;
      if (cat == 'products' ||
          cat == 'all products' ||
          cat == 'all' ||
          cat == 'new offers' ||
          cat == 'popular') {
        matchesCategory = true;
      } else if (cat == 'men') {
        matchesCategory = product.category.toLowerCase() == 'men' ||
            product.category.toLowerCase() == 'products';
      } else if (cat == 'women') {
        matchesCategory = product.category.toLowerCase() == 'women' ||
            product.category.toLowerCase() == 'products';
      } else if (cat == 'children' || cat == 'kids') {
        matchesCategory = product.category.toLowerCase() == 'children' ||
            product.category.toLowerCase() == 'kids' ||
            product.category.toLowerCase() == 'products';
      } else if (cat == 'brands') {
        matchesCategory = product.brand.isNotEmpty;
      } else {
        matchesCategory = product.category.toLowerCase() == cat;
      }

      if (!matchesCategory) return false;

      // 3. Price Range match
      if (priceRanges.isNotEmpty) {
        bool matchesPrice = false;
        for (final r in priceRanges) {
          if (r == '\$0-\$25' && product.price >= 0 && product.price <= 25) {
            matchesPrice = true;
          } else if (r == '\$25-\$50' && product.price > 25 && product.price <= 50) {
            matchesPrice = true;
          } else if (r == '\$50-\$100' && product.price > 50 && product.price <= 100) {
            matchesPrice = true;
          } else if (r == '\$100-\$150' && product.price > 100 && product.price <= 150) {
            matchesPrice = true;
          } else if (r == '\$150-\$200' && product.price > 150 && product.price <= 200) {
            matchesPrice = true;
          } else if (r == '\$200-\$250' && product.price > 200 && product.price <= 250) {
            matchesPrice = true;
          } else if (r == '\$250+' && product.price > 250) {
            matchesPrice = true;
          }
        }
        if (!matchesPrice) return false;
      }

      // 4. Size match
      if (sizes.isNotEmpty) {
        final hasSize = product.sizes.any((s) => sizes.any((sel) => sel.toLowerCase() == s.toLowerCase()));
        if (!hasSize) return false;
      }

      // 5. Color match
      if (colors.isNotEmpty) {
        final hasColor = product.colors.any((c) => colors.any((sel) => c.name.toLowerCase().contains(sel.toLowerCase())));
        if (!hasColor) return false;
      }

      // 6. Brand match
      if (brands.isNotEmpty) {
        final hasBrand = brands.any((b) => product.brand.toLowerCase().contains(b.toLowerCase()));
        if (!hasBrand) return false;
      }

      return true;
    }).toList();
  }
}
