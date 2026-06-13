import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  String? _ownerKey;
  String? get ownerKey => _ownerKey;

  String? _branchKey;
  String? get branchKey => _branchKey;

  String? _resolvedBranchId;
  String? get resolvedBranchId => _resolvedBranchId;

  double? _branchLatitude;
  double? get branchLatitude => _branchLatitude;

  double? _branchLongitude;
  double? get branchLongitude => _branchLongitude;

  String? _branchGoogleMapUrl;
  String? get branchGoogleMapUrl => _branchGoogleMapUrl;

  String? _branchAddress;
  String? get branchAddress => _branchAddress;

  final Set<String> _declinedOrderIds = {};
  Timer? _orderTimer;

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
    _branchLatitude = null;
    _branchLongitude = null;
    _branchGoogleMapUrl = null;
    _branchAddress = null;
    _resolvedBranchId = null;
    _declinedOrderIds.clear();
    _stopOrderListener();
  }

  Future<void> loadPersistedState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
      _isOnline = prefs.getBool('isOnline') ?? false;
      _ownerKey = prefs.getString('ownerKey');
      _branchKey = prefs.getString('branchKey');
      _resolvedBranchId = prefs.getString('resolvedBranchId');
      
      final latVal = prefs.getDouble('branchLatitude');
      if (latVal != null) _branchLatitude = latVal;
      
      final lngVal = prefs.getDouble('branchLongitude');
      if (lngVal != null) _branchLongitude = lngVal;
      
      _branchGoogleMapUrl = prefs.getString('branchGoogleMapUrl');
      _branchAddress = prefs.getString('branchAddress');
      
      final driverJson = prefs.getString('driverProfile');
      if (driverJson != null) {
        _driver = DriverProfile.fromJson(json.decode(driverJson));
      }
      
      if (_isLoggedIn && _ownerKey != null && _branchKey != null) {
        if (_resolvedBranchId == null) {
          await _resolveBranchId();
        }
        if (_isOnline) {
          _startOrderListener();
        }
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading persisted state: $e');
    }
  }

  Future<void> _persistState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', _isLoggedIn);
      await prefs.setBool('isOnline', _isOnline);
      
      if (_ownerKey != null) await prefs.setString('ownerKey', _ownerKey!);
      else await prefs.remove('ownerKey');
      
      if (_branchKey != null) await prefs.setString('branchKey', _branchKey!);
      else await prefs.remove('branchKey');
      
      if (_resolvedBranchId != null) await prefs.setString('resolvedBranchId', _resolvedBranchId!);
      else await prefs.remove('resolvedBranchId');
      
      if (_branchLatitude != null) await prefs.setDouble('branchLatitude', _branchLatitude!);
      else await prefs.remove('branchLatitude');
      
      if (_branchLongitude != null) await prefs.setDouble('branchLongitude', _branchLongitude!);
      else await prefs.remove('branchLongitude');
      
      if (_branchGoogleMapUrl != null) await prefs.setString('branchGoogleMapUrl', _branchGoogleMapUrl!);
      else await prefs.remove('branchGoogleMapUrl');

      if (_branchAddress != null) await prefs.setString('branchAddress', _branchAddress!);
      else await prefs.remove('branchAddress');
      
      if (_driver != null) {
        await prefs.setString('driverProfile', json.encode(_driver!.toJson()));
      } else {
        await prefs.remove('driverProfile');
      }
    } catch (e) {
      debugPrint('Error persisting state: $e');
    }
  }

  Future<void> _clearPersistedState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (e) {
      debugPrint('Error clearing persisted state: $e');
    }
  }

  OrderModel _mapDbToOrder(String id, Map<dynamic, dynamic> map) {
    // Items mapping - handle both List and Map representations from Firebase RTDB
    final rawItems = map['items'];
    final List<dynamic> itemsList = [];
    if (rawItems is List) {
      itemsList.addAll(rawItems);
    } else if (rawItems is Map) {
      final sortedKeys = rawItems.keys.toList()..sort();
      for (var key in sortedKeys) {
        itemsList.add(rawItems[key]);
      }
    }

    final items = itemsList.map((itemVal) {
      if (itemVal is Map<dynamic, dynamic>) {
        final name = itemVal['foodItem']?['name']?.toString() ?? itemVal['name']?.toString() ?? 'Item';
        final qty = itemVal['quantity'] ?? itemVal['qty'] ?? 1;
        
        // Find customizations if any
        String? customizationsText;
        if (itemVal['customizations'] is Map) {
          final custs = itemVal['customizations'] as Map;
          final List<String> selectedNames = [];
          custs.forEach((key, val) {
            if (val == true || val == 'true') {
              selectedNames.add(key.toString());
            }
          });
          if (selectedNames.isNotEmpty) {
            customizationsText = selectedNames.join(', ');
          }
        }
        
        return ChecklistItem(
          name: '${qty}x $name',
          subtitle: customizationsText,
        );
      }
      return ChecklistItem(name: '1x Item');
    }).toList();

    // Delivery address parsing
    final addrVal = map['deliveryAddress'];
    String addressStr = 'Address not specified';
    if (addrVal is Map) {
      final addressLine = addrVal['addressLine']?.toString() ?? '';
      final landmark = addrVal['landmark']?.toString() ?? '';
      final pinCode = addrVal['pinCode']?.toString() ?? '';
      final title = addrVal['title']?.toString() ?? '';
      final parts = [title, addressLine, landmark, pinCode].where((p) => p.isNotEmpty).toList();
      if (parts.isNotEmpty) {
        addressStr = parts.join(', ');
      }
    }

    final String paymentMethod = map['paymentMethod']?.toString() ?? 'Prepaid';
    final String paymentMode = (paymentMethod.toLowerCase().contains('cash') || paymentMethod.toLowerCase().contains('cod'))
        ? 'COD'
        : 'Prepaid';

    final double total = double.tryParse(map['total']?.toString() ?? '') ?? 0.0;

    return OrderModel(
      orderId: id,
      branchName: _driver?.branchName ?? 'MG Road Branch',
      branchDistance: 1.5,
      customerName: addrVal is Map ? (addrVal['title']?.toString() ?? 'Customer') : 'Customer',
      customerPhone: '+91 98765 43210',
      customerAddress: addressStr,
      customerDistance: 2.4,
      items: items,
      paymentMode: paymentMode,
      collectAmount: total,
    );
  }

  Future<void> _resolveBranchId() async {
    if (_ownerKey == null || _branchKey == null) return;
    try {
      final branchesRef = FirebaseDatabase.instance.ref('branch/$_ownerKey');
      final branchesSnapshot = await branchesRef.get();
      if (branchesSnapshot.exists && branchesSnapshot.value != null) {
        final branchesData = branchesSnapshot.value;
        if (branchesData is Map) {
          for (var entry in branchesData.entries) {
            final bKey = entry.key.toString();
            final bVal = entry.value;
            if (bVal is Map) {
              final code = bVal['code']?.toString();
              if (bKey == _branchKey || code == _branchKey) {
                _resolvedBranchId = bKey;
                debugPrint('[BranchResolve] Found branch $bKey. Fields: ${bVal.keys.toList()}');
                _branchLatitude = _parseDouble(bVal, ['latitude', 'lat', 'Latitude', 'Lat']);
                _branchLongitude = _parseDouble(bVal, ['longitude', 'lng', 'long', 'Longitude', 'Lng']);
                _branchGoogleMapUrl = _parseString(bVal, ['googleMapUrl', 'google_map_url', 'mapUrl', 'map_url', 'googleMapsUrl']);
                _branchAddress = _parseString(bVal, ['address', 'branchAddress', 'branch_address', 'Address', 'fullAddress']);
                debugPrint('[BranchResolve] lat=$_branchLatitude, lng=$_branchLongitude, addr=$_branchAddress');
                await _persistState();
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Error resolving branch ID: $e');
    }
  }

  double? _parseDouble(Map bVal, List<String> keys) {
    for (final key in keys) {
      final v = bVal[key];
      if (v != null) {
        final parsed = double.tryParse(v.toString());
        if (parsed != null) return parsed;
      }
    }
    return null;
  }

  String? _parseString(Map bVal, List<String> keys) {
    for (final key in keys) {
      final v = bVal[key]?.toString();
      if (v != null && v.trim().isNotEmpty) return v.trim();
    }
    return null;
  }

  void _startOrderListener() {
    _stopOrderListener();
    if (_ownerKey == null) return;

    if (_resolvedBranchId == null) {
      _resolveBranchId().then((_) {
        if (_isOnline && _resolvedBranchId != null && _orderTimer == null) {
          _startOrderListener();
        }
      });
      return;
    }

    // Run immediately once
    _checkIncomingOrders();

    // Schedule periodic check every 15 seconds
    _orderTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _checkIncomingOrders();
    });
  }

  Future<void> _checkIncomingOrders() async {
    debugPrint('[OrderPolling] Checking incoming orders: isOnline=$_isOnline, activeOrder=$_activeOrder, activeRequest=$_activeRequest');
    if (!_isOnline || _activeOrder != null || _activeRequest != null) return;
    if (_ownerKey == null || _resolvedBranchId == null) {
      debugPrint('[OrderPolling] Warning: ownerKey ($_ownerKey) or resolvedBranchId ($_resolvedBranchId) is null. Aborting polling.');
      return;
    }

    try {
      final path = 'order/$_ownerKey/$_resolvedBranchId';
      debugPrint('[OrderPolling] Fetching database path: $path');
      final ref = FirebaseDatabase.instance.ref(path);
      final snapshot = await ref.get();
      
      if (!_isOnline || _activeOrder != null || _activeRequest != null) return;

      if (snapshot.exists && snapshot.value != null) {
        final dynamic rawVal = snapshot.value;
        Map<dynamic, dynamic> data = {};
        if (rawVal is Map) {
          data = rawVal;
        } else if (rawVal is List) {
          for (int i = 0; i < rawVal.length; i++) {
            if (rawVal[i] != null) {
              data[i.toString()] = rawVal[i];
            }
          }
        }
        debugPrint('[OrderPolling] Fetched ${data.length} orders from path: $path');
        
        // Find the first order with status == 'Preparing'
        for (var entry in data.entries) {
          final orderId = entry.key.toString();
          final orderVal = entry.value;
          if (orderVal is Map) {
            final String status = orderVal['status']?.toString() ?? '';
            final bool isDeclined = _declinedOrderIds.contains(orderId);
            debugPrint('[OrderPolling] Order: $orderId, status: $status, declined: $isDeclined');
            
            if (status.trim().toLowerCase() == 'preparing' && !isDeclined) {
              debugPrint('[OrderPolling] Found match for order $orderId with status "$status". Displaying request popup.');
              // Map to OrderModel
              _activeRequest = _mapDbToOrder(orderId, Map<dynamic, dynamic>.from(orderVal));
              notifyListeners();
              break;
            }
          }
        }
      } else {
        debugPrint('[OrderPolling] No snapshot content found at database path: $path');
      }
    } catch (e) {
      debugPrint('[OrderPolling] Error fetching or mapping incoming orders: $e');
    }
  }

  void _stopOrderListener() {
    _orderTimer?.cancel();
    _orderTimer = null;
  }

  // Update database status helper
  Future<void> _updateDbStatus({String? availability, String? delivery}) async {
    if (_ownerKey != null && _branchKey != null && _driver != null) {
      try {
        final empRef = FirebaseDatabase.instance
            .ref('employee/$_ownerKey/$_branchKey/${_driver!.id}');
        
        final Map<String, dynamic> updates = {};
        if (availability != null) updates['availability_status'] = availability;
        if (delivery != null) updates['delivery_status'] = delivery;
        
        if (updates.isNotEmpty) {
          await empRef.update(updates);
        }
      } catch (e) {
        debugPrint('Error updating database status fields: $e');
      }
    }
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
      final ref = FirebaseDatabase.instance.ref('employee');
      final snapshot = await ref.get();
      
      if (snapshot.exists && snapshot.value != null) {
        final employeeData = snapshot.value as Map<dynamic, dynamic>;
        final String inputEmail = username.trim().toLowerCase();
        final String hashedPassword = _hashPassword(password);
        
        // Loop through owner UIDs (e.g. IjrrNmUTrlSP2qsk47DcCLNZSI22)
        for (var ownerKey in employeeData.keys) {
          final ownerData = employeeData[ownerKey];
          if (ownerData is Map<dynamic, dynamic>) {
            // Loop through branch keys (e.g. BR003)
            for (var branchKey in ownerData.keys) {
              final branchData = ownerData[branchKey];
              if (branchData is Map<dynamic, dynamic>) {
                // Loop through employee keys (e.g. -Ouw9fxQkGf28SG1XNCV)
                for (var employeeKey in branchData.keys) {
                  final employee = branchData[employeeKey];
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
                        final String branch = employee['branch']?.toString() ?? branchKey.toString();
                        
                        String displayBranchName = branch.isNotEmpty 
                            ? 'Branch Key: ${branch.length > 8 ? '${branch.substring(0, 8)}...' : branch}' 
                            : 'Default Branch';
                        
                        String? resolvedBranchKey;
                        if (branch.isNotEmpty) {
                          try {
                            final branchesRef = FirebaseDatabase.instance.ref('branch/$ownerKey');
                            final branchesSnapshot = await branchesRef.get();
                            if (branchesSnapshot.exists && branchesSnapshot.value != null) {
                              final branchesData = branchesSnapshot.value;
                              if (branchesData is Map) {
                                for (var entry in branchesData.entries) {
                                  final bKey = entry.key.toString();
                                  final bVal = entry.value;
                                  if (bVal is Map) {
                                    final code = bVal['code']?.toString();
                                    if (bKey == branch || code == branch) {
                                      resolvedBranchKey = bKey;
                                      debugPrint('[Login BranchResolve] Found branch $bKey. Fields: ${bVal.keys.toList()}');
                                      final String? name = _parseString(bVal, ['name', 'branchName', 'branch_name', 'Name']);
                                      if (name != null && name.trim().isNotEmpty) {
                                        displayBranchName = name.trim();
                                      }
                                      _branchLatitude = _parseDouble(bVal, ['latitude', 'lat', 'Latitude', 'Lat']);
                                      _branchLongitude = _parseDouble(bVal, ['longitude', 'lng', 'long', 'Longitude', 'Lng']);
                                      _branchGoogleMapUrl = _parseString(bVal, ['googleMapUrl', 'google_map_url', 'mapUrl', 'map_url', 'googleMapsUrl']);
                                      _branchAddress = _parseString(bVal, ['address', 'branchAddress', 'branch_address', 'Address', 'fullAddress']);
                                      debugPrint('[Login BranchResolve] lat=$_branchLatitude, lng=$_branchLongitude, addr=$_branchAddress');
                                      break;
                                    }
                                  }
                                }
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
                        
                        _ownerKey = ownerKey.toString();
                        _branchKey = branch.isNotEmpty ? branch : branchKey.toString();
                        _resolvedBranchId = resolvedBranchKey ?? _branchKey;
                        _updateDbStatus(
                          availability: 'Offline',
                          delivery: 'Offline',
                        );
                        
                        _isLoggedIn = true;
                        _activeTab = 0;
                        _completedToday = 0;
                        _onlineHours = 0.0;
                        _persistState();
                        notifyListeners();
                        return true;
                      }
                    }
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
    _stopOrderListener();
    _updateDbStatus(
      availability: 'Offline',
      delivery: 'Offline',
    );
    _isLoggedIn = false;
    _isOnline = false;
    _activeOrder = null;
    _activeRequest = null;
    _resolvedBranchId = null;
    _branchAddress = null;
    _requestTimer?.cancel();
    _clearPersistedState();
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

    _updateDbStatus(
      availability: _isOnline ? 'Online' : 'Offline',
      delivery: _isOnline ? 'IDLE' : 'Offline',
    );

    if (_isOnline) {
      _startOrderListener();
    } else {
      _stopOrderListener();
    }

    _persistState();
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
    if (_activeRequest != null) {
      _declinedOrderIds.add(_activeRequest!.orderId);
    }
    _activeRequest = null;
    notifyListeners();

    // Schedule another request in 8 seconds to allow retrying
    if (_isOnline) {
      _requestTimer?.cancel();
      _requestTimer = Timer(const Duration(seconds: 8), () {
        // Fallback or request trigger
      });
    }
  }

  void acceptRequest() {
    if (_activeRequest == null) return;
    _activeOrder = _activeRequest;
    _activeRequest = null;
    _activeOrder!.status = OrderStatus.assigned;

    // Generate a 4-digit OTP for this delivery
    final int otp = 1000 + (DateTime.now().millisecondsSinceEpoch % 9000);
    final String otpStr = otp.toString();

    // Write delivery record — do NOT touch the order status table
    if (_ownerKey != null && _resolvedBranchId != null && _driver != null && _activeOrder != null) {
      final order = _activeOrder!;
      final deliveryRef = FirebaseDatabase.instance.ref(
        'delivery/$_ownerKey/$_resolvedBranchId/${_driver!.id}/${order.orderId}',
      );

      deliveryRef.set({
        'deliveryPartnerName': _driver!.name,
        'mobileNumber': _driver!.mobile,
        'otp': otpStr,
        'orderId': order.orderId,
        'branchName': order.branchName,
        'customerName': order.customerName,
        'customerPhone': order.customerPhone,
        'customerAddress': order.customerAddress,
        'paymentMode': order.paymentMode,
        'totalAmount': order.collectAmount,
        'items': order.items.map((item) => {
          'name': item.name,
          'subtitle': item.subtitle ?? '',
        }).toList(),
        'acceptedAt': ServerValue.timestamp,
        'status': 'Accepted',
      });
    }

    _updateDbStatus(delivery: 'On Delivery');
    notifyListeners();
  }

  // Order lifecycle status progression
  void arriveAtRestaurant() {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedStore;
    // No Firebase status update on arrival — only advance local delivery flow
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
    if (_ownerKey != null && _resolvedBranchId != null) {
      FirebaseDatabase.instance
          .ref('order/$_ownerKey/$_resolvedBranchId/${_activeOrder!.orderId}/status')
          .set('Out For Delivery');
    }
    notifyListeners();
  }

  void arriveAtCustomer() {
    if (_activeOrder == null) return;
    _activeOrder!.status = OrderStatus.arrivedCustomer;
    if (_ownerKey != null && _resolvedBranchId != null) {
      FirebaseDatabase.instance
          .ref('order/$_ownerKey/$_resolvedBranchId/${_activeOrder!.orderId}/status')
          .set('Arrived Customer');
    }
    notifyListeners();
  }

  void captureProof(String path) {
    if (_activeOrder == null) return;
    _activeOrder!.proofImagePath = path;
    notifyListeners();
  }

  Future<bool> verifyOtp(String code) async {
    if (_activeOrder == null || _ownerKey == null || _resolvedBranchId == null || _driver == null) return false;
    
    try {
      final deliveryRef = FirebaseDatabase.instance.ref(
        'delivery/$_ownerKey/$_resolvedBranchId/${_driver!.id}/${_activeOrder!.orderId}/otp',
      );
      final snapshot = await deliveryRef.get();
      if (snapshot.exists && snapshot.value?.toString() == code) {
        _activeOrder!.isOtpVerified = true;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error verifying OTP: $e');
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
    if (_ownerKey != null && _resolvedBranchId != null) {
      FirebaseDatabase.instance
          .ref('order/$_ownerKey/$_resolvedBranchId/${_activeOrder!.orderId}/status')
          .set('Delivered');
    }

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
    _updateDbStatus(delivery: 'IDLE');

    notifyListeners();
  }

  // Profile Edit
  void updateProfile(String name, String mobile) {
    if (_driver == null) return;
    _driver = _driver!.copyWith(name: name, mobile: mobile);
    notifyListeners();
  }
}
