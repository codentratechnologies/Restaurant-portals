import 'package:flutter/material.dart';
import '../data/models/user_model.dart';
import '../data/repositories/mock_repositories.dart';
import '../data/mock/mock_database.dart';


class AuthState extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();

  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.login(email, password);
      MockDatabase.currentUserId = _currentUser?.id;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup({
    required String fullName,
    required String mobileNumber,
    required String username,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.signup(
        fullName: fullName,
        mobileNumber: mobileNumber,
        username: username,
        email: email,
        password: password,
      );
      MockDatabase.currentUserId = _currentUser?.id;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> updateProfile({
    required String fullName,
    required String mobileNumber,
    required String username,
    required String email,
  }) async {
    if (_currentUser == null) return;

    _isLoading = true;
    notifyListeners();

    final updatedUser = _currentUser!.copyWith(
      fullName: fullName,
      mobileNumber: mobileNumber,
      username: username,
      email: email,
    );
    _currentUser = await _authRepository.updateProfile(updatedUser);
    MockDatabase.currentUserId = _currentUser?.id;
    _isLoading = false;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    MockDatabase.currentUserId = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
