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

  Future<SupportTicket> createTicket({
    required String branchId,
    required String subject,
    required String description,
    required String issueType,
    required String priority,
    required String customerName,
    String? orderId,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final ticket = await _supportRepository.createTicket(
        branchId: branchId,
        subject: subject,
        description: description,
        issueType: issueType,
        priority: priority,
        customerName: customerName,
        orderId: orderId,
      );
      _tickets.insert(0, ticket);
      return ticket;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
