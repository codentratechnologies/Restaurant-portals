import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/branch.dart';
import '../data/repositories/mock_repositories.dart';

class BranchState extends ChangeNotifier {
  final BranchRepository _branchRepository = BranchRepository();

  List<Branch> _branches = [];
  Branch? _selectedBranch;
  bool _isLoading = false;

  List<Branch> get branches => _branches;
  Branch? get selectedBranch => _selectedBranch;
  bool get isLoading => _isLoading;

  BranchState() {
    loadBranches();
  }

  Future<void> loadBranches() async {
    _isLoading = true;
    notifyListeners();

    try {
      _branches = await _branchRepository.getBranches();
      if (_branches.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        final storedBranchId = prefs.getString('selected_branch_id');
        if (storedBranchId != null) {
          final matched = _branches.firstWhere(
            (element) => element.id == storedBranchId,
            orElse: () => _branches.first,
          );
          _selectedBranch = matched;
        } else {
          _selectedBranch = _branches.first;
        }
      }
    } catch (e) {
      print('Error loading branch state: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectBranch(Branch branch) async {
    _selectedBranch = branch;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('selected_branch_id', branch.id);
    } catch (e) {
      print('Error saving selected branch ID: $e');
    }
  }
}
