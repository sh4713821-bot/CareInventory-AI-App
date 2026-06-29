import { motion } from 'motion/react';
import { 
  FileText, 
  TrendingUp, 
  Gauge, 
  AlertTriangle, 
  Verified, 
  Clock, 
  Quote, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import { DonationItem, ChildNeed, AuditLog } from '../types';

interface ImpactReportsProps {
  donations: DonationItem[];
  needs: ChildNeed[];
  logs: AuditLog[];
  userName: string;
}

// Recharts data
const BAR_CHART_DATA = [
  { month: 'Jan', Donations: 60, Distributions: 55 },
  { month: 'Feb', Donations: 75, Distributions: 70 },
  { month: 'Mar', Donations: 45, Distributions: 50 },
  { month: 'Apr', Donations: 85, Distributions: 82 },
  { month: 'May', Donations: 95, Distributions: 90 },
  { month: 'Jun', Donations: 110, Distributions: 105 },
];

const PIE_DATA = [
  { name: 'Medical Supplies', value: 45, color: '#006194' },
  { name: 'Nutritional Support', value: 30, color: '#006c49' },
  { name: 'Educational Kits', value: 25, color: '#825100' },
];

export default function ImpactReports({ donations, needs, logs, userName }: ImpactReportsProps) {
  
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Report Color Palette
      const primaryColor = [0, 97, 148]; // #006194
      const secondaryColor = [0, 108, 73]; // #006c49
      const textColor = [18, 28, 42]; // #121c2a
      const lightGray = [240, 244, 255]; // #eff4ff

      // PDF Title Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CareInventory AI', 15, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('COMPASSIONATE OPERATIONAL AUDIT & IMPACT REPORT', 15, 25);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
      doc.text(`Lead Auditor: ${userName}`, 140, 30);

      // Section 1: Executive Metrics Summary
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('I. EXECUTIVE KPI METRICS', 15, 52);

      // Met 1 Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, 58, 55, 28, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(18);
      doc.text('1,284', 20, 68);
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('LIVES IMPACTED', 20, 74);
      doc.text('+12% MoM growth', 20, 79);

      // Met 2 Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(77, 58, 55, 28, 'F');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(18);
      doc.text('94.2%', 82, 68);
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('DISTRIBUTION EFFICIENCY', 82, 74);
      doc.text('Target limit: >90%', 82, 79);

      // Met 3 Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(140, 58, 55, 28, 'F');
      doc.setTextColor(186, 26, 26); // #ba1a1a Red
      doc.setFontSize(18);
      doc.text('18', 145, 68);
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('UNMET URGENT NEEDS', 145, 74);
      doc.text('Intervention Active', 145, 79);

      // Section 2: Vault Inventory Snapshot
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('II. CURRENT DONATION VAULT STOCK', 15, 98);

      // Draw table headers
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, 104, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text('Item ID', 18, 109);
      doc.text('Item Name', 45, 109);
      doc.text('Category', 95, 109);
      doc.text('Quantity', 145, 109);
      doc.text('Expiry', 175, 109);

      // Draw rows
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      let yOffset = 117;
      
      donations.forEach((item, index) => {
        if (index < 5) { // Show up to 5 items in PDF summary
          // Row background highlights
          if (index % 2 === 1) {
            doc.setFillColor(248, 249, 255);
            doc.rect(15, yOffset - 4, 180, 6, 'F');
          }
          doc.text(item.id, 18, yOffset);
          doc.text(item.name, 45, yOffset);
          doc.text(item.category, 95, yOffset);
          doc.text(`${item.qty} ${item.unit}`, 145, yOffset);
          doc.text(item.expiry, 175, yOffset);
          yOffset += 6;
        }
      });

      // Section 3: Audit Log & Transparency Trail
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('III. LOGISTICAL AUDIT & VERIFICATION LOG', 15, 158);

      // Table headers for logs
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(15, 164, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('Timestamp', 18, 169);
      doc.text('Operational Event Details', 55, 169);
      doc.text('Destination/Partner', 115, 169);
      doc.text('Fulfillment Status', 165, 169);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      yOffset = 177;

      logs.forEach((log, index) => {
        if (index < 4) {
          if (index % 2 === 1) {
            doc.setFillColor(248, 249, 255);
            doc.rect(15, yOffset - 4, 180, 6, 'F');
          }
          doc.text(log.timestamp.split(' • ')[0], 18, yOffset);
          doc.text(log.event, 55, yOffset);
          doc.text(log.entity, 115, yOffset);
          doc.text(log.status, 165, yOffset);
          yOffset += 6;
        }
      });

      // Stakeholder quote box at the bottom
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(0.5);
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, 225, 180, 32, 'F');
      
      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(8.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('"Through the CareInventory AI reporting module, we finally have the granular transparency', 22, 233);
      doc.text('needed to prove to our donors that every dollar is reaching a child in need within 48 hours."', 22, 238);
      
      doc.setFont('Helvetica', 'bold');
      doc.text('Dr. Aris Thorne', 22, 246);
      doc.setFont('Helvetica', 'normal');
      doc.text('Director, Global Child Relief Fund', 22, 250);

      // Footnote
      doc.setFontSize(7);
      doc.setTextColor(112, 120, 129);
      doc.text('This document is encrypted and secure according to the CareInventory Ethical Logistics Protocol.', 15, 275);
      doc.text('Page 1 of 1 • System Integrity: verified 100%', 155, 275);

      // Save PDF trigger
      doc.save('careinventory_impact_report.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDF generation encountered an error: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold font-sans text-on-surface tracking-tight">Impact Reporting</h2>
          <p className="text-xs text-on-surface-variant mt-0.5 max-w-xl font-medium leading-relaxed">
            Transparent analytics showing the direct correlation between donor contributions and real-world child welfare outcomes.
          </p>
        </div>
        <button 
          onClick={handleGeneratePDF}
          className="bg-secondary hover:bg-secondary-container text-on-secondary px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer flex-shrink-0 uppercase tracking-widest"
        >
          <FileText className="w-4 h-4" />
          <span>Generate PDF Impact Report</span>
        </button>
      </div>

      {/* Metric Tiles Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lives Impacted */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Lives Impacted</p>
              <h3 className="text-xl font-extrabold text-on-surface mt-0.5">1,284</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Distribution Efficiency */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Gauge className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Distribution Efficiency</p>
              <h3 className="text-xl font-extrabold text-on-surface mt-0.5">94.2%</h3>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mb-1.5">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
          </div>
          <p className="text-[9px] text-on-surface-variant font-bold tracking-wider uppercase">Target Limit: &gt;90% Efficiency</p>
        </div>

        {/* Urgent Needs Unmet */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Urgent Needs Unmet</p>
              <h3 className="text-xl font-extrabold text-on-surface mt-0.5">18</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-error text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Immediate intervention required</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Chart (col-span-8) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Impact Over Time</h4>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Donations Received vs. Distributions Made (Last 6 Months)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006194]"></span>
                <span>Donations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span>
                <span>Distributions</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontWeight: 600 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #bfc7d2', fontSize: '11px' }}
                />
                <Bar dataKey="Donations" fill="#006194" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Distributions" fill="#006c49" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coverage Distribution Chart (col-span-4) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Need Coverage</h4>
            <p className="text-[11px] text-on-surface-variant font-medium">Breakdown of aid categories deployed</p>
          </div>

          <div className="h-44 flex items-center justify-center relative my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-extrabold text-on-surface leading-none">100%</span>
              <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Sourced</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs">
            {PIE_DATA.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                  <span className="text-on-surface-variant">{item.name}</span>
                </div>
                <span className="font-bold text-on-surface font-mono">{item.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/10">
        <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Audit & Verification Log</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant/30 bg-surface-container-low/40">
              <tr>
                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Timestamp</th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Event</th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Entity</th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 bg-white text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-3 font-semibold text-on-surface font-mono">{log.timestamp}</td>
                  <td className="p-3 text-on-surface-variant">{log.event}</td>
                  <td className="p-3 text-on-surface-variant">{log.entity}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      log.status === 'Completed' || log.status === 'Verified'
                        ? 'bg-secondary-container/30 text-secondary'
                        : 'bg-primary-container/20 text-primary'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {log.verified ? (
                      <Verified className="w-4 h-4 text-secondary ml-auto" />
                    ) : (
                      <Clock className="w-4 h-4 text-outline ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stakeholder Quote / Emotional Impact Section */}
      <section className="relative overflow-hidden rounded-xl bg-primary-container p-8 text-on-primary-container shadow-md border border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Quote className="w-40 h-40 transform rotate-180" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-semibold italic leading-relaxed mb-4">
            "Through the CareInventory AI reporting module, we finally have the granular transparency needed to prove to our donors that every dollar is reaching a child in need within 48 hours."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-on-primary-container/30 overflow-hidden shadow-inner flex-shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_cNmA9xE0T9hyBmflc43Y85gtkumP53jkAJL3_a2nfK2OIa3xe2k-ddEl1pNGq8m873v-0zGVUN2Ov_NG1H2Rf1OBs2d5jSXtTXAByPMr4G1BwtrKljqS_yDwwJN3CJstftaICHd4pCMriEM9Ie6cFoJOpE9noGIjwRprSbNJetyVPiimQ7YcP-r4eSzs1em3AvOgGsrZAvkwwlbB7jEvXueYLGtvTcbhTOEtNEgQbFAjxqxbrAOd4TCDx3p-7rCbI9VwQJMds7fO" 
                alt="Dr. Aris Thorne"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs font-bold">Dr. Aris Thorne</p>
              <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Director, Global Child Relief Fund</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logged in notification bottom bar */}
      <footer className="text-center pt-2 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Powered by CareInventory AI • Real-time Ethics-First Logistics
        </p>
      </footer>
    </div>
  );
}
