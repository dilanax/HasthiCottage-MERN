import React, { useState, useEffect } from "react";
import axios from "axios";
import UserPromotionCard from "../../components/promotion/UserPromotionCard";
import Header from "../../components/Header";
import AuthHeader from "../../components/AuthHeader";

export default function UserPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/promotions");
      setPromotions(response.data.promotions);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching promotions");
      setLoading(false);
    }
  };

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          JSON.parse(userData); // Validate JSON
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login/logout events
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f0f0" }}>
      {/* Navigation Header */}
      {isLoggedIn ? <AuthHeader /> : <Header />}
      
      {/* Header Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: "#d3af37" }}>
            Special Offers
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover amazing deals and exclusive promotions for your perfect getaway
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ backgroundColor: "#ffffff" }}>
              <div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
              <span className="font-semibold" style={{ color: "#0a0a0a" }}>Loading amazing offers...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto p-6 rounded-2xl border-2" style={{ 
              color: "#dc2626", 
              backgroundColor: "#fef2f2", 
              borderColor: "#dc2626" 
            }}>
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-lg mb-2">Oops! Something went wrong</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && promotions.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto p-8 rounded-2xl" style={{ backgroundColor: "#ffffff" }}>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#0a0a0a" }}>No offers available</h3>
              <p className="text-gray-600">Check back soon for amazing promotions!</p>
            </div>
          </div>
        )}

        {/* Promotions Grid */}
        {!loading && !error && promotions.length > 0 && (
          <>
            {/* Stats Bar */}
            <div className="mb-8 p-4 rounded-2xl" style={{ backgroundColor: "#ffffff" }}>
              <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: "#d3af37" }}>{promotions.length}</div>
                  <div className="text-sm text-gray-600">Active Offers</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: "#d3af37" }}>
                    {promotions.filter(p => p.status?.toLowerCase() === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Currently Available</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: "#d3af37" }}>
                    {new Set(promotions.map(p => p.promotion_category)).size}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <UserPromotionCard key={promotion.promotion_id} promotion={promotion} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}