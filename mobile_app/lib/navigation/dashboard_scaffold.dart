import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../shared/widgets/brand_ribbon.dart';

class NavItem {
  final String title;
  final IconData icon;
  final Widget screen;

  const NavItem({
    required this.title,
    required this.icon,
    required this.screen,
  });
}

class DashboardScaffold extends StatefulWidget {
  final String role; // 'candidate' | 'employer' | 'admin'
  final List<NavItem> navItems;
  final VoidCallback onSignOut;
  final String? organizationName;
  final String? packageTier;

  const DashboardScaffold({
    super.key,
    required this.role,
    required this.navItems,
    required this.onSignOut,
    this.organizationName,
    this.packageTier,
  });

  @override
  State<DashboardScaffold> createState() => _DashboardScaffoldState();
}

class _DashboardScaffoldState extends State<DashboardScaffold> {
  int _currentIndex = 0;

  String get _roleTitle {
    switch (widget.role) {
      case 'employer':
        return 'Employer';
      case 'admin':
        return 'Rohobot Admin';
      default:
        return 'Professional';
    }
  }

  String get _roleInitials {
    switch (widget.role) {
      case 'employer':
        return 'HR';
      case 'admin':
        return 'RA';
      default:
        return 'HP';
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentItem = widget.navItems[_currentIndex];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Column(
          children: [
            const BrandRibbon(height: 3),
            AppBar(
              elevation: 0,
              backgroundColor: Colors.white,
              title: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppColors.accent600,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'RH',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    currentItem.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.slate900,
                    ),
                  ),
                ],
              ),
              actions: [
                if (widget.role == 'employer' && widget.packageTier != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primary200),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: AppColors.warning),
                        const SizedBox(width: 4),
                        Text(
                          widget.packageTier!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                IconButton(
                  icon: const Icon(Icons.notifications_none_rounded, color: AppColors.slate600),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('No unread notifications at this time.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
                Container(
                  margin: const EdgeInsets.only(right: 14),
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: AppColors.primary100,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary200),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _roleInitials,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary800,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.accent600,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'RH',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Rohobot',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary800,
                          ),
                        ),
                        Text(
                          '$_roleTitle Portal',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.slate500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.slate100),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  itemCount: widget.navItems.length,
                  itemBuilder: (context, index) {
                    final item = widget.navItems[index];
                    final isSelected = index == _currentIndex;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: ListTile(
                        leading: Icon(
                          item.icon,
                          size: 20,
                          color: isSelected ? AppColors.primary700 : AppColors.slate500,
                        ),
                        title: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.primary700 : AppColors.slate700,
                          ),
                        ),
                        selected: isSelected,
                        selectedTileColor: AppColors.primary50,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        onTap: () {
                          setState(() => _currentIndex = index);
                          Navigator.pop(context); // close drawer
                        },
                      ),
                    );
                  },
                ),
              ),
              const Divider(height: 1, color: AppColors.slate100),
              Padding(
                padding: const EdgeInsets.all(16),
                child: ListTile(
                  leading: const Icon(Icons.logout_rounded, color: AppColors.error),
                  title: const Text(
                    'Sign out',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.error,
                    ),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    widget.onSignOut();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: currentItem.screen,
    );
  }
}
