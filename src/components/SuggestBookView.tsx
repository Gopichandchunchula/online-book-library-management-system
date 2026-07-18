import React, { useState } from "react";
import { 
  PlusCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb, 
  BookOpen, 
  User, 
  Folder, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Search,
  Filter
} from "lucide-react";
import { BookSuggestion, UserRole, UserProfile } from "../types";

interface SuggestBookProps {
  role: UserRole;
  profile: UserProfile;
  suggestions: BookSuggestion[];
  onSubmitSuggestion: (title: string, author: string, genre: string, message: string) => Promise<any>;
  onUpdateStatus: (id: string, status: "PENDING" | "APPROVED" | "REJECTED" | "ADDED_TO_LIBRARY") => Promise<any>;
}

export const SuggestBookView: React.FC<SuggestBookProps> = ({
  role,
  profile,
  suggestions = [],
  onSubmitSuggestion,
  onUpdateStatus
}) => {
  // Form states
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Technology");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Admin states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  // Genres selection options
  const genres = [
    "Technology",
    "Computer Science",
    "Fiction",
    "Non-Fiction",
    "Science",
    "Mathematics",
    "Business & Economics",
    "Self-Help",
    "Biography",
    "History",
    "Other"
  ];

  // Filter student's suggestions
  const isStaff = role === "ADMIN" || role === "LIBRARIAN";
  
  // For students, filter suggestions they submitted. We match on username/profile.name
  const mySuggestions = suggestions.filter(s => 
    s.username?.toLowerCase() === profile.name?.toLowerCase() || 
    s.user_id === profile.memberId
  );

  // For staff, filter by search term and status
  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = 
      s.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const displaySuggestions = isStaff ? filteredSuggestions : mySuggestions;
  const sortedSuggestions = [...displaySuggestions].sort((a, b) => {
    return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
  });

  // Calculate quick stats for Admin
  const totalPending = suggestions.filter(s => s.status === "PENDING").length;
  const totalApproved = suggestions.filter(s => s.status === "APPROVED" || s.status === "ADDED_TO_LIBRARY").length;
  const totalRejected = suggestions.filter(s => s.status === "REJECTED").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSuccess(null);
    setLocalError(null);

    const titleVal = bookName.trim();
    const authorVal = author.trim();
    const reasonVal = message.trim();

    if (!titleVal || !authorVal) {
      setLocalError("Book Title and Author fields are strictly mandatory.");
      return;
    }

    try {
      setLoading(true);
      await onSubmitSuggestion(titleVal, authorVal, category, reasonVal);
      setLocalSuccess(`Successfully submitted recommendation for "${titleVal}"!`);
      // Reset form fields
      setBookName("");
      setAuthor("");
      setCategory("Technology");
      setMessage("");
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="libramanage-suggest-book-tab">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none translate-x-12 select-none scale-150">
          <Lightbulb className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider font-mono">
            Catalog Acquisition Hub
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mt-3">
            {isStaff ? "Review Literature Acquisition Requests" : "Request Literature Purchase & Suggestions"}
          </h2>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            {isStaff 
              ? "Verify student recommendations, assess academic relevance, and upgrade the campus digital catalog."
              : "Can't find a specific digital book? Propose a new catalog item. Our procurement team evaluates acquisitions weekly."
            }
          </p>
        </div>
      </div>

      {/* Admin stats dashboard banner */}
      {isStaff && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Proposed</p>
              <p className="text-lg font-mono font-bold text-slate-900">{suggestions.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Decision</p>
              <p className="text-lg font-mono font-bold text-amber-600">{totalPending}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procured / Approved</p>
              <p className="text-lg font-mono font-bold text-emerald-600">{totalApproved}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
              <p className="text-lg font-mono font-bold text-rose-600">{totalRejected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (only for student or if staff wants to submit one too) */}
        {!isStaff ? (
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-500" /> Suggestion Docket
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Propose academic or research literature to be added to the digital catalog.
                </p>
              </div>

              {localSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{localSuccess}</span>
                </div>
              )}

              {localError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{localError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="e.g., Designing Data-Intensive Applications"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Martin Kleppmann"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Literature Genre / Domain
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs cursor-pointer font-semibold"
                  >
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Message / Business Justification
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about why this book is relevant, or what course curriculum this book belongs to..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all shadow-2xs font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Filing Request...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Submit Literature Suggestion
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-[10px] text-slate-400 font-medium">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              <span>We prioritize peer-reviewed literature and standard curricula material. Decision responses typically conclude within 48 hours.</span>
            </div>
          </div>
        ) : null}

        {/* Right Column: History / List */}
        <div className={`${isStaff ? "lg:col-span-12" : "lg:col-span-7"} bg-white p-6 rounded-2xl border border-slate-200 shadow-xs`}>
          
          {/* List Headers & Controls */}
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                {isStaff ? "Global Suggestion Register" : "My Suggestions Log"} ({sortedSuggestions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isStaff 
                  ? "Audit, filter, and dispatch approval statuses for proposed publications."
                  : "Track the acquisition workflow from standard evaluation to campus catalog integration."
                }
              </p>
            </div>

            {/* Admin search and filter */}
            {isStaff && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search titles, authors..."
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-500 font-medium w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-150">
                  {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        statusFilter === f 
                          ? "bg-white text-slate-900 shadow-3xs" 
                          : "text-slate-550 hover:text-slate-800 text-slate-500"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions List */}
          {sortedSuggestions.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-500">No suggestions listed.</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                {isStaff 
                  ? "No active suggestion tickets match the current selection filters." 
                  : "You haven't filed any literature suggestion requests yet. Use the docket form to submit your first suggestion."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSuggestions.map(s => {
                const isPending = s.status === "PENDING";
                const isApproved = s.status === "APPROVED" || s.status === "ADDED_TO_LIBRARY";
                const isRejected = s.status === "REJECTED";

                return (
                  <div 
                    key={s.id} 
                    className="border border-slate-150 hover:border-slate-300 rounded-xl p-4 md:p-5 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2.5 max-w-xl">
                      {/* Badge / Status row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                          ID: {s.id}
                        </span>
                        
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border uppercase flex items-center gap-1 ${
                          isPending 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : s.status === "ADDED_TO_LIBRARY" 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                            : isApproved 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {isPending && <Clock className="w-2.5 h-2.5" />}
                          {isApproved && <CheckCircle className="w-2.5 h-2.5" />}
                          {isRejected && <XCircle className="w-2.5 h-2.5" />}
                          {s.status === "ADDED_TO_LIBRARY" ? "Procured & Added" : s.status}
                        </span>

                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Folder className="w-2.5 h-2.5" /> {s.category}
                        </span>

                        {isStaff && s.username && (
                          <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> Proposed by: {s.username}
                          </span>
                        )}
                      </div>

                      {/* Book details */}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                          {s.book_name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          By {s.author}
                        </p>
                      </div>

                      {/* Reason / message */}
                      {s.message && (
                        <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200/50">
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
                            &ldquo;{s.message}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      {s.created_at && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          <span>Submitted on {s.created_at}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions column */}
                    {isStaff && isPending && (
                      <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <button
                          onClick={() => onUpdateStatus(s.id, "APPROVED")}
                          className="flex items-center gap-1 bg-white hover:bg-emerald-650 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-700 font-bold text-[10px] px-3 py-2 border border-slate-200 rounded-lg shadow-2xs cursor-pointer transition-all w-full sm:w-auto text-center justify-center"
                        >
                          <ThumbsUp className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => onUpdateStatus(s.id, "REJECTED")}
                          className="flex items-center gap-1 bg-white hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-700 font-bold text-[10px] px-3 py-2 border border-slate-200 rounded-lg shadow-2xs cursor-pointer transition-all w-full sm:w-auto text-center justify-center"
                        >
                          <ThumbsDown className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}

                    {/* Action to ADD TO CATALOGUE if approved but not added */}
                    {isStaff && s.status === "APPROVED" && (
                      <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <button
                          onClick={() => onUpdateStatus(s.id, "ADDED_TO_LIBRARY")}
                          className="flex items-center gap-1 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-2 rounded-lg shadow-2xs cursor-pointer transition-all w-full sm:w-auto text-center justify-center"
                        >
                          <PlusCircle className="w-3 h-3" /> Add to Catalog
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
