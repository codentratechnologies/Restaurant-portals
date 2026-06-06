class Address {
  final String id;
  final String title; // Home, Office, etc.
  final String addressLine;
  final String landmark;
  final String pinCode;
  final String type; // 'Home' | 'Work' | 'Other'

  Address({
    required this.id,
    required this.title,
    required this.addressLine,
    required this.landmark,
    required this.pinCode,
    required this.type,
  });

  Address copyWith({
    String? id,
    String? title,
    String? addressLine,
    String? landmark,
    String? pinCode,
    String? type,
  }) {
    return Address(
      id: id ?? this.id,
      title: title ?? this.title,
      addressLine: addressLine ?? this.addressLine,
      landmark: landmark ?? this.landmark,
      pinCode: pinCode ?? this.pinCode,
      type: type ?? this.type,
    );
  }
}
