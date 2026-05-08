import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDemo } from './context/DemoContext';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LicenseDetail from './pages/LicenseDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { calculateComplianceScore } from './utils/complianceScore';
import { useLicenses } from './hooks/useLicenses';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { isDemo } = useDemo();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );

  if (!user && !isDemo) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

function AppWithScore() {
  const { isDemo, demoLicenses } = useDemo();
  const { user } = useAuth();
  const { licenses } = useLicenses(null, isDemo ? demoLicenses : null);
  const scoreData = calculateComplianceScore(licenses);

  return <AppLayout score={scoreData.score} />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
          error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/onboard" element={<Onboarding />} />

        {/* Protected */}
        <Route element={
          <ProtectedRoute>
            <AppWithScore />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/license/:id" element={<LicenseDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
