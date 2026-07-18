import React from "react";
import { 
  BookOpen, 
  Hourglass, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  Database, 
  ShieldCheck, 
  Flame, 
  Cpu, 
  Grid,
  TrendingUp,
  Clock,
  UserCheck,
  FileBarChart,
  AlertCircle,
  Calendar,
  Ban,
  Inbox,
  User,
  ArrowUpRight,
  Sparkles,
  Unlock,
  Check,
  Trash2,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { Book, Borrowing, Reservation, Fine, UserProfile, ActivityLog, UserRole, BookSuggestion, BookPurchase } from "../types";

interface DashboardProps {
  role: UserRole;
  profile: UserProfile;
  books: Book[];
  borrowings: Borrowing[];
  reservations: Reservation[];
  fines: Fine[];
  activityLogs: ActivityLog[];
  suggestionsList?: BookSuggestion[];
  purchasedList?: BookPurchase[];
  onNavigate: (page: "books" | "borrowings" | "reservations" | "fines" | "reports" | "profile") => void;
  onSelectBook: (book: Book) => void;
  onApproveReturn?: (borrowingId: string) => void;
  onCancelReservation?: (resId: string) => void;
  onSuggestBookOpen?: () => void;
  onTriggerPreview?: (book: Book) => void;
  onUpdateSuggestionStatus?: (id: string, nextStatus: "PENDING" | "APPROVED" | "REJECTED" | "ADDED_TO_LIBRARY") => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  role,
  profile,
  books,
  borrowings,
  reservations,
  fines,
  activityLogs,
  suggestionsList = [],
  purchasedList = [],
  onNavigate,
  onSelectBook,
  onApproveReturn,
  onCancelReservation,
  onSuggestBookOpen,
  onTriggerPreview,
  onUpdateSuggestionStatus
}) => {
  // Stat calculations
  const activeCheckouts = borrowings.filter(b => b.status === "ACTIVE" || b.status === "OVERDUE").length;
  const overdueCount = borrowings.filter(b => b.status === "OVERDUE").length;
  const pendingHolds = reservations.filter(r => r.status === "PENDING" || r.status === "READY").length;
  const unpaidFineSum = fines
    .filter(f => f.status === "UNPAID")
    .reduce((sum, current) => sum + current.amount, 0);

  // Available books vs Total
  const totalCopies = books.reduce((s, b) => s + b.copiesTotal, 0);
  const availableCopies = books.reduce((s, b) => s + b.copiesAvailable, 0);

  // Filter logs related to this user if STUDENT, show all if Librarian/Admin
  const displayedLogs = role === "STUDENT"
    ? activityLogs.filter(log => log.userEmail === profile.email).slice(0, 5)
    : activityLogs.slice(0, 6);

  // 1. Genre distribution of books
  const genreData = React.useMemo(() => {
    const genreCounts: Record<string, number> = {};
    books.forEach(b => {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    return Object.keys(genreCounts).map(genre => ({
      name: genre,
      "Title Count": genreCounts[genre]
    }));
  }, [books]);

  // 2. Loan trends (grouped by date)
  const trendsData = React.useMemo(() => {
    const dateCounts: Record<string, { active: number; returned: number }> = {};
    borrowings.slice(-20).forEach(b => {
      const date = b.borrowDate || "2026-07-01";
      if (!dateCounts[date]) {
        dateCounts[date] = { active: 0, returned: 0 };
      }
      if (b.status === "RETURNED") {
        dateCounts[date].returned += 1;
      } else {
        dateCounts[date].active += 1;
      }
    });
    return Object.keys(dateCounts).sort().map(date => ({
      date: date.substring(5), // MM-DD
      "Active Loans": dateCounts[date].active,
      "Returned Check-Ins": dateCounts[date].returned
    }));
  }, [borrowings]);

  return (
    <div className="space-y-8" id="libramanage-dashboard-panel">
      {/* Top Banner Welcome Message */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Absolute Background Orbs */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl -mb-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                {role} PREVIEW
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mt-2 text-white">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-slate-350 text-xs md:text-sm mt-1 max-w-xl">
              LibraManage provides unified visual tracking over your academic catalogs, reservations pipeline, and fine settlements in real-time.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              {profile.avatarSeed}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">{profile.memberId}</div>
              <div className="text-[11px] text-indigo-300">{profile.department || "System Authorization"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER DYNAMIC CARD STATS ACCORDING TO USER ROLE */}
      {role === "STUDENT" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <motion.button 
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => onNavigate("borrowings")}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 py-1 px-2 rounded-full">Active</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-4 font-mono leading-none tracking-tight">{activeCheckouts}</h3>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Checked out Books</p>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
            onClick={() => onNavigate("reservations")}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-100">
                <Hourglass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 py-1 px-2 rounded-full">Holds</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-4 font-mono leading-none tracking-tight">{pendingHolds}</h3>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Pending Reservations</p>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            onClick={() => onNavigate("borrowings")}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 transition-colors group-hover:bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              {overdueCount > 0 ? (
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 py-1 px-2 rounded-full">Overdue</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 py-1 px-2 rounded-full">Good</span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-4 font-mono leading-none tracking-tight">{overdueCount}</h3>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Books past deadline</p>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
            onClick={() => onNavigate("fines")}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <DollarSign className="w-5 h-5" />
              </div>
              {unpaidFineSum > 0 ? (
                <span className="text-[10px] font-bold text-red-650 uppercase tracking-widest bg-red-100 py-1 px-2 rounded-full">Unpaid</span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 py-1 px-2 rounded-full">Settled</span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-4 font-mono leading-none tracking-tight">${unpaidFineSum.toFixed(2)}</h3>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Accrued Library Fines</p>
          </motion.button>
        </div>
      )}

      {role === "LIBRARIAN" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">{books.length}</h3>
            <p className="text-slate-500 text-xs mt-1">Unique Book Titles</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">
              {Math.round(((totalCopies - availableCopies) / totalCopies) * 100)}%
            </h3>
            <p className="text-slate-500 text-xs mt-1">Active Circulation Rate</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <Hourglass className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">
              {reservations.filter(r => r.status === "PENDING").length}
            </h3>
            <p className="text-slate-500 text-xs mt-1">Awaiting Copy allocation</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">
              {books.filter(b => b.copiesAvailable === 0).length}
            </h3>
            <p className="text-slate-500 text-xs mt-1">Out of Stock Alerts</p>
          </div>
        </div>
      )}

      {role === "ADMIN" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">Active</h3>
            <p className="text-slate-500 text-xs mt-1">System Health Secure</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">
              ${fines.filter(f => f.status === "UNPAID").reduce((a, b) => a + b.amount, 0).toFixed(2)}
            </h3>
            <p className="text-slate-500 text-xs mt-1">Total Unpaid Ledger</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">20 min</h3>
            <p className="text-slate-500 text-xs mt-1">Real-time DB Sync Loop</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 font-mono">1,402</h3>
            <p className="text-slate-500 text-xs mt-1">Total Users Registered</p>
          </div>
        </div>
      )}

      {/* Dynamic Visual Analytics Block for Administrators & Librarians */}
      {(role === "LIBRARIAN" || role === "ADMIN") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-none">
          {/* Chart 1: Circulation trends */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Circulation Trends Over Time
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Daily record of active checkouts vs system discharges</p>
              </div>
            </div>

            <div className="h-64 w-full text-xs">
              {trendsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                  Not enough historical checkout metrics available to plot trendlines
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="Active Loans" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                    <Area type="monotone" dataKey="Returned Check-Ins" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReturned)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Category distribution */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-teal-600" />
                  Catalog Distribution by Genre
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Volume count of distinct titles across academic fields</p>
              </div>
            </div>

            <div className="h-64 w-full text-xs">
              {genreData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                  Catalog records are empty
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Title Count" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                      {genreData.map((entry, index) => {
                        const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#f43f5e"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TWO COLUMN GRID DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: Main Area depending on role */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STUDENT DASHBOARD SPECIFIC: Library Card & Recommendations */}
          {role === "STUDENT" && (
            <>
              {/* Virtual Membership Badge */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none">DIGITAL MEMBER BADGE</h3>
                
                {/* Visual Library Card */}
                <div className="mt-4 bg-radial from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-xl p-6 border border-indigo-850 shadow-lg relative overflow-hidden transition-all hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-indigo-900 pb-4">
                    <div>
                      <span className="font-sans text-xs text-indigo-300 font-bold uppercase tracking-wider">LibraManage Consortium</span>
                      <h4 className="text-sm font-semibold tracking-tight text-white mt-0.5">NATIONAL HAROLD CAMPUS LIBRARY</h4>
                    </div>
                    <span className="text-indigo-400 font-bold text-xs font-mono tracking-widest bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900">
                      VIP
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <div className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">HOLDER</div>
                      <div className="text-sm font-bold mt-0.5">{profile.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">MEMBER INDEX</div>
                      <div className="text-sm font-mono font-semibold mt-0.5">{profile.memberId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">EXPIRY DATE</div>
                      <div className="text-[11px] mt-0.5">Aug 31, 2028</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">ROLE AUTHORIZATION</div>
                      <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                        {profile.role}
                      </div>
                    </div>
                  </div>

                  {/* Pseudo Barcode */}
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-indigo-900/40">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-end gap-[1.5px] h-7 bg-white/5 px-2 py-1 rounded">
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[3px] h-full bg-white"></div>
                        <div className="w-[1px] h-full bg-white"></div>
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[4px] h-full bg-white"></div>
                        <div className="w-[1px] h-full bg-white"></div>
                        <div className="w-[2px] h-full bg-white"></div>
                        <div className="w-[1px] h-full bg-white"></div>
                        <div className="w-[3.5px] h-full bg-white"></div>
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[2.5px] h-full bg-white"></div>
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[4px] h-full bg-white"></div>
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[2px] h-full bg-white"></div>
                        <div className="w-[1px] h-full bg-white"></div>
                      </div>
                      <span className="text-[8px] text-indigo-500 font-mono text-center tracking-widest mt-1">*{profile.memberId}*</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono uppercase">SECURE CHIP</span>
                  </div>
                </div>
              </div>

              {/* MY ACTIVE CHECKOUTS & ALERTS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">My Active Checkouts</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Academic materials currently possessed with live deadline alerts</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-650 px-2.5 py-1 rounded-full">
                    {borrowings.filter(b => b.status !== "RETURNED").length} Checked Out
                  </span>
                </div>

                {borrowings.filter(b => b.status !== "RETURNED").length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
                    You do not have any active book loans. Visit the book catalog to borrow materials!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {borrowings.filter(b => b.status !== "RETURNED").map(loan => {
                      const today = new Date();
                      const dueDate = new Date(loan.dueDate);
                      const diffTime = dueDate.getTime() - today.getTime();
                      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      const isPendingReturn = loan.status === "PENDING_RETURN";
                      const isOverdue = loan.status === "OVERDUE" || daysLeft < 0;
                      const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

                      return (
                        <div key={loan.id} className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-350 hover:bg-slate-50 transition-all">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {isPendingReturn ? (
                                <span className="text-[10px] bg-amber-50 text-amber-750 border border-amber-250 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Awaiting Hand-In
                                </span>
                              ) : isOverdue ? (
                                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-250 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase font-mono animate-pulse">
                                  🚨 Overdue (${loan.fineAmount.toFixed(2)} Fine)
                                </span>
                              ) : isDueSoon ? (
                                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-250 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase font-mono">
                                  ⏳ Due Soon ({daysLeft} days left)
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-50 text-emerald-750 border border-emerald-200 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase font-mono">
                                  ✓ Good standing ({daysLeft} days left)
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono font-medium">Due: {loan.dueDate}</span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs mt-2">{loan.bookTitle}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">by {loan.bookAuthor}</p>
                          </div>

                          <div className="shrink-0">
                            <button
                              onClick={() => {
                                if (onApproveReturn && !isPendingReturn) {
                                  onApproveReturn(loan.id);
                                }
                              }}
                              disabled={isPendingReturn}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isPendingReturn 
                                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                                  : "bg-indigo-600 border-indigo-750 text-white hover:bg-slate-900"
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {isPendingReturn ? "Return Requested" : "Request Return Check-In"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MY HELD RESERVATIONS QUEUE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">My Active Holds</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Reservations placed on libraries' out-of-stock titles</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
                    {reservations.filter(r => r.status === "PENDING" || r.status === "READY").length} active holds
                  </span>
                </div>

                {reservations.filter(r => r.status === "PENDING" || r.status === "READY").length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
                    You have no active book reservations right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.filter(r => r.status === "PENDING" || r.status === "READY").map(res => {
                      const isReady = res.status === "READY";
                      return (
                        <div key={res.id} className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-350 hover:bg-slate-50 transition-all">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {isReady ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase animate-pulse">
                                  ✓ READY TO COLLECT
                                </span>
                              ) : (
                                <span className="text-[10px] bg-violet-50 text-violet-750 border border-violet-200 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                  ⏳ Position #{res.queuePosition} in Queue
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono font-medium">Placed: {res.reserveDate}</span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs mt-2">{res.bookTitle}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">by {res.bookAuthor}</p>
                            
                            {isReady && (
                              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                                An on-shelf copy has been allocated to you! Direct pick-up at the front desk.
                              </p>
                            )}
                          </div>

                          {onCancelReservation && (
                            <div className="shrink-0">
                              <button
                                onClick={() => onCancelReservation(res.id)}
                                className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-650 hover:text-white hover:border-rose-750 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" /> Cancel Reserve
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommended Readings */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Available Academic Recommendations</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Selected curriculum books with remaining shelf stock</p>
                  </div>
                  <button 
                    onClick={() => onNavigate("books")}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-850 flex items-center gap-1 cursor-pointer"
                  >
                    View catalog <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {books.filter(b => b.copiesAvailable > 0).slice(0, 4).map(book => (
                    <div 
                      key={book.id} 
                      onClick={() => onSelectBook(book)}
                      className="border border-slate-150 p-4 rounded-xl flex gap-3 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-12 h-16 shrink-0 rounded relative overflow-hidden text-white flex flex-col justify-between p-1 text-[8px] font-bold shadow-xs select-none group/reccover">
                        {book.coverImage && book.coverImage.startsWith("http") ? (
                          <>
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover/reccover:scale-115 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-950/40" />
                          </>
                        ) : (
                          <div className={`absolute inset-0 ${book.coverImage || "bg-indigo-600"}`} />
                        )}
                        <div className="relative z-10 truncate opacity-90">{book.author}</div>
                        <div className="relative z-10 line-clamp-2 leading-none text-white/95">{book.title}</div>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{book.author}</p>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded self-start">
                          {book.copiesAvailable} copies left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MY PURCHASE HISTORY & SUGGESTIONS DRAWER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-none">
                {/* Suggestions tracker */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 font-sans tracking-tight">My Suggested Acquisitions</h3>
                        <p className="text-[10px] text-slate-505 mt-0.5">Track recommended academic book acquisitions</p>
                      </div>
                      <button
                        onClick={onSuggestBookOpen}
                        className="bg-indigo-55 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-xl text-[10px] cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Recommend Book
                      </button>
                    </div>

                    {suggestionsList.length === 0 ? (
                      <div className="border border-dashed border-slate-150 rounded-xl p-6 text-center text-slate-450 text-[11px] leading-relaxed select-none">
                        You have not recommended any catalog acquisitions yet. Reaching out with missing educational content aids curriculum sync!
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                        {suggestionsList.map((sug) => (
                          <div key={sug.id} className="p-3 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors">
                            <div className="min-w-0 pr-2 col-span-1">
                              <h4 className="font-bold text-slate-800 tracking-tight line-clamp-1">{sug.bookName}</h4>
                              <span className="text-[10px] text-slate-500 block">By {sug.author} • {sug.category}</span>
                            </div>
                            <span className={`text-[9.5px] font-extrabold font-mono py-0.5 px-2.5 rounded-full border shrink-0 ${
                              sug.status === "APPROVED"
                                ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                                : sug.status === "REJECTED"
                                ? "bg-rose-50 border-rose-150 text-rose-700"
                                : sug.status === "ADDED_TO_LIBRARY"
                                ? "bg-indigo-50 border-indigo-150 text-indigo-700"
                                : "bg-amber-50 border-amber-150 text-amber-700"
                            }`}>
                              {sug.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Digital shelf */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 font-sans tracking-tight">My Premium Digital Shelf</h3>
                        <p className="text-[10px] text-slate-505 mt-0.5 font-sans">Your lifetime acquired academic eBook licenses</p>
                      </div>
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        PRO ACCESS
                      </span>
                    </div>

                    {purchasedList.length === 0 ? (
                      <div className="border border-dashed border-slate-150 rounded-xl p-6 text-center text-slate-450 text-[11px] leading-relaxed select-none">
                        Digital library shelf empty. Acquire eBook titles in checkout portal details view to unlock permanent e-Reader access.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                        {purchasedList.map((p) => {
                          const matchingBook = books.find(b => b.id === p.bookId);
                          return (
                            <div key={p.id} className="p-3 bg-[#faf6f0] border border-[#f3ebde] rounded-xl flex items-center justify-between text-xs hover:border-[#ebdcc3] transition-colors">
                              <div className="min-w-0 pr-2">
                                <h4 className="font-bold text-stone-850 tracking-tight line-clamp-1">{p.bookTitle}</h4>
                                <span className="text-[10px] text-stone-500 block truncate font-mono">ISBN: {p.bookIsbn} • #{p.transactionId.slice(0, 8)}</span>
                              </div>
                              <button
                                onClick={() => matchingBook ? onTriggerPreview?.(matchingBook) : null}
                                disabled={!matchingBook}
                                className="text-[10px] font-bold py-1 px-3 rounded-lg bg-indigo-600 text-white border border-indigo-750 hover:bg-slate-900 transition-all cursor-pointer shadow-xs disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
                              >
                                Read eBook
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* LIBRARIAN & ADMIN VIEW: Circulation Desks, Overdue Checklist, and Reservation Queue */}
          {(role === "LIBRARIAN" || role === "ADMIN") && (
            <>
              {/* SECTION 1: Circulation Desk (PENDING RETURNS CHECKLIST) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-indigo-600 animate-pulse" />
                    Pending Returns Approval Checklist
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Pending user return validations requiring staff verify and discharge approval.</p>
                </div>

                {borrowings.filter(b => b.status === "PENDING_RETURN").length === 0 ? (
                  <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs bg-slate-25/30">
                    No active student check-in submissions require verification. Return routes are balance-synchronized!
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                    {borrowings.filter(b => b.status === "PENDING_RETURN").map(loan => (
                      <div key={loan.id} className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-250 px-1.5 py-0.5 rounded uppercase">
                              Awaiting Desk Verify
                            </span>
                            <span className="text-[10px] font-mono text-slate-450 font-bold">
                              ID: {loan.id}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-900 text-xs mt-1.5 truncate">{loan.bookTitle}</h4>
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Borrower: {loan.username || "Student"}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span>Author: {loan.bookAuthor}</span>
                            <span>•</span>
                            <span>Due Date: {loan.dueDate}</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {onApproveReturn && (
                            <button
                              onClick={() => onApproveReturn(loan.id)}
                              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg border border-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Direct Verify & Discharge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: DELINQUENT OVERDUE USERS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-600">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Overdue Users & Delinquent Loans Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Active checkout agreements past deadlines with dynamically mounting late balances.</p>
                </div>

                {borrowings.filter(b => b.status === "OVERDUE").length === 0 ? (
                  <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs bg-slate-25/30">
                    Zero delinquent checkout logs! All active users are currently in good standing.
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                    {borrowings.filter(b => b.status === "OVERDUE").map(loan => (
                      <div key={loan.id} className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-220 px-1.5 py-0.5 rounded font-mono uppercase">
                              Delinquent (${loan.fineAmount.toFixed(2)} Fine)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Deadline: {loan.dueDate}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs mt-1.5 truncate">{loan.bookTitle}</h4>
                          <p className="text-[10px] text-slate-600 font-semibold mt-0.5">Checked-out by: {loan.username || "Student ID"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Issued: {loan.borrowDate}</p>
                        </div>

                        <div className="shrink-0">
                          {onApproveReturn && (
                            <button
                              onClick={() => onApproveReturn(loan.id)}
                              className="bg-rose-50 border border-rose-150 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Staff Return Override
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: RESERVATIONS CONTROLS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-amber-500 animate-pulse" />
                    Global Reservation holds Queues Control
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Monitor reservation queues, view queue position, and promote hold allocations.</p>
                </div>

                {reservations.filter(r => r.status === "PENDING" || r.status === "READY").length === 0 ? (
                  <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs bg-slate-25/30">
                    No active reservation holds are in the queues. Catalogue copies are perfectly available.
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                    {reservations.filter(r => r.status === "PENDING" || r.status === "READY").map(res => (
                      <div key={res.id} className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {res.status === "READY" ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                                ✓ READY FOR PICKUP
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono uppercase">
                                Queue Position Rank #{res.queuePosition}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              Hold Date: {res.reserveDate}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs mt-2 truncate">{res.bookTitle}</h4>
                          <p className="text-[10px] text-slate-650 font-semibold mt-0.5">Reserved by: {res.username || "Student"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Book Author: {res.bookAuthor}</p>
                        </div>

                        {onCancelReservation && (
                          <div className="shrink-0">
                            <button
                              onClick={() => onCancelReservation(res.id)}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" /> De-queue Reserve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Shelf Allocator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Shelving & Rack Allocation Map</h3>
                    <p className="text-xs text-slate-500">Coordinate index location schemas across physical departments</p>
                  </div>
                  <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 py-1 px-2.2 rounded-lg">
                    {books.length} Active Slots
                  </span>
                </div>

                <div className="space-y-3">
                  {books.slice(0, 4).map(book => (
                    <div key={book.id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-slate-200 rounded"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate">{book.title}</p>
                          <p className="text-[10px] text-slate-500">Rack Coordinate: <span className="font-mono text-slate-800 font-semibold">{book.location}</span></p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-650 font-mono">
                        {book.copiesAvailable}/{book.copiesTotal} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ADMIN VIEW: Configurations & Security Logs */}
          {role === "ADMIN" && (
            <>
              {/* Core System Configuration parameters */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">System Variables & Authorization Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Parameters driving server calculation models (sqlite3 ledger configurations)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 border border-slate-150 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">PENALTY_RATE_PER_DAY</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-950 font-mono">$1.00</span>
                      <span className="text-slate-500 text-[11px]">per overdue book</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Enforced dynamically upon user login checks after 12:00 AM UTC.</p>
                  </div>

                  <div className="p-4 border border-slate-150 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">MAX_CHECKOUT_CAPACITY</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-950 font-mono">5 Books</span>
                      <span className="text-slate-500 text-[11px]">simultaneous limit</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Bridges user checkouts block automatically when threshold is breached.</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-4 border-t border-slate-100 pt-4">
                  <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Save Constants
                  </button>
                  <button className="text-xs font-semibold text-slate-650 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> DB Schema Check
                  </button>
                </div>
              </div>

              {/* System Performance Tracker */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Server Hardware & Endpoint Latencies</h3>
                    <p className="text-xs text-slate-500">Real-time stats of the sandboxed API hosting environment</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-350 text-emerald-600 font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Standard API Live
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold font-sans uppercase">API Latency</p>
                    <p className="text-sm font-sans font-extrabold text-slate-800 mt-1 font-mono">24ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold font-sans uppercase">CPU Load</p>
                    <p className="text-sm font-sans font-extrabold text-slate-800 mt-1 font-mono">4.2%</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold font-sans uppercase">Memory RAM</p>
                    <p className="text-sm font-sans font-extrabold text-slate-800 mt-1 font-mono">112 MB</p>
                  </div>
                </div>
              </div>

              {/* ADMIN: All Users Purchase History */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      All Users Premium Digital Purchases
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of premium digital book acquisitions across all library members</p>
                  </div>
                  
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 font-mono">
                    Total Volume: ₹{purchasedList.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)}
                  </div>
                </div>

                {purchasedList.length === 0 ? (
                  <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-450 text-xs bg-slate-25/30">
                    No premium purchase history has been recorded on this sandbox system yet.
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto border border-slate-150 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                          <th className="p-3.5">User Name</th>
                          <th className="p-3.5">Book Title</th>
                          <th className="p-3.5 text-center">Purchase Date</th>
                          <th className="p-3.5 text-right">Amount</th>
                          <th className="p-3.5 text-right font-medium">Total Spent (User)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {purchasedList.map((purchase) => {
                          const userNameStr = purchase.userName || purchase.username || "Unknown Student";
                          const totalUserSpent = purchasedList
                            .filter(p => (p.userName || p.username || "Unknown Student") === userNameStr)
                            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

                          return (
                            <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 font-bold text-slate-800">
                                <div>{userNameStr}</div>
                                <span className="text-[10px] text-slate-400 font-mono font-medium tracking-tight">ID: {purchase.userId || "user_1"}</span>
                              </td>
                              <td className="p-3.5 text-slate-700 font-medium">
                                <div>{purchase.bookTitle}</div>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">Tx: #{purchase.transactionId?.slice(0, 10)}</span>
                              </td>
                              <td className="p-3.5 text-center text-slate-500 font-mono">
                                {purchase.purchaseDate ? purchase.purchaseDate.split("T")[0] : "N/A"}
                              </td>
                              <td className="p-3.5 text-right text-emerald-600 font-bold font-mono">
                                ₹{Number(purchase.amount || 0).toFixed(2)}
                              </td>
                              <td className="p-3.5 text-right text-indigo-650 font-extrabold font-mono bg-indigo-50/20">
                                ₹{totalUserSpent.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* COL 3: Sidebar Activity Log stream (Always visible, polished, relevant to role) */}
        <div className="space-y-6">
          
          {/* Recent Audited Logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Live Activity Audit</h3>
                </div>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                  Real-time
                </span>
              </div>

              <div className="space-y-4">
                {displayedLogs.map((log) => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-slate-150 py-1 hover:border-indigo-400 transition-colors">
                    {/* Activity Indicator Dots */}
                    <div className={`absolute -left-[5px] top-[10px] w-2 h-2 rounded-full border border-white ${
                      log.type === "BORROW" ? "bg-indigo-500" :
                      log.type === "RETURN" ? "bg-emerald-500" :
                      log.type === "RESERVE" ? "bg-amber-500" :
                      log.type === "FINE" ? "bg-rose-500" : "bg-slate-400"
                    }`}></div>

                    <p className="text-xs text-slate-850 font-bold leading-tight">
                      {log.action}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="truncate max-w-[120px] font-medium">{log.userName} ({log.userRole})</span>
                      <span className="text-[9px] font-mono shrink-0">{log.timestamp.split(" ")[1] + " " + log.timestamp.split(" ")[2]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button 
                onClick={() => onNavigate("reports")}
                className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-350 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileBarChart className="w-3.5 h-3.5" /> View System Logs
              </button>
            </div>
          </div>

          {/* Quick FAQ info block */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              📚 Quick Platform Guide
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-2">
              You are currently utilizing standard simulation state storage. Switching security profiles at the sidebar updates dashboard charts, permissions block checks, and authorization rules natively.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                Role: {role}
              </span>
              <span className="text-[9px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                CORS Whitelist
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
