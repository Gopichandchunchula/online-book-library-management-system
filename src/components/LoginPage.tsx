import React, { useState } from "react";
import { 
  Library, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Mail, 
  FileText, 
  Phone, 
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  BookOpen,
  Sparkles,
  Layers,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole, UserProfile } from "../types";
import { apiService } from "../lib/api";

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile, role: UserRole) => void;
  existingProfiles: Record<string, UserProfile>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, existingProfiles }) => {
  // Mode selection: login, register, forgot
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login Form State
  const [loginRole, setLoginRole] = useState<UserRole>("STUDENT");
  const [loginUsername, setLoginUsername] = useState("student");
  const [loginPassword, setLoginPassword] = useState("");

  const handleRoleChange = (role: UserRole) => {
    setLoginRole(role);
    if (role === "STUDENT") {
      setLoginUsername("student");
    } else if (role === "LIBRARIAN") {
      setLoginUsername("librarian");
    } else if (role === "ADMIN") {
      setLoginUsername("admin");
    }
  };

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("STUDENT");
  const [regDepartment, setRegDepartment] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forgot password dynamic state & timers
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [receivedOtpCode, setReceivedOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(300); // 5 mins
  const [resendTimer, setResendTimer] = useState(0); // 30s throttle
  const [showForgotPass, setShowForgotPass] = useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (forgotStep === "verify" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && forgotStep === "verify") {
      setErrorMsg("Memory safety validation warning: Recovery OTP code has expired. Please request a new security code.");
      setForgotStep("request");
    }
    return () => clearInterval(interval);
  }, [forgotStep, otpTimer]);

  React.useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Custom registered user directory stored during the session
  const [registeredAccounts, setRegisteredAccounts] = useState<Record<string, { profile: UserProfile, pass: string }>>({
    gopichand: {
      profile: existingProfiles.STUDENT,
      pass: "password"
    },
    student: {
      profile: existingProfiles.STUDENT,
      pass: "password"
    },
    sarah: {
      profile: existingProfiles.LIBRARIAN,
      pass: "password"
    },
    librarian: {
      profile: existingProfiles.LIBRARIAN,
      pass: "password"
    },
    admin: {
      profile: existingProfiles.ADMIN,
      pass: "password"
    }
  });



  // Perform user authentication logic
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMsg("Please fill in both fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiService.login(loginUsername.trim().toLowerCase(), loginPassword);
      setSuccessMsg(`Welcome, ${result.user.name}! Authenticated successfully.`);
      setTimeout(() => {
        onLoginSuccess(result.user, result.user.role);
      }, 800);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || "Access Denied: The password or username you entered is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  // Registration form submission logic
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg("Please fill in all requested fields correctly.");
      return;
    }

    const cleanedPhone = regPhone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      setErrorMsg("Mobile number must be 10 digits");
      return;
    }

    setLoading(true);

    try {
      const result = await apiService.register({
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        name: regName.trim(),
        email: regEmail.trim(),
        phone: cleanedPhone,
        department: regDepartment.trim() || (regRole === "STUDENT" ? "Undergraduate Academic Division" : "Administrative Operations"),
        role: regRole
      });

      setSuccessMsg(`Successfully registered ${result.user.name}! Proceeding to log in.`);
      
      // Auto fill login fields and transition
      setLoginUsername(regUsername.trim());
      setLoginPassword(regPassword);
      setMode("login");

      // Reset signup fields
      setRegName("");
      setRegUsername("");
      setRegEmail("");
      setRegPhone("");
      setRegDepartment("");
      setRegPassword("");
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || "That username is already taken. Please select another.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password robust validation handlers
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const val = forgotEmailOrPhone.trim();
    if (!val) {
      setErrorMsg("Please enter your registered email address or mobile phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.requestForgotPasswordOtp(val);
      setSuccessMsg(res.message || "A verification security OTP digit has been dispatched!");
      setReceivedOtpCode(res.otpCode);
      setForgotOtp(res.otpCode); // Pre-fill inside sandbox so users can test immediately!
      setForgotStep("verify");
      setOtpTimer(300); // 5 mins
      setResendTimer(30); // 30s throttle
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Associated profile matches no directories in our security indexes.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailOrPhone = forgotEmailOrPhone.trim();
    const otp = forgotOtp.trim();
    const pass = forgotNewPassword.trim();

    if (!emailOrPhone || !otp || !pass) {
      setErrorMsg("All security verification arguments are mandated.");
      return;
    }

    if (pass.length < 4) {
      setErrorMsg("Your secure new password should contain at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.resetPasswordWithOtp(emailOrPhone, otp, pass);
      setSuccessMsg(res.message || "Authentication credentials rewritten successfully! You can now log in.");
      
      // Auto-prefill the login credentials
      try {
        const allUsers = await apiService.getUsers();
        const matched = allUsers.find(u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.profile?.phone === emailOrPhone);
        if (matched) {
          setLoginUsername(matched.username);
        }
      } catch (err) {
        console.warn("Failed user prefetch query:", err);
      }
      
      setLoginPassword(pass);
      
      // Reset forgot states
      setForgotStep("request");
      setForgotEmailOrPhone("");
      setForgotOtp("");
      setForgotNewPassword("");
      setReceivedOtpCode("");
      
      // Switch back to login view with interactive delay
      setTimeout(() => {
        setMode("login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Security OTP verification checks rejected or timed out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 select-none font-sans" id="libramanage-auth-canvas">
      
      {/* GLOW ORBITS & NEON HIGHLIGHTS ATMOSPHERE */}
      <div className="absolute top-0 inset-x-0 h-full w-full pointer-events-none overflow-hidden z-0">
        {/* Soft violet highlight */}
        <div className="absolute -top-[20%] left-[15%] w-[60%] h-[70%] bg-purple-650/20 rounded-full blur-[160px] animate-pulse duration-[8000ms]" />
        {/* Soft cyan highlight */}
        <div className="absolute bottom-[-10%] right-[5%] w-[55%] h-[60%] bg-cyan-555/15 rounded-full blur-[140px] animate-pulse duration-[10000ms]" />
        {/* Intense royal center neon backing */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[120px]" />
        
        {/* Tech Grid Matrix Mask */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
        
        {/* LEFT COLUMN: BRANDING & POWERFUL DEVS-BOOKS NEON STACK ILLUSTRATION */}
        <div className="flex-1 text-left space-y-8 max-w-xl lg:block hidden">
          
          {/* Main Titles Header with developed by watermark */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-extrabold text-cyan-300 tracking-wider uppercase">Enterprise Edition V1.2</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Online Library Books <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                  Management System
                </span>
              </h1>
              
              {/* STYLISH SUBTITLE: "Developed by Gopichand" */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-[2px] w-8 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                <p className="text-sm font-semibold tracking-wide text-indigo-300 uppercase">
                  Developed by <span className="text-white font-extrabold text-indigo-300 hover:text-cyan-300 transition-colors">Gopichand</span>
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md pt-2">
              An elegant sandbox solution tracking real-time borrow transactions, reservations pipelines, state-synchronized book catalogs, and system audit logs.
            </p>
          </div>

          {/* BEAUTIFUL STACK OF NEON LIBRARIAN DEV BOOKS ILLUSTRATION */}
          <div className="pt-4 pb-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Featured Programming & Dev Collections
            </h3>
            
            <div className="relative pl-3 space-y-2.5 max-w-md">
              {/* Outer vertical neon boundary line */}
              <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 opacity-60"></div>
              
              {/* Book 1 (Python) */}
              <motion.div 
                whileHover={{ x: 6 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    PY
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Python Programming Masterclass</h4>
                    <p className="text-[10px] text-slate-500">Advanced scripting & data models</p>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 py-0.5 px-2 rounded-md font-bold">8 Copies</span>
              </motion.div>

              {/* Book 2 (Django & React) */}
              <motion.div 
                whileHover={{ x: 6 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-xs border border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    RE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">React Mastery & Hooks Deep Dive</h4>
                    <p className="text-[10px] text-slate-500">Modern components state architectures</p>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 py-0.5 px-2 rounded-md font-bold">10 Copies</span>
              </motion.div>

              {/* Book 3 (Software Design / Clean Code) */}
              <motion.div 
                whileHover={{ x: 6 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-purple-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    SE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Software Engineering Matrix</h4>
                    <p className="text-[10px] text-slate-500">Clean Code, Architecture & DevOps</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 py-0.5 px-2 rounded-md font-bold">12 Copies</span>
              </motion.div>
            </div>
          </div>


        </div>

        {/* RIGHT COLUMN: PREMIUM GLASSMORPHISM AUTHENTICATION CARD */}
        <div className="w-full max-w-lg mx-auto">
          
          {/* Mobile visible responsive header */}
          <div className="flex flex-col items-center text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-3 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Library className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white px-2 tracking-tight">LibraManage</h1>
            
            <p className="text-sm font-semibold tracking-wide text-indigo-400 uppercase mt-1">
              Developed by Gopichand
            </p>
            
            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              Online Library Books Management System with automated listings & transaction controls.
            </p>
          </div>

          {/* THE SEAMLESS GLASSMORPHISM CARD LAYER */}
          <div 
            className="bg-slate-900/75 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative"
            id="libramanage-auth-card-wrapper"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)" }}
          >
            
            {/* Top decorative neon progress line */}
            <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <div className="p-8 md:p-10">
              
              {/* Card Meta details */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/80 pb-5">
                <div>
                  {/* Small Brand Logo and project name inside card */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <Library className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-extrabold uppercase text-white tracking-widest font-mono">LibraManage</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                    {mode === "login" && "Secure Member Sign-In"}
                    {mode === "register" && "Create Security Profile"}
                    {mode === "forgot" && "Reset Access Authorization"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {mode === "login" && "Authorize credentials to access administrative views"}
                    {mode === "register" && "Formulate custom permission roles"}
                    {mode === "forgot" && "Query directory records for secret keys"}
                  </p>
                </div>
                
                <div className="hidden sm:block shrink-0">
                  <span className="text-[10px] font-black tracking-widest text-[#22d3ee] bg-cyan-950/40 border border-cyan-500/30 py-1.5 px-3 rounded-xl uppercase">
                    Sandbox
                  </span>
                </div>
              </div>

              {/* Dynamic Alerts inside state frame */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-xs text-rose-400 shadow-inner"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-semibold">{errorMsg}</p>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-xs text-emerald-400 shadow-inner"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-semibold">{successMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INTERACTIVE FORMS STATE ENGINE */}
              <AnimatePresence mode="wait">
                
                {/* 1. SIGN IN SCREEN */}
                {mode === "login" && (
                  <motion.form 
                    key="login-form-box"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    onSubmit={handleLoginSubmit} 
                    className="space-y-5"
                  >
                    {/* Role Selection Dropdown */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                        Select Role
                      </label>
                      <div className="relative">
                        <Layers className="w-4.5 h-4.5 text-slate-550 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select 
                          value={loginRole} 
                          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-3.5 pl-11 pr-10 hover:border-slate-705 hover:border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10 outline-none appearance-none cursor-pointer font-semibold transition-all"
                        >
                          <option value="STUDENT" className="bg-slate-950 text-white">Student</option>
                          <option value="LIBRARIAN" className="bg-slate-950 text-white">Librarian</option>
                          <option value="ADMIN" className="bg-slate-950 text-white">Admin</option>
                        </select>
                        <ChevronDown className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Username Input Layer */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                        Username ID
                      </label>
                      <div className="relative">
                        <User className="w-4.5 h-4.5 text-slate-550 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          required
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="e.g., student or librarian"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-3.5 pl-11 pr-4 hover:border-slate-705 hover:border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-slate-600 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Password Input Layer */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                          Secure Password
                        </label>
                        <button 
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-[10px] text-cyan-400 hover:text-white cursor-pointer hover:underline transition-colors font-bold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4.5 h-4.5 text-slate-550 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-3.5 pl-11 pr-11 hover:border-slate-705 hover:border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10 outline-none transition-all font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON WITH INTERACTIVE HOVER NEON GRADIENT & LOADING STATE */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-4 rounded-xl cursor-pointer shadow-lg hover:shadow-cyan-550/20 transition-all flex items-center justify-center gap-2 border border-blue-500/30 font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                          <span>Authenticating Access...</span>
                        </>
                      ) : (
                        <>
                          <span className="tracking-wider uppercase">Establish Direct Session</span>
                          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* 2. DISPATCH REGISTRATION FLOW VIEW */}
                {mode === "register" && (
                  <motion.form 
                    key="registration-form-box"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    onSubmit={handleRegisterSubmit} 
                    className="space-y-4 max-h-[460px] overflow-y-auto pr-1"
                  >
                    {/* Developer Name Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                        Developer Full Name *
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g., Gopichand Dev"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 pl-9 pr-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-650"
                        />
                      </div>
                    </div>

                    {/* Unique single word identifier */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                        Username ID *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="e.g., devgopi"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 pl-9 pr-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-650"
                        />
                      </div>
                    </div>

                    {/* Primary Email */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                        Primary Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="developer@libramanage.edu"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 pl-9 pr-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Interactive Selector with customizable security roles */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                        System Level Security Role
                      </label>
                      <div className="relative">
                        <select 
                          value={regRole} 
                          onChange={(e) => setRegRole(e.target.value as UserRole)}
                          className="w-full bg-slate-950/70 border border-slate-800 text-white text-xs rounded-xl py-2.5 pl-3 pr-8 outline-none appearance-none cursor-pointer focus:border-cyan-500 font-semibold"
                        >
                          <option value="STUDENT">👨‍🎓 Student Role: Checkouts bounds</option>
                          <option value="LIBRARIAN">👩‍💼 Librarian: Inventory operations allowed</option>
                          <option value="ADMIN">🛡️ Platform Administrator (Master control)</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-405 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider pl-1 font-bold">
                          Phone Contact *
                        </label>
                        <input 
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 outline-none hover:border-slate-700 focus:border-cyan-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase font-mono tracking-wider pl-1 font-bold">
                          Department Division
                        </label>
                        <input 
                          type="text"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          placeholder="Science / Library Ops"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 outline-none hover:border-slate-700 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Password secure input logic */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                        Account Password Access Key *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Security key (min 4 characters)"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 pl-9 pr-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-650 hover:bg-slate-950 border border-indigo-505/20 text-indigo-150 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4.5 h-4.5 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                          <span>Registering Account Indices...</span>
                        </>
                      ) : (
                        <>
                          <span>REGISTER ACADEMIC ACCOUNT</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* 3. RECOVER ACCESS SECURE MODE (OTP & TIMER WORKFLOW) */}
                {mode === "forgot" && (
                  <motion.form 
                    key="forgot-password-box"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    onSubmit={forgotStep === "request" ? handleForgotRequest : handleVerifyOtpAndReset}
                    className="space-y-4"
                  >
                    {forgotStep === "request" ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            Registered Email or Phone
                          </label>
                          <div className="relative">
                            <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text"
                              required
                              value={forgotEmailOrPhone}
                              onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                              placeholder="e.g., student@libramanage.edu or registrar"
                              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-3.5 pl-11 pr-4 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600 font-semibold"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-450 pl-1 leading-relaxed">
                          A 5-digit password verification OTP code will be generated on our secure server list.
                        </p>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 border border-blue-500/30 font-semibold uppercase tracking-wider"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                              <span>Generating secure OTP code...</span>
                            </>
                          ) : (
                            <span>Request Recovery OTP Code</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* OTP Simulator Note */}
                        {receivedOtpCode && (
                          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 leading-relaxed font-semibold">
                            <span className="text-white block mb-0.5">📟 Sandbox SMS/Email Interceptor:</span>
                            To skip checking database files, your simulated OTP is <span className="bg-cyan-950 py-0.5 px-1.5 rounded text-white border border-cyan-500/30 font-mono tracking-widest text-[#22d3ee]">{receivedOtpCode}</span>. (Prefilled)
                          </div>
                        )}

                        {/* OTP Verification code field */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center pl-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                              Verification Code (OTP) *
                            </label>
                            <span className="text-[10px] text-rose-400 font-medium font-mono">
                              Expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                          <input 
                            type="text"
                            required
                            maxLength={5}
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            placeholder="Enter 5-digit OTP"
                            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-center tracking-[0.3em] font-mono text-sm text-white py-3 hover:border-slate-700 focus:border-cyan-500 outline-none"
                          />
                        </div>

                        {/* New Password input field */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-mono">
                            Create New Password *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                              type={showForgotPass ? "text" : "password"}
                              required
                              value={forgotNewPassword}
                              onChange={(e) => setForgotNewPassword(e.target.value)}
                              placeholder="Min 4 characters"
                              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 pl-9 pr-9 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => setShowForgotPass(!showForgotPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Submit Reset Action */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                              <span>Rewriting credentials...</span>
                            </>
                          ) : (
                            <span>Verify Code & Reset Password</span>
                          )}
                        </button>

                        {/* Return & Resend Throttle controller */}
                        <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400">
                          <button
                            type="button"
                            onClick={() => setForgotStep("request")}
                            className="hover:text-white underline cursor-pointer"
                          >
                            ← Change contact details
                          </button>
                          
                          <button
                            type="button"
                            disabled={resendTimer > 0}
                            onClick={handleForgotRequest}
                            className="hover:text-cyan-400 disabled:text-slate-600 disabled:no-underline font-semibold cursor-pointer underline"
                          >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP Code"}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.form>
                )}

              </AnimatePresence>

              {/* CARD LOWER NAVIGATION CONTROLS */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-semibold select-none">
                {mode === "login" ? (
                  <>
                    <span>Don't have a login token?</span>
                    <button 
                      onClick={() => setMode("register")}
                      className="text-cyan-400 hover:text-white cursor-pointer hover:underline transition-colors font-bold flex items-center gap-1"
                    >
                      Register New User Account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>Return to authentication gate?</span>
                    <button 
                      onClick={() => setMode("login")}
                      className="text-cyan-400 hover:text-white cursor-pointer hover:underline transition-colors font-bold"
                    >
                      Return to Secure Sign-In
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>



        </div>

      </div>

    </div>
  );
};
