# TaskFlow API & Dashboard

A secure, scalable REST API built with Node.js, Express, TypeScript, and Prisma (SQLite), alongside a premium React dashboard built with Vite and custom CSS. 

This project fulfills the Backend Developer (Intern) Project Assignment requirements.

---

## 🚀 Tech Stack

### Backend
- **Core:** Node.js, Express, TypeScript
- **Database ORM:** Prisma with SQLite (Zero local installation dependency, supports SQL relations & migrations)
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs` for secure password hashing
- **Input Validation:** Zod (Strict schema validation for bodies, route params, and queries)
- **Security:** Helmet (HTTP header security), CORS, Custom Centralized Error Middleware
- **Documentation:** Swagger UI (OpenAPI 3.0 static configuration)
- **Logging:** Winston Logger, Morgan HTTP logger

### Frontend
- **Core:** React 19, Vite, TypeScript
- **Icons:** Lucide React
- **Styling:** Premium Custom Vanilla CSS (Dark theme, HSL color system, Glassmorphism, animations)
- **API Client:** Fetch API client wrapper with automated header token management and auto-logout on token expiration

---

## 📂 Project Structure

```
new_project/
├── backend/
│   ├── prisma/             # Schema & migrations configuration
│   ├── src/
│   │   ├── config/         # DB connection & Swagger definitions
│   │   ├── controllers/    # API request handlers
│   │   ├── middlewares/    # Auth, Role, Validation & Error guards
│   │   ├── routes/         # Routing endpoints (v1 index, auth, tasks, users)
│   │   ├── services/       # Database query operations (business logic)
│   │   ├── utils/          # Winston logs & custom HttpError classes
│   │   ├── validation/     # Zod strict schemas
│   │   ├── app.ts          # Express configuration
│   │   └── index.ts        # Server entry point
│   ├── .env                # Port, Database URL, JWT Secrets
│   └── tsconfig.json       # Backend TypeScript compiler settings
├── frontend/
│   ├── src/
│   │   ├── components/     # Auth, Dashboard, TaskModal & Admin views
│   │   ├── services/       # API fetch client wrapper
│   │   ├── App.tsx         # Central UI router & global session manager
│   │   ├── index.css       # Premium custom stylesheet & transitions
│   │   └── main.tsx        # React client entry point
│   ├── index.html          # HTML template
│   └── package.json        # Frontend configuration
├── scalability_note.md     # Architectural production scalability note
└── README.md               # Master document
```

---

## 🔧 Installation and Running

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed.

### 1. Clone & Set Up Backend

Navigate to the `backend` folder, install dependencies, run database migrations, and start the development server:

```bash
# Move into backend
cd backend

# Install dependencies
npm install

# Run database migrations (creates SQLite database and generates Prisma Client)
npx prisma migrate dev --name init

# Start the API server in development mode
npm run dev
```

The server will start running on **`http://localhost:5000`**.
- Swagger API Docs will be available at **`http://localhost:5000/api-docs`**.

### 2. Set Up Frontend

Open a new terminal window, navigate to the `frontend` folder, install dependencies, and start the Vite development server:

```bash
# Move into frontend
cd frontend

# Install dependencies
npm install

# Start the React development server
npm run dev
```

The dashboard will open on **`http://localhost:5173`** (or another port outputted in your console).

---

## 🔑 Testing Role-Based Access Control (RBAC)

The application implements strict role protections:
- **USER role:** Standard users can create, read, update, and delete only their own tasks. They have no access to the Admin tab or system user list.
- **ADMIN role:** Administrators have global visibility. They can audit all tasks, view a listing of all registered users on the system, and delete any task.

### Step-by-Step Test:
1. **Register User A (Role: USER):** Create a task titled "User A Task".
2. **Register User B (Role: USER):** Verify that User B cannot see "User A Task" and only has access to their own tasks.
3. **Register User C (Role: ADMIN):** Notice a new tab appears in the top navigation: **"Admin Center"**.
4. **Admin Verification:**
   - In the **Tasks Workspace**, User C can see tasks created by all users, along with their names.
   - In the **Admin Center**, User C can view the system metrics (total users, total tasks, avg tasks per user) and see the list of all registered accounts.

---

## 🛡️ Security Features Overview

1. **Password Hashing:** Passwords are never stored in plain text. They are hashed using a 10-round Salt factor with `bcryptjs`.
2. **Stateless JWT:** Secure JWT tokens are signed with the user ID, email, and role. These are sent with a `Bearer` prefix in the `Authorization` header.
3. **Zod Validation Gates:** Validates all query structures, URL parameters, and request bodies before executing controller methods.
4. **CORS Security:** Restricts access using CORS configurations.
5. **Secure HTTP Headers:** Express app integrates `helmet` to protect from clickjacking, scripting attacks, and sniffing.
6. **Centralized Exception Catcher:** All async errors are safely funneled to our central handler, logging stack traces locally while stripping internal database traces from public client responses.

---

## 📈 Scalability

For a detailed design outlining how we can scale this monolithic database, establish Redis cache nodes, and build containerized pipelines, please review the [Scalability Note](file:///C:/Users/ASUS/Documents/new_project/scalability_note.md).
