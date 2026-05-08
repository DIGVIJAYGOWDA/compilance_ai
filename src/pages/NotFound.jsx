import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <Shield size={36} className="text-blue-600" />
        </div>
        <div className="text-8xl font-black text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-xs">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <Home size={16} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
