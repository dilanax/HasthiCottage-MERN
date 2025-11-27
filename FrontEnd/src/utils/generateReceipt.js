import jsPDF from 'jspdf';
import dayjs from 'dayjs';

/**
 * Generate a PDF receipt for a reservation
 * @param {Object} reservation - The reservation object
 * @param {Object} packageDetails - The package details object
 */
export async function generateReceiptPDF(reservation, packageDetails) {
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
    doc.text('Reservation Receipt', 50, 28);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${dayjs().format('MM/DD/YYYY')}`, 50, 35);
    doc.text(`Reservation #: ${reservation?.reservationNumber || 'N/A'}`, 50, 40);
    
    yPosition = 55; // Set position after header (moved up 5 units)
    
    // Summary Statistics Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    
    // Golden underline
    doc.setDrawColor(211, 175, 55);
    doc.setLineWidth(2);
    doc.line(20, yPosition + 2, 100, yPosition + 2);
    
    yPosition += 12; // Reduced spacing
    
    // Summary table
    const summaryData = [
      ['Reservation Number', `#${reservation?.reservationNumber || 'N/A'}`],
      ['Booking Date', dayjs(reservation?.createdAt).isValid() ? dayjs(reservation.createdAt).format('MM/DD/YYYY') : 'N/A'],
      ['Check-in Date', dayjs(reservation?.checkIn).isValid() ? dayjs(reservation.checkIn).format('MM/DD/YYYY') : 'N/A'],
      ['Check-out Date', dayjs(reservation?.checkOut).isValid() ? dayjs(reservation.checkOut).format('MM/DD/YYYY') : 'N/A'],
      ['Duration', `${Math.round((new Date(reservation?.checkOut) - new Date(reservation?.checkIn)) / (1000 * 60 * 60 * 24))} nights`],
      ['Status', (reservation?.status || 'pending').charAt(0).toUpperCase() + (reservation?.status || 'pending').slice(1)],
      ['Total Amount', `${reservation?.currency || 'USD'} ${(reservation?.totalAmount || 0).toFixed(2)}`]
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
      doc.text(row[1], 62, rowY - 1);
    });
    
    yPosition += (summaryData.length * 8) + 15; // Reduced spacing
    
    // Reservation Details Section - Two Column Layout
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Reservation Details', 20, yPosition);
    
    // Golden underline
    doc.setDrawColor(211, 175, 55);
    doc.setLineWidth(2);
    doc.line(20, yPosition + 2, 100, yPosition + 2);
    
    yPosition += 12; // Reduced spacing
    
    // Calculate booking details
    const totalNights = Math.round((new Date(reservation?.checkOut) - new Date(reservation?.checkIn)) / (1000 * 60 * 60 * 24));
    const pricePerNight = packageDetails?.priceUSD || 0;
    const subtotal = pricePerNight * totalNights * (reservation?.roomsWanted || 1);
    const totalAmount = reservation?.totalAmount || subtotal;
    
    // Left Column - Reservation & Booking Info
    const leftColumnData = [
      'RESERVATION INFORMATION',
      `Reservation Number: #${reservation?.reservationNumber || 'N/A'}`,
      `Booking Date: ${dayjs(reservation?.createdAt).isValid() ? dayjs(reservation.createdAt).format('MM/DD/YYYY') : 'N/A'}`,
      `Status: ${(reservation?.status || 'pending').charAt(0).toUpperCase() + (reservation?.status || 'pending').slice(1)}`,
      '',
      'ROOM & GUEST DETAILS',
      `Room ID: ${packageDetails?.roomId || 'N/A'}`,
      `Rooms Booked: ${reservation?.roomsWanted || 1} room${(reservation?.roomsWanted || 1) > 1 ? 's' : ''}`,
      `Adults: ${reservation?.adults || 1} adult${(reservation?.adults || 1) > 1 ? 's' : ''}`,
      `Children: ${reservation?.children || 0} child${(reservation?.children || 0) > 1 ? 'ren' : ''}`,
      '',
      'DATES',
      `Check-in: ${dayjs(reservation?.checkIn).isValid() ? dayjs(reservation.checkIn).format('MM/DD/YYYY') : 'N/A'}`,
      `Check-out: ${dayjs(reservation?.checkOut).isValid() ? dayjs(reservation.checkOut).format('MM/DD/YYYY') : 'N/A'}`,
      `Duration: ${totalNights} nights`
    ];
    
    // Right Column - Customer & Payment Info
    const rightColumnData = [
      'CUSTOMER INFORMATION',
      `Name: ${reservation?.guest?.firstName || ''} ${reservation?.guest?.lastName || ''}`,
      `Email: ${reservation?.guest?.email || 'N/A'}`,
      `Phone: ${reservation?.guest?.phone || 'Not provided'}`,
      `Country: ${reservation?.guest?.country || 'Not provided'}`,
      '',
      'PAYMENT DETAILS',
      `Price per Night: ${reservation?.currency || 'USD'} ${pricePerNight.toFixed(2)}`,
      `Subtotal: ${reservation?.currency || 'USD'} ${subtotal.toFixed(2)}`,
      `Total Amount: ${reservation?.currency || 'USD'} ${totalAmount.toFixed(2)}`,
      `Payment Status: ${(reservation?.paymentStatus || 'pending').charAt(0).toUpperCase() + (reservation?.paymentStatus || 'pending').slice(1)}`,
      '',
      'SPECIAL REQUESTS',
      (() => {
        const requests = [];
        if (reservation?.travellingWithPet) requests.push('Pet Friendly');
        if (reservation?.safariRequested) requests.push('Safari Requested');
        return requests.length > 0 ? requests.join(', ') : 'No special requests';
      })()
    ];
    
    // Draw left column
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    leftColumnData.forEach((line, index) => {
      if (line === '') return; // Skip empty lines
      
      if (line.includes('INFORMATION') || line.includes('DETAILS') || line.includes('DATES')) {
        // Section headers
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(211, 175, 55); // Golden color for headers
        doc.text(line, 20, yPosition + (index * 6));
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      } else {
        // Regular content
        doc.text(line, 20, yPosition + (index * 6));
      }
    });
    
    // Draw right column
    rightColumnData.forEach((line, index) => {
      if (line === '') return; // Skip empty lines
      
      if (line.includes('INFORMATION') || line.includes('DETAILS') || line.includes('REQUESTS')) {
        // Section headers
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(211, 175, 55); // Golden color for headers
        doc.text(line, 110, yPosition + (index * 6));
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      } else {
        // Regular content
        doc.text(line, 110, yPosition + (index * 6));
      }
    });
    
    yPosition += Math.max(leftColumnData.length, rightColumnData.length) * 6 + 10;
    
    // Payment breakdown section - positioned on right side
    const taxes = totalAmount - subtotal;
    
    // Calculate page height for positioning
    const pageHeight = doc.internal.pageSize.height;
    
    // Position payment table on right side at bottom
    const tableStartY = pageHeight - 50; // Position table 50 units from bottom
    
    // Payment breakdown table
    const paymentData = [
      ['Subtotal', `${reservation?.currency || 'USD'} ${subtotal.toFixed(2)}`],
      ['Taxes & Fees', `${reservation?.currency || 'USD'} ${taxes.toFixed(2)}`],
      ['Total Amount', `${reservation?.currency || 'USD'} ${totalAmount.toFixed(2)}`],
      ['Payment Status', (reservation?.paymentStatus || 'pending').charAt(0).toUpperCase() + (reservation?.paymentStatus || 'pending').slice(1)]
    ];
    
    // Draw payment table on right side
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    paymentData.forEach((row, index) => {
      const rowY = tableStartY + (index * 8);
      
      // Draw table borders on right side
      doc.rect(110, rowY - 6, 80, 8);
      doc.line(150, rowY - 6, 150, rowY + 2);
      
      // Add text
      doc.text(row[0], 112, rowY - 1);
      doc.text(row[1], 152, rowY - 1);
    });
    
    // Add footer with company info - positioned at bottom of same page
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Hasthi Safari Cottage - Professional Safari Experience', 15, pageHeight - 10);
    doc.text(`Receipt generated on ${new Date().toLocaleString()}`, 15, pageHeight - 5);
    
    // Save the PDF
    const fileName = `receipt-${reservation?.reservationNumber || 'unknown'}-${dayjs().format('YYYY-MM-DD')}.pdf`;
    doc.save(fileName);
    
    return fileName;
    
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw error;
  }
}

/**
 * Generate a simple receipt without package details
 * @param {Object} reservation - The reservation object
 */
export async function generateSimpleReceiptPDF(reservation) {
  return generateReceiptPDF(reservation, null);
}