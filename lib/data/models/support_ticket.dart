class SupportTicket {
  final int? id;
  final String ticketId;
  final String customerId;
  final String customerName;
  final String? orderId;
  final String branchId;
  final String? adminId;
  final String subject;
  final String description;
  final String issueType;
  final String priority;
  final String status;
  final String? assignedTo;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? resolvedAt;

  SupportTicket({
    this.id,
    required this.ticketId,
    required this.customerId,
    required this.customerName,
    this.orderId,
    required this.branchId,
    this.adminId,
    required this.subject,
    required this.description,
    required this.issueType,
    required this.priority,
    required this.status,
    this.assignedTo,
    required this.createdAt,
    required this.updatedAt,
    this.resolvedAt,
  });

  SupportTicket copyWith({
    int? id,
    String? ticketId,
    String? customerId,
    String? customerName,
    String? orderId,
    String? branchId,
    String? adminId,
    String? subject,
    String? description,
    String? issueType,
    String? priority,
    String? status,
    String? assignedTo,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? resolvedAt,
  }) {
    return SupportTicket(
      id: id ?? this.id,
      ticketId: ticketId ?? this.ticketId,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      orderId: orderId ?? this.orderId,
      branchId: branchId ?? this.branchId,
      adminId: adminId ?? this.adminId,
      subject: subject ?? this.subject,
      description: description ?? this.description,
      issueType: issueType ?? this.issueType,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'ticket_id': ticketId,
      'customer_id': customerId,
      'customerName': customerName,
      'order_id': orderId,
      'branch_id': branchId,
      'adminId': adminId,
      'subject': subject,
      'description': description,
      'issue_type': issueType,
      'priority': priority,
      'status': status,
      'assigned_to': assignedTo,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'resolved_at': resolvedAt?.toIso8601String(),
    };
  }

  factory SupportTicket.fromMap(String defaultTicketId, Map<dynamic, dynamic> map) {
    return SupportTicket(
      id: map['id'] != null ? int.tryParse(map['id'].toString()) : null,
      ticketId: map['ticket_id']?.toString() ?? map['ticketId']?.toString() ?? defaultTicketId,
      customerId: map['customer_id']?.toString() ?? map['customerId']?.toString() ?? '',
      customerName: map['customerName']?.toString() ?? '',
      orderId: map['order_id']?.toString() ?? map['orderId']?.toString(),
      branchId: map['branch_id']?.toString() ?? map['branchId']?.toString() ?? '',
      adminId: map['adminId']?.toString() ?? '',
      subject: map['subject']?.toString() ?? '',
      description: map['description']?.toString() ?? map['message']?.toString() ?? '',
      issueType: map['issue_type']?.toString() ?? map['issueType']?.toString() ?? 'Other',
      priority: map['priority']?.toString() ?? 'Low',
      status: map['status']?.toString() ?? 'Open',
      assignedTo: map['assigned_to']?.toString() ?? map['assignedTo']?.toString(),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? map['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? map['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      resolvedAt: map['resolved_at'] != null ? DateTime.tryParse(map['resolved_at'].toString()) : (map['resolvedAt'] != null ? DateTime.tryParse(map['resolvedAt'].toString()) : null),
    );
  }
}
