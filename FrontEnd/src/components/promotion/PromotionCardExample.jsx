import React, { useState } from "react";
import PromotionCard from "./PromotionCard";
import EditPromotionModal from "./EditPromotionModal";
import Swal from "sweetalert2";

// Example usage of PromotionCard with edit and delete functionality
export default function PromotionCardExample() {
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotions, setPromotions] = useState([
    {
      promotion_id: "P0001",
      title: "Safari Package Offer",
      description: "yala jangel tuwer in visiter",
      start_date: "2025-10-22",
      end_date: "2025-10-29",
      discount_type: "percentage",
      discount_value: 19,
      status: "active",
      promotion_category: "Safari Package Promotions"
    }
  ]);

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
  };

  const handleDelete = async (promotion) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${promotion.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Here you would call your delete API
        // await deletePromotion(promotion.promotion_id);
        
        // For demo purposes, just remove from local state
        setPromotions(prev => prev.filter(p => p.promotion_id !== promotion.promotion_id));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The promotion has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete promotion. Please try again.',
        });
      }
    }
  };

  const handleSaveEdit = async (updatedPromotion) => {
    try {
      // Here you would call your update API
      // await updatePromotion(updatedPromotion.promotion_id, updatedPromotion);
      
      // For demo purposes, just update local state
      setPromotions(prev => 
        prev.map(p => 
          p.promotion_id === updatedPromotion.promotion_id 
            ? updatedPromotion 
            : p
        )
      );
      
      setEditingPromotion(null);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleViewDetails = (promotion) => {
    Swal.fire({
      title: promotion.title,
      html: `
        <div class="text-left">
          <p><strong>Description:</strong> ${promotion.description}</p>
          <p><strong>Category:</strong> ${promotion.promotion_category}</p>
          <p><strong>Discount:</strong> ${promotion.discount_value}${promotion.discount_type === 'percentage' ? '%' : ' LKR'}</p>
          <p><strong>Status:</strong> ${promotion.status}</p>
          <p><strong>Valid From:</strong> ${new Date(promotion.start_date).toLocaleDateString()}</p>
          <p><strong>Valid Until:</strong> ${new Date(promotion.end_date).toLocaleDateString()}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  };

  const handleApplyPromotion = (promotion) => {
    Swal.fire({
      title: 'Promotion Applied!',
      text: `You have successfully applied "${promotion.title}"`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Promotion Cards Example</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promotion => (
          <PromotionCard
            key={promotion.promotion_id}
            promotion={promotion}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            onApplyPromotion={handleApplyPromotion}
            className="mb-4"
          />
        ))}
      </div>

      {editingPromotion && (
        <EditPromotionModal
          promotion={editingPromotion}
          onSave={handleSaveEdit}
          onClose={() => setEditingPromotion(null)}
        />
      )}
    </div>
  );
}
