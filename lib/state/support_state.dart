import 'package:flutter/material.dart';
import '../data/models/support_ticket.dart';
import '../data/repositories/mock_repositories.dart';

class SupportState extends ChangeNotifier {
  final SupportRepository _supportRepository = SupportRepository();

  List<SupportTicket> _tickets = [];
  bool _isLoading = false;

  List<SupportTicket> get tickets => _tickets;
  bool get isLoading => _isLoading;

  Future<void> loadTickets() async {
    _isLoading = true;
    notifyListeners();

    try {
      _tickets = await _supportRepository.getTickets();
    } catch (e) {
      print('Error loading support tickets: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<SupportTicket> createTicket(String branchId, String message) async {
    _isLoading = true;
    notifyListeners();

    try {
      final ticket = await _supportRepository.createTicket(branchId, message);
      _tickets.insert(0, ticket);
      return ticket;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
