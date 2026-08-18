import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/screens/order_tracking_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Tan Saphea');
  final _phoneController = TextEditingController(text: '0969735562');
  final _emailController = TextEditingController(text: 'tansaphea@gmail.com');
  final _addressController = TextEditingController(text: 'St. 271, Sangkat Teuk Thla, Phnom Penh');
  final _mapLinkController = TextEditingController();
  final _notesController = TextEditingController();

  String _deliveryOption = 'custom_address'; // 'custom_address' | 'current_gps'
  String _addressPreset = 'Home'; // 'Home' | 'Work' | 'Other'
  String _paymentMethod = 'aba_khqr';

  bool _isSuccess = false;
  String _confirmedInvoiceNumber = '';
  double _paidAmount = 0.0;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _mapLinkController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitOrder(CartProvider cart) async {
    if (!_formKey.currentState!.validate()) return;

    final totalBeforeClear = cart.grandTotal;
    final prefix = '[$_addressPreset]';
    final fullAddress = _mapLinkController.text.trim().isNotEmpty
        ? '$prefix ${_addressController.text.trim()} [Maps: ${_mapLinkController.text.trim()}]'
        : '$prefix ${_addressController.text.trim()}';

    final result = await cart.checkout(
      customerName: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      email: _emailController.text.trim(),
      address: fullAddress,
      paymentMethod: _paymentMethod,
      notes: _notesController.text.trim(),
    );

    if (result['success'] == true) {
      setState(() {
        _isSuccess = true;
        _confirmedInvoiceNumber = result['invoiceNumber'] ?? 'INV-ONLINE-SUCCESS';
        _paidAmount = totalBeforeClear;
      });
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.error,
            content: Text(result['message'] ?? 'Failed to place order. Please try again.'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    if (_isSuccess) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      color: AppColors.secondaryBg,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_outline, size: 40, color: AppColors.primary),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'ORDER CONFIRMED',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: AppColors.primary),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'THANK YOU FOR YOUR ORDER',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Official Invoice: $_confirmedInvoiceNumber',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                  const SizedBox(height: 24),

                  // Order Card Details
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _buildDetailRow('Recipient Name', _nameController.text),
                        _buildDetailRow('Contact Phone', _phoneController.text),
                        _buildDetailRow('Delivery Destination', '[$_addressPreset] ${_addressController.text}'),
                        if (_mapLinkController.text.trim().isNotEmpty)
                          _buildDetailRow('Google Maps Pin', _mapLinkController.text.trim()),
                        _buildDetailRow(
                          'Payment Status',
                          _paymentMethod == 'cod' ? 'Cash on Delivery (Pending)' : 'Paid Online (${_paymentMethod.toUpperCase()})',
                        ),
                        const Divider(height: 20, color: AppColors.border),
                        _buildDetailRow('Total Amount', '\$${_paidAmount.toStringAsFixed(2)}', isTotal: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Action Buttons
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (_) => OrderTrackingScreen(initialQuery: _confirmedInvoiceNumber),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.secondary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.local_shipping_outlined, size: 16, color: AppColors.textWhite),
                        SizedBox(width: 8),
                        Text('TRACK LIVE ORDER STATUS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textWhite)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      minimumSize: const Size.fromHeight(48),
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('BACK TO STORE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'CHECKOUT & DELIVERY',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.0),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Step 1: Destination Mode
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('DELIVERY DESTINATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary)),
                  Row(
                    children: ['Home', 'Work', 'Other'].map((preset) {
                      final isSelected = _addressPreset == preset;
                      return GestureDetector(
                        onTap: () => setState(() => _addressPreset = preset),
                        child: Container(
                          margin: const EdgeInsets.only(left: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.secondary : AppColors.surface,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: isSelected ? AppColors.secondary : AppColors.border),
                          ),
                          child: Text(
                            preset == 'Home' ? 'Home (ផ្ទះ)' : (preset == 'Work' ? 'Work (កន្លែងធ្វើការ)' : 'Other'),
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? AppColors.textWhite : AppColors.textSecondary),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 2 Option Cards: Custom Address vs GPS Pin
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _deliveryOption = 'custom_address'),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _deliveryOption == 'custom_address' ? AppColors.primaryBg : AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _deliveryOption == 'custom_address' ? AppColors.primary : AppColors.border,
                            width: _deliveryOption == 'custom_address' ? 1.5 : 1.0,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.home_outlined, size: 16, color: _deliveryOption == 'custom_address' ? AppColors.primary : AppColors.textSecondary),
                                const SizedBox(width: 6),
                                const Text('Option 1: Address', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            const Text('Home/Office (When outside)', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _deliveryOption = 'current_gps'),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _deliveryOption == 'current_gps' ? AppColors.primaryBg : AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _deliveryOption == 'current_gps' ? AppColors.primary : AppColors.border,
                            width: _deliveryOption == 'current_gps' ? 1.5 : 1.0,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.navigation_outlined, size: 16, color: _deliveryOption == 'current_gps' ? AppColors.primary : AppColors.textSecondary),
                                const SizedBox(width: 6),
                                const Text('Option 2: GPS Pin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            const Text('Current live position', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _nameController,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                decoration: _inputDecoration('Recipient Full Name *', Icons.person_outline),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter recipient name' : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                decoration: _inputDecoration('Contact Phone (for Courier Call) *', Icons.phone_outlined),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _addressController,
                maxLines: 2,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                decoration: _inputDecoration(
                  _deliveryOption == 'custom_address' ? 'Street, House No., District & City (Home/Office) *' : 'Present Location Details *',
                  Icons.location_on_outlined,
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter delivery address' : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _mapLinkController,
                style: const TextStyle(fontSize: 13),
                decoration: _inputDecoration('Google Maps Link / GPS Pin (Optional)', Icons.navigation_outlined),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _notesController,
                style: const TextStyle(fontSize: 13),
                decoration: _inputDecoration('Delivery Notes (e.g. Call before arrival)', Icons.note_alt_outlined),
              ),
              const SizedBox(height: 24),

              const Text('SELECT PAYMENT METHOD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: AppColors.textSecondary)),
              const SizedBox(height: 12),

              _buildPaymentOption('aba_khqr', 'ABA PAY / KHQR (Instant Online)', Icons.qr_code_2_outlined, 'Scan via Bakong or ABA Mobile'),
              const SizedBox(height: 8),
              _buildPaymentOption('cod', 'Cash on Delivery (COD)', Icons.payments_outlined, 'Pay cash upon doorstep delivery'),
              const SizedBox(height: 8),
              _buildPaymentOption('card', 'Credit / Debit Card', Icons.credit_card_outlined, 'Visa, Mastercard, UnionPay'),
              const SizedBox(height: 24),

              // Summary Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Amount to Pay', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    Text('\$${cart.grandTotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                  ],
                ),
              ),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: const BoxDecoration(
          color: AppColors.background,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: cart.isSubmitting ? null : () => _submitOrder(cart),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: cart.isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textWhite),
                  )
                : Text(
                    _paymentMethod == 'cod' ? 'CONFIRM COD ORDER' : 'CONFIRM & PAY',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.textWhite),
                  ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
      prefixIcon: Icon(icon, size: 18, color: AppColors.textSecondary),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
    );
  }

  Widget _buildPaymentOption(String method, String title, IconData icon, String subtitle) {
    final isSelected = _paymentMethod == method;
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = method),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryBg : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 22, color: isSelected ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primaryDark : AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, size: 18, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: isTotal ? AppColors.textPrimary : AppColors.textSecondary, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(fontSize: isTotal ? 16 : 12, fontWeight: FontWeight.bold, color: isTotal ? AppColors.primary : AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
