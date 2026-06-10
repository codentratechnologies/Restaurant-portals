import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/page_transitions.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/models/food_item.dart';
import '../../data/models/branch.dart';
import '../../data/repositories/mock_repositories.dart';
import '../../state/auth_state.dart';
import '../../state/address_state.dart';
import '../../state/cart_state.dart';
import '../../state/branch_state.dart';
import '../cart/select_address_screen.dart';
import 'food_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FoodRepository _foodRepository = FoodRepository();
  List<FoodItem> _allFoodItems = [];
  List<String> _categories = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';
  
  // Veg / Non-Veg filters
  bool _filterVeg = false;
  bool _filterNonVeg = false;

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final food = await _foodRepository.getFoodCatalog();
    final cats = await _foodRepository.getCategories();
    setState(() {
      _allFoodItems = food;
      _categories = cats;
      _isLoading = false;
    });
  }

  List<FoodItem> _getFilteredItems(Branch? selectedBranch) {
    return _allFoodItems.where((item) {
      if (selectedBranch != null && !selectedBranch.assignedMenuIds.contains(item.id)) {
        return false;
      }
      final matchesCategory = _selectedCategory == 'All' || item.category == _selectedCategory;
      if (!matchesCategory) return false;

      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.description.toLowerCase().contains(_searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (_filterVeg && !_filterNonVeg && !item.isVeg) return false;
      if (_filterNonVeg && !_filterVeg && item.isVeg) return false;

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final authState = Provider.of<AuthState>(context);
    final addressState = Provider.of<AddressState>(context);
    final cartState = Provider.of<CartState>(context);
    final branchState = Provider.of<BranchState>(context);

    final userName = authState.currentUser?.fullName ?? 'Guest';
    final userAddress = addressState.selectedAddress?.addressLine ?? 'Select Address';
    final filteredItems = _getFilteredItems(branchState.selectedBranch);

    return Scaffold(
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : CustomScrollView(
                slivers: [
                  // Header section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      SlidePageRoute(page: const SelectAddressScreen()),
                                    );
                                  },
                                  child: Container(
                                    height: 38,
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                      borderRadius: BorderRadius.circular(19),
                                      border: Border.all(
                                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 16),
                                        const SizedBox(width: 6),
                                        Flexible(
                                          child: Text(
                                            userAddress,
                                            style: AppTypography.outfit(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const Icon(Icons.keyboard_arrow_down_rounded, size: 14),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (branchState.branches.isNotEmpty)
                                Flexible(
                                  child: Container(
                                    height: 38,
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                      borderRadius: BorderRadius.circular(19),
                                      border: Border.all(
                                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                      ),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<Branch>(
                                        value: branchState.selectedBranch,
                                        isExpanded: true,
                                        icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 14),
                                        style: AppTypography.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                        ),
                                        dropdownColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                        borderRadius: BorderRadius.circular(16),
                                        items: branchState.branches.map((Branch b) {
                                          return DropdownMenuItem<Branch>(
                                            value: b,
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.storefront_rounded, size: 16, color: AppColors.primary),
                                                const SizedBox(width: 6),
                                                Flexible(
                                                  child: Text(
                                                    b.name,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (Branch? newBranch) {
                                          if (newBranch != null) {
                                            branchState.selectBranch(newBranch);
                                          }
                                        },
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Hello, $userName 👋',
                            style: AppTypography.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Search Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                          ),
                        ),
                        child: TextField(
                          onChanged: (val) {
                            setState(() {
                              _searchQuery = val;
                            });
                          },
                          style: AppTypography.inter(fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Search food, pizzas, burgers...',
                            hintStyle: AppTypography.inter(
                              color: isDark ? AppColors.darkTextSecondary.withOpacity(0.5) : AppColors.lightTextSecondary.withOpacity(0.5),
                            ),
                            prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Promotion Banner Slide
                  SliverToBoxAdapter(
                    child: Container(
                      height: 150,
                      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, Color(0xFFF98E16)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          )
                        ],
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            right: -15,
                            bottom: -15,
                            child: Icon(
                              Icons.local_pizza_rounded,
                              size: 160,
                              color: Colors.white.withOpacity(0.12),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'OFFER OF THE WEEK',
                                    style: AppTypography.outfit(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Get 20% off on all items!',
                                  style: AppTypography.outfit(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Use coupon WARMORANGE at checkout',
                                  style: AppTypography.inter(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Horizontal Category Selector
                  SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                          child: Text(
                            'Categories',
                            style: AppTypography.outfit(
                              style: theme.textTheme.titleMedium,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(
                          height: 44,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _categories.length,
                            itemBuilder: (context, index) {
                              final cat = _categories[index];
                              final isSelected = cat == _selectedCategory;
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: ChoiceChip(
                                  label: Text(cat),
                                  selected: isSelected,
                                  selectedColor: AppColors.primary,
                                  backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                  checkmarkColor: Colors.white,
                                  labelStyle: AppTypography.outfit(
                                    color: isSelected
                                        ? Colors.white
                                        : isDark
                                            ? AppColors.darkTextPrimary
                                            : AppColors.lightTextPrimary,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    fontSize: 14,
                                  ),
                                  onSelected: (selected) {
                                    if (selected) {
                                      setState(() {
                                        _selectedCategory = cat;
                                      });
                                    }
                                  },
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: BorderSide(
                                      color: isSelected
                                          ? AppColors.primary
                                          : isDark
                                              ? AppColors.darkBorder
                                              : AppColors.lightBorder,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Food Filters (Veg / Non-Veg toggles)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                      child: Row(
                        children: [
                          FilterChip(
                            label: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppColors.success,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Text('Veg Only'),
                              ],
                            ),
                            selected: _filterVeg,
                            onSelected: (selected) {
                              setState(() {
                                _filterVeg = selected;
                                if (selected) _filterNonVeg = false;
                              });
                            },
                            selectedColor: AppColors.success.withOpacity(0.15),
                            checkmarkColor: AppColors.success,
                            labelStyle: AppTypography.inter(
                              color: _filterVeg
                                  ? AppColors.success
                                  : isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.lightTextSecondary,
                              fontWeight: _filterVeg ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                color: _filterVeg ? AppColors.success : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          FilterChip(
                            label: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppColors.danger,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Text('Non-Veg Only'),
                              ],
                            ),
                            selected: _filterNonVeg,
                            onSelected: (selected) {
                              setState(() {
                                _filterNonVeg = selected;
                                if (selected) _filterVeg = false;
                              });
                            },
                            selectedColor: AppColors.danger.withOpacity(0.15),
                            checkmarkColor: AppColors.danger,
                            labelStyle: AppTypography.inter(
                              color: _filterNonVeg
                                  ? AppColors.danger
                                  : isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.lightTextSecondary,
                              fontWeight: _filterNonVeg ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                color: _filterNonVeg ? AppColors.danger : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Menu Items Grid/List
                  filteredItems.isEmpty
                      ? SliverFillRemaining(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search_off_rounded, size: 48, color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                                const SizedBox(height: 12),
                                Text(
                                  'No items match your selection.',
                                  style: AppTypography.outfit(
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.all(20),
                          sliver: SliverGrid(
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.72,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                            ),
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final item = filteredItems[index];
                                return GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      SlidePageRoute(page: FoodDetailScreen(foodItem: item)),
                                    );
                                  },
                                  child: Card(
                                    clipBehavior: Clip.antiAlias,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      side: BorderSide(
                                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Food image + Badge
                                        Expanded(
                                          child: Stack(
                                            children: [
                                              Image.network(
                                                item.imageUrl,
                                                width: double.infinity,
                                                height: double.infinity,
                                                fit: BoxFit.cover,
                                              ),
                                              Positioned(
                                                top: 8,
                                                left: 8,
                                                child: Container(
                                                  padding: const EdgeInsets.all(4),
                                                  decoration: BoxDecoration(
                                                    color: Colors.white,
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(
                                                      color: item.isVeg ? AppColors.success : AppColors.danger,
                                                      width: 1.5,
                                                    ),
                                                  ),
                                                  child: Container(
                                                    width: 6,
                                                    height: 6,
                                                    decoration: BoxDecoration(
                                                      color: item.isVeg ? AppColors.success : AppColors.danger,
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        // Title and price
                                        Padding(
                                          padding: const EdgeInsets.all(12),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                item.name,
                                                style: AppTypography.outfit(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                item.description,
                                                style: AppTypography.inter(
                                                  fontSize: 11,
                                                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 8),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(
                                                    '₹${item.basePrice.toStringAsFixed(2)}',
                                                    style: AppTypography.inter(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 15,
                                                      color: AppColors.primary,
                                                    ),
                                                  ),
                                                  // Quick Plus Button
                                                  ElasticButton(
                                                    onTap: () {
                                                      // Quick add or detail open
                                                      if (item.customizationGroups.isEmpty) {
                                                        cartState.addToCart(item);
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          SnackBar(
                                                            content: Text('${item.name} added to cart!'),
                                                            duration: const Duration(seconds: 1),
                                                            backgroundColor: AppColors.success,
                                                          ),
                                                        );
                                                      } else {
                                                        // Item has customization, must open customization sheet
                                                        Navigator.push(
                                                          context,
                                                          SlidePageRoute(page: FoodDetailScreen(foodItem: item)),
                                                        );
                                                      }
                                                    },
                                                    child: Container(
                                                      padding: const EdgeInsets.all(6),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.primary,
                                                        borderRadius: BorderRadius.circular(10),
                                                      ),
                                                      child: const Icon(
                                                        Icons.add,
                                                        color: Colors.white,
                                                        size: 16,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                              childCount: filteredItems.length,
                            ),
                          ),
                        ),
                ],
              ),
      ),
    );
  }
}
