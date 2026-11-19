import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class CandidateModel {
  final String id;
  final String name;
  final String role;
  final String experience;
  final String location;
  final String availability;
  final List<String> skills;
  final bool isVerified;
  bool isSaved;

  CandidateModel({
    required this.id,
    required this.name,
    required this.role,
    required this.experience,
    required this.location,
    required this.availability,
    required this.skills,
    required this.isVerified,
    this.isSaved = false,
  });
}

class EmployerSearchScreen extends StatefulWidget {
  const EmployerSearchScreen({super.key});

  @override
  State<EmployerSearchScreen> createState() => _EmployerSearchScreenState();
}

class _EmployerSearchScreenState extends State<EmployerSearchScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'All';

  final List<CandidateModel> _candidates = [
    CandidateModel(
      id: '1',
      name: 'Selamawit Alemu',
      role: 'Registered Nurse (Level IV)',
      experience: '5 Years Clinical',
      location: 'Addis Ababa (Bole)',
      availability: 'Available Immediately',
      skills: ['Elderly Care', 'IV Cannulation', 'Wound Dressing', 'Palliative'],
      isVerified: true,
      isSaved: true,
    ),
    CandidateModel(
      id: '2',
      name: 'Tewodros Kebede',
      role: 'Physiotherapist',
      experience: '3 Years Rehab',
      location: 'Addis Ababa (Yeka)',
      availability: 'Available with Notice',
      skills: ['Post-Stroke Rehab', 'Mobility Training', 'Geriatric Care'],
      isVerified: true,
      isSaved: false,
    ),
    CandidateModel(
      id: '3',
      name: 'Marta Haile',
      role: 'Licensed Midwife',
      experience: '6 Years Maternal Care',
      location: 'Addis Ababa (Arada)',
      availability: 'Available Immediately',
      skills: ['Postnatal Home Care', 'Neonatal Support', 'Vaccination'],
      isVerified: true,
      isSaved: false,
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _candidates.where((c) {
      final matchesQuery = c.name.toLowerCase().contains(_searchController.text.toLowerCase()) ||
          c.role.toLowerCase().contains(_searchController.text.toLowerCase());
      if (_selectedCategory == 'All') return matchesQuery;
      return matchesQuery && c.role.contains(_selectedCategory);
    }).toList();

    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Column(
            children: [
              TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search by candidate name, specialty...',
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.slate400),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All'),
                    _buildFilterChip('Nurse'),
                    _buildFilterChip('Physiotherapist'),
                    _buildFilterChip('Midwife'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1, color: AppColors.slate200),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final candidate = filtered[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: CustomCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.primary100,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              candidate.name.split(' ').map((e) => e[0]).take(2).join(),
                              style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary800),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        candidate.name,
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (candidate.isVerified) ...[
                                      const SizedBox(width: 4),
                                      const Icon(Icons.verified_rounded, size: 16, color: AppColors.success),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  candidate.role,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary700),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              candidate.isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                              color: candidate.isSaved ? AppColors.accent600 : AppColors.slate400,
                            ),
                            onPressed: () {
                              setState(() => candidate.isSaved = !candidate.isSaved);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.work_outline_rounded, size: 14, color: AppColors.slate500),
                          const SizedBox(width: 4),
                          Text(candidate.experience, style: const TextStyle(fontSize: 11, color: AppColors.slate600)),
                          const SizedBox(width: 12),
                          const Icon(Icons.location_on_outlined, size: 14, color: AppColors.slate500),
                          const SizedBox(width: 4),
                          Text(candidate.location, style: const TextStyle(fontSize: 11, color: AppColors.slate600)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.schedule_rounded, size: 14, color: AppColors.slate500),
                          const SizedBox(width: 4),
                          Text(candidate.availability, style: const TextStyle(fontSize: 11, color: AppColors.primary700, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: candidate.skills.map((skill) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.slate100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              skill,
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.slate700),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              label: 'Request Interview',
                              size: ButtonSize.sm,
                              variant: ButtonVariant.primary,
                              icon: const Icon(Icons.calendar_month_outlined, size: 14, color: Colors.white),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Interview request sent for ${candidate.name}')),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          CustomButton(
                            label: 'Full Profile',
                            size: ButtonSize.sm,
                            variant: ButtonVariant.outline,
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _selectedCategory == label;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => setState(() => _selectedCategory = label),
        selectedColor: AppColors.primary100,
        backgroundColor: AppColors.slate50,
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? AppColors.primary800 : AppColors.slate700,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: isSelected ? AppColors.primary300 : AppColors.slate200,
          ),
        ),
      ),
    );
  }
}
