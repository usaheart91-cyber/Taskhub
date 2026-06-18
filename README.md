# TaskHub - Survey & Task Platform

A modern survey and task-based platform where users can earn points by completing surveys and tasks.

## Features

✅ User Registration & Login
✅ Survey & Task Listing
✅ Points Earning System
✅ User Dashboard
✅ Leaderboard
✅ Admin Panel
✅ Responsive Design

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / Firebase
- **Hosting:** Vercel / Heroku / Render

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (free tier)

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/usaheart91-cyber/TaskHub.git
cd TaskHub
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file in root directory
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

4. Start the server
```bash
npm start
```

5. Open in browser
```
http://localhost:3000
```

## Project Structure

```
TaskHub/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── controllers/
├── package.json
└── .env
```

## Features Explained

### User Registration
- Email & Password based signup
- Email verification (optional)
- User profile setup

### Surveys & Tasks
- Browse available surveys and tasks
- Complete and earn points
- Instant point credit

### Dashboard
- View earned points
- Completed tasks history
- Referral earnings (optional)

### Leaderboard
- Top users by points
- Weekly/Monthly rankings
- User profile view

### Admin Panel
- Create surveys/tasks
- View user analytics
- Manage platform settings

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Surveys
- `GET /api/surveys` - List all surveys
- `POST /api/surveys/:id/complete` - Complete survey
- `GET /api/surveys/:id` - Get survey details

### Users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/:id/stats` - User statistics
- `PUT /api/users/:id/profile` - Update profile

### Admin
- `POST /api/admin/surveys` - Create survey
- `DELETE /api/admin/surveys/:id` - Delete survey
- `GET /api/admin/analytics` - Get analytics

## Contributing

Feel free to contribute! Fork the repository and submit a pull request.

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ by TaskHub Team**
