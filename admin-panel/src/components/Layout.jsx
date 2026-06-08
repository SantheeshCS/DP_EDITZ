import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileStack, 
  PlusCircle, 
  LogOut, 
  User,
  Key,
  Lock,
  X,
  Loader,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', path: '/templates', icon: FileStack },
    { name: 'Upload New', path: '/templates/new', icon: PlusCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all password fields.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }

    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    setUpdating(true);
    try {
      await api.post('/admin/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Admin password updated successfully!');
      setIsModalOpen(false);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Failed to update administrative password.';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Brand Logo */}
          <Link to="/dashboard" className="h-16 flex items-center px-6 border-b border-slate-200 hover:bg-slate-50 transition-colors">
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
              DP_TEMPLATES <span className="text-sm font-medium text-slate-400">ADMIN</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between px-4 py-2 text-slate-500 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <User className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{localStorage.getItem('adminEmail') || 'Dp_admin'}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:text-indigo-600 text-slate-400 transition-colors cursor-pointer"
              title="Change Password"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 truncate">
              {menuItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-500">
              Environment: Production
            </span>
          </div>
        </header>

        {/* Dynamic Inner View */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6 relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                <span>Security Settings</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update password for the administrative account
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
