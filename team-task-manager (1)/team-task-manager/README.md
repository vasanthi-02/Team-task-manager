# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

## 🔗 Live Demo
- **Frontend:** [your-frontend-url.railway.app]
- **Backend API:** [your-backend-url.railway.app]

---

## 🚀 Features

- 🔐 **Authentication** — JWT-based Signup & Login
- 👥 **Role-Based Access Control** — Admin vs Member permissions
- 📁 **Project Management** — Create, update, archive projects with team members
- ✅ **Task Management** — Create, assign, prioritize, and track tasks
- 📊 **Dashboard** — Live stats, task breakdown, overdue alerts
- 🌐 **REST API** — Clean, documented endpoints

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   ├── db.js           # MySQL connection pool
│   │   └── schema.sql      # Database schema
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── role.js         # Role-based access
│   ├── routes/             # Express routes
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── context/        # AuthContext (global user state)
│   │   ├── pages/          # Login, Signup, Dashboard, Projects, Tasks, Users
│   │   ├── components/     # Layout, Sidebar
│   │   ├── utils/          # Axios API instance
│   │   └── App.js
│   └── public/
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 16+
- MySQL 8+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Set up the database
```bash
mysql -u root -p < backend/config/schema.sql
```

### 3. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev
```

### 4. Configure frontend
```bash
cd frontend
# Create .env file:
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm install
npm start
```

App runs at `http://localhost:3000`

---

## 🌐 Deploy on Railway

### Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your `backend` folder (or set Root Directory to `/backend`)
3. Add a **MySQL** service from Railway plugins
4. Set environment variables:
   ```
   DB_HOST=<from Railway MySQL>
   DB_USER=<from Railway MySQL>
   DB_PASSWORD=<from Railway MySQL>
   DB_NAME=railway
   DB_PORT=3306
   JWT_SECRET=your_secret_here
   FRONTEND_URL=https://your-frontend.railway.app
   PORT=5000
   ```
5. Run the schema: connect to the Railway MySQL and run `schema.sql`

### Frontend
1. New Project → Deploy from GitHub
2. Set Root Directory to `/frontend`
3. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
4. Build command: `npm run build`
5. Start command: `npx serve -s build`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects (Admin: full access, Member: view only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Project details + members |
| POST | `/api/projects` | Create project (Admin) |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| GET | `/api/tasks/:id` | Task details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Stats + recent tasks |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | User details |
| PUT | `/api/users/:id/role` | Update user role |

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/Delete Projects | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create Tasks | ✅ | ✅ |
| Update All Tasks | ✅ | Own only |
| View All Users | ✅ | ❌ |
| Change User Roles | ✅ | ❌ |
| Dashboard | Full stats | Personal stats |

---

## 👤 Default Admin Credentials
- Email: `admin@taskmanager.com`
- Password: `password`

> ⚠️ Change this in production!

---

## 👩‍💻 Developer
**Vasanthi Vallepu** — Full Stack Developer  
[LinkedIn](https://www.linkedin.com/in/vasanthivallepu/) | [GitHub](https://github.com/vasanthi-02)
