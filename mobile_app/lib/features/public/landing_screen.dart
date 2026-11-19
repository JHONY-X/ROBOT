import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/brand_ribbon.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class LandingScreen extends StatelessWidget {
  final VoidCallback onLogin;
  final VoidCallback onRegisterEmployer;
  final VoidCallback onNavigateCandidate;
  final VoidCallback onNavigatePrivacy;

  const LandingScreen({
    super.key,
    required this.onLogin,
    required this.onRegisterEmployer,
    required this.onNavigateCandidate,
    required this.onNavigatePrivacy,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const BrandRibbon(height: 4),
            _buildPublicNavBar(context),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHeroSection(context),
                    _buildAboutSection(context),
                    _buildPathwaysSection(context),
                    _buildFooter(context),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPublicNavBar(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 44,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Image.asset(
              'assets/images/rohobot-logo.png',
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => const Icon(
                Icons.local_hospital_rounded,
                color: AppColors.primary700,
                size: 24,
              ),
            ),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'ROHOBOT HEALTHCARE',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: AppColors.primary800,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          CustomButton(
            label: 'Sign in',
            size: ButtonSize.sm,
            variant: ButtonVariant.outline,
            onPressed: onLogin,
          ),
          const SizedBox(width: 8),
          CustomButton(
            label: 'Register',
            size: ButtonSize.sm,
            variant: ButtonVariant.primary,
            onPressed: onRegisterEmployer,
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 520,
          width: double.infinity,
          decoration: const BoxDecoration(
            color: AppColors.primary900,
          ),
          child: Image.asset(
            'assets/images/hero-image.jpg',
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => Container(color: AppColors.primary900),
          ),
        ),
        Container(
          height: 520,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.white.withValues(alpha: 0.96),
                Colors.white.withValues(alpha: 0.88),
                Colors.white.withValues(alpha: 0.40),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(9999),
                  border: Border.all(color: AppColors.primary200),
                  boxShadow: const [
                    BoxShadow(
                      color: Color.fromRGBO(0, 0, 0, 0.05),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.accent600,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'SERVING COMMUNITIES SINCE 2017',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                        color: AppColors.primary800,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                    height: 1.15,
                    color: AppColors.slate950,
                  ),
                  children: [
                    TextSpan(text: 'Compassionate healthcare, '),
                    TextSpan(
                      text: 'right at home.',
                      style: TextStyle(color: AppColors.primary700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Rohobot Home-Based Health Care Service provides high-quality, comprehensive, and affordable care for chronically ill patients and older adults—delivered by skilled, compassionate healthcare professionals.',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.55,
                  color: AppColors.slate700,
                ),
              ),
              const SizedBox(height: 22),
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  CustomButton(
                    label: 'Find healthcare talent',
                    size: ButtonSize.lg,
                    variant: ButtonVariant.primary,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white),
                    onPressed: onRegisterEmployer,
                  ),
                  const SizedBox(height: 10),
                  CustomButton(
                    label: 'Healthcare professional sign in',
                    size: ButtonSize.lg,
                    variant: ButtonVariant.outline,
                    onPressed: onLogin,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: const [
                  Icon(Icons.verified_user_outlined, size: 16, color: AppColors.primary700),
                  SizedBox(width: 6),
                  Text(
                    'Quality, trusted care',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate700),
                  ),
                  SizedBox(width: 16),
                  Icon(Icons.location_on_outlined, size: 16, color: AppColors.primary700),
                  SizedBox(width: 6),
                  Text(
                    'Proudly serving Ethiopia',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate700),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAboutSection(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'OUR STORY',
            style: AppTypography.sectionKicker,
          ),
          const SizedBox(height: 8),
          const Text(
            'Care at home, built on understanding.',
            style: AppTypography.h1,
          ),
          const SizedBox(height: 12),
          const Text(
            'Rohobot Home-Based Health Care Service was established in 2017 to provide high-quality, comprehensive, and affordable home-based healthcare services for chronically ill patients and the elderly in Ethiopia.',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 20),
          CustomCard(
            backgroundColor: AppColors.primary50,
            border: const BorderSide(color: AppColors.primary100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'OUR VISION',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: AppColors.primary700,
                  ),
                ),
                SizedBox(height: 6),
                Text('A better environment for care', style: AppTypography.h3),
                SizedBox(height: 6),
                Text(
                  'To create a suitable environment for chronically ill patients and older adults in Ethiopia and across Africa.',
                  style: AppTypography.bodyMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          CustomCard(
            backgroundColor: AppColors.accent50,
            border: const BorderSide(color: AppColors.accent100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'OUR MISSION',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: AppColors.accent700,
                  ),
                ),
                SizedBox(height: 6),
                Text('Quality care with lasting impact', style: AppTypography.h3),
                SizedBox(height: 6),
                Text(
                  'To deliver quality healthcare services at home while fostering job opportunities for healthcare professionals through capacity building, innovation, and sustainable practices.',
                  style: AppTypography.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPathwaysSection(BuildContext context) {
    return Container(
      color: const Color(0xFFF7FAF6),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('TWO PATHWAYS, ONE PURPOSE', style: AppTypography.sectionKicker),
          const SizedBox(height: 8),
          const Text(
            'A better starting point for healthcare work.',
            style: AppTypography.h1,
          ),
          const SizedBox(height: 20),
          CustomCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.monitor_heart_outlined, color: AppColors.primary700),
                ),
                const SizedBox(height: 14),
                const Text('Healthcare professionals', style: AppTypography.h3),
                const SizedBox(height: 6),
                const Text(
                  'Build your professional profile, share your experience, and explore career opportunities.',
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: onLogin,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text(
                        'Candidate sign in',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accent700,
                        ),
                      ),
                      SizedBox(width: 6),
                      Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.accent700),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          CustomCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.accent50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.business_center_outlined, color: AppColors.accent700),
                ),
                const SizedBox(height: 14),
                const Text('Healthcare employers', style: AppTypography.h3),
                const SizedBox(height: 6),
                const Text(
                  'Register your organization and find a clearer way to connect with healthcare talent.',
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: onRegisterEmployer,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text(
                        'Register organization',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accent700,
                        ),
                      ),
                      SizedBox(width: 6),
                      Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.accent700),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      color: AppColors.primary900,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 36,
                width: 40,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Image.asset('assets/images/rohobot-logo.png', fit: BoxFit.contain),
              ),
              const SizedBox(width: 10),
              const Text(
                'Rohobot Healthcare Center',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Compassionate home-based healthcare, professional development, and job-matching support across Ethiopia.',
            style: TextStyle(fontSize: 12, height: 1.5, color: Colors.white70),
          ),
          const SizedBox(height: 20),
          const Divider(color: Colors.white24),
          const SizedBox(height: 12),
          InkWell(
            onTap: onNavigatePrivacy,
            child: const Text(
              'Privacy & Data Protection Policy',
              style: TextStyle(fontSize: 12, color: Colors.white70, decoration: TextDecoration.underline),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            '© Rohobot Healthcare Center. Addis Ababa, Ethiopia.',
            style: TextStyle(fontSize: 11, color: Colors.white54),
          ),
        ],
      ),
    );
  }
}
