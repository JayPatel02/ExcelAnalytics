# Excel Analytics Backend

A Node.js/Express backend API for the Excel Analytics application with user authentication, Excel file management, and admin functionality.

## Features

### User Features
- **Authentication**: JWT-based user registration and login
- **Excel File Management**: Upload, retrieve, and delete Excel files
- **Data Access**: Secure access to Excel data for chart creation
- **User Dashboard**: Statistics and file information

### Admin Features
- **User Management**: View all users, delete user accounts
- **System Statistics**: Comprehensive dashboard with user and file statistics
- **Data Access**: Access all user Excel files and data
- **Admin-only Routes**: Protected admin functionality

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/excel-analytics
```

3. Start MongoDB (make sure MongoDB is installed and running)

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /users/register` - Register a new user
- `POST /users/login` - User login
- `POST /users/logout` - User logout

### Excel Management (User)
- `POST /excel/upload` - Upload Excel file
- `GET /excel/file` - Get user's Excel file
- `GET /excel/data-for-charts` - Get Excel data for chart creation
- `DELETE /excel/file/:fileId` - Delete Excel file
- `GET /excel/dashboard-stats` - Get user dashboard statistics

### Admin Management
- `GET /admin/users` - Get all users
- `GET /admin/users/:userId` - Get specific user details
- `DELETE /admin/users/:userId` - Delete user
- `GET /admin/dashboard-stats` - Get admin dashboard statistics
- `GET /admin/excel-files` - Get all Excel files

### Health Check
- `GET /health` - Server health check

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Excel Model
```javascript
{
  fileName: String,
  excelData: Mixed,
  user: ObjectId (ref: 'user'),
  uploadTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Creates a new user and returns a JWT token
2. **Login**: Validates credentials and returns a JWT token
3. **Protected Routes**: Require valid JWT token in Authorization header or cookies

### Token Format
```
Authorization: Bearer <token>
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors (if applicable)
}
```

## CORS Configuration

The backend is configured to accept requests from the frontend with:
- Origin: `http://localhost:5173` (configurable via FRONTEND_URL env var)
- Credentials: true (for cookies)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator for all inputs
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Built-in Express rate limiting
- **Error Handling**: Comprehensive error management

## Development

### Project Structure
```
Backend/
├── controllers/         # Route controllers
│   ├── user.controllers.js
│   ├── excel.controllers.js
│   └── admin.controllers.js
├── models/             # Database models
│   ├── user.model.js
│   └── excel.model.js
├── routes/             # API routes
│   ├── user.routes.js
│   ├── excel.routes.js
│   └── admin.routes.js
├── middlewares/        # Custom middlewares
│   └── auth.middleware.js
├── db/                 # Database connection
│   └── db.js
├── app.js             # Express app configuration
├── server.js          # Server entry point
└── package.json       # Dependencies and scripts
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure MongoDB connection for production
4. Set up proper CORS origins
5. Use HTTPS in production
6. Set up proper logging and monitoring

## API Response Examples

### User Registration
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Excel Upload
```json
{
  "success": true,
  "message": "Excel file uploaded successfully",
  "data": {
    "id": "file-id",
    "fileName": "data.xlsx",
    "uploadTime": "2024-01-01T00:00:00.000Z"
  }
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **CORS Errors**
   - Verify FRONTEND_URL in .env matches frontend URL
   - Check browser console for CORS details

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration
   - Verify token format in Authorization header

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process using the port

### Health Check
Visit `http://localhost:3000/health` to verify the server is running correctly. 