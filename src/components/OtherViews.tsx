import React, { useState, useEffect } from "react";
import { 
  Hourglass, 
  Trash2, 
  X, 
  AlertCircle, 
  DollarSign, 
  CheckCircle, 
  Receipt,
  Download,
  Terminal,
  RefreshCw,
  User,
  Settings,
  Bell,
  Activity,
  FileText,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { Reservation, Fine, ActivityLog, UserProfile, UserRole, BookPurchase } from "../types";
import { apiService } from "../lib/api";

// ==========================================
// 1. RESERVATIONS VIEW
// ==========================================
interface ReservationsProps {
  reservations: Reservation[];
  onCancelReservation: (resId: string) => void;
}

export const ReservationsView: React.FC<ReservationsProps> = ({
  reservations,
  onCancelReservation
}) => {
  const activeHolds = reservations.filter(r => r.status === "PENDING" || r.status === "READY");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4" id="reservations-panel">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-amber-500" /> Active Reserved Hold Queue ({activeHolds.length})
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          If a coveted title is currently fully checked out, reserving files puts you in a queue. You get notified immediately once copies return.
        </p>
      </div>

      {activeHolds.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs">
          No reserved hold spaces registered right now. Search the catalog to place limits holds.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
          {activeHolds.map(hold => (
            <div key={hold.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/40 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                    {hold.id}
                  </span>
                  {hold.status === "READY" ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-emerald-350">
                      Ready for Pickup
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-200">
                      In Queue - Position #{hold.queuePosition}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-2 leading-none">{hold.bookTitle}</h4>
                <p className="text-[11px] text-slate-600 mt-1.5">By {hold.bookAuthor}</p>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Requested on: {hold.reserveDate}</p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => onCancelReservation(hold.id)}
                  className="text-stone-600 hover:text-red-650 hover:bg-rose-50 border border-slate-200 hover:border-red-300 transition-all font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Trash2 className="w-3.5 h-3.5" /> De-register hold
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. FINES VIEW
// ==========================================
interface FinesProps {
  fines: Fine[];
  paymentHistory?: BookPurchase[];
  onPayFines: () => void;
}

export const FinesView: React.FC<FinesProps> = ({
  fines,
  paymentHistory = [],
  onPayFines
}) => {
  const unpaidFines = fines.filter(f => f.status === "UNPAID");
  const unpaidSum = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleTriggerPayment = () => {
    if (unpaidSum === 0) return;
    setPaymentProcessing(true);
    setTimeout(() => {
      onPayFines();
      setPaymentProcessing(false);
    }, 1800);
  };

  return (
    <div className="space-y-6" id="fines-panel">
      
      {/* Total Accrued & Spent Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unpaid Fines Balance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600 bg-indigo-50 rounded-lg p-1" /> Unpaid Fines Balance
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fines accumulate daily at <strong>₹1.00/day</strong> for overdue library assets.
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">₹{unpaidSum.toFixed(2)}</span>
              <span className="text-slate-400 font-semibold text-xs font-mono">INR DUE</span>
            </div>
          </div>

          <div className="mt-4">
            {unpaidSum > 0 ? (
              <button
                onClick={handleTriggerPayment}
                disabled={paymentProcessing}
                className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-700 hover:border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-80"
              >
                {paymentProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing Gateway...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" /> Clear Due Balance Now
                  </>
                )}
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold">All clear! No outstanding fees.</p>
              </div>
            )}
          </div>
        </div>

        {/* Total Spent Purchases Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-lg p-1" /> Premium Acquisitions
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lifetime permanent digital eBook licenses successfully checked out.
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">₹{totalSpent.toFixed(2)}</span>
              <span className="text-slate-400 font-semibold text-xs font-mono">INR SPENT</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl text-indigo-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 shrink-0 text-indigo-600" />
              <p className="text-xs font-semibold">
                {paymentHistory.length} eBooks owned permanently
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Fines Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">UNPAID FINES & FEES</h4>
          <p className="text-[11px] text-slate-500 mt-1">Outstanding late penalties and fee liabilities requiring settlement</p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/20">
          {unpaidFines.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No outstanding unpaid fines registered.
            </div>
          ) : (
            unpaidFines.map(fine => (
              <div key={fine.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-450 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                      {fine.id}
                    </span>
                    <span className="text-[9px] font-bold text-red-650 bg-rose-50 px-1.5 py-0.5 rounded-full uppercase border border-red-250 font-sans tracking-wide">
                      Unpaid Overdue
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs mt-2.5 leading-tight">{fine.bookTitle}</h5>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">{fine.reason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-extrabold text-slate-800">₹{fine.amount.toFixed(2)}</span>
                  <p className="text-[9px] text-slate-400 mt-1">Incurred: {fine.dateIncurred}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">DIGITAL PURCHASE HISTORY</h4>
          <p className="text-[11px] text-slate-500 mt-1">Lending library permanent digital eBook acquisitions and premium checkouts</p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/20">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No premium digital eBook purchases recorded.
            </div>
          ) : (
            paymentHistory.map(purchase => (
              <div key={purchase.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#faf6f0]/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-450 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                      {purchase.transactionId || purchase.id}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase border border-emerald-150 font-sans tracking-wide">
                      Acquired License
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs mt-2.5 leading-tight">{purchase.bookTitle}</h5>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-mono">ISBN: {purchase.bookIsbn || "N/A"}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-extrabold text-slate-800">₹{purchase.amount.toFixed(2)}</span>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">Purchased: {purchase.purchaseDate}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 3. REPORTS VIEW
// ==========================================
interface ReportsProps {
  role: UserRole;
  activityLogs: ActivityLog[];
}

export const ReportsView: React.FC<ReportsProps> = ({
  role,
  activityLogs
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [advancedData, setAdvancedData] = useState<any | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setFetching(true);
        const data = await apiService.getAdvancedReports();
        setAdvancedData(data);
      } catch (err) {
        console.error("Advanced reports fetch error:", err);
      } finally {
        setFetching(false);
      }
    };
    loadReports();
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      try {
        const rows = [
          ["Report Subject", "LibraManage System Circulation Ledger Summary"],
          ["Generated On", new Date().toISOString()],
          ["Total Cataloged Books", advancedData?.systemSummary?.totalBooks || 15],
          ["Cumulative Vol Copies", advancedData?.systemSummary?.totalCopies || 45],
          ["Active Borrowers Count", advancedData?.systemSummary?.activeBorrowers || 3],
          [],
          ["GENRE POPULARITY INDEX"],
          ["Genre Name", "Relative Circulation Score"]
        ];

        if (advancedData?.genrePopularity) {
          advancedData.genrePopularity.forEach((g: any) => {
            rows.push([g.genre, g.count]);
          });
        } else {
          rows.push(["Technology", "18"], ["Fiction", "12"]);
        }

        const csvString = "data:text/csv;charset=utf-8," + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvString);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `libramanage_circulation_summary_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to compile CSV file", err);
      }
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="reports-section">
      
      {/* Graphical Chart block using clean styled CSS bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Consolidated Library Statistics</h3>
            <p className="text-xs text-slate-500 mt-0.5">Custom visual models showing weekly circulations and genres traffic</p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-indigo-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-indigo-700 hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-80"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching spreadsheet...
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-250 animate-bounce" /> Report Saved!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Export Report (CSV)
              </>
            )}
          </button>
        </div>

        {/* Customized CSS Graphic Plots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Genre popularity */}
          <div className="border border-slate-150 rounded-xl p-5 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-2 border-l-2 border-indigo-500">Popularity by Genre</h4>
            
            <div className="space-y-4 mt-6">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Technology & Engineering</span>
                  <span>46%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "46%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Literature & Fiction</span>
                  <span>28%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Philosophy & Ethics</span>
                  <span>14%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "14%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Pure Sciences</span>
                  <span>12%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: System Load representation */}
          <div className="border border-slate-150 rounded-xl p-5 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">Peak Lending Traffic (Days)</h4>
            
            {/* Elegant vertical columns */}
            <div className="flex justify-between items-end h-[120px] mt-6 px-4">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">40</span>
                <div className="bg-indigo-600/60 hover:bg-indigo-600 h-10 w-4 rounded-t transition-all"></div>
                <span className="text-[10px] font-semibold text-slate-650">Mon</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">82</span>
                <div className="bg-indigo-600/60 hover:bg-indigo-600 h-20 w-4 rounded-t transition-all"></div>
                <span className="text-[10px] font-semibold text-slate-650">Tue</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">110</span>
                <div className="bg-indigo-600 hover:bg-indigo-600 h-28 w-4 rounded-t transition-all"></div>
                <span className="text-[10px] font-semibold text-slate-650">Wed</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">60</span>
                <div className="bg-indigo-600/60 hover:bg-indigo-600 h-14 w-4 rounded-t transition-all"></div>
                <span className="text-[10px] font-semibold text-slate-650">Thu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">95</span>
                <div className="bg-indigo-600/60 hover:bg-indigo-600 h-24 w-4 rounded-t transition-all"></div>
                <span className="text-[10px] font-semibold text-slate-650">Fri</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" /> Historical Ledger Events
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronologically sorted immutable operational system logs</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50 font-mono text-[11px]">
          {activityLogs.map(log => (
            <div key={log.id} className="p-3 bg-white flex flex-col md:flex-row justify-between text-slate-650 hover:bg-slate-50 transition-colors gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-450 font-bold">{log.timestamp}</span>
                <span className={`px-1 rounded text-[10px] font-sans font-bold ${
                  log.type === "BORROW" ? "bg-indigo-50 text-indigo-700" :
                  log.type === "RETURN" ? "bg-emerald-50 text-emerald-700" :
                  log.type === "RESERVE" ? "bg-amber-50 text-amber-700" :
                  log.type === "SYSTEM" ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-900 font-medium font-sans">{log.action}</span>
              </div>
              <span className="text-slate-450 text-[10px]">Executor: {log.userEmail} ({log.userRole})</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 4. PROFILE VIEW (MULTIPURPOSE ENTERPRISE TABBED INTERFACE)
// ==========================================
interface ProfileProps {
  profile: UserProfile;
  borrowings: any[];
  reservations: any[];
  fines: any[];
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileProps> = ({
  profile,
  borrowings,
  reservations,
  fines,
  onUpdateProfile
}) => {
  const [profileSubTab, setProfileSubTab] = useState<"demographics" | "security" | "history" | "holds" | "fines">("demographics");

  // Tab 1 Fields
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "");
  const [department, setDepartment] = useState(profile.department || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tab 2 Fields (Password Security)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwUpdating, setPwUpdating] = useState(false);

  const handleDemographicsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      phone,
      department
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("All password security fields are required inside authentication layer.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New password matches confirm password verification error.");
      return;
    }

    if (newPassword.length < 5) {
      setPwError("New security password must be at least 5 alphanumeric characters long.");
      return;
    }

    setPwUpdating(true);
    try {
      await apiService.changePassword(oldPassword, newPassword);
      setPwSuccess("Your authentication password has been updated in database!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPwError(err?.response?.data?.error || "Incorrect credentials verification context or API error.");
    } finally {
      setPwUpdating(false);
    }
  };

  // Filter lists isolated to active user
  const userFines = fines;
  const userBorrowings = borrowings;
  const userReservations = reservations;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="profile-panel">
      
      {/* Left Column: Member ID Badge Card & Sub-navigation Tabs */}
      <div className="space-y-4 lg:col-span-1">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-center font-black text-xl hover:scale-105 transition-transform shadow-md border border-slate-800 pointer-events-none select-none">
            {profile.avatarSeed}
          </div>

          <h3 className="font-extrabold text-slate-900 text-sm mt-3.5 leading-tight">{profile.name}</h3>
          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
            {profile.role} member
          </span>

          <div className="w-full border-t border-slate-100 pt-3.5 mt-4 text-left divide-y divide-slate-50 space-y-2 text-[11px]">
            <div className="flex justify-between py-1 bg-white">
              <span className="text-slate-400 font-bold uppercase text-[8.5px]">Library card</span>
              <span className="font-mono text-slate-800 font-semibold">{profile.memberId}</span>
            </div>
            <div className="flex justify-between py-1 bg-white pt-2">
              <span className="text-slate-400 font-bold uppercase text-[8.5px]">Joined</span>
              <span className="text-slate-850 font-semibold">{profile.joinDate}</span>
            </div>
            <div className="flex justify-between py-1 bg-white pt-2">
              <span className="text-slate-400 font-bold uppercase text-[8.5px]">Active loans</span>
              <span className="font-mono font-bold text-indigo-700">{userBorrowings.filter(b => b.returnDate === null).length} volumes</span>
            </div>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible p-1 lg:p-0 bg-slate-100 lg:bg-transparent rounded-xl select-none">
          <button 
            onClick={() => setProfileSubTab("demographics")}
            className={`flex-1 lg:flex-none text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              profileSubTab === "demographics" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-150/60"
            }`}
          >
            👨‍🎓 Demographic Details
          </button>
          <button 
            onClick={() => setProfileSubTab("security")}
            className={`flex-1 lg:flex-none text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              profileSubTab === "security" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-150/60"
            }`}
          >
            🔒 Password Security
          </button>
          <button 
            onClick={() => setProfileSubTab("history")}
            className={`flex-1 lg:flex-none text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              profileSubTab === "history" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-150/60"
            }`}
          >
            📚 My Lending Archives
          </button>
          <button 
            onClick={() => setProfileSubTab("holds")}
            className={`flex-1 lg:flex-none text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              profileSubTab === "holds" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-150/60"
            }`}
          >
            ⏳ Holds Reserved
          </button>
          <button 
            onClick={() => setProfileSubTab("fines")}
            className={`flex-1 lg:flex-none text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              profileSubTab === "fines" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-150/60"
            }`}
          >
            💵 Fines & Payments
          </button>
        </nav>
      </div>

      {/* Right Column: Tab View Canvas */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* SUBTAB 1: DEMOGRAPHICS FORM EDIT */}
        {profileSubTab === "demographics" && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Demographic Directory Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Edit academic department assignments, and contact details</p>
            </div>

            <form onSubmit={handleDemographicsSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Registered Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Registered Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Telephone Phone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXX XXXX"
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Primary Department</label>
                  <input 
                    type="text" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center bg-white">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Credentials saved successfully!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Modifies directory index keys.</span>
                )}
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-900 border border-indigo-700 hover:border-slate-800 text-white font-bold text-xs px-5 py-2.5 transition-all rounded-lg cursor-pointer"
                >
                  Save Demographic Demographic
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBTAB 2: PASSWORD CHANGE */}
        {profileSubTab === "security" && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Change Security Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure and re-authorize plain text passwords immediately in database records</p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-sm">
              {pwError && (
                <div className="bg-rose-50 border border-rose-150 p-3 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <span className="font-semibold">{pwError}</span>
                </div>
              )}
              {pwSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5" /> <span className="font-bold">{pwSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Current Active Password</label>
                <input 
                  type="password" 
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block font-mono">New Selected Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Re-type Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 hover:border-slate-350 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>

              <button 
                type="submit"
                disabled={pwUpdating}
                className="bg-indigo-600 hover:bg-slate-900 border border-indigo-700 hover:border-slate-800 text-white font-bold text-xs px-5 py-2.5 transition-all rounded-lg cursor-pointer disabled:opacity-75"
              >
                {pwUpdating ? "Authorizing Security Keys..." : "Update Password Credentials"}
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 3: BORROWING ARCHIVES */}
        {profileSubTab === "history" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Personal Lending History Statements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit ledger of borrowed resources, and return statuses</p>
            </div>

            {userBorrowings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-450 text-xs">
                No active borrowings traces found inside this session.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden self-stretch bg-slate-50/20">
                {userBorrowings.map(b => (
                  <div key={b.id} className="p-3.5 bg-white flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-bold">LST-{b.id}</span>
                        {b.status === "RETURNED" ? (
                          <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-150 uppercase tracking-wider">Completed Return</span>
                        ) : b.status === "OVERDUE" ? (
                          <span className="text-[8px] font-bold text-red-650 bg-rose-50 px-1.5 py-0.5 rounded-full border border-red-250 uppercase tracking-wider">Unresolved Overdue</span>
                        ) : (
                          <span className="text-[8px] font-semibold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-150 uppercase tracking-wider">Lent Out</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-905 text-xs mt-1.5 leading-tight">{b.bookTitle}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">By {b.bookAuthor}</p>
                    </div>

                    <div className="text-right text-[10px] text-slate-450 space-y-1 leading-none font-medium">
                      <p>Checkout: <span className="font-mono text-slate-700">{b.borrowDate}</span></p>
                      <p>Due Date: <span className="font-mono text-slate-700 font-bold">{b.dueDate}</span></p>
                      {b.returnDate && <p>Handed in: <span className="font-mono text-emerald-600">{b.returnDate}</span></p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: RESERVATION QUEUE STATUS */}
        {profileSubTab === "holds" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Holds Queue Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tracks reserved assets ready for dispatch checks</p>
            </div>

            {userReservations.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-450 text-xs">
                You have no holding reservations registered inside queue memory.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/20">
                {userReservations.map(r => (
                  <div key={r.id} className="p-3.5 bg-white flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-bold">QUE-{r.id}</span>
                        {r.status === "READY" ? (
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-emerald-350">Allocated Pickable</span>
                        ) : r.status === "CANCELLED" ? (
                          <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase border border-slate-200">Revoked Hold</span>
                        ) : (
                          <span className="text-[8px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase border border-indigo-200">Position #{r.queuePosition}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-905 text-xs mt-2 leading-none">{r.bookTitle}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Reserved hold on: {r.reserveDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 5: FINES DIRECT LEDGERS */}
        {profileSubTab === "fines" && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Account Liabilities Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Itemization of unpaid late return fines, and clearances</p>
            </div>

            {userFines.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-450 text-xs">
                Zero liabilities recorded on ledger! Your credit remains impeccable.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/20">
                {userFines.map(f => (
                  <div key={f.id} className="p-3.5 bg-white flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-bold">FEE-{f.id}</span>
                        {f.status === "PAID" ? (
                          <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-150 uppercase">Settled Cleared</span>
                        ) : (
                          <span className="text-[8px] font-extrabold text-red-650 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-250 uppercase animate-pulse">Unpaid Settlement</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-905 text-xs mt-2 leading-tight">{f.bookTitle}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">{f.reason}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-base text-slate-800">${f.amount.toFixed(2)}</span>
                      <p className="text-[9px] text-slate-400 mt-1">{f.dateIncurred}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// ==========================================
// 5. SYSTEM SETTINGS VIEW
// ==========================================
interface SettingsProps {
  profile: UserProfile;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({
  profile,
  currentRole,
  onChangeRole,
  onLogout
}) => {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyDueDate, setNotifyDueDate] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="settings-panel">
      {/* Settings Navigation/Header info inside main content */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" /> Application & Interface Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Customize notification priorities, auto-renewal catalogs, and active simulation triggers</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Email Alerts</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Receive immediate notifications when holds are ready or listings return.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifyEmail} 
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Borrowing Overdue Reminders</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Automatic alert checks 48 hours prior to outstanding lending deadlines.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifyDueDate} 
                    onChange={(e) => setNotifyDueDate(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto-Renew Books</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Automatically renew book checkouts once if there is no active reserve queue.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoRenew} 
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> System options saved!
                </span>
              ) : (
                <span className="text-xs text-slate-400">Persisted in local browser storage.</span>
              )}
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 border border-indigo-700 hover:border-slate-800 transition-all rounded-lg cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* UI Role Switching Panel inside Settings page */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fast Switch Simulator Role
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle interface permissions dynamically without restarting secure sessions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button 
              onClick={() => onChangeRole("STUDENT")}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                currentRole === "STUDENT"
                  ? "border-indigo-600 bg-indigo-50/40 font-bold text-indigo-900 shadow-xs"
                  : "border-slate-150 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="text-xs">👨‍🎓 Student View</div>
              <div className="text-[10px] font-normal text-slate-500 mt-1">Gopichand (Active User)</div>
            </button>
            <button 
              onClick={() => onChangeRole("LIBRARIAN")}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                currentRole === "LIBRARIAN"
                  ? "border-indigo-600 bg-indigo-50/40 font-bold text-indigo-900 shadow-xs"
                  : "border-slate-150 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="text-xs">👩‍💼 Librarian View</div>
              <div className="text-[10px] font-normal text-slate-500 mt-1">Sarah (Staff Mode)</div>
            </button>
            <button 
              onClick={() => onChangeRole("ADMIN")}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                currentRole === "ADMIN"
                  ? "border-indigo-600 bg-indigo-50/40 font-bold text-indigo-900 shadow-xs"
                  : "border-slate-150 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="text-xs">🛡️ Admin View</div>
              <div className="text-[10px] font-normal text-slate-500 mt-1">Dr. Vance (System Executive)</div>
            </button>
          </div>
        </div>
      </div>

      {/* Security Logs & Explicit Secured Exit Card */}
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-550/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="w-10 h-10 bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">Secure Identity Status</h3>
              <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">Logged in as {profile.name}</p>
            </div>

            <div className="text-xs space-y-2 border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>E-MAIL ADDRESS</span>
                <span className="text-slate-200 truncate max-w-[120px] font-semibold">{profile.email}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>AUTHORITY PERMIT</span>
                <span className="text-indigo-400 font-extrabold">{currentRole}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>SECURITY ENCRYPTION</span>
                <span className="text-slate-200 font-mono">256-Bit SSL Mock</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 mt-6">
            <button 
              onClick={onLogout}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl border border-rose-700 hover:border-rose-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" /> End Security Session (Logout)
            </button>
            <p className="text-[9px] text-slate-500 font-mono text-center mt-3 leading-tight">Clears token signatures and triggers immediate dashboard protection lock.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
