class OrderItemModel {
  final String sku;
  final String productName;
  final String size;
  final String color;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  const OrderItemModel({
    required this.sku,
    required this.productName,
    required this.size,
    required this.color,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      sku: json['sku'] ?? '',
      productName: json['productName'] ?? 'Item',
      size: json['size'] ?? 'M',
      color: json['color'] ?? 'Standard',
      quantity: json['quantity'] ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class CustomerModel {
  final String name;
  final String phone;
  final String? email;
  final String address;

  const CustomerModel({
    required this.name,
    required this.phone,
    this.email,
    required this.address,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      name: json['name'] ?? 'Customer',
      phone: json['phone'] ?? '',
      email: json['email'],
      address: json['address'] ?? 'Phnom Penh',
    );
  }
}

class OrderTrackingModel {
  final String id;
  final String invoiceNumber;
  final String fulfillmentStatus;
  final String? deliveryCarrier;
  final String? trackingNumber;
  final double grandTotal;
  final String paymentMethod;
  final String paymentStatus;
  final String saleDate;
  final String? notes;
  final CustomerModel? customer;
  final List<OrderItemModel> items;

  const OrderTrackingModel({
    required this.id,
    required this.invoiceNumber,
    required this.fulfillmentStatus,
    this.deliveryCarrier,
    this.trackingNumber,
    required this.grandTotal,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.saleDate,
    this.notes,
    this.customer,
    required this.items,
  });

  factory OrderTrackingModel.fromJson(Map<String, dynamic> json) {
    final rawCustomer = json['customer'];
    final parsedCustomer = rawCustomer is Map<String, dynamic> ? CustomerModel.fromJson(rawCustomer) : null;

    final rawItems = json['items'] as List<dynamic>?;
    final parsedItems = rawItems != null
        ? rawItems.map((i) => OrderItemModel.fromJson(i as Map<String, dynamic>)).toList()
        : <OrderItemModel>[];

    return OrderTrackingModel(
      id: json['_id'] ?? json['id'] ?? '',
      invoiceNumber: json['invoiceNumber'] ?? '',
      fulfillmentStatus: json['fulfillmentStatus'] ?? 'pending',
      deliveryCarrier: json['deliveryCarrier'],
      trackingNumber: json['trackingNumber'],
      grandTotal: (json['grandTotal'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod'] ?? 'cash',
      paymentStatus: json['paymentStatus'] ?? 'completed',
      saleDate: json['saleDate'] ?? DateTime.now().toIso8601String(),
      notes: json['notes'],
      customer: parsedCustomer,
      items: parsedItems,
    );
  }

  int get stepIndex {
    switch (fulfillmentStatus.toLowerCase()) {
      case 'processing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1; // pending
    }
  }
}
