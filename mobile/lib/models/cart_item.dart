import 'package:mobile/models/product.dart';

class CartItem {
  final String cartId;
  final String productId;
  final String? variantId;
  final String title;
  final double price;
  final ProductColor selectedColor;
  final String selectedSize;
  int quantity;

  CartItem({
    required this.cartId,
    required this.productId,
    this.variantId,
    required this.title,
    required this.price,
    required this.selectedColor,
    required this.selectedSize,
    this.quantity = 1,
  });

  double get subtotal => price * quantity;
}
