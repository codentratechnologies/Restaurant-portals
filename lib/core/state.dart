import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:crypto/crypto.dart';
import 'models.dart';

class AppState extends ChangeNotifier {
  // Singleton Pattern
  static final AppState _instance = AppState._internal();
  factory AppState() => _instance;
  AppState._internal() {
    // Initialise with mock data
    _initMockData();
  }

  // Theme settings
  bool _isThemeDark = true;
  bool get isThemeDark => _isThemeDark;

  void toggleTheme() {
    _isThemeDark = !_isThemeDark;
    notifyListeners();
  }

  // Authentication state
  bool _isLoggedIn = false;
  bool get isLoggedIn => _isLoggedIn;

  DriverProfile? _driver;
  DriverProfile? get driver => _driver;

  // Global state
  bool _isOnline = false;
  bool get isOnline => _isOnline;

  int _activeTab = 0; // 0: Home, 1: History, 2: Profile
  int get activeTab => _activeTab;

  void setTab(int index) {
    _activeTab = index;
    notifyListeners();
  }

  // Active delivery states
  OrderModel? _activeRequest;
  OrderModel? get activeRequest => _activeRequest;

  OrderModel? _activeOrder;
  OrderModel? get activeOrder => _activeOrder;

  // History state
  List<HistoryItem> _history = [];
  List<HistoryItem> get history => _history;

  int _completedToday = 0;
  int get completedToday => _completedToday;

  double _onlineHours = 0.0;
  double get onlineHours => _onlineHours;

  Timer? _requestTimer;

  void _initMockData() {
    _driver = null;
    _history = [];
  }

  // SHA-256 password hashing helper
  String _hashPassword(String password) {
    final bytes = utf8.encode(password);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Auth Operations
  Future<bool> login(String username, String password) async {
    if (username.isEmpty || password.isEmpty) return false;
    
    try {
      final ref = FirebaseDatabase.instance.ref('users');
      final snapshot = await ref.get();
      
      if (snapshot.exists && snapshot.value != null) {
        final usersData = snapshot.value as Map<dynamic, dynamic>;
        final String inputEmail = username.trim().toLowerCase();
        final String hashedPassword = _hashPassword(password);
        
        // Loop through owner UIDs (e.g. IjrrNmUTrlSP2qsK47DcCLNZSI22)
        for (var ownerKey in usersData.keys) {
          final ownerData = usersData[ownerKey];
          if (ownerData is Map<dynamic, dynamic>) {
            // Loop through employee keys (e.g. -Ouk4_RP_4r-9fd5KAxY)
            for (var employeeKey in ownerData.keys) {
              final employee = ownerData[employeeKey];
              if (employee is Map<dynamic, dynamic>) {
                final String? dbEmail = employee['email']?.toString().trim().toLowerCase();
                final String? dbRole = employee['role']?.toString();
                final String? dbStatus = employee['status']?.toString();
                final String? dbPassword = employee['password']?.toString();
                
                // Matches Email and is Active Delivery Partner
                if (dbEmail == inputEmail && 
                    dbRole == 'Delivery Partner' && 
                    dbStatus == 'Active') {
                  
                  // Match password hashes
                  if (dbPassword == hashedPassword) {
                    final String firstName = employee['firstName']?.toString() ?? '';
                    final String lastName = employee['lastName']?.toString() ?? '';
                    final String phone = employee['phone']?.toString() ?? '';
                    final String branch = employee['branch']?.toString() ?? '';
                    
                    String displayBranchName = branch.isNotEmpty 
                        ? 'Branch Key: ${branch.length > 8 ? '${branch.substring(0, 8)}...' : branch}' 
                        : 'Default Branch';
                    
                    if (branch.isNotEmpty) {
                      try {
                        final branchRef = FirebaseDatabase.instance.ref('branch/$ownerKey/$branch');
                        final branchSnapshot = await branchRef.get();
                        if (branchSnapshot.exists && branchSnapshot.value != null) {
                          final branchData = branchSnapshot.value as Map<dynamic, dynamic>;
                          final String? name = branchData['name']?.toString() ?? branchData['branchName']?.toString();
                          if (name != null && name.trim().isNotEmpty) {
                            displayBranchName = name.trim();
                          }
                        }
                      } catch (e) {
                        debugPrint('Error fetching branch details: $e');
                      }
                    }
                    
                    _driver = DriverProfile(
                      id: employeeKey.toString(),
                      name: '$firstName $lastName'.trim(),
                      username: dbEmail!.split('@').first,
                      email: employee['email']?.toString() ?? dbEmail,
                      mobile: phone.startsWith('+') ? phone : '+91 $phone',
                      branchName: displayBranchName,
                      shiftTime: '10:00 AM - 10:00 PM',
                      monthlySalary: 15000.0,
                      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
                    );
                    
                    _isLoggedIn = true;
                    _activeTab = 0;
                    _completedToday = 0;
                    _onlineHours = 0.0;
                    notifyListeners();
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Database query authentication failed: $e');
    }
    return false;
  }

  void logout() {
    _isLoggedIn = false;
    _isOnline = false;
    _activeOrder = null;
    _activeRequest = null;
    _requestTimer?.cancel();
    notifyListeners();
  }

  // Availability toggle
  void setOnline(bool online) {
    if (_activeOrder != null && !online) {
      // Locked if holding active order
      return;
    }
    _isOnline = online;
    _requestTimer?.cancel();

    if (_isOnline) {
      // Start a simulated request trigger after 4 seconds to make the app interactive!
      _requestTimer = Timer(const Duration(seconds: 4), () {
        triggerSimulatedOrder();
      });
    }

    notifyListeners();
  }

  // Simulator order request generator
  void triggerSimulatedOrder() {
    if (!_isOnline || _activeOrder != null || _activeRequest != null) return;

    _activeRequest = OrderModel(
      orderId: '#ORD-99018',
      branchName: 'MG Road Branch',
      branchDistance: 1.5,
      customerName: 'John Doe',
      customerPhone: '+91 98765 43210',
      customerAddress: 'Flat 101, Oakwood Apartments, Residency Road',
      customerDistance: 2.4,
      paymentMode: 'COD',
      collectAmount: 727.40,
      items: [
        ChecklistItem(name: '2x Veg Margherita Pizza', subtitle: 'Extra Cheese'),
        ChecklistItem(name: '1x Coca Cola 300ml'),
      ],
    );

    notifyListeners();
  }

  // Request actions
  void declineRequest() {
    _activeRequest = null;
    notifyListeners();

    // Schedule another request in 8 seconds to allow retrying
    if (_isOnline) {
      _requestTimer?.cancel();
      _requestTimer = Timer(const Duration(seconds: 8), () {
        triggerSimulatedOrder();
      });
    }
  }

  void acceptRequest() {
    if (_activeRequest == null) return;
    _activeOrder = _activeRequest;
    _activeRequest = null;
    _activeOrder!.status = OrderStatus.assigned;
    notifyListeners();
  }

  // Order lifecycle status progression
  void arriveAtRestaurant() {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedStore;
    notifyListeners();
  }

  void toggleChecklistItem(int index) {
    if (_activeOrder == null) return;
    _activeOrder!.items[index].isChecked = !_activeOrder!.items[index].isChecked;
    notifyListeners();
  }

  bool areAllItemsChecked() {
    if (_activeOrder == null) return false;
    return _activeOrder!.items.every((item) => item.isChecked);
  }

  void confirmPickup() {
    if (_activeOrder == null || !areAllItemsChecked()) return;
    _activeOrder!.status = OrderStatus.pickedUp;
    notifyListeners();
  }

  void arriveAtCustomer() {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedCustomer;
    notifyListeners();
  }

  void captureProof(String path) {
    if (_activeOrder == null) return;
    _activeOrder!.proofImagePath = path;
    notifyListeners();
  }

  bool verifyOtp(String code) {
    if (_activeOrder == null) return false;
    if (code == '5824') {
      _activeOrder!.isOtpVerified = true;
      notifyListeners();
      return true;
    }
    return false;
  }

  void confirmPayment() {
    if (_activeOrder == null) return;
    _activeOrder!.isPaid = true;
    notifyListeners();
  }

  void completeDelivery() {
    if (_activeOrder == null ||
        !_activeOrder!.isOtpVerified ||
        _activeOrder!.proofImagePath == null ||
        (_activeOrder!.paymentMode == 'COD' && !_activeOrder!.isPaid)) {
      return;
    }

    _activeOrder!.status = OrderStatus.delivered;

    // Add to history list
    _history.insert(
      0,
      HistoryItem(
        orderId: _activeOrder!.orderId,
        customerName: _activeOrder!.customerName,
        amount: _activeOrder!.collectAmount,
        paymentMode: _activeOrder!.paymentMode,
        deliveredTime: '10:15 AM', // Simulated time of delivery
        date: 'Today',
        restaurantName: _activeOrder!.branchName,
        customerPhoneMasked: '+91 ******45', // Masked phone number
        customerAddress: _activeOrder!.customerAddress,
        itemNames: _activeOrder!.items.map((e) => e.name).toList(),
        proofImagePath: _activeOrder!.proofImagePath!,
      ),
    );

    _completedToday += 1;
    _activeOrder = null;
    _activeTab = 1; // Direct to history screen so they can review their delivery

    notifyListeners();
  }

  // Profile Edit
  void updateProfile(String name, String mobile) {
    if (_driver == null) return;
    _driver = _driver!.copyWith(name: name, mobile: mobile);
    notifyListeners();
  }
}
