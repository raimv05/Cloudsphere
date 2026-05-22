# Cloudsphere — Project Overview

## What is Cloudsphere?

**Cloudsphere** is a comprehensive cloud computing knowledge and research management platform designed to help organizations, researchers, and cloud professionals share, analyze, and collaborate on cloud migration case studies, research papers, security reports, and industry surveys.

The platform combines a modern React-based frontend with a robust Node.js backend, leveraging MongoDB for persistent data storage, to create a centralized hub for cloud engineering insights and best practices.

---

## What Does It Do?

Cloudsphere serves as an integrated platform for:

1. **Knowledge Sharing** — Users can publish and discover real-world cloud migration case studies from institutions worldwide.
2. **Research Management** — Researchers share academic and technical papers on cloud topics (economics, security, architecture, etc.).
3. **Security Auditing** — Security teams create and view compliance reports, risk assessments, and findings across cloud deployments.
4. **Community Feedback** — Teams design and distribute surveys to gather feedback on cloud adoption, maturity, and organizational needs.
5. **User Collaboration** — Authenticated users with role-based access (user/admin) create, edit, and manage resources.

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / UI                           │
│                  (React + Vite + Redux)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend (Node.js)                    │
│  ├─ Auth Routes (register, login, profile)                  │
│  ├─ Case Studies API                                        │
│  ├─ Research Papers API                                     │
│  ├─ Security Reports API                                    │
│  ├─ Surveys API                                             │
│  └─ Middleware (auth, validation, error handling)           │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                  │
│  ├─ Users Collection                                        │
│  ├─ CaseStudies Collection                                  │
│  ├─ ResearchPapers Collection                               │
│  ├─ SecurityReports Collection                              │
│  └─ Surveys Collection                                      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 + React Router for page navigation
- Redux Toolkit for centralized state management
- Tailwind CSS + Framer Motion for UI and animations
- React Hook Form for form management
- Recharts for data visualization (pie, bar, line charts)
- Axios for API communication

**Backend:**
- Express.js 5.x for REST API
- Node.js with ES modules
- Mongoose 9.x for MongoDB schema modeling
- JWT for authentication
- bcryptjs for password hashing
- Nodemon for development auto-reload

**Database:**
- MongoDB Atlas (cloud-hosted) for persistent storage
- Collections for Users, Case Studies, Papers, Security Reports, Surveys

---

## Core Functionalities Implemented

### 1. **Authentication & User Management**

**What it does:**
- Users can register with name, email, and password
- Password hashing via bcryptjs (salt rounds: 10)
- JWT-based authentication with token expiration
- Login returns a token for authenticated requests
- Profile endpoint to retrieve current user details

**How it works:**
- Register: POST `/api/auth/register` → user created, token issued
- Login: POST `/api/auth/login` → credentials validated, token issued
- Profile: GET `/api/auth/profile` (protected) → returns logged-in user info
- All protected endpoints verify JWT via `Authorization: Bearer <token>` header

**Files:**
- Backend: [server/src/controllers/authController.js](server/src/controllers/authController.js)
- Backend: [server/src/routes/authRoutes.js](server/src/routes/authRoutes.js)
- Frontend: [client/src/pages/Login.jsx](client/src/pages/Login.jsx), [client/src/pages/Register.jsx](client/src/pages/Register.jsx)

---

### 2. **Case Studies Management**

**What it does:**
- Users document real-world cloud migration stories from their institutions
- Each case study captures: institution name, cloud provider, migration benefits, challenges faced, and ROI achieved
- Displays metrics dashboard: total migrations, top cloud provider, provider distribution pie chart
- Search/filter case studies by institution, provider, or keywords
- Only creators (or admins) can delete their own case studies
- Permissions enforced: non-owners get 403 Forbidden

**How it works:**
- Create: POST `/api/case-studies` (protected) → creates a new case study, associates creator ID
- List: GET `/api/case-studies` (protected) → returns all case studies with creator info
- Delete: DELETE `/api/case-studies/:id` (protected) → validates ownership, removes record
- Frontend Redux slice handles async fetches and state updates

**Example Data:**
```json
{
  "institution": "Acme University",
  "cloudProvider": "AWS",
  "benefits": "Improved scalability and reduced infrastructure costs",
  "challenges": "Initial migration complexity and staff training",
  "roi": "40% cost reduction"
}
```

**Files:**
- Backend: [server/src/controllers/caseStudyController.js](server/src/controllers/caseStudyController.js)
- Backend: [server/src/models/CaseStudy.js](server/src/models/CaseStudy.js)
- Frontend: [client/src/pages/CaseStudies.jsx](client/src/pages/CaseStudies.jsx)
- Frontend Redux: [client/src/redux/slices/caseStudySlice.js](client/src/redux/slices/caseStudySlice.js)

---

### 3. **Research Papers / Literature Hub**

**What it does:**
- Users publish research papers on cloud topics (Cost, Security, Architecture, etc.)
- Each paper has: title, category, summary, and author attribution
- Display papers chronologically (newest first)
- Only creators or admins can delete papers
- Search and filter by title or category

**How it works:**
- Create: POST `/api/papers` (protected) → creates paper, associates author
- List: GET `/api/papers` (protected) → returns papers with author info sorted by creation date
- Delete: DELETE `/api/papers/:id` (protected) → validates ownership, removes record
- Frontend displays papers in card grid with creation dates

**Example Data:**
```json
{
  "title": "Cloud Economics 101",
  "category": "Economics",
  "summary": "An introduction to cloud cost modeling and ROI calculations"
}
```

**Files:**
- Backend: [server/src/controllers/paperController.js](server/src/controllers/paperController.js)
- Backend: [server/src/models/ResearchPaper.js](server/src/models/ResearchPaper.js)
- Frontend: [client/src/pages/Literature.jsx](client/src/pages/Literature.jsx)
- Frontend Redux: [client/src/redux/slices/paperSlice.js](client/src/redux/slices/paperSlice.js)

---

### 4. **Security Reports**

**What it does:**
- Security teams create compliance and risk assessment reports
- Each report captures: institution, risk level, compliance status, and detailed findings
- Risk levels: Low, Medium, High, Critical
- Compliance statuses: Compliant, Non-Compliant, Under Review
- Display reports in chronological order with risk level badges
- Only creators or admins can view full details (implied by protected routes)

**How it works:**
- Create: POST `/api/security-reports` (protected) → validates all fields, creates report
- List: GET `/api/security-reports` (protected) → returns all reports with creator metadata
- Frontend displays reports as cards with risk badges and findings summary

**Example Data:**
```json
{
  "institution": "Acme University",
  "riskLevel": "Medium",
  "complianceStatus": "Under Review",
  "findings": ["Open S3 buckets", "Weak IAM policies", "Missing encryption"]
}
```

**Files:**
- Backend: [server/src/controllers/securityController.js](server/src/controllers/securityController.js)
- Backend: [server/src/models/SecurityReport.js](server/src/models/SecurityReport.js)
- Frontend: [client/src/pages/Security.jsx](client/src/pages/Security.jsx)
- Frontend Redux: [client/src/redux/slices/securitySlice.js](client/src/redux/slices/securitySlice.js)

---

### 5. **Surveys & Analytics**

**What it does:**
- Users create surveys with multiple question types: text, multiple choice (radio), rating (1-5)
- Respondents answer surveys; one response per user per survey
- After submitting, respondents view real-time aggregated analytics:
  - **Multiple choice**: pie chart with option distribution
  - **Rating**: bar chart with response counts per rating level
  - **Text**: list of responses with user attribution and dates
- Search surveys by title
- Creator sees submission count on survey card

**How it works:**
- Create: POST `/api/surveys` (protected) → validates title and questions, creates survey
- List: GET `/api/surveys` (protected) → returns surveys with response counts
- Get by ID: GET `/api/surveys/:id` (protected) → returns survey with full response history
- Submit response: POST `/api/surveys/:id/responses` (protected) → validates answers, appends to survey, prevents duplicate submissions
- Frontend dynamically renders question types and charts based on data

**Example Data:**
```json
{
  "title": "Cloud Adoption Survey",
  "questions": [
    {
      "text": "Which cloud provider do you use?",
      "type": "multiple_choice",
      "options": ["AWS", "Azure", "GCP"]
    },
    {
      "text": "Rate your cloud maturity (1-5)",
      "type": "rating"
    },
    {
      "text": "Any comments on migration?",
      "type": "text"
    }
  ]
}
```

**Files:**
- Backend: [server/src/controllers/surveyController.js](server/src/controllers/surveyController.js)
- Backend: [server/src/models/Survey.js](server/src/models/Survey.js)
- Frontend: [client/src/pages/Surveys.jsx](client/src/pages/Surveys.jsx)
- Frontend Redux: [client/src/redux/slices/surveySlice.js](client/src/redux/slices/surveySlice.js)

---

## Access Control & Permissions

- **Public Routes:** Register, Login
- **Protected Routes:** All resource creation, deletion, listing (require valid JWT)
- **Ownership Checks:** Delete operations verify that the logged-in user is the creator or has `admin` role
- **Role-Based Access:** Admin users can delete any resource; regular users can only manage their own

---

## Demo Credentials

After running the seed script (`npm run seed`):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Password123!` |
| User | `user@example.com` | `Password123!` |

**Demo Data Included:**
- 2 Case Studies (one by admin, one by user)
- 2 Research Papers (one by admin, one by user)
- 1 Security Report (by admin)
- 1 Survey (by user) with 3 questions

---

## Running the Project

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB instance)

### Installation & Start
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed demo data (optional)
cd ../server && npm run seed

# Start backend (dev mode with auto-reload)
npm run dev

# In another terminal, start frontend
cd ../client && npm run dev
```

### Access
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:5000/`
- Health check: `http://localhost:5000/api/health`

---

## File Structure Summary

```
Cloudsphere/
├── client/                       # React Frontend
│   ├── src/
│   │   ├── pages/               # Page components (Login, CaseStudies, etc.)
│   │   ├── redux/               # Redux store, slices
│   │   ├── services/            # API client (axios)
│   │   ├── components/          # Reusable components (Navbar, Sidebar, etc.)
│   │   └── layouts/             # Layout wrappers
│   └── package.json             # Frontend dependencies
│
├── server/                       # Node.js Backend
│   ├── src/
│   │   ├── controllers/         # Business logic for each feature
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API endpoint definitions
│   │   ├── middlewares/         # Auth, validation middleware
│   │   └── app.js               # Express app setup
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   └── package.json             # Backend dependencies
│
├── README.md                     # Run instructions
├── PROJECT_OVERVIEW.md           # This file
└── .env                          # Environment variables (not in repo)
```

---

## Key Features Highlights

✅ **Full CRUD Operations** — Create, Read, Update (implicit), Delete for all resources  
✅ **User Authentication** — JWT-based with password hashing  
✅ **Real-Time Analytics** — Charts and aggregated survey responses  
✅ **Search & Filtering** — Find case studies, papers, surveys by keywords  
✅ **Role-Based Access Control** — Admin vs. user permissions  
✅ **Ownership Validation** — Only creators can delete their own resources  
✅ **Professional UI** — Dark theme, animations, responsive design  
✅ **Seeded Demo Data** — Quick start with sample users and content  

---

## Next Steps & Enhancements (Future Scope)

- **Comments & Ratings** — Allow users to comment on and rate case studies/papers
- **Notifications** — Email or in-app alerts when surveys are ready to respond
- **Export** — PDF/CSV export of case studies, survey results
- **Admin Dashboard** — Metrics on platform usage, user growth
- **Advanced Search** — Elasticsearch integration for full-text search
- **Collaboration** — Real-time co-editing of surveys or case studies
- **Deployment** — Docker containerization, CI/CD pipeline, cloud hosting

---

**Developed:** May 2026  
**Technology:** React, Node.js, Express, MongoDB, Redux, Tailwind CSS
