import '../models/food_item.dart';
import '../models/coupon.dart';
import '../models/address.dart';
import '../models/order.dart';
import '../models/cart_item.dart';

class MockDatabase {
  // Simulated database table: user_customer
  static final Map<String, Map<String, dynamic>> userCustomerTable = {};
  static String? currentUserId;


  static final List<String> categories = [
    'All',
    'Burgers',
    'Pizza',
    'Bowls',
    'Sides',
    'Desserts',
    'Beverages'
  ];

  static final List<FoodItem> foodItems = [
    FoodItem(
      id: 'food_1',
      name: 'Cheese Burst Burger',
      description: 'Juicy chicken patty loaded with oozing mozzarella cheese, crisp lettuce, fresh tomatoes, and signature spicy orange sauce in a toasted brioche bun.',
      basePrice: 8.99,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviewsCount: 124,
      category: 'Burgers',
      isVeg: false,
      customizationGroups: [
        CustomizationGroup(
          title: 'Select Size',
          isRequired: true,
          options: [
            CustomizationOption(name: 'Regular', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: 'Medium Double Patty', additionalPrice: 2.49),
            CustomizationOption(name: 'Monster Triple Patty', additionalPrice: 4.49),
          ],
        ),
        CustomizationGroup(
          title: 'Add Extra Toppings',
          isMultiSelect: true,
          options: [
            CustomizationOption(name: 'Extra Cheddar Cheese Slice', additionalPrice: 0.99),
            CustomizationOption(name: 'Crispy Bacon Strips', additionalPrice: 1.49),
            CustomizationOption(name: 'Sautéed Mushrooms', additionalPrice: 0.79),
            CustomizationOption(name: 'Caramelized Onions', additionalPrice: 0.49),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_2',
      name: 'Veggie Supreme Pizza',
      description: 'A colorful medley of bell peppers, sweet corn, red onions, black olives, fresh mushrooms, and juicy cherry tomatoes on a classic base with herb tomato sauce.',
      basePrice: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      rating: 4.6,
      reviewsCount: 88,
      category: 'Pizza',
      isVeg: true,
      customizationGroups: [
        CustomizationGroup(
          title: 'Select Size',
          isRequired: true,
          options: [
            CustomizationOption(name: 'Personal 7"', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: 'Medium 10"', additionalPrice: 4.00),
            CustomizationOption(name: 'Large 12"', additionalPrice: 7.00),
          ],
        ),
        CustomizationGroup(
          title: 'Crust Preference',
          isRequired: true,
          options: [
            CustomizationOption(name: 'Classic Hand-Tossed', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: 'Cheese Burst Crust', additionalPrice: 2.99),
            CustomizationOption(name: 'Thin & Crispy Wheat', additionalPrice: 0.99),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_3',
      name: 'Quinoa Avocado Bowl',
      description: 'Organic red and white quinoa, fresh avocado slices, edamame, shredded carrots, purple cabbage, and chickpeas, drizzled with a creamy sesame tahini dressing.',
      basePrice: 9.99,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      reviewsCount: 95,
      category: 'Bowls',
      isVeg: true,
      customizationGroups: [
        CustomizationGroup(
          title: 'Add Extra Proteins',
          isMultiSelect: true,
          options: [
            CustomizationOption(name: 'Organic Grilled Tofu', additionalPrice: 1.99),
            CustomizationOption(name: 'Extra Avocado Scoop', additionalPrice: 1.49),
            CustomizationOption(name: 'Toasted Pumpkin Seeds', additionalPrice: 0.50),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_4',
      name: 'Spicy Chicken Wings',
      description: 'Tender chicken wings tossed in our homemade honey-chili glaze, served with a side of creamy herb ranch dip.',
      basePrice: 7.49,
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
      rating: 4.5,
      reviewsCount: 110,
      category: 'Sides',
      isVeg: false,
      customizationGroups: [
        CustomizationGroup(
          title: 'Portion Size',
          isRequired: true,
          options: [
            CustomizationOption(name: '6 Pieces', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: '12 Pieces', additionalPrice: 5.99),
          ],
        ),
        CustomizationGroup(
          title: 'Dip Options',
          isMultiSelect: true,
          options: [
            CustomizationOption(name: 'Extra Ranch Dip', additionalPrice: 0.49),
            CustomizationOption(name: 'Blue Cheese Dip', additionalPrice: 0.69),
            CustomizationOption(name: 'Extra Fiery Buffalo Sauce', additionalPrice: 0.49),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_5',
      name: 'Iced Caramel Macchiato',
      description: 'Rich dark espresso poured over cold milk and sweet vanilla syrup, finished with a generous drizzle of buttery caramel sauce and ice.',
      basePrice: 4.99,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      reviewsCount: 215,
      category: 'Beverages',
      isVeg: true,
      customizationGroups: [
        CustomizationGroup(
          title: 'Select Size',
          isRequired: true,
          options: [
            CustomizationOption(name: 'Regular (12oz)', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: 'Large (16oz)', additionalPrice: 0.99),
          ],
        ),
        CustomizationGroup(
          title: 'Milk Choice',
          isRequired: true,
          options: [
            CustomizationOption(name: 'Whole Milk', additionalPrice: 0.0, isSelected: true),
            CustomizationOption(name: 'Almond Milk', additionalPrice: 0.75),
            CustomizationOption(name: 'Oat Milk', additionalPrice: 0.75),
            CustomizationOption(name: 'Soy Milk', additionalPrice: 0.50),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_6',
      name: 'Fudge Chocolate Brownie',
      description: 'Decadent chocolate brownie with a rich fudge center, loaded with chocolate chunks and served warm.',
      basePrice: 3.99,
      imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      reviewsCount: 140,
      category: 'Desserts',
      isVeg: true,
      customizationGroups: [
        CustomizationGroup(
          title: 'Serve With',
          isMultiSelect: true,
          options: [
            CustomizationOption(name: 'Vanilla Bean Ice Cream Scoop', additionalPrice: 1.49),
            CustomizationOption(name: 'Hot Fudge Sauce Drizzle', additionalPrice: 0.50),
          ],
        ),
      ],
    ),
    FoodItem(
      id: 'food_7',
      name: 'Teriyaki Salmon Bowl',
      description: 'Pan-seared glazed salmon on a bed of warm jasmine rice, steamed broccoli, edamame, and pickled cucumber, sprinkled with sesame seeds.',
      basePrice: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviewsCount: 74,
      category: 'Bowls',
      isVeg: false,
      customizationGroups: [],
    ),
  ];

  static final List<Coupon> coupons = [
    Coupon(
      code: 'DINEOS10',
      description: 'Get 10% off on your order, up to \$5. Minimum order \$15.',
      discountPercentage: 10,
      minOrderValue: 15.0,
      maxDiscount: 5.0,
    ),
    Coupon(
      code: 'FREEVIP',
      description: 'Get \$5.00 flat discount on your order. Minimum order \$20.',
      flatDiscount: 5.0,
      minOrderValue: 20.0,
      maxDiscount: 5.0,
    ),
    Coupon(
      code: 'WARMORANGE',
      description: 'Celebrate our primary Orange tone! 20% off up to \$10. Minimum order \$10.',
      discountPercentage: 20,
      minOrderValue: 10.0,
      maxDiscount: 10.0,
    ),
  ];

  static final List<Address> initialAddresses = [
    Address(
      id: 'addr_1',
      title: 'Home Sweet Home',
      addressLine: '102 Park Ave, Apt 4B, Manhattan',
      landmark: 'Near Central Park entrance',
      pinCode: '10001',
      type: 'Home',
    ),
    Address(
      id: 'addr_2',
      title: 'Google Office Hub',
      addressLine: '500 Tech Plaza, Tower B, Floor 8',
      landmark: 'Opposite Metro Station',
      pinCode: '10022',
      type: 'Work',
    ),
  ];

  static final List<OrderModel> initialOrders = [
    OrderModel(
      id: 'ORD-89472',
      items: [
        CartItem(
          id: 'item_1',
          foodItem: foodItems[0].copyWith(), // Cheese Burst Burger
          quantity: 2,
        ),
        CartItem(
          id: 'item_2',
          foodItem: foodItems[4].copyWith(), // Macchiato
          quantity: 1,
        ),
      ],
      orderDate: DateTime.now().subtract(const Duration(days: 2, hours: 3)),
      status: 'Delivered',
      deliveryAddress: initialAddresses[0],
      paymentMethod: 'Google Pay',
      subtotal: 22.97,
      deliveryFee: 2.00,
      tax: 1.84,
      discount: 0.0,
      total: 26.81,
    ),
    OrderModel(
      id: 'ORD-72314',
      items: [
        CartItem(
          id: 'item_3',
          foodItem: foodItems[1].copyWith(), // Pizza
          quantity: 1,
        ),
      ],
      orderDate: DateTime.now().subtract(const Duration(days: 5, hours: 6)),
      status: 'Delivered',
      deliveryAddress: initialAddresses[1],
      paymentMethod: 'Credit Card',
      subtotal: 12.99,
      deliveryFee: 3.50,
      tax: 1.04,
      discount: 2.00,
      total: 15.53,
    ),
  ];
}
