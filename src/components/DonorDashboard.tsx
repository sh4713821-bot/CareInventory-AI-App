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
  Users,
  X,
  Plus,
  RefreshCw,
  Camera,
  FileText
} from 'lucide-react';
import { DonationItem, ChildNeed, UserSession } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const getNormalizedStatus = (rawStatus: string | undefined): string => {
  if (!rawStatus) return 'Submitted';
  const s = rawStatus.toLowerCase().trim();
  
  if (s === 'pending' || s === 'submitted') {
    return 'Submitted';
  }
  if (s === 'received' || s === 'received_at_vault' || s === 'received at vault') {
    return 'Received';
  }
  if (s === 'ai_audited' || s === 'sorted') {
    return 'AI Audited';
  }
  if (s === 'dispatched') {
    return 'Dispatched';
  }
  
  // Case-insensitive / substring checks to prevent any manual database entry typos
  if (s.includes('received') || s.includes('vault')) {
    return 'Received';
  }
  if (s.includes('pending') || s.includes('submit')) {
    return 'Submitted';
  }
  if (s.includes('ai_audited') || s.includes('sort') || s.includes('audit')) {
    return 'AI Audited';
  }
  if (s.includes('dispatch') || s.includes('deliver')) {
    return 'Dispatched';
  }
  
  return 'Submitted';
};

interface DonorDashboardProps {
  needs: ChildNeed[];
  donations: DonationItem[];
  onAddDonation: (item: Omit<DonationItem, 'id'>) => void;
  userSession: UserSession;
  isDonateModalOpen: boolean;
  setIsDonateModalOpen: (open: boolean) => void;
  onUpdateTrackingStatus?: (id: string, status: 'Pending' | 'Received' | 'Sorted' | 'Dispatched') => void;
}

export default function DonorDashboard({ 
  needs, 
  donations, 
  onAddDonation, 
  userSession,
  isDonateModalOpen,
  setIsDonateModalOpen,
  onUpdateTrackingStatus
}: DonorDashboardProps) {
  // Navigation within Donor Dashboard
  const [activeTab, setActiveTab] = useState<'needs' | 'donate' | 'history' | 'track'>('needs');

  // PDF Receipt Generator Feature
  const handleDownloadReceipt = (item: DonationItem) => {
    const doc = new jsPDF();
    
    // Corporate header/branding bar
    doc.setFillColor(30, 58, 138); // Dark corporate blue
    doc.rect(0, 0, 210, 8, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text("CAREINVENTORY RESOURCE MANAGEMENT - OFFICIAL DONATION RECEIPT", 14, 22);
    
    // Divider rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 26, 196, 26);
    
    const donorEmail = `${userSession.name.toLowerCase().replace(/\s+/g, '')}@care.org`;
    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const tableData = [
      ["Receipt Field", "Information Details"],
      ["Unique Donation ID", item.id],
      ["Receipt Date", todayStr],
      ["Donor Name", item.donorName || userSession.name],
      ["Donor Email", donorEmail],
      ["Item Name", item.name],
      ["Category", item.category],
      ["Quantity Approved", `${item.qty} ${item.unit}`],
      ["Inspection Status", item.status || "Optimal"]
    ];
    
    (doc as any).autoTable({
      startY: 32,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 55 },
        1: { textColor: [15, 23, 42] }
      },
      gridLineColor: [226, 232, 240]
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    
    // Add authorized signature block
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Signature: CareInventory Logistics Officer", 14, finalY + 12);
    doc.line(14, finalY + 18, 100, finalY + 18);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text("Thank you for your generous support.", 14, finalY + 28);
    
    doc.save(`Donation_Receipt_${item.id.replace('#', '')}.pdf`);
  };
  
  // Track Donation State
  const [trackId, setTrackId] = useState('');
  const [searchedId, setSearchedId] = useState('');

  // Submit Donation Form States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Food'); // Food, Clothing, Medical, Supply
  const [formQty, setFormQty] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('Units');
  const [formExpiry, setFormExpiry] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Scanning simulation states
  const [isScanningDropoff, setIsScanningDropoff] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Auto-set form from an Active Need and open Modal instantly
  const handleDonateNeed = (need: ChildNeed) => {
    setFormName(need.title);
    setFormQty(need.quantity || 10);
    if (need.title.toLowerCase().includes('milk') || need.title.toLowerCase().includes('food') || need.title.toLowerCase().includes('formula')) {
      setFormCategory('Food');
    } else if (need.title.toLowerCase().includes('medical') || need.title.toLowerCase().includes('kit') || need.title.toLowerCase().includes('vaccine')) {
      setFormCategory('Medical');
    } else if (need.title.toLowerCase().includes('clothing') || need.title.toLowerCase().includes('jacket') || need.title.toLowerCase().includes('coat')) {
      setFormCategory('Clothing');
    } else if (need.title.toLowerCase().includes('school') || need.title.toLowerCase().includes('kit') || need.title.toLowerCase().includes('book')) {
      setFormCategory('Supply');
    } else {
      setFormCategory('Supply');
    }
    
    // Default expiry 3 months from now
    const fut = new Date();
    fut.setMonth(fut.getMonth() + 3);
    setFormExpiry(fut.toISOString().split('T')[0]);

    setIsDonateModalOpen(true);
  };

  // Handle donation submission
  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      return;
    }

    // Map Category
    let finalCategory: DonationItem['category'] = 'Food';
    if (formCategory === 'Medical') finalCategory = 'Medical & Nutrition';
    else if (formCategory === 'Clothing') finalCategory = 'Clothing';
    else if (formCategory === 'Supply') finalCategory = 'Hygiene';

    onAddDonation({
      name: formName,
      category: finalCategory,
      qty: formQty,
      unit: formUnit,
      expiry: formExpiry || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Optimal',
      trackingStatus: 'Pending',
      donorName: userSession.name,
      description: formDescription
    });

    setSuccessMsg(`Thank you! Your donation of ${formQty} ${formUnit} of "${formName}" has been logged and is awaiting collection/drop-off.`);
    
    // Clear Form
    setFormName('');
    setFormQty(10);
    setFormExpiry('');
    setFormDescription('');
    setIsDonateModalOpen(false);

    // Reset success message after 4 seconds and route to history
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('history');
    }, 4000);
  };

  // Perform Donation Tracking search
  const handleTrackDonation = (idToTrack: string) => {
    const formattedId = idToTrack.trim().toUpperCase();
    setSearchedId(formattedId);
    setScanSuccess(false);
  };

  // Reactively computed trackResult from global donations
  const trackResult = searchedId
    ? donations.find(d => 
        d.id.toUpperCase() === searchedId || 
        d.id.replace('#', '').toUpperCase() === searchedId ||
        d.id.replace('REG-', '').toUpperCase() === searchedId
      ) || null
    : null;

  // Handle live dropoff barcode verification
  const handleTriggerDropoffScan = () => {
    if (!trackResult) return;
    setIsScanningDropoff(true);
    setScanSuccess(false);

    setTimeout(() => {
      setIsScanningDropoff(false);
      setScanSuccess(true);
      if (onUpdateTrackingStatus) {
        onUpdateTrackingStatus(trackResult.id, 'Received');
      }
    }, 2000);
  };

  // Track tab auto pre-fill with #REG-3542
  React.useEffect(() => {
    if (activeTab === 'track' && !trackId) {
      setTrackId('#REG-3542');
      handleTrackDonation('#REG-3542');
    }
  }, [activeTab]);

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
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-10 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Gift className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-on-surface text-base">Fulfill Direct Needs or Register Cargo</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-md mx-auto">
                  Click the button below to log physical cargo items (Food, Clothing, Medical, Supply) into our secure catalog ledger and obtain a real-time tracking barcode telemetry ID.
                </p>
              </div>
              
              <button 
                onClick={() => setIsDonateModalOpen(true)}
                className="bg-primary hover:bg-primary-container text-on-primary font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-wider cursor-pointer animate-pulse"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Open Relief Contribution Form</span>
              </button>

              <div className="pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-4 text-left text-xs text-on-surface-variant">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <span className="font-bold text-on-surface block text-[10px] uppercase tracking-wider mb-1">Standard Guidelines:</span>
                  <p className="text-[10px] leading-snug">All infant formula, food packages and medical lots must have &gt;90 days expiry.</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <span className="font-bold text-on-surface block text-[10px] uppercase tracking-wider mb-1">Real-time Telemetry:</span>
                  <p className="text-[10px] leading-snug">Every submitted item earns a barcode tracking ID to observe sorting milestones.</p>
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
                          const status = (item.trackingStatus || 'Pending') as string;
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
                              <td className="p-3.5">
                                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3">
                                  {(status === 'Received' || status === 'Completed' || status === 'Sorted' || status === 'Dispatched') && (
                                    <button 
                                      onClick={() => handleDownloadReceipt(item)}
                                      className="text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1.5 text-[11px] uppercase tracking-wider cursor-pointer"
                                      title="Download official PDF receipt"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Download Receipt</span>
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setTrackId(item.id);
                                      handleTrackDonation(item.id);
                                      setActiveTab('track');
                                    }}
                                    className="text-primary hover:text-primary-container font-extrabold flex items-center gap-0.5 text-[11px] uppercase tracking-wider cursor-pointer"
                                  >
                                    <span>Track Package</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
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
                      </div>                      {/* Grid for Stepper and Live Drop-off Simulator Scanner */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Stepper (col-span-8) */}
                        <div className="lg:col-span-8 bg-surface-container-low/30 p-5 rounded-2xl border border-outline-variant/10">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Relief Logistics Pipeline</p>
                          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 py-4">
                            {/* Horizontal connecting background line for desktop */}
                            <div className="absolute top-5 left-6 right-6 h-0.5 bg-surface-container hidden md:block z-0"></div>

                            {/* Stepper items */}
                            {[
                              { 
                                step: 'Submitted', 
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
                                step: 'AI Audited', 
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
                              const stepsOrder = ['Submitted', 'Received', 'AI Audited', 'Dispatched'];
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

                        {/* Drop-off scanner simulator card (col-span-4) */}
                        <div className="lg:col-span-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between h-[320px]">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-primary" />
                              <span>Field QR / Barcode Laser Drop-off Scanner</span>
                            </h4>
                            <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                              Simulate scanning the shipment label barcode at the local warehouse field station.
                            </p>
                          </div>

                          <div className="relative my-3 border-2 border-dashed border-primary/40 bg-black/95 rounded-xl flex-1 flex flex-col items-center justify-center p-4 overflow-hidden min-h-[140px]">
                            {isScanningDropoff ? (
                              <div className="text-center space-y-2 z-10">
                                <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto animate-reverse" />
                                <p className="text-[9px] text-primary font-bold animate-pulse font-mono">Laser targeting box...</p>
                                <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_#1e3a8a] animate-bounce top-1/2"></div>
                              </div>
                            ) : scanSuccess || getNormalizedStatus(trackResult.trackingStatus) !== 'Submitted' ? (
                              <div className="text-center space-y-1 z-10 p-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                                <p className="text-[10px] text-emerald-400 font-extrabold font-mono leading-none">BEEP! INTAKE SUCCESS</p>
                                <p className="text-[9px] text-white/95 leading-tight mt-1">Barcode cataloged. Updated to <span className="text-emerald-300 font-bold">Received at Vault</span>.</p>
                                <button 
                                  onClick={() => setScanSuccess(false)}
                                  className="text-[9px] text-primary-fixed hover:underline font-bold mt-1"
                                >
                                  Scan Again
                                </button>
                              </div>
                            ) : (
                              <div className="text-center space-y-1 text-white/40 z-10 p-1">
                                <Package className="w-6 h-6 mx-auto opacity-50" />
                                <p className="text-[9px] text-white/60 font-medium">Camera Frame Live</p>
                                <button 
                                  onClick={handleTriggerDropoffScan}
                                  className="px-2 py-1 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-[9px] font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  Simulate Drop-off Scan
                                </button>
                              </div>
                            )}

                            {/* Corner frames */}
                            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary/50"></div>
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary/50"></div>
                            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary/50"></div>
                            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary/50"></div>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-outline-variant/10 text-[9px] text-on-surface-variant leading-relaxed">
                            <strong>Note:</strong> Simulates field scanner. Promotes test-driven traversal of tracking points.
                          </div>
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

      {/* Beautiful Modal Overlay for Donation Submission */}
      <AnimatePresence>
        {isDonateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDonateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-outline-variant/30 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20 flex-shrink-0">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Gift className="w-4.5 h-4.5 text-primary animate-bounce" />
                  <span>Relief Contribution Ledger</span>
                </h4>
                <button 
                  onClick={() => setIsDonateModalOpen(false)}
                  className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 flex-1 pr-1">
                {successMsg && (
                  <div className="p-3.5 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-emerald-800 leading-relaxed">{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitDonation} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Relief Item Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Infamil Infant Formula Pack, Winter Blankets"
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                        Category *
                      </label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer font-semibold text-on-surface"
                      >
                        <option value="Food">Food / Nutrition</option>
                        <option value="Clothing">Clothing / Apparel</option>
                        <option value="Medical">Medical Supplies</option>
                        <option value="Supply">General Supplies</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                          Quantity
                        </label>
                        <input 
                          type="number" 
                          min={1}
                          required
                          value={formQty}
                          onChange={(e) => setFormQty(Number(e.target.value))}
                          className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-mono font-bold text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                          Unit
                        </label>
                        <input 
                          type="text" 
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          placeholder="Packs, Units, Cases"
                          className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-semibold text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Description / Note
                    </label>
                    <textarea 
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Specify size, expiration date guidance, package quantity detail, or sector designations."
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-medium resize-none text-on-surface"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Expiration Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      value={formExpiry}
                      onChange={(e) => setFormExpiry(e.target.value)}
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-semibold text-on-surface"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 bg-primary hover:bg-primary-container text-on-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Gift className="w-4.5 h-4.5" />
                    <span>Log Shipment to CareInventory</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
