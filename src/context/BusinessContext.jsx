import { createContext, useContext, useState, useCallback } from 'react';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [activeBusiness, setActiveBusiness] = useState(() => {
    // Restore last selected business from localStorage
    try {
      const saved = localStorage.getItem('active_business');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const selectBusiness = useCallback((biz) => {
    setActiveBusiness(biz);
    if (biz) localStorage.setItem('active_business', JSON.stringify(biz));
    else localStorage.removeItem('active_business');
  }, []);

  const clearBusiness = useCallback(() => {
    setActiveBusiness(null);
    localStorage.removeItem('active_business');
  }, []);

  return (
    <BusinessContext.Provider value={{ activeBusiness, selectBusiness, clearBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
