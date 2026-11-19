import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/brand_ribbon.dart';
import '../../shared/widgets/custom_card.dart';

class PrivacyScreen extends StatelessWidget {
  final VoidCallback onBack;
  const PrivacyScreen({super.key, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: onBack,
        ),
      ),
      body: Column(
        children: [
          const BrandRibbon(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: CustomCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              color: AppColors.primary100,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Icon(
                              Icons.verified_user_outlined,
                              color: AppColors.primary600,
                              size: 32,
                            ),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Data Protection & Privacy',
                            style: AppTypography.h1,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Prototype notice — pending Rohobot legal review',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.warningLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Text(
                        'This is a front-end prototype, not a finalized privacy policy. Do not submit real personal, identity, license, or payment information. Production data handling and security controls require legal review before launch.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF92400E),
                          height: 1.4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildSection(
                      '1. Introduction',
                      'This page describes intended privacy practices for Rohobot Home-Based Health Care Service PLC ("Rohobot"). It is a product-design draft.',
                      icon: Icons.lock_outline,
                    ),
                    _buildSection(
                      '2. Information We Collect',
                      '• Planned candidate data: Name, contact information, professional credentials, and employment preferences.\n• Planned employer data: Organization and authorized representative details.\n• Planned platform data: Search history, interview records, and feedback for matching and auditing.',
                      icon: Icons.description_outlined,
                    ),
                    _buildSection(
                      '3. How We Use Your Information',
                      '• Support professional credential verification.\n• Match candidates with suitable employers.\n• Coordinate interviews and track employment placements.\n• Support subscription payments and receipts through an approved provider.\n• Meet applicable legal and audit requirements.',
                    ),
                    _buildSection(
                      '4. Data Sharing and Confidentiality',
                      'The intended design is to keep sensitive documents (such as identity cards and licenses) from direct employer access. Evaluations are restricted to authorized administrators.',
                    ),
                    _buildSection(
                      '5. Security Measures',
                      'Production safeguards such as verified role-based access, encryption, audit logging, and multi-factor authentication are required before real personal information is handled.',
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, String content, {IconData? icon}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: AppColors.primary600),
                const SizedBox(width: 8),
              ],
              Text(title, style: AppTypography.h3),
            ],
          ),
          const SizedBox(height: 8),
          Text(content, style: AppTypography.bodyMedium),
        ],
      ),
    );
  }
}
