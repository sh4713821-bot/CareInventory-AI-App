import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Baby, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  UserCheck, 
  User, 
  Heart 
} from 'lucide-react';
import { Role, UserSession } from '../types';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Role>('supervisor');
  const [email, setEmail] = useState('manager@ngo.org');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Auto-fill credentials depending on selected role
  React.useEffect(() => {
    if (role === 'supervisor') {
      setEmail('manager@ngo.org');
    } else if (role === 'staff') {
      setEmail('field.staff@ngo.org');
    } else {
      setEmail('donor@care.org');
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set user details depending on selected role
    let session: UserSession;
    if (role === 'supervisor') {
      session = {
        name: 'Sarah Jenkins',
        role: 'supervisor',
        title: 'Inventory Lead',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHkzZKNH2tP5f7-2AnyIjzV7HfdqStZHIimCMF1mjAVu9oaGSBEHVH3oWCv7nR2eASJpk6PF9Msa_mxxB3ZP-PcjCMxF-23_pIHkxym-xhZM3mskCNyfklBkFUXimeH2o0Ypjyfhed1VfRyD__-EvV9O2JeAeYwnrtyV7vI40_nZJGCi8RxRW2KAFdhZ-vt_HsSmRsxYoaECmtIerSsau8v8J5PeqtwxLqfho1Ith5-6uXwkeYS55rHatUT7uaeHgJ_qZpeyMrg_Jo'
      };
    } else if (role === 'staff') {
      session = {
        name: 'Sarah Mitchell',
        role: 'staff',
        title: 'Field Manager',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHY3xmdKvR7x4vWRwU2kvi9D9meFjUDlkniKMKq7Vf4-HNrMkzOKRY68gH986QIzcxLvYh5VfmSTPZ1v80pfR8JjzwpMhS8hE22oFRPSaoZiIVluVNfd_off3AYrwAiZ7wUP4T5l6jdVhHI1hBYw4OP1Cv6tk1gtJcACa4yKUqDB-ZEJZ01emjUc6bEfB_coGOV-M-RCrSz3IIJL49klJtAjku3jxYFF2M3cw_YqDipl5oS-DObMT9jwVThToydgdeps_q6E_Xim8_'
      };
    } else {
      session = {
        name: 'Alexander Reed',
        role: 'donor',
        title: 'Community Donor',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBClIYQ5HryYAOBT_L-Pr5ljQqT2p_F3XtgVb6g_r-ddSRGsVEyLtmxnpqCvVwHs0j_ubZrxKQgRL6R6lB4oFJmOdvf7KZ845Wd_NtvPY_EI_MPgd_n52TuaQ3TFQkgTWf9QjGWBarmgN39M83jj8VSjtLtVEyc4_JZzEZZOEqQL2hitCqAc0ykLgAG0yjuZAcRg6RtAaMyrfACaB-EM7g6074NZDdF31m20hFKejK797zX7pgeHH76v0WghI1qR38czH_AxiRIDevk'
      };
    }

    onLoginSuccess(session);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden bg-surface-bright">
      {/* Decorative Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container rounded-full blur-[100px]"></div>
      </div>

      {/* Main Auth Card Container */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/30"
        id="login-card-container"
      >
        {/* Left Side: Visual Narrative (Branding & Impact) */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-primary text-on-primary relative overflow-hidden">
          {/* Cover image overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-30 mix-blend-overlay"
              style={{ 
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRywWgAuZ3YuA-qCfiDTx8jaXEDvEzJpnnniN5ZduocjyBYIgrLVnTcVOVhPgwSChi2mAyV0DoQWjX_l2v19PcFcCuZQmY64zBSCB-H94Oqg5E7nlA-0ixOb2LZlk6kqsNn-22KSTO-2FtP-e6xoD6l3Ni7PECiJDnH55-tXxc2yL_t5YX0Myz_vn0PexKV1kzQi3ETLLQ64T1kM4hsRaIJqXtjAQ4UtXYvEm1r-Tz5rXmYVTrV_YdXgrubM9__QgaqcNQOOekhNXf')` 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight font-sans">CareInventory AI</h1>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 leading-tight font-sans tracking-tight">
              Managing resources with heart and precision.
            </h2>
            <p className="text-body-lg text-white/80 max-w-[340px] leading-relaxed">
              Join our mission to streamline aid distribution and ensure every child receives what they need, when they need it.
            </p>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-md border border-white/20 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner">
                <ShieldCheck className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Trusted By</p>
                <p className="text-sm font-semibold text-white">500+ Global NGOs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interaction Shell */}
        <div className="p-6 md:p-10 flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex border-b border-outline-variant/30 mb-8" id="login-tabs">
              <button 
                id="tab-login"
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest text-center transition-all border-b-2 ${
                  activeTab === 'login' 
                    ? 'border-primary text-primary font-bold' 
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                LOGIN
              </button>
              <button 
                id="tab-register"
                onClick={() => setActiveTab('register')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest text-center transition-all border-b-2 ${
                  activeTab === 'register' 
                    ? 'border-primary text-primary font-bold' 
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                REGISTRATION
              </button>
            </div>

            {/* Header Titles */}
            <header className="mb-6">
              <h3 className="text-xl font-bold text-on-surface font-sans">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {activeTab === 'login' 
                  ? 'Please enter your credentials to access the inventory system.' 
                  : 'Join our network to help manage critical child care resources.'
                }
              </p>
            </header>

            {/* Forms */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Supervisor Card */}
                  <div 
                    id="role-supervisor"
                    onClick={() => setRole('supervisor')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'supervisor' 
                        ? 'border-primary bg-primary-fixed/20 shadow-sm' 
                        : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 ${role === 'supervisor' ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <span className="text-[9px] font-bold text-center uppercase tracking-wider leading-tight">Supervisor</span>
                  </div>
                  
                  {/* Staff Card */}
                  <div 
                    id="role-staff"
                    onClick={() => setRole('staff')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'staff' 
                        ? 'border-primary bg-primary-fixed/20 shadow-sm' 
                        : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                    }`}
                  >
                    <User className={`w-4 h-4 ${role === 'staff' ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <span className="text-[9px] font-bold text-center uppercase tracking-wider leading-tight">Staff</span>
                  </div>

                  {/* Donor Card */}
                  <div 
                    id="role-donor"
                    onClick={() => setRole('donor')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'donor' 
                        ? 'border-primary bg-primary-fixed/20 shadow-sm' 
                        : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${role === 'donor' ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <span className="text-[9px] font-bold text-center uppercase tracking-wider leading-tight">Donor / Public</span>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="email-input">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-xs font-sans" 
                      id="email-input" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'supervisor' 
                          ? 'manager@ngo.org' 
                          : role === 'staff' 
                            ? 'field.staff@ngo.org' 
                            : 'donor@care.org'
                      } 
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password-input">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-xs font-sans" 
                      id="password-input" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                    />
                  </div>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="flex items-center justify-between" id="login-addons">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5" 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-[11px] text-on-surface-variant font-medium">Remember me</span>
                  </label>
                  <a className="text-[11px] text-primary hover:underline font-bold" href="#forgot">
                    Forgot Password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                id="submit-auth-btn"
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-[0.98] mt-4 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <span>{activeTab === 'login' ? 'Sign In' : 'Register Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Secure Footer */}
          <footer className="mt-8 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <Heart className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest text-center">
                Secured by CareInventory Privacy Protocol
              </p>
            </div>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
