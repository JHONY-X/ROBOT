import 'package:flutter/material.dart';
import '../features/splash/splash_screen.dart';
import '../features/public/landing_screen.dart';
import '../features/public/privacy_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/unauthorized_screen.dart';
import '../features/candidate/candidate_overview_screen.dart';
import '../features/candidate/candidate_profile_screen.dart';
import '../features/candidate/candidate_interviews_screen.dart';
import '../features/candidate/candidate_placements_screen.dart';
import '../features/candidate/candidate_career_screen.dart';
import '../features/employer/employer_overview_screen.dart';
import '../features/employer/employer_search_screen.dart';
import '../features/employer/employer_packages_screen.dart';
import '../features/admin/admin_dashboard_screen.dart';
import '../features/admin/admin_verifications_screen.dart';
import '../features/trainer/trainer_scan_screen.dart';
import 'dashboard_scaffold.dart';

enum AppRoute {
  splash,
  landing,
  privacy,
  login,
  unauthorized,
  candidateDashboard,
  employerDashboard,
  adminDashboard,
  trainerDashboard,
  employerPackages,
}

class AppRouter extends StatefulWidget {
  const AppRouter({super.key});

  @override
  State<AppRouter> createState() => _AppRouterState();
}

class _AppRouterState extends State<AppRouter> {
  AppRoute _currentRoute = AppRoute.splash;

  void _navigateTo(AppRoute route) {
    setState(() => _currentRoute = route);
  }

  void _handleLoginSuccess(String role) {
    setState(() {
      switch (role) {
        case 'employer':
          _currentRoute = AppRoute.employerDashboard;
          break;
        case 'admin':
          _currentRoute = AppRoute.adminDashboard;
          break;
        default:
          _currentRoute = AppRoute.candidateDashboard;
          break;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    switch (_currentRoute) {
      case AppRoute.splash:
        return SplashScreen(
          onFinish: () => _navigateTo(AppRoute.landing),
        );

      case AppRoute.landing:
        return LandingScreen(
          onLogin: () => _navigateTo(AppRoute.login),
          onRegisterEmployer: () => _navigateTo(AppRoute.employerPackages),
          onNavigateCandidate: () => _navigateTo(AppRoute.login),
          onNavigatePrivacy: () => _navigateTo(AppRoute.privacy),
        );

      case AppRoute.privacy:
        return PrivacyScreen(
          onBack: () => _navigateTo(AppRoute.landing),
        );

      case AppRoute.login:
        return LoginScreen(
          onLoginSuccess: _handleLoginSuccess,
          onRegisterEmployer: () => _navigateTo(AppRoute.employerPackages),
          onBackToHome: () => _navigateTo(AppRoute.landing),
        );

      case AppRoute.unauthorized:
        return UnauthorizedScreen(
          onReturnHome: () => _navigateTo(AppRoute.landing),
        );

      case AppRoute.employerPackages:
        return EmployerPackagesScreen(
          onSelectPackage: () => _navigateTo(AppRoute.employerDashboard),
        );

      case AppRoute.candidateDashboard:
        return DashboardScaffold(
          role: 'candidate',
          onSignOut: () => _navigateTo(AppRoute.landing),
          navItems: [
            NavItem(
              title: 'Overview',
              icon: Icons.dashboard_outlined,
              screen: CandidateOverviewScreen(
                onStartOnboarding: () {},
                onViewInterviews: () {},
              ),
            ),
            const NavItem(
              title: 'My Profile',
              icon: Icons.person_outline,
              screen: CandidateProfileScreen(),
            ),
            const NavItem(
              title: 'Interviews',
              icon: Icons.calendar_month_outlined,
              screen: CandidateInterviewsScreen(),
            ),
            const NavItem(
              title: 'My Placements',
              icon: Icons.work_outline,
              screen: CandidatePlacementsScreen(),
            ),
            const NavItem(
              title: 'Career Dev',
              icon: Icons.school_outlined,
              screen: CandidateCareerScreen(),
            ),
          ],
        );

      case AppRoute.employerDashboard:
        return DashboardScaffold(
          role: 'employer',
          packageTier: 'Gold',
          organizationName: 'St. Gabriel Hospital',
          onSignOut: () => _navigateTo(AppRoute.landing),
          navItems: [
            NavItem(
              title: 'Overview',
              icon: Icons.dashboard_outlined,
              screen: EmployerOverviewScreen(
                onSearchTalent: () {},
                onUpgradePackage: () => _navigateTo(AppRoute.employerPackages),
              ),
            ),
            const NavItem(
              title: 'Search Talent',
              icon: Icons.search_rounded,
              screen: EmployerSearchScreen(),
            ),
            const NavItem(
              title: 'Interviews',
              icon: Icons.calendar_month_outlined,
              screen: CandidateInterviewsScreen(),
            ),
            const NavItem(
              title: 'Placements',
              icon: Icons.work_outline,
              screen: CandidatePlacementsScreen(),
            ),
            NavItem(
              title: 'Subscription',
              icon: Icons.credit_card_outlined,
              screen: EmployerPackagesScreen(
                onSelectPackage: () {},
              ),
            ),
          ],
        );

      case AppRoute.adminDashboard:
        return DashboardScaffold(
          role: 'admin',
          onSignOut: () => _navigateTo(AppRoute.landing),
          navItems: [
            NavItem(
              title: 'Overview',
              icon: Icons.dashboard_outlined,
              screen: AdminDashboardScreen(
                onOpenVerifications: () {},
              ),
            ),
            const NavItem(
              title: 'Verifications',
              icon: Icons.verified_user_outlined,
              screen: AdminVerificationsScreen(),
            ),
            const NavItem(
              title: 'Trainer Scan',
              icon: Icons.qr_code_scanner_rounded,
              screen: TrainerScanScreen(),
            ),
            const NavItem(
              title: 'Training Cohorts',
              icon: Icons.school_outlined,
              screen: CandidateCareerScreen(),
            ),
          ],
        );

      case AppRoute.trainerDashboard:
        return DashboardScaffold(
          role: 'admin',
          onSignOut: () => _navigateTo(AppRoute.landing),
          navItems: const [
            NavItem(
              title: 'Attendance Scan',
              icon: Icons.qr_code_scanner_rounded,
              screen: TrainerScanScreen(),
            ),
          ],
        );
    }
  }
}
