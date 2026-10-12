# ABC Company - Expense Voucher Management System (MERN Stack)

A complete, role-based, end-to-end web application developed to replace manual expense voucher processing at ABC Company. The system digitizes voucher creation, authorization workflows, role-based dashboards, and audit tracking for Employees, Directors, and the Accounts Team.

---

## 📋 Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture & Tech Stack](#2-system-architecture--tech-stack)
- [3. Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
- [4. Voucher Workflow State Machine](#4-voucher-workflow-state-machine)
- [5. Database Schema Explanation](#5-database-schema-explanation)
- [6. REST API Documentation](#6-rest-api-documentation)
- [7. Project Setup & Execution Guide](#7-project-setup--execution-guide)
- [8. Demo Credentials](#8-demo-credentials)
- [9. Validation & Business Rules](#9-validation--business-rules)
- [10. Assumptions Made During Development](#10-assumptions-made-during-development)
- [11. Bonus Points & Highlight Features](#11-bonus-points--highlight-features)

---

## 1. Executive Summary
ABC Company previously managed employee expense vouchers manually, requiring physical paperwork, manual Director sign-offs, and physical submission to the Accounts Team for reimbursement. This manual process was error-prone, untracked, and lacked transparency.

This system digitizes the entire lifecycle:
- **Employees** submit expense claims with digital/uploaded signatures, tracking statuses in real time.
- The **Director (Admin)** reviews pending claims, approves them with an authorized Director signature, or rejects them with mandatory explanation remarks.
- The **Accounts Team** monitors all organization-wide approved vouchers for reimbursement processing and can print/export formal expense vouchers.

---

## 2. System Architecture & Tech Stack

### 🚀 Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js 5
- **Database:** MongoDB via Mongoose ODM (includes automatic in-memory MongoDB fallback via `mongodb-memory-server` if local MongoDB is not running)
- **Security & Auth:** JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-based Access Control (RBAC) middleware
- **File Upload:** Multer for signature image uploads (PNG, JPG, WebP) and base64 canvas signatures
- **Logging:** Morgan

### 🎨 Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **HTTP Client:** Axios with JWT request/response interceptors
- **Styling:** Pure CSS (Responsive design, CSS variables, accessible form controls, print stylesheet)
- **Icons:** Lucide React
- **Digital Signatures:** Dual support for **Image File Upload** and **HTML5 Canvas Drawing Pad**

---

## 3. Role-Based Access Control (RBAC)

| Capability | Employee | Director (Admin) | Accounts Team |
|---|:---:|:---:|:---:|
| Login & Session Management | ✅ | ✅ | ✅ |
| Create Expense Voucher (as Draft) | ✅ | ❌ | ❌ |
| Edit / Delete Draft Voucher | ✅ (Own only) | ❌ | ❌ |
| Submit Voucher for Approval | ✅ (Own only) | ❌ | ❌ |
| Upload Employee Signature | ✅ (Mandatory on submit) | ❌ | ❌ |
| View Own Vouchers | ✅ | ✅ | ✅ |
| View All Organization Vouchers | ❌ | ✅ | ✅ |
| Approve Voucher (with Signature) | ❌ | ✅ | ❌ |
| Reject Voucher (with Reason) | ❌ | ✅ | ❌ |
| Search, Filter & Sort Vouchers | ✅ (Own) | ✅ (All) | ✅ (All) |
| Print / Export Voucher Certificate | ✅ | ✅ | ✅ |
| Access Accounts KPI Dashboard | ❌ | ❌ | ✅ |

---

## 4. Voucher Workflow State Machine

```
[Employee creates Voucher]
          │
          ▼
       [Draft] ─────────► [Delete / Edit allowed only here]
          │
          │ (Employee attaches signature & submits)
          ▼
   [Submitted / Pending Approval]
          │
          ├──────────────────────────────┐
          │ (Director Approves)          │ (Director Rejects)
          ▼                              ▼
     [Approved]                     [Rejected]
  (Director signature attached;   (Mandatory rejection reason;
   read-only; processed by         read-only; viewable by employee)
   Accounts Team)
```

---

## 5. Database Schema Explanation

### 5.1 User Collection (`User.js`)
Stores company user identities and role assignments.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['employee', 'director', 'accounts'], default: 'employee' },
  employeeId: { type: String, default: '' },
  department: { type: String, default: 'General' },
  signatureUrl: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Voucher Collection (`Voucher.js`)
Captures all financial details, audit dates, and multi-party signature assets.
```javascript
{
  voucherNumber: { type: String, required: true, unique: true, index: true }, // e.g. EV-2026-0001
  voucherDate: { type: Date, default: Date.now },
  expenseDate: { type: Date, required: true },
  department: { type: String, required: true },
  expenseTitle: { type: String, required: true },
  expenseCategory: {
    type: String,
    enum: [
      'Travel', 'Meals & Entertainment', 'Office Supplies',
      'Software & Tools', 'Accommodation', 'Training & Certification',
      'Client Relations', 'Communication & Internet', 'Miscellaneous'
    ],
    default: 'Miscellaneous'
  },
  expenseDescription: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0.01 },

  // Employee Information
  employee: { type: ObjectId, ref: 'User', required: true, index: true },
  employeeName: { type: String, required: true },
  employeeId: { type: String, default: '' },
  employeeSignature: { type: String, default: '' },

  // Approval Information
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft', index: true },
  director: { type: ObjectId, ref: 'User', default: null },
  directorName: { type: String, default: '' },
  directorSignature: { type: String, default: '' },
  approvalDate: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },

  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 Counter Collection (`Counter.js`)
Maintains atomic sequential numbering per calendar year:
```javascript
{
  _id: "voucher_2026",
  seq: 5 // Produces EV-2026-0005
}
```

---

## 6. REST API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile / default signature |

### 📄 Voucher Management (`/api/vouchers`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/vouchers` | All authenticated | Fetch vouchers with search, filter, sort & pagination |
| `POST` | `/api/vouchers` | Employee | Create a new voucher (always saved as Draft) |
| `GET` | `/api/vouchers/:id` | All authenticated | Retrieve voucher details (scoped by role) |
| `PUT` | `/api/vouchers/:id` | Employee | Update a Draft voucher (Draft status only) |
| `DELETE` | `/api/vouchers/:id` | Employee | Delete a Draft voucher (Draft status only) |
| `POST` | `/api/vouchers/:id/submit` | Employee | Submit draft for approval (requires employee signature) |
| `POST` | `/api/vouchers/:id/approve` | Director | Approve voucher (requires director signature) |
| `POST` | `/api/vouchers/:id/reject` | Director | Reject voucher (requires rejection reason) |

### 📊 Dashboard Metrics (`/api/dashboard`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | All authenticated | Role-tailored metrics & recent voucher activity |

### 🖼️ File Upload (`/api/upload`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/upload/signature` | Private | Upload image file (`multipart/form-data`) |
| `POST` | `/api/upload/signature-base64` | Private | Save digital canvas drawn signature |

---

## 7. Project Setup & Execution Guide

### 7.1 Clone and Directory Structure
```
expense-voucher-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/seed.js
│   │   └── server.js
│   ├── uploads/signatures/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

### 7.2 Running the Backend
1. Open terminal in `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Start the backend:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Note: If local MongoDB is not running, the backend automatically spins up an in-memory database with pre-populated demo records.*

3. (Optional) Run the database seed script directly:
   ```bash
   npm run seed
   ```

### 7.3 Running the Frontend
1. Open a new terminal in `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:5173`.

---

## 8. Demo Credentials

For instant evaluation, the login screen includes **1-Click Quick Demo Login buttons**:

| Role | Email | Password | Name | Department |
|---|---|---|---|---|
| **Employee** | `employee@abc.com` | `Password123!` | Sarah Jenkins | Engineering |
| **Director (Admin)** | `director@abc.com` | `Password123!` | Marcus Vance | Executive Board |
| **Accounts Team** | `accounts@abc.com` | `Password123!` | Elena Rostova | Accounts & Finance |

---

## 9. Validation & Business Rules

1. **Auto-Generated Voucher Numbers:** Formatted sequentially as `EV-YYYY-XXXX` (e.g. `EV-2026-0001`).
2. **Draft First:** All new vouchers are initially created in `Draft` status.
3. **Draft Mutability Only:** Employees may edit or delete vouchers **only** while in Draft status. Once submitted, they are strictly read-only.
4. **Mandatory Employee Signature:** A voucher cannot transition from Draft to Submitted without an employee signature.
5. **Director Exclusivity:** Only users with the `director` role can approve or reject claims.
6. **Mandatory Director Signature:** Approvals require an authorized signature.
7. **Mandatory Rejection Remarks:** Rejections require an explicit explanation for the employee.
8. **Role Isolation:** Employees can never view vouchers created by other employees.

---

## 10. Assumptions Made During Development

1. **Reimbursement Workflow:** Once approved by the Director, the voucher becomes available for payment processing by the Accounts Team without requiring further edits.
2. **Signatures:** Signatures can be uploaded as images (PNG/JPG/WebP) or drawn interactively directly in the browser via an integrated HTML5 canvas drawing pad.
3. **Database Portability:** To allow seamless reviewer evaluation on any machine without local MongoDB daemon dependencies, the backend includes an automated fallback to `mongodb-memory-server` alongside standard local/Atlas URI connections.

---

## 11. Bonus Points & Highlight Features

- ✅ **Advanced Search, Filter & Sort:** Search by Voucher #, Title, Employee Name, Department, Category, Status, Date Range, and Min/Max Amount.
- ✅ **Print-Ready Official Voucher:** Formatted document layout with company header, itemized amounts, signature boxes, and print styles (`@media print`).
- ✅ **Dual-Mode Signature Engine:** Supports both image file upload and canvas live-signature drawing.
- ✅ **Automated Test Suite:** Built-in verification script (`node test-api.js`) confirming health, authentication, RBAC, draft submission, and director approval.
