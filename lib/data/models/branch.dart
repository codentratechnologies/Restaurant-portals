class Branch {
  final String id;
  final String name;
  final String address;
  final String city;
  final List<String> assignedMenuIds;
  final bool isActive;
  final String? adminId;
  final String? googleMapUrl;
  final Map<String, bool> menuAvailability;
  double? _latitude;
  double? _longitude;

  Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.assignedMenuIds,
    required this.isActive,
    this.adminId,
    this.googleMapUrl,
    this.menuAvailability = const {},
    double? latitude,
    double? longitude,
  }) : _latitude = latitude,
       _longitude = longitude;

  factory Branch.fromMap(String id, Map<dynamic, dynamic> map, {String? adminId}) {
    final menuIds = map['assigned_menu_ids'] as List? ?? [];
    final menuAvailabilityRaw = map['menu_availability'] as Map? ?? {};
    final menuAvailability = Map<String, bool>.from(
      menuAvailabilityRaw.map((key, value) => MapEntry(key.toString(), value == true || value == 'true')),
    );

    return Branch(
      id: id,
      name: map['name']?.toString() ?? '',
      address: map['address']?.toString() ?? '',
      city: map['city']?.toString() ?? '',
      assignedMenuIds: List<String>.from(menuIds.map((e) => e.toString())),
      isActive: map['is_active'] ?? true,
      adminId: adminId ?? map['adminId']?.toString(),
      googleMapUrl: map['googleMapUrl']?.toString(),
      menuAvailability: menuAvailability,
      latitude: map['latitude'] != null ? double.tryParse(map['latitude'].toString()) : null,
      longitude: map['longitude'] != null ? double.tryParse(map['longitude'].toString()) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'city': city,
      'assigned_menu_ids': assignedMenuIds,
      'is_active': isActive,
      'adminId': adminId,
      'googleMapUrl': googleMapUrl,
      'menu_availability': menuAvailability,
      'latitude': _latitude,
      'longitude': _longitude,
    };
  }

  bool isItemAvailable(String foodItemId) {
    if (menuAvailability.containsKey(foodItemId)) {
      return menuAvailability[foodItemId] == true;
    }
    return true; // Default to available
  }

  double get latitude {
    if (_latitude != null) return _latitude!;
    if (city.toLowerCase().contains('mumbai')) return 19.1197;
    if (city.toLowerCase().contains('bangalore') || city.toLowerCase().contains('bengaluru')) return 12.9716;
    return 19.1197;
  }

  set latitude(double value) => _latitude = value;

  double get longitude {
    if (_longitude != null) return _longitude!;
    if (city.toLowerCase().contains('mumbai')) return 72.8468;
    if (city.toLowerCase().contains('bangalore') || city.toLowerCase().contains('bengaluru')) return 77.5946;
    return 72.8468;
  }

  set longitude(double value) => _longitude = value;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Branch && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

