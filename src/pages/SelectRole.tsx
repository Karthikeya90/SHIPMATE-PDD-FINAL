import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, LogOut, ChevronDown, Bell, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SelectRole() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col justify-between z-40">
      {/* Web Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 text-[#1f5e5b] font-display font-extrabold text-2xl select-none cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <Package className="h-6 w-6 stroke-[2.5]" />
          <span>shipmate</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#1f5e5b]"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              <img
                src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name}&background=1f5e5b&color=fff`}
                alt={user?.name}
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
              />
              <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/60 rounded-2xl shadow-xl py-2 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-16 px-6 max-w-6xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="text-center mb-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f5e5b]/10 text-[#1f5e5b] text-xs font-bold tracking-wide uppercase mb-6"
          >
            <Star className="h-3.5 w-3.5 fill-current" /> Peer-to-Peer Delivery Marketplace
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            Hello, {user?.name.split(' ')[0] || 'Friend'}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 mt-3 font-medium"
          >
            What would you like to do today? Select an option below to enter your portal.
          </motion.p>
        </div>

        {/* Choice Grid */}
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-stretch mt-4">
          {/* Card 1: Send Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => navigate('/sender')}
            className="bg-white p-10 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-slate-200/60 hover:border-[#1f5e5b]/30 flex flex-col items-center justify-between text-center cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 w-full max-w-md min-h-[380px]"
          >
            <div className="flex flex-col items-center">
              {/* Peach Illustration Box */}
              <div className="w-24 h-24 rounded-3xl bg-[#ffdcd0] flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Person 1 (left) */}
                  <circle cx="20" cy="26" r="4.5" fill="#1f5e5b" />
                  <path d="M12 46C12 37 16 35 21 35" stroke="#1f5e5b" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Person 2 (right) */}
                  <circle cx="44" cy="26" r="4.5" fill="#1f5e5b" />
                  <path d="M52 46C52 37 48 35 43 35" stroke="#1f5e5b" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Package exchange */}
                  <rect x="27" y="30" width="10" height="9" rx="1.5" fill="#ea580c" />
                  <line x1="32" y1="30" x2="32" y2="39" stroke="#fff" strokeWidth="1.5" />
                  {/* Connection arms */}
                  <path d="M19 36C22 36 25 34 27 34" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                  <path d="M45 36C42 36 39 34 37 34" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-3">
                Send Items
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                Post shipment requests and connect with verified travellers heading your direction.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#1f5e5b] group-hover:gap-3 transition-all">
              <span>Enter Sender Portal</span>
              <span>&rarr;</span>
            </div>
          </motion.div>

          {/* Card 2: Deliver Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => navigate('/traveller')}
            className="bg-white p-10 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-slate-200/60 hover:border-blue-500/30 flex flex-col items-center justify-between text-center cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 w-full max-w-md min-h-[380px]"
          >
            <div className="flex flex-col items-center">
              {/* Blue Illustration Box */}
              <div className="w-24 h-24 rounded-3xl bg-[#d0e8ff] flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Traveller body */}
                  <circle cx="32" cy="22" r="4.5" fill="#1d4ed8" />
                  <path d="M24 44C24 35 28 32 32 32C36 32 40 35 40 44" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Suitcase */}
                  <rect x="42" y="34" width="7" height="11" rx="1.5" fill="#1e293b" />
                  <path d="M44 34V31.5C44 31 44.4 30.5 45 30.5H46C46.6 30.5 47 31 47 31.5V34" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Arm holding suitcase */}
                  <path d="M37 36L42 36" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-3">
                Deliver Items
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                Earn money during your commutes or journeys by delivering packages along your route.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
              <span>Enter Traveller Portal</span>
              <span>&rarr;</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Web Footer */}
      <footer className="py-8 border-t border-slate-200/80 bg-white flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span>Social</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span>Efficient</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span>Transparent</span>
          </div>
          <div className="text-slate-400 capitalize font-medium tracking-normal text-sm">
            &copy; {new Date().getFullYear()} SHIPMATE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
