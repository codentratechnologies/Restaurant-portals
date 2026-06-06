import 'package:flutter/material.dart';
import '../data/models/address.dart';
import '../data/repositories/mock_repositories.dart';

class AddressState extends ChangeNotifier {
  final AddressRepository _addressRepository = AddressRepository();

  List<Address> _addresses = [];
  Address? _selectedAddress;
  bool _isLoading = false;

  List<Address> get addresses => _addresses;
  Address? get selectedAddress => _selectedAddress;
  bool get isLoading => _isLoading;

  AddressState() {
    loadAddresses();
  }

  Future<void> loadAddresses() async {
    _isLoading = true;
    notifyListeners();

    _addresses = await _addressRepository.getAddresses();
    if (_addresses.isNotEmpty && _selectedAddress == null) {
      _selectedAddress = _addresses.first;
    }

    _isLoading = false;
    notifyListeners();
  }

  void selectAddress(Address address) {
    _selectedAddress = address;
    notifyListeners();
  }

  Future<void> addAddress(String title, String addressLine, String landmark, String pinCode, String type) async {
    _isLoading = true;
    notifyListeners();

    final newAddress = Address(
      id: '',
      title: title,
      addressLine: addressLine,
      landmark: landmark,
      pinCode: pinCode,
      type: type,
    );

    final savedAddress = await _addressRepository.addAddress(newAddress);
    _addresses.add(savedAddress);
    if (_selectedAddress == null) {
      _selectedAddress = savedAddress;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateAddress(String id, String title, String addressLine, String landmark, String pinCode, String type) async {
    _isLoading = true;
    notifyListeners();

    final updatedAddress = Address(
      id: id,
      title: title,
      addressLine: addressLine,
      landmark: landmark,
      pinCode: pinCode,
      type: type,
    );

    final savedAddress = await _addressRepository.updateAddress(updatedAddress);
    final index = _addresses.indexWhere((element) => element.id == id);
    if (index != -1) {
      _addresses[index] = savedAddress;
    }

    if (_selectedAddress?.id == id) {
      _selectedAddress = savedAddress;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> deleteAddress(String id) async {
    _isLoading = true;
    notifyListeners();

    await _addressRepository.deleteAddress(id);
    _addresses.removeWhere((element) => element.id == id);
    if (_selectedAddress?.id == id) {
      _selectedAddress = _addresses.isNotEmpty ? _addresses.first : null;
    }

    _isLoading = false;
    notifyListeners();
  }
}
