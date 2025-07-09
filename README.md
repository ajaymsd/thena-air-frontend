
# ✈️ Flight Booking System – Frontend

This is the **frontend** of the Flight Booking System built with **React** and **Tailwind CSS**. It interacts with a backend (Node.js + Express) and Supabase for authentication and database.

---

## 📁 Folder Structure

```
flight-booking-frontend/
├── public/                 # Static files and index.html
├── src/
│   ├── assets/            # Images and icons
│   ├── components/        # Reusable UI components (Buttons, Navbar, FlightCard)
│   ├── pages/             # Page-level components (Home, Search, Booking, Admin)
│   ├── services/          # API functions (bookings, payments, flights)
│   ├── context/           # React Context for global state (AuthProvider)
│   ├── styles/            # Global styles and Tailwind setup
│   ├── App.jsx            # Main app structure and routes
│   └── main.jsx           # React entry point
├── .env                   # Environment variables (never commit)
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # Tailwind + PostCSS setup
```

---

## 🚀 Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/flight-booking-frontend.git
cd flight-booking-frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create a `.env` File**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

4. **Start the Dev Server**
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🌟 Features

- Flight search by departure/arrival cities and dates
- One-way and round-trip booking options
- Razorpay payment gateway integration
- Passenger form for multiple users
- Email confirmation and downloadable e-ticket
- Admin dashboard to manage flights/bookings
- Fully responsive UI built with Tailwind
- Secure authentication via Supabase

---

## 🌐 Routing & Authentication Flow

| Route | Description |
|-------|-------------|
| `/` | Home / Search flights |
| `/search` | Flight results |
| `/book` | Passenger & payment form |
| `/thank-you` | After successful payment |
| `/dashboard` | View user bookings |
| `/admin` | Admin login |
| `/admin/flights` | Admin flight CRUD |
| `/admin/bookings` | Admin booking list |

- Auth is managed by Supabase.
- Token/session is stored via Supabase client and context API.

---

## ⚙️ Environment Variables

| Key | Description |
|-----|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_API_BASE_URL` | Your deployed backend API base URL |

---

## 🧑‍💻 Deployment (Vercel)

### Frontend Deployment:

1. Push your frontend code to GitHub.
2. Go to [vercel.com](https://vercel.com), login and import the repo.
3. Set the environment variables as mentioned above.
4. Click "Deploy". Vercel will build and host it.

---

## 🖼️ Screenshots (Optional)

Add screenshots of search, booking, ticket, and admin panel views here.

---

## 🙌 Contributing

Contributions are welcome! Open an issue or submit a pull request.

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m "Add your feature"

# Push to origin
git push origin feature/your-feature
```

---

## 📄 License

This project is for educational/assignment purposes only.
