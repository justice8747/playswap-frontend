import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const TransferHistoryContext = createContext();

const LOCAL_STORAGE_KEY = 'playswap_transfer_history';

export const TransferHistoryProvider = ({ children }) => {
  const [transfers, setTransfers] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveLocalTransfers = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save transfers to localStorage', e);
    }
  };

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

    try {
      let res = await fetch(`${baseUrl}/transfer/history`, { credentials: 'include' });
      if (!res.ok) {
        res = await fetch(`${baseUrl}/history`, { credentials: 'include' });
      }

      if (res.ok) {
        const remoteData = await res.json();
        let historyList = [];
        if (Array.isArray(remoteData)) {
          historyList = remoteData.sort(
            (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          );
        }
        // Sync state and localStorage directly with backend response
        setTransfers(historyList);
        saveLocalTransfers(historyList);
      } else {
        // Fallback to local storage if API call fails
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) setTransfers(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Backend history fetch failed, falling back to local storage:', err);
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) setTransfers(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setTransfers([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const addTransfer = useCallback((transferObj) => {
    setTransfers((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === transferObj.id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...transferObj };
      } else {
        updated = [transferObj, ...prev];
      }
      saveLocalTransfers(updated);
      return updated;
    });
  }, []);

  const updateTransferStatus = useCallback((id, status) => {
    setTransfers((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status } : t));
      saveLocalTransfers(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <TransferHistoryContext.Provider
      value={{
        transfers,
        loading,
        error,
        fetchTransfers,
        clearHistory,
        addTransfer,
        updateTransferStatus,
      }}
    >
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
