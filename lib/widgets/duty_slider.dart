import 'package:flutter/material.dart';
import '../core/theme.dart';

class DutySlider extends StatefulWidget {
  final bool isOnline;
  final ValueChanged<bool> onChanged;

  const DutySlider({
    super.key,
    required this.isOnline,
    required this.onChanged,
  });

  @override
  State<DutySlider> createState() => _DutySliderState();
}

class _DutySliderState extends State<DutySlider> {
  double _dragPercentage = 0.0;
  bool _isDragging = false;

  @override
  void didUpdateWidget(DutySlider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isOnline != widget.isOnline) {
      _dragPercentage = widget.isOnline ? 1.0 : 0.0;
    }
  }

  @override
  void initState() {
    super.initState();
    _dragPercentage = widget.isOnline ? 1.0 : 0.0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final trackColor = widget.isOnline
        ? AppColors.success.withOpacity(0.15)
        : AppColors.danger.withOpacity(0.15);
    final borderColor = widget.isOnline
        ? AppColors.success.withOpacity(0.4)
        : AppColors.danger.withOpacity(0.4);
    final knobColor = widget.isOnline ? AppColors.success : AppColors.danger;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;
        const double height = 56.0;
        const double knobSize = 48.0;
        final double maxDragDistance = width - knobSize - 8.0;

        double knobLeft = 4.0 + (_dragPercentage * maxDragDistance);

        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: trackColor,
            borderRadius: BorderRadius.circular(28.0),
            border: Border.all(color: borderColor, width: 1.5),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Label Text
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Text(
                  widget.isOnline ? "<< SWIPE TO GO OFFLINE" : "SWIPE TO GO ONLINE >>",
                  key: ValueKey<bool>(widget.isOnline),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: widget.isOnline ? AppColors.success : AppColors.danger,
                    letterSpacing: 1.0,
                    fontSize: 12,
                  ),
                ),
              ),

              // Knob slider
              AnimatedPositioned(
                duration: Duration(milliseconds: _isDragging ? 0 : 200),
                curve: Curves.easeOutBack, // springy feel!
                left: knobLeft,
                child: GestureDetector(
                  onHorizontalDragStart: (_) {
                    setState(() {
                      _isDragging = true;
                    });
                  },
                  onHorizontalDragUpdate: (details) {
                    setState(() {
                      // Adjust drag amount
                      double delta = details.primaryDelta ?? 0.0;
                      double change = delta / maxDragDistance;
                      _dragPercentage = (_dragPercentage + change).clamp(0.0, 1.0);
                    });
                  },
                  onHorizontalDragEnd: (details) {
                    setState(() {
                      _isDragging = false;
                      if (widget.isOnline) {
                        // Dragging left to go offline
                        if (_dragPercentage < 0.3) {
                          _dragPercentage = 0.0;
                          widget.onChanged(false);
                        } else {
                          _dragPercentage = 1.0;
                        }
                      } else {
                        // Dragging right to go online
                        if (_dragPercentage > 0.7) {
                          _dragPercentage = 1.0;
                          widget.onChanged(true);
                        } else {
                          _dragPercentage = 0.0;
                        }
                      }
                    });
                  },
                  child: Container(
                    width: knobSize,
                    height: knobSize,
                    decoration: BoxDecoration(
                      color: knobColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: knobColor.withOpacity(0.4),
                          blurRadius: 8.0,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        widget.isOnline ? Icons.chevron_left : Icons.chevron_right,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
