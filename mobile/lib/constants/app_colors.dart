import 'package:flutter/material.dart';

/// Official Brand Theme 4-Tier Solid Color Palette (Mobile: Primary Green)
/// 1. Primary: Emerald Green (#15803D / #16A34A)
/// 2. Secondary: Solid Black (#09090B / #18181B)
/// 3. Tertiary: White (#FFFFFF / #FAFAFA)
/// 4. Quaternary: Orange (#EA580C / #F97316)
class AppColors {
  AppColors._();

  // Tier 1: Primary (Green)
  static const Color primary = Color(0xFF15803D);
  static const Color primaryLight = Color(0xFF16A34A);
  static const Color primaryDark = Color(0xFF14532D);
  static const Color primaryBg = Color(0xFFF0FDF4);
  static const Color primaryBorder = Color(0xFFBBF7D0);

  // Tier 2: Secondary (Black)
  static const Color secondary = Color(0xFF09090B);
  static const Color secondaryLight = Color(0xFF18181B);
  static const Color secondaryDark = Color(0xFF000000);
  static const Color secondaryBg = Color(0xFFF4F4F5);
  static const Color secondaryBorder = Color(0xFFE4E4E7);

  // Tier 3: Tertiary (White / Neutral Surface)
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFAFAFA);
  static const Color surfaceMuted = Color(0xFFF4F4F5);
  static const Color cardBg = Color(0xFFF5F5F7);
  static const Color dragHandle = Color(0xFFD4D4D8);
  static const Color border = Color(0xFFE4E4E7);
  static const Color borderLight = Color(0xFFF0F0F0);

  // Tier 4: Quaternary (Orange)
  static const Color accent = Color(0xFFEA580C);
  static const Color accentLight = Color(0xFFF97316);
  static const Color accentBg = Color(0xFFFFF7ED);
  static const Color accentBorder = Color(0xFFFDBA74);

  // Text Colors
  static const Color textPrimary = Color(0xFF09090B);
  static const Color textSecondary = Color(0xFF71717A);
  static const Color textMuted = Color(0xFFA1A1AA);
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textPrimaryGreen = Color(0xFF15803D);

  // Status Colors
  static const Color error = Color(0xFFDC2626);
  static const Color errorBg = Color(0xFFFEF2F2);
  static const Color errorBorder = Color(0xFFFECACA);
  static const Color info = Color(0xFF0284C7);
  static const Color infoBg = Color(0xFFF0F9FF);
}
