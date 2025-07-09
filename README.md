
# ✈️ ThenaAir Flight Booking System – Frontend

This is the **frontend** of the Flight Booking System built with **React** and **Tailwind CSS**. It interacts with a backend (Node.js + Express) and Supabase for authentication and database.

---

## 📁 Folder Structure

```
thena-air-frontend/
├── public/                 # Static files and index.html
├── src/
│   ├── assets/            # Images and icons
│   ├── components/        # Reusable UI components (Buttons, Navbar, FlightCard)
│   ├── services/          # API functions (bookings, payments, flights)
│   ├── context/           # React Context for global state (AuthProvider)
│   ├── utils/             # Contains all Utilities
│   ├── hooks/             # Custom Hooks
│   ├── store/             # Redux stores
│   ├── router/            # Contains App Router
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
git clone https://github.com/ajaymsd/thena-air-frontend
cd thena-air-frontend
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
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
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

| Path                | Component        | Access Type     | Description                                     |
|---------------------|------------------|------------------|-------------------------------------------------|
| `/`                 | HomePage         | Public           | Landing & search page                           |
| `/login`            | Login            | Public           | User login form                                 |
| `/signup`           | SignUp           | Public           | User registration form                          |
| `/home`             | HomePage         | Protected        | User dashboard                                  |
| `/profile`          | ProfilePage      | Protected        | Profile info page                               |
| `/booking`          | BookingPage      | Protected        | Booking form (passenger details)                |
| `/checkout`         | CheckoutPage     | Protected        | Razorpay payment form                           |
| `/admin/login`      | AdminLogin       | Public           | Admin login                                     |
| `/admin/signup`     | AdminSignUp      | Public           | Admin registration                              |
| `/admin/dashboard`  | AdminDashboard   | Admin Protected  | Admin home with analytics                       |
| `/admin/add-flight` | AddFlight        | Admin Protected  | Add new flight                                  |
| `/admin/bookings`   | BookingsList     | Admin Protected  | View/manage bookings                            |
| `/admin/flights`    | FlightsList      | Admin Protected  | Manage flight records                           |
| `/admin/payments`   | PaymentsList     | Admin Protected  | Payment overview                                |
| `*`                 | NotFoundPage     | Public           | Fallback for invalid URLs                       |


- Auth is managed by Supabase.
- Token/session is stored via Supabase client and context API.

---

## ⚙️ Environment Variables

| Key | Description |
|-----|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_API_BASE_URL` | Your backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay Key ID |

---

## 🧑‍💻 Deployment (Vercel)

### Frontend Deployment:

1. Push your frontend code to GitHub.
2. Go to [vercel.com](https://vercel.com), login and import the repo.
3. Set the environment variables as mentioned above.
4. Click "Deploy". Vercel will build and host it.

---

## 🖼️ Sample Screenshots
---
![screencapture-thena-air-frontend-vercel-app-2025-07-09-16_03_02](https://github.com/user-attachments/assets/2ac4e91e-b0d7-4e24-8984-eda405e23777)
![screencapture-thena-air-frontend-vercel-app-booking-2025-07-09-16_42_15](https://github.com/user-attachments/assets/1605b005-c717-4945-9444-87a1d6696230)

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
