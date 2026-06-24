import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Hide breadcrumbs on dashboard or root
  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null;
  }

  const formatSegment = (segment: string) => {
    // Check if segment is likely an ID (e.g. Firebase ID starts with - or is very long)
    if (segment.startsWith('-') || segment.length > 15) {
      return 'Details';
    }
    // Special cases
    if (segment === 'new') return 'New';
    
    // Capitalize and format
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center text-sm font-medium text-text-secondary mb-6 mt-2"
    >
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-brand-orange-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
            {isLast ? (
              <span className="text-brand-navy font-bold cursor-default">
                {formatSegment(value)}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-brand-orange-600 transition-colors"
              >
                {formatSegment(value)}
              </Link>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
}
