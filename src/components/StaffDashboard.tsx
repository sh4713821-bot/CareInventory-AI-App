import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  TrendingDown, 
  Activity, 
  FileSpreadsheet, 
  Sparkles,
  AlertCircle,
  Truck,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { DonationItem } from '../types';

interface StaffDashboardProps {
  donations: DonationItem[];
  onUpdateTrackingStatus: (id: string, status: 'Pending' | 'Received' | 'Sorted' | 'Dispatched') => void;
  onAddDonation: (item: Omit<DonationItem, 'id'>) => void;
}

export default function StaffDashboard({ donations, onUpdateTrackingStatus, onAddDonation }: StaffDashboardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated weight logs state
  const [weightLogs, setWeightLogs] = useState<Array<{ id: string; name: string; weight: string; timestamp: string; status: string }>>([
    { id: 'REG-3542', name: 'Thermal Blankets & Winter Jackets Pack', weight: '22.4 kg', timestamp: 'Today, 10:30 AM', status: 'Calibrated' },
    { id: 'REG-9283', name: 'Baby Formula (Stage 1)', weight: '45.1 kg', timestamp: 'Today, 09:12 AM', status: 'Calibrated' },
    { id: 'REG-4451', name: 'Hygiene Kits (Type A)', weight: '12.8 kg', timestamp: 'Yesterday, 04:45 PM', status: 'Stable' },
  ]);

  // Simulate scanning QR Code
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScannedResult(null);
    setScanMessage("Activating scanning laser... Please align QR code in camera view.");

    setTimeout(() => {
      // Pick a random pending donation to scan
      const pendingDonations = donations.filter(d => !d.trackingStatus || d.trackingStatus === 'Pending');
      if (pendingDonations.length === 0) {
        setIsScanning(false);
        setScanMessage(null);
        setScannedResult("No pending items in queue. Register a new donation first!");
        return;
      }

      const randomItem = pendingDonations[Math.floor(Math.random() * pendingDonations.length)];
      const docId = randomItem.id;
      
      onUpdateTrackingStatus(randomItem.id, 'Received');
      
      // Add a calibration log
      const measuredWeight = (Math.random() * 30 + 5).toFixed(1) + " kg";
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Live)";
      
      setWeightLogs(prev => [
        { id: docId.replace('#', 'REG-'), name: randomItem.name, weight: measuredWeight, timestamp: `Today, ${timestamp}`, status: 'Calibrated' },
        ...prev
      ]);

      setScannedResult(`Success: Scanned and verified [${docId}] - ${randomItem.name}`);
      setIsScanning(false);
      setScanMessage(null);
    }, 2500);
  };

  // Filter donations for search
  const filteredDonations = donations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-primary/10 rounded text-primary text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-primary" />
            Field Operations Live
          </span>
          <h2 className="text-xl font-black font-sans text-on-surface tracking-tight mt-1">Staff Operational Dashboard</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Logistics intake verification, real-time weight calibration, and QR verification routing.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="bg-primary hover:bg-primary-container text-on-primary font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-75"
          >
            <Camera className="w-4 h-4" />
            <span>{isScanning ? "Scanning..." : "Simulate QR Scan"}</span>
          </button>
        </div>
      </div>

      {/* Grid: Scan and Weight calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* QR Verification Scanner Simulator (col-span-4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-primary" />
              <span>QR Intake Scanner</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Verify incoming shipments by simulating a field barcode or QR scan. Moves cargo to 'Received at Vault' state instantly.
            </p>
          </div>

          <div className="relative my-4 border-2 border-dashed border-outline-variant/40 bg-surface-container-low rounded-xl flex-1 flex flex-col items-center justify-center p-4 overflow-hidden min-h-[160px]">
            {isScanning ? (
              <div className="text-center space-y-3 z-10">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-[11px] text-primary font-extrabold animate-pulse font-mono">{scanMessage}</p>
                <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_#1e3a8a] animate-bounce top-1/2"></div>
              </div>
            ) : scannedResult ? (
              <div className="text-center space-y-2 z-10 p-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-[11px] text-emerald-800 font-extrabold leading-tight">{scannedResult}</p>
                <button 
                  onClick={() => setScannedResult(null)}
                  className="text-[10px] text-primary hover:underline font-bold mt-1"
                >
                  Clear Results
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 text-outline z-10 p-2">
                <Package className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-[11px] text-on-surface-variant font-medium">Ready to Calibrate Cargo Intake</p>
                <button 
                  onClick={handleSimulateScan}
                  className="px-3 py-1 bg-white hover:bg-surface-container border border-outline-variant/40 rounded-lg text-[10px] font-bold text-primary transition-all shadow-sm"
                >
                  Start Simulator Laser
                </button>
              </div>
            )}
            
            {/* Camera corners UI overlay decoration */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-outline-variant/50"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-outline-variant/50"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-outline-variant/50"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-outline-variant/50"></div>
          </div>

          <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-[10px] text-on-surface-variant leading-relaxed">
            <strong>Intake Calibration rule:</strong> All packages must be verified via computer vision and scaled for physical weight before inventory storage.
          </div>
        </div>

        {/* Weight Calibration Scale Logs (col-span-8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-secondary" />
                <span>Weight Scale Calibration Logs</span>
              </h3>
              <span className="text-[10px] bg-secondary-container/20 text-on-secondary-container px-2 py-0.5 rounded-full font-bold">Stable</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Live physical metrics logged automatically from warehouse load cells. Ensures accuracy between declared and real shipment metrics.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
            {weightLogs.map((log, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10 flex items-center justify-between text-xs transition-all hover:bg-surface-container-medium/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-mono font-bold text-[10px]">
                    {log.weight.replace(' kg', '')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-on-surface text-xs leading-tight">{log.name}</h4>
                    <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">ID: {log.id} • {log.timestamp}</p>
                  </div>
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-on-surface-variant text-center pt-2 italic">
            Integrating IoT Scale Sensors v2.4a. Local status is fully synchronized.
          </p>
        </div>

      </div>

      {/* Active Incoming Shipments Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Intake Dispatch queue</h3>
            <p className="text-[11px] text-on-surface-variant">Update the donation state live using the dropdown actions.</p>
          </div>
          <div className="relative max-w-xs">
            <input 
              type="text" 
              placeholder="Search ID or Sourced name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/20">
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tracking ID</th>
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Donated Relief Item</th>
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Donor Source</th>
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Logistics Category</th>
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Quantity</th>
                <th className="p-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live Tracking State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface font-medium">
              {filteredDonations.length > 0 ? (
                filteredDonations.map(item => {
                  const currentStatus = item.trackingStatus || 'Pending';
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-primary">{item.id}</td>
                      <td className="p-3.5 font-bold">
                        <div>
                          <p>{item.name}</p>
                          {item.description && (
                            <p className="text-[10px] text-on-surface-variant italic font-normal mt-0.5">"{item.description}"</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-on-surface-variant">{item.donorName || "Anonymous Community"}</td>
                      <td className="p-3.5 text-on-surface-variant">{item.category}</td>
                      <td className="p-3.5 font-mono font-bold">{item.qty} {item.unit || "Units"}</td>
                      <td className="p-3.5">
                        <select 
                          value={currentStatus}
                          onChange={(e) => onUpdateTrackingStatus(item.id, e.target.value as any)}
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                        >
                          <option value="Pending">Pending (Submitted)</option>
                          <option value="Received">Received at Vault</option>
                          <option value="Sorted">Sorted (AI Audited)</option>
                          <option value="Dispatched">Dispatched to Zone</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-outline font-medium">
                    No donations matched the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
