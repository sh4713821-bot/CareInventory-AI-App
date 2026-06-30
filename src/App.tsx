import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  LayoutDashboard, 
  Boxes, 
  HeartHandshake, 
  Camera, 
  BarChart3, 
  Bell, 
  Settings, 
  Plus, 
  Menu, 
  X, 
  LogOut,
  Sparkles,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';

import Login from './components/Login';
import SupervisorDashboard from './components/SupervisorDashboard';
import ScannerInterface from './components/ScannerInterface';
import ImpactReports from './components/ImpactReports';
import DonorDashboard from './components/DonorDashboard';

import { INITIAL_DONATIONS, INITIAL_NEEDS, INITIAL_LOGS } from './data';
import { DonationItem, ChildNeed, AuditLog, UserSession, InventoryStockItem } from './types';
import { 
  fetchDonations, 
  fetchNeeds, 
  fetchLogs, 
  saveDonationItem, 
  saveNeedItem, 
  saveAuditLog,
  fetchInventoryStock,
  saveInventoryStockItem,
  INITIAL_STOCK
} from './firebaseService';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeScreen, setActiveScreen] = useState<'overview' | 'scanner' | 'reports'>('overview');
  
  // Databases States with LocalStorage and Firebase synchronization
  const [donations, setDonations] = useState<DonationItem[]>(() => {
    const saved = localStorage.getItem('careinventory_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });
  const [needs, setNeeds] = useState<ChildNeed[]>(() => {
    const saved = localStorage.getItem('careinventory_needs');
    return saved ? JSON.parse(saved) : INITIAL_NEEDS;
  });
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('careinventory_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });
  const [inventoryStock, setInventoryStock] = useState<InventoryStockItem[]>(() => {
    const saved = localStorage.getItem('careinventory_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [isLoadingLive, setIsLoadingLive] = useState(true);

  // Fetch from Firebase on Mount
  useEffect(() => {
    async function loadLiveData() {
      try {
        setIsLoadingLive(true);
        const [liveDonations, liveNeeds, liveLogs, liveStock] = await Promise.all([
          fetchDonations(),
          fetchNeeds(),
          fetchLogs(),
          fetchInventoryStock()
        ]);
        
        if (liveDonations && liveDonations.length > 0) setDonations(liveDonations);
        if (liveNeeds && liveNeeds.length > 0) setNeeds(liveNeeds);
        if (liveLogs && liveLogs.length > 0) setLogs(liveLogs);
        if (liveStock && liveStock.length > 0) setInventoryStock(liveStock);
      } catch (err) {
        console.error("Failed to load data from Firebase, falling back to local storage:", err);
      } finally {
        setIsLoadingLive(false);
      }
    }
    loadLiveData();
  }, []);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem('careinventory_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('careinventory_needs', JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    localStorage.setItem('careinventory_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('careinventory_stock', JSON.stringify(inventoryStock));
  }, [inventoryStock]);

  // App Interface states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notifications, setNotifications] = useState<string[]>([
    'Low stock warning: UHT Whole Milk',
    'AI Scanner calibration completed',
    'New vaccine batch verified'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // Handlers
  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    // Auto route depending on role
    if (session.role === 'staff') {
      setActiveScreen('scanner');
    } else {
      setActiveScreen('overview');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    setIsMobileMenuOpen(false);
  };

  const handleUpdateTrackingStatus = async (itemId: string, newStatus: 'Pending' | 'Received' | 'Sorted' | 'Dispatched') => {
    let updatedItem: DonationItem | undefined;

    const originalItem = donations.find(d => d.id === itemId);
    const wasPending = originalItem && (originalItem.trackingStatus === 'Pending' || !originalItem.trackingStatus);
    const isNowReceived = newStatus === 'Received';

    setDonations(prev => prev.map(item => {
      if (item.id === itemId) {
        updatedItem = {
          ...item,
          trackingStatus: newStatus
        };
        return updatedItem;
      }
      return item;
    }));

    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' •');

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      event: `Donation Status Update: [${itemId}] changed to ${newStatus}`,
      entity: userSession ? userSession.name : 'System Core',
      status: 'Verified',
      verified: true
    };

    setLogs(prev => [newLog, ...prev]);

    setNotifications(prev => [
      `Donation [${itemId}] status updated to ${newStatus}`,
      ...prev
    ]);

    // PIPELINE AUTOTRIGGER: When status is changed from Pending to Received
    if (wasPending && isNowReceived && originalItem) {
      const stockId = originalItem.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
      const existingStock = inventoryStock.find(s => s.id === stockId);
      let updatedStockItem: InventoryStockItem;

      if (existingStock) {
        updatedStockItem = {
          ...existingStock,
          qty: existingStock.qty + originalItem.qty
        };
      } else {
        updatedStockItem = {
          id: stockId,
          name: originalItem.name,
          category: originalItem.category,
          qty: originalItem.qty,
          unit: originalItem.unit
        };
      }

      setInventoryStock(prev => {
        const found = prev.some(s => s.id === stockId);
        if (found) {
          return prev.map(s => s.id === stockId ? updatedStockItem : s);
        } else {
          return [updatedStockItem, ...prev];
        }
      });

      try {
        await saveInventoryStockItem(updatedStockItem);
      } catch (err) {
        console.error("Failed to automatically update physical stock on status change:", err);
      }
    }

    if (updatedItem) {
      try {
        await Promise.all([
          saveDonationItem(updatedItem),
          saveAuditLog(newLog)
        ]);
      } catch (err) {
        console.error("Firestore persistence error:", err);
      }
    }
  };

  const handleAddDonation = async (newItem: Omit<DonationItem, 'id'>) => {
    const randomId = `#REG-${Math.floor(Math.random() * 9000) + 1000}`;
    const addedItem: DonationItem = {
      ...newItem,
      id: randomId
    };

    setDonations(prev => [addedItem, ...prev]);

    // Prepend a dynamic audit log
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' •');

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      event: `Donation Vault Addition: ${newItem.qty}x ${newItem.name}`,
      entity: userSession ? userSession.name : 'System Core',
      status: 'Verified',
      verified: true
    };

    setLogs(prev => [newLog, ...prev]);

    // Push real-time notification
    setNotifications(prev => [
      `Registered manual entry: ${newItem.qty}x ${newItem.name}`,
      ...prev
    ]);

    // PIPELINE AUTOTRIGGER: If newly added donation is already Received
    if (addedItem.trackingStatus === 'Received') {
      const stockId = addedItem.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
      const existingStock = inventoryStock.find(s => s.id === stockId);
      let updatedStockItem: InventoryStockItem;

      if (existingStock) {
        updatedStockItem = {
          ...existingStock,
          qty: existingStock.qty + addedItem.qty
        };
      } else {
        updatedStockItem = {
          id: stockId,
          name: addedItem.name,
          category: addedItem.category,
          qty: addedItem.qty,
          unit: addedItem.unit
        };
      }

      setInventoryStock(prev => {
        const found = prev.some(s => s.id === stockId);
        if (found) {
          return prev.map(s => s.id === stockId ? updatedStockItem : s);
        } else {
          return [updatedStockItem, ...prev];
        }
      });

      try {
        await saveInventoryStockItem(updatedStockItem);
      } catch (err) {
        console.error("Failed to automatically update physical stock on manual add:", err);
      }
    }

    // Async write to live Firestore DB
    try {
      await Promise.all([
        saveDonationItem(addedItem),
        saveAuditLog(newLog)
      ]);
    } catch (err) {
      console.error("Firestore persistence error:", err);
    }
  };

  const handleUpdateInventoryStockQty = async (stockId: string, newQty: number) => {
    let updatedStockItem: InventoryStockItem | undefined;

    setInventoryStock(prev => prev.map(item => {
      if (item.id === stockId) {
        updatedStockItem = {
          ...item,
          qty: Math.max(0, newQty)
        };
        return updatedStockItem;
      }
      return item;
    }));

    if (updatedStockItem) {
      try {
        await saveInventoryStockItem(updatedStockItem);

        const timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' •');

        const newLog: AuditLog = {
          id: `LOG-${Date.now()}`,
          timestamp,
          event: `Inventory Stock Correction: [${updatedStockItem.name}] adjusted to ${updatedStockItem.qty} ${updatedStockItem.unit}`,
          entity: userSession ? userSession.name : 'System Core',
          status: 'Verified',
          verified: true
        };

        setLogs(prev => [newLog, ...prev]);
        await saveAuditLog(newLog);

        setNotifications(prev => [
          `Stock updated: [${updatedStockItem!.name}] level set to ${updatedStockItem!.qty}`,
          ...prev
        ]);
      } catch (err) {
        console.error("Firestore persistence error for stock update:", err);
      }
    }
  };

  const handleProcureNeed = async (needId: string) => {
    // Locate target need
    const targetNeed = needs.find(n => n.id === needId);
    if (!targetNeed) return;

    const updatedNeed: ChildNeed = {
      ...targetNeed,
      matchingStatus: 'Match Found',
      statusDetails: `${targetNeed.quantity || 5} emergency kits allocated from logistics pipeline.`
    };

    // Simulate immediate procurement matching
    setNeeds(prev => prev.map(n => {
      if (n.id === needId) {
        return updatedNeed;
      }
      return n;
    }));

    // Prepend log
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' •');

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      event: `Procured Emergency Need: ${targetNeed.title}`,
      entity: 'Logistics Center',
      status: 'Completed',
      verified: true
    };

    setLogs(prev => [newLog, ...prev]);

    // Push notification
    setNotifications(prev => [
      `Emergency Procured: ${targetNeed.title} fully synchronized.`,
      ...prev
    ]);

    // Async write to live Firestore DB
    try {
      await Promise.all([
        saveNeedItem(updatedNeed),
        saveAuditLog(newLog)
      ]);
    } catch (err) {
      console.error("Firestore persistence error:", err);
    }
  };

  // Render Login if no active session
  if (!userSession) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // Filtered donations for the top-bar instant search
  const searchedDonations = searchVal.trim() 
    ? donations.filter(d => d.name.toLowerCase().includes(searchVal.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex font-sans">
      
      {/* 1. LEFT SIDEBAR (Desktop Anchor) */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-surface border-r border-outline-variant/30 hidden md:flex flex-col py-6 z-40">
        {/* Brand Header Logo */}
        <div className="px-6 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-inner">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-primary uppercase">CareInventory</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Resource Management</p>
          </div>
        </div>

        {/* Role Portal Switcher Widget */}
        <div className="px-4 mb-4">
          <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl space-y-2">
            <p className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span>Portal Switcher (Review Mode)</span>
            </p>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              <button 
                onClick={() => {
                  setUserSession(prev => prev ? { ...prev, role: 'donor', title: 'Generous Donor' } : null);
                  setActiveScreen('overview');
                }}
                className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                  userSession.role === 'donor' 
                    ? 'bg-primary text-white shadow-sm font-extrabold scale-[1.02]' 
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'donor' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`}></div>
                <span>Donor Portal View</span>
              </button>
              <button 
                onClick={() => {
                  setUserSession(prev => prev ? { ...prev, role: 'staff', title: 'Warehouse Logistics Pro' } : null);
                  setActiveScreen('scanner');
                }}
                className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                  userSession.role === 'staff' 
                    ? 'bg-primary text-white shadow-sm font-extrabold scale-[1.02]' 
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'staff' ? 'bg-white' : 'bg-blue-500 animate-pulse'}`}></div>
                <span>Staff Operational View</span>
              </button>
              <button 
                onClick={() => {
                  setUserSession(prev => prev ? { ...prev, role: 'supervisor', title: 'Lead Operations Supervisor' } : null);
                  setActiveScreen('overview');
                }}
                className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                  userSession.role === 'supervisor' 
                    ? 'bg-primary text-white shadow-sm font-extrabold scale-[1.02]' 
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'supervisor' ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span>Manager Analytics Panel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScreen === 'overview' 
                ? 'text-primary bg-primary-fixed/30 shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="uppercase tracking-wider">
              {userSession.role === 'donor' ? 'Donor Portal' : 'Overview'}
            </span>
          </button>

          {userSession.role !== 'donor' && (
            <>
              <button 
                onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-outline" />
                <span className="uppercase tracking-wider">Donation Vault</span>
              </button>

              <button 
                onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-outline" />
                <span className="uppercase tracking-wider">Child Needs</span>
              </button>

              <button 
                onClick={() => { setActiveScreen('scanner'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeScreen === 'scanner' 
                    ? 'text-primary bg-primary-fixed/30 shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="uppercase tracking-wider">AI Scanner</span>
              </button>
            </>
          )}

          {userSession.role === 'supervisor' && (
            <button 
              onClick={() => { setActiveScreen('reports'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'reports' 
                  ? 'text-primary bg-primary-fixed/30 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="uppercase tracking-wider">Reports</span>
            </button>
          )}
        </nav>

        {/* Current user session bottom container */}
        <div className="px-4 mt-auto">
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <img 
                className="w-9 h-9 rounded-full object-cover border-2 border-primary-fixed" 
                src={userSession.avatar} 
                alt={userSession.name} 
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-on-surface truncate">{userSession.name}</p>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">{userSession.title}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-white bg-red-50/50 rounded-lg transition-all border border-red-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT SHELL CONTAINER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-surface border-b border-outline-variant/30 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30">
          
          {/* Mobile hamburger menu & branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-1.5 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                <Baby className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xs font-bold uppercase text-primary tracking-tight">CareInventory</h1>
            </div>

            {/* Desktop Navbar Search */}
            <div className="relative hidden sm:block max-w-xs md:max-w-md w-60 md:w-80" id="top-search-bar">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Instant search items..." 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />

              {/* Instant Search Results Floating Dropdown */}
              <AnimatePresence>
                {searchVal && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-11 left-0 right-0 bg-white border border-outline-variant/30 rounded-xl shadow-lg z-50 p-2 text-xs"
                  >
                    <p className="text-[10px] font-bold text-on-surface-variant px-2.5 py-1 uppercase tracking-wider">Search Results</p>
                    <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                      {searchedDonations.length > 0 ? (
                        searchedDonations.map(d => (
                          <div 
                            key={d.id} 
                            onClick={() => {
                              setSearchVal('');
                              setActiveScreen('overview');
                            }}
                            className="p-2 hover:bg-surface-container rounded-lg cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-on-surface">{d.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{d.id} • {d.category}</p>
                            </div>
                            <span className="font-mono font-bold text-primary">{d.qty}x</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-on-surface-variant font-medium">No inventory items matched.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3 relative">
            
            {/* Notification Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-11 w-72 bg-white border border-outline-variant/30 rounded-xl shadow-lg z-50 p-3 text-xs"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20 mb-2">
                      <p className="font-bold text-on-surface uppercase tracking-wider text-[10px]">Recent Alerts</p>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[9px] font-bold text-primary uppercase hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif, i) => (
                          <div key={i} className="flex gap-2 p-1.5 hover:bg-surface-container-low rounded-lg">
                            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-on-surface-variant leading-tight">{notif}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-6 text-on-surface-variant font-medium">No unread notifications.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => console.log('Calibration and setting panel loaded (Local environment: synchronized).')}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Quick action button */}
            <button 
              onClick={() => {
                if (userSession.role === 'donor') {
                  setIsDonateModalOpen(true);
                } else {
                  setActiveScreen('overview');
                }
              }}
              className="bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider animate-pulse"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Donation</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden flex">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative w-64 bg-surface max-h-screen flex flex-col py-6"
              >
                <div className="px-6 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                      <Baby className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-xs font-bold text-primary uppercase">CareInventory</h1>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-surface-container cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Role Portal Switcher Widget */}
                <div className="px-4 mb-4">
                  <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-2">
                    <p className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      <span>Portal Switcher (Review)</span>
                    </p>
                    <div className="grid grid-cols-1 gap-1 text-[11px]">
                      <button 
                        onClick={() => {
                          setUserSession(prev => prev ? { ...prev, role: 'donor', title: 'Generous Donor' } : null);
                          setActiveScreen('overview');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          userSession.role === 'donor' 
                            ? 'bg-primary text-white shadow-sm font-extrabold' 
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'donor' ? 'bg-white' : 'bg-amber-500'}`}></div>
                        <span>Donor Portal View</span>
                      </button>
                      <button 
                        onClick={() => {
                          setUserSession(prev => prev ? { ...prev, role: 'staff', title: 'Warehouse Logistics Pro' } : null);
                          setActiveScreen('scanner');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          userSession.role === 'staff' 
                            ? 'bg-primary text-white shadow-sm font-extrabold' 
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'staff' ? 'bg-white' : 'bg-blue-500'}`}></div>
                        <span>Staff Operational View</span>
                      </button>
                      <button 
                        onClick={() => {
                          setUserSession(prev => prev ? { ...prev, role: 'supervisor', title: 'Lead Operations Supervisor' } : null);
                          setActiveScreen('overview');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          userSession.role === 'supervisor' 
                            ? 'bg-primary text-white shadow-sm font-extrabold' 
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${userSession.role === 'supervisor' ? 'bg-white' : 'bg-emerald-500'}`}></div>
                        <span>Manager Analytics Panel</span>
                      </button>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                  <button 
                    onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeScreen === 'overview' 
                        ? 'text-primary bg-primary-fixed/30' 
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="uppercase tracking-wider">
                      {userSession.role === 'donor' ? 'Donor Portal' : 'Overview'}
                    </span>
                  </button>

                  {userSession.role !== 'donor' && (
                    <>
                      <button 
                        onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                      >
                        <Boxes className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Donation Vault</span>
                      </button>

                      <button 
                        onClick={() => { setActiveScreen('overview'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Child Needs</span>
                      </button>

                      <button 
                        onClick={() => { setActiveScreen('scanner'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeScreen === 'scanner' 
                            ? 'text-primary bg-primary-fixed/30' 
                            : 'text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span className="uppercase tracking-wider">AI Scanner</span>
                      </button>
                    </>
                  )}

                  {userSession.role === 'supervisor' && (
                    <button 
                      onClick={() => { setActiveScreen('reports'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeScreen === 'reports' 
                          ? 'text-primary bg-primary-fixed/30' 
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="uppercase tracking-wider">Reports</span>
                    </button>
                  )}
                </nav>

                <div className="px-4 mt-auto">
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src={userSession.avatar} alt={userSession.name} referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">{userSession.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">{userSession.title}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-white bg-red-50/50 rounded-lg border border-red-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. CORE ROUTER RENDER AREA */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {activeScreen === 'overview' && (
                userSession.role === 'donor' ? (
                  <DonorDashboard 
                    needs={needs}
                    donations={donations}
                    onAddDonation={handleAddDonation}
                    userSession={userSession}
                    isDonateModalOpen={isDonateModalOpen}
                    setIsDonateModalOpen={setIsDonateModalOpen}
                  />
                ) : (
                  <SupervisorDashboard 
                    donations={donations} 
                    needs={needs} 
                    inventoryStock={inventoryStock}
                    userRole={userSession.role}
                    onUpdateInventoryStockQty={handleUpdateInventoryStockQty}
                    onAddDonation={handleAddDonation}
                    onProcureNeed={handleProcureNeed}
                    onUpdateTrackingStatus={handleUpdateTrackingStatus}
                  />
                )
              )}

              {activeScreen === 'scanner' && (
                userSession.role === 'donor' ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-outline-variant/30 rounded-xl shadow-sm text-center px-4">
                    <Lock className="w-12 h-12 text-error mb-4 animate-bounce" />
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Access Denied</h3>
                    <p className="text-xs text-on-surface-variant text-center mt-2 max-w-xs leading-relaxed">
                      You are logged in as a Donor. Only verified staff members can access the AI Scanner interface.
                    </p>
                  </div>
                ) : (
                  <ScannerInterface onAddDonation={handleAddDonation} />
                )
              )}

              {activeScreen === 'reports' && (
                userSession.role !== 'supervisor' ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-outline-variant/30 rounded-xl shadow-sm text-center px-4">
                    <Lock className="w-12 h-12 text-error mb-4 animate-bounce" />
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Access Denied</h3>
                    <p className="text-xs text-on-surface-variant text-center mt-2 max-w-xs leading-relaxed">
                      You are logged in as a {userSession.role}. Only administrators and supervisors can access the Impact Reports and logs dashboard.
                    </p>
                  </div>
                ) : (
                  <ImpactReports 
                    donations={donations} 
                    needs={needs} 
                    logs={logs} 
                    userName={userSession.name} 
                  />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Common status bar footer */}
        <footer className="bg-surface-container-low/50 border-t border-outline-variant/20 p-4 md:px-8 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-75"></span>
              <span className="relative block w-2.5 h-2.5 bg-secondary rounded-full"></span>
            </div>
            <p className="text-on-surface-variant font-medium">
              Firebase DB: <span className={isLoadingLive ? "text-primary font-bold animate-pulse" : "text-secondary font-bold"}>
                {isLoadingLive ? "Synchronizing..." : "Live Cloud Connected"}
              </span>
            </p>
          </div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-center sm:text-right">
            <div>
              <span className="opacity-70 block text-[9px]">Cloud Health</span>
              <span className="font-mono text-xs text-on-surface">99.9%</span>
            </div>
            <div className="border-l border-outline-variant/30 pl-6">
              <span className="opacity-70 block text-[9px]">API Latency</span>
              <span className="font-mono text-xs text-on-surface">24ms</span>
            </div>
            <div className="border-l border-outline-variant/30 pl-6">
              <span className="opacity-70 block text-[9px]">Matching Accuracy</span>
              <span className="font-mono text-xs text-on-surface">97.4%</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
