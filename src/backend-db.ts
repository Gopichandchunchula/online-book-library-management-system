import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "backend", "db.json");

export interface UserProfileInternal {
  id: string; // matches django ID
  username: string;
  email: string;
  passwordHash: string; // keep it simple plain for this robust mock database
  first_name: string;
  last_name: string;
  role: "STUDENT" | "LIBRARIAN" | "ADMIN";
  profile: {
    member_id: string;
    phone: string;
    department: string;
    join_date: string;
    avatar_seed: string;
  };
  previews?: string[];       // Book IDs previewed
  purchasedBooks?: string[]; // Book IDs purchased
}

export interface PurchaseInternal {
  id: string;
  user_id: string;
  username: string;
  book_id: string;
  book_title: string;
  purchase_date: string;
  amount: number;
  payment_status: "SUCCESS" | "FAILED";
  transaction_id: string;
}

export interface BookSuggestionInternal {
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

export interface OtpRecordInternal {
  id: string;
  emailOrPhone: string;
  otp: string;
  expiresAt: number; // raw milliseconds epoch timestamp
  attempts: number;
}

export interface BookInternal {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  published_date: string;
  copies_total: number;
  copies_available: number;
  location: string;
  description: string;
  cover_image: string;
  rating: number;
}

export interface BorrowingInternal {
  id: string;
  user_id: string;
  username: string;
  book_id: string;
  book_title: string;
  book_author: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: "BORROWED" | "RETURNED" | "OVERDUE" | "PENDING_RETURN";
  current_fine: number;
  fine_paid: boolean;
}

export interface ReservationInternal {
  id: string;
  user_id: string;
  username: string;
  book_id: string;
  book_title: string;
  book_author: string;
  reserve_date: string;
  queue_position: number;
  status: "PENDING" | "READY" | "CANCELLED" | "COMPLETED";
}

export interface BackendDB {
  users: UserProfileInternal[];
  books: BookInternal[];
  borrowings: BorrowingInternal[];
  reservations: ReservationInternal[];
  purchases?: PurchaseInternal[];
  suggestions?: BookSuggestionInternal[];
  otps?: OtpRecordInternal[];
}

const INITIAL_BOOKS: BookInternal[] = [
  {
    id: "201",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    genre: "Technology",
    isbn: "978-0262033848",
    published_date: "2009-07-31",
    copies_total: 5,
    copies_available: 3,
    location: "Rack A-3, Shelf 2",
    description: "A comprehensive covers-all-foundations textbook on computer algorithms, designed specifically for students and professionals. Includes extensive pseudocode and deep complexity theory.",
    cover_image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "202",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    isbn: "978-0441172719",
    published_date: "1965-06-01",
    copies_total: 8,
    copies_available: 7,
    location: "Rack D-1, Shelf 4",
    description: "Set in the far future amidst a sprawling feudal interstellar empire, Dune tells the story of Paul Atreides, whose family accepts the stewardship of the desert planet Arrakis.",
    cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  },
  {
    id: "203",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    genre: "Technology",
    isbn: "978-0132350884",
    published_date: "2008-08-11",
    copies_total: 10,
    copies_available: 8,
    location: "Rack A-3, Shelf 5",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Uncle Bob presents a revolutionary paradigm for structural cleanliness and software craftsmanship.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "204",
    title: "The Critique of Pure Reason",
    author: "Immanuel Kant",
    genre: "Philosophy",
    isbn: "978-0521657471",
    published_date: "1781-05-01",
    copies_total: 3,
    copies_available: 2,
    location: "Rack P-2, Shelf 1",
    description: "One of the most influential works in the history of philosophy, establishing transcendental idealism and exploring the limits of human knowledge and metaphysical claims.",
    cover_image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80",
    rating: 4.5
  },
  {
    id: "205",
    title: "Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    isbn: "978-0553380163",
    published_date: "1988-03-01",
    copies_total: 6,
    copies_available: 4,
    location: "Rack S-1, Shelf 3",
    description: "A landmark volume written by one of the premier minds of science, explaining black holes, the big bang, cosmological frameworks, and modern quantum gravity for mainstream audiences.",
    cover_image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "206",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Literature",
    isbn: "978-0060935467",
    published_date: "1960-07-11",
    copies_total: 10,
    copies_available: 8,
    location: "Rack L-4, Shelf 1",
    description: "A classic of modern American literature, exploring issues of racial injustice, moral courage, compassion, and childhood innocence in a small Southern town during the Great Depression.",
    cover_image: "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  },
  {
    id: "207",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    isbn: "978-0062316097",
    published_date: "2011-04-01",
    copies_total: 7,
    copies_available: 5,
    location: "Rack H-1, Shelf 2",
    description: "Sapiens integrates history and science to reconsider common narratives, tracing the evolution of Homo Sapiens from insignificant apes to rulers of the planet through powerful social myths.",
    cover_image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "208",
    title: "Deep Work: Rules for Focused Success",
    author: "Cal Newport",
    genre: "Technology",
    isbn: "978-1455586691",
    published_date: "2016-01-05",
    copies_total: 6,
    copies_available: 6,
    location: "Rack A-2, Shelf 1",
    description: "Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated details and achieve superior outputs.",
    cover_image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "301",
    title: "Python Programming Masterclass",
    author: "Tim Buchalka",
    genre: "Technology",
    isbn: "978-1098114565",
    published_date: "2021-03-15",
    copies_total: 8,
    copies_available: 6,
    location: "Rack P-1, Shelf 1",
    description: "An intensive masterclass on Python programming, taking you from complete beginner to building sophisticated data structures, multi-threaded algorithms, and automated scripts.",
    cover_image: "https://images.unsplash.com/photo-1649180556628-9ba704115795?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "302",
    title: "Advanced Python",
    author: "Luciano Ramalho",
    genre: "Technology",
    isbn: "978-1492056324",
    published_date: "2022-05-10",
    copies_total: 5,
    copies_available: 3,
    location: "Rack P-1, Shelf 2",
    description: "Write idiomatic Python code by leveraging its best features. Dive deep into metaprogramming, coroutines, generators, and descriptor protocols to craft clean, fast programs.",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  },
  {
    id: "303",
    title: "Python for Beginners",
    author: "Eric Matthes",
    genre: "Technology",
    isbn: "978-1593279288",
    published_date: "2019-05-03",
    copies_total: 12,
    copies_available: 10,
    location: "Rack P-1, Shelf 3",
    description: "A fast-paced, thorough introduction to Python that will have you writing programs, solving problems, and making things that work in no time.",
    cover_image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "304",
    title: "Automate the Boring Stuff with Python",
    author: "Al Sweigart",
    genre: "Technology",
    isbn: "978-1593279929",
    published_date: "2019-11-12",
    copies_total: 7,
    copies_available: 5,
    location: "Rack P-1, Shelf 4",
    description: "Learn Python to automate tedious tasks, from searching text files and scraping web pages to renaming spreadsheets and scheduling notifications.",
    cover_image: "https://images.unsplash.com/photo-1526374865744-48ffaa264cf4?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "305",
    title: "Django for Beginners",
    author: "William S. Vincent",
    genre: "Technology",
    isbn: "978-1735467726",
    published_date: "2020-04-18",
    copies_total: 6,
    copies_available: 4,
    location: "Rack D-2, Shelf 1",
    description: "A step-by-step guide to building fully-functional web applications with Django and Python, covering authentication, databases, deployment, and testing.",
    cover_image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "306",
    title: "Django REST Framework",
    author: "William S. Vincent",
    genre: "Technology",
    isbn: "978-1735467740",
    published_date: "2021-08-25",
    copies_total: 9,
    copies_available: 7,
    location: "Rack D-2, Shelf 2",
    description: "Learn to build professional RESTful APIs with Python, Django, and DRF, covering serializers, views, permissions, pagination, and token authentication.",
    cover_image: "https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "307",
    title: "Mastering Django",
    author: "Nigel George",
    genre: "Technology",
    isbn: "978-1783551521",
    published_date: "2016-12-15",
    copies_total: 4,
    copies_available: 2,
    location: "Rack D-2, Shelf 3",
    description: "An advanced, hands-on guide to mastering Django core features, including database optimization, custom middleware, security protocols, and memory caching.",
    cover_image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
    rating: 4.5
  },
  {
    id: "308",
    title: "Full Stack Django Development",
    author: "Marko Šarić",
    genre: "Technology",
    isbn: "978-1801815147",
    published_date: "2023-09-30",
    copies_total: 6,
    copies_available: 4,
    location: "Rack D-2, Shelf 4",
    description: "Architect complete, production-grade applications using Django with HTMX, Tailwind CSS, Celery, and PostgreSQL for maximum scalability.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "309",
    title: "React Mastery",
    author: "Robin Wieruch",
    genre: "Technology",
    isbn: "978-1098124564",
    published_date: "2022-02-05",
    copies_total: 10,
    copies_available: 8,
    location: "Rack R-1, Shelf 1",
    description: "A deep dive into advanced frontend architectures using React. Master state management frameworks, concurrent render mechanics, and isomorphic rendering.",
    cover_image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  },
  {
    id: "310",
    title: "React Hooks Deep Dive",
    author: "Dave Ceddia",
    genre: "Technology",
    isbn: "978-1789617320",
    published_date: "2021-06-25",
    copies_total: 6,
    copies_available: 5,
    location: "Rack R-1, Shelf 2",
    description: "A focused manual on custom Hooks, state sync processes, memoization optimization with useMemo/useCallback, and clean state reducer hooks.",
    cover_image: "https://images.unsplash.com/photo-1581291518655-9523c932dedf?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "311",
    title: "Modern React Projects",
    author: "Roy Derks",
    genre: "Technology",
    isbn: "978-1801072557",
    published_date: "2020-10-18",
    copies_total: 4,
    copies_available: 3,
    location: "Rack R-1, Shelf 3",
    description: "Build scalable real-world frontend applications including collaborative boards, dynamic dashboards, and e-commerce platforms using Tailwind and Next.js.",
    cover_image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "312",
    title: "React.js Complete Guide",
    author: "Maximilian Schwarzmüller",
    genre: "Technology",
    isbn: "978-1801817424",
    published_date: "2023-01-14",
    copies_total: 14,
    copies_available: 11,
    location: "Rack R-1, Shelf 4",
    description: "The comprehensive bible of React core. Covers JSX mechanics, event architectures, styling pathways, responsive layouts, and modern router capabilities.",
    cover_image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "313",
    title: "JavaScript Essentials",
    author: "Marijn Haverbeke",
    genre: "Technology",
    isbn: "978-1593279509",
    published_date: "2018-12-04",
    copies_total: 15,
    copies_available: 12,
    location: "Rack J-1, Shelf 1",
    description: "Master variables, control flows, asynchronous executions, and standard function architectures that form the backbone of clean JavaScript development.",
    cover_image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "314",
    title: "Advanced JavaScript",
    author: "Kyle Simpson",
    genre: "Technology",
    isbn: "978-1449335588",
    published_date: "2014-03-24",
    copies_total: 8,
    copies_available: 5,
    location: "Rack J-1, Shelf 2",
    description: "Understand the core compiler foundations, closure scope patterns, lexical context binders, this keywords bindings, and prototype system structures.",
    cover_image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=400&q=80",
    rating: 4.8
  },
  {
    id: "315",
    title: "ES6 Complete Guide",
    author: "Nicolas Bevacqua",
    genre: "Technology",
    isbn: "978-1617292859",
    published_date: "2017-07-29",
    copies_total: 5,
    copies_available: 4,
    location: "Rack J-1, Shelf 3",
    description: "A definitive focus on ES6 specifications, describing modules architectures, arrow declarations, destructuring, and asynchronous promise pipelines.",
    cover_image: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "316",
    title: "Node.js and JavaScript Backend",
    author: "Shelley Powers",
    genre: "Technology",
    isbn: "978-1491943144",
    published_date: "2016-10-31",
    copies_total: 7,
    copies_available: 5,
    location: "Rack J-1, Shelf 4",
    description: "Leverage standard Node systems, event emitter modules, custom buffers, file streams, and REST API express routing setups to handle backend requests.",
    cover_image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=400&q=80",
    rating: 4.5
  },
  {
    id: "317",
    title: "HTML5 Complete Guide",
    author: "Bruce Lawson",
    genre: "Technology",
    isbn: "978-0321722055",
    published_date: "2011-09-02",
    copies_total: 7,
    copies_available: 6,
    location: "Rack C-1, Shelf 1",
    description: "Deeply understand structural semantics, embeddability mechanics, responsive video/canvas elements, and offline application storage attributes of HTML5.",
    cover_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80",
    rating: 4.4
  },
  {
    id: "318",
    title: "CSS Flexbox and Grid",
    author: "Rachel Andrew",
    genre: "Technology",
    isbn: "978-1925427500",
    published_date: "2017-06-25",
    copies_total: 10,
    copies_available: 9,
    location: "Rack C-1, Shelf 2",
    description: "Master advanced web layout techniques, aligning structural boxes effortlessly and dynamically with robust CSS flexbox rows and fractional layouts.",
    cover_image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=400&q=80",
    rating: 4.7
  },
  {
    id: "319",
    title: "Responsive Web Design",
    author: "Ethan Marcotte",
    genre: "Technology",
    isbn: "978-1937557188",
    published_date: "2015-11-20",
    copies_total: 6,
    copies_available: 4,
    location: "Rack C-1, Shelf 3",
    description: "Perfect look and feel interfaces across devices using fluid grid matrices, media-query triggers, and adaptive image scales seamlessly.",
    cover_image: "https://images.unsplash.com/photo-1550063873-ab792950096b?auto=format&fit=crop&w=400&q=80",
    rating: 4.6
  },
  {
    id: "320",
    title: "Modern UI Design",
    author: "Steve Schoger",
    genre: "Technology",
    isbn: "978-0995254201",
    published_date: "2018-10-01",
    copies_total: 8,
    copies_available: 7,
    location: "Rack C-1, Shelf 4",
    description: "Practical strategies to design beautiful dashboards, utilizing negative white space, perfect typography pairs, and custom micro-shadow boundaries.",
    cover_image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=400&q=80",
    rating: 4.9
  },
  {
    id: "321",
    title: "MySQL Database Design",
    author: "Baron Schwartz",
    genre: "Technology",
    isbn: "978-1491918661",
    published_date: "2021-11-10",
    copies_total: 6,
    copies_available: 4,
    location: "Rack M-1, Shelf 1",
    description: "Design clean third-normal forms, tune query pipelines, select primary schema indexes, and optimize transaction isolation levels with high throughput.",
    cover_image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80",
    rating: 4.5
  }
];

const INITIAL_USERS: UserProfileInternal[] = [
  {
    id: "user_1",
    username: "gopichand",
    email: "gopichand@nhclindia.com",
    passwordHash: "password",
    first_name: "Gopichand",
    last_name: "NHCL",
    role: "STUDENT",
    profile: {
      member_id: "LM-2026-8902",
      phone: "+91 98765 43210",
      department: "Computer Science & Engineering",
      join_date: "Sept 12, 2024",
      avatar_seed: "Gc"
    }
  },
  {
    id: "user_2",
    username: "student",
    email: "gopichand@nhclindia.com",
    passwordHash: "password",
    first_name: "Gopichand",
    last_name: "Student",
    role: "STUDENT",
    profile: {
      member_id: "LM-2026-8903",
      phone: "+91 98765 43210",
      department: "Computer Science & Engineering",
      join_date: "Sept 12, 2024",
      avatar_seed: "Gc"
    }
  },
  {
    id: "user_3",
    username: "sarah",
    email: "s.jenkins@libramanage.com",
    passwordHash: "password",
    first_name: "Sarah",
    last_name: "Jenkins",
    role: "LIBRARIAN",
    profile: {
      member_id: "LM-STAFF-023",
      phone: "+1 (555) 732-8910",
      department: "Cataloging & Preservation",
      join_date: "Jan 05, 2021",
      avatar_seed: "Sj"
    }
  },
  {
    id: "user_4",
    username: "librarian",
    email: "s.jenkins@libramanage.com",
    passwordHash: "password",
    first_name: "Sarah",
    last_name: "Librarian",
    role: "LIBRARIAN",
    profile: {
      member_id: "LM-STAFF-024",
      phone: "+1 (555) 732-8910",
      department: "Cataloging & Preservation",
      join_date: "Jan 05, 2021",
      avatar_seed: "Sj"
    }
  },
  {
    id: "user_5",
    username: "admin",
    email: "a.vance@libramanage.com",
    passwordHash: "password",
    first_name: "Dr. Alistair",
    last_name: "Vance",
    role: "ADMIN",
    profile: {
      member_id: "LM-ADMIN-001",
      phone: "+1 (555) 100-2000",
      department: "Library Operations & IT Director",
      join_date: "July 15, 2018",
      avatar_seed: "Av"
    }
  }
];

export class DBManager {
  private static loadDB(): BackendDB {
    try {
      const parentDir = path.dirname(DB_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        const initial: BackendDB = {
          users: INITIAL_USERS,
          books: INITIAL_BOOKS,
          borrowings: [],
          reservations: [],
          purchases: [],
          suggestions: [],
          otps: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
        console.log("MongoDB JSON Database created and seeded at backend/db.json!");
        return initial;
      }

      const raw = fs.readFileSync(DB_FILE, "utf8");
      const db: BackendDB = JSON.parse(raw);
      if (!db.purchases) db.purchases = [];
      if (!db.suggestions) db.suggestions = [];
      if (!db.otps) db.otps = [];
      return db;
    } catch (e) {
      console.error("Database reading error, resetting with initial values:", e);
      return {
        users: INITIAL_USERS,
        books: INITIAL_BOOKS,
        borrowings: [],
        reservations: [],
        purchases: [],
        suggestions: [],
        otps: []
      };
    }
  }

  private static saveDB(data: BackendDB) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Database writing error:", e);
    }
  }

  // MongoDB Emulator Interface
  static findUsers(): UserProfileInternal[] {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.users.find({})`);
    return db.users;
  }

  static deleteOneUser(id: string): boolean {
    const db = this.loadDB();
    console.log(`[MongoDB] delete: db.users.deleteOne({ id: "${id}" })`);
    const initialLen = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    this.saveDB(db);
    return db.users.length < initialLen;
  }

  static findOneUser(query: { username?: string; id?: string }): UserProfileInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.users.findOne(${JSON.stringify(query)})`);
    
    if (query.username) {
      const uname = query.username.toLowerCase();
      const match = db.users.find(u => u.username === uname) || null;
      return match;
    }
    if (query.id) {
      return db.users.find(u => u.id === query.id) || null;
    }
    return null;
  }

  static insertOneUser(user: UserProfileInternal): UserProfileInternal {
    const db = this.loadDB();
    console.log(`[MongoDB] write: db.users.insertOne(${JSON.stringify({ username: user.username })})`);
    db.users.push(user);
    this.saveDB(db);
    return user;
  }

  static updateOneUser(id: string, updates: Partial<UserProfileInternal>): UserProfileInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] update: db.users.updateOne({ id: "${id}" }, { $set: ${JSON.stringify(updates)} })`);
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    
    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      profile: {
        ...db.users[idx].profile,
        ...(updates.profile || {})
      }
    };
    this.saveDB(db);
    return db.users[idx];
  }

  static findBooks(query: { genre?: string; search?: string } = {}): BookInternal[] {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.books.find(${JSON.stringify(query)})`);
    let results = db.books;

    if (query.genre) {
      const g = query.genre.toLowerCase();
      results = results.filter(b => b.genre.toLowerCase() === g);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      results = results.filter(b => 
        b.title.toLowerCase().includes(s) || 
        b.author.toLowerCase().includes(s) || 
        b.isbn.toLowerCase().includes(s)
      );
    }
    return results;
  }

  static findOneBook(id: string): BookInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.books.findOne({ id: "${id}" })`);
    return db.books.find(b => b.id === id) || null;
  }

  static insertOneBook(book: BookInternal): BookInternal {
    const db = this.loadDB();
    console.log(`[MongoDB] write: db.books.insertOne(${JSON.stringify({ title: book.title })})`);
    db.books.push(book);
    this.saveDB(db);
    return book;
  }

  static updateOneBook(id: string, updates: Partial<BookInternal>): BookInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] update: db.books.updateOne({ id: "${id}" }, { $set: ${JSON.stringify(updates)} })`);
    const idx = db.books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    db.books[idx] = { ...db.books[idx], ...updates };
    this.saveDB(db);
    return db.books[idx];
  }

  static deleteOneBook(id: string): boolean {
    const db = this.loadDB();
    console.log(`[MongoDB] delete: db.books.deleteOne({ id: "${id}" })`);
    const initialLen = db.books.length;
    db.books = db.books.filter(b => b.id !== id);
    this.saveDB(db);
    return db.books.length < initialLen;
  }

  static findBorrowings(query: { user_id?: string } = {}): BorrowingInternal[] {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.borrowings.find(${JSON.stringify(query)})`);
    
    // Auto-recalculate overdue fines for active checkouts dynamically
    const today = new Date();
    let changed = false;
    db.borrowings.forEach(b => {
      if (b.status === "BORROWED" && !b.fine_paid) {
        const dueDate = new Date(b.due_date);
        if (today > dueDate) {
          b.status = "OVERDUE";
          const diffTime = Math.abs(today.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          b.current_fine = diffDays * 0.50; // $0.50 per day
          changed = true;
        }
      }
    });
    if (changed) {
      this.saveDB(db);
    }

    if (query.user_id) {
      return db.borrowings.filter(b => b.user_id === query.user_id);
    }
    return db.borrowings;
  }

  static findOneBorrowing(id: string): BorrowingInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.borrowings.findOne({ id: "${id}" })`);
    return db.borrowings.find(b => b.id === id) || null;
  }

  static insertOneBorrowing(borrowing: BorrowingInternal): BorrowingInternal {
    const db = this.loadDB();
    console.log(`[MongoDB] write: db.borrowings.insertOne(${JSON.stringify({ id: borrowing.id, book: borrowing.book_title })})`);
    db.borrowings.push(borrowing);
    this.saveDB(db);
    return borrowing;
  }

  static updateOneBorrowing(id: string, updates: Partial<BorrowingInternal>): BorrowingInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] update: db.borrowings.updateOne({ id: "${id}" }, { $set: ${JSON.stringify(updates)} })`);
    const idx = db.borrowings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    db.borrowings[idx] = { ...db.borrowings[idx], ...updates };
    this.saveDB(db);
    return db.borrowings[idx];
  }

  static payAllFinesForUser(user_id: string): number {
    const db = this.loadDB();
    console.log(`[MongoDB] updateMany: db.borrowings.updateMany({ user_id: "${user_id}", fine_paid: false }, { $set: { fine_paid: true, current_fine: 0 } })`);
    let count = 0;
    db.borrowings.forEach(b => {
      if (b.user_id === user_id && !b.fine_paid) {
        b.fine_paid = true;
        b.current_fine = 0.00;
        count++;
      }
    });
    if (count > 0) {
      this.saveDB(db);
    }
    return count;
  }

  static findReservations(query: { user_id?: string } = {}): ReservationInternal[] {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.reservations.find(${JSON.stringify(query)})`);
    if (query.user_id) {
      return db.reservations.filter(r => r.user_id === query.user_id);
    }
    return db.reservations;
  }

  static findOneReservation(id: string): ReservationInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] query: db.reservations.findOne({ id: "${id}" })`);
    return db.reservations.find(r => r.id === id) || null;
  }

  static insertOneReservation(reservation: ReservationInternal): ReservationInternal {
    const db = this.loadDB();
    console.log(`[MongoDB] write: db.reservations.insertOne(${JSON.stringify({ id: reservation.id, book: reservation.book_title })})`);
    db.reservations.push(reservation);
    this.saveDB(db);
    return reservation;
  }

  static updateOneReservation(id: string, updates: Partial<ReservationInternal>): ReservationInternal | null {
    const db = this.loadDB();
    console.log(`[MongoDB] update: db.reservations.updateOne({ id: "${id}" }, { $set: ${JSON.stringify(updates)} })`);
    const idx = db.reservations.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.reservations[idx] = { ...db.reservations[idx], ...updates };
    this.saveDB(db);
    return db.reservations[idx];
  }

  static countUsers(): { total: number; students: number; librarians: number; admins: number } {
    const db = this.loadDB();
    const students = db.users.filter(u => u.role === "STUDENT").length;
    const librarians = db.users.filter(u => u.role === "LIBRARIAN").length;
    const admins = db.users.filter(u => u.role === "ADMIN").length;
    return {
      total: db.users.length,
      students,
      librarians,
      admins
    };
  }

  // === Book Previews Tracker ===
  static findUserPreviews(userId: string): string[] {
    const user = this.findOneUser({ id: userId });
    return user?.previews || [];
  }

  static recordUserPreview(userId: string, bookId: string): string[] {
    const db = this.loadDB();
    const userIdx = db.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      const previews = db.users[userIdx].previews || [];
      if (!previews.includes(bookId)) {
        previews.push(bookId);
      }
      db.users[userIdx].previews = previews;
      this.saveDB(db);
      return previews;
    }
    return [];
  }

  // === Book Purchases ===
  static findPurchases(userId?: string): PurchaseInternal[] {
    const db = this.loadDB();
    const list = db.purchases || [];
    if (userId) {
      return list.filter(p => p.user_id === userId);
    }
    return list;
  }

  static insertOnePurchase(purchase: PurchaseInternal): PurchaseInternal {
    const db = this.loadDB();
    if (!db.purchases) db.purchases = [];
    db.purchases.push(purchase);
    
    // Also update purchasedBooks on user object directly for convenience
    const userIdx = db.users.findIndex(u => u.id === purchase.user_id);
    if (userIdx !== -1) {
      const purchased = db.users[userIdx].purchasedBooks || [];
      if (!purchased.includes(purchase.book_id)) {
        purchased.push(purchase.book_id);
      }
      db.users[userIdx].purchasedBooks = purchased;
    }

    this.saveDB(db);
    return purchase;
  }

  // === Book Suggestions ===
  static findSuggestions(): BookSuggestionInternal[] {
    const db = this.loadDB();
    return db.suggestions || [];
  }

  static insertOneSuggestion(suggestion: BookSuggestionInternal): BookSuggestionInternal {
    const db = this.loadDB();
    if (!db.suggestions) db.suggestions = [];
    db.suggestions.push(suggestion);
    this.saveDB(db);
    return suggestion;
  }

  static updateOneSuggestion(id: string, updates: Partial<BookSuggestionInternal>): BookSuggestionInternal | null {
    const db = this.loadDB();
    if (!db.suggestions) db.suggestions = [];
    const idx = db.suggestions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    db.suggestions[idx] = { ...db.suggestions[idx], ...updates };
    this.saveDB(db);
    return db.suggestions[idx];
  }

  // === OTP Records ===
  static findOtp(emailOrPhone: string): OtpRecordInternal | null {
    const db = this.loadDB();
    const list = db.otps || [];
    return list.find(o => o.emailOrPhone.toLowerCase() === emailOrPhone.toLowerCase()) || null;
  }

  static saveOtp(record: OtpRecordInternal): void {
    const db = this.loadDB();
    if (!db.otps) db.otps = [];
    const idx = db.otps.findIndex(o => o.emailOrPhone.toLowerCase() === record.emailOrPhone.toLowerCase());
    if (idx !== -1) {
      db.otps[idx] = record;
    } else {
      db.otps.push(record);
    }
    this.saveDB(db);
  }

  static deleteOtp(emailOrPhone: string): void {
    const db = this.loadDB();
    if (db.otps) {
      db.otps = db.otps.filter(o => o.emailOrPhone.toLowerCase() !== emailOrPhone.toLowerCase());
      this.saveDB(db);
    }
  }
}
