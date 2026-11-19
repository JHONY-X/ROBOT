import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class UnauthorizedScreen extends StatelessWidget {
  final VoidCallback onReturnHome;
  const UnauthorizedScreen({super.key, required this.onReturnHome});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.slate50,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: CustomCard(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      color: AppColors.errorLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.shield_outlined,
                      color: AppColors.error,
                      size: 38,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Access Denied', style: AppTypography.h1),
                  const SizedBox(height: 10),
                  const Text(
                    'You do not have the required permissions to view this page. If you believe this is an error, contact Rohobot support.',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyMedium,
                  ),
                  const SizedBox(height: 28),
                  CustomButton(
                    label: 'Return to Home',
                    size: ButtonSize.lg,
                    width: double.infinity,
                    variant: ButtonVariant.primary,
                    onPressed: onReturnHome,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
