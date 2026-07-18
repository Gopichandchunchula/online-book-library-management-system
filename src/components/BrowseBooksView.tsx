import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  HelpCircle, 
  Check, 
  Trash2, 
  Layers, 
  Bookmark, 
  X,
  Star
} from "lucide-react";
import { Book, UserRole } from "../types";
import { getBookPrice } from "../utils/pricing";

interface BrowseBooksProps {
  role: UserRole;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddBook: (newBook: Omit<Book, "id">) => void;
  onDeleteBook?: (bookId: string) => void;
}

export const BrowseBooksView: React.FC<BrowseBooksProps> = ({
  role,
  books,
  onSelectBook,
  onAddBook,
  onDeleteBook
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Advanced search/filters states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState<"DEFAULT" | "TITLE_ASC" | "RATING_DESC" | "STOCK_DESC">("DEFAULT");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Form states for new book adding
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("Technology");
  const [newIsbn, setNewIsbn] = useState("");
  const [newCopies, setNewCopies] = useState(5);
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const genres = ["All", "Technology", "Sci-Fi", "Philosophy", "Science", "Literature", "History"];

  // Filter books matching search query, genre choice, and advanced criteria
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    const matchesAvailability = !showOnlyAvailable || book.copiesAvailable > 0;
    const matchesRating = book.rating >= minRating;
    
    return matchesSearch && matchesGenre && matchesAvailability && matchesRating;
  });

  // Apply sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "TITLE_ASC") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "RATING_DESC") {
      return b.rating - a.rating;
    }
    if (sortBy === "STOCK_DESC") {
      return b.copiesAvailable - a.copiesAvailable;
    }
    return 0; // Default order
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newIsbn) return;

    // Pick dynamic color bg for new book cover
    const coverColors = ["bg-indigo-600", "bg-amber-600", "bg-emerald-600", "bg-violet-600", "bg-rose-700", "bg-teal-600", "bg-sky-600", "bg-stone-700"];
    const randomColor = coverColors[Math.floor(Math.random() * coverColors.length)];

    onAddBook({
      title: newTitle,
      author: newAuthor,
      genre: newGenre,
      isbn: newIsbn,
      publishedDate: new Date().toISOString().split("T")[0],
      copiesTotal: newCopies,
      copiesAvailable: newCopies,
      location: newLocation || "General Racks",
      description: newDescription || "No custom synopsis provided.",
      coverImage: randomColor,
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1))
    });

    // Reset Form
    setNewTitle("");
    setNewAuthor("");
    setNewGenre("Technology");
    setNewIsbn("");
    setNewCopies(5);
    setNewLocation("");
    setNewDescription("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6" id="libramanage-catalog-section">
      
      {/* Search and Trigger Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search catalog titles, authors, or ISBN codes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 rounded-lg outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`font-semibold text-xs px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                showAdvanced 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" 
                  : "bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="w-4 h-4" /> 
              {showAdvanced ? "Hide Filters" : "Advanced Filters"}
            </button>

            {/* Add actions visible only for authorized administrators/librarians */}
            {(role === "ADMIN" || role === "LIBRARIAN") && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add New Book Entry
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Expandable Advanced Filter Panel */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-none">
            {/* Sort Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg p-2 outline-none focus:border-indigo-500"
              >
                <option value="DEFAULT">Default Order</option>
                <option value="TITLE_ASC">Book Title (A - Z)</option>
                <option value="RATING_DESC">Highest Rated (★ 5.0 - 1.0)</option>
                <option value="STOCK_DESC">Availability (Most Copies First)</option>
              </select>
            </div>

            {/* Minimum Rating Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Minimum Rating</label>
              <div className="flex items-center gap-1.5 pt-1">
                {([0, 4.0, 4.5] as const).map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                      minRating === rating
                        ? "bg-indigo-600 text-white border-indigo-700"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-450 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
                    }`}
                  >
                    {rating === 0 ? "Any Rating" : `${rating}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkbox Toggle */}
            <div className="space-y-1 flex flex-col justify-end pb-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Catalog Status</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Show On-Shelf Only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Genre selection horizontal chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
              selectedGenre === genre
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {genre}
          </button>
        ))}
        <span className="text-[10px] text-slate-400 font-bold ml-auto pl-2 shrink-0">
          Showing {sortedBooks.length} titles
        </span>
      </div>

      {/* Grid of Custom Books */}
      {sortedBooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-800 text-sm">No Matching Books Found</h4>
          <p className="text-xs max-w-md mx-auto">
            Try adjusting your query term or choosing "All" genres categories from the filter chips.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedBooks.map(book => (
            <div 
              key={book.id} 
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between transform hover:-translate-y-1 duration-300"
            >
              {/* Cover area using realistic background image or gradient placeholder */}
              <div className="aspect-3/4 rounded-xl relative p-4 flex flex-col justify-between text-white overflow-hidden shadow-xs mb-4 group/cover">
                {book.coverImage && book.coverImage.startsWith("http") ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-full object-cover brightness-[0.55] group-hover:scale-110 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/40" />
                  </div>
                ) : (
                  <div className={`absolute inset-0 ${book.coverImage || "bg-indigo-600"} z-0`} />
                )}
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                
                {/* Book Header info */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-[9px] font-bold tracking-widest bg-black/40 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded uppercase">
                    {book.genre}
                  </span>
                  <div className="flex items-center gap-0.5 bg-black/45 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                    <span>{book.rating}</span>
                  </div>
                </div>

                {/* Cover Middle Graphics */}
                <div className="relative z-10 border-l-2 border-indigo-400 pl-2.5 my-auto">
                  <h4 className="font-extrabold text-sm tracking-tight leading-tight line-clamp-3 drop-shadow-md">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-white/90 mt-1 truncate font-medium drop-shadow-sm">By {book.author}</p>
                </div>

                {/* Cover Footer / Spine style */}
                <div className="relative z-10 flex justify-between items-center text-[9px] font-mono text-white/60 border-t border-white/10 pt-2 shrink-0">
                  <span>ISBN: {book.id}</span>
                  <span className="font-bold tracking-wider text-indigo-300">DETAILS &rarr;</span>
                </div>
              </div>

              {/* Book Details section */}
              <div className="space-y-3">
                <div className="min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-650 transition-colors">
                      {book.title}
                    </h4>
                    <span className="text-xs font-extrabold text-indigo-600 shrink-0 font-mono">
                      ₹{getBookPrice(book.title)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{book.author}</p>
                </div>

                {/* Stock indicators */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Rack: {book.location.split(",")[0]}
                  </span>
                  {book.copiesAvailable > 0 ? (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full font-bold">
                      {book.copiesAvailable} Available
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full font-bold">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Delete button for Admin with onClick stopPropagation */}
                {role === "ADMIN" && onDeleteBook && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm(`Are you sure you want to delete ${book.title}?`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="w-full mt-2 text-center text-[10px] text-rose-600 py-1 border border-rose-100 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 bg-white"
                  >
                    <Trash2 className="w-3 h-3" /> Remove from Inventory
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INTERACTIVE ADD TITLE DIRECT PANEL DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm tracking-tight">Add New Library Book</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Register copies and physical racks locations coordinates</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Book Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Introduction to Quantum Physics" 
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Author Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Richard Feynman" 
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Genre Category</label>
                  <select 
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 bg-white text-slate-800"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Science">Science</option>
                    <option value="Literature">Literature</option>
                    <option value="History">History</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">ISBN Index *</label>
                  <input 
                    type="text" 
                    required
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="978-XXXXXXXXXX" 
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Copies *</label>
                  <input 
                    type="number" 
                    min={1}
                    max={50}
                    required
                    value={newCopies}
                    onChange={(e) => setNewCopies(parseInt(e.target.value) || 5)}
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Physical Rack Coordinate</label>
                  <input 
                    type="text" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Rack T-4, Shelf 3" 
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Synopsis Narrative</label>
                  <textarea 
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Write a brief description of the title for search results..." 
                    className="w-full border border-slate-200 hover:border-slate-300 p-2.5 text-xs rounded-lg outline-none focus:border-indigo-500 font-medium text-slate-800 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-150 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-slate-900 border border-indigo-700 rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  Register Books Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
