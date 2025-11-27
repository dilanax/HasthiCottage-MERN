import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingBookingsCount } from '../api/foodBookingApi.js';
import { getPendingSafariBookingsCount } from '../api/safariBookingApi.js';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [foodCount, setFoodCount] = useState(0);
  const [safariCount, setSafariCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingCounts = async () => {
    try {
      setIsLoading(true);
      const [foodResponse, safariResponse] = await Promise.all([
        getPendingBookingsCount(),
        getPendingSafariBookingsCount()
      ]);
      
      const newFoodCount = foodResponse.pendingCount || 0;
      const newSafariCount = safariResponse.pendingCount || 0;
      const newTotalCount = newFoodCount + newSafariCount;
      
      setFoodCount(newFoodCount);
      setSafariCount(newSafariCount);
      setTotalCount(newTotalCount);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchPendingCounts();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshNotifications = () => {
    fetchPendingCounts();
  };

  const value = {
    foodCount,
    safariCount,
    totalCount,
    lastUpdate,
    isLoading,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
