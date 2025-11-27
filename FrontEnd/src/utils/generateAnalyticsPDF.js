import jsPDF from 'jspdf';
import dayjs from 'dayjs';

/**
 * Generate a PDF analytics report for reservations
 * @param {Object} data - The analytics data
 * @param {string} period - The period (today, weekly, monthly)
 */
export async function generateAnalyticsPDF(data, period) {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Initialize yPosition for layout
    let yPosition = 20;
    
    // Add hotel logo to header with professional styling
    try {
      const logoResponse = await fetch('/logo.png');
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });
      
      // Create a professional logo background
      doc.setFillColor(211, 175, 55); // Golden background
      doc.rect(15, 10, 25, 25, 'F');
      doc.addImage(logoDataUrl, 'PNG', 17, 12, 21, 21);
    } catch (logoError) {
      console.warn('Could not load logo:', logoError);
      // Fallback: Create a simple golden square
      doc.setFillColor(211, 175, 55);
      doc.rect(15, 10, 25, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('HASTHI', 20, 20);
      doc.text('SAFARI', 20, 25);
      doc.text('COTTAGE', 20, 30);
    }

    // Professional Header Styling
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Hasthi Safari Cottage', 50, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${period.charAt(0).toUpperCase() + period.slice(1)} Reservation Analytics`, 50, 28);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${dayjs().format('MM/DD/YYYY')}`, 50, 35);
    doc.text(`Period: ${period}`, 50, 40);
    
    yPosition = 60; // Set position after header
    
    // Summary Statistics Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    
    // Golden underline
    doc.setDrawColor(211, 175, 55);
    doc.setLineWidth(2);
    doc.line(20, yPosition + 2, 100, yPosition + 2);
    
    yPosition += 15;
    
    // Summary data
    const summaryData = [
      ['Total Reservations', data.analytics?.[period]?.reservations || 0],
      ['Total Guests', data.analytics?.[period]?.guests || 0],
      ['Total Revenue', `$${data.analytics?.[period]?.revenue || 0}`],
      ['Average per Reservation', `$${data.analytics?.[period]?.reservations > 0 ? (data.analytics[period].revenue / data.analytics[period].reservations).toFixed(2) : 0}`]
    ];
    
    // Draw summary table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    summaryData.forEach((row, index) => {
      const rowY = yPosition + (index * 8);
      
      // Draw table borders
      doc.rect(20, rowY - 6, 80, 8);
      doc.line(60, rowY - 6, 60, rowY + 2);
      
      // Add text
      doc.text(row[0], 22, rowY - 1);
      doc.text(String(row[1]), 62, rowY - 1);
    });
    
    yPosition += (summaryData.length * 8) + 20;
    
    // Chart Data Section
    if (data.chartData && data.chartData.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Reservations Over Time', 20, yPosition);
      
      // Golden underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(2);
      doc.line(20, yPosition + 2, 100, yPosition + 2);
      
      yPosition += 15;
      
      // Chart data table
      const chartTableData = data.chartData.map(item => [
        item.date,
        item.reservations,
        `$${item.revenue || 0}`
      ]);
      
      // Add header
      const headerData = [['Date', 'Reservations', 'Revenue']];
      const allData = [...headerData, ...chartTableData];
      
      // Draw chart data table
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      allData.forEach((row, index) => {
        const rowY = yPosition + (index * 6);
        const isHeader = index === 0;
        
        // Draw table borders
        doc.rect(20, rowY - 4, 100, 6);
        doc.line(60, rowY - 4, 60, rowY + 2);
        doc.line(80, rowY - 4, 80, rowY + 2);
        
        // Add text
        if (isHeader) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }
        
        doc.text(row[0], 22, rowY - 1);
        doc.text(String(row[1]), 62, rowY - 1);
        doc.text(String(row[2]), 82, rowY - 1);
      });
      
      yPosition += (allData.length * 6) + 20;
    }
    
    // Status Distribution Section
    if (data.statusData && data.statusData.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Reservation Status Distribution', 20, yPosition);
      
      // Golden underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(2);
      doc.line(20, yPosition + 2, 120, yPosition + 2);
      
      yPosition += 15;
      
      // Status data table
      const statusTableData = data.statusData.map(item => [
        item.name,
        item.value,
        `${((item.value / data.statusData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%`
      ]);
      
      // Add header
      const statusHeaderData = [['Status', 'Count', 'Percentage']];
      const allStatusData = [...statusHeaderData, ...statusTableData];
      
      // Draw status table
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      allStatusData.forEach((row, index) => {
        const rowY = yPosition + (index * 6);
        const isHeader = index === 0;
        
        // Draw table borders
        doc.rect(20, rowY - 4, 100, 6);
        doc.line(60, rowY - 4, 60, rowY + 2);
        doc.line(80, rowY - 4, 80, rowY + 2);
        
        // Add text
        if (isHeader) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }
        
        doc.text(row[0], 22, rowY - 1);
        doc.text(String(row[1]), 62, rowY - 1);
        doc.text(String(row[2]), 82, rowY - 1);
      });
      
      yPosition += (allStatusData.length * 6) + 20;
    }
    
    // Add footer with company info - positioned properly below content
    const pageHeight = doc.internal.pageSize.height;
    const footerY = Math.max(yPosition + 20, pageHeight - 20); // Ensure footer is at least 20 units from bottom
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Hasthi Safari Cottage - Professional Safari Experience', 15, footerY);
    doc.text(`Report generated on ${new Date().toLocaleString()}`, 15, footerY + 5);
    
    // Save the PDF
    const fileName = `reservation-analytics-${period}-${dayjs().format('YYYY-MM-DD')}.pdf`;
    doc.save(fileName);
    
    return fileName;
    
  } catch (error) {
    console.error('Error generating analytics PDF:', error);
    throw error;
  }
}
