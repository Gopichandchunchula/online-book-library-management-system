import React, { useState, useEffect } from "react";
import { 
  X, 
  HelpCircle, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  Play, 
  RefreshCw,
  LogOut,
  Info,
  Menu,
  Star,
  Bookmark,
  Settings,
  User,
  ChevronDown,
  Lock,
  Unlock,
  ShoppingBag,
  Receipt,
  PlusCircle,
  Sparkles,
  BookOpen,
  Mail,
  Clock,
  Laptop
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { UserRole, UserProfile, Book, Borrowing, Reservation, Fine, ActivityLog, BookPurchase, BookSuggestion } from "./types";
import { apiService } from "./lib/api";
import { 
  DEFAULT_PROFILES, 
  DEFAULT_BOOKS, 
  DEFAULT_BORROWINGS, 
  DEFAULT_RESERVATIONS, 
  DEFAULT_FINES, 
  DEFAULT_ACTIVITY_LOGS 
} from "./data";

// Custom views imports
import { LoginPage } from "./components/LoginPage";
import { getBookPrice } from "./utils/pricing";
import { CustomSidebar } from "./components/CustomSidebar";
import { DashboardView } from "./components/DashboardView";
import { BrowseBooksView } from "./components/BrowseBooksView";
import { BorrowingsView } from "./components/BorrowingsView";
import { 
  ReservationsView, 
  FinesView, 
  ReportsView, 
  ProfileView,
  SettingsView
} from "./components/OtherViews";
import { SuggestBookView } from "./components/SuggestBookView";
import { EBookReader } from "./components/EBookReader";
const UserManagementView = React.lazy(() => import("./components/UserManagementView").then(module => ({ default: module.UserManagementView })));

export default function App() {
  // Authentication, session & Page States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("libramanage_token");
  });
  const [activePage, setActivePage] = useState<"dashboard" | "books" | "borrowings" | "reservations" | "fines" | "reports" | "profile" | "settings" | "users" | "suggestions">(() => {
    return (localStorage.getItem("libramanage_active_page") as any) || "dashboard";
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("libramanage_dark_mode") === "true";
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("libramanage_role");
    return (savedRole as UserRole) || "STUDENT";
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem("libramanage_profile");
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        // use fallback
      }
    }
    return DEFAULT_PROFILES.STUDENT;
  });

  useEffect(() => {
    if (activePage === "users" && currentRole !== "ADMIN") {
      setActivePage("dashboard");
    } else {
      localStorage.setItem("libramanage_active_page", activePage);
    }
  }, [activePage, currentRole]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("libramanage_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("libramanage_dark_mode", "false");
    }
  }, [isDarkMode]);

  // Core database memory state connected directly to Django SQLite Tables
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(DEFAULT_ACTIVITY_LOGS);
  const [appLoading, setAppLoading] = useState<boolean>(false);

  // Secondary interaction states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEditingBook, setIsEditingBook] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  // Premium Previews & Purchases monetization states
  const [previewSnippet, setPreviewSnippet] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [purchasedList, setPurchasedList] = useState<BookPurchase[]>([]);
  const [purchaseHistorySynced, setPurchaseHistorySynced] = useState<boolean>(false);

  // Checkout gateway state variables
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(14.99);
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success" | "invoice">("details");
  const [paymentCard, setPaymentCard] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCvv, setPaymentCvv] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // Educational Book Suggestion/Recommendation states
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggestAuthor, setSuggestAuthor] = useState("");
  const [suggestGenre, setSuggestGenre] = useState("Technology");
  const [suggestNotes, setSuggestNotes] = useState("");
  const [allSuggestions, setAllSuggestions] = useState<BookSuggestion[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Reset edit state when book transitions
  useEffect(() => {
    if (!selectedBook) {
      setIsEditingBook(false);
    }
  }, [selectedBook]);

  // Synchronize database records from back-end REST service
  const fetchBackendData = async () => {
    if (!isAuthenticated) return;
    setAppLoading(true);
    try {
      const purchasesPromise = (currentRole === "ADMIN" || currentRole === "LIBRARIAN")
        ? apiService.getAllPurchases().catch(() => [])
        : apiService.getPurchases().catch(() => []);

      const [fetchedBooks, fetchedBorrowings, fetchedReservations, fetchedProfile, fetchedSuggestions, fetchedPurchases] = await Promise.all([
        apiService.getBooks(),
        apiService.getBorrowings(),
        apiService.getReservations(),
        apiService.getMe(),
        apiService.getBookSuggestions().catch(() => []),
        purchasesPromise
      ]);
      setBooks(fetchedBooks);
      setBorrowings(fetchedBorrowings);
      setReservations(fetchedReservations);
      setAllSuggestions(fetchedSuggestions);
      
      // Load from localStorage as backup/persistence
      const localPurchases = JSON.parse(localStorage.getItem("libramanage_all_purchases") || "[]");
      let mergedPurchases: BookPurchase[] = [];
      const map = new Map();

      if (currentRole === "ADMIN" || currentRole === "LIBRARIAN") {
        [...localPurchases, ...fetchedPurchases].forEach(p => {
          const id = p.id;
          const normalized = {
            id: p.id || id,
            userId: p.userId || p.user_id || "user_unknown",
            username: p.username || "student",
            userName: p.userName || p.username || "Gopichand",
            bookId: p.bookId || p.book_id,
            bookTitle: p.bookTitle || p.book_title,
            purchaseDate: p.purchaseDate || p.purchase_date,
            amount: Number(p.amount || 0),
            paymentStatus: p.paymentStatus || p.payment_status || "SUCCESS",
            transactionId: p.transactionId || p.transaction_id
          };
          map.set(id, normalized);
        });
        mergedPurchases = Array.from(map.values());
      } else {
        const activeProfile = fetchedProfile || profile;
        const studentEmail = activeProfile?.email || "";
        const studentMemberId = activeProfile?.memberId || "";
        const studentUsername = studentEmail.split("@")[0] || "student";

        const userLocal = localPurchases.filter((p: any) => 
          p.userId === studentMemberId || 
          p.username === studentUsername || 
          p.userId === studentEmail
        );

        [...userLocal, ...fetchedPurchases].forEach(p => {
          const id = p.id;
          const normalized = {
            id: p.id || id,
            userId: p.userId || p.user_id || studentMemberId,
            username: p.username || studentUsername,
            userName: p.userName || activeProfile?.name || "Gopichand",
            bookId: p.bookId || p.book_id,
            bookTitle: p.bookTitle || p.book_title,
            purchaseDate: p.purchaseDate || p.purchase_date,
            amount: Number(p.amount || 0),
            paymentStatus: p.paymentStatus || p.payment_status || "SUCCESS",
            transactionId: p.transactionId || p.transaction_id
          };
          map.set(id, normalized);
        });
        mergedPurchases = Array.from(map.values());
      }

      setPurchasedList(mergedPurchases);
      
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        if (fetchedProfile.role !== currentRole) {
          setCurrentRole(fetchedProfile.role);
        }
        localStorage.setItem("libramanage_profile", JSON.stringify(fetchedProfile));
        localStorage.setItem("libramanage_role", fetchedProfile.role);
      }
    } catch (e: any) {
      console.warn("Failed syncing API data, running on mock runtime fallback:", e);
    } finally {
      setAppLoading(false);
    }
  };

  // Trigger sync on boot or configuration updates
  useEffect(() => {
    fetchBackendData();
  }, [isAuthenticated, currentRole]);

  // Synced profile data upon switching role
  useEffect(() => {
    if (isAuthenticated) {
      const presetProfile = DEFAULT_PROFILES[currentRole];
      // Only overwrite the active user profile if they choose to shift to a different pre-seeded layout role
      if (presetProfile && profile?.role !== currentRole) {
        setProfile(presetProfile);
        localStorage.setItem("libramanage_profile", JSON.stringify(presetProfile));
      }
      localStorage.setItem("libramanage_role", currentRole);
      showToast(`Switched interface view to ${currentRole} Mode!`, "info");
    }
  }, [currentRole]);

  // Handle successful login authentication and save to persistence
  const handleLoginSuccess = (userProfile: UserProfile, role: UserRole) => {
    setProfile(userProfile);
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem("libramanage_auth", "true");
    localStorage.setItem("libramanage_role", role);
    localStorage.setItem("libramanage_profile", JSON.stringify(userProfile));
    setActivePage("dashboard");
    
    // Ensure sidebar is closed on mobile upon sign-in
    setIsMobileMenuOpen(false);
    
    // Add success toast
    showToast(`Session established! Welcome, ${userProfile.name}.`, "success");

    // Log Activity audit
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      userEmail: userProfile.email,
      userName: userProfile.name,
      userRole: role,
      action: `User session securely established from gate login`,
      timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: "SYSTEM"
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Terminate current active session and clean storage key-values
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("libramanage_auth");
    localStorage.removeItem("libramanage_role");
    localStorage.removeItem("libramanage_profile");
    localStorage.removeItem("libramanage_token");
    showToast("Active session logged out successfully.", "info");
  };

  // Utility toast dispatcher
  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper date generators
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getFutureStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  // 1. CHOOSE PLACE BOOK IN USER POSSESS (CHECKOUT)
  const handleBorrowBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Direct check of copies count in view
    if (book.copiesAvailable <= 0) {
      showToast("All physical copies have been checked out! Please choose PLACE RESERVATION instead.", "error");
      return;
    }

    try {
      setAppLoading(true);
      await apiService.borrowBook(book.id);
      showToast(`'${book.title}' checkout registered successfully! Retrievable at desk.`, "success");
      
      // Seed audit
      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(205 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Successfully checked out '${book.title}' (ID: ${book.id}) from digital terminal kiosk`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "BORROW"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      
      setSelectedBook(null);
      await fetchBackendData();
    } catch (e: any) {
      const errMsg = e.response?.data?.error || e.response?.data?.book || e.message || "Failed to catalog loan.";
      showToast(`Checkout Error: ${errMsg}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 2. RESERVE AN ASSET (HOLD PIPELINE)
  const handleReserveBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    try {
      setAppLoading(true);
      await apiService.reserveBook(book.id);
      showToast(`Reserved hold on '${book.title}' placed! You will be notified.`, "success");

      // Audit
      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Placed hold reservation queue on '${book.title}'`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "RESERVE"
      };
      setActivityLogs(prev => [newLog, ...prev]);

      setSelectedBook(null);
      await fetchBackendData();
    } catch (e: any) {
      const errMsg = e.response?.data?.error || e.response?.data?.book || e.message || "Failed to make hold.";
      showToast(`Reservation Error: ${errMsg}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 3. RETURN / DISCHARGE AN ASSET
  const handleReturnBook = async (borrowingId: string) => {
    const loan = borrowings.find(b => b.id === borrowingId);
    if (!loan) return;

    try {
      setAppLoading(true);
      const res = await apiService.returnBook(borrowingId);
      showToast(res?.message || `Discharged '${loan.bookTitle}' copy successfully to physical inventory shelves.`, "success");

      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Returned and checked-in academic asset '${loan.bookTitle}'`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "RETURN"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Discharge Error: ${e.response?.data?.error || e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 4. CANCEL RESERVATION HOLD
  const handleCancelReservation = async (resId: string) => {
    const hold = reservations.find(r => r.id === resId);
    if (!hold) return;

    try {
      setAppLoading(true);
      await apiService.cancelReservation(resId);
      showToast(`Cancelled reservation hold on '${hold.bookTitle}'.`, "info");

      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(205 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Cancelled reservation queue space on '${hold.bookTitle}'`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "SYSTEM"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Hold Cancel Error: ${e.response?.data?.error || e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 5. REGISTER NEW INVENTORY BOOK
  const handleRegisterNewBook = async (newBookData: Omit<Book, "id">) => {
    try {
      setAppLoading(true);
      const newBook = await apiService.addBook(newBookData);
      showToast(`Registered catalog copy list for '${newBook.title}' successfully!`, "success");

      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Registered new academic title '${newBook.title}' to catalogs`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "BOOK_ADD"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Book Register Error: ${e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 5b. UPDATE/EDIT EXISTING BOOK DETAILS
  const handleUpdateBook = async (bookId: string, updatedBookData: Partial<Book>) => {
    try {
      setAppLoading(true);
      const updatedBook = await apiService.updateBook(bookId, updatedBookData);
      showToast(`Updated details for '${updatedBook.title}' successfully!`, "success");

      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Updated details for book title '${updatedBook.title}' (ID: ${bookId})`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "SYSTEM"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      setSelectedBook(null); // Close modal on save
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Book Update Error: ${e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 6. DELETE BOOK FROM INVENTORY
  const handleDeleteBook = async (bookId: string) => {
    const bookToDelete = books.find(b => b.id === bookId);
    if (!bookToDelete) return;

    try {
      setAppLoading(true);
      await apiService.deleteBook(bookId);
      showToast(`Purged '${bookToDelete.title}' from inventory catalogs.`, "info");

      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Purged unique title inventory '${bookToDelete.title}'`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "SYSTEM"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Purge Error: ${e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 7. PAY FINES SETTLEMENT (Clear overdue markers in Django)
  const handlePayFines = async () => {
    try {
      setAppLoading(true);
      await apiService.payFines();
      showToast("Outstanding fine database balance resolved completely!", "success");

      // Audit
      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Cleared outstanding fines ledger balance (₹)` ,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "FINE"
      };
      setActivityLogs(prev => [newLog, ...prev]);
      await fetchBackendData();
    } catch (e: any) {
      showToast(`Fines Error: ${e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 7a. TRIGGER FREE E-READER BOOK PREVIEWS (Limit 5)
  const handleTriggerPreview = async (book: Book) => {
    // Check if book has been purchased already
    const isPurchased = profile?.purchasedBooks?.includes(book.id);
    if (isPurchased) {
      // Direct unlimited simulated full book render snippet
      setPreviewBook(book);
      setPreviewSnippet(
        `=== MASTER COPY ACCREDITED READOUT: ${book.title.toUpperCase()} ===\nISBN: ${book.isbn} | RACK Shelf Location: ${book.location}\n\n[UNLOCKED ACCESS] Welcome back, subscriber! Below is your custom e-Reader simulation of "${book.title}". Enjoy the full academic narrative.\n\nChapter 1 - Overview\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum tristique facilisis. Mauris sed lorem imperdiet magna scelerisque aliquam hendrerit id est.\n\nChapter 2 - Detailed Analysis\nSed tincidunt scelerisque facilisis. Phasellus ac libero at leo imperdiet ultrices sed ac risus.\n\nChapter 3 - References & Scientific Indexing\n${book.description}`
      );
      showToast(`Launching Full E-Book Reader for '${book.title}'`, "success");
      return;
    }

    try {
      setAppLoading(true);
      const res = await apiService.previewBook(book.id);
      if (res.allowed) {
        setPreviewBook(book);
        setPreviewSnippet(res.snippet || `=== FREE PREVIEW CONTENT SEED: '${book.title}' ===`);
        showToast(res.message || `Initializing Preview Reader (${res.remaining} slots remain)`, "success");
        await fetchBackendData();
      } else {
        showToast(res.message || "Preview access locked. Maximum preview quota of 5 books has been exceeded.", "error");
        // Open checkout options for them
        handleOpenCheckout(book);
      }
    } catch (e: any) {
      const errMsg = e.response?.data?.error || "Error initializing preview e-Reader.";
      showToast(errMsg, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 7b. OPEN PREMIUM CHECKOUT FORM
  const handleOpenCheckout = (book: Book) => {
    setCheckoutBook(book);
    setPurchasePrice(getBookPrice(book.title)); // Standard mock academic book asset price
    setPaymentCard("");
    setPaymentExpiry("");
    setPaymentCvv("");
    setPaymentName(profile?.name || "");
    setPaymentTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setGeneratedInvoice(null);
    setPaymentStep("details");
  };

  // 7c. SIMULATE SECURE PAYMENT GATEWAY ENDPOINT
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook) return;

    const digits = paymentCard.replace(/\D/g, "");
    if (digits.length !== 16) {
      showToast("Please enter valid 16-digit card number", "error");
      return;
    }

    setPaymentStep("processing");

    // Hold visual latency to mimic payment validation handshake
    setTimeout(async () => {
      try {
        const payloadCard = paymentCard.trim() || "4000-1234-5678-9010";
        const result = await apiService.purchaseBook(checkoutBook.id, purchasePrice, payloadCard);
        
        if (result.success) {
          // Save to localStorage list for persistence across re-seeding / restarts
          const localPurchase = {
            id: result.purchase.id,
            userId: profile.memberId || profile.email || "user_1",
            username: profile.email ? profile.email.split("@")[0] : "student",
            userName: profile.name || "Gopichand",
            bookId: checkoutBook.id,
            bookTitle: checkoutBook.title,
            purchaseDate: result.purchase.purchaseDate,
            amount: purchasePrice,
            paymentStatus: "SUCCESS",
            transactionId: result.purchase.transactionId
          };

          const existingLocal = JSON.parse(localStorage.getItem("libramanage_all_purchases") || "[]");
          if (!existingLocal.some((p: any) => p.id === localPurchase.id)) {
            existingLocal.push(localPurchase);
            localStorage.setItem("libramanage_all_purchases", JSON.stringify(existingLocal));
          }

          setPaymentTransactionId(result.purchase.transactionId);
          setGeneratedInvoice({
            transactionId: result.purchase.transactionId,
            bookTitle: checkoutBook.title,
            bookIsbn: checkoutBook.isbn,
            amount: purchasePrice,
            purchaseDate: result.purchase.purchaseDate,
            gateway: "LibreManage Sandbox POS Pay-Gate V2",
            accountEmail: profile?.email,
            holderName: paymentName || "Authorized Member"
          });
          setPaymentStep("success");
          showToast(`Invoice generated! Successfully bought '${checkoutBook.title}'.`, "success");

          // Seed dynamic activity log entry
          const newLog: ActivityLog = {
            id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
            userEmail: profile.email,
            userName: profile.name,
            userRole: currentRole,
            action: `Instant-Paid Digital Acquisition: '${checkoutBook.title}' for ₹${purchasePrice} (Acq-No: ${result.purchase.transactionId})`,
            timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            type: "SYSTEM"
          };
          setActivityLogs(prev => [newLog, ...prev]);
          await fetchBackendData();
        } else {
          setPaymentStep("details");
          showToast(result.message || "Payment transaction declined by acquirer.", "error");
        }
      } catch (err: any) {
        setPaymentStep("details");
        const msg = err.response?.data?.error || "Error processing digital checkout acquisition.";
        showToast(msg, "error");
      }
    }, 1250);
  };

  // 7d. SUBMIT BOOK RECOMMENDATION / ACQUISITION SUGGESTIONS
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleVal = suggestTitle.trim();
    const authorVal = suggestAuthor.trim();
    const genreVal = suggestGenre;
    const notesVal = suggestNotes.trim();

    if (!titleVal || !authorVal) {
      showToast("Book title and author elements are strictly mandatory.", "error");
      return;
    }

    try {
      setAppLoading(true);
      const res = await apiService.suggestBook({
        book_name: titleVal,
        author: authorVal,
        category: genreVal,
        message: notesVal
      });

      showToast(res.message || "Library acquisition suggest ticket dispatched!", "success");
      
      // Reset forms
      setSuggestTitle("");
      setSuggestAuthor("");
      setSuggestGenre("Technology");
      setSuggestNotes("");
      setSuggestionModalOpen(false);

      // Audit logs
      const newLog: ActivityLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        userEmail: profile.email,
        userName: profile.name,
        userRole: currentRole,
        action: `Submitted new library acquisition request: '${titleVal}' by ${authorVal}`,
        timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: "SYSTEM"
      };
      setActivityLogs(prev => [newLog, ...prev]);

      await fetchBackendData();
    } catch (err: any) {
      showToast(`Suggestion Error: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // 7e. ADMIN/LIBRARIAN ONLY: MODIFY SUGGESTION DISPATCH INDICES
  const handleUpdateSuggestionStatus = async (id: string, nextStatus: "PENDING" | "APPROVED" | "REJECTED" | "ADDED_TO_LIBRARY") => {
    try {
      setAppLoading(true);
      const res = await apiService.updateSuggestionStatus(id, nextStatus);
      showToast(res.message || `Dispatched ticket status change index successfully to ${nextStatus}!`, "success");
      await fetchBackendData();
    } catch (err: any) {
      showToast(`Status Update Error: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  const handleCreateSuggestion = async (title: string, author: string, genre: string, message: string) => {
    const res = await apiService.suggestBook({
      book_name: title,
      author: author,
      category: genre,
      message: message
    });
    // Audit logs
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      userEmail: profile.email,
      userName: profile.name,
      userRole: currentRole,
      action: `Submitted new library acquisition request: '${title}' by ${author}`,
      timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: "SYSTEM"
    };
    setActivityLogs(prev => [newLog, ...prev]);
    await fetchBackendData();
    return res;
  };

  const handleUpdateSuggestionStatusState = async (id: string, nextStatus: "PENDING" | "APPROVED" | "REJECTED" | "ADDED_TO_LIBRARY") => {
    const res = await apiService.updateSuggestionStatus(id, nextStatus);
    // Audit logs
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      userEmail: profile.email,
      userName: profile.name,
      userRole: currentRole,
      action: `Updated recommendation ID ${id} status index to ${nextStatus}`,
      timestamp: `${getTodayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: "SYSTEM"
    };
    setActivityLogs(prev => [newLog, ...prev]);
    await fetchBackendData();
    return res;
  };

  // 8. UPDATE DEMOGRAPHIC SELECTIONS
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      setAppLoading(true);
      const result = await apiService.updateMe(updatedProfile);
      setProfile(result);
      localStorage.setItem("libramanage_profile", JSON.stringify(result));
      showToast("Demographics registered index configured successfully!", "success");
    } catch (e: any) {
      showToast(`Profile Update Error: ${e.message}`, "error");
    } finally {
      setAppLoading(false);
    }
  };

  // Derive Fines array on the fly from server borrowings telemetry
  const fines: Fine[] = borrowings
    .filter(b => b.status === "OVERDUE" || b.fineAmount > 0)
    .map((b, index) => ({
      id: `FN-${b.id}`,
      bookTitle: b.bookTitle,
      amount: b.fineAmount,
      reason: b.status === "OVERDUE" ? "Overdue past due date" : "Late return fine fee",
      status: b.finePaid ? "PAID" : "UNPAID",
      dateIncurred: b.borrowDate
    }));

  // Count indices for triggers
  const activeUnpaidCount = fines.filter(f => f.status === "UNPAID").length;
  const activeBorrowedCount = borrowings.filter(b => b.status === "ACTIVE" || b.status === "OVERDUE").length;
  const activeReservationsCount = reservations.filter(r => r.status === "PENDING" || r.status === "READY").length;
  const pendingSuggestionsCount = allSuggestions.filter(s => s.status === "PENDING").length;

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          existingProfiles={DEFAULT_PROFILES} 
        />
        {/* FLOAT TOAST DYNAMIC SYSTEM ALERTS */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-55 max-w-sm p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-2.5 overflow-hidden ${
                toastType === "success" 
                  ? "bg-white border-emerald-150 text-emerald-850" 
                  : toastType === "error" 
                  ? "bg-white border-rose-150 text-rose-850" 
                  : "bg-white border-indigo-150 text-indigo-900"
              }`}
            >
              {/* Visual alert line indicator */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                toastType === "success" ? "bg-emerald-500" : toastType === "error" ? "bg-rose-500" : "bg-indigo-600"
              }`}></div>
              
              <div className="pl-1.5 flex gap-2">
                {toastType === "success" && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                {toastType === "error" && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                {toastType === "info" && <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-slate-850 pr-4">{toastMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200" id="libramanage-viewport">
      
      {/* Dynamic Slide Drawer for Mobile sizes */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative flex-1 flex flex-col w-full max-w-xs bg-slate-900 h-full"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <CustomSidebar 
                activePage={activePage}
                onNavigate={(page) => {
                  setActivePage(page);
                  setIsMobileMenuOpen(false);
                }}
                currentRole={currentRole}
                onChangeRole={(role) => {
                  setCurrentRole(role);
                  setIsMobileMenuOpen(false);
                }}
                profile={profile}
                borrowingsCount={activeBorrowedCount}
                reservationsCount={activeReservationsCount}
                unpaidFinesCount={activeUnpaidCount}
                pendingSuggestionsCount={pendingSuggestionsCount}
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Large Device Sidebar Rail */}
      <div className="hidden md:block">
        <CustomSidebar 
          activePage={activePage}
          onNavigate={setActivePage}
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          profile={profile}
          borrowingsCount={activeBorrowedCount}
          reservationsCount={activeReservationsCount}
          unpaidFinesCount={activeUnpaidCount}
          pendingSuggestionsCount={pendingSuggestionsCount}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Content Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Dynamic Nav header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sans tracking-tight">
              {activePage === "fines" 
                ? "Fines & Payments" 
                : activePage === "reports" 
                  ? "System Reports & Logs" 
                  : activePage === "profile" 
                    ? "Profile Catalog Settings" 
                    : activePage === "settings" 
                      ? "System Preferences" 
                      : `${activePage.charAt(0).toUpperCase() + activePage.slice(1)} Dashboard`
              }
            </h2>
          </div>

          <div className="flex items-center gap-3.5 relative">
            {/* Quick role visual indicator */}
            <span className="hidden sm:inline-block text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 py-1 px-2.5 rounded-full uppercase tracking-wider">
               Role view: {currentRole} Mode
            </span>

            {/* Quick Settings Shortcut Gear */}
            <button 
              onClick={() => setActivePage("settings")}
              className={`p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors ${activePage === "settings" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-800"}`}
              title="System Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Simulated Notification Indicator */}
            <div className="relative p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-500 hover:text-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full"></span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* MODERN PROFILE AVATAR DROPDOWN WRAPPER */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 border border-slate-100 hover:border-slate-300 p-1.5 rounded-xl transition-all cursor-pointer select-none group"
                id="profile-dropdown-trigger"
              >
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-extrabold text-xs text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
                  {profile.avatarSeed}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-700 truncate max-w-[100px]">
                  {profile.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop cover overlay to trigger close when clicking outside */}
                    <div 
                      className="fixed inset-0 z-30 opacity-0 cursor-default" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-40 space-y-3 mr-0.5"
                    >
                      {/* Dropdown Profile Header */}
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs">
                          {profile.avatarSeed}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs truncate leading-tight">{profile.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate leading-none mt-1">{profile.email}</p>
                        </div>
                      </div>

                      {/* Role & quick status */}
                      <div className="bg-indigo-50/40 border border-indigo-100/60 p-2 rounded-xl text-[10px] text-indigo-900 flex justify-between items-center font-medium">
                        <span>Role Permissions:</span>
                        <span className="bg-indigo-650 text-white font-extrabold px-1.5 py-0.5 rounded leading-none text-[9px] uppercase tracking-wider">{currentRole}</span>
                      </div>

                      {/* Dropdown Menu Items */}
                      <div className="space-y-1">
                        <button 
                          onClick={() => {
                            setActivePage("profile");
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activePage === "profile" ? "bg-slate-100 text-slate-900" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                          <User className="w-3.5 h-3.5" /> Demographic Profile
                        </button>

                        <button 
                          onClick={() => {
                            setActivePage("settings");
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${activePage === "settings" ? "bg-slate-100 text-slate-900" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                          <Settings className="w-3.5 h-3.5" /> App Preferences
                        </button>
                      </div>

                      <div className="h-[1px] bg-slate-100"></div>

                      {/* Quick Logout trigger */}
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left font-extrabold text-xs text-rose-600 hover:bg-rose-50 p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Secure Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* View Layout Router */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage + "-" + currentRole}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activePage === "dashboard" && (
                <DashboardView 
                  role={currentRole}
                  profile={profile}
                  books={books}
                  borrowings={borrowings}
                  reservations={reservations}
                  fines={fines}
                  activityLogs={activityLogs}
                  purchasedList={purchasedList}
                  onNavigate={setActivePage}
                  onSelectBook={setSelectedBook}
                  onApproveReturn={handleReturnBook}
                  onCancelReservation={handleCancelReservation}
                  onTriggerPreview={handleTriggerPreview}
                />
              )}

              {activePage === "books" && (
                <BrowseBooksView 
                  role={currentRole}
                  books={books}
                  onSelectBook={setSelectedBook}
                  onAddBook={handleRegisterNewBook}
                  onDeleteBook={handleDeleteBook}
                />
              )}

              {activePage === "borrowings" && (
                <BorrowingsView 
                  role={currentRole}
                  borrowings={borrowings}
                  paymentHistory={purchasedList}
                  onReturnBook={handleReturnBook}
                  books={books}
                  onTriggerPreview={handleTriggerPreview}
                />
              )}

              {activePage === "reservations" && (
                <ReservationsView 
                  reservations={reservations}
                  onCancelReservation={handleCancelReservation}
                />
              )}

              {activePage === "fines" && (
                <FinesView 
                  fines={fines}
                  paymentHistory={purchasedList}
                  onPayFines={handlePayFines}
                />
              )}

              {activePage === "reports" && (
                <ReportsView 
                  role={currentRole}
                  activityLogs={activityLogs}
                />
              )}

              {activePage === "profile" && (
                <ProfileView 
                  profile={profile}
                  borrowings={borrowings}
                  reservations={reservations}
                  fines={fines}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

              {activePage === "users" && currentRole === "ADMIN" && (
                <React.Suspense fallback={
                  <div className="flex flex-col items-center justify-center p-20 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-md">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-slate-300 font-bold tracking-wide">Initializing secure database portal...</p>
                    <p className="text-xs text-slate-550 text-slate-500 mt-1">Please wait while the management ledger loads</p>
                  </div>
                }>
                  <UserManagementView />
                </React.Suspense>
              )}

              {activePage === "settings" && (
                <SettingsView 
                  profile={profile}
                  currentRole={currentRole}
                  onChangeRole={setCurrentRole}
                  onLogout={handleLogout}
                />
              )}

              {activePage === "suggestions" && (
                <SuggestBookView 
                  role={currentRole}
                  profile={profile}
                  suggestions={allSuggestions}
                  onSubmitSuggestion={handleCreateSuggestion}
                  onUpdateStatus={handleUpdateSuggestionStatusState}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* GLOBAL BOOK DETAILS MODAL POPUP */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              {/* Cover visual Banner */}
              <div className="p-6 text-white relative overflow-hidden min-h-[160px] flex flex-col justify-end">
                {selectedBook.coverImage && selectedBook.coverImage.startsWith("http") ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={selectedBook.coverImage} 
                      alt={selectedBook.title}
                      className="w-full h-full object-cover brightness-[0.4] scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/15" />
                  </div>
                ) : (
                  <div className={`absolute inset-0 ${selectedBook.coverImage || "bg-indigo-600"} z-0`} />
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 text-white hover:text-white bg-black/40 backdrop-blur-xs p-1.5 rounded-full cursor-pointer hover:bg-black/60 transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 flex items-center gap-1.5">
                  <span className="text-[9px] font-bold tracking-widest bg-black/40 backdrop-blur-xs border border-white/10 px-2.5 py-0.5 rounded uppercase">
                    {selectedBook.genre}
                  </span>
                  <div className="flex items-center gap-0.5 bg-black/45 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                    <span>{selectedBook.rating} Rating</span>
                  </div>
                </div>

                <h3 className="relative z-10 font-extrabold text-xl mt-4 leading-tight tracking-tight drop-shadow-md">{selectedBook.title}</h3>
                <p className="relative z-10 text-white/95 text-[11px] mt-1 drop-shadow-sm font-medium">Author: {selectedBook.author} • ISBN: {selectedBook.isbn}</p>
              </div>

              {/* Modal Body Info */}
              <div className="p-6">
                {isEditingBook ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as any;
                    handleUpdateBook(selectedBook.id, {
                      title: target.title.value,
                      author: target.author.value,
                      genre: target.genre.value,
                      isbn: target.isbn.value,
                      location: target.location.value,
                      description: target.description.value,
                      copiesTotal: Number(target.copiesTotal.value),
                      copiesAvailable: Number(target.copiesAvailable.value),
                      rating: Number(target.rating.value)
                    });
                  }} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Book Title</label>
                        <input name="title" defaultValue={selectedBook.title} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Author Name</label>
                        <input name="author" defaultValue={selectedBook.author} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Genre Category</label>
                        <select name="genre" defaultValue={selectedBook.genre} className="w-full border border-slate-200 p-2 text-xs rounded-lg bg-white text-slate-800 focus:border-indigo-500 outline-none">
                          <option value="Technology">Technology</option>
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Philosophy">Philosophy</option>
                          <option value="Science">Science</option>
                          <option value="Literature">Literature</option>
                          <option value="History">History</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">ISBN Index</label>
                        <input name="isbn" defaultValue={selectedBook.isbn} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Physical Shelf Coordinate</label>
                        <input name="location" defaultValue={selectedBook.location} className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Total Copies</label>
                        <input type="number" min={1} max={100} name="copiesTotal" defaultValue={selectedBook.copiesTotal} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Available Copies</label>
                        <input type="number" min={0} max={100} name="copiesAvailable" defaultValue={selectedBook.copiesAvailable} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Rating (1.0 - 5.0)</label>
                        <input type="number" min={1.0} max={5.0} step={0.1} name="rating" defaultValue={selectedBook.rating} required className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Synopsis Narrative</label>
                        <textarea name="description" rows={3} defaultValue={selectedBook.description} className="w-full border border-slate-200 p-2 text-xs rounded-lg text-slate-800 resize-none focus:border-indigo-500 outline-none"></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-150 pt-4 mt-4">
                      <button type="button" onClick={() => setIsEditingBook(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-slate-900 border border-indigo-700 rounded-lg cursor-pointer transition-all shadow-xs">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Descriptive section */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest leading-none">Book Synopsis</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {selectedBook.description}
                      </p>
                      
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-2 text-[11px] text-slate-500">
                        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <p>To support multi-role simulations, borrowing decreases the available copy tally in memory instantly, and places hold checks on reservations tables.</p>
                      </div>
                    </div>

                    {/* Logistics Info column */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Shelf Location</span>
                        <span className="font-mono text-slate-800 font-bold block mt-0.5">{selectedBook.location}</span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inventory Status</span>
                        <div className="mt-1.5">
                          {selectedBook.copiesAvailable > 0 ? (
                            <>
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full font-bold">
                                {selectedBook.copiesAvailable} copies available
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">Total stock: {selectedBook.copiesTotal}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full font-bold">
                                Fully Checked Out
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">Total stock: {selectedBook.copiesTotal}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Operational actions */}
                      <div className="border-t border-slate-200/60 pt-4 space-y-3">
                        {/* Premium Digital Features Section */}
                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5">
                          <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[10px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            Premium Digital Kiosk
                          </div>

                          {profile?.purchasedBooks?.includes(selectedBook.id) ? (
                            <div className="space-y-1.5">
                              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-55 bg-emerald-100/60 border border-emerald-200/50 py-1 px-2.5 rounded-lg font-bold">
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                Unlocked: Permanent Digital copy
                              </span>
                              <button
                                onClick={() => handleTriggerPreview(selectedBook)}
                                className="w-full text-center text-xs font-bold text-white bg-indigo-600 hover:bg-slate-900 border border-indigo-700 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Read Book (Full Copy)
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Preview Access Action */}
                              <div>
                                {5 - (profile?.previews?.length || 0) <= 0 && !profile?.previews?.includes(selectedBook.id) ? (
                                  <div className="space-y-1.5">
                                    <button
                                      disabled
                                      className="w-full text-center text-xs font-bold text-slate-400 bg-slate-200 border border-slate-300 py-2 rounded-xl cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                      Free Preview Locked
                                    </button>
                                    <span className="text-[9px] text-rose-500 font-semibold block text-center">
                                      Quota exceeded (0 of 5 previews remain)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <button
                                      onClick={() => handleTriggerPreview(selectedBook)}
                                      className="w-full text-center text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      Read Book (Free Sample)
                                    </button>
                                    <span className="text-[9px] text-slate-500 font-semibold block text-center font-mono">
                                      Remaining previews: {5 - (profile?.previews?.length || 0)} of 5 slots
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Buy Access Action */}
                              <button
                                onClick={() => handleOpenCheckout(selectedBook)}
                                className="w-full text-center text-xs font-bold text-white bg-amber-600 hover:bg-slate-900 border border-amber-750 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Purchase Digital Book (₹{getBookPrice(selectedBook.title)})
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Standard Checkout or Placement Holds */}
                        {selectedBook.copiesAvailable > 0 ? (
                          <button
                            onClick={() => handleBorrowBook(selectedBook.id)}
                            className="w-full text-center text-xs font-bold text-white bg-indigo-600 hover:bg-slate-950 border border-indigo-700 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs"
                          >
                            Direct Loan Checkout (14 Days)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReserveBook(selectedBook.id)}
                            className="w-full text-center text-xs font-bold text-white bg-amber-600 hover:bg-slate-950 border border-amber-700 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs"
                          >
                            Place Hold Queue Reservation
                          </button>
                        )}

                        {(currentRole === "ADMIN" || currentRole === "LIBRARIAN") && (
                          <button
                            onClick={() => setIsEditingBook(true)}
                            className="w-full text-center text-xs font-bold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 py-2 rounded-xl cursor-pointer bg-white transition-all shadow-xs"
                          >
                            Edit Book Details
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedBook(null)}
                          className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-250 py-2 rounded-xl cursor-pointer bg-white"
                        >
                          Close Details Panel
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT TOAST DYNAMIC SYSTEM ALERTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-55 max-w-sm p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-2.5 overflow-hidden ${
              toastType === "success" 
                ? "bg-white border-emerald-150 text-emerald-850" 
                : toastType === "error" 
                ? "bg-white border-rose-150 text-rose-850" 
                : "bg-white border-indigo-150 text-indigo-900"
            }`}
          >
            {/* Visual alert line indicator */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
              toastType === "success" ? "bg-emerald-505 bg-emerald-500" : toastType === "error" ? "bg-rose-505 bg-rose-500" : "bg-indigo-505 bg-indigo-600"
            }`}></div>
            
            <div className="pl-1.5 flex gap-2">
              {toastType === "success" && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
              {toastType === "error" && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
              {toastType === "info" && <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-slate-850 pr-4">{toastMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A. PREMIUM E-READER MODULE */}
      <AnimatePresence>
        {previewBook && (
          <EBookReader
            book={previewBook}
            isUnlocked={!!profile?.purchasedBooks?.includes(previewBook.id)}
            onClose={() => {
              setPreviewBook(null);
              setPreviewSnippet(null);
            }}
            onBuyBook={() => {
              setPreviewBook(null);
              setPreviewSnippet(null);
              handleOpenCheckout(previewBook);
            }}
          />
        )}
      </AnimatePresence>

      {/* B. INSTANT DIGITAL CHECKOUT & PAYMENT MODAL */}
      <AnimatePresence>
        {checkoutBook && (
          <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-55 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2.5xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Checkout Cover Header */}
              <div className="p-5 bg-slate-955 bg-gradient-to-br from-slate-950 to-slate-900 border-b border-indigo-950/40 relative">
                <button
                  type="button"
                  onClick={() => setCheckoutBook(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-lg p-1 hover:bg-slate-800/80 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="pr-8">
                  <h4 className="font-extrabold text-sm tracking-tight text-white">LibreManage Secured Checkout</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure payment processing gateway • Sandbox environment</p>
                </div>
              </div>

              {/* Steps views */}
              {paymentStep === "details" && (
                <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                  {/* Ledger display */}
                  <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">DIGITAL ITEM SUMMARY:</span>
                      <p className="text-white line-clamp-1">{checkoutBook.title}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-[10px] text-indigo-400 font-bold block">PRICE</span>
                      <span className="text-amber-400 font-mono text-sm font-extrabold">₹{purchasePrice}</span>
                    </div>
                  </div>

                  {/* Sandbox Card Alert */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 leading-relaxed font-semibold">
                    💡 <span className="text-white font-bold">Simulator Safe Checkout:</span> This is a mock POS. Fill out any details to authorize simulated transaction successfully!
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Cardholder Billing Name *</label>
                      <input
                        type="text"
                        required
                        value={paymentName}
                        onChange={(e) => setPaymentName(e.target.value)}
                        placeholder="e.g. Dr. Jane Doe"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Debit / Credit Card Number *</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={paymentCard}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const formatted = val.match(/.{1,4}/g)?.join("-") || "";
                          setPaymentCard(formatted.slice(0, 19));
                        }}
                        placeholder="4000-1234-5678-9010"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all font-mono tracking-widest font-semibold text-center"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Expiration *</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={paymentExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                            setPaymentExpiry(val);
                          }}
                          placeholder="MM/YY"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all text-center font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CCV / CVV *</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={paymentCvv}
                          onChange={(e) => setPaymentCvv(e.target.value.replace(/\D/g, ""))}
                          placeholder="***"
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white py-2.5 px-3 hover:border-slate-700 focus:border-cyan-500 outline-none transition-all text-center font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-550 from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Authorize payment & Buy copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutBook(null)}
                      className="w-full text-center text-slate-400 hover:text-white mt-2.5 text-xs font-semibold cursor-pointer py-1"
                    >
                      Cancel transaction
                    </button>
                  </div>
                </form>
              )}

              {paymentStep === "processing" && (
                <div className="p-12 text-center space-y-4 select-none">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-white">Contacting Acquirer Gateway Kiosks</h5>
                    <p className="text-[11px] text-slate-400">Verifying secure digital vault keys token structures...</p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && generatedInvoice && (
                <div className="p-6 space-y-5">
                  <div className="text-center space-y-2 select-none">
                    <div className="w-10 h-10 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs tracking-wider uppercase text-emerald-400">Transaction Authorized</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">Asset successfully cataloged under your personal digital shelf!</p>
                    </div>
                  </div>

                  {/* Invoice Summary Card */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 text-xs leading-relaxed text-slate-700 shadow-sm relative overflow-hidden">
                    {/* Visual Stamp / Watermark background effect */}
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full flex items-center justify-center border-4 border-dashed border-emerald-500/10 rotate-12 pointer-events-none select-none">
                      <span className="text-[8px] text-emerald-500/20 font-black tracking-widest font-mono">PAID</span>
                    </div>

                    {/* Official Receipt Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 tracking-tight text-sm">LIBRAMANAGE ACADEMIC PRESS</h4>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{generatedInvoice.gateway}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Invoice ID</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-bold tracking-tight">{generatedInvoice.transactionId}</span>
                      </div>
                    </div>

                    {/* Item Row / Description */}
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">Premium Digital Edition eBook</span>
                          <h5 className="font-bold text-slate-900 leading-snug">{generatedInvoice.bookTitle}</h5>
                          <p className="text-[10px] text-slate-500 font-mono">ISBN: {generatedInvoice.bookIsbn}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-900 font-mono">₹{Number(generatedInvoice.amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Details List */}
                    <div className="space-y-2 text-[11px] pt-1 px-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Billed To:</span>
                        <span className="text-slate-800 font-bold">{generatedInvoice.holderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Student / User Email:</span>
                        <span className="text-slate-700 font-mono">{generatedInvoice.accountEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Acquisition Date:</span>
                        <span className="text-slate-700 font-mono">{generatedInvoice.purchaseDate ? generatedInvoice.purchaseDate.split("T")[0] : new Date().toISOString().split("T")[0]}</span>
                      </div>
                    </div>

                    {/* Grand Total Area */}
                    <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center px-1">
                      <div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">Authorized Paid</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Grand Total</span>
                        <span className="text-base font-black text-slate-900 font-mono">₹{Number(generatedInvoice.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold py-2 px-3 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-slate-300" />
                      Print Plain Invoice
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutBook(null);
                        handleTriggerPreview(checkoutBook);
                      }}
                      className="flex-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Open eBook Now
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. SUBMIT DYNAMIC BOOK RECOMMENDATION ACQUISITIONS MODAL */}
      <AnimatePresence>
        {suggestionModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-55 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2.5xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-200"
            >
              {/* Header Box */}
              <div className="bg-slate-950 p-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-cyan-400" /> Suggest Book for Acquisition
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Can't resolve specific titles? Recommend acquisitions to Librarians</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuggestionModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Suggestions Form Body */}
              <form onSubmit={handleSubmitSuggestion} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Recommended Book Title *</label>
                    <input
                      type="text"
                      required
                      value={suggestTitle}
                      onChange={(e) => setSuggestTitle(e.target.value)}
                      placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                      className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-xl outline-none focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={suggestAuthor}
                      onChange={(e) => setSuggestAuthor(e.target.value)}
                      placeholder="e.g. Robert C. Martin"
                      className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-xl outline-none focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Recommended Category</label>
                    <select
                      value={suggestGenre}
                      onChange={(e) => setSuggestGenre(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 text-xs rounded-xl outline-none focus:border-indigo-500 bg-white text-slate-800"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Science">Science</option>
                      <option value="Literature">Literature</option>
                      <option value="History">History</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Recommend Message & Notes (Why should we acquire it?)</label>
                    <textarea
                      rows={3}
                      value={suggestNotes}
                      onChange={(e) => setSuggestNotes(e.target.value)}
                      placeholder="Required for educational index. Write a short reason on why this title would aid your academic directory ops..."
                      className="w-full border border-slate-200 p-2 text-xs rounded-xl text-slate-800 resize-none focus:border-indigo-500 outline-none"
                    ></textarea>
                  </div>
                </div>

                {/* Submissions button */}
                <div className="flex justify-end gap-2 border-t border-slate-150 pt-4 mt-4 text-xs font-bold leading-none">
                  <button
                    type="button"
                    onClick={() => setSuggestionModalOpen(false)}
                    className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-250 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-indigo-600 hover:bg-slate-900 rounded-lg cursor-pointer transition-all border border-indigo-750"
                  >
                    Submit Recommendation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
