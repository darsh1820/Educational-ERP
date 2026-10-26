# Secure & Reliable Backend for Academic Precision ERP

An enterprise-grade, authoritative backend architecture engineered for institutional educational governance. This system pairs a full-stack Express server with persistent SQLite storage, strict Multi-Role Access Control (RBAC), end-to-end RESTful resource management for grades, multi-tier tuition billing, and attendance, and an immutable SHA-256 cryptographic audit trail.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through Phase 1 requirements clarification and govern this implementation:

- **Confirmed Persistence Architecture**: Full-stack Node.js / Express backend with a local, zero-latency persistent SQLite database (`better-sqlite3` or SQLite file-backed store via `sql.js` / `sqlite3`) mounted alongside the Vite development pipeline.
- **Confirmed Security & Access Control**: Multi-Role RBAC enforcing distinct permission gates for **Registrar** (full access), **Dean / Faculty** (curriculum & grades), **Bursar** (billing & financial settlements), and **Auditor** (read-only compliance & audit trails).
- **Confirmed Priority Features**: Complete RESTful CRUD APIs with transactional integrity for examinations, bursar ledger reconciliation, and daily roll-call attendance, coupled with an automated, tamper-proof cryptographic SHA-256 audit ledger.

---

## 1. Overview & Core Concept

### What It Does
Provides a high-throughput, ACID-compliant educational ERP backend that replaces client-only state with persistent server storage. Every change to student examination marks, fee collections, or classroom attendance records is validated against role permissions and stamped into an immutable audit journal.

### Target Personas & Roles
1. **University Registrar (Super-Admin)**: Manages university catalog, approves final grade publications, resolves student records, and oversees institutional audit readiness.
2. **Academic Dean / Faculty**: Edits examination scores, applies statistical bell curve adjustments, and submits grade rosters for official accreditation.
3. **Bursar Officer**: Posts student tuition remittances, reconciles payment plans, assesses lab and campus fees, and issues delinquency notices.
4. **Accreditation Auditor**: Inspects regulatory standards compliance (ABET, HLC, Title IV, FERPA) and verifies cryptographic audit hashes without write access.

### Key Value
- **Zero Data Loss**: State persists reliably across restarts and browser sessions in a structured relational database.
- **Regulatory Integrity**: Tamper-proof audit logs guarantee chain of custody required by federal Department of Education Title IV and FERPA statutory standards.
- **Role-Gated Actions**: Eliminates unauthorized modifications through cryptographically signed session tokens and route-level authorization guards.

---

## 2. User Experience & Visual Design

The existing high-density Academic Precision design system (`#2563eb` Royal Blue, `#0f172a` Scholastic Navy, and `#7c3aed` Academic Violet) remains authoritative and frictionless, enhanced with seamless backend status indicators:

### Key User Flows
1. **Role Persona Switcher & Session Authentication**:
   - A quiet, authoritative security banner in the top navigation bar displays the active officer identity, role permissions chip, and an instant Persona Switcher (e.g. switch between Dr. Evelyn Vance / Registrar, Prof. Claire Sterling / Dean, Marcus Sterling / Bursar, and Lead Auditor).
   - Unauthorized actions (e.g. Bursar trying to modify examination grades or Faculty attempting to waive tuition) display clear, non-destructive permission barriers with policy citations.

2. **Real-time Server State & Optimistic Mutation**:
   - Grade edits, payment settlements, and roll-call toggles execute with instant client feedback and background server sync.
   - A subtle network persistence chip displays `"Sync: SQLite Local / SHA-256 Verified"` in the bottom status rail.

3. **Live Cryptographic Audit Trail Inspector**:
   - An interactive Audit Ledger inspector view accessible to Auditors and Registrars, displaying timestamped actions, actor IDs, IP address simulation, affected entity, before/after values, and the SHA-256 cryptographic verification checksum.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Server Runtime Architecture
- **Chosen Approach**: Full-stack Express server in `server.ts` that mounts Vite middlewares in development (`npm run dev` via `tsx server.ts`) and serves production builds.
- **Why**: Allows instant zero-proxy client-server communication under the same origin (`/api/*`), fulfilling AI Studio container execution standards while enabling native Node.js filesystem access for SQLite database persistence.
- **Alternatives Considered**: In-memory mock server (rejected due to lack of persistence across reloads); Firebase or Cloud SQL (user explicitly selected local SQLite).

### Decision 2: Cryptographic Audit Hashing
- **Chosen Approach**: Append-only audit journal where each log entry contains `hash = SHA256(previousHash + timestamp + actorId + action + entityId + payload)`.
- **Why**: Produces a verifiable Merkle/blockchain-style tamper detection chain. Any external modification to previous grades or financial transactions breaks subsequent hash integrity, immediately visible in the audit inspector.

### Decision 3: Token-Based Role-Based Access Control (RBAC)
- **Chosen Approach**: Bearer authorization headers with signed HMAC tokens identifying user role and capabilities.
- **Why**: Clean separation of concerns, testable via standard REST clients and easy to inspect in UI persona switches without needing heavy third-party OAuth overhead.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React 19)                      │
│                                                                        │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Active Persona/Role   │  │   Global Views (Grades, Billing,     │  │
│  │   Context (RBAC State) │  │   Attendance, Audit, Directory)      │  │
│  └───────────┬────────────┘  └──────────────────┬───────────────────┘  │
└──────────────┼──────────────────────────────────┼──────────────────────┘
               │ Bearer Token / Role Headers      │ REST Requests (JSON)
               ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND (server.ts)                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security & RBAC Middleware: /api/* (Role Verification Guard)     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │   Grades API    │  │   Billing API    │  │   Attendance & Audit  │  │
│  │   /api/grades   │  │   /api/billing   │  │   /api/attendance     │  │
│  └────────┬────────┘  └─────────┬────────┘  └───────────┬───────────┘  │
│           │                     │                       │              │
│           └─────────────────────┼───────────────────────┘              │
│                                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Cryptographic Hash Interceptor: Computes SHA-256 for all mutations│ │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENT RELATIONAL SQLITE STORE                   │
│                                                                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────┐  │
│  │   students    │  │    courses    │  │ course_grades │  │ billing │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └─────────┘  │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │          attendance           │  │       audit_trail (hash)      │  │
│  └───────────────────────────────┘  └───────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Relational Schema Design
1. **`students`**: `id`, `name`, `email`, `department`, `program`, `cohortYear`, `standing`, `gpa`, `creditsCompleted`, `totalCreditsRequired`, `advisor`, `residency`
2. **`courses`**: `id`, `code`, `title`, `department`, `instructor`, `credits`, `term`, `enrolledCount`, `capacity`
3. **`course_grades`**: `id`, `studentId`, `courseId`, `midtermScore`, `finalExamScore`, `practicumScore`, `continuousScore`, `weightedTotal`, `letterGrade`, `status`, `lastModified`
4. **`billing_records`**: `id`, `studentId`, `invoiceNumber`, `tier`, `tuitionAssessment`, `fees`, `financialAidDeduction`, `netDue`, `paidAmount`, `remainingBalance`, `status`, `dueDate`, `lastPaymentDate`, `paymentMethod`
5. **`attendance_records`**: `id`, `studentId`, `courseId`, `date`, `status`, `notes`, `timeLogged`
6. **`audit_trail`**: `id`, `timestamp`, `actorId`, `actorRole`, `action`, `resource`, `resourceId`, `previousStateJson`, `newStateJson`, `previousHash`, `currentHash`

### RESTful API Route Endpoints
- `GET /api/health` - Server and SQLite connection telemetry & hash root
- `GET /api/auth/me` & `POST /api/auth/switch-role` - Identity & RBAC credentials
- `GET /api/students` & `GET /api/students/:id` - Full student dossier & transcripts
- `GET /api/grades` & `PUT /api/grades/:id` - Exam score editing & validation
- `POST /api/grades/batch-curve` - Institutional bell curve application
- `POST /api/grades/publish` - Official grade roster finalization (Registrar only)
- `GET /api/billing` & `POST /api/billing/reconcile` - Tuition settlement & ledger posting
- `GET /api/attendance` & `POST /api/attendance/mark` - Real-time classroom roll-call
- `GET /api/audit` - Read-only tamper-proof audit trail for regulatory compliance

### Interactive State Transitions & Component Mapping
- **`Sidebar.tsx` & `TopHeader.tsx`**: Integrated with active persona state, connection indicator, and live count sync.
- **`GradeBookView.tsx`**: Mutations sent to `PUT /api/grades/:id` with optimistic UI updates and validation error rollbacks.
- **`BillingLedgerView.tsx` & `NewPaymentModal.tsx`**: Submits payments to `/api/billing/reconcile` ensuring financial balance consistency.
- **`AttendanceMatrixView.tsx`**: Dispatches roll-call records to `/api/attendance/mark` with instant threshold recalculation.
- **`ComplianceView.tsx`**: Queries `/api/audit` to verify cryptographic root hash and display unalterable evidence logs.
