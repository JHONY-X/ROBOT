import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class CandidateCareerScreen extends StatelessWidget {
  const CandidateCareerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Career Development', style: AppTypography.h1),
          const SizedBox(height: 4),
          const Text('Accredited healthcare modules, skill verification, and certifications.', style: AppTypography.bodySmall),
          const SizedBox(height: 16),

          _buildCourseCard(
            title: 'Advanced Geriatric Patient Care',
            duration: '4 Weeks · 32 Hours',
            instructor: 'Dr. Netsanet Degu, Rohobot Clinical Lead',
            status: 'In Progress (75%)',
            statusType: StatusType.warning,
            canContinue: true,
          ),
          const SizedBox(height: 12),
          _buildCourseCard(
            title: 'Chronic Illness Home Care Protocols',
            duration: '2 Weeks · 16 Hours',
            instructor: 'Ministry of Health Accredited',
            status: 'Completed · Certificate Issued',
            statusType: StatusType.success,
            canContinue: false,
          ),
          const SizedBox(height: 12),
          _buildCourseCard(
            title: 'Palliative Pain Management & Family Counseling',
            duration: '3 Weeks · 24 Hours',
            instructor: 'Rohobot Training Center',
            status: 'Enrollment Open',
            statusType: StatusType.info,
            canContinue: false,
            canEnroll: true,
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard({
    required String title,
    required String duration,
    required String instructor,
    required String status,
    required StatusType statusType,
    bool canContinue = false,
    bool canEnroll = false,
  }) {
    return CustomCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900)),
              ),
              StatusChip(label: status, type: statusType),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.school_outlined, size: 15, color: AppColors.primary700),
              const SizedBox(width: 6),
              Text(instructor, style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.schedule_rounded, size: 15, color: AppColors.slate400),
              const SizedBox(width: 6),
              Text(duration, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
            ],
          ),
          if (canContinue || canEnroll) ...[
            const SizedBox(height: 14),
            CustomButton(
              label: canContinue ? 'Continue Learning' : 'Enroll Now',
              size: ButtonSize.sm,
              variant: canContinue ? ButtonVariant.primary : ButtonVariant.secondary,
              onPressed: () {},
            ),
          ],
        ],
      ),
    );
  }
}
