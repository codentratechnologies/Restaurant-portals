import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../state/support_state.dart';
import '../../state/branch_state.dart';
import '../../data/models/support_ticket.dart';
import 'package:intl/intl.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SupportState>(context, listen: false).loadTickets();
      Provider.of<BranchState>(context, listen: false).loadBranches();
    });
  }

  Future<void> _onRefresh() async {
    await Provider.of<SupportState>(context, listen: false).loadTickets();
  }

  void _showNewTicketModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const NewTicketBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final supportState = Provider.of<SupportState>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Help & Support',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _onRefresh,
        child: supportState.isLoading && supportState.tickets.isEmpty
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : supportState.tickets.isEmpty
                ? _buildEmptyState(context, isDark)
                : _buildTicketsList(context, supportState.tickets, isDark),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        onPressed: () => _showNewTicketModal(context),
        icon: const Icon(Icons.add_comment_rounded, color: Colors.white),
        label: Text(
          'Raise Ticket',
          style: AppTypography.outfit(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.symmetric(horizontal: 32),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.support_agent_rounded,
                size: 80,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Support Tickets Yet',
              style: AppTypography.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Need assistance with your orders? Raise a new support ticket and our team will resolve it promptly.',
              textAlign: TextAlign.center,
              style: AppTypography.inter(
                fontSize: 14,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () => _showNewTicketModal(context),
              child: Text(
                'Create First Ticket',
                style: AppTypography.outfit(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTicketsList(BuildContext context, List<SupportTicket> tickets, bool isDark) {
    final branchState = Provider.of<BranchState>(context, listen: false);

    return ListView.builder(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 88),
      itemCount: tickets.length,
      itemBuilder: (context, index) {
        final ticket = tickets[index];

        // Find branch name
        String branchName = 'Unknown Branch';
        try {
          final matched = branchState.branches.firstWhere((b) => b.id == ticket.branchId);
          branchName = matched.name;
        } catch (_) {}

        final isClosed = ticket.status.toLowerCase() == 'resolved';
        final statusColor = isClosed ? AppColors.success : AppColors.primary;

        final formattedDate = DateFormat('dd MMM yyyy, hh:mm a').format(ticket.createdAt);

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Ticket #${ticket.id.split('-').last}',
                      style: AppTypography.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ticket.status,
                        style: AppTypography.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Branch: $branchName',
                  style: AppTypography.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formattedDate,
                  style: AppTypography.inter(
                    fontSize: 11,
                    color: isDark ? AppColors.darkTextSecondary.withOpacity(0.7) : AppColors.lightTextSecondary.withOpacity(0.7),
                  ),
                ),
                const Divider(height: 24),
                Text(
                  ticket.message,
                  style: AppTypography.inter(
                    fontSize: 14,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class NewTicketBottomSheet extends StatefulWidget {
  const NewTicketBottomSheet({super.key});

  @override
  State<NewTicketBottomSheet> createState() => _NewTicketBottomSheetState();
}

class _NewTicketBottomSheetState extends State<NewTicketBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedBranchId;
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitTicket() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBranchId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a branch')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final supportState = Provider.of<SupportState>(context, listen: false);
      await supportState.createTicket(_selectedBranchId!, _messageController.text);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Support ticket raised successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit ticket: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final branchState = Provider.of<BranchState>(context);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Raise Support Ticket',
                  style: AppTypography.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Select Branch',
              style: AppTypography.outfit(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedBranchId,
              hint: Text(
                'Choose restaurant branch',
                style: AppTypography.inter(
                  fontSize: 14,
                  color: isDark ? AppColors.darkTextSecondary.withOpacity(0.7) : AppColors.lightTextSecondary.withOpacity(0.7),
                ),
              ),
              decoration: InputDecoration(
                filled: true,
                fillColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
              dropdownColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              style: AppTypography.inter(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
              items: branchState.branches.map((b) {
                return DropdownMenuItem<String>(
                  value: b.id,
                  child: Text(b.name),
                );
              }).toList(),
              onChanged: (val) {
                setState(() => _selectedBranchId = val);
              },
              validator: (val) => val == null ? 'Please select a branch' : null,
            ),
            const SizedBox(height: 20),
            Text(
              'Describe your Issue / Message',
              style: AppTypography.outfit(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _messageController,
              maxLines: 4,
              keyboardType: TextInputType.multiline,
              style: AppTypography.inter(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'What issue are you facing with your order?',
                hintStyle: AppTypography.inter(
                  fontSize: 14,
                  color: isDark ? AppColors.darkTextSecondary.withOpacity(0.7) : AppColors.lightTextSecondary.withOpacity(0.7),
                ),
                filled: true,
                fillColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
              validator: (val) {
                if (val == null || val.trim().isEmpty) {
                  return 'Please write your message';
                }
                if (val.trim().length < 10) {
                  return 'Please describe the issue in at least 10 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              onPressed: _isSubmitting ? null : _submitTicket,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      'Submit Support Ticket',
                      style: AppTypography.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
