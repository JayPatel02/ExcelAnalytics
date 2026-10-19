# Excel Analytics Frontend

A modern React application for Excel data analysis and visualization using Chart.js.

## Features

### User Features
- **Authentication**: Secure login and registration system
- **Excel Upload**: Drag & drop Excel file upload with support for .xlsx, .xls, .xlsm files
- **Chart Creation**: Interactive chart creation with multiple chart types:
  - Bar Charts
  - Line Charts
  - Pie Charts
  - Scatter Plots
  - Area Charts
  - Doughnut Charts
  - Radar Charts
- **Axis Selection**: Choose X and Y axes from Excel data
- **Dashboard**: User dashboard with file status and quick actions
- **Responsive Design**: Modern UI with Tailwind CSS

### Admin Features
- **User Management**: View all users and delete user accounts
- **Data Access**: Access user Excel files and data
- **Admin Dashboard**: Comprehensive system statistics
- **Excel Files Overview**: View all uploaded Excel files

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Charting library for data visualization
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Dropzone** - File upload with drag & drop
- **XLSX** - Excel file parsing
- **Lucide React** - Beautiful icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.jsx       # Login form
│   ├── Register.jsx    # Registration form
│   ├── Dashboard.jsx   # User dashboard
│   ├── AdminDashboard.jsx # Admin dashboard
│   ├── ExcelUpload.jsx # Excel file upload
│   └── ChartCreator.jsx # Chart creation interface
├── context/            # React context
│   └── AuthContext.jsx # Authentication context
├── services/           # API services
│   └── api.js         # API configuration and endpoints
├── App.jsx            # Main app component with routing
├── main.jsx           # App entry point
└── index.css          # Global styles and Tailwind CSS
```

## API Integration

The frontend communicates with the backend API through the `services/api.js` file:

- **Authentication**: Login, register, logout
- **Excel Management**: Upload, retrieve, delete Excel files
- **Admin Functions**: User management, system statistics

## Chart Types

The application supports 7 different chart types:

1. **Bar Chart** - For comparing categories
2. **Line Chart** - For trends over time
3. **Pie Chart** - For showing proportions
4. **Scatter Plot** - For correlation analysis
5. **Area Chart** - For cumulative data
6. **Doughnut Chart** - Alternative to pie charts
7. **Radar Chart** - For multivariate data

## Usage

### For Users
1. Register or login to your account
2. Upload an Excel file using the drag & drop interface
3. Navigate to "Create Charts" to visualize your data
4. Select chart type and choose X/Y axes
5. View your interactive charts

### For Admins
1. Login with admin credentials
2. Access the admin dashboard to view system statistics
3. Manage users through the "Users" tab
4. View all Excel files in the "Excel Files" tab

## Styling

The application uses Tailwind CSS with custom components defined in `index.css`:

- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.btn-danger` - Danger button styling
- `.card` - Card container styling
- `.input-field` - Form input styling
- `.form-label` - Form label styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

To start development:

1. Ensure the backend server is running on `http://localhost:3000`
2. Run `npm run dev` to start the frontend development server
3. Open `http://localhost:5173` in your browser

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Environment Variables

The API base URL is configured in `src/services/api.js`. Update the `API_BASE_URL` constant if your backend runs on a different port or host.
