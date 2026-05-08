import { createContext, useContext, useState } from 'react';
import { DEMO_BUSINESS, DEMO_LICENSES } from '../utils/demoData';
import { getDaysLeft, getStatusFromDays } from '../utils/formatters';

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoBusiness, setDemoBusiness] = useState(null);
  const [demoLicenses, setDemoLicenses] = useState(null);

  const enterDemo = () => {
    const enriched = DEMO_LICENSES.map((l) => {
      const daysLeft = getDaysLeft(l.expiry_date);
      return { ...l, daysLeft, status: getStatusFromDays(daysLeft) };
    });
    setDemoBusiness(DEMO_BUSINESS);
    setDemoLicenses(enriched);
    setIsDemo(true);
  };

  const exitDemo = () => {
    setIsDemo(false);
    setDemoBusiness(null);
    setDemoLicenses(null);
  };

  return (
    <DemoContext.Provider value={{ isDemo, demoBusiness, demoLicenses, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
