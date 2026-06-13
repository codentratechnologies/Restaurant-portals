import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as latlong;
import 'package:http/http.dart' as http;
import '../../core/theme.dart';
import '../../core/state.dart';
import '../../core/models.dart';
import 'collect_payment_screen.dart';

class AcceptedOrderScreen extends StatefulWidget {
  const AcceptedOrderScreen({super.key});

  @override
  State<AcceptedOrderScreen> createState() => _AcceptedOrderScreenState();
}

class _AcceptedOrderScreenState extends State<AcceptedOrderScreen> {
  final List<TextEditingController> _otpControllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(4, (_) => FocusNode());
  bool _isVerifyingOtp = false;
  String? _otpError;
  bool _isPhotoMocking = false;

  StreamSubscription<Position>? _positionSubscription;
  double _distanceToBranch = 999999.0;
  bool _isLoadingLocation = true;
  String? _locationError;
  double? _driverLatitude;
  double? _driverLongitude;

  // Map controller for programmatic camera
  final MapController _mapController = MapController();
  List<latlong.LatLng> _routePoints = [];
  bool _isLoadingRoute = false;

  // 5-second timer to enable Arrived At Restaurant button
  bool _arrivedButtonEnabled = false;
  int _arrivedCountdown = 5;
  Timer? _arrivedTimer;

  @override
  void initState() {
    super.initState();
    _startLocationTracking();
    _startArrivedTimer();
  }

  void _startArrivedTimer() {
    _arrivedCountdown = 5;
    _arrivedButtonEnabled = false;
    _arrivedTimer?.cancel();
    _arrivedTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _arrivedCountdown--;
        if (_arrivedCountdown <= 0) {
          _arrivedButtonEnabled = true;
          timer.cancel();
        }
      });
    });
  }

  void _startLocationTracking() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locationError = 'Location services are disabled.';
          _isLoadingLocation = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _locationError = 'Location permissions are denied.';
            _isLoadingLocation = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _locationError = 'Location permissions permanently denied.';
          _isLoadingLocation = false;
        });
        return;
      }

      setState(() {
        _isLoadingLocation = true;
        _locationError = null;
      });

      // Get initial position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      _updateDistance(position);
      _fetchRoute();

      // Listen to position changes
      _positionSubscription = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 5,
        ),
      ).listen((Position position) {
        _updateDistance(position);
        // Re-fetch route every 100m of driver movement
        _fetchRoute();
      }, onError: (e) {
        debugPrint('Location stream error: $e');
      });
    } catch (e) {
      setState(() {
        _locationError = 'Failed to get location: $e';
        _isLoadingLocation = false;
      });
    }
  }

  void _updateDistance(Position driverPos) {
    final state = AppState();
    double branchLat = state.branchLatitude ?? 12.9716;
    double branchLng = state.branchLongitude ?? 77.5946;

    double distance = Geolocator.distanceBetween(
      driverPos.latitude,
      driverPos.longitude,
      branchLat,
      branchLng,
    );

    if (mounted) {
      setState(() {
        _driverLatitude = driverPos.latitude;
        _driverLongitude = driverPos.longitude;
        _distanceToBranch = distance;
        _isLoadingLocation = false;
      });
      // Move map camera to driver position
      try {
        _mapController.move(
          latlong.LatLng(driverPos.latitude, driverPos.longitude),
          _mapController.camera.zoom,
        );
      } catch (_) {}
    }
  }

  // Fetch road route from OSRM (open-source routing, no API key needed)
  Future<void> _fetchRoute() async {
    if (_driverLatitude == null || _driverLongitude == null) return;
    final state = AppState();
    final order = state.activeOrder;

    double destLat, destLng;
    bool isTransit = order?.status == OrderStatus.pickedUp ||
        order?.status == OrderStatus.arrivedCustomer;

    if (isTransit) {
      // Use customer location — offset from branch as mock since we don't have real customer coords
      destLat = (state.branchLatitude ?? 12.9716) + 0.012;
      destLng = (state.branchLongitude ?? 77.5946) + 0.012;
    } else {
      destLat = state.branchLatitude ?? 12.9716;
      destLng = state.branchLongitude ?? 77.5946;
    }

    if (_isLoadingRoute) return;
    setState(() => _isLoadingRoute = true);

    try {
      final url =
          'https://router.project-osrm.org/route/v1/driving/$_driverLongitude,$_driverLatitude;$destLng,$destLat?overview=full&geometries=geojson';
      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final coords = data['routes']?[0]?['geometry']?['coordinates'] as List?;
        if (coords != null) {
          final points = coords
              .map((c) => latlong.LatLng((c[1] as num).toDouble(), (c[0] as num).toDouble()))
              .toList();
          if (mounted) {
            setState(() {
              _routePoints = points;
              _isLoadingRoute = false;
            });
          }
          return;
        }
      }
    } catch (e) {
      debugPrint('OSRM route fetch error: $e');
    }

    // Fallback: straight line if routing fails
    if (mounted) {
      setState(() {
        _routePoints = [
          latlong.LatLng(_driverLatitude!, _driverLongitude!),
          latlong.LatLng(destLat, destLng),
        ];
        _isLoadingRoute = false;
      });
    }
  }

  void _stopLocationTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
  }

  void _stopArrivedTimer() {
    _arrivedTimer?.cancel();
    _arrivedTimer = null;
  }

  @override
  void dispose() {
    _stopLocationTracking();
    _stopArrivedTimer();
    _mapController.dispose();
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _otpFocusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _verifyOtp() async {
    String enteredOtp = _otpControllers.map((c) => c.text).join();
    if (enteredOtp.length < 4) {
      setState(() {
        _otpError = 'Please enter complete 4-digit OTP';
      });
      return;
    }

    setState(() {
      _isVerifyingOtp = true;
      _otpError = null;
    });

    final state = AppState();
    bool isSuccess = await state.verifyOtp(enteredOtp);

    if (!mounted) return;

    setState(() {
      _isVerifyingOtp = false;
    });

    if (!isSuccess) {
      setState(() {
        _otpError = 'Invalid OTP code.';
        // Shake effect mock: clear fields
        for (var controller in _otpControllers) {
          controller.clear();
        }
        _otpFocusNodes[0].requestFocus();
      });
    }
  }

  void _mockCameraCapture() {
    setState(() {
      _isPhotoMocking = true;
    });

    // Simulate opening native camera shutter speed
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      final state = AppState();
      state.captureProof('assets/images/mock_delivery_proof.jpg'); // Saved mock proof
      setState(() {
        _isPhotoMocking = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Delivery proof captured successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;
    final cardBg = isDark ? AppColors.darkSurface : AppColors.lightSurface;

    return ListenableBuilder(
      listenable: AppState(),
      builder: (context, _) {
        final state = AppState();
        final order = state.activeOrder;

        if (order == null) {
          return const Scaffold(
            body: Center(child: Text('No active order')),
          );
        }

        // OTP Success check
        bool otpVerified = order.isOtpVerified;
        bool hasPhotoProof = order.proofImagePath != null;


        return Scaffold(
          appBar: AppBar(
            title: Text('Active Order ${order.orderId}'),
            centerTitle: true,
            automaticallyImplyLeading: false,
          ),
          body: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Stepper timeline
              _buildStepper(order.status),

              // Embedded Custom Map Widget (or collapsed header banner)
              if (order.status != OrderStatus.arrivedCustomer)
                Expanded(
                  flex: 3,
                  child: _buildMockMap(order.status),
                )
                else
                  Container(
                    padding: const EdgeInsets.all(12),
                    color: AppColors.primary.withOpacity(0.08),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.check_circle_outline, color: AppColors.primary, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Arrived at Customer Location: Verify Hand-off',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),

                // Active details view scrollable list
                Expanded(
                  flex: 4,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Phase details
                        if (order.status == OrderStatus.assigned) ...[
                          _buildSectionHeader(context, 'Store Pickup Details'),
                          const SizedBox(height: 10),
                          _buildInfoCard(
                            context,
                            title: order.branchName,
                            subtitle: 'Pickup Address: ${state.branchAddress ?? 'Branch Address not specified'}',
                            icon: Icons.storefront,
                            trailing: _isLoadingLocation
                                ? 'Calculating...'
                                : _distanceToBranch >= 1000.0
                                    ? '${(_distanceToBranch / 1000).toStringAsFixed(1)} KM away'
                                    : '${_distanceToBranch.toStringAsFixed(0)}m away',
                          ),
                          const SizedBox(height: 16),
                          if (_locationError != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.danger.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.error_outline, color: AppColors.danger, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _locationError!,
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.danger,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          if (_arrivedButtonEnabled) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.success.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.success.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Ready to check in at restaurant.',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.success,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ] else ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.timer_outlined, color: AppColors.warning, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Button enables in $_arrivedCountdown second${_arrivedCountdown == 1 ? '' : 's'}...',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.warning,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _arrivedButtonEnabled
                                  ? () {
                                      state.arriveAtRestaurant();
                                    }
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.success,
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: isDark ? Colors.white10 : Colors.black.withOpacity(0.06),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: Text(
                                'ARRIVED AT RESTAURANT',
                                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ] else if (order.status == OrderStatus.arrivedStore) ...[
                        _buildSectionHeader(context, 'Verify Items Checklist'),
                        const SizedBox(height: 4),
                        Text(
                          'Scan and confirm items are packed correctly:',
                          style: theme.textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12),
                        Material(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          clipBehavior: Clip.antiAlias,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                              ),
                            ),
                            child: Column(
                              children: List.generate(
                                order.items.length,
                                (index) {
                                  final item = order.items[index];
                                  return CheckboxListTile(
                                    value: item.isChecked,
                                    onChanged: (_) {
                                      state.toggleChecklistItem(index);
                                    },
                                    activeColor: AppColors.success,
                                    title: Text(
                                      item.name,
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: textPrimary,
                                        decoration: item.isChecked
                                            ? TextDecoration.lineThrough
                                            : null,
                                      ),
                                    ),
                                    subtitle: item.subtitle != null
                                        ? Text(item.subtitle!, style: GoogleFonts.inter(fontSize: 12))
                                        : null,
                                    controlAffinity: ListTileControlAffinity.leading,
                                    contentPadding: EdgeInsets.zero,
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Icon(Icons.info_outline, color: AppColors.success, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              'Kitchen Status: Order Ready for Pickup',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: state.areAllItemsChecked()
                                ? () => state.confirmPickup()
                                : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success,
                              foregroundColor: Colors.white,
                              disabledBackgroundColor: Colors.grey.withOpacity(0.15),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                              'CONFIRM PICK UP',
                              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ] else if (order.status == OrderStatus.pickedUp) ...[
                        _buildSectionHeader(context, 'Delivery Destination'),
                        const SizedBox(height: 10),
                        _buildInfoCard(
                          context,
                          title: order.customerName,
                          subtitle: order.customerAddress,
                          icon: Icons.location_on_outlined,
                          trailing: '${order.customerDistance} KM away',
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: () {
                              state.arriveAtCustomer();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                              'ARRIVED AT CUSTOMER',
                              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ] else if (order.status == OrderStatus.arrivedCustomer) ...[
                        // Customer Hand-off View
                        _buildSectionHeader(context, 'Customer Details'),
                        const SizedBox(height: 8),
                        Text(
                          'Name: ${order.customerName}',
                          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Address: ${order.customerAddress}',
                          style: GoogleFonts.inter(fontSize: 13, color: textSecondary),
                        ),
                        const Divider(height: 24),

                        // Proof of delivery photo
                        _buildSectionHeader(context, 'Delivery Proof Photo'),
                        const SizedBox(height: 10),
                        if (!hasPhotoProof)
                          SizedBox(
                            height: 120,
                            child: OutlinedButton(
                              onPressed: _isPhotoMocking ? null : _mockCameraCapture,
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: AppColors.primary.withOpacity(0.5), width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: _isPhotoMocking
                                  ? const Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        CircularProgressIndicator(strokeWidth: 2.5),
                                        SizedBox(height: 8),
                                        Text('Opening Camera Shutter...'),
                                      ],
                                    )
                                  : Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.camera_alt_outlined, size: 36, color: AppColors.primary),
                                        const SizedBox(height: 8),
                                        Text(
                                          '📷 CAPTURE PHOTO PROOF',
                                          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: AppColors.primary),
                                        ),
                                        Text(
                                          'Take a snap at customer doorstep',
                                          style: GoogleFonts.inter(fontSize: 11, color: textSecondary),
                                        ),
                                      ],
                                    ),
                            ),
                          )
                        else
                          Container(
                            height: 160,
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.success.withOpacity(0.3)),
                            ),
                            child: Stack(
                              children: [
                                // Mock capture photo box
                                Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.image, size: 48, color: AppColors.success),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Doorstep photo captured',
                                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: AppColors.success),
                                      ),
                                      Text(
                                        'proof_image_99018.jpg',
                                        style: GoogleFonts.inter(fontSize: 11, color: textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Positioned(
                                  top: 10,
                                  right: 10,
                                  child: CircleAvatar(
                                    backgroundColor: AppColors.danger.withOpacity(0.1),
                                    child: IconButton(
                                      icon: const Icon(Icons.delete, color: AppColors.danger, size: 20),
                                      onPressed: () {
                                        state.captureProof(''); // Remove
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        const Divider(height: 32),

                        // OTP Verification
                        _buildSectionHeader(context, 'Customer OTP Verification'),
                        const SizedBox(height: 10),
                        if (!otpVerified) ...[
                          Text(
                            'Enter the 4-digit code provided by the customer:',
                            style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: List.generate(
                              4,
                              (index) => SizedBox(
                                width: 56,
                                child: TextField(
                                  controller: _otpControllers[index],
                                  focusNode: _otpFocusNodes[index],
                                  autofocus: index == 0,
                                  keyboardType: TextInputType.number,
                                  textAlign: TextAlign.center,
                                  maxLength: 1,
                                  style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold),
                                  decoration: InputDecoration(
                                    counterText: '',
                                    filled: true,
                                    fillColor: isDark ? AppColors.darkBg : Colors.black.withOpacity(0.02),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide.none,
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                                    ),
                                  ),
                                  onChanged: (value) {
                                    if (value.isNotEmpty && index < 3) {
                                      _otpFocusNodes[index + 1].requestFocus();
                                    } else if (value.isEmpty && index > 0) {
                                      _otpFocusNodes[index - 1].requestFocus();
                                    }
                                  },
                                ),
                              ),
                            ),
                          ),
                          if (_otpError != null) ...[
                            const SizedBox(height: 8),
                            Center(
                              child: Text(
                                _otpError!,
                                style: const TextStyle(color: AppColors.danger, fontSize: 13, fontFamily: 'Inter'),
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 48,
                            child: OutlinedButton(
                              onPressed: _isVerifyingOtp ? null : _verifyOtp,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.primary),
                                foregroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: _isVerifyingOtp
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : Text(
                                      'VERIFY OTP',
                                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
                                    ),
                            ),
                          ),
                        ] else
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle, color: AppColors.success),
                                const SizedBox(width: 8),
                                Text(
                                  'OTP Handshake Verified',
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.success,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        const SizedBox(height: 32),

                        // Complete Actions (Prepaid vs COD)
                        if (order.paymentMode == 'COD' && !order.isPaid)
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: (otpVerified && hasPhotoProof)
                                  ? () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const CollectPaymentScreen(),
                                        ),
                                      );
                                    }
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.warning,
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: Colors.grey.withOpacity(0.15),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: Text(
                                'COLLECT COD PAYMENT (₹${order.collectAmount})',
                                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ),
                          )
                        else
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: (otpVerified && hasPhotoProof)
                                  ? () {
                                      state.completeDelivery();
                                    }
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.success,
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: Colors.grey.withOpacity(0.15),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: Text(
                                order.paymentMode == 'COD' ? 'COMPLETE COD DELIVERY' : 'COMPLETE DELIVERY',
                                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
      );
      },
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppColors.lightTextPrimary,
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required String trailing,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.04)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            trailing,
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildStepper(OrderStatus status) {
    int activeIndex = 0;
    if (status == OrderStatus.arrivedStore) activeIndex = 1;
    if (status == OrderStatus.pickedUp) activeIndex = 2;
    if (status == OrderStatus.arrivedCustomer) activeIndex = 3;

    final steps = ['Assigned', 'At Store', 'Transit', 'Hand-off'];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: const BoxDecoration(
        color: Colors.transparent,
        border: Border(bottom: BorderSide(color: Colors.white10, width: 0.5)),
      ),
      child: Row(
        children: List.generate(
          steps.length,
          (index) {
            final isCompleted = index < activeIndex;
            final isActive = index == activeIndex;
            final stepColor = isCompleted
                ? AppColors.success
                : (isActive ? AppColors.primary : Colors.grey.withOpacity(0.4));

            return Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isCompleted ? AppColors.success : (isActive ? AppColors.primary : Colors.transparent),
                            border: Border.all(color: stepColor, width: 2.0),
                          ),
                          child: Center(
                            child: isCompleted
                                ? const Icon(Icons.check, size: 12, color: Colors.white)
                                : Text(
                                    '${index + 1}',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isActive ? Colors.white : stepColor,
                                    ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          steps[index],
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isActive || isCompleted ? FontWeight.bold : FontWeight.normal,
                            color: stepColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (index < steps.length - 1)
                    Container(
                      width: 16,
                      height: 2,
                      color: isCompleted ? AppColors.success : Colors.grey.withOpacity(0.2),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // Draw dynamic OpenStreetMap/Mapbox tiles map using flutter_map
  Widget _buildMockMap(OrderStatus status) {
    final state = AppState();
    double branchLat = state.branchLatitude ?? 12.9716;
    double branchLng = state.branchLongitude ?? 77.5946;

    // Always use real driver GPS
    double driverLat = _driverLatitude ?? (branchLat - 0.008);
    double driverLng = _driverLongitude ?? (branchLng - 0.008);

    double destLat;
    double destLng;
    bool isTransit = status == OrderStatus.pickedUp || status == OrderStatus.arrivedCustomer;

    if (isTransit) {
      // Customer location: offset from branch (mock, since real customer coords not in order model)
      destLat = branchLat + 0.012;
      destLng = branchLng + 0.012;
    } else {
      destLat = branchLat;
      destLng = branchLng;
    }

    final driverPoint = latlong.LatLng(driverLat, driverLng);
    final destPoint = latlong.LatLng(destLat, destLng);

    // Use OSRM route if available, otherwise straight line
    final List<latlong.LatLng> polylinePoints = _routePoints.isNotEmpty
        ? _routePoints
        : [driverPoint, destPoint];

    // Center between driver and destination
    final centerLat = (driverLat + destLat) / 2;
    final centerLng = (driverLng + destLng) / 2;
    final mapCenter = latlong.LatLng(centerLat, centerLng);

    return Container(
      color: Colors.grey.shade900,
      child: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: mapCenter,
              initialZoom: 14.0,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.dineos.delivery',
              ),
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: polylinePoints,
                    color: AppColors.primary,
                    strokeWidth: 5.0,
                    borderColor: AppColors.primary.withOpacity(0.3),
                    borderStrokeWidth: 10.0,
                  ),
                ],
              ),
              MarkerLayer(
                markers: [
                  // Driver marker (live GPS)
                  Marker(
                    point: driverPoint,
                    width: 48,
                    height: 48,
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.success.withOpacity(0.2),
                        border: Border.all(color: AppColors.success, width: 2),
                      ),
                      child: const Icon(
                        Icons.navigation,
                        color: AppColors.success,
                        size: 24,
                      ),
                    ),
                  ),
                  // Destination marker (branch or customer)
                  Marker(
                    point: destPoint,
                    width: 48,
                    height: 48,
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: (isTransit ? AppColors.danger : AppColors.warning).withOpacity(0.2),
                        border: Border.all(
                          color: isTransit ? AppColors.danger : AppColors.warning,
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        isTransit ? Icons.home : Icons.storefront,
                        color: isTransit ? AppColors.danger : AppColors.warning,
                        size: 24,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Route label overlay
          Positioned(
            top: 12,
            left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isTransit ? Icons.home : Icons.storefront,
                    color: isTransit ? AppColors.danger : AppColors.warning,
                    size: 14,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isTransit ? 'Route: Store ➔ Customer' : 'Route: You ➔ Restaurant',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Distance badge
          Positioned(
            top: 12,
            right: 56,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _isLoadingLocation
                    ? 'Locating...'
                    : _distanceToBranch >= 1000
                        ? '${(_distanceToBranch / 1000).toStringAsFixed(1)} km'
                        : '${_distanceToBranch.toStringAsFixed(0)} m',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          // Route loading indicator
          if (_isLoadingRoute)
            Positioned(
              bottom: 52,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                    ),
                    SizedBox(width: 6),
                    Text('Loading route...', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ],
                ),
              ),
            ),
          // GPS recenter button
          Positioned(
            bottom: 12,
            right: 12,
            child: GestureDetector(
              onTap: () {
                if (_driverLatitude != null && _driverLongitude != null) {
                  _mapController.move(
                    latlong.LatLng(_driverLatitude!, _driverLongitude!),
                    15.0,
                  );
                }
                _startLocationTracking();
              },
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.8),
                radius: 20,
                child: const Icon(Icons.my_location, color: AppColors.primary, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


// Custom Painter to draw a map grid beautifully
class MapPainter extends CustomPainter {
  final OrderStatus status;
  MapPainter({required this.status});

  @override
  void paint(Canvas canvas, Size size) {
    final isStorePhase = status == OrderStatus.assigned || status == OrderStatus.arrivedStore;

    // Draw grid lines
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1.0;

    const double step = 30.0;
    for (double i = 0; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double i = 0; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), gridPaint);
    }

    // Draw simulated road lines
    final roadPaint = Paint()
      ..color = Colors.white.withOpacity(0.12)
      ..strokeWidth = 12.0
      ..strokeCap = StrokeCap.round;

    final roadBorderPaint = Paint()
      ..color = Colors.black38
      ..strokeWidth = 16.0
      ..strokeCap = StrokeCap.round;

    final pathPoints = [
      Offset(40, size.height * 0.7),
      Offset(size.width * 0.4, size.height * 0.7),
      Offset(size.width * 0.4, size.height * 0.3),
      Offset(size.width * 0.85, size.height * 0.3),
    ];

    // Paint roads with black shadow borders and grey center lane
    for (int i = 0; i < pathPoints.length - 1; i++) {
      canvas.drawLine(pathPoints[i], pathPoints[i + 1], roadBorderPaint);
      canvas.drawLine(pathPoints[i], pathPoints[i + 1], roadPaint);
    }

    // Draw route path line
    final routePaint = Paint()
      ..color = AppColors.primary.withOpacity(0.8)
      ..strokeWidth = 4.0
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    final routePath = Path();
    routePath.moveTo(pathPoints[0].dx, pathPoints[0].dy);
    for (var point in pathPoints) {
      routePath.lineTo(point.dx, point.dy);
    }
    canvas.drawPath(routePath, routePaint);

    // Draw Target Location Node (Restaurant or Customer Home)
    final targetOffset = pathPoints[3];
    final targetPaint = Paint()
      ..color = isStorePhase ? AppColors.warning : AppColors.danger
      ..style = PaintingStyle.fill;

    // Draw ripple pulse animation simulation
    canvas.drawCircle(targetOffset, 16.0, Paint()..color = (isStorePhase ? AppColors.warning : AppColors.danger).withOpacity(0.25));
    canvas.drawCircle(targetOffset, 8.0, targetPaint);

    // Draw target symbol icon
    final targetIcon = isStorePhase ? Icons.storefront : Icons.home;
    TextPainter textPainter = TextPainter(textDirection: TextDirection.ltr);
    textPainter.text = TextSpan(
      text: String.fromCharCode(targetIcon.codePoint),
      style: TextStyle(
        fontSize: 12,
        fontFamily: targetIcon.fontFamily,
        package: targetIcon.fontPackage,
        color: Colors.white,
      ),
    );
    textPainter.layout();
    textPainter.paint(canvas, Offset(targetOffset.dx - 6, targetOffset.dy - 6));

    // Draw Driver Icon Node
    // Determine driver position based on status
    Offset driverOffset;
    if (status == OrderStatus.assigned) {
      driverOffset = Offset(size.width * 0.4, size.height * 0.5); // Midway to store
    } else if (status == OrderStatus.arrivedStore) {
      driverOffset = pathPoints[3]; // At store
    } else {
      // Out for delivery transit midway to customer
      driverOffset = Offset(size.width * 0.65, size.height * 0.3);
    }

    final driverPaint = Paint()
      ..color = AppColors.success
      ..style = PaintingStyle.fill;

    canvas.drawCircle(driverOffset, 14.0, Paint()..color = AppColors.success.withOpacity(0.3));
    canvas.drawCircle(driverOffset, 7.0, driverPaint);

    // Draw driver navigation arrow icon
    textPainter.text = TextSpan(
      text: String.fromCharCode(Icons.navigation.codePoint),
      style: TextStyle(
        fontSize: 10,
        fontFamily: Icons.navigation.fontFamily,
        package: Icons.navigation.fontPackage,
        color: Colors.white,
      ),
    );
    textPainter.layout();
    textPainter.paint(canvas, Offset(driverOffset.dx - 5, driverOffset.dy - 5));
  }

  @override
  bool shouldRepaint(covariant MapPainter oldDelegate) {
    return oldDelegate.status != status;
  }
}
