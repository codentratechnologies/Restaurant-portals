class UserModel {
  final String id;
  final String fullName;
  final String mobileNumber;
  final String username;
  final String email;
  final String password;

  UserModel({
    required this.id,
    required this.fullName,
    required this.mobileNumber,
    required this.username,
    required this.email,
    required this.password,
  });

  UserModel copyWith({
    String? id,
    String? fullName,
    String? mobileNumber,
    String? username,
    String? email,
    String? password,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      username: username ?? this.username,
      email: email ?? this.email,
      password: password ?? this.password,
    );
  }
}
