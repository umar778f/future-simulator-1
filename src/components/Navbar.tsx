import { Link, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, History } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-slate-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span className="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              FUTURE SIM
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-sm font-medium hover:text-cyan-400 transition-colors hidden sm:flex items-center space-x-1">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/history" className="text-sm font-medium hover:text-cyan-400 transition-colors hidden sm:flex items-center space-x-1">
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
