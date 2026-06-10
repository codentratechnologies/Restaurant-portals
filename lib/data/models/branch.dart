class Branch {
  final String id;
  final String name;
  final String address;
  final String city;
  final List<String> assignedMenuIds;
  final bool isActive;

  Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.assignedMenuIds,
    required this.isActive,
  });

  factory Branch.fromMap(String id, Map<dynamic, dynamic> map) {
    final menuIds = map['assigned_menu_ids'] as List? ?? [];
    return Branch(
      id: id,
      name: map['name']?.toString() ?? '',
      address: map['address']?.toString() ?? '',
      city: map['city']?.toString() ?? '',
      assignedMenuIds: List<String>.from(menuIds.map((e) => e.toString())),
      isActive: map['is_active'] ?? true,
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
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Branch && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
