import 'package:flutter/material.dart';
import 'package:mobile/constants/app_colors.dart';
import 'package:mobile/models/order_tracking.dart';
import 'package:mobile/services/api_service.dart';
import 'package:mobile/widgets/order_status_stepper.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String? initialQuery;

  const OrderTrackingScreen({super.key, this.initialQuery});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _queryController = TextEditingController();
  bool _isLoading = false;
  List<OrderTrackingModel>? _orders;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
      _queryController.text = widget.initialQuery!;
      _searchOrder(widget.initialQuery!);
    }
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  Future<void> _searchOrder(String query) async {
    final clean = query.trim();
    if (clean.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMsg = null;
      _orders = null;
    });

    try {
      final results = await _apiService.trackOrder(clean);
      setState(() {
        _orders = results;
      });
    } catch (e) {
      setState(() {
        _errorMsg = 'No orders found matching invoice or phone number.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'TRACK ORDER STATUS',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.0),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Box
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _queryController,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'Enter Invoice # or Phone #',
                      hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                      filled: true,
                      fillColor: AppColors.surface,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : () => _searchOrder(_queryController.text),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textWhite),
                        )
                      : const Text('TRACK', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textWhite)),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (_errorMsg != null)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.errorBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.error, size: 20),
                    const SizedBox(width: 10),
                    Expanded(child: Text(_errorMsg!, style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),

            if (_orders == null && _errorMsg == null && !_isLoading)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 60),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: const BoxDecoration(
                          color: AppColors.surfaceMuted,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.local_shipping_outlined, size: 48, color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 16),
                      const Text('Live Dispatch Tracking', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      const Text(
                        'Enter your Invoice number or Phone number to check real-time progress.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),

            if (_orders != null)
              ..._orders!.map((order) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('INVOICE NUMBER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                              Text(order.invoiceNumber, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryBg,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.secondaryBorder),
                            ),
                            child: Text(
                              '\$${order.grandTotal.toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.secondary),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Stepper
                      OrderStatusStepper(currentStep: order.stepIndex),
                      const SizedBox(height: 20),

                      // Courier & Tracking Info
                      if (order.deliveryCarrier != null || order.trackingNumber != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (order.deliveryCarrier != null)
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Courier', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                                    Text(order.deliveryCarrier!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              if (order.trackingNumber != null)
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Tracking #', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                                    Text(order.trackingNumber!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.secondary)),
                                  ],
                                ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),

                      // Destination
                      if (order.customer != null)
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 16, color: AppColors.accent),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${order.customer!.name} (${order.customer!.phone}) • ${order.customer!.address}',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
