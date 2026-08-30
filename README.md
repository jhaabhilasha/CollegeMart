# CollegeConnect 🎓

A marketplace platform exclusively for college students to buy, sell, and connect on campus.

![React](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## Features ✨

- **User Authentication** - Signup/Login with email or mobile number
- **Password Reset** - OTP-based password recovery via email
- **Listings** - Create, edit, and delete product listings
- **Categories** - Browse by Textbooks, Electronics, Clothing, Notes, PYQs, and more
- **Search & Filter** - Search by title/description, filter by category and price
- **Real-time Messaging** - Chat with sellers using Socket.io
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack 🛠️

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router (navigation)
- React Hook Form + Zod (form validation)
- Socket.io Client (real-time messaging)

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.io (real-time messaging)
- SendGrid (email service)
- Helmet (security headers)
- Express Rate Limit (brute-force protection)
- Express Validator (input validation)

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- SendGrid API key (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
    git clone https://github.com/jhaabhilasha/college-connect.git
   cd CollegeConnect
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**

   Copy the example files and fill in your values:
   ```bash
   # In root folder
   cp .env.example .env
   
   # In server folder
   cd server
   cp .env.example .env
   ```

   Edit `server/.env` with your configuration:
   ```env
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_USER=your-sender-email
   ```

5. **Start the development servers**

   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to http://localhost:5173

## Project Structure 📁

```
CollegeConnect/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── pages/              # Page components
├── server/                 # Backend source code
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json
```

## API Endpoints 📡

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/request-reset` - Request password reset OTP
- `POST /api/auth/verify-reset` - Verify OTP and reset password

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required, owner only)
- `DELETE /api/listings/:id` - Delete listing (auth required, owner only)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (auth required)

### Messages
- `GET /api/messages/:listingId` - Get messages for listing
- `POST /api/messages/:listingId` - Send message (auth required)

## Environment Variables 🔐

### Server (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes |
| `EMAIL_USER` | Sender email address | Yes |
| `PORT` | Server port (default: 5000) | No |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No |

## Scripts 📜

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the ISC License.

## Authors 👥

- **Abhilasha Jha** - [jhaabhilasha](https://github.com/jhaabhilasha)

---

Made with ❤️ for college students
