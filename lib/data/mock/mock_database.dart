import '../models/food_item.dart';
import '../models/coupon.dart';
import '../models/address.dart';
import '../models/order.dart';

class MockDatabase {
  // Simulated database table: user_customer
  static final Map<String, Map<String, dynamic>> userCustomerTable = {};
  static String? currentUserId;
  static String? currentAdminId;

  static final List<String> categories = ['All'];

  static final List<FoodItem> foodItems = [];

  static final List<Coupon> coupons = [];

  static final List<Address> initialAddresses = [];

  static final List<OrderModel> initialOrders = [];
}
