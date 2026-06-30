import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Gift, 
  Search, 
  History, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Package, 
  Truck, 
  ListTodo,
  Smile,
  Users
} from 'lucide-react';
import { DonationItem, ChildNeed, UserSession } from '../types';

const getNormalizedStatus = (rawStatus: string | undefined): string => {
  if (!rawStatus) return 'Pending';
  const s = rawStatus.toLowerCase().trim();
  
  if (s === 'received' || s === 'received_at_vault' || s === 'received at vault') {
    return 'Received';
  }
  if (s === 'pending') {
    return 'Pending';
  }
  if (s === 'sorted') {
    return 'Sorted';
  }
  if (s === 'dispatched') {
    return 'Dispatched';
  }
  
  // Case-insensitive / substring checks to prevent any manual database entry typos
  if (s.includes('received') || s.includes('vault')) {
    return 'Received';
  }
  if (s.includes('pending')) {
    return 'Pending';
  }
  if (s.includes('sort')) {
    return 'Sorted';
  }
  if (s.includes('dispatch')) {
    return 'Dispatched';
  }
  
  return 'Pending';
};

interface DonorDashboardProps {
  needs: ChildNeed[];
  donations: DonationItem[];
  onAddDonation: (item: Omit<DonationItem, 'id'>) => void;
  userSession: UserSession;
}

export default function DonorDashboard({ needs, donations, onAddDonation, userSession }: DonorDashboardProps) {
  // Navigation within Donor Dashboard
  const [activeTab, setActiveTab] = useState<'needs' | 'donate' | 'history' | 'track'>('needs');
  
  // Track Donation State
  const [trackId, setTrackId] = useState('');
  const [searchedId, setSearchedId] = useState('');
  const [trackResult, setTrackResult] = useState<DonationItem | null>(null);

  // Submit Donation Form States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<DonationItem['category']>('Food');
  const [formQty, setFormQty] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('Units');
  const [formExpiry, setFormExpiry] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-set form from an Active Need
  const handleDonateNeed = (need: ChildNeed) => {
    setFormName(need.title);
    setFormQty(need.quantity || 10);
    if (need.title.toLowerCase().includes('milk') || need.title.toLowerCase().includes('food') || need.title.toLowerCase().includes('formula')) {
      setFormCategory('Food');
    } else if (need.title.toLowerCase().includes('medical') || need.title.toLowerCase().includes('kit') || need.title.toLowerCase().includes('vaccine')) {
      setFormCategory('Medical & Nutrition');
    } else if (need.title.toLowerCase().includes('clothing') || need.title.toLowerCase().includes('jacket') || need.title.toLowerCase().includes('coat')) {
      setFormCategory('Clothing');
    } else if (need.title.toLowerCase().includes('school') || need.title.toLowerCase().includes('kit') || need.title.toLowerCase().includes('book')) {
      setFormCategory('Educational');
    } else {
      setFormCategory('Hygiene');
    }
    
    // Default expiry 3 months from now
    const fut = new Date();
    fut.setMonth(fut.getMonth() + 3);
    setFormExpiry(fut.toISOString().split('T')[0]);

    setActiveTab('donate');
  };

  // Handle donation submission
  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formExpiry) {
      alert('Please fill out all required fields.');
      return;
    }

    onAddDonation({
      name: formName,
      category: formCategory,
      qty: formQty,
      unit: formUnit,
      expiry: formExpiry,
      status: 'Optimal',
      trackingStatus: 'Pending',
      donorName: userSession.name
    });

    setSuccessMsg(`Thank you! Your donation of ${formQty} ${formUnit} of "${formName}" has been logged and is awaiting collection/drop-off.`);
    
    // Clear Form
    setFormName('');
    setFormQty(10);
    setFormExpiry('');

    // Reset success message after 5 seconds
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('history');
    }, 4000);
  };

  // Perform Donation Tracking search
  const handleTrackDonation = (idToTrack: string) => {
    const formattedId = idToTrack.trim().toUpperCase();
    setSearchedId(formattedId);

    // Find in global donations list
    const found = donations.find(d => 
      d.id.toUpperCase() === formattedId || 
      d.id.replace('#', '').toUpperCase() === formattedId ||
      d.id.replace('REG-', '').toUpperCase() === formattedId
    );

    if (found) {
      setTrackResult(found);
    } else {
      setTrackResult(null);
    }
  };

  // Filter personal history
  const personalHistory = donations.filter(d => 
    d.donorName === userSession.name || 
    (userSession.name === 'Alexander Reed' && !d.donorName) // Match legacy mock donations to user
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Banner */}
      <div className="relative bg-primary text-on-primary p-6 rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        {/* Abstract pattern backdrop */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                Donor Portal Active
              </span>
            </div>
            <h2 className="text-2xl font-extrabold font-sans mt-2 tracking-tight">Welcome, {userSession.name}!</h2>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium leading-relaxed">
              Your compassion ensures children receive vital health, nutrition, and warmth. View active needs, submit your relief packages, and trace their progress straight to our field distribution centers.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-white/70 tracking-wider">My Sourced Contributions</p>
              <p className="text-lg font-black leading-none mt-0.5">{personalHistory.length} Shipments</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/30 max-w-md">
        <button 
          onClick={() => setActiveTab('needs')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
            activeTab === 'needs' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Active Needs</span>
        </button>

        <button 
          onClick={() => setActiveTab('donate')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
            activeTab === 'donate' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Donate</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
            activeTab === 'history' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({personalHistory.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
            activeTab === 'track' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Track</span>
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="min-h-[350px]"
        >
          {/* A. ACTIVE NEEDS TAB */}
          {activeTab === 'needs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Urgent Support Required</h3>
                  <p className="text-xs text-on-surface-variant">Real-time requests logged directly from field staff and child coordinators.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {needs.map(need => (
                  <div 
                    key={need.id} 
                    className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          need.priority === 'Urgent' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : need.priority === 'High' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {need.priority} Priority
                        </span>
                        <span className="text-[10px] font-mono text-outline">{need.id}</span>
                      </div>

                      <h4 className="font-extrabold text-on-surface text-sm tracking-tight leading-snug">{need.title}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                        {need.age && (
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-outline block">Age Bracket</span>
                            <span className="font-bold text-on-surface">{need.age}</span>
                          </div>
                        )}
                        {need.quantity && (
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-outline block">Est. Shortage</span>
                            <span className="font-bold text-on-surface font-mono">{need.quantity} Units</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20 text-xs">
                        <p className="text-on-surface-variant italic leading-tight">"{need.statusDetails}"</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDonateNeed(need)}
                      className="w-full mt-4 bg-primary/10 hover:bg-primary hover:text-on-primary text-primary font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Fulfill This Need</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. DONATE SUBMISSION FORM TAB */}
          {activeTab === 'donate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Layout (col-span-8) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>Relief Contribution Form</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Please specify details of the physical aid you wish to log and deliver.</p>
                </div>

                {successMsg && (
                  <div className="p-4 bg-secondary-container/20 border border-secondary-container/40 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-on-secondary-container leading-relaxed">{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitDonation} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Item Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block" htmlFor="form-name">
                        Aid Item / Package Name *
                      </label>
                      <input 
                        type="text" 
                        id="form-name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Infamil Infant Formula Pack, Winter Boots Size 4"
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-on-surface"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block" htmlFor="form-cat">
                        Resource Category *
                      </label>
                      <select 
                        id="form-cat"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as DonationItem['category'])}
                        className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-on-surface"
                      >
                        <option value="Food">Food / Nutrition</option>
                        <option value="Medical & Nutrition">Medical Supplies</option>
                        <option value="Clothing">Clothing & Footwear</option>
                        <option value="Hygiene">Hygiene Kits</option>
                        <option value="Educational">Educational Supplies</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block" htmlFor="form-qty">
                          Quantity
                        </label>
                        <input 
                          type="number" 
                          id="form-qty"
                          min="1"
                          value={formQty}
                          onChange={(e) => setFormQty(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block" htmlFor="form-unit">
                          Unit
                        </label>
                        <input 
                          type="text" 
                          id="form-unit"
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          placeholder="Kits, Packs, Units"
                          className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-on-surface"
                        />
                      </div>
                    </div>

                    {/* Expiration Date */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block" htmlFor="form-exp">
                        Expiration / Best Before Date *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
                          <Calendar className="w-4 h-4" />
                        </span>
                        <input 
                          type="date" 
                          id="form-exp"
                          value={formExpiry}
                          onChange={(e) => setFormExpiry(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-on-surface"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Submit Relief Package</span>
                  </button>
                </form>
              </div>

              {/* Tips & Instructions (col-span-4) */}
              <div className="lg:col-span-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span>Submission Guidance</span>
                </h4>
                
                <div className="space-y-3.5 text-xs text-on-surface-variant">
                  <p className="leading-relaxed">
                    By submitting this form, you request a pickup or dropdown coordinate.
                  </p>
                  
                  <div className="bg-white p-3.5 rounded-xl border border-outline-variant/10 shadow-inner space-y-2">
                    <p className="font-extrabold uppercase text-[9px] text-on-surface tracking-wider">Acceptable Standards:</p>
                    <ul className="list-disc pl-4 space-y-1 leading-normal text-on-surface-variant">
                      <li>Non-perishable items must have at least <strong>90 days</strong> of remaining validity.</li>
                      <li>Formula tins must be fully sealed and original packaging undamaged.</li>
                      <li>Clothing items are cleaned and sorted by age category.</li>
                    </ul>
                  </div>

                  <div className="flex gap-2 p-3 bg-secondary-container/10 border border-secondary/20 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium leading-relaxed text-on-secondary-container-variant">
                      Your items will receive a custom <strong>Tracking ID</strong> (e.g. #REG-1209) on submission. Use this ID on the "Track" screen to observe live transit metrics!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. PERSONAL DONATION HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">My Sourced Relieves</h3>
                <p className="text-xs text-on-surface-variant">History of your contributions and their direct log states.</p>
              </div>

              {personalHistory.length > 0 ? (
                <div className="bg-white border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 bg-surface-container-low/40">
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tracking ID</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Item Sourced</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Category</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Quantity</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Logs Date</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Delivery Status</th>
                          <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                        {personalHistory.map(item => {
                          const status = item.trackingStatus || 'Pending';
                          return (
                            <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="p-3.5 font-bold font-mono text-primary select-all">{item.id}</td>
                              <td className="p-3.5 font-bold">{item.name}</td>
                              <td className="p-3.5 font-medium text-on-surface-variant">{item.category}</td>
                              <td className="p-3.5 font-mono font-extrabold">{item.qty} {item.unit}</td>
                              <td className="p-3.5 font-medium text-on-surface-variant">{item.expiry}</td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                  status === 'Dispatched' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : status === 'Sorted' 
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : status === 'Received' 
                                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    status === 'Dispatched' ? 'bg-emerald-500' : status === 'Sorted' ? 'bg-blue-500' : status === 'Received' ? 'bg-purple-500' : 'bg-amber-500 animate-pulse'
                                  }`}></span>
                                  <span>{status}</span>
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button 
                                  onClick={() => {
                                    setTrackId(item.id);
                                    handleTrackDonation(item.id);
                                    setActiveTab('track');
                                  }}
                                  className="text-primary hover:text-primary-container font-extrabold flex items-center gap-0.5 ml-auto text-[11px] uppercase tracking-wider"
                                >
                                  <span>Track Package</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-outline-variant/20 p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mx-auto text-outline">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">No Historical Donations Sourced</h4>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                      You haven't logged any relieve packages with this account yet. Click "Donate" to submit your first box!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* D. TRACK MY DONATION TAB */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              {/* Tracker input panel */}
              <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm max-w-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Trace Relieve Status</span>
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  Enter any active Donation Tracking ID (e.g., #REG-2051 or any code from your historical tables) to review real-time sorting and transit metrics.
                </p>

                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Enter Tracking ID (e.g. #REG-1200)"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTrackDonation(trackId);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold uppercase tracking-wide"
                    />
                  </div>
                  <button 
                    onClick={() => handleTrackDonation(trackId)}
                    className="bg-primary hover:bg-primary-container text-on-primary font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Search</span>
                  </button>
                </div>

                {/* Micro recommendation suggestions */}
                {personalHistory.length > 0 && (
                  <div className="mt-3.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quick Select:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {personalHistory.slice(0, 3).map(h => (
                        <button 
                          key={h.id}
                          onClick={() => {
                            setTrackId(h.id);
                            handleTrackDonation(h.id);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-outline-variant bg-surface-container-low text-primary hover:bg-white transition-all font-mono cursor-pointer"
                        >
                          {h.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Result Visual Stepper */}
              {searchedId && (
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm max-w-4xl space-y-6">
                  {trackResult ? (
                    <div>
                      {/* Active shipment detail header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-outline-variant/10">
                        <div>
                          <p className="text-[9px] font-bold text-primary font-mono uppercase tracking-wider">Active Cargo Match</p>
                          <h4 className="text-lg font-black text-on-surface mt-0.5">{trackResult.name}</h4>
                          <p className="text-xs text-on-surface-variant font-medium">Category: {trackResult.category} • Quantity: {trackResult.qty} {trackResult.unit}</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/20 px-3.5 py-2 rounded-xl text-right">
                          <span className="text-[9px] uppercase tracking-wider text-outline block">Shipment ID</span>
                          <span className="font-mono text-xs font-bold text-on-surface select-all">{trackResult.id}</span>
                        </div>
                      </div>

                      {/* Animated Stepper Track */}
                      <div className="py-8 px-4">
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                          {/* Horizontal connecting background line for desktop */}
                          <div className="absolute top-5 left-6 right-6 h-0.5 bg-surface-container hidden md:block z-0"></div>

                          {/* Stepper items */}
                          {[
                            { 
                              step: 'Pending', 
                              title: 'Relief Submitted', 
                              desc: 'Item registered into CareInventory. Drop-off/Pickup requested.',
                              icon: Clock,
                              color: 'text-amber-500 bg-amber-50 border-amber-500'
                            },
                            { 
                              step: 'Received', 
                              title: 'Received at Vault', 
                              desc: 'Field center processed item arrival & calibrated weight.',
                              icon: Package,
                              color: 'text-purple-500 bg-purple-50 border-purple-500'
                            },
                            { 
                              step: 'Sorted', 
                              title: 'AI Audited & Sorted', 
                              desc: 'MobileNet computer vision scanned item to verify optimal metrics.',
                              icon: Sparkles,
                              color: 'text-blue-500 bg-blue-50 border-blue-500'
                            },
                            { 
                              step: 'Dispatched', 
                              title: 'Dispatched to Children', 
                              desc: 'Resource allocated and delivered directly to the designated zone.',
                              icon: CheckCircle2,
                              color: 'text-emerald-500 bg-emerald-50 border-emerald-500'
                            }
                          ].map((stepDef, idx) => {
                            const stepsOrder = ['Pending', 'Received', 'Sorted', 'Dispatched'];
                            const currentStepIdx = stepsOrder.indexOf(getNormalizedStatus(trackResult.trackingStatus));
                            const targetStepIdx = stepsOrder.indexOf(stepDef.step as any);
                            const isActive = targetStepIdx <= currentStepIdx;

                            const IconComp = stepDef.icon;

                            return (
                              <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative z-10 max-w-xs md:flex-1 gap-4 md:gap-3">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isActive 
                                    ? 'bg-primary text-white border-primary shadow-md scale-110' 
                                    : 'bg-white text-outline border-surface-container'
                                }`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                <div>
                                  <h5 className={`text-xs font-extrabold tracking-tight ${isActive ? 'text-on-surface' : 'text-outline'}`}>{stepDef.title}</h5>
                                  <p className="text-[10px] text-on-surface-variant leading-snug mt-1 max-w-[180px] md:mx-auto">{stepDef.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Current Status HUD Banner */}
                      <div className="bg-primary/5 border border-primary/20 p-4.5 rounded-xl flex items-center gap-3">
                        <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-on-surface">Transit Highlight</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                            Your donation is currently flagged as <span className="font-bold text-primary uppercase">{(trackResult.trackingStatus || 'Pending')}</span>. Logistics centers update tracking points as scanning lasers catalog each cargo box automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3 bg-red-50/50 border border-red-100 rounded-2xl">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-red-800">Tracking Code Not Found</h4>
                        <p className="text-xs text-red-700 mt-1 max-w-sm mx-auto font-medium">
                          We couldn't locate any relief package matching "<span className="font-bold font-mono">{searchedId}</span>" in our active Firestore database logs. Please double-check formatting (e.g., #REG-2051) and try again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 3. Global Compassionate Counter Widget */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Happy Children</p>
            <h4 className="text-xl font-black text-on-surface leading-none mt-1">1,284</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active Relief Sourced</p>
            <h4 className="text-xl font-black text-on-surface leading-none mt-1">{donations.length} Items</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Registered Volunteers</p>
            <h4 className="text-xl font-black text-on-surface leading-none mt-1">42 Field Members</h4>
          </div>
        </div>
      </section>

    </div>
  );
}
