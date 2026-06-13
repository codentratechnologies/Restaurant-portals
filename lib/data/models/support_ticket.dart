class SupportTicket {
  final String id;
  final String customerId;
  final String customerName;
  final String branchId;
  final String adminId;
  final String message;
  final String status;
  final DateTime createdAt;

  SupportTicket({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.branchId,
    required this.adminId,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  SupportTicket copyWith({
    String? id,
    String? customerId,
    String? customerName,
    String? branchId,
    String? adminId,
    String? message,
    String? status,
    DateTime? createdAt,
  }) {
    return SupportTicket(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      branchId: branchId ?? this.branchId,
      adminId: adminId ?? this.adminId,
      message: message ?? this.message,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'branchId': branchId,
      'adminId': adminId,
      'message': message,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SupportTicket.fromMap(String id, Map<dynamic, dynamic> map) {
    return SupportTicket(
      id: id,
      customerId: map['customerId']?.toString() ?? '',
      customerName: map['customerName']?.toString() ?? '',
      branchId: map['branchId']?.toString() ?? '',
      adminId: map['adminId']?.toString() ?? '',
      message: map['message']?.toString() ?? '',
      status: map['status']?.toString() ?? 'Open',
      createdAt: DateTime.tryParse(map['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
