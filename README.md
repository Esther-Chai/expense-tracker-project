# 📊 Expense Tracker — Learning Project

A simple full-stack app to learn how APIs and routes work.

## Project Structure

```
expense-tracker/
├── backend/
│   ├── index.js        ← Express API server
│   └── package.json
└── frontend/
    └── index.html      ← UI (HTML + CSS + JS)
```

## How to Run

### 1. Start the backend
```bash
cd backend
node index.js
```
You should see:
```
✅ Expense Tracker API running at http://localhost:3000
```

### 2. Open the frontend
Open `frontend/index.html` directly in your browser.
(Just double-click the file, or drag it into Chrome/Firefox)

---

## API Routes Cheatsheet

| Method | Route                        | What it does              |
|--------|------------------------------|---------------------------|
| GET    | /expenses                    | Get all expenses          |
| GET    | /expenses?category=Food      | Filter by category        |
| GET    | /expenses/summary            | Totals per category       |
| POST   | /expenses                    | Add a new expense         |
| DELETE | /expenses/:id                | Delete expense by ID      |

## Test the API manually (optional)

You can test routes directly using your browser or a tool like Postman / Thunder Client.

**Get all expenses:**
```
http://localhost:3000/expenses
```

**Filter by category:**
```
http://localhost:3000/expenses?category=Food
```

**Get summary:**
```
http://localhost:3000/expenses/summary
```

---

## How to Expand This App

Here are ideas to practice more concepts:

| Feature                  | New concept you'll learn             |
|--------------------------|--------------------------------------|
| Edit an expense          | PUT /expenses/:id + req.body         |
| Persist data to a file   | Node.js fs module                    |
| Connect to MongoDB       | Real database (mongoose)             |
| Add user login           | Authentication, JWT tokens           |
| Deploy to the internet   | Hosting (Railway, Render, Vercel)    |
