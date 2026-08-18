# MY STYLE Mobile Application (Flutter)

Official cross-platform mobile shopping client for **MY STYLE — Luxury Streetwear & Official Clothing Store**, built with Flutter & Dart.

---

## 1. Features

- **Brand Theme Aesthetics**: Official 4-tier solid color palette (Black `#09090B`, Emerald Green `#15803D`, White `#FFFFFF`, Orange `#EA580C`) with zero gradients and clean minimal icons.
- **Audience & Category Filters**: Synchronized with backend audience classifications (`All Products`, `Men`, `Women`, `Children`, `Brands`, `New Offers`).
- **Product Gallery & Detail View**: Multi-angle image preview, dynamic color swatches, size selectors (`S`, `M`, `L`, `XL`), and live stock tracking.
- **Shopping Bag & Free Shipping Meter**: Real-time quantity adjustments, free delivery progress indicator ($150 threshold), and promotional discount coupon system (`MYSTYLE10`, `WELCOME20`).
- **Express Secure Checkout**: Supports **ABA PAY KHQR**, **Cash on Delivery (COD)**, and **Credit Cards**, generating official server-synced invoice numbers (`INV-ONLINE-YYYYMMDD-XXXX`).
- **Real-Time Order Tracking**: 4-stage visual delivery progress timeline (`Received` -> `Packing` -> `Dispatched` -> `Delivered`) with shipping carrier and courier tracking number lookup.
- **Store & Customer Care**: Contact details, boutique operating hours, and exchange policies for Cambodia nationwide delivery.

---

## 2. Directory Structure

```
mobile/
├── lib/
│   ├── main.dart                      # App entry point with MultiProvider & Theme
│   ├── constants/
│   │   ├── app_colors.dart            # Official 4-tier solid color palette
│   │   └── app_constants.dart         # API Base URLs & shipping configs
│   ├── models/
│   │   ├── product.dart               # ProductItem, ProductColor models
│   │   ├── cart_item.dart             # CartItem model
│   │   └── order_tracking.dart        # OrderTrackingModel, CustomerModel
│   ├── services/
│   │   └── api_service.dart           # HTTP API client for backend communication
│   ├── providers/
│   │   ├── cart_provider.dart         # Cart state, quantities, coupons, and checkout
│   │   └── product_provider.dart      # Products catalog & category filtering state
│   ├── widgets/
│   │   ├── product_card.dart          # Luxury streetwear product card
│   │   ├── category_chip.dart         # Category pill filter
│   │   ├── search_bar_widget.dart     # Search header input
│   │   └── order_status_stepper.dart  # 4-step dispatch progress timeline
│   └── screens/
│       ├── main_layout_screen.dart    # Bottom Navigation bar (Home, Shop, Track, Bag, Store)
│       ├── home_screen.dart           # Hero banner, featured drops, and search
│       ├── category_screen.dart       # Category tab isolation and catalog grid
│       ├── product_detail_screen.dart # Image carousel, swatches, sizes, Add to Bag
│       ├── cart_screen.dart           # Bag drawer, free shipping meter, promo codes
│       ├── checkout_screen.dart       # Customer details, KHQR/COD selector, order placement
│       ├── order_tracking_screen.dart # Real-time delivery dispatch lookup
│       └── profile_screen.dart        # Boutique heritage, customer care & contact
└── pubspec.yaml                       # Flutter dependencies (http, provider, intl)
```

---

## 3. Running the Mobile App

### Prerequisites
- Flutter SDK 3.44.0+ & Dart 3.12.0+
- Backend server running on `http://localhost:5001`

### Running on Android Emulator / Physical Device
```bash
cd mobile
flutter run
```

### Running on iOS Simulator (macOS)
```bash
cd mobile
flutter run -d iPhone
```

### Running on macOS Desktop
```bash
cd mobile
flutter run -d macos
```

### Running on Chrome / Web
```bash
cd mobile
flutter run -d chrome
```

---

## 4. Backend API Integration

The app connects automatically to:
- **Web / iOS / macOS**: `http://localhost:5001/api/v1`
- **Android Emulator**: `http://10.0.2.2:5001/api/v1` (auto-routed)

### Main Endpoints Connected:
- `GET /products?status=active`: Live product catalog
- `POST /sales/online`: Customer checkout & invoice creation
- `GET /sales/track?search=:query`: Live parcel dispatch tracking
