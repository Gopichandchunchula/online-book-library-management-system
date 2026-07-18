export type UserRole = "STUDENT" | "LIBRARIAN" | "ADMIN";

export interface UserProfile {
  name: string;
  email: string;
  memberId: string;
  joinDate: string;
  role: UserRole;
  avatarSeed: string;
  phone: string;
  department?: string;
  previews?: string[];
  purchasedBooks?: string[];
}

export interface BookSuggestion {
  id: string;
  user_id: string;
  username: string;
  book_name: string;
  author: string;
  category: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ADDED_TO_LIBRARY";
  created_at: string;
}

export interface BookPurchase {
  id: string;
  bookId: string;
  bookTitle: string;
  purchaseDate: string;
  amount: number;
  paymentStatus: "SUCCESS" | "FAILED";
  transactionId: string;
  userId?: string;
  username?: string;
  userName?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publishedDate: string;
  copiesTotal: number;
  copiesAvailable: number;
  location: string;
  description: string;
  coverImage: string; // Tailored color badge or placeholder gradient
  rating: number;
  price?: number;
}

export interface Borrowing {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "ACTIVE" | "RETURNED" | "OVERDUE" | "PENDING_RETURN";
  fineAmount: number;
  userId?: string;
  username?: string;
  finePaid?: boolean;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  reserveDate: string;
  queuePosition: number;
  status: "PENDING" | "READY" | "CANCELLED" | "COMPLETED";
  userId?: string;
  username?: string;
}

export interface Fine {
  id: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: "UNPAID" | "PAID";
  dateIncurred: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  type: "BORROW" | "RETURN" | "RESERVE" | "FINE" | "SYSTEM" | "BOOK_ADD";
}
