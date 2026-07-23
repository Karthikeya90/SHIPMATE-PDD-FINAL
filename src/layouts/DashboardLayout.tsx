import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  Menu,
  X,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Home,
  PlusCircle,
  Search,
  Map,
  MessageSquare,
  CreditCard,
  History,
  Briefcase,
  Wallet,
  Navigation,
  ArrowLeftRight } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { deliveryService } from '../services/deliveryService';
import { Role, Notification } from '../data/types';
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}
const senderNav: NavItem[] = [
{
  label: 'Dashboard',
  href: '/sender',
  icon: Home
},
{
  label: 'Create Request',
  href: '/sender/create',
  icon: PlusCircle
},
{
  label: 'Find Travellers',
  href: '/sender/search',
  icon: Search
},
{
  label: 'Tracking',
  href: '/sender/tracking',
  icon: Map
},
{
  label: 'Messages',
  href: '/sender/chat',
  icon: MessageSquare
},
{
  label: 'History',
  href: '/sender/history',
  icon: History
}];

const travellerNav: NavItem[] = [
{
  label: 'Dashboard',
  href: '/traveller',
  icon: Home
},
{
  label: 'Available Deliveries',
  href: '/traveller/available',
  icon: Search
},
{
  label: 'My Deliveries',
  href: '/traveller/deliveries',
  icon: Briefcase
},
{
  label: 'Tracking',
  href: '/traveller/tracking',
  icon: Navigation
},
{
  label: 'Messages',
  href: '/traveller/chat',
  icon: MessageSquare
},
{
  label: 'History',
  href: '/traveller/history',
  icon: History
}];

export function DashboardLayout({ role }: {role: Role;}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navItems = role === 'sender' ? senderNav : travellerNav;
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      const notifs = await deliveryService.getNotifications(user.user_id);
      if (mounted) setNotifications(notifs);
    };
    load();
    // Poll every 10s for new notifications
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = async (notif: Notification) => {
    await deliveryService.markNotificationRead(notif.notification_id);
    setNotifications((prev) =>
      prev.map((n) => n.notification_id === notif.notification_id ? { ...n, read: true } : n)
    );
    if (notif.link) navigate(notif.link);
    setIsNotifOpen(false);
  };
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-primary">
            
            <Package className="h-6 w-6" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              SHIPMATE
            </span>
          </Link>
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            {role === 'sender' ? 'Sender Menu' : 'Traveller Menu'}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
              location.pathname === item.href ||
              item.href !== `/${role}` &&
              location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  
                  <item.icon
                    className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  
                  {item.label}
                </Link>);

            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={
              user?.profile_image ||
              `https://ui-avatars.com/api/?name=${user?.name}&background=random`
              }
              alt={user?.name}
              className="h-10 w-10 rounded-full border border-border" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {role}
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>Switch Role</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-muted-foreground hover:text-foreground">
              
              <Menu className="h-6 w-6" />
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-primary">
              
              <Package className="h-5 w-5" />
              <span className="font-display font-bold text-lg tracking-tight text-foreground">
                SHIPMATE
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <h1 className="text-lg font-display font-semibold capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') ||
              'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-secondary text-[9px] text-white font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-2xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-sm font-bold">Notifications</p>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.notification_id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0 ${
                              !notif.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <p className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(notif.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </p>
                          </button>
                        ))
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
                
                <img
                  src={
                  user?.profile_image ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=random`
                  }
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border border-border md:hidden" />
                
                <Settings className="h-5 w-5 text-muted-foreground hidden md:block" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  transition={{
                    duration: 0.15
                  }}
                  className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-soft py-1 z-50">
                  
                    <div className="px-4 py-2 border-b border-border mb-1 md:hidden">
                      <p className="text-sm font-medium truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}>
                    
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}>
                    
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <div className="h-px bg-border my-1"></div>
                    <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)} />
          
            <motion.div
            initial={{
              x: '-100%'
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: '-100%'
            }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.3
            }}
            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card border-r border-border z-50 flex flex-col md:hidden">
            
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link
                to="/dashboard"
                className="flex items-center gap-2 text-primary"
                onClick={() => setIsMobileMenuOpen(false)}>
                
                  <Package className="h-6 w-6" />
                  <span className="font-display font-bold text-xl tracking-tight text-foreground">
                    SHIPMATE
                  </span>
                </Link>
                <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground">
                
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                  const isActive =
                  location.pathname === item.href ||
                  item.href !== `/${role}` &&
                  location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                      
                        <item.icon
                        className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      
                        {item.label}
                      </Link>);

                })}
                </nav>
              </div>

              <div className="p-4 border-t border-border">
                <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                
                  <LogOut className="h-5 w-5" /> Log out
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}