import { useMemo } from 'react';
import { Order } from '../../../hooks/useOrders';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return { bg: '#DCFCE7', text: '#166534' }; // Green
    case 'Out for Delivery': return { bg: '#FEF3C7', text: '#92400E' }; // Yellow
    case 'Preparing': return { bg: '#F3E8FF', text: '#6B21A8' }; // Purple
    case 'Accepted': return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
    case 'Pending': return { bg: '#FEE2E2', text: '#991B1B' }; // Red
    case 'Cancelled': return { bg: '#F3F4F6', text: '#374151' }; // Gray
    default: return { bg: '#F3F4F6', text: '#374151' };
  }
};

export const useDashboardStats = (
  orders: Order[],
  branches: any[],
  menuItems: any[],
  timeFilter: string,
  customStartDate: string,
  customEndDate: string
) => {
  return useMemo(() => {
    const now = new Date();
    let filterStartDate = new Date();
    let filterEndDate = new Date();
    let daysToShow = 7;
    
    if (timeFilter === 'today') {
      daysToShow = 1;
    } else if (timeFilter === '30days') {
      filterStartDate.setDate(now.getDate() - 29);
      daysToShow = 30;
    } else if (timeFilter === '90days') {
      filterStartDate.setDate(now.getDate() - 89);
      daysToShow = 90;
    } else if (timeFilter === 'custom') {
      filterStartDate = new Date(customStartDate || now);
      filterEndDate = new Date(customEndDate || now);
      if (filterStartDate > filterEndDate) {
        const temp = filterStartDate;
        filterStartDate = filterEndDate;
        filterEndDate = temp;
      }
      daysToShow = Math.max(1, Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 3600 * 24)) + 1);
    } else {
      filterStartDate.setDate(now.getDate() - 6);
      daysToShow = 7;
    }
    
    filterStartDate.setHours(0, 0, 0, 0);
    filterEndDate.setHours(23, 59, 59, 999);

    const diffTime = filterEndDate.getTime() - filterStartDate.getTime();
    const previousEndDate = new Date(filterStartDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - diffTime);
    previousStartDate.setHours(0, 0, 0, 0);

    let trendLabel = 'vs previous period';
    if (timeFilter === 'today') trendLabel = 'vs yesterday';
    else if (timeFilter === '7days') trendLabel = 'vs last week';
    else if (timeFilter === '30days') trendLabel = 'vs last month';
    else if (timeFilter === '90days') trendLabel = 'vs last quarter';

    const filteredOrders = orders.filter(o => {
      const oDate = new Date(o.created_at);
      return oDate >= filterStartDate && oDate <= filterEndDate;
    });

    const previousOrders = orders.filter(o => {
      const oDate = new Date(o.created_at);
      return oDate >= previousStartDate && oDate <= previousEndDate;
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.billing?.total || 0), 0);
    const activeBranchesCount = branches.filter(b => b.is_active !== false && (!b.created_at || new Date(b.created_at) <= filterEndDate)).length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const prevTotalOrders = previousOrders.length;
    const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + (order.billing?.total || 0), 0);
    const prevActiveBranchesCount = branches.filter(b => b.is_active !== false && (!b.created_at || new Date(b.created_at) <= previousEndDate)).length;
    const prevAvgOrderValue = prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;

    const trends = {
      orders: calculateTrend(totalOrders, prevTotalOrders),
      revenue: calculateTrend(totalRevenue, prevTotalRevenue),
      branches: calculateTrend(activeBranchesCount, prevActiveBranchesCount),
      avgOrderValue: calculateTrend(avgOrderValue, prevAvgOrderValue)
    };

    const revenueMap: Record<string, number> = {};
    const endAnchor = timeFilter === 'custom' ? filterEndDate : now;
    endAnchor.setHours(0, 0, 0, 0);
    
    if (daysToShow > 60) {
      const weeksCount = Math.ceil(daysToShow / 7);
      for (let i = weeksCount - 1; i >= 0; i--) {
        const d = new Date(endAnchor);
        d.setDate(d.getDate() - (i * 7));
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        revenueMap[label] = 0;
      }
      filteredOrders.forEach(order => {
        const oDate = new Date(order.created_at);
        oDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((endAnchor.getTime() - oDate.getTime()) / (1000 * 3600 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < weeksCount && weekIndex >= 0) {
          const bucketDate = new Date(endAnchor);
          bucketDate.setDate(endAnchor.getDate() - (weekIndex * 7));
          const label = bucketDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          if (revenueMap[label] !== undefined) {
            revenueMap[label] += (order.billing?.total || 0);
          }
        }
      });
    } else {
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(endAnchor);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        revenueMap[label] = 0;
      }
      filteredOrders.forEach(order => {
        const oDate = new Date(order.created_at);
        oDate.setHours(0, 0, 0, 0);
        const label = oDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (revenueMap[label] !== undefined) {
          revenueMap[label] += (order.billing?.total || 0);
        }
      });
    }
    
    const revenueData = Object.keys(revenueMap).map(k => ({ name: k, value: revenueMap[k] }));

    const statusCounts: Record<string, number> = { Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 };
    filteredOrders.forEach(order => {
      const st = order.status || 'Pending';
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else {
        statusCounts[st] = 1;
      }
    });

    const pieData = Object.keys(statusCounts)
      .filter(k => statusCounts[k] > 0 || ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].includes(k))
      .map(k => ({
        name: k,
        value: statusCounts[k],
        percentage: totalOrders > 0 ? `${Math.round((statusCounts[k] / totalOrders) * 100)}%` : '0%'
      }));

    const recentOrders = filteredOrders.slice(0, 5).map(order => {
      const colors = getStatusColor(order.status);
      return {
        id: `#${order.id.toString().substring(0, 8)}`,
        rawId: order.id,
        customer: order.customer?.name || 'Unknown',
        restaurant: order.branch || 'N/A',
        amount: `₹ ${order.billing?.total?.toLocaleString() || 0}`,
        status: order.status,
        time: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        color: colors.bg,
        text: colors.text
      };
    });

    const itemMap: Record<string, { qty: number, revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 };
        itemMap[item.name].qty += item.qty;
        itemMap[item.name].revenue += item.subtotal;
      });
    });

    const topItems = Object.keys(itemMap)
      .map(k => {
        const matchingMenuItem = menuItems.find(m => m.name === k);
        return {
          name: k,
          rawQty: itemMap[k].qty,
          orders: `${itemMap[k].qty} Orders`,
          revenue: `₹ ${itemMap[k].revenue.toLocaleString()}`,
          image: matchingMenuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'
        };
      })
      .sort((a, b) => b.rawQty - a.rawQty)
      .slice(0, 5);

    const formatCompactNumber = (num: number) => {
      return new Intl.NumberFormat('en-IN', {
        notation: 'compact',
        maximumFractionDigits: 2
      }).format(num);
    };

    return {
      totalRevenue: `₹ ${formatCompactNumber(totalRevenue)}`,
      totalOrders: formatCompactNumber(totalOrders),
      activeBranches: activeBranchesCount.toString(),
      avgOrderValue: `₹ ${formatCompactNumber(avgOrderValue)}`,
      trends,
      trendLabel,
      revenueData,
      pieData,
      recentOrders,
      topItems,
      rawTotalOrders: totalOrders
    };
  }, [orders, branches, menuItems, timeFilter, customStartDate, customEndDate]);
};
