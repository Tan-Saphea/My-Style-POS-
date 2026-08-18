class StoreSettings {
  final String storeName;
  final String tagline;
  final String currency;
  final double exchangeRateKHR;
  final double taxRate;
  final double freeShippingThreshold;
  final double standardShippingFee;
  final String deliveryNotes;
  final String merchantName;
  final String bakongAccountId;
  final bool cashOnDeliveryEnabled;
  final String bankTransferDetails;
  final String receiptHeader;
  final String receiptFooter;
  final String receiptNote;
  final int returnPolicyDays;
  final String logoUrl;
  final String phone;
  final String email;
  final String address;
  final String city;
  final String country;
  final String businessHours;
  final String facebookUrl;
  final String telegramChannel;
  final String tiktokUrl;
  final String instagramUrl;

  const StoreSettings({
    required this.storeName,
    required this.tagline,
    required this.currency,
    required this.exchangeRateKHR,
    required this.taxRate,
    required this.freeShippingThreshold,
    required this.standardShippingFee,
    required this.deliveryNotes,
    required this.merchantName,
    required this.bakongAccountId,
    required this.cashOnDeliveryEnabled,
    required this.bankTransferDetails,
    required this.receiptHeader,
    required this.receiptFooter,
    required this.receiptNote,
    required this.returnPolicyDays,
    required this.logoUrl,
    required this.phone,
    required this.email,
    required this.address,
    required this.city,
    required this.country,
    required this.businessHours,
    required this.facebookUrl,
    required this.telegramChannel,
    required this.tiktokUrl,
    required this.instagramUrl,
  });

  factory StoreSettings.fromJson(Map<String, dynamic> json) {
    return StoreSettings(
      storeName: json['storeName'] ?? 'MY STYLE BOUTIQUE',
      tagline: json['tagline'] ?? 'Official Luxury Streetwear & Tailored Clothing Store',
      currency: json['currency'] ?? 'USD',
      exchangeRateKHR: (json['exchangeRateKHR'] as num?)?.toDouble() ?? 4100.0,
      taxRate: (json['taxRate'] as num?)?.toDouble() ?? 10.0,
      freeShippingThreshold: (json['freeShippingThreshold'] as num?)?.toDouble() ?? 150.0,
      standardShippingFee: (json['standardShippingFee'] as num?)?.toDouble() ?? 12.0,
      deliveryNotes: json['deliveryNotes'] ??
          'Express nationwide delivery across Cambodia via Virak Buntham & J&T Express within 1-2 business days.',
      merchantName: json['merchantName'] ?? 'MY STYLE BOUTIQUE',
      bakongAccountId: json['bakongAccountId'] ?? 'mystyle@aclb',
      cashOnDeliveryEnabled: json['cashOnDeliveryEnabled'] ?? true,
      bankTransferDetails: json['bankTransferDetails'] ??
          'ABA Bank: 000 123 456 (MY STYLE BOUTIQUE) • ACLEDA: 1234-5678-9012-34',
      receiptHeader: json['receiptHeader'] ?? 'MY STYLE BOUTIQUE - Flagship Store',
      receiptFooter: json['receiptFooter'] ?? 'Thank you for shopping with My Style Boutique!',
      receiptNote: json['receiptNote'] ??
          'Items can be exchanged within 30 days with original tags and valid receipt.',
      returnPolicyDays: (json['returnPolicyDays'] as num?)?.toInt() ?? 30,
      logoUrl: json['logoUrl'] ?? '',
      phone: json['phone'] ?? '+855 12 345 678',
      email: json['email'] ?? 'contact@mystyle.com',
      address: json['address'] ?? 'Street 271, Sangkat TTP, Phnom Penh, Cambodia',
      city: json['city'] ?? 'Phnom Penh',
      country: json['country'] ?? 'Cambodia',
      businessHours: json['businessHours'] ?? 'Mon - Sun: 08:00 AM - 09:00 PM',
      facebookUrl: json['facebookUrl'] ?? 'https://facebook.com/mystylecambodia',
      telegramChannel: json['telegramChannel'] ?? 'https://t.me/mystyleboutique',
      tiktokUrl: json['tiktokUrl'] ?? 'https://tiktok.com/@mystyle.kh',
      instagramUrl: json['instagramUrl'] ?? 'https://instagram.com/mystyle.kh',
    );
  }

  static const defaultSettings = StoreSettings(
    storeName: 'MY STYLE BOUTIQUE',
    tagline: 'Official Luxury Streetwear & Tailored Clothing Store',
    currency: 'USD',
    exchangeRateKHR: 4100.0,
    taxRate: 10.0,
    freeShippingThreshold: 150.0,
    standardShippingFee: 12.0,
    deliveryNotes:
        'Express nationwide delivery across Cambodia via Virak Buntham & J&T Express within 1-2 business days.',
    merchantName: 'MY STYLE BOUTIQUE',
    bakongAccountId: 'mystyle@aclb',
    cashOnDeliveryEnabled: true,
    bankTransferDetails: 'ABA Bank: 000 123 456 (MY STYLE BOUTIQUE)',
    receiptHeader: 'MY STYLE BOUTIQUE - Flagship Store',
    receiptFooter: 'Thank you for shopping with My Style Boutique!',
    receiptNote: 'Items can be exchanged within 30 days with original tags and valid receipt.',
    returnPolicyDays: 30,
    logoUrl: '',
    phone: '+855 12 345 678',
    email: 'contact@mystyle.com',
    address: 'Street 271, Sangkat TTP, Phnom Penh, Cambodia',
    city: 'Phnom Penh',
    country: 'Cambodia',
    businessHours: 'Mon - Sun: 08:00 AM - 09:00 PM',
    facebookUrl: 'https://facebook.com/mystylecambodia',
    telegramChannel: 'https://t.me/mystyleboutique',
    tiktokUrl: 'https://tiktok.com/@mystyle.kh',
    instagramUrl: 'https://instagram.com/mystyle.kh',
  );
}
