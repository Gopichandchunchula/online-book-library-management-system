import axios from "axios";
import { Book, Borrowing, Reservation, UserProfile, UserRole } from "../types";

// Setup base URL pointing to Node proxy server at port 3000
const API_BASE_URL = "https://online-book-library-management-system.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Automatically inject JWT Bearer Authorization header into all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("libramanage_token");
    if (token && config.headers) {
      const bearer = `Bearer ${token}`;
      // DO NOT delete standard Authorization headers. They are needed by
      // the AI Studio/Cloud Run secure proxy to validate the browser's developer session.
      if (typeof config.headers.set === "function") {
        config.headers.set("X-Authorization", bearer);
        config.headers.set("X-Library-Token", bearer);
      } else {
        (config.headers as any)["X-Authorization"] = bearer;
        (config.headers as any)["X-Library-Token"] = bearer;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gracefully handle 401 Unauthorzed status codes by cleaning up stale session states
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginEndpoint = error.config && error.config.url && error.config.url.includes("/auth/login/");
      if (!isLoginEndpoint) {
        localStorage.removeItem("libramanage_token");
        localStorage.removeItem("libramanage_auth");
        localStorage.removeItem("libramanage_role");
        localStorage.removeItem("libramanage_profile");
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Unified converters to map React camelCase keys to Django snake_case keys
export const mapBookToClient = (data: any): Book => ({
  id: String(data.id),
  title: data.title,
  author: data.author,
  genre: data.genre,
  isbn: data.isbn,
  publishedDate: data.published_date || "",
  copiesTotal: Number(data.copies_total || 0),
  copiesAvailable: Number(data.copies_available || 0),
  location: data.location || "",
  description: data.description || "",
  coverImage: data.cover_image || "",
  rating: Number(data.rating || 5.0),
});

export const mapBookToBackend = (book: Omit<Book, "id">) => ({
  title: book.title,
  author: book.author,
  genre: book.genre,
  isbn: book.isbn,
  published_date: book.publishedDate,
  copies_total: book.copiesTotal,
  copies_available: book.copiesAvailable,
  location: book.location,
  description: book.description,
  cover_image: book.coverImage,
  rating: book.rating,
});

export const mapBorrowingToClient = (data: any): Borrowing => {
  let mappedStatus: "ACTIVE" | "RETURNED" | "OVERDUE" | "PENDING_RETURN" = "ACTIVE";
  if (data.status === "RETURNED") {
    mappedStatus = "RETURNED";
  } else if (data.status === "OVERDUE") {
    mappedStatus = "OVERDUE";
  } else if (data.status === "PENDING_RETURN") {
    mappedStatus = "PENDING_RETURN";
  } else if (data.status === "BORROWED") {
    mappedStatus = "ACTIVE";
  }

  return {
    id: String(data.id),
    bookId: String(data.book),
    bookTitle: data.book_title || "",
    bookAuthor: data.book_author || "",
    borrowDate: data.borrow_date || "",
    dueDate: data.due_date || "",
    returnDate: data.return_date || null,
    status: mappedStatus,
    fineAmount: Number(data.current_fine !== undefined ? data.current_fine : (data.fine_amount || 0.00)),
    userId: data.user_id ? String(data.user_id) : undefined,
    username: data.username || undefined,
    finePaid: data.fine_paid !== undefined ? !!data.fine_paid : undefined,
  };
};

export const mapReservationToClient = (data: any): Reservation => ({
  id: String(data.id),
  bookId: String(data.book),
  bookTitle: data.book_title || "",
  bookAuthor: data.book_author || "",
  reserveDate: data.reserve_date || "",
  queuePosition: Number(data.queue_position || 1),
  status: data.status as "PENDING" | "READY" | "CANCELLED" | "COMPLETED",
  userId: data.user_id ? String(data.user_id) : undefined,
  username: data.username || undefined,
});

export const apiService = {
  // === Authentication Services ===
  async login(username: string,password: string): Promise<{ token: string; user: UserProfile }> {
    const response = await apiClient.post("/auth/login/", { username, password });
    const { token, user } = response.data;
    localStorage.setItem("libramanage_token", token);
    return { token, user };
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    department: string;
    role: UserRole;
  }): Promise<{ token: string; user: UserProfile }> {
    const response = await apiClient.post("/auth/register/", data);
    const { token, user } = response.data;
    localStorage.setItem("libramanage_token", token);
    return { token, user };
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get("/auth/me/");
    return response.data;
  },

  async updateMe(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put("/auth/me/update/", {
      name: data.name,
      phone: data.phone,
      department: data.department,
      avatarSeed: data.avatarSeed,
    });
    return response.data;
  },

  // === Books Inventory Services ===
  async getBooks(search?: string, genre?: string): Promise<Book[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (genre && genre !== "All Genres") params.genre = genre;

    const response = await apiClient.get("/books/catalog/", { params });
    return response.data.map(mapBookToClient);
  },

  async addBook(book: Omit<Book, "id">): Promise<Book> {
    const payload = mapBookToBackend(book);
    const response = await apiClient.post("/books/catalog/", payload);
    return mapBookToClient(response.data);
  },

  async getBookDetails(id: string): Promise<Book> {
    const response = await apiClient.get(`/books/catalog/${id}/`);
    return mapBookToClient(response.data);
  },

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    const payload: any = {};
    if (book.title !== undefined) payload.title = book.title;
    if (book.author !== undefined) payload.author = book.author;
    if (book.genre !== undefined) payload.genre = book.genre;
    if (book.isbn !== undefined) payload.isbn = book.isbn;
    if (book.publishedDate !== undefined) payload.published_date = book.publishedDate;
    if (book.copiesTotal !== undefined) payload.copies_total = book.copiesTotal;
    if (book.copiesAvailable !== undefined) payload.copies_available = book.copiesAvailable;
    if (book.location !== undefined) payload.location = book.location;
    if (book.description !== undefined) payload.description = book.description;
    if (book.coverImage !== undefined) payload.cover_image = book.coverImage;
    if (book.rating !== undefined) payload.rating = book.rating;

    const response = await apiClient.put(`/books/catalog/${id}/`, payload);
    return mapBookToClient(response.data);
  },

  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/books/catalog/${id}/`);
  },

  // === Borrowings Services ===
  async getBorrowings(): Promise<Borrowing[]> {
    const response = await apiClient.get("/borrowings/records/");
    return response.data.map(mapBorrowingToClient);
  },

  async borrowBook(bookId: string): Promise<Borrowing> {
    const response = await apiClient.post("/borrowings/records/", { book: bookId });
    return mapBorrowingToClient(response.data);
  },

  async returnBook(borrowingId: string): Promise<any> {
    const response = await apiClient.post(`/borrowings/records/${borrowingId}/return-book/`);
    return response.data;
  },

  async payFines(): Promise<any> {
    const response = await apiClient.post("/borrowings/records/pay-fines/");
    return response.data;
  },

  // === Reservations Services ===
  async getReservations(): Promise<Reservation[]> {
    const response = await apiClient.get("/borrowings/reservations/");
    return response.data.map(mapReservationToClient);
  },

  async reserveBook(bookId: string): Promise<Reservation> {
    const response = await apiClient.post("/borrowings/reservations/", { book: bookId });
    return mapReservationToClient(response.data);
  },

  async cancelReservation(reservationId: string): Promise<any> {
    const response = await apiClient.post(`/borrowings/reservations/${reservationId}/cancel/`);
    return response.data;
  },

  // === Management Dashboard Services ===
  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get("/borrowings/dashboard/stats/");
    return {
      totalBooksTitles: response.data.total_books_titles,
      totalCopiesInventory: response.data.total_copies_inventory,
      availableCopies: response.data.available_copies,
      borrowedCopies: response.data.borrowed_copies,
      circulationPercentage: response.data.circulation_percentage,
      activeLoans: response.data.active_loans,
      overdueLoans: response.data.overdue_loans,
      pendingHolds: response.data.pending_holds,
      readyHoldsCollection: response.data.ready_holds_collection,
      totalMembers: response.data.total_members,
      studentMembers: response.data.student_members,
      staff_members: response.data.staff_members,
      totalUnpaidFines: response.data.total_unpaid_fines,
      systemHealth: response.data.system_health,
      dbEngine: response.data.db_engine
    };
  },

  async getDashboardReports(): Promise<any> {
    const response = await apiClient.get("/borrowings/dashboard/reports/");
    return {
      mostBorrowedBooks: response.data.most_borrowed_books,
      monthlyBorrowingTrends: response.data.monthly_borrowing_trends,
      reportTimestamp: response.data.report_timestamp
    };
  },

  // === Profile Password Changes ===
  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    const response = await apiClient.put("/auth/me/change-password/", { oldPassword, newPassword });
    return response.data;
  },

  // === Admin User Management Services ===
  async getUsers(): Promise<any[]> {
    const response = await apiClient.get("/users/");
    return response.data;
  },

  async addUser(data: any): Promise<any> {
    const response = await apiClient.post("/users/", data);
    return response.data;
  },

  async updateUser(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<any> {
    const response = await apiClient.delete(`/users/${id}/`);
    return response.data;
  },

  // === Advanced Performance Metrics ===
  async getAdvancedReports(): Promise<any> {
    const response = await apiClient.get("/borrowings/reports/advanced/");
    return response.data;
  },

  // === Notifications Stream Feed ===
  async getNotifications(): Promise<any[]> {
    const response = await apiClient.get("/notifications/");
    return response.data;
  },

  // === Free Previews & Limit Status ===
  async getPreviewStatus(): Promise<{ previewedBookIds: string[]; currentCount: number; maxPreviews: number; remaining: number; exceeded: boolean }> {
    const response = await apiClient.get("/books/previews/status/");
    return response.data;
  },

  async previewBook(bookId: string): Promise<{ allowed: boolean; remaining: number; bookId: string; snippet?: string; message?: string; alreadyPurchased?: boolean }> {
    const response = await apiClient.post(`/books/catalog/${bookId}/preview/`);
    return response.data;
  },

  // === Digital Book Purchases ===
  async purchaseBook(bookId: string, amount: number, cardNumber?: string): Promise<{ success: boolean; message: string; purchase: any }> {
    const response = await apiClient.post(`/books/catalog/${bookId}/purchase/`, { amount, cardNumber });
    return response.data;
  },

  async getPurchasedBooks(): Promise<any[]> {
    const response = await apiClient.get("/profile/purchases/");
    return response.data;
  },

  async getAllPurchases(): Promise<any[]> {
    const response = await apiClient.get("/purchases/all/");
    return response.data;
  },

  async getPurchases(): Promise<any[]> {
    return this.getPurchasedBooks();
  },

  // === Catalog Book Request Suggestions ===
  async suggestBook(data: { book_name: string; author: string; category: string; message?: string }): Promise<any> {
    const response = await apiClient.post("/books/suggestions/", data);
    return response.data;
  },

  async getSuggestions(): Promise<any[]> {
    const response = await apiClient.get("/books/suggestions/");
    return response.data;
  },

  async getBookSuggestions(): Promise<any[]> {
    return this.getSuggestions();
  },

  async updateSuggestionStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.put(`/books/suggestions/${id}/`, { status });
    return response.data;
  },

  // === Forgot Password Recoveries ===
  async requestForgotPasswordOtp(emailOrPhone: string): Promise<{ success: boolean; message: string; otpCode: string; expiresInMinutes: number }> {
    const response = await apiClient.post("/auth/forgot-password/", { emailOrPhone });
    return response.data;
  },

  async resetPasswordWithOtp(emailOrPhone: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/auth/verify-otp/", { emailOrPhone, otp, newPassword });
    return response.data;
  }
};
