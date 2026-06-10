import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/user_model.dart';
import '../data/repositories/mock_repositories.dart';
import '../data/mock/mock_database.dart';


class AuthState extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();

  UserModel? _currentUser;
  bool _isLoading = false;
  bool _isInitializing = true;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isInitializing;
  String? get errorMessage => _errorMessage;

  AuthState() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user_session');
      if (userJson != null) {
        final Map<String, dynamic> map = json.decode(userJson);
        _currentUser = UserModel.fromMap(map);
        MockDatabase.currentUserId = _currentUser?.id;
      }
    } catch (e) {
      print('Error loading user session: $e');
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.login(email, password);
      MockDatabase.currentUserId = _currentUser?.id;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_session', json.encode(_currentUser!.toMap()));

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

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_session', json.encode(_currentUser!.toMap()));

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

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_session', json.encode(_currentUser!.toMap()));

    _isLoading = false;
    notifyListeners();
  }

  void logout() async {
    _currentUser = null;
    MockDatabase.currentUserId = null;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_session');
    } catch (e) {
      print('Error clearing user session: $e');
    }

    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
