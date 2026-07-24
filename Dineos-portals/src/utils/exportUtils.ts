const PIE_COLORS = ['#EF4444', '#7C3AED', '#EAB308', '#22C55E', '#8896AB']; // Red, Purple, Yellow, Green, Gray

export const exportDashboardReport = async (dynamicStats: any, filterLabel: string) => {
  try {
    // 1. Export Excel Data with styling using exceljs
    import('exceljs').then(async (ExcelJS) => {
      const workbook = new ExcelJS.Workbook();
      
      // --- Orders Sheet ---
      const wsOrders = workbook.addWorksheet('Recent Orders');
      wsOrders.columns = [
        { header: 'Order ID', key: 'id', width: 15 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Restaurant', key: 'restaurant', width: 30 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Time', key: 'time', width: 15 },
      ];

      // Style the header row
      const headerRow = wsOrders.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      
      dynamicStats.recentOrders.forEach((o: any) => {
        wsOrders.addRow({
          id: o.id,
          customer: o.customer,
          restaurant: o.restaurant,
          amount: o.amount,
          status: o.status,
          time: o.time
        });
      });

      wsOrders.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      // --- Top Items Sheet ---
      const wsItems = workbook.addWorksheet('Top Selling Items');
      wsItems.columns = [
        { header: 'Item Name', key: 'name', width: 35 },
        { header: 'Total Orders', key: 'orders', width: 20 },
        { header: 'Total Revenue', key: 'revenue', width: 25 },
      ];

      const headerRowItems = wsItems.getRow(1);
      headerRowItems.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRowItems.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
      headerRowItems.alignment = { vertical: 'middle', horizontal: 'left' };
      
      dynamicStats.topItems.forEach((i: any) => {
        wsItems.addRow({
          name: i.name,
          orders: i.rawQty,
          revenue: i.revenue
        });
      });

      // Save using FileSaver
      const buffer = await workbook.xlsx.writeBuffer();
      import('file-saver').then(({ saveAs }) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `DineOS_Dashboard_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
      });
    });

    // 2. Export Professional Native PDF with Vector Charts
    import('jspdf').then(module => {
      const jsPDF = module.default ? module.default : module.jsPDF;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // --- Orange Header Banner ---
      pdf.setFillColor(255, 107, 0); // Brand Orange
      pdf.rect(0, 0, pdfWidth, 45, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text("DineOS Analytics Report", 15, 24);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Date Range: ${filterLabel}`, 15, 34);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth - 75, 34);

      // --- KPI Summary Section ---
      pdf.setTextColor(26, 31, 54);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Executive Summary", 15, 55);

      const cleanCurrency = (val: string) => val.replace('₹', 'Rs.');
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Revenue: ${cleanCurrency(dynamicStats.totalRevenue)}`, 15, 66);
      pdf.text(`Total Orders: ${dynamicStats.totalOrders}`, 15, 74);
      
      pdf.text(`Active Restaurants: ${dynamicStats.activeBranches}`, 105, 66);
      pdf.text(`Avg Order Value: ${cleanCurrency(dynamicStats.avgOrderValue)}`, 105, 74);
      
      pdf.setDrawColor(232, 236, 244);
      pdf.line(15, 85, pdfWidth - 15, 85);

      // --- Native Vector Charts ---
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Performance Charts (Data Values)", 15, 100);

      // 1. Draw Native Line Chart (Revenue)
      const lineChartY = 110;
      const lineChartH = 70;
      const lineChartW = pdfWidth - 30;
      
      pdf.setDrawColor(232, 236, 244);
      pdf.setFillColor(250, 251, 253);
      pdf.roundedRect(15, lineChartY, lineChartW, lineChartH, 3, 3, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 31, 54);
      pdf.text("Daily Revenue Overview", 20, lineChartY + 8);
      
      const revData = dynamicStats.revenueData;
      if (revData.length > 0) {
        const maxVal = Math.max(...revData.map((d: any) => d.value), 100);
        const chartLeft = 25;
        const chartRight = 10;
        const chartTop = 15;
        const chartBottom = 15;
        const drawW = lineChartW - chartLeft - chartRight;
        const drawH = lineChartH - chartTop - chartBottom;
        
        pdf.setDrawColor(240, 242, 247);
        pdf.line(15 + chartLeft, lineChartY + lineChartH - chartBottom, 15 + lineChartW - chartRight, lineChartY + lineChartH - chartBottom);
        
        const stepX = drawW / Math.max((revData.length - 1), 1);
        
        pdf.setDrawColor(255, 107, 0);
        pdf.setLineWidth(0.8);
        
        let prevPx: number | null = null;
        let prevPy: number | null = null;
        
        revData.forEach((d: any, i: number) => {
          const px = 15 + chartLeft + (i * stepX);
          const py = (lineChartY + chartTop + drawH) - ((d.value / maxVal) * drawH);
          
          if (prevPx !== null && prevPy !== null) {
            pdf.line(prevPx, prevPy, px, py);
          }
          
          pdf.setFillColor(255, 107, 0);
          pdf.circle(px, py, 1.5, 'F');
          
          // Value Label
          if (d.value > 0) {
            pdf.setFontSize(7);
            pdf.setTextColor(26, 31, 54);
            pdf.text(`Rs.${d.value}`, px, py - 2.5, { align: 'center' });
          }
          
          // X Axis Label
          if (revData.length <= 14 || i % Math.ceil(revData.length/10) === 0) {
            pdf.setFontSize(7);
            pdf.setTextColor(136, 150, 171);
            pdf.text(d.name, px, lineChartY + lineChartH - chartBottom + 5, { align: 'center' });
          }
          
          prevPx = px;
          prevPy = py;
        });
      }

      // 2. Draw Native Donut Chart (Orders by Status)
      const donutChartY = 190;
      const donutChartH = Math.max(70, dynamicStats.pieData.length * 10 + 20);
      const donutChartW = pdfWidth - 30;
      
      pdf.setDrawColor(232, 236, 244);
      pdf.setFillColor(250, 251, 253);
      pdf.roundedRect(15, donutChartY, donutChartW, donutChartH, 3, 3, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 31, 54);
      pdf.text("Orders by Status", 20, donutChartY + 8);
      
      const pieData = dynamicStats.pieData;
      if (pieData.length > 0) {
        const cx = 65;
        const cy = donutChartY + (donutChartH / 2) + 2;
        const radius = 25;
        
        const total = pieData.reduce((sum: number, d: any) => sum + d.value, 0) || 1;
        let currentAngle = -Math.PI / 2; // Start at top (12 o'clock)
        
        pieData.forEach((d: any, idx: number) => {
          const sliceAngle = (d.value / total) * (Math.PI * 2);
          if (sliceAngle <= 0) return;
          
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          
          // Set Color
          const colorHex = PIE_COLORS[idx % PIE_COLORS.length];
          const r = parseInt(colorHex.slice(1,3), 16);
          const g = parseInt(colorHex.slice(3,5), 16);
          const b = parseInt(colorHex.slice(5,7), 16);
          pdf.setFillColor(r, g, b);
          pdf.setDrawColor(255, 255, 255); // White border between slices
          pdf.setLineWidth(0.5);
          
          // Draw Pie Slice using polygon lines
          const lines = [];
          let prevX = cx;
          let prevY = cy;
          const step = 0.05; // radians
          
          for (let a = startAngle; a <= endAngle; a += step) {
            const px = cx + radius * Math.cos(a);
            const py = cy + radius * Math.sin(a);
            lines.push([px - prevX, py - prevY]);
            prevX = px;
            prevY = py;
          }
          
          const endX = cx + radius * Math.cos(endAngle);
          const endY = cy + radius * Math.sin(endAngle);
          lines.push([endX - prevX, endY - prevY]);
          lines.push([cx - endX, cy - endY]); // Back to center
          
          pdf.lines(lines, cx, cy, [1, 1], 'FD', true);
          
          currentAngle = endAngle;
        });
        
        // Cut out the center for Donut effect
        pdf.setFillColor(250, 251, 253); // Same as background
        pdf.circle(cx, cy, radius * 0.65, 'F');
        
        // Draw Legend
        const legendX = cx + 45;
        let legendY = donutChartY + 20;
        
        pieData.forEach((d: any, idx: number) => {
          const colorHex = PIE_COLORS[idx % PIE_COLORS.length];
          const r = parseInt(colorHex.slice(1,3), 16);
          const g = parseInt(colorHex.slice(3,5), 16);
          const b = parseInt(colorHex.slice(5,7), 16);
          
          pdf.setFillColor(r, g, b);
          pdf.circle(legendX, legendY, 2.5, 'F');
          
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(26, 31, 54);
          pdf.text(d.name, legendX + 5, legendY + 1.2);
          
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(136, 150, 171);
          pdf.text(`- ${d.value} orders (${d.percentage})`, legendX + 35, legendY + 1.2);
          
          legendY += 8;
        });
      }
      
      pdf.save(`DineOS_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};
