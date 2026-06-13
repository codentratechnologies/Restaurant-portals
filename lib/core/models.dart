enum OrderStatus {
  assigned,
  arrivedStore,
  pickedUp,
  arrivedCustomer,
  delivered
}

class DriverProfile {
  String id;
  String name;
  String username;
  String email;
  String mobile;
  String branchName;
  String shiftTime;
  double monthlySalary;
  String profilePhotoUrl;

  DriverProfile({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.mobile,
    required this.branchName,
    required this.shiftTime,
    required this.monthlySalary,
    required this.profilePhotoUrl,
  });

  DriverProfile copyWith({
    String? name,
    String? mobile,
  }) {
    return DriverProfile(
      id: id,
      name: name ?? this.name,
      username: username,
      email: email,
      mobile: mobile ?? this.mobile,
      branchName: branchName,
      shiftTime: shiftTime,
      monthlySalary: monthlySalary,
      profilePhotoUrl: profilePhotoUrl,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'mobile': mobile,
      'branchName': branchName,
      'shiftTime': shiftTime,
      'monthlySalary': monthlySalary,
      'profilePhotoUrl': profilePhotoUrl,
    };
  }

  factory DriverProfile.fromJson(Map<String, dynamic> json) {
    return DriverProfile(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      mobile: json['mobile']?.toString() ?? '',
      branchName: json['branchName']?.toString() ?? '',
      shiftTime: json['shiftTime']?.toString() ?? '',
      monthlySalary: double.tryParse(json['monthlySalary']?.toString() ?? '') ?? 0.0,
      profilePhotoUrl: json['profilePhotoUrl']?.toString() ?? '',
    );
  }
}

class ChecklistItem {
  final String name;
  final String? subtitle;
  bool isChecked;

  ChecklistItem({
    required this.name,
    this.subtitle,
    this.isChecked = false,
  });
}

class OrderModel {
  final String orderId;
  final String branchName;
  final double branchDistance; // in KM
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final double customerDistance; // in KM
  final List<ChecklistItem> items;
  final String paymentMode; // COD or Prepaid
  final double collectAmount;
  OrderStatus status;
  String? proofImagePath;
  bool isOtpVerified;
  bool isPaid;
  String? signaturePath;

  OrderModel({
    required this.orderId,
    required this.branchName,
    required this.branchDistance,
    required this.customerName,
    required this.customerPhone,
    required this.customerAddress,
    required this.customerDistance,
    required this.items,
    required this.paymentMode,
    required this.collectAmount,
    this.status = OrderStatus.assigned,
    this.proofImagePath,
    this.isOtpVerified = false,
    this.isPaid = false,
    this.signaturePath,
  });
}

class HistoryItem {
  final String orderId;
  final String customerName;
  final double amount;
  final String paymentMode;
  final String deliveredTime;
  final String date; // E.g., 'Today', 'Yesterday', etc.
  final String restaurantName;
  final String customerPhoneMasked;
  final String customerAddress;
  final List<String> itemNames;
  final String proofImagePath;

  HistoryItem({
    required this.orderId,
    required this.customerName,
    required this.amount,
    required this.paymentMode,
    required this.deliveredTime,
    required this.date,
    required this.restaurantName,
    required this.customerPhoneMasked,
    required this.customerAddress,
    required this.itemNames,
    required this.proofImagePath,
  });
}
