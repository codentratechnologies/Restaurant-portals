import { describe, it, expect, vi } from 'vitest';
import { exportDashboardReport } from './exportUtils';

// Mock dynamic imports for external libraries so they don't break in Node/JSDOM
vi.mock('exceljs', () => {
  return {
    default: {
      Workbook: vi.fn().mockImplementation(() => ({
        addWorksheet: vi.fn().mockReturnValue({
          columns: [],
          getRow: vi.fn().mockReturnValue({ font: {}, fill: {}, alignment: {} }),
          addRow: vi.fn(),
          eachRow: vi.fn(),
        }),
        xlsx: {
          writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        }
      }))
    }
  };
});

vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      internal: { pageSize: { getWidth: () => 210 } },
      setFillColor: vi.fn(),
      rect: vi.fn(),
      setTextColor: vi.fn(),
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      roundedRect: vi.fn(),
      setLineWidth: vi.fn(),
      circle: vi.fn(),
      lines: vi.fn(),
      save: vi.fn()
    }))
  };
});

describe('exportUtils', () => {
  it('should export the exportDashboardReport function', () => {
    expect(typeof exportDashboardReport).toBe('function');
  });

  it('should run without throwing an error when provided valid data', async () => {
    const mockData = {
      totalRevenue: 'Rs. 1000',
      totalOrders: '10',
      activeBranches: '2',
      avgOrderValue: 'Rs. 100',
      recentOrders: [
        { id: '#123', customer: 'John Doe', restaurant: 'Branch A', amount: 'Rs. 500', status: 'Delivered', time: '10:00 AM' }
      ],
      topItems: [
        { name: 'Pizza', rawQty: 5, revenue: 500 }
      ],
      revenueData: [
        { name: '10 Jan', value: 500 }
      ],
      pieData: [
        { name: 'Delivered', value: 10, percentage: '100%' }
      ]
    };

    await expect(exportDashboardReport(mockData, 'Last 7 Days')).resolves.not.toThrow();
  });
});
