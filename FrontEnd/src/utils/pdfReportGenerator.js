// PDF Report Generator for Artisanal and Reviews
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate PDF report for Artisanal items
export const generateArtisanalPDF = async (allItems, filteredItems) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Artisanal Collection Report', 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total Items: ${allItems.length}`, 20, 55);
    doc.text(`Filtered Items: ${filteredItems.length}`, 20, 65);
    
    // Prepare table data
    const tableData = filteredItems.map(item => [
      item.name || 'N/A',
      item.category || 'N/A',
      item.price ? `$${item.price}` : 'N/A',
      item.stock || 'N/A',
      item.description ? item.description.substring(0, 50) + '...' : 'N/A'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Name', 'Category', 'Price', 'Stock', 'Description']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [211, 175, 55] }
    });
    
    // Save the PDF
    doc.save(`artisanal-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating Artisanal PDF:', error);
    throw error;
  }
};

// Generate PDF report for Reviews
export const generateReviewsPDF = async (allReviews, filteredReviews) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Customer Reviews Report', 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total Reviews: ${allReviews.length}`, 20, 55);
    doc.text(`Filtered Reviews: ${filteredReviews.length}`, 20, 65);
    
    // Calculate average rating
    const avgRating = filteredReviews.length > 0 
      ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(2)
      : 0;
    doc.text(`Average Rating: ${avgRating}/5`, 20, 75);
    
    // Prepare table data
    const tableData = filteredReviews.map(review => [
      `${review.firstName || ''} ${review.lastName || ''}`.trim() || 'Anonymous',
      review.rating || 'N/A',
      review.comment ? review.comment.substring(0, 50) + '...' : 'No comment',
      review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Customer', 'Rating', 'Comment', 'Date']],
      body: tableData,
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [211, 175, 55] }
    });
    
    // Save the PDF
    doc.save(`reviews-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating Reviews PDF:', error);
    throw error;
  }
};
