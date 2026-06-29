import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Plus, 
  TrendingUp, 
  FolderSync 
} from 'lucide-react';
import { DonationItem } from '../types';

interface ScannerInterfaceProps {
  onAddDonation: (item: Omit<DonationItem, 'id'>) => void;
}

interface ScanPreset {
  id: string;
  name: string;
  category: DonationItem['category'];
  qty: number;
  unit: string;
  expiryOffsetDays: number;
  image: string;
  confidence: number;
  dimensions: string;
}

const PRESETS: ScanPreset[] = [
  {
    id: 'baby-formula',
    name: 'Baby Formula (Stage 2 Premium)',
    category: 'Medical & Nutrition',
    qty: 120,
    unit: 'Units',
    expiryOffsetDays: 180, // 6 months ahead
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBClIYQ5HryYAOBT_L-Pr5ljQqT2p_F3XtgVb6g_r-ddSRGsVEyLtmxnpqCvVwHs0j_ubZrxKQgRL6R6lB4oFJmOdvf7KZ845Wd_NtvPY_EI_MPgd_n52TuaQ3TFQkgTWf9QjGWBarmgN39M83jj8VSjtLtVEyc4_JZzEZZOEqQL2hitCqAc0ykLgAG0yjuZAcRg6RtAaMyrfACaB-EM7g6074NZDdF31m20hFKejK797zX7pgeHH76v0WghI1qR38czH_AxiRIDevk',
    confidence: 98.4,
    dimensions: 'X: 142.42 | Y: 89.21'
  },
  {
    id: 'winter-coats',
    name: 'Winter Warm Parkas (Age 5-8)',
    category: 'Clothing',
    qty: 15,
    unit: 'Units',
    expiryOffsetDays: 365,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRywWgAuZ3YuA-qCfiDTx8jaXEDvEzJpnnniN5ZduocjyBYIgrLVnTcVOVhPgwSChi2mAyV0DoQWjX_l2v19PcFcCuZQmY64zBSCB-H94Oqg5E7nlA-0ixOb2LZlk6kqsNn-22KSTO-2FtP-e6xoD6l3Ni7PECiJDnH55-tXxc2yL_t5YX0Myz_vn0PexKV1kzQi3ETLLQ64T1kM4hsRaIJqXtjAQ4UtXYvEm1r-Tz5rXmYVTrV_YdXgrubM9__QgaqcNQOOekhNXf',
    confidence: 96.8,
    dimensions: 'X: 205.11 | Y: 114.65'
  },
  {
    id: 'first-aid',
    name: 'Emergency Medical Kit (Type B)',
    category: 'Medical & Nutrition',
    qty: 5,
    unit: 'Kits',
    expiryOffsetDays: 730,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHY3xmdKvR7x4vWRwU2kvi9D9meFjUDlkniKMKq7Vf4-HNrMkzOKRY68gH986QIzcxLvYh5VfmSTPZ1v80pfR8JjzwpMhS8hE22oFRPSaoZiIVluVNfd_off3AYrwAiZ7wUP4T5l6jdVhHI1hBYw4OP1Cv6tk1gtJcACa4yKUqDB-ZEJZ01emjUc6bEfB_coGOV-M-RCrSz3IIJL49klJtAjku3jxYFF2M3cw_YqDipl5oS-DObMT9jwVThToydgdeps_q6E_Xim8_',
    confidence: 99.1,
    dimensions: 'X: 98.74 | Y: 154.20'
  }
];

export default function ScannerInterface({ onAddDonation }: ScannerInterfaceProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [coordinates, setCoordinates] = useState({ x: 142.42, y: 89.21 });
  const [logged, setLogged] = useState(false);

  const activePreset = PRESETS[selectedPresetIndex];

  // Randomize coordinates slightly to look "live"
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinates(prev => ({
        x: Number((prev.x + (Math.random() - 0.5) * 1.5).toFixed(2)),
        y: Number((prev.y + (Math.random() - 0.5) * 1.5).toFixed(2))
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = () => {
    setLogged(false);
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
    }, 2500); // Simulate TFJS model classification processing
  };

  const handleApproveAndLog = () => {
    // Generate actual expiration date based on preset
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + activePreset.expiryOffsetDays);
    const dateString = expiryDate.toISOString().split('T')[0];

    onAddDonation({
      name: activePreset.name,
      category: activePreset.category,
      qty: activePreset.qty,
      unit: activePreset.unit,
      expiry: dateString,
      status: 'Optimal'
    });

    setLogged(true);
    setScanState('idle');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-sans text-on-surface tracking-tight">AI Scanner Terminal</h2>
          <p className="text-xs text-on-surface-variant mt-0.5 font-medium">TensorFlow.js computer vision module for cargo entry and registry.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Object Preset:</span>
          <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/30">
            {PRESETS.map((preset, idx) => (
              <button 
                key={preset.id}
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  setScanState('idle');
                  setLogged(false);
                }}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
                  selectedPresetIndex === idx 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {preset.id.split('-').join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Bento: Interactive Live Feed Canvas (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden relative min-h-[480px]">
          {/* Main Feed Display */}
          <div className="absolute inset-0 bg-slate-900 z-0">
            <img 
              className="w-full h-full object-cover transition-all duration-700 opacity-60" 
              src={activePreset.image} 
              alt={activePreset.name}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* HUD Overlay */}
          <div className="absolute inset-0 p-6 z-10 pointer-events-none flex flex-col justify-between">
            {/* Top HUD Row */}
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-primary/80 backdrop-blur-md rounded text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Live Stream
                </div>
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded text-white text-[9px] font-bold uppercase tracking-widest">
                  ISO 400 | 4K
                </div>
              </div>
              <div className="text-white text-[10px] font-bold font-mono tracking-wider bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                X: {coordinates.x} | Y: {coordinates.y}
              </div>
            </div>

            {/* Scanning Laser HUD Reticle */}
            <div className="m-auto w-72 h-72 border-2 border-primary/30 rounded-3xl relative flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>

              {/* Scanning laser animation line */}
              {scanState === 'scanning' && (
                <div className="scanning-line"></div>
              )}

              {/* Success classification box */}
              {scanState === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/95 text-on-primary p-3 rounded-xl border border-white/20 text-center shadow-lg pointer-events-auto max-w-[200px]"
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1 animate-spin text-secondary-container" />
                  <p className="text-[10px] font-bold tracking-wider uppercase opacity-80">TFJS CLASSIFIED</p>
                  <p className="text-xs font-extrabold mt-0.5">{activePreset.name}</p>
                  <p className="text-[10px] font-bold text-secondary-container mt-1 font-mono">{activePreset.confidence}% Confidence</p>
                </motion.div>
              )}
            </div>

            {/* Bottom HUD bar */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-white">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary-fixed" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/80">TFJS WebGL Accelerations</span>
              </div>
              <div className="text-[10px] font-bold text-white/60">
                Resolution: 3840 x 2160 • FPS: 60.0
              </div>
            </div>
          </div>

          {/* Interactive Trigger overlay (Bottom Left Action) */}
          <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
            {scanState === 'idle' && (
              <button 
                onClick={handleStartScan}
                className="bg-primary hover:bg-primary-container text-on-primary font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>INITIATE AI SCAN</span>
              </button>
            )}

            {scanState === 'scanning' && (
              <div className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-lg">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>CLASSIFYING IMAGE IN WEB-WORKER...</span>
              </div>
            )}

            {scanState === 'success' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleApproveAndLog}
                  className="bg-secondary hover:bg-secondary-container text-on-secondary font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>APPROVE & LOG TO VAULT</span>
                </button>
                <button 
                  onClick={() => setScanState('idle')}
                  className="bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-bold px-4 py-3 rounded-xl text-xs border border-outline-variant/50 cursor-pointer shadow-md"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Bento: Analysis & Logs (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-surface-container-low p-5 rounded-xl border border-outline-variant/20">
          <div>
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Model Analysis</h4>
            
            <div className="space-y-4">
              {/* Presets Description */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current Target</p>
                <h5 className="text-sm font-extrabold text-on-surface mt-1 leading-snug">{activePreset.name}</h5>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Est. Quantity</span>
                    <span className="font-extrabold text-on-surface font-mono">{activePreset.qty} {activePreset.unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">AI Match Confidence</span>
                    <span className="font-extrabold text-secondary font-mono">{activePreset.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Status Feedback / Logging message */}
              <AnimatePresence mode="wait">
                {logged && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-secondary-container/20 border border-secondary-container/40 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-secondary-container">Item Logged Successfully</p>
                      <p className="text-[11px] text-on-secondary-container-variant mt-1 leading-relaxed">
                        Registered <span className="font-bold">{activePreset.qty} {activePreset.unit}</span> to the <span className="font-bold">{activePreset.category}</span> category. Audit logs synchronized.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 space-y-2.5 text-xs text-on-surface-variant">
                <p className="font-bold text-[10px] uppercase tracking-wider text-on-surface">Instructions</p>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</span>
                  <p className="leading-tight">Select an object preset from the top-right toolbar to mock placing an item under the camera.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</span>
                  <p className="leading-tight">Click <span className="font-semibold text-primary">INITIATE AI SCAN</span> to trigger the computer-vision classifier.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</span>
                  <p className="leading-tight">Review identified details, select <span className="font-semibold text-secondary">APPROVE & LOG</span> to insert items directly into the system database.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Model Statistics Metrics */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-outline" />
                <span>TFJS Model Version</span>
              </span>
              <span className="font-bold text-on-surface font-mono">MobileNetV3.2</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                <FolderSync className="w-3.5 h-3.5 text-outline" />
                <span>Database Synced</span>
              </span>
              <span className="font-bold text-secondary font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-outline" />
                <span>Detection Latency</span>
              </span>
              <span className="font-bold text-on-surface font-mono">112ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
