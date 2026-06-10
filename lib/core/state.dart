import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'models.dart';

class AppState extends ChangeNotifier {
  // Singleton Pattern
  static final AppState _instance = AppState._internal();
  factory AppState() => _instance;
  AppState._internal() {
    _initMockData();
  }

  // Firebase references
  final FirebaseDatabase _db = FirebaseDatabase.instance;
  DatabaseReference? _driverRef;
  DatabaseReference? _broadcastsRef;
  StreamSubscription<DatabaseEvent>? _broadcastSubscription;
  StreamSubscription<DatabaseEvent>? _historySubscription;

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
  Timer? _hourTimer;

  void _initMockData() {
    _driver = null;
    _history = [];
  }

  // Realtime Database sync setup
  void _setupFirebaseSync() {
    if (_driver == null) return;
    final driverId = _driver!.id;

    // 1. Sync driver profile details and status
    _driverRef = _db.ref('drivers/$driverId');
    _updateFirebaseStatus();

    // 2. Listen to broadcasts node for real-time delivery requests
    _broadcastsRef = _db.ref('broadcasts');
    _broadcastSubscription?.cancel();
    _broadcastSubscription = _broadcastsRef!.onValue.listen((event) {
      if (!_isOnline || _activeOrder != null) return;
      
      final data = event.snapshot.value;
      if (data == null) {
        if (_activeRequest != null) {
          _activeRequest = null;
          notifyListeners();
        }
        return;
      }

      if (data is Map) {
        final keys = data.keys.toList();
        if (keys.isNotEmpty) {
          final firstKey = keys.first;
          final orderData = Map<String, dynamic>.from(data[firstKey] as Map);
          
          final itemsList = <ChecklistItem>[];
          if (orderData['items'] != null) {
            for (var item in (orderData['items'] as List)) {
              final itemMap = Map<String, dynamic>.from(item as Map);
              itemsList.add(ChecklistItem(
                name: itemMap['name'] ?? '',
                subtitle: itemMap['subtitle'],
                isChecked: itemMap['isChecked'] ?? false,
              ));
            }
          }

          _activeRequest = OrderModel(
            orderId: orderData['orderId'] ?? firstKey.toString(),
            branchName: orderData['branchName'] ?? 'MG Road Branch',
            branchDistance: (orderData['branchDistance'] as num?)?.toDouble() ?? 1.5,
            customerName: orderData['customerName'] ?? 'John Doe',
            customerPhone: orderData['customerPhone'] ?? '+91 98765 43210',
            customerAddress: orderData['customerAddress'] ?? 'Oakwood Apartments',
            customerDistance: (orderData['customerDistance'] as num?)?.toDouble() ?? 2.4,
            paymentMode: orderData['paymentMode'] ?? 'COD',
            collectAmount: (orderData['collectAmount'] as num?)?.toDouble() ?? 0.0,
            items: itemsList,
          );
          
          notifyListeners();
        }
      }
    });

    // 3. Sync history ledger list from Firebase
    _historySubscription?.cancel();
    _historySubscription = _db.ref('drivers/$driverId/history').onValue.listen((event) {
      final data = event.snapshot.value;
      if (data == null) {
        _history = [];
        _completedToday = 0;
        notifyListeners();
        return;
      }

      final List<HistoryItem> tempHistory = [];
      if (data is Map) {
        data.forEach((key, val) {
          final orderData = Map<String, dynamic>.from(val as Map);
          final itemsRaw = orderData['itemNames'] ?? [];
          final List<String> itemNames = List<String>.from(itemsRaw);

          tempHistory.add(HistoryItem(
            orderId: orderData['orderId'] ?? key.toString(),
            customerName: orderData['customerName'] ?? '',
            amount: (orderData['amount'] as num?)?.toDouble() ?? 0.0,
            paymentMode: orderData['paymentMode'] ?? '',
            deliveredTime: orderData['deliveredTime'] ?? '',
            date: orderData['date'] ?? 'Today',
            restaurantName: orderData['restaurantName'] ?? '',
            customerPhoneMasked: orderData['customerPhoneMasked'] ?? '',
            customerAddress: orderData['customerAddress'] ?? '',
            itemNames: itemNames,
            proofImagePath: orderData['proofImagePath'] ?? '',
          ));
        });
      }

      // Sort so newest is first
      _history = tempHistory..sort((a, b) => b.orderId.compareTo(a.orderId));
      _completedToday = _history.where((item) => item.date == 'Today').length;
      notifyListeners();
    });
  }

  void _updateFirebaseStatus() {
    if (_driverRef == null || _driver == null) return;
    
    _driverRef!.update({
      'id': _driver!.id,
      'name': _driver!.name,
      'mobile': _driver!.mobile,
      'username': _driver!.username,
      'email': _driver!.email,
      'branchName': _driver!.branchName,
      'shiftTime': _driver!.shiftTime,
      'monthlySalary': _driver!.monthlySalary,
      'profilePhotoUrl': _driver!.profilePhotoUrl,
      'isOnline': _isOnline,
      'onlineHours': _onlineHours,
      'status': _isOnline ? (_activeOrder != null ? 'Delivering' : 'Idle') : 'Offline',
      'activeOrderId': _activeOrder?.orderId ?? '',
    }).catchError((e) => print('Firebase update error: $e'));
  }

  // Auth Operations
  Future<bool> login(String username, String password) async {
    if (username.isNotEmpty && password.isNotEmpty) {
      // Firebase keys can't contain special characters
      final driverId = username.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      
      String displayName = username;
      if (username.contains('@')) {
        displayName = username.split('@').first;
      }
      displayName = displayName.replaceAll(RegExp(r'[._]'), ' ');
      displayName = displayName
          .split(' ')
          .map((word) => word.isNotEmpty
              ? '${word[0].toUpperCase()}${word.substring(1)}'
              : '')
          .join(' ');

      // Try fetching existing profile from database
      final snapshot = await _db.ref('drivers/$driverId').get();
      if (snapshot.exists) {
        final data = Map<String, dynamic>.from(snapshot.value as Map);
        _driver = DriverProfile(
          id: driverId,
          name: data['name'] ?? displayName,
          username: data['username'] ?? username.split('@').first,
          email: data['email'] ?? (username.contains('@') ? username : '$username@dineos.com'),
          mobile: data['mobile'] ?? '+91 99999 99999',
          branchName: data['branchName'] ?? 'Assigned Branch',
          shiftTime: data['shiftTime'] ?? '10:00 AM - 10:00 PM',
          monthlySalary: (data['monthlySalary'] as num?)?.toDouble() ?? 12000.0,
          profilePhotoUrl: data['profilePhotoUrl'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        );
        _onlineHours = (data['onlineHours'] as num?)?.toDouble() ?? 0.0;
      } else {
        // Create new profile
        _driver = DriverProfile(
          id: driverId,
          name: displayName,
          username: username.split('@').first,
          email: username.contains('@') ? username : '$username@dineos.com',
          mobile: '+91 99999 99999',
          branchName: 'MG Road Branch',
          shiftTime: '10:00 AM - 10:00 PM',
          monthlySalary: 12000.0,
          profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        );
        _onlineHours = 0.0;
      }

      _isLoggedIn = true;
      _activeTab = 0;
      
      // Start syncing with Firebase
      _setupFirebaseSync();
      _startHoursTimer();

      notifyListeners();
      return true;
    }
    return false;
  }

  void logout() {
    _isOnline = false;
    _updateFirebaseStatus();
    
    _isLoggedIn = false;
    _activeOrder = null;
    _activeRequest = null;
    
    _requestTimer?.cancel();
    _hourTimer?.cancel();
    _broadcastSubscription?.cancel();
    _historySubscription?.cancel();
    
    _driverRef = null;
    _broadcastsRef = null;

    notifyListeners();
  }

  // Timer to simulate online hours ticking
  void _startHoursTimer() {
    _hourTimer?.cancel();
    _hourTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (_isOnline) {
        _onlineHours += (1 / 60); // Add 1 minute in hours decimal
        _updateFirebaseStatus();
        notifyListeners();
      }
    });
  }

  // Availability status toggle
  void setOnline(bool online) {
    if (_activeOrder != null && !online) {
      return;
    }
    _isOnline = online;
    _requestTimer?.cancel();

    _updateFirebaseStatus();

    if (_isOnline) {
      // Setup a simulated order request in Realtime Database in 5s if empty
      _requestTimer = Timer(const Duration(seconds: 5), () {
        triggerSimulatedOrder();
      });
    } else {
      // Clear current request if they go offline
      _activeRequest = null;
    }

    notifyListeners();
  }

  // Pushes a simulated request payload to the Firebase Realtime Database broadcasts node
  Future<void> triggerSimulatedOrder() async {
    if (!_isOnline || _activeOrder != null) return;

    final mockOrder = {
      'orderId': 'ORD_99018',
      'branchName': 'MG Road Branch',
      'branchDistance': 1.5,
      'customerName': 'John Doe',
      'customerPhone': '+91 98765 43210',
      'customerAddress': 'Flat 101, Oakwood Apartments, Residency Road',
      'customerDistance': 2.4,
      'paymentMode': 'COD',
      'collectAmount': 727.40,
      'items': [
        {'name': '2x Veg Margherita Pizza', 'subtitle': 'Extra Cheese', 'isChecked': false},
        {'name': '1x Coca Cola 300ml', 'isChecked': false}
      ]
    };

    // Pushing directly to Firebase Realtime Database broadcasts node
    // Our local listener will receive it automatically via standard stream subscription!
    await _db.ref('broadcasts/ORD_99018').set(mockOrder);
  }

  // Request Actions
  Future<void> declineRequest() async {
    _activeRequest = null;
    notifyListeners();

    // Remove from Firebase broadcasts
    await _db.ref('broadcasts/ORD_99018').remove();

    if (_isOnline) {
      _requestTimer?.cancel();
      _requestTimer = Timer(const Duration(seconds: 10), () {
        triggerSimulatedOrder();
      });
    }
  }

  Future<void> acceptRequest() async {
    if (_activeRequest == null) return;
    _activeOrder = _activeRequest;
    _activeRequest = null;
    _activeOrder!.status = OrderStatus.assigned;
    
    // Claim the order: remove from broadcasts and write to active orders
    await _db.ref('broadcasts/${_activeOrder!.orderId}').remove();
    
    final orderMap = {
      'orderId': _activeOrder!.orderId,
      'driverId': _driver!.id,
      'status': 'Assigned',
      'branchName': _activeOrder!.branchName,
      'customerName': _activeOrder!.customerName,
      'customerAddress': _activeOrder!.customerAddress,
      'collectAmount': _activeOrder!.collectAmount,
      'paymentMode': _activeOrder!.paymentMode,
    };
    
    await _db.ref('orders/${_activeOrder!.orderId}').set(orderMap);
    _updateFirebaseStatus();
    notifyListeners();
  }

  // Order lifecycle status updates in Firebase
  Future<void> arriveAtRestaurant() async {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedStore;
    
    await _db.ref('orders/${_activeOrder!.orderId}').update({'status': 'ArrivedStore'});
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

  Future<void> confirmPickup() async {
    if (_activeOrder == null || !areAllItemsChecked()) return;
    _activeOrder!.status = OrderStatus.pickedUp;
    
    await _db.ref('orders/${_activeOrder!.orderId}').update({'status': 'PickedUp'});
    notifyListeners();
  }

  Future<void> arriveAtCustomer() async {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedCustomer;
    
    await _db.ref('orders/${_activeOrder!.orderId}').update({'status': 'ArrivedCustomer'});
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

  Future<void> completeDelivery() async {
    if (_activeOrder == null ||
        !_activeOrder!.isOtpVerified ||
        _activeOrder!.proofImagePath == null ||
        (_activeOrder!.paymentMode == 'COD' && !_activeOrder!.isPaid)) {
      return;
    }

    _activeOrder!.status = OrderStatus.delivered;

    final historyItemMap = {
      'orderId': _activeOrder!.orderId,
      'customerName': _activeOrder!.customerName,
      'amount': _activeOrder!.collectAmount,
      'paymentMode': _activeOrder!.paymentMode,
      'deliveredTime': '10:15 AM',
      'date': 'Today',
      'restaurantName': _activeOrder!.branchName,
      'customerPhoneMasked': '+91 ******45',
      'customerAddress': _activeOrder!.customerAddress,
      'itemNames': _activeOrder!.items.map((e) => e.name).toList(),
      'proofImagePath': _activeOrder!.proofImagePath!,
    };

    // Save history item to Firebase under driver history list
    final driverId = _driver!.id;
    await _db.ref('drivers/$driverId/history/${_activeOrder!.orderId}').set(historyItemMap);

    // Delete or mark complete in orders
    await _db.ref('orders/${_activeOrder!.orderId}').update({'status': 'Delivered'});

    _activeOrder = null;
    _activeTab = 1; // Direct to history screen

    _updateFirebaseStatus();
    notifyListeners();
  }

  // Profile Edit updates in Firebase
  Future<void> updateProfile(String name, String mobile) async {
    if (_driver == null) return;
    _driver = _driver!.copyWith(name: name, mobile: mobile);
    _updateFirebaseStatus();
    notifyListeners();
  }
}
