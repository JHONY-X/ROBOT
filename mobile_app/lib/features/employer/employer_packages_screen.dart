import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class EmployerPackagesScreen extends StatefulWidget {
  final VoidCallback onSelectPackage;
  const EmployerPackagesScreen({super.key, required this.onSelectPackage});

  @override
  State<EmployerPackagesScreen> createState() => _EmployerPackagesScreenState();
}

class _EmployerPackagesScreenState extends State<EmployerPackagesScreen> {
  String _selectedTier = 'Silver';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Employer Subscription')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Choose a Package', style: AppTypography.h1),
            const SizedBox(height: 4),
            const Text(
              'Choose an annual hospital training and job matching package.',
              style: AppTypography.bodySmall,
            ),
            const SizedBox(height: 16),

            _buildTierCard(
              tier: 'Basic',
              price: '136,575 ETB / year',
              description: 'Annual training capacity: 50 trainees',
              features: [
                'Discount on hospital share: 10%',
                'Hospital cost per trainee: 2,731.50 ETB',
                'Annual hospital payment: 136,575 ETB',
              ],
            ),
            const SizedBox(height: 12),
            _buildTierCard(
              tier: 'Silver',
              price: '386,962.50 ETB / year',
              description: 'Annual training capacity: 150 trainees',
              features: [
                'Discount on hospital share: 15%',
                'Hospital cost per trainee: 2,579.75 ETB',
                'Annual hospital payment: 386,962.50 ETB',
              ],
              isPopular: true,
            ),
            const SizedBox(height: 12),
            _buildTierCard(
              tier: 'Gold',
              price: '1,214,000 ETB / year',
              description: 'Annual training capacity: 500 trainees',
              features: [
                'Discount on hospital share: 20%',
                'Hospital cost per trainee: 2,428.00 ETB',
                'Annual hospital payment: 1,214,000 ETB',
              ],
            ),
            const SizedBox(height: 12),
            _buildTierCard(
              tier: 'Premium',
              price: '2,276.25 ETB per trainee',
              description: 'Unlimited annual training capacity',
              features: [
                'Discount on hospital share: 25%',
                'Hospital cost per trainee: 2,276.25 ETB',
                'Annual payment is based on the number of trainees',
              ],
            ),
            const SizedBox(height: 24),
            CustomButton(
              label: 'Proceed with $_selectedTier Plan',
              size: ButtonSize.lg,
              width: double.infinity,
              variant: ButtonVariant.primary,
              icon: const Icon(
                Icons.arrow_forward_rounded,
                size: 18,
                color: Colors.white,
              ),
              onPressed: widget.onSelectPackage,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTierCard({
    required String tier,
    required String price,
    required String description,
    required List<String> features,
    bool isPopular = false,
  }) {
    final isSelected = _selectedTier == tier;

    return CustomCard(
      padding: const EdgeInsets.all(18),
      border: BorderSide(
        color: isSelected
            ? AppColors.accent600
            : (isPopular ? AppColors.primary300 : AppColors.slate200),
        width: isSelected ? 2 : 1,
      ),
      backgroundColor: isSelected
          ? AppColors.accent50.withValues(alpha: 0.3)
          : Colors.white,
      onTap: () => setState(() => _selectedTier = tier),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(tier, style: AppTypography.h2),
              if (isPopular)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary100,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Most Popular',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary800,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            price,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.primary700,
            ),
          ),
          const SizedBox(height: 4),
          Text(description, style: AppTypography.bodySmall),
          const SizedBox(height: 14),
          const Divider(color: AppColors.slate100),
          const SizedBox(height: 10),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    size: 16,
                    color: AppColors.success,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      f,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.slate700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
