import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConstants {
  AppConstants._();

  static const String appName = 'MY STYLE';
  static const String appTagline = 'Luxury Streetwear & Official Store';

  // Base API URL with auto-detect for Android Emulator vs iOS/Web/Desktop
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5001/api/v1';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:5001/api/v1';
      }
    } catch (_) {
      // Fallback
    }
    return 'http://localhost:5001/api/v1';
  }

  // Free shipping threshold
  static const double freeShippingThreshold = 150.0;
  static const double standardShippingFee = 12.0;

  // Contact info
  static const String storePhone = '012 345 678';
  static const String storeLocation = 'Phnom Penh, Cambodia';
}
