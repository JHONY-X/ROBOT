import 'package:flutter/material.dart';

const _primary50 = Color(0xFFF1F6F0);
const _primary100 = Color(0xFFE3EEE2);
const _primary200 = Color(0xFFC8DDC8);
const _primary600 = Color(0xFF3E7451);
const _primary700 = Color(0xFF315D43);
const _primary800 = Color(0xFF294B38);
const _primary900 = Color(0xFF203B2E);
const _accent50 = Color(0xFFFFF1F6);
const _accent100 = Color(0xFFFFE3ED);
const _accent600 = Color(0xFFE91E63);
const _accent700 = Color(0xFFC71350);
const _background = Color(0xFFF7F8F4);
const _ink = Color(0xFF24352B);
const _muted = Color(0xFF69766C);
const _line = Color(0xFFE2E8E3);

class RohobotApp extends StatelessWidget {
  const RohobotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rohobot',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: _background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primary700,
          primary: _primary700,
          secondary: _accent600,
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: _ink,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 15,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _primary600, width: 1.5),
          ),
        ),
      ),
      home: const LandingPage(),
    );
  }
}

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final _scrollController = ScrollController();
  final _howItWorksKey = GlobalKey();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _openLogin({String role = 'candidate'}) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => LoginPage(initialRole: role)),
    );
  }

  void _openRegistration() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const EmployerRegistrationPage()),
    );
  }

  void _scrollToHowItWorks() {
    final target = _howItWorksKey.currentContext;
    if (target != null) {
      Scrollable.ensureVisible(
        target,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOut,
      );
    }
  }

  void _openMenu() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 6, 20, 22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _MenuItem(
                icon: Icons.work_outline,
                title: 'How it works',
                onTap: () {
                  Navigator.pop(context);
                  _scrollToHowItWorks();
                },
              ),
              _MenuItem(
                icon: Icons.school_outlined,
                title: 'Career development',
                onTap: () {
                  Navigator.pop(context);
                  _openLogin();
                },
              ),
              _MenuItem(
                icon: Icons.favorite_border,
                title: 'For professionals',
                onTap: () {
                  Navigator.pop(context);
                  _openLogin();
                },
              ),
              _MenuItem(
                icon: Icons.business_outlined,
                title: 'For employers',
                onTap: () {
                  Navigator.pop(context);
                  _openRegistration();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const _BrandRibbon(),
            _PublicHeader(onMenu: _openMenu, onSignIn: () => _openLogin()),
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _HeroSection(
                      onEmployer: _openRegistration,
                      onCandidate: () => _openLogin(),
                    ),
                    const _DemoNotice(),
                    _HowItWorksSection(
                      key: _howItWorksKey,
                      onCandidate: () => _openLogin(),
                      onEmployer: _openRegistration,
                    ),
                    _CallToAction(
                      onCandidate: () => _openLogin(),
                      onEmployer: _openRegistration,
                    ),
                    const _PublicFooter(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BrandRibbon extends StatelessWidget {
  const _BrandRibbon();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 5,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF78B448),
            Color(0xFF9DA754),
            Color(0xFFBD8A61),
            Color(0xFFDF4770),
            Color(0xFFED1E63),
          ],
        ),
      ),
    );
  }
}

class _PublicHeader extends StatelessWidget {
  const _PublicHeader({required this.onMenu, required this.onSignIn});

  final VoidCallback onMenu;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          Container(
            height: 34,
            width: 34,
            decoration: BoxDecoration(
              color: _primary700,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.favorite, color: Colors.white, size: 19),
          ),
          const SizedBox(width: 9),
          const Expanded(
            child: Text(
              'Rohobot',
              style: TextStyle(
                color: _primary900,
                fontWeight: FontWeight.w800,
                fontSize: 17,
              ),
            ),
          ),
          TextButton(onPressed: onSignIn, child: const Text('Sign in')),
          IconButton(
            onPressed: onMenu,
            tooltip: 'Open navigation menu',
            icon: const Icon(Icons.menu),
          ),
        ],
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({required this.onEmployer, required this.onCandidate});

  final VoidCallback onEmployer;
  final VoidCallback onCandidate;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF7FAF6),
      padding: const EdgeInsets.fromLTRB(20, 30, 20, 34),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 9,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: _primary200),
                  boxShadow: const [
                    BoxShadow(color: Color(0x10000000), blurRadius: 8),
                  ],
                ),
                child: const Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  children: [
                    Icon(Icons.circle, size: 8, color: _accent600),
                    Text(
                      'HEALTHCARE CAREERS & ORGANIZATION SUPPORT',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: _primary800,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              const Text.rich(
                TextSpan(
                  style: TextStyle(
                    height: 1.12,
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF020617),
                  ),
                  children: [
                    TextSpan(text: 'Better connections for '),
                    TextSpan(
                      text: 'healthcare',
                      style: TextStyle(color: _primary700),
                    ),
                    TextSpan(text: ' and care.'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Rohobot brings healthcare professionals and organizations together through profile review, recruitment tools, and career support.',
                style: TextStyle(
                  color: Color(0xFF475569),
                  fontSize: 16,
                  height: 1.65,
                ),
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: _PrimaryActionButton(
                  label: 'Find healthcare talent',
                  icon: Icons.arrow_forward,
                  onPressed: onEmployer,
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: _SecondaryActionButton(
                  label: 'Candidate sign in',
                  onPressed: onCandidate,
                ),
              ),
              const SizedBox(height: 20),
              const Wrap(
                spacing: 18,
                runSpacing: 10,
                children: [
                  _TrustLabel(
                    icon: Icons.verified_user_outlined,
                    text: 'Profile review workflow',
                  ),
                  _TrustLabel(
                    icon: Icons.location_on_outlined,
                    text: 'Built for Ethiopia',
                  ),
                ],
              ),
              const SizedBox(height: 30),
              const _PlatformPreview(),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrustLabel extends StatelessWidget {
  const _TrustLabel({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 17, color: _primary700),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 12, color: _muted)),
      ],
    );
  }
}

class _PlatformPreview extends StatelessWidget {
  const _PlatformPreview();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFDCE4DD)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x18213728),
            blurRadius: 26,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ONE CONNECTED PLATFORM',
                      style: TextStyle(
                        color: _primary700,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                      ),
                    ),
                    SizedBox(height: 7),
                    Text(
                      'Designed around care teams',
                      style: TextStyle(
                        fontSize: 19,
                        height: 1.2,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              const _IconTile(
                icon: Icons.favorite,
                background: _accent50,
                foreground: _accent700,
                size: 44,
              ),
            ],
          ),
          const SizedBox(height: 16),
          const _PreviewRow(
            icon: Icons.groups_2_outlined,
            title: 'Professional profiles',
            detail: 'Experience, qualifications, and career details',
            accent: _primary100,
            color: _primary800,
          ),
          const SizedBox(height: 9),
          const _PreviewRow(
            icon: Icons.business_center_outlined,
            title: 'Organization tools',
            detail: 'Recruitment workflows for healthcare employers',
            accent: _accent100,
            color: Color(0xFFA51449),
          ),
          const SizedBox(height: 9),
          Container(
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: _primary900,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                _IconTile(
                  icon: Icons.assignment_turned_in_outlined,
                  background: Color(0x1FFFFFFF),
                  foreground: Colors.white,
                  size: 38,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'People-first process',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Support for both sides of healthcare hiring',
                        style: TextStyle(color: _primary100, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              "A preview of Rohobot's professional workflow",
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }
}

class _PreviewRow extends StatelessWidget {
  const _PreviewRow({
    required this.icon,
    required this.title,
    required this.detail,
    required this.accent,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String detail;
  final Color accent;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFBFCFA),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          _IconTile(
            icon: icon,
            background: accent,
            foreground: color,
            size: 38,
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  detail,
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 11,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            title == 'Professional profiles'
                ? Icons.check_circle
                : Icons.arrow_forward,
            size: 18,
            color: title == 'Professional profiles' ? _primary600 : _accent600,
          ),
        ],
      ),
    );
  }
}

class _IconTile extends StatelessWidget {
  const _IconTile({
    required this.icon,
    required this.background,
    required this.foreground,
    required this.size,
  });

  final IconData icon;
  final Color background;
  final Color foreground;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, size: size * .52, color: foreground),
    );
  }
}

class _DemoNotice extends StatelessWidget {
  const _DemoNotice();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
      decoration: const BoxDecoration(
        color: Color(0xFFFFF7E6),
        border: Border.symmetric(
          horizontal: BorderSide(color: Color(0xFFFDE68A)),
        ),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: Color(0xFF92400E), size: 18),
          SizedBox(width: 9),
          Expanded(
            child: Text(
              'Local demo preview. Email, identity verification, payments, and records are not connected to production services. Please do not submit real sensitive information.',
              style: TextStyle(
                fontSize: 12,
                height: 1.5,
                color: Color(0xFF78350F),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HowItWorksSection extends StatelessWidget {
  const _HowItWorksSection({
    super.key,
    required this.onCandidate,
    required this.onEmployer,
  });

  final VoidCallback onCandidate;
  final VoidCallback onEmployer;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 42),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'TWO PATHWAYS, ONE PURPOSE',
                style: TextStyle(
                  color: _accent700,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'A better starting point for healthcare work.',
                style: TextStyle(
                  fontSize: 28,
                  height: 1.16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF020617),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Whether you are building your career or looking for qualified people, Rohobot gives you a clear place to begin.',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.6,
                  color: Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 22),
              _PathwayCard(
                icon: Icons.favorite_border,
                title: 'Healthcare professionals',
                description: 'Build your professional profile, share your experience, and explore career opportunities.',
                action: 'Candidate sign in',
                tone: _primary50,
                toneColor: _primary800,
                onTap: onCandidate,
              ),
              const SizedBox(height: 14),
              _PathwayCard(
                icon: Icons.business_center_outlined,
                title: 'Healthcare employers',
                description: 'Register your organization and find a clearer way to connect with healthcare talent.',
                action: 'Register organization',
                tone: _accent50,
                toneColor: Color(0xFFA51449),
                onTap: onEmployer,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PathwayCard extends StatelessWidget {
  const _PathwayCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.action,
    required this.tone,
    required this.toneColor,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final String action;
  final Color tone;
  final Color toneColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _line),
            boxShadow: const [
              BoxShadow(color: Color(0x08000000), blurRadius: 8),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _IconTile(
                icon: icon,
                background: tone,
                foreground: toneColor,
                size: 46,
              ),
              const SizedBox(height: 14),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 7),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.55,
                  color: Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    action,
                    style: const TextStyle(
                      color: _accent700,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward, size: 16, color: _accent700),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CallToAction extends StatelessWidget {
  const _CallToAction({required this.onCandidate, required this.onEmployer});

  final VoidCallback onCandidate;
  final VoidCallback onEmployer;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _primary900,
      padding: const EdgeInsets.fromLTRB(20, 34, 20, 36),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'START WITH ROHOBOT',
                style: TextStyle(
                  color: _primary100,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 9),
              const Text(
                "Let's make healthcare connections count.",
                style: TextStyle(
                  fontSize: 28,
                  height: 1.16,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Choose the path that fits you and take the next step.',
                style: TextStyle(color: _primary100, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: _LightActionButton(
                  label: 'Candidate sign in',
                  onPressed: onCandidate,
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: _PrimaryActionButton(
                  label: 'For employers',
                  onPressed: onEmployer,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PublicFooter extends StatelessWidget {
  const _PublicFooter();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.favorite, size: 20, color: _primary700),
              SizedBox(width: 8),
              Text(
                'Rohobot',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: _primary900,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Text(
            'Home-based healthcare and professional connections, designed for care teams and healthcare professionals in Ethiopia.',
            style: TextStyle(
              fontSize: 13,
              height: 1.55,
              color: Color(0xFF475569),
            ),
          ),
          SizedBox(height: 18),
          Text(
            'Explore',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0F172A),
            ),
          ),
          SizedBox(height: 8),
          Text(
            'How it works  ·  Career development  ·  For employers',
            style: TextStyle(
              fontSize: 12,
              height: 1.6,
              color: Color(0xFF475569),
            ),
          ),
          SizedBox(height: 18),
          Divider(height: 1),
          SizedBox(height: 14),
          Text(
            '© Rohobot Home-Based Health Care Service PLC. All rights reserved.\nAddis Ababa, Ethiopia',
            style: TextStyle(
              fontSize: 10,
              height: 1.6,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({
    required this.label,
    required this.onPressed,
    this.icon,
  });

  final String label;
  final VoidCallback onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: _primary700,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label),
            if (icon != null) ...[
              const SizedBox(width: 8),
              Icon(icon, size: 17),
            ],
          ],
        ),
      ),
    );
  }
}

class _SecondaryActionButton extends StatelessWidget {
  const _SecondaryActionButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: _primary700,
          backgroundColor: Colors.white,
          side: const BorderSide(color: _primary200),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
        child: Text(label),
      ),
    );
  }
}

class _LightActionButton extends StatelessWidget {
  const _LightActionButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: _primary900,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
        child: Text(label),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: _primary700),
      title: Text(title),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, this.initialRole = 'candidate'});

  final String initialRole;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  late String _role = widget.initialRole;
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const _BrandTitle(),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _line),
                  boxShadow: const [
                    BoxShadow(color: Color(0x10000000), blurRadius: 20),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'WELCOME',
                        style: TextStyle(
                          color: _accent700,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Sign in to Rohobot',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 25,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Candidates must register from an official invitation. Employers register directly.',
                        style: TextStyle(
                          color: Color(0xFF475569),
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(
                            value: 'candidate',
                            label: Text('Candidate'),
                          ),
                          ButtonSegment(
                            value: 'employer',
                            label: Text('Employer'),
                          ),
                        ],
                        selected: {_role},
                        onSelectionChanged: (roles) => setState(() {
                          _role = roles.first;
                        }),
                      ),
                      const SizedBox(height: 18),
                      TextFormField(
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: 'Email address',
                          hintText: _role == 'candidate'
                              ? 'Email used during invitation registration'
                              : 'Authorized representative email',
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Enter your email address';
                          }
                          if (!value.contains('@')) {
                            return 'Enter a valid email address';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Your password',
                          suffixIcon: IconButton(
                            tooltip: _obscurePassword
                                ? 'Show password'
                                : 'Hide password',
                            onPressed: () => setState(() {
                              _obscurePassword = !_obscurePassword;
                            }),
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                            ),
                          ),
                        ),
                        validator: (value) => value == null || value.isEmpty
                            ? 'Enter your password'
                            : null,
                        onFieldSubmitted: (_) => _submit(),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: _PrimaryActionButton(
                          label: 'Sign in as $_role',
                          icon: Icons.key,
                          onPressed: _submit,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _role == 'candidate'
                            ? 'Need an account? Ask a Rohobot official for your candidate invitation link.'
                            : 'New employer? Register your organization to get started.',
                        style: const TextStyle(
                          color: _muted,
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                      if (_role == 'employer')
                        TextButton(
                          onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => const EmployerRegistrationPage(),
                            ),
                          ),
                          child: const Text('Register your organization'),
                        ),
                      const SizedBox(height: 18),
                      const _DemoNotice(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sign-in is not connected in this mobile UI preview.'),
      ),
    );
  }
}

class EmployerRegistrationPage extends StatefulWidget {
  const EmployerRegistrationPage({super.key});

  @override
  State<EmployerRegistrationPage> createState() =>
      _EmployerRegistrationPageState();
}

class _EmployerRegistrationPageState extends State<EmployerRegistrationPage> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const _BrandTitle(),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _line),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'FOR EMPLOYERS',
                        style: TextStyle(
                          color: _accent700,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Register your organization',
                        style: TextStyle(
                          fontSize: 25,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Create an organization profile to connect with qualified healthcare professionals.',
                        style: TextStyle(color: Color(0xFF475569), height: 1.5),
                      ),
                      const SizedBox(height: 22),
                      _RegistrationField(
                        label: 'Organization name',
                        validator: _required,
                      ),
                      const SizedBox(height: 14),
                      _RegistrationField(
                        label: 'Authorized representative',
                        validator: _required,
                      ),
                      const SizedBox(height: 14),
                      _RegistrationField(
                        label: 'Work email',
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          final error = _required(value);
                          if (error != null) return error;
                          if (!value!.contains('@')) {
                            return 'Enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),
                      _RegistrationField(
                        label: 'Phone number',
                        keyboardType: TextInputType.phone,
                        validator: _required,
                      ),
                      const SizedBox(height: 14),
                      _RegistrationField(label: 'City', validator: _required),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: _PrimaryActionButton(
                          label: 'Continue registration',
                          onPressed: () {
                            if (!_formKey.currentState!.validate()) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Organization registration is not connected in this mobile UI preview.',
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      const _DemoNotice(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'This field is required' : null;
}

class _RegistrationField extends StatelessWidget {
  const _RegistrationField({
    required this.label,
    required this.validator,
    this.keyboardType,
  });

  final String label;
  final String? Function(String?) validator;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      keyboardType: keyboardType,
      textInputAction: TextInputAction.next,
      decoration: InputDecoration(labelText: label),
      validator: validator,
    );
  }
}

class _BrandTitle extends StatelessWidget {
  const _BrandTitle();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Icon(Icons.favorite, color: _primary700),
        SizedBox(width: 8),
        Text(
          'Rohobot',
          style: TextStyle(color: _primary900, fontWeight: FontWeight.w800),
        ),
      ],
    );
  }
}
