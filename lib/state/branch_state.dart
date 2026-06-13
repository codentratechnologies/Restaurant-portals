import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
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

  Future<void> autoSelectNearestBranch() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('Location services are disabled.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print('Location permissions are denied.');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        print('Location permissions are permanently denied.');
        return;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      print('Current position: lat=${position.latitude}, lng=${position.longitude}');

      if (_branches.isEmpty) {
        _branches = await _branchRepository.getBranches();
      }
      if (_branches.isEmpty) return;

      Branch nearest = _branches.first;
      double minDistance = double.infinity;

      for (final branch in _branches) {
        final distance = Geolocator.distanceBetween(
          position.latitude,
          position.longitude,
          branch.latitude,
          branch.longitude,
        );
        print('Branch: ${branch.name}, City: ${branch.city}, Lat: ${branch.latitude}, Lng: ${branch.longitude}, Distance: ${distance / 1000} km');
        if (distance < minDistance) {
          minDistance = distance;
          nearest = branch;
        }
      }

      await selectBranch(nearest);
      print('Auto-selected nearest branch: ${nearest.name}');
    } catch (e) {
      print('Error auto-selecting nearest branch: $e');
    }
  }
}
