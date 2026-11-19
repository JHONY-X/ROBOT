import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class EmployerOverviewScreen extends StatelessWidget {
  final VoidCallback onSearchTalent;
  final VoidCallback onUpgradePackage;

  const EmployerOverviewScreen({
    super.key,
    required this.onSearchTalent,
    required this.onUpgradePackage,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('EMPLOYER WORKSPACE', style: AppTypography.sectionKicker),
                  SizedBox(height: 2),
                  Text('St. Gabriel Hospital', style: AppTypography.h1),
                ],
              ),
              CustomButton(
                label: 'Search talent',
                size: ButtonSize.sm,
                variant: ButtonVariant.primary,
                icon: const Icon(Icons.search_rounded, size: 16, color: Colors.white),
                onPressed: onSearchTalent,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Organization Status Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary200),
            ),
            child: Row(
              children: const [
                Icon(Icons.domain_rounded, size: 18, color: AppColors.primary700),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Verified Organization · General Hospital · Addis Ababa',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary900),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Metrics Grid
          Row(
            children: [
              Expanded(
                child: CustomCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.accent50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.bookmark_border_rounded, size: 20, color: AppColors.accent700),
                      ),
                      const SizedBox(height: 10),
                      const Text('12', style: AppTypography.h2),
                      const Text('Saved Talent', style: AppTypography.bodySmall),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: CustomCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.calendar_month_outlined, size: 20, color: AppColors.primary700),
                      ),
                      const SizedBox(height: 10),
                      const Text('4', style: AppTypography.h2),
                      const Text('Interviews', style: AppTypography.bodySmall),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: CustomCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.warningLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.hourglass_empty_rounded, size: 20, color: AppColors.warning),
                      ),
                      const SizedBox(height: 10),
                      const Text('2', style: AppTypography.h2),
                      const Text('Pending Res.', style: AppTypography.bodySmall),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Subscription Card
          CustomCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Active Subscription', style: AppTypography.h3),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary100,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text('Gold Tier', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary800)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Unlimited candidate views, priority interview requests, and verified credentials access.', style: AppTypography.bodySmall),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    Icon(Icons.check_circle_rounded, size: 16, color: AppColors.success),
                    SizedBox(width: 6),
                    Text('24 days remaining in billing period', style: TextStyle(fontSize: 12, color: AppColors.slate700, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 14),
                CustomButton(
                  label: 'Manage or Renew Package',
                  size: ButtonSize.sm,
                  variant: ButtonVariant.outline,
                  onPressed: onUpgradePackage,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Quick Recruitment Actions
          CustomCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Recruitment Actions', style: AppTypography.h3),
                const SizedBox(height: 12),
                _buildActionTile(
                  icon: Icons.search_rounded,
                  title: 'Search Healthcare Talent',
                  subtitle: 'Browse Level IV Nurses, Midwives, and Caregivers',
                  onTap: onSearchTalent,
                ),
                const Divider(height: 16, color: AppColors.slate100),
                _buildActionTile(
                  icon: Icons.bookmark_border_rounded,
                  title: 'Review Saved Candidates',
                  subtitle: '12 shortlisted profiles ready for interview request',
                  onTap: () {},
                ),
                const Divider(height: 16, color: AppColors.slate100),
                _buildActionTile(
                  icon: Icons.file_download_outlined,
                  title: 'Download Placement Reports',
                  subtitle: 'Export active hospital nurse placement timesheets',
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.primary700, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.slate400),
          ],
        ),
      ),
    );
  }
}
