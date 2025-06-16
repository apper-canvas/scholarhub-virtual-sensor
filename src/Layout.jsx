import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentRoute = routeArray.find(route => route.path === location.pathname) || routeArray[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 z-40 px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center ml-2 md:ml-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="GraduationCap" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-display font-semibold text-surface-800">ScholarHub</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-surface-50 rounded-lg px-4 py-2 w-80">
              <ApperIcon name="Search" size={16} className="text-surface-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search students, classes..." 
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors relative">
              <ApperIcon name="Bell" size={20} className="text-surface-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
            </button>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-surface-50 border-r border-surface-200 flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                  }`
                }
              >
                <ApperIcon name={route.icon} size={18} className="mr-3" />
                {route.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 20 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 md:hidden"
              >
                <div className="p-4 border-b border-surface-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <ApperIcon name="GraduationCap" size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-display font-semibold text-surface-800">ScholarHub</h1>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                        }`
                      }
                    >
                      <ApperIcon name={route.icon} size={18} className="mr-3" />
                      {route.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;