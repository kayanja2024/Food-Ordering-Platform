# 🍽️ Online Food Ordering Platform

A comprehensive web application for ordering food online with mobile money integration (Airtel Money and MTN Mobile Money). Built with React, Node.js, and MySQL.

## ✨ Features

### 🍕 Customer Features
- **User Registration & Authentication**
  - Email/password and OTP-based login
  - Phone number verification
  - Password recovery via email

- **Menu Browsing**
  - Browse food items by categories
  - Search and filter functionality
  - Detailed food item information
  - Nutritional information and allergens

- **Shopping Cart**
  - Add/remove items
  - Quantity management
  - Special instructions
  - Persistent cart across sessions

- **Order Management**
  - Place orders with delivery details
  - Real-time order tracking
  - Order history and reordering
  - Order status notifications

- **Payment Integration**
  - Airtel Money payment
  - MTN Mobile Money payment
  - Cash on delivery
  - Real-time payment verification

- **User Profile**
  - Manage personal information
  - Save multiple delivery addresses
  - View order history
  - Notification preferences

### 👨‍💼 Admin Features
- **Menu Management**
  - Add, edit, and delete food items
  - Category management
  - Image uploads
  - Availability control

- **Order Management**
  - View and manage all orders
  - Update order status
  - Track delivery progress
  - Order analytics

- **User Management**
  - View customer information
  - Manage user accounts
  - User activity monitoring

- **Dashboard**
  - Sales analytics
  - Order statistics
  - Revenue reports
  - Performance metrics

### 🔔 Notifications
- Email notifications for order updates
- SMS notifications via Twilio
- Real-time order status updates
- Payment confirmations

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Twilio** - SMS service

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Zustand** - State management

### Payment Integration
- **Airtel Money API** - Mobile money payments
- **MTN Mobile Money API** - Mobile money payments

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-food-ordering-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment example
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE food_ordering_db;
   exit;
   
   # Run database setup
   npm run setup-db
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=food_ordering_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Payment Gateway APIs
AIRTEL_MONEY_API_KEY=your_airtel_money_api_key
AIRTEL_MONEY_API_URL=https://api.airtel.com/money
MTN_MOBILE_MONEY_API_KEY=your_mtn_mobile_money_api_key
MTN_MOBILE_MONEY_API_URL=https://api.mtn.com/mobile-money
```

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `categories` - Food categories
- `food_items` - Menu items
- `orders` - Customer orders
- `order_items` - Items within orders
- `carts` - Shopping cart items
- `addresses` - Delivery addresses

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/login-otp` - OTP login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-phone` - Verify phone number

### Menu
- `GET /api/menu/categories` - Get categories
- `GET /api/menu/items` - Get food items
- `GET /api/menu/featured` - Get featured items
- `GET /api/menu/search` - Search items

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item

### Orders
- `POST /api/orders/place` - Place order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/track` - Track order

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/methods` - Get payment methods

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - All users

## 🧪 Sample Data

After running the database setup, you'll have:

### Default Users
- **Admin**: admin@foodplatform.com / admin123
- **Customer**: customer@example.com / customer123

### Sample Categories
- Breakfast, Lunch, Dinner, Snacks, Beverages, Desserts

### Sample Food Items
- 12 pre-populated food items across all categories

## 🔧 Development

### Available Scripts
```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Setup database
npm run setup-db
```

### Project Structure
```
├── server/                 # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── scripts/           # Database scripts
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # State management
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

## 🚀 Deployment

### Backend Deployment
1. Set up a production MySQL database
2. Configure environment variables for production
3. Install dependencies: `npm install --production`
4. Build the application: `npm run build`
5. Start the server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production API URL

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers
- SQL injection prevention with Sequelize

## 📱 Mobile Responsive

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

Stay updated with the latest features and bug fixes by:
- Watching the repository
- Checking the releases page
- Following the changelog

---

**Built with ❤️ for the food ordering industry** 