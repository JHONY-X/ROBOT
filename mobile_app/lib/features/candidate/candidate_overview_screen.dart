import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class CandidateOverviewScreen extends StatelessWidget {
  final VoidCallback? onStartOnboarding;
  final VoidCallback? onViewInterviews;

  const CandidateOverviewScreen({
    super.key,
    this.onStartOnboarding,
    this.onViewInterviews,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Welcome, Candidate', style: AppTypography.h1),
          const SizedBox(height: 4),
          const Text(
            'Complete your candidate profile and review your recruitment activity.',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 16),

          // Demo Notice Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.warningLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline_rounded, size: 18, color: Color(0xFF92400E)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Local demo account: activity and dashboard figures below are sample data.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Stat Cards Grid
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
                          color: AppColors.warningLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.warning_amber_rounded, size: 20, color: AppColors.warning),
                      ),
                      const SizedBox(height: 10),
                      const Text('Profile', style: AppTypography.bodySmall),
                      const Text('75%', style: AppTypography.h2),
                      const SizedBox(height: 2),
                      const Text('Missing Docs', style: TextStyle(fontSize: 10, color: AppColors.warning, fontWeight: FontWeight.w600)),
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
                        child: const Icon(Icons.schedule_rounded, size: 20, color: AppColors.primary600),
                      ),
                      const SizedBox(height: 10),
                      const Text('Interviews', style: AppTypography.bodySmall),
                      const Text('2', style: AppTypography.h2),
                      const SizedBox(height: 2),
                      const Text('Next: Tomorrow', style: TextStyle(fontSize: 10, color: AppColors.primary600, fontWeight: FontWeight.w600)),
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
                          color: AppColors.successLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.check_circle_outline_rounded, size: 20, color: AppColors.success),
                      ),
                      const SizedBox(height: 10),
                      const Text('Status', style: AppTypography.bodySmall),
                      const Text('Pending', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                      const SizedBox(height: 2),
                      const Text('Under Review', style: TextStyle(fontSize: 10, color: AppColors.slate500)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          CustomButton(
            label: 'Complete Onboarding Wizard',
            variant: ButtonVariant.primary,
            icon: const Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.white),
            width: double.infinity,
            onPressed: onStartOnboarding,
          ),
          const SizedBox(height: 24),

          // Action Required
          CustomCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.description_outlined, size: 20, color: AppColors.primary600),
                    SizedBox(width: 8),
                    Text('Action Required', style: AppTypography.h3),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Upload Professional License', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
                            SizedBox(height: 2),
                            Text('Required to complete verification.', style: TextStyle(fontSize: 11, color: Color(0xFFB45309))),
                          ],
                        ),
                      ),
                      CustomButton(
                        label: 'Upload',
                        size: ButtonSize.sm,
                        variant: ButtonVariant.outline,
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.slate200),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Update Availability', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                            SizedBox(height: 2),
                            Text('Keep your status current for employers.', style: TextStyle(fontSize: 11, color: AppColors.slate500)),
                          ],
                        ),
                      ),
                      CustomButton(
                        label: 'Update',
                        size: ButtonSize.sm,
                        variant: ButtonVariant.secondary,
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Recent Activity
          CustomCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Recent Activity', style: AppTypography.h3),
                const SizedBox(height: 12),
                _buildActivityRow('Interview Invitation', 'St. Gabriel General Hospital', 'Pending', StatusType.warning),
                const Divider(height: 16, color: AppColors.slate100),
                _buildActivityRow('Profile Viewed', 'Bethel Teaching Hospital', 'Viewed', StatusType.neutral),
                const Divider(height: 16, color: AppColors.slate100),
                _buildActivityRow('Credential Verified', 'Nursing License Level IV', 'Verified', StatusType.success),
                const SizedBox(height: 14),
                CustomButton(
                  label: 'View All Activity',
                  variant: ButtonVariant.ghost,
                  width: double.infinity,
                  onPressed: onViewInterviews,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityRow(String title, String subtitle, String status, StatusType type) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.slate900)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
            ],
          ),
        ),
        StatusChip(label: status, type: type),
      ],
    );
  }
}
