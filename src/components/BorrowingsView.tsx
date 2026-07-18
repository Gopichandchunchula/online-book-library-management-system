import React, { useState } from "react";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  BookOpen, 
  FileText,
  ShoppingBag,
  Layers,
  TrendingUp
} from "lucide-react";
import { Borrowing, UserRole, BookPurchase, Book } from "../types";

interface BorrowingsProps {
  role: UserRole;
  borrowings: Borrowing[];
  paymentHistory?: BookPurchase[];
  onReturnBook: (borrowingId: string) => void;
  books?: Book[];
  onTriggerPreview?: (book: Book) => void;
}

export const BorrowingsView: React.FC<BorrowingsProps> = ({
  role,
  borrowings,
  paymentHistory = [],
  onReturnBook,
  books = [],
  onTriggerPreview
}) => {
  const activeLoans = borrowings.filter(b => b.status === "ACTIVE" || b.status === "OVERDUE");
  
  // State for filtering activity
  const [filterType, setFilterType] = useState<"ALL" | "BORROWED" | "PURCHASED">("ALL");

  // Create unified activity list
  const combinedActivity = [
    ...borrowings.map(b => {
      let statusText: "Active" | "Overdue" | "Returned" = "Active";
      if (b.status === "OVERDUE") statusText = "Overdue";
      if (b.status === "RETURNED") statusText = "Returned";
      
      return {
        id: `borrow-${b.id}`,
        rawId: b.id,
        bookTitle: b.bookTitle,
        type: "Borrowed" as const,
        date: b.borrowDate,
        status: statusText,
        amount: b.fineAmount > 0 ? `Fine: ₹${b.fineAmount.toFixed(2)}` : "—",
        original: b,
      };
    }),
    ...paymentHistory.map(p => ({
      id: `purchase-${p.id}`,
      rawId: p.transactionId || p.id,
      bookTitle: p.bookTitle,
      type: "Purchased" as const,
      date: p.purchaseDate,
      status: "Owned" as const,
      amount: `₹${p.amount.toFixed(2)}`,
      original: p,
    }))
  ];

  // Sort by date descending
  combinedActivity.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filter items
  const filteredActivity = combinedActivity.filter(item => {
    if (filterType === "ALL") return true;
    if (filterType === "BORROWED") return item.type === "Borrowed";
    if (filterType === "PURCHASED") return item.type === "Purchased";
    return true;
  });

  return (
    <div className="space-y-6" id="libramanage-borrow-history">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Loans</p>
            <p className="text-lg font-mono font-bold text-slate-900">{activeLoans.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">eBooks Purchased</p>
            <p className="text-lg font-mono font-bold text-slate-900">{paymentHistory.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Investment</p>
            <p className="text-lg font-mono font-bold text-slate-900">
              ₹{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Active Borrowings Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Currently Possessed Books ({activeLoans.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active school sessions require material returns within standard 14-days windows to bypass outstanding late holds.
          </p>
        </div>

        {activeLoans.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No active checkouts found. Check the Browse Book catalog to check out books.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map(loan => (
              <div 
                key={loan.id} 
                className="border border-slate-150 rounded-xl p-5 bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                      {loan.id}
                    </span>
                    {loan.status === "OVERDUE" ? (
                      <span className="text-[9px] font-mono text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> OVERDUE (₹{loan.fineAmount.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-250 px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mt-3 leading-tight">{loan.bookTitle}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">By {loan.bookAuthor}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] border-t border-slate-200/50 pt-3">
                    <div>
                      <span className="text-slate-400 font-bold block">DATE BORROWED</span>
                      <span className="text-slate-700 font-mono font-semibold mt-0.5 block">{loan.borrowDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">DATE DUE</span>
                      <span className="text-slate-700 font-mono font-semibold mt-0.5 block">{loan.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200/50 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" /> 
                    {loan.status === "OVERDUE" ? "Late Penalty Accrues Daily" : "Expires in 6 days"}
                  </span>
                  
                  <button
                    onClick={() => onReturnBook(loan.id)}
                    className="bg-white hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-[11px] px-3.5 py-1.5 border border-slate-200 hover:border-slate-900 rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Discharge Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified My Library Activity Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> My Library Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified chronicle of checked-out literature, returns, and digital acquisitions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {(["ALL", "BORROWED", "PURCHASED"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === type 
                    ? "bg-white text-slate-900 shadow-2xs" 
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                {type === "ALL" ? "All Activity" : type === "BORROWED" ? "Borrowed" : "Purchased"}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-10">
            No activities matched your current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-bold">
                  <th className="py-3">INDEX ID</th>
                  <th className="py-3">BOOK TITLE</th>
                  <th className="py-3">TYPE</th>
                  <th className="py-3">DATE</th>
                  <th className="py-3">STATUS</th>
                  <th className="py-3 text-right">AMOUNT / FEES</th>
                  <th className="py-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredActivity.map(item => {
                  const isBorrowed = item.type === "Borrowed";
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] font-bold text-slate-400">
                        {item.rawId}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900 max-w-[220px] truncate">
                        {item.bookTitle}
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isBorrowed 
                            ? "bg-sky-50 text-sky-700 border border-sky-200" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">{item.date}</td>
                      <td className="py-3.5">
                        {item.status === "Active" && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
                            Active
                          </span>
                        )}
                        {item.status === "Overdue" && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                            Overdue
                          </span>
                        )}
                        {item.status === "Returned" && (
                          <span className="text-[10px] font-bold text-slate-550 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                            Returned
                          </span>
                        )}
                        {item.status === "Owned" && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            Acquired
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold text-slate-900">
                        {item.amount}
                      </td>
                      <td className="py-3.5 text-center">
                        {isBorrowed && (item.status === "Active" || item.status === "Overdue") ? (
                          <button
                            onClick={() => onReturnBook(item.rawId)}
                            className="bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 font-bold text-[10px] px-2 py-1 border border-slate-200 rounded-md transition-all cursor-pointer whitespace-nowrap"
                          >
                            Return
                          </button>
                        ) : item.type === "Purchased" ? (
                          <button
                            onClick={() => {
                              const purchase = item.original as BookPurchase;
                              const matchedBook = books?.find(b => b.id === purchase.bookId || b.title === purchase.bookTitle);
                              if (matchedBook && onTriggerPreview) {
                                onTriggerPreview(matchedBook);
                              }
                            }}
                            className="bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <BookOpen className="w-3 h-3" />
                            Read Book
                          </button>
                        ) : (
                          <span className="text-slate-350 text-[10px] font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
