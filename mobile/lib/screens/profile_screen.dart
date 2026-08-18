import 'package:flutter/material.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/store_settings.dart';
import 'package:mobile/screens/order_tracking_screen.dart';
import 'package:mobile/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  StoreSettings _settings = StoreSettings.defaultSettings;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await _apiService.fetchSettings();
    if (mounted) {
      setState(() {
        _settings = settings;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'STORE & SETTINGS',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        bottom: _isLoading
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(color: AppColors.secondary, minHeight: 2),
              )
            : null,
      ),
      body: RefreshIndicator(
        onRefresh: _loadSettings,
        color: AppColors.secondary,
        backgroundColor: Colors.white,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Brand Hero Section (Enlarged Official My Style Logo)
              Center(
                child: Column(
                  children: [
                    Image.asset(
                      'assets/images/logo.png',
                      height: 64,
                      width: 180,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.storefront, size: 50, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _settings.storeName.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _settings.tagline,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.4,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              const Divider(height: 32, thickness: 1, color: Color(0xFFEEEEEE)),

              // Track Live Orders Action Row (Flat Clean Style)
              InkWell(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const OrderTrackingScreen()),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.local_shipping_outlined, color: AppColors.textPrimary, size: 22),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Track Live Orders',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Check delivery status via invoice number or phone',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
                    ],
                  ),
                ),
              ),

              const Divider(height: 32, thickness: 1, color: Color(0xFFEEEEEE)),

              // Section 1: Express Services & Policies
              const Text(
                'SERVICES & POLICIES',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),

              _buildFlatRow(
                icon: Icons.local_shipping_outlined,
                title: 'Nationwide Express Delivery',
                subtitle:
                    'Free express delivery on orders over \$${_settings.freeShippingThreshold.toStringAsFixed(0)}. Standard delivery fee is \$${_settings.standardShippingFee.toStringAsFixed(0)}.',
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.qr_code_scanner_outlined,
                title: 'KHQR & Payment Methods',
                subtitle:
                    'Pay via Bakong KHQR (${_settings.bakongAccountId})${_settings.cashOnDeliveryEnabled ? ' or Cash on Delivery (COD).' : '.'}',
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.assignment_return_outlined,
                title: '${_settings.returnPolicyDays}-Day Hassle-Free Exchange',
                subtitle: _settings.receiptNote,
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.currency_exchange_outlined,
                title: 'Dual Currency Settlement',
                subtitle:
                    'Base currency USD (\$) with official conversion 1 USD = ${_settings.exchangeRateKHR.toStringAsFixed(0)} KHR (៛).',
              ),

              const Divider(height: 36, thickness: 1, color: Color(0xFFEEEEEE)),

              // Section 2: Flagship Boutique Contact
              const Text(
                'FLAGSHIP BOUTIQUE & CONTACT',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),

              _buildFlatRow(
                icon: Icons.location_on_outlined,
                title: 'Boutique Location',
                subtitle: _settings.address,
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.phone_outlined,
                title: 'Customer Hotline',
                subtitle: _settings.phone,
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.email_outlined,
                title: 'Support Email',
                subtitle: _settings.email,
              ),
              const Divider(height: 24, thickness: 0.5, color: Color(0xFFF0F0F0)),

              _buildFlatRow(
                icon: Icons.access_time_outlined,
                title: 'Operating Hours',
                subtitle: _settings.businessHours,
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFlatRow({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.textPrimary),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    height: 1.4,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
