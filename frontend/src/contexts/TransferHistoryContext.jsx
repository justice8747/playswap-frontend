import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const TransferHistoryContext = createContext();

export const TransferHistoryProvider = ({ children }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/history', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Sort transfers by createdAt date in descending order
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransfers(sortedData);
      } else {
        setError('Failed to fetch transfers');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching transfers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <TransferHistoryContext.Provider value={{ transfers, loading, error, fetchTransfers }}>
      {children}
    </TransferHistoryContext.Provider>
  );
};

export const useTransferHistory = () => {
  const context = useContext(TransferHistoryContext);
  if (context === undefined) {
    throw new Error('useTransferHistory must be used within a TransferHistoryProvider');
  }
  return context;
};
