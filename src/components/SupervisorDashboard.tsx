import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  Truck, 
  Baby, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  Clock, 
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { DonationItem, ChildNeed, InventoryStockItem } from '../types';

interface SupervisorDashboardProps {
  donations: DonationItem[];
  needs: ChildNeed[];
  inventoryStock: InventoryStockItem[];
  userRole?: string;
  onUpdateInventoryStockQty: (id: string, qty: number) => void;
  onAddDonation: (item: Omit<DonationItem, 'id'>) => void;
  onProcureNeed: (id: string) => void;
  onUpdateTrackingStatus?: (id: string, status: 'Pending' | 'Received' | 'Sorted' | 'Dispatched') => void;
}

export default function SupervisorDashboard({ 
  donations, 
  needs, 
  inventoryStock = [],
  userRole = 'supervisor',
  onUpdateInventoryStockQty,
  onAddDonation, 
  onProcureNeed,
  onUpdateTrackingStatus
}: SupervisorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemActionMenu, setSelectedItemActionMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vault' | 'stock'>('vault');

  // New Item Form State
  const [newForm, setNewForm] = useState({
    name: '',
    category: 'Food' as DonationItem['category'],
    qty: 50,
    unit: 'Units',
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ahead
    status: 'Optimal' as DonationItem['status']
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    onAddDonation({
      name: newForm.name,
      category: newForm.category,
      qty: Number(newForm.qty),
      unit: newForm.unit,
      expiry: newForm.expiry,
      status: newForm.status
    });

    // Reset Form
    setNewForm({
      name: '',
      category: 'Food',
      qty: 50,
      unit: 'Units',
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Optimal'
    });
    setIsAddModalOpen(false);
  };

  // Compute metrics
  const totalItemsCount = donations.reduce((acc, curr) => acc + curr.qty, 0);
  const expiringSoonCount = donations.filter(item => {
    // Check if expiry is within 7 days, or is marked critical
    if (item.status === 'Critical') return true;
    const expiryDate = new Date(item.expiry);
    const diffTime = expiryDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }).length;

  const activeNeedsCount = needs.length;
  // Calculate logistical gaps (where needs are searching or needs procurement)
  const gapsCount = needs.filter(n => n.matchingStatus !== 'Match Found').length;

  // Filter donations
  const filteredDonations = donations.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter stock items
  const filteredStock = (inventoryStock || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const urgentSourcingNeeds = (inventoryStock || []).filter(s => s.qty <= 5);

  return (
    <div className="space-y-6">
      {/* Dashboard Overview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-2" id="dashboard-header">
        <div>
          <h2 className="text-2xl font-bold font-sans text-on-surface tracking-tight">Inventory Command</h2>
          <p className="text-xs text-on-surface-variant mt-0.5 font-medium">Real-time resource oversight and logistical matching.</p>
        </div>
        <div className="sm:text-right bg-secondary-container/10 border border-secondary-container/20 px-3 py-1.5 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Last Audit</p>
          <p className="text-xs font-semibold text-secondary">Today, 09:42 AM</p>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metrics">
        {/* Total Donations */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Items</p>
              <h3 className="text-xl font-extrabold text-on-surface mt-0.5">{totalItemsCount.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Expiring Items */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Expiring &lt; 7 Days</p>
              <h3 className="text-xl font-extrabold text-error mt-0.5">{expiringSoonCount}</h3>
            </div>
          </div>
        </div>

        {/* Logistical Gaps */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Logistical Gaps</p>
              <h3 className="text-xl font-extrabold text-tertiary mt-0.5">{gapsCount.toString().padStart(2, '0')}</h3>
            </div>
          </div>
        </div>

        {/* Active Child Needs */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary shadow-inner">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active Needs</p>
              <h3 className="text-xl font-extrabold text-secondary mt-0.5">{activeNeedsCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-outline-variant/30 gap-6 mb-2">
        <button 
          onClick={() => setActiveTab('vault')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 outline-none ${
            activeTab === 'vault' 
              ? 'border-primary text-primary font-extrabold' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Donation Vault Command
        </button>
        <button 
          onClick={() => setActiveTab('stock')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 outline-none ${
            activeTab === 'stock' 
              ? 'border-primary text-primary font-extrabold' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Physical Warehouse Inventory ({inventoryStock.length})
        </button>
      </div>

      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search inventory ID or names..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-2.5 py-1.5 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-transparent border-none font-semibold text-on-surface-variant focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Medical & Nutrition">Medical & Nutrition</option>
              <option value="Food">Food</option>
              <option value="Hygiene">Hygiene</option>
              <option value="Clothing">Clothing</option>
              <option value="Educational">Educational</option>
            </select>
          </div>
          {/* Add Donation Manual */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Donation</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout vs Physical Inventory Stock */}
      {activeTab === 'vault' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donation Vault Column (col-span-8) */}
          <section className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/20" id="vault-section">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Donation Vault</h4>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => {
                    // Simulate CSV downloading
                    const text = donations.map(d => `${d.id},${d.name},${d.category},${d.qty},${d.expiry},${d.status}`).join('\n');
                    const blob = new Blob([`ID,Name,Category,Quantity,Expiry,Status\n` + text], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'donation_vault_export.csv';
                    a.click();
                  }}
                  title="Export to CSV"
                  className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/40">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Item Name</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Category</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30 text-center">Qty</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Expiry / Condition</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Tracking Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 bg-white">
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-on-surface">{item.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">{item.id}</span>
                            {item.donorName && (
                              <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">Donor: {item.donorName}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                            item.category === 'Medical & Nutrition' 
                              ? 'bg-primary-fixed/30 text-primary' 
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-xs font-semibold text-on-surface font-mono">
                          {item.qty} {item.unit}
                        </td>
                        <td className="px-5 py-3 text-xs text-on-surface font-mono">
                          <span className={item.status === 'Critical' ? 'text-error font-semibold' : ''}>
                            {item.expiry}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Optimal' 
                                ? 'bg-secondary' 
                                : item.status === 'Critical' 
                                  ? 'bg-error animate-pulse' 
                                  : 'bg-tertiary'
                            }`}></span>
                            <span className={`text-[10px] font-bold ${
                              item.status === 'Optimal' 
                                ? 'text-secondary' 
                                : item.status === 'Critical' 
                                  ? 'text-error animate-pulse' 
                                  : 'text-tertiary'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={item.trackingStatus || 'Pending'}
                            onChange={(e) => {
                              if (onUpdateTrackingStatus) {
                                onUpdateTrackingStatus(item.id, e.target.value as any);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border outline-none bg-white cursor-pointer transition-all hover:bg-surface-container-low ${
                              item.trackingStatus === 'Dispatched' 
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' 
                                : item.trackingStatus === 'Sorted' 
                                  ? 'border-blue-200 text-blue-700 bg-blue-50/50'
                                  : item.trackingStatus === 'Received' 
                                    ? 'border-purple-200 text-purple-700 bg-purple-50/50'
                                    : 'border-amber-200 text-amber-700 bg-amber-50/50'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Sorted">Sorted</option>
                            <option value="Dispatched">Dispatched</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right relative">
                          <button 
                            onClick={() => setSelectedItemActionMenu(selectedItemActionMenu === item.id ? null : item.id)}
                            className="p-1 rounded hover:bg-surface-container text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {selectedItemActionMenu === item.id && (
                            <div className="absolute right-6 top-10 w-28 bg-white border border-outline-variant/30 rounded-lg shadow-md z-30 py-1 text-left">
                              <button 
                                onClick={() => {
                                  console.log(`Inspecting details for: ${item.name} (${item.id})`);
                                  setSelectedItemActionMenu(null);
                                }}
                                className="w-full px-3 py-1.5 text-[10px] font-bold text-on-surface hover:bg-surface-container-low text-left"
                              >
                                Inspect Item
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveTab('stock');
                                  setSelectedItemActionMenu(null);
                                }}
                                className="w-full px-3 py-1.5 text-[10px] font-bold text-on-surface hover:bg-surface-container-low text-left"
                              >
                                Edit Stock
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-xs text-on-surface-variant">
                        No matching donation items found in the vault.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-3.5 bg-surface-container-low/40 text-center border-t border-outline-variant/20">
              <button className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline cursor-pointer">
                View Full Inventory Log ({donations.length} records)
              </button>
            </div>
          </section>

          {/* Child Needs Column (col-span-4) */}
          <section className="lg:col-span-4 flex flex-col space-y-4" id="needs-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-secondary" />
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Child Needs</h4>
              </div>
              <span className="bg-secondary-container/20 text-on-secondary-container px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border border-secondary-container/30">
                AI MATCH ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {needs.map((need) => (
                <motion.div 
                  key={need.id}
                  layoutId={need.id}
                  className={`bg-white p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border-l-4 hover:-translate-y-0.5 transition-transform cursor-pointer group ${
                    need.priority === 'High' 
                      ? 'border-primary' 
                      : need.priority === 'Urgent' 
                        ? 'border-error' 
                        : 'border-tertiary'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {need.title}
                    </h5>
                    {need.matchingStatus === 'Match Found' ? (
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : need.matchingStatus === 'Searching' ? (
                      <Clock className="w-4 h-4 text-tertiary flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-error flex-shrink-0 animate-bounce" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold tracking-wider ${
                      need.priority === 'Urgent' 
                        ? 'bg-error-container/40 text-error' 
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      Priority: {need.priority}
                    </span>
                    {need.age && (
                      <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[8px] rounded uppercase font-bold tracking-wider">
                        Age: {need.age}
                      </span>
                    )}
                    {need.season && (
                      <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[8px] rounded uppercase font-bold tracking-wider">
                        Season: {need.season}
                      </span>
                    )}
                  </div>

                  {/* Simulated AI Feedback Box */}
                  {need.matchingStatus === 'Match Found' && (
                    <div className="p-2.5 bg-secondary-container/10 border border-secondary-container/30 rounded-lg flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-[8px] font-bold border border-surface">
                        AI
                      </div>
                      <p className="text-[11px] text-on-secondary-container leading-tight">
                        <span className="font-bold">Match Found:</span> {need.statusDetails}
                      </p>
                    </div>
                  )}

                  {need.matchingStatus === 'Searching' && (
                    <div className="p-2.5 bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                      <p className="text-[11px] text-on-tertiary-container leading-tight">
                        <span className="font-bold">Searching:</span> {need.statusDetails}
                      </p>
                    </div>
                  )}

                  {need.matchingStatus === 'Needs Procurement' && (
                    <div className="mt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onProcureNeed(need.id);
                        }}
                        className="w-full py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-[9px] font-bold uppercase tracking-widest hover:shadow-sm transition-all cursor-pointer"
                      >
                        Procure Now
                      </button>
                    </div>
                  )}

                  {/* After procurement triggers matched state */}
                  {need.matchingStatus === 'Match Found' && need.id === '#NEED-003' && (
                    <div className="p-2.5 bg-secondary-container/20 border border-secondary-container/40 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <p className="text-[11px] text-on-secondary-container leading-tight">
                        <span className="font-bold">Sourced:</span> Fulfillments allocated immediately.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Urgent Needs Warning Panel */}
          {urgentSourcingNeeds.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                <span>Urgent Sourcing Priority & Critical Shortages</span>
              </div>
              <p className="text-[11px] text-red-700 font-medium">
                The following active warehouse resources have fallen to critical thresholds (at or below 5 units) or are entirely out of stock. These needs are automatically prioritized on public donor views:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {urgentSourcingNeeds.map(item => (
                  <div key={item.id} className="p-2.5 bg-white border border-red-100 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-extrabold text-on-surface leading-tight">{item.name}</h5>
                      <span className="text-[10px] text-on-surface-variant font-medium">{item.category}</span>
                    </div>
                    <div>
                      {item.qty === 0 ? (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 rounded animate-pulse">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 rounded">
                          CRITICAL: {item.qty} {item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Inventory Stock Table Section */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/20">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Warehouse Stock Registry</h4>
              </div>
              <div className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {filteredStock.length} items found
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/40">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Item Sourced Name</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Category</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Stock Level Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">Manager Correction Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 bg-white">
                  {filteredStock.length > 0 ? (
                    filteredStock.map(item => (
                      <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-on-surface">{item.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">{item.id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider bg-surface-container-high text-on-surface-variant">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {item.qty === 0 ? (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 border border-red-200 rounded animate-pulse">
                                OUT OF STOCK
                              </span>
                            ) : item.qty <= 5 ? (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 rounded">
                                LOW STOCK: {item.qty} {item.unit}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                                OPTIMAL: {item.qty} {item.unit}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {userRole === 'supervisor' ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => onUpdateInventoryStockQty(item.id, Math.max(0, item.qty - 1))}
                                className="p-1 rounded bg-surface-container-low hover:bg-surface-container-medium border border-outline-variant/30 text-on-surface cursor-pointer text-xs font-bold w-6 h-6 flex items-center justify-center transition-all active:scale-95"
                                title="Decrement Stock"
                              >
                                -
                              </button>
                              <input 
                                type="number"
                                min={0}
                                value={item.qty}
                                onChange={(e) => onUpdateInventoryStockQty(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-16 text-center p-1 border border-outline-variant/40 rounded bg-white text-xs font-mono font-semibold focus:ring-1 focus:ring-primary outline-none"
                              />
                              <button 
                                onClick={() => onUpdateInventoryStockQty(item.id, item.qty + 1)}
                                className="p-1 rounded bg-surface-container-low hover:bg-surface-container-medium border border-outline-variant/30 text-on-surface cursor-pointer text-xs font-bold w-6 h-6 flex items-center justify-center transition-all active:scale-95"
                                title="Increment Stock"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs font-semibold font-mono text-on-surface-variant flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/20 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                              <span>{item.qty} {item.unit} (Correction Locked)</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-xs text-on-surface-variant">
                        No matching stock items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Donation Entry Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-outline-variant/30 overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>Register Manual Donation</span>
                </h4>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="e.g. Pediatric Amoxicillin"
                    className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Category</label>
                    <select 
                      value={newForm.category}
                      onChange={(e) => setNewForm({ ...newForm, category: e.target.value as DonationItem['category'] })}
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-colors cursor-pointer font-semibold"
                    >
                      <option value="Medical & Nutrition">Medical & Nutrition</option>
                      <option value="Food">Food</option>
                      <option value="Hygiene">Hygiene</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Educational">Educational</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Quantity</label>
                    <input 
                      type="number" 
                      min={1}
                      required
                      value={newForm.qty}
                      onChange={(e) => setNewForm({ ...newForm, qty: Number(e.target.value) })}
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Expiry Date</label>
                    <input 
                      type="date" 
                      required
                      value={newForm.expiry}
                      onChange={(e) => setNewForm({ ...newForm, expiry: e.target.value })}
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Shelf Status</label>
                    <select 
                      value={newForm.status}
                      onChange={(e) => setNewForm({ ...newForm, status: e.target.value as DonationItem['status'] })}
                      className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-colors cursor-pointer font-semibold"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Stock Low">Stock Low</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] mt-2 cursor-pointer"
                >
                  Confirm Manual Addition
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
