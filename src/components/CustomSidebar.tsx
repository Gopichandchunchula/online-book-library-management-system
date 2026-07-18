import React from "react";
import { 
  Library, 
  Grid, 
  BookOpen, 
  Clock, 
  Hourglass, 
  DollarSign, 
  FileBarChart, 
  User, 
  ShieldCheck, 
  Menu, 
  ChevronDown,
  LogOut,
  Settings,
  Lightbulb,
  Sun,
  Moon
} from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: any) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  profile: UserProfile;
  borrowingsCount: number;
  reservationsCount: number;
  unpaidFinesCount: number;
  pendingSuggestionsCount?: number;
  onLogout?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const CustomSidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  currentRole,
  onChangeRole,
  profile,
  borrowingsCount,
  reservationsCount,
  unpaidFinesCount,
  pendingSuggestionsCount = 0,
  onLogout,
  isDarkMode,
  onToggleDarkMode
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid },
    { id: "books", label: "Browse Books", icon: Library },
    { id: "borrowings", label: "Borrowings", icon: BookOpen, badge: borrowingsCount > 0 ? borrowingsCount : undefined },
    { id: "reservations", label: "Reservations", icon: Hourglass, badge: reservationsCount > 0 ? reservationsCount : undefined },
    { id: "fines", label: "Fines & Payments", icon: DollarSign, badge: unpaidFinesCount > 0 ? unpaidFinesCount : undefined, badgeColor: "bg-rose-500 text-white" },
    { id: "suggestions", label: "Book Suggestions", icon: Lightbulb, badge: pendingSuggestionsCount > 0 ? pendingSuggestionsCount : undefined, badgeColor: "bg-amber-500 text-white" },
    { id: "reports", label: "Reports & Logs", icon: FileBarChart },
    ...(currentRole === "ADMIN" ? [{ id: "users", label: "User Management", icon: ShieldCheck }] : []),
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "settings", label: "System Settings", icon: Settings }
  ];

  return (
    <aside className="w-68 shrink-0 bg-slate-900 text-slate-300 border-r border-slate-850 flex flex-col justify-between h-full relative" id="libramanage-sidebar">
      <div>
        {/* Brand Logo and Header */}
        <div className="p-6 border-b border-slate-850 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black shadow-md">
            LM
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">LibraManage</h2>
            <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase mt-1 inline-block">Enterprise Client</span>
          </div>
        </div>

        {/* ROLE SELECTOR PANEL (Prominent & High-Contrast) */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-850">
          <label className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest pl-2">
            Switch Interface Role
          </label>
          
          <div className="relative mt-1.5">
            <select
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="w-full bg-slate-800 hover:bg-slate-755 border border-slate-700 hover:border-slate-600 text-white font-semibold text-xs py-2.5 pl-3 pr-8 rounded-xl outline-none appearance-none cursor-pointer transition-all shadow-xs"
            >
              {profile.role === "STUDENT" && (
                <option value="STUDENT">👨‍🎓 Student: {profile.name}</option>
              )}
              {profile.role === "LIBRARIAN" && (
                <option value="LIBRARIAN">👩‍💼 Librarian: {profile.name}</option>
              )}
              {profile.role === "ADMIN" && (
                <option value="ADMIN">🛡️ Admin: {profile.name}</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 mt-2 bg-slate-900/40 px-2 py-1.5 rounded-lg border border-slate-850">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
            <span className="text-[10px] text-slate-450 tracking-tight font-medium truncate">
               Role view: {currentRole} Mode active
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1 mt-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-xs border-r-4 border-indigo-400"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-450"}`} />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${item.badgeColor || "bg-indigo-505 text-white bg-indigo-900"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer detailing Active User Details */}
      <div className="p-5 border-t border-slate-850 bg-slate-950/20 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0">
              {profile.avatarSeed}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white truncate text-xs">{profile.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={() => onToggleDarkMode()}
              className="p-2 hover:bg-slate-800 hover:text-white text-slate-400 rounded-lg cursor-pointer transition-colors tooltip"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {onLogout && (
              <button 
                onClick={() => onLogout()}
                className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-lg cursor-pointer transition-colors tooltip"
                title="End Secure Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[9px] text-slate-500 font-mono mt-4 text-center">
          LibraManage OS Sandbox Build 1.0
        </p>
      </div>
    </aside>
  );
};
