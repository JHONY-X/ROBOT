import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class CandidateProfileScreen extends StatefulWidget {
  const CandidateProfileScreen({super.key});

  @override
  State<CandidateProfileScreen> createState() => _CandidateProfileScreenState();
}

class _CandidateProfileScreenState extends State<CandidateProfileScreen> {
  String _availability = 'Immediately Available';

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
                  Text('My Profile', style: AppTypography.h1),
                  SizedBox(height: 2),
                  Text('Manage your professional information', style: AppTypography.bodySmall),
                ],
              ),
              CustomButton(
                label: 'Edit',
                size: ButtonSize.sm,
                variant: ButtonVariant.outline,
                icon: const Icon(Icons.edit_outlined, size: 14),
                onPressed: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Verification Status Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.successLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Color(0xFFD1FAE5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.verified_rounded, color: AppColors.success, size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Profile Status: Verified',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF065F46)),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Your profile credentials are fully verified and visible to approved healthcare employers.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF047857), height: 1.3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Personal & Professional Details Card
          CustomCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        color: AppColors.primary100,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'SA',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary800),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Selamawit Alemu', style: AppTypography.h2),
                        SizedBox(height: 2),
                        Text('Registered Nurse (RN) · Level IV', style: TextStyle(fontSize: 12, color: AppColors.primary700, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                const Divider(color: AppColors.slate100),
                const SizedBox(height: 14),
                _buildInfoRow('Email', 'selamawit.alemu@example.com'),
                _buildInfoRow('Phone', '+251 91 123 4567'),
                _buildInfoRow('Location', 'Addis Ababa, Bole Sub-City'),
                _buildInfoRow('Experience', '5 Years Clinical & Home-Based'),
                _buildInfoRow('Languages', 'Amharic, English, Oromiffa'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Availability Management Card
          CustomCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Work Availability', style: AppTypography.h3),
                const SizedBox(height: 6),
                const Text('Employers filter talent by current availability status.', style: AppTypography.bodySmall),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: _availability,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'Immediately Available', child: Text('Immediately Available')),
                    DropdownMenuItem(value: 'Available with Notice', child: Text('Available with Notice (2 weeks)')),
                    DropdownMenuItem(value: 'Currently Placed', child: Text('Currently Placed / Unavailable')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _availability = val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Verified Credentials & Licenses
          CustomCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Verified Credentials', style: AppTypography.h3),
                const SizedBox(height: 12),
                _buildLicenseItem('Nursing Practice License', 'Ethiopian Food and Drug Authority (EFDA)', 'Valid until Dec 2027'),
                const Divider(height: 20, color: AppColors.slate100),
                _buildLicenseItem('B.Sc. in Nursing Degree', 'Addis Ababa University', 'Conferred July 2021'),
                const Divider(height: 20, color: AppColors.slate100),
                _buildLicenseItem('BLS / CPR Certification', 'Ethiopian Red Cross Society', 'Valid until Jan 2026'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, color: AppColors.slate900, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildLicenseItem(String title, String issuer, String expiry) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.verified_outlined, color: AppColors.primary700, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate900)),
              Text(issuer, style: const TextStyle(fontSize: 11, color: AppColors.slate600)),
              Text(expiry, style: const TextStyle(fontSize: 10, color: AppColors.slate400)),
            ],
          ),
        ),
        const StatusChip(label: 'Verified', type: StatusType.success),
      ],
    );
  }
}
