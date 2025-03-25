# ReferBiz - Backend

A robust Node.js and Express-based backend API for the ReferBiz referral marketing platform. This RESTful API provides authentication, campaign management, referral tracking, analytics, and more.

## 🚀 Features

- **Authentication**: JWT-based authentication system
- **User Management**: User registration and profile management
- **Agent System**: Create and manage agents for customer interactions
- **Campaign Management**: Create and configure referral campaigns
- **Referral Tracking**: Generate and track referral links and conversions
- **Contact Management**: Store and manage business contacts
- **Reward Processing**: Handle rewards for successful referrals
- **Messaging System**: Send emails and SMS to contacts
- **Analytics**: Track and analyze referral performance
- **File Upload**: Import contacts via CSV files

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- MongoDB (v4.0 or later)
- npm or yarn

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Agent_assignment.git
cd Agent_assignment/backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/referbiz
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:5000`.

## 🏗️ Project Structure

```
backend/
├── controllers/           # API route controllers
│   ├── agent_controller.js
│   ├── analytics_controller.js
│   ├── auth_controller.js
│   ├── campaign_controller.js
│   ├── contact_controller.js
│   ├── message_controller.js
│   ├── referral_controller.js
│   ├── reward_controller.js
│   └── upload_controller.js
├── middleware/            # Express middleware
│   ├── auth.js            # Authentication middleware
│   └── error.js           # Error handling middleware
├── models/                # Mongoose data models
│   ├── Agent.js
│   ├── Analytics.js
│   ├── Campaign.js
│   ├── Contact.js
│   ├── Message.js
│   ├── Referral.js
│   ├── Reward.js
│   └── User.js
├── routes/                # API route definitions
│   ├── agent_routes.js
│   ├── analytics_routes.js
│   ├── auth_routes.js
│   ├── campaign_routes.js
│   ├── contact_routes.js
│   ├── message_routes.js
│   ├── referral_routes.js
│   ├── reward_routes.js
│   └── upload_routes.js
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Dependencies and scripts
└── server.js              # Entry point
```

## 📝 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user profile |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | Get all agents |
| POST | `/api/agents` | Create a new agent |
| GET | `/api/agents/:id` | Get agent by ID |
| PUT | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | Get all campaigns |
| POST | `/api/campaigns` | Create a new campaign |
| GET | `/api/campaigns/:id` | Get campaign by ID |
| PUT | `/api/campaigns/:id` | Update campaign |
| DELETE | `/api/campaigns/:id` | Delete campaign |

### Referrals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals` | Get all referrals |
| POST | `/api/referrals` | Create a new referral |
| GET | `/api/referrals/:id` | Get referral by ID |
| POST | `/api/referrals/click/:referralCode` | Track referral click |
| POST | `/api/referrals/refer/:referralCode` | Add a referred person |
| PUT | `/api/referrals/status` | Update referred status |

### Rewards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rewards` | Get all rewards |
| POST | `/api/rewards` | Create a new reward |
| GET | `/api/rewards/:id` | Get reward by ID |
| PUT | `/api/rewards/:id` | Update reward status |
| GET | `/api/rewards/new` | Get template for new reward |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get all messages |
| POST | `/api/messages` | Create a new message |
| GET | `/api/messages/:id` | Get message by ID |
| POST | `/api/messages/:id/send` | Send a message |
| POST | `/api/messages/bulk` | Bulk import and send |

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | Get all contacts |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| GET | `/api/contacts/agent/:agentId` | Get contacts by agent |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get all analytics |
| GET | `/api/analytics/campaign/:campaignId` | Get campaign analytics |
| POST | `/api/analytics/generate` | Generate analytics |

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads` | Upload CSV file |

## 🚢 Deployment

The backend is designed to be deployed on Render:

1. Create a Render account at [render.com](https://render.com)
2. Set up a new Web Service from GitHub repository
3. Configure the service:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or paid tier

4. Add the following environment variables:
   - `PORT`: 10000
   - `NODE_ENV`: production
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `JWT_EXPIRE`: 30d
   - `FRONTEND_URL`: Your frontend URL

## 🔍 Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

## 🔒 Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- Protected routes require authentication via middleware
- MongoDB connection uses best security practices
- CORS configured to only allow specific origins

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
