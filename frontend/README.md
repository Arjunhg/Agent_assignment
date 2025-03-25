# ReferBiz - Frontend

A modern, React-based frontend for the ReferBiz referral marketing platform. Built with Material UI and Vite for optimal performance and user experience.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive interface built with Material UI
- **Authentication**: Secure login and registration with JWT
- **Dashboard**: Overview of referral performance metrics
- **Campaign Management**: Create and customize referral campaigns
- **Referral System**: Generate and track referral links
- **Reward Management**: Set up and distribute rewards
- **Contact Management**: Organize and manage contact lists
- **Messaging System**: Send emails and SMS to contacts
- **Analytics**: Interactive charts and data visualization
- **Mobile Responsive**: Works seamlessly on all devices

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Agent_assignment.git
cd Agent_assignment/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_BACKEND_URL=http://localhost:5000
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## 🏗️ Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── campaign/      # Campaign management components
│   │   ├── common/        # Shared UI components
│   │   ├── contacts/      # Contact management components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── layout/        # Layout components
│   │   ├── referral/      # Referral management components
│   │   └── rewards/       # Reward management components
│   ├── context/           # React context providers
│   │   ├── AuthContext.js # Authentication state management
│   │   └── UIContext.js   # UI state management
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── Auth/          # Login and Register pages
│   │   ├── Dashboard/     # Dashboard page
│   │   ├── LandingPage/   # Landing/Home page
│   │   ├── Campaigns/     # Campaign pages
│   │   ├── Contacts/      # Contact management pages
│   │   ├── Referrals/     # Referral pages
│   │   └── Settings/      # User settings pages
│   ├── services/          # API service calls
│   │   ├── api.js         # API client configuration
│   │   ├── auth.js        # Authentication API
│   │   ├── campaigns.js   # Campaign management API
│   │   ├── contacts.js    # Contact management API
│   │   ├── referrals.js   # Referral management API
│   │   └── rewards.js     # Reward management API
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── theme.js           # Material UI theme configuration
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🧩 Key Components

### Authentication

- **Login**: User authentication with email/password
- **Register**: New user registration
- **AuthContext**: Manages authentication state globally

### Dashboard

- **Overview**: Summary of referral performance
- **Charts**: Visual representation of referral statistics
- **Recent Activity**: Latest referral activities

### Campaign Management

- **Campaign Creator**: Form to create and customize campaigns
- **Campaign List**: Overview of all active and past campaigns
- **Campaign Details**: Detailed view of individual campaigns

### Referral System

- **Referral Link Generator**: Creates unique referral links
- **Referral Tracker**: Monitors referral link usage
- **Referral Status**: Tracks conversion status

### Contact Management

- **Contact List**: View and manage contacts
- **Contact Import**: Import contacts from CSV
- **Contact Groups**: Organize contacts into groups

## 📝 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Code Style

This project follows the Airbnb JavaScript Style Guide. All code should be formatted according to these guidelines.

### Adding New Features

When adding new features:

1. Create components in the appropriate directory
2. Update services to interact with the backend
3. Add routes in App.jsx if needed
4. Update context providers if state management is required

## 🚢 Deployment

The frontend is designed to be deployed on Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI or use the Vercel dashboard
3. Add the following environment variables:
   - `VITE_BACKEND_URL`: Your backend API URL
4. Deploy using Vercel dashboard or CLI commands

## 🔍 Environment Variables

- `VITE_BACKEND_URL`: URL for the backend API (required)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
