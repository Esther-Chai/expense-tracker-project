# 💰 Expense Tracker

A full-stack expense tracking web application built with Node.js, Express, Prisma, and PostgreSQL — featuring JWT authentication, CI/CD pipeline, and Docker containerisation.

🔗 **Live Demo:** [expense-tracker-xxx.netlify.app](https://expense-tracker-xxx.netlify.app)  
🔗 **API:** [expense-tracker-xxx.up.railway.app](https://expense-tracker-xxx.up.railway.app)

---

## 📸 Screenshots

<img width="1918" height="870" alt="image" src="https://github.com/user-attachments/assets/05f20141-23eb-470d-aaf8-6994aa7fb7ae" />
<img width="1828" height="862" alt="image" src="https://github.com/user-attachments/assets/f916a35a-6fff-4f1d-aa36-b6501622c38b" />
<img width="1918" height="855" alt="image" src="https://github.com/user-attachments/assets/f54c2065-e60c-4754-bd5a-14ddbec933dd" />
<img width="1310" height="852" alt="image" src="https://github.com/user-attachments/assets/304aa274-2caa-4262-a8c3-0d4aa894256c" />


---

## ✨ Features

- 🔐 User registration and login with JWT authentication
- ➕ Add, edit, and delete expenses
- 🗂️ Custom categories per user with emoji icons
- 📊 Expense summary grouped by category
- 📅 Filter expenses by category and date range
- 📤 Export expenses to CSV
- 💾 Data persists across sessions with PostgreSQL (Neon)
- 📱 Responsive design

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access |
| PostgreSQL (Neon) | Cloud database |
| JWT + bcryptjs | Authentication |
| Docker | Containerisation |

### Frontend
| Technology | Purpose |
|---|---|
| HTML / CSS / JavaScript | UI (no framework) |
| Fetch API | HTTP requests to backend |
| Netlify | Static hosting |

### DevOps
| Technology | Purpose |
|---|---|
| GitHub Actions | CI/CD pipeline |
| Docker | Container build |
| Railway | Backend hosting |
| Netlify | Frontend hosting |

---

## 🏗️ Architecture

```
Browser (Netlify)
      ↓ HTTPS fetch + JWT token
Express API (Railway / Docker)
      ↓ Prisma ORM
PostgreSQL (Neon)
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js v20+
- A PostgreSQL database (or free [Neon](https://neon.tech) account)

### Backend

```bash
# Clone the repo
git clone https://github.com/Esther-Chai/expense-tracker-project.git
cd expense-tracker-project/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET in .env

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start the server
node index.js
# Server runs at http://localhost:3000
```

### Frontend

```bash
cd ../frontend

# Serve locally
npx serve . -l 5500
# Open http://localhost:5500
```

> Demo account after seeding: `demo@example.com` / `demo1234`

---

## 📡 API Routes

All routes except `/auth` require a `Authorization: Bearer <token>` header.

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Create account, returns JWT |
| POST | `/auth/login` | Login, returns JWT |

### Expenses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/expenses` | Get all expenses |
| GET | `/expenses?category=Food&from=2024-01-01&to=2024-01-31` | Filter expenses |
| GET | `/expenses/summary` | Totals grouped by category |
| GET | `/expenses/export` | Download CSV |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/:id` | Edit expense |
| DELETE | `/expenses/:id` | Delete expense |

### Categories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create category |
| DELETE | `/categories/:id` | Delete category |

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers GitHub Actions:

```
git push main
      ↓
Backend changed?
  ① Run Jest + Supertest tests
  ② Build Docker image
  ③ Deploy to Railway

Frontend changed?
  ① Validate HTML
  ② Deploy to Netlify
```

Tests must pass before any deployment runs.

---

## 🗄️ Database Schema

```
users
  id, email, passwordHash, name, createdAt

categories
  id, name, icon, userId → users

expenses
  id, title, amount, date, notes, createdAt
  userId → users
  categoryId → categories
```

---

## 📁 Project Structure

```
expense-tracker-project/
├── backend/
│   ├── .github/workflows/
│   │   └── ci-cd.yml           # GitHub Actions pipeline
│   ├── __tests__/
│   │   └── api.test.js         # Jest + Supertest tests
│   ├── middleware/
│   │   ├── authenticate.js     # JWT middleware
│   │   └── errorHandler.js     # Central error handling
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data
│   ├── routes/
│   │   ├── auth.js             # Register + login
│   │   ├── expenses.js         # Expense CRUD
│   │   └── categories.js       # Category CRUD
│   ├── app.js                  # Express app
│   ├── database.js             # Prisma client
│   ├── index.js                # Server entry point
│   └── Dockerfile
└── frontend/
    ├── .github/workflows/
    │   └── frontend-ci-cd.yml  # Netlify deploy pipeline
    ├── index.html              # Main app
    └── config.js               # API URL config
```

---

## 🔒 Environment Variables

Create a `.env` file in `backend/` based on `.env.example`:

```env
DATABASE_URL="postgresql://..."   # Neon connection string
JWT_SECRET="your_secret_here"     # Any long random string
```

---

## 📚 What I Learned

- Building a RESTful API with Express and proper route organisation
- Database schema design with relationships (users → categories → expenses)
- JWT authentication flow — register, login, protect routes with middleware
- Prisma ORM — migrations, seeding, and type-safe queries
- Docker containerisation for consistent deployments
- CI/CD pipelines with GitHub Actions — test before deploy
- Deploying a full-stack app with separate frontend and backend hosting

---

## 🔮 Future Improvements

- [ ] Cybersecurity Aspects
- [ ] Monthly budget limits per category
- [ ] Charts and spending trends (Chart.js)
- [ ] Recurring expenses
- [ ] Mobile app (React Native)
- [ ] Multi-currency support

---

## 👩‍💻 Author

**Esther Chai**  
[GitHub](https://github.com/Esther-Chai)
