import 'package:flutter/material.dart';
import 'package:mobile/constants/app_colors.dart';

class OrderStatusStepper extends StatelessWidget {
  final int currentStep; // 1: Received, 2: Packing, 3: Dispatched, 4: Delivered

  const OrderStatusStepper({
    super.key,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    if (currentStep == -1) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.errorBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.error),
        ),
        child: const Center(
          child: Text(
            'This order has been cancelled.',
            style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
      );
    }

    final steps = [
      {'title': 'Received', 'sub': 'Order Placed', 'icon': Icons.receipt_long_outlined},
      {'title': 'Packing', 'sub': 'Preparing Box', 'icon': Icons.inventory_2_outlined},
      {'title': 'Dispatched', 'sub': 'Out for Delivery', 'icon': Icons.local_shipping_outlined},
      {'title': 'Delivered', 'sub': 'Handed to You', 'icon': Icons.check_circle_outline},
    ];

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(steps.length, (index) {
            final stepIndex = index + 1;
            final isCompleted = stepIndex <= currentStep;
            final isCurrent = stepIndex == currentStep;

            return Expanded(
              child: Column(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: isCompleted ? AppColors.secondary : AppColors.surfaceMuted,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isCompleted ? AppColors.secondary : AppColors.border,
                        width: isCurrent ? 2 : 1,
                      ),
                    ),
                    child: Icon(
                      steps[index]['icon'] as IconData,
                      size: 18,
                      color: isCompleted ? AppColors.textWhite : AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    steps[index]['title'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isCompleted ? FontWeight.w800 : FontWeight.w500,
                      color: isCompleted ? AppColors.textPrimary : AppColors.textMuted,
                    ),
                  ),
                  Text(
                    steps[index]['sub'] as String,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }
}
