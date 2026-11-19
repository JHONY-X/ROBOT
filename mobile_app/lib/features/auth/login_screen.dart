import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/brand_ribbon.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class LoginScreen extends StatefulWidget {
  final Function(String role) onLoginSuccess;
  final VoidCallback onRegisterEmployer;
  final VoidCallback onBackToHome;

  const LoginScreen({
    super.key,
    required this.onLoginSuccess,
    required this.onRegisterEmployer,
    required this.onBackToHome,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _selectedRole = 'candidate';
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleDemoSignIn(String role) {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) {
        setState(() => _isLoading = false);
        widget.onLoginSuccess(role);
      }
    });
  }

  void _handleFormSubmit() {
    if (_emailController.text.trim().isEmpty || _passwordController.text.trim().isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both your email address and password.';
      });
      return;
    }
    _handleDemoSignIn(_selectedRole);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const BrandRibbon(height: 5),
            _buildLoginHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 480),
                    child: CustomCard(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text('WELCOME', style: AppTypography.sectionKicker),
                          const SizedBox(height: 6),
                          const Text('Sign in to Rohobot', style: AppTypography.h1),
                          const SizedBox(height: 6),
                          const Text(
                            'Candidates must register from an official invitation. Employers register directly.',
                            style: AppTypography.bodySmall,
                          ),
                          const SizedBox(height: 18),

                          // Role Selector Tab
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppColors.slate100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                _buildRoleTab('Candidate', 'candidate'),
                                _buildRoleTab('Employer', 'employer'),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),

                          // Email Field
                          Text('Email address', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.slate700)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              hintText: _selectedRole == 'candidate'
                                  ? 'Email used during invitation registration'
                                  : 'Authorized representative email',
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Password Field
                          Text('Password', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.slate700)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _passwordController,
                            obscureText: true,
                            decoration: const InputDecoration(
                              hintText: 'Your password',
                            ),
                          ),
                          const SizedBox(height: 20),

                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.errorLight,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFECACA)),
                              ),
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(fontSize: 12, color: AppColors.error),
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Sign In Button
                          CustomButton(
                            label: 'Sign in as $_selectedRole',
                            variant: ButtonVariant.primary,
                            size: ButtonSize.lg,
                            isLoading: _isLoading,
                            icon: const Icon(Icons.key_rounded, size: 18, color: Colors.white),
                            onPressed: _handleFormSubmit,
                          ),
                          const SizedBox(height: 16),

                          if (_selectedRole == 'employer') ...[
                            InkWell(
                              onTap: widget.onRegisterEmployer,
                              child: RichText(
                                textAlign: TextAlign.center,
                                text: const TextSpan(
                                  style: TextStyle(fontSize: 12, color: AppColors.slate600),
                                  children: [
                                    TextSpan(text: 'New employer? '),
                                    TextSpan(
                                      text: 'Register your organization',
                                      style: TextStyle(
                                        color: AppColors.primary700,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ] else ...[
                            const Text(
                              'Need an account? Ask a Rohobot official for your candidate invitation link.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12, color: AppColors.slate600),
                            ),
                          ],

                          const SizedBox(height: 24),
                          const Divider(color: AppColors.slate200),
                          const SizedBox(height: 16),

                          // Testing Shortcuts
                          const Text(
                            'Testing shortcuts',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.slate800,
                            ),
                          ),
                          const SizedBox(height: 10),
                          CustomButton(
                            label: 'Continue as demo Admin',
                            variant: ButtonVariant.outline,
                            icon: const Icon(Icons.shield_outlined, size: 16, color: AppColors.slate700),
                            onPressed: () => _handleDemoSignIn('admin'),
                          ),
                          const SizedBox(height: 8),
                          CustomButton(
                            label: 'Continue as demo Candidate',
                            variant: ButtonVariant.secondary,
                            icon: const Icon(Icons.monitor_heart_outlined, size: 16, color: AppColors.primary700),
                            onPressed: () => _handleDemoSignIn('candidate'),
                          ),
                          const SizedBox(height: 8),
                          CustomButton(
                            label: 'Continue as demo Employer',
                            variant: ButtonVariant.outline,
                            icon: const Icon(Icons.business_center_outlined, size: 16, color: AppColors.slate700),
                            onPressed: () => _handleDemoSignIn('employer'),
                          ),
                          const SizedBox(height: 20),

                          Center(
                            child: InkWell(
                              onTap: widget.onBackToHome,
                              child: const Text(
                                'Return to Rohobot home',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginHeader() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          InkWell(
            onTap: widget.onBackToHome,
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.primary700,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.monitor_heart_rounded, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Rohobot',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary900),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleTab(String title, String role) {
    final isSelected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedRole = role;
            _errorMessage = null;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? const [
                    BoxShadow(
                      color: Color.fromRGBO(0, 0, 0, 0.05),
                      blurRadius: 4,
                      offset: Offset(0, 1),
                    )
                  ]
                : null,
          ),
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isSelected ? AppColors.primary800 : AppColors.slate600,
            ),
          ),
        ),
      ),
    );
  }
}
