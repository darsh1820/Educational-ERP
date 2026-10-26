import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import initSqlJs, { Database } from 'sql.js';
import {
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_GRADES,
  INITIAL_BILLING,
  INITIAL_ATTENDANCE,
  INITIAL_COMPLIANCE,
} from '../data/mockData.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'academic_erp.sqlite');

let dbInstance: Database | null = null;

// Helper to save SQLite binary database to disk
export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

// Compute SHA-256 hash
export function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// Initialize SQLite database
export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      return dbInstance;
    } catch (err) {
      console.warn('Existing SQLite file corrupted or unreadable, reinitializing new database:', err);
    }
  }

  // Create new SQLite database and schema
  dbInstance = new SQL.Database();
  initializeSchemaAndSeed(dbInstance);
  saveDatabase();

  return dbInstance;
}

function initializeSchemaAndSeed(db: Database) {
  // Schema creation
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      department TEXT NOT NULL,
      program TEXT NOT NULL,
      cohort_year INTEGER NOT NULL,
      standing TEXT NOT NULL,
      gpa REAL NOT NULL,
      credits_completed INTEGER NOT NULL,
      total_credits_required INTEGER NOT NULL,
      advisor TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      residency TEXT NOT NULL,
      financial_aid_percent REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      instructor TEXT NOT NULL,
      credits INTEGER NOT NULL,
      term TEXT NOT NULL,
      enrolled_count INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      schedule TEXT,
      room TEXT
    );

    CREATE TABLE IF NOT EXISTS course_grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      course_code TEXT NOT NULL,
      course_title TEXT NOT NULL,
      midterm_score REAL NOT NULL,
      final_exam_score REAL NOT NULL,
      practicum_score REAL NOT NULL,
      continuous_score REAL NOT NULL,
      weighted_total REAL NOT NULL,
      letter_grade TEXT NOT NULL,
      status TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS billing_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      tier TEXT NOT NULL,
      tuition_assessment REAL NOT NULL,
      fees REAL NOT NULL,
      financial_aid_deduction REAL NOT NULL,
      net_due REAL NOT NULL,
      paid_amount REAL NOT NULL,
      remaining_balance REAL NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT NOT NULL,
      last_payment_date TEXT,
      payment_method TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      student_id TEXT PRIMARY KEY,
      total_sessions INTEGER NOT NULL,
      present_count INTEGER NOT NULL,
      late_count INTEGER NOT NULL,
      absent_count INTEGER NOT NULL,
      excused_count INTEGER NOT NULL,
      rate REAL NOT NULL,
      consecutive_absences INTEGER NOT NULL,
      requires_intervention INTEGER NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS compliance_standards (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      governing_body TEXT NOT NULL,
      description TEXT NOT NULL,
      compliance_rate REAL NOT NULL,
      status TEXT NOT NULL,
      last_audit_date TEXT NOT NULL,
      next_renewal_date TEXT NOT NULL,
      lead_officer TEXT NOT NULL,
      open_findings_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      details TEXT NOT NULL,
      prev_hash TEXT NOT NULL,
      curr_hash TEXT NOT NULL
    );
  `);

  // Seed initial students
  const insertStudentStmt = db.prepare(`
    INSERT INTO students (
      id, name, email, avatar, department, program, cohort_year,
      standing, gpa, credits_completed, total_credits_required,
      advisor, phone, address, residency, financial_aid_percent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_STUDENTS.forEach((s) => {
    insertStudentStmt.run([
      s.id,
      s.name,
      s.email,
      s.avatar,
      s.department,
      s.program,
      s.cohortYear,
      s.standing,
      s.gpa,
      s.creditsCompleted,
      s.totalCreditsRequired,
      s.advisor,
      s.phone,
      s.address,
      s.residency,
      s.financialAidPercent,
    ]);
  });
  insertStudentStmt.free();

  // Seed courses
  const insertCourseStmt = db.prepare(`
    INSERT INTO courses (
      id, code, title, department, instructor, credits, term,
      enrolled_count, capacity, schedule, room
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_COURSES.forEach((c) => {
    insertCourseStmt.run([
      c.id,
      c.code,
      c.title,
      c.department,
      c.instructor,
      c.credits,
      c.term,
      c.enrolledCount,
      c.capacity,
      c.schedule,
      c.room,
    ]);
  });
  insertCourseStmt.free();

  // Seed grades
  const insertGradeStmt = db.prepare(`
    INSERT INTO course_grades (
      id, student_id, course_id, course_code, course_title,
      midterm_score, final_exam_score, practicum_score, continuous_score,
      weighted_total, letter_grade, status, last_modified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_GRADES.forEach((g) => {
    insertGradeStmt.run([
      g.id,
      g.studentId,
      g.courseId,
      g.courseCode,
      g.courseTitle,
      g.midtermScore,
      g.finalExamScore,
      g.practicumScore,
      g.continuousScore,
      g.weightedTotal,
      g.letterGrade,
      g.status,
      g.lastModified,
    ]);
  });
  insertGradeStmt.free();

  // Seed billing
  const insertBillingStmt = db.prepare(`
    INSERT INTO billing_records (
      id, student_id, invoice_number, tier, tuition_assessment, fees,
      financial_aid_deduction, net_due, paid_amount, remaining_balance,
      status, due_date, last_payment_date, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_BILLING.forEach((b) => {
    insertBillingStmt.run([
      b.id,
      b.studentId,
      b.invoiceNumber,
      b.tier,
      b.tuitionAssessment,
      b.fees,
      b.financialAidDeduction,
      b.netDue,
      b.paidAmount,
      b.remainingBalance,
      b.status,
      b.dueDate,
      b.lastPaymentDate || null,
      b.paymentMethod || null,
    ]);
  });
  insertBillingStmt.free();

  // Seed attendance
  const insertAttendanceStmt = db.prepare(`
    INSERT INTO attendance_records (
      student_id, total_sessions, present_count, late_count, absent_count,
      excused_count, rate, consecutive_absences, requires_intervention
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_ATTENDANCE.forEach((a) => {
    insertAttendanceStmt.run([
      a.studentId,
      a.totalSessions,
      a.presentCount,
      a.lateCount,
      a.absentCount,
      a.excusedCount,
      a.rate,
      a.consecutiveAbsences,
      a.requiresIntervention ? 1 : 0,
    ]);
  });
  insertAttendanceStmt.free();

  // Seed compliance
  const insertComplianceStmt = db.prepare(`
    INSERT INTO compliance_standards (
      id, code, title, governing_body, description, compliance_rate,
      status, last_audit_date, next_renewal_date, lead_officer, open_findings_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  INITIAL_COMPLIANCE.forEach((c) => {
    insertComplianceStmt.run([
      c.id,
      c.code,
      c.title,
      c.governingBody,
      c.description,
      c.complianceRate,
      c.status,
      c.lastAuditDate,
      c.nextRenewalDate,
      c.leadOfficer,
      c.openFindingsCount,
    ]);
  });
  insertComplianceStmt.free();

  // Genesis audit log entry
  const genesisHash = computeSha256('GENESIS_BLOCK_ACADEMIC_PRECISION_ERP_SYSTEM');
  const initialLogHash = computeSha256(
    genesisHash +
      '::2026-10-26T00:00:00Z::SYSTEM_INIT::ALL::INITIAL_SEED'
  );

  db.run(`
    INSERT INTO audit_trail (
      timestamp, actor_id, actor_name, actor_role, action,
      resource, resource_id, details, prev_hash, curr_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    new Date().toISOString(),
    'SYSTEM',
    'Automated Registrar System Engine',
    'SYSTEM_CORE',
    'INITIALIZE_LEDGER',
    'SYSTEM',
    'DATABASE_SEED',
    'Initialized persistent SQLite institutional ledger with academic seed schemas.',
    genesisHash,
    initialLogHash,
  ]);
}

// Record an audit log entry in the immutable hash chain
export function recordAuditLog(
  db: Database,
  actor: { id: string; name: string; role: string },
  action: string,
  resource: string,
  resourceId: string,
  details: string
): string {
  const timestamp = new Date().toISOString();

  // Get previous hash
  const res = db.exec('SELECT curr_hash FROM audit_trail ORDER BY id DESC LIMIT 1;');
  let prevHash = 'GENESIS_ROOT_HASH';
  if (res.length > 0 && res[0].values.length > 0) {
    prevHash = String(res[0].values[0][0]);
  }

  const payload = `${prevHash}::${timestamp}::${actor.id}::${actor.role}::${action}::${resource}::${resourceId}::${details}`;
  const currHash = computeSha256(payload);

  db.run(`
    INSERT INTO audit_trail (
      timestamp, actor_id, actor_name, actor_role, action,
      resource, resource_id, details, prev_hash, curr_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    timestamp,
    actor.id,
    actor.name,
    actor.role,
    action,
    resource,
    resourceId,
    details,
    prevHash,
    currHash,
  ]);

  saveDatabase();
  return currHash;
}
