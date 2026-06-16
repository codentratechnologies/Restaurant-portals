import { useState, useEffect } from 'react';

export function useDashboardData() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('Daily');
  const [validationError, setValidationError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isManager, setIsManager] = useState(true);

  // Connection Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sporadic connection drops
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Validation
  useEffect(() => {
    setValidationError('');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      setValidationError('Start date cannot exceed end date.');
    } else if (end > today) {
      setValidationError('Future dates are not allowed.');
    } else {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        setValidationError('Maximum range is 90 days.');
      }
    }
  }, [startDate, endDate]);

  return {
    startDate, setStartDate,
    endDate, setEndDate,
    period, setPeriod,
    validationError,
    isConnected,
    isManager, setIsManager
  };
}
