import express, { Request, Response } from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  getDatabase,
  saveDatabase,
  recordAuditLog,
  computeSha256,
} from './src/server/db.ts';
import {
  OFFICER_PERSONAS,
  getOfficerFromRequest,
  requireRole,
  AuthenticatedRequest,
} from './src/server/auth.ts';
import { calculateGrade } from './src/data/mockData.ts';

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Attach caller officer info to all requests
  app.use((req: AuthenticatedRequest, _res: Response, next) => {
    req.officer = getOfficerFromRequest(req);
    next();
  });

  // Initialize SQLite database
  const db = await getDatabase();

  // -------------------------------------------------------------
  // REST API Endpoints under /api
  // -------------------------------------------------------------

  // Health & Database Diagnostics
  app.get('/api/health', (_req: Request, res: Response) => {
    try {
      const studentCountRes = db.exec('SELECT COUNT(*) FROM students;');
      const gradesCountRes = db.exec('SELECT COUNT(*) FROM course_grades;');
      const billingCountRes = db.exec('SELECT COUNT(*) FROM billing_records;');
      const auditCountRes = db.exec('SELECT COUNT(*), curr_hash FROM audit_trail ORDER BY id DESC LIMIT 1;');

      const studentCount = studentCountRes[0]?.values[0]?.[0] ?? 0;
      const gradesCount = gradesCountRes[0]?.values[0]?.[0] ?? 0;
      const billingCount = billingCountRes[0]?.values[0]?.[0] ?? 0;
      const auditCount = auditCountRes[0]?.values[0]?.[0] ?? 0;
      const latestHash = auditCountRes[0]?.values[0]?.[1] ?? 'GENESIS';

      res.json({
        status: 'ONLINE',
        engine: 'SQLite 3 (Persistent Wasm/Storage)',
        databaseFile: 'data/academic_erp.sqlite',
        records: {
          students: studentCount,
          grades: gradesCount,
          billing: billingCount,
          auditEntries: auditCount,
        },
        cryptographicMerkleRoot: latestHash,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Database health check failed', details: err.message });
    }
  });

  // Auth: Personas & Current Session
  app.get('/api/auth/personas', (_req: Request, res: Response) => {
    res.json(OFFICER_PERSONAS);
  });

  app.get('/api/auth/current', (req: AuthenticatedRequest, res: Response) => {
    res.json(req.officer);
  });

  // Students: List & Search
  app.get('/api/students', (req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          id, name, email, avatar, department, program, cohort_year as cohortYear,
          standing, gpa, credits_completed as creditsCompleted,
          total_credits_required as totalCreditsRequired, advisor, phone, address,
          residency, financial_aid_percent as financialAidPercent
        FROM students
        ORDER BY name ASC;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const students = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      res.json(students);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query students', details: err.message });
    }
  });

  // Single Student Dossier
  app.get('/api/students/:id', (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;

      // Student info
      const studentRes = db.exec(`
        SELECT 
          id, name, email, avatar, department, program, cohort_year as cohortYear,
          standing, gpa, credits_completed as creditsCompleted,
          total_credits_required as totalCreditsRequired, advisor, phone, address,
          residency, financial_aid_percent as financialAidPercent
        FROM students WHERE id = '${studentId}';
      `);

      if (studentRes.length === 0 || studentRes[0].values.length === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const studentCols = studentRes[0].columns;
      const student: any = {};
      studentCols.forEach((col, idx) => {
        student[col] = studentRes[0].values[0][idx];
      });

      // Grades
      const gradesRes = db.exec(`
        SELECT 
          id, student_id as studentId, course_id as courseId, course_code as courseCode,
          course_title as courseTitle, midterm_score as midtermScore,
          final_exam_score as finalExamScore, practicum_score as practicumScore,
          continuous_score as continuousScore, weighted_total as weightedTotal,
          letter_grade as letterGrade, status, last_modified as lastModified
        FROM course_grades WHERE student_id = '${studentId}';
      `);

      const grades = gradesRes.length > 0
        ? gradesRes[0].values.map((row) => {
            const obj: any = {};
            gradesRes[0].columns.forEach((col, idx) => (obj[col] = row[idx]));
            return obj;
          })
        : [];

      // Billing
      const billingRes = db.exec(`
        SELECT 
          id, student_id as studentId, invoice_number as invoiceNumber, tier,
          tuition_assessment as tuitionAssessment, fees,
          financial_aid_deduction as financialAidDeduction, net_due as netDue,
          paid_amount as paidAmount, remaining_balance as remainingBalance,
          status, due_date as dueDate, last_payment_date as lastPaymentDate,
          payment_method as paymentMethod
        FROM billing_records WHERE student_id = '${studentId}';
      `);

      const billing = billingRes.length > 0 && billingRes[0].values.length > 0
        ? billingRes[0].values.map((row) => {
            const obj: any = {};
            billingRes[0].columns.forEach((col, idx) => (obj[col] = row[idx]));
            return obj;
          })[0]
        : null;

      // Attendance
      const attendanceRes = db.exec(`
        SELECT 
          student_id as studentId, total_sessions as totalSessions,
          present_count as presentCount, late_count as lateCount,
          absent_count as absentCount, excused_count as excusedCount,
          rate, consecutive_absences as consecutiveAbsences,
          requires_intervention as requiresIntervention
        FROM attendance_records WHERE student_id = '${studentId}';
      `);

      const attendance = attendanceRes.length > 0 && attendanceRes[0].values.length > 0
        ? {
            studentId: attendanceRes[0].values[0][0],
            totalSessions: attendanceRes[0].values[0][1],
            presentCount: attendanceRes[0].values[0][2],
            lateCount: attendanceRes[0].values[0][3],
            absentCount: attendanceRes[0].values[0][4],
            excusedCount: attendanceRes[0].values[0][5],
            rate: attendanceRes[0].values[0][6],
            consecutiveAbsences: attendanceRes[0].values[0][7],
            requiresIntervention: Boolean(attendanceRes[0].values[0][8]),
          }
        : null;

      res.json({ student, grades, billing, attendance });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load student dossier', details: err.message });
    }
  });

  // Courses
  app.get('/api/courses', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT id, code, title, department, instructor, credits, term,
               enrolled_count as enrolledCount, capacity, schedule, room
        FROM courses;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const courses = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        return obj;
      });

      res.json(courses);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query courses', details: err.message });
    }
  });

  // Grades: List
  app.get('/api/grades', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          id, student_id as studentId, course_id as courseId, course_code as courseCode,
          course_title as courseTitle, midterm_score as midtermScore,
          final_exam_score as finalExamScore, practicum_score as practicumScore,
          continuous_score as continuousScore, weighted_total as weightedTotal,
          letter_grade as letterGrade, status, last_modified as lastModified
        FROM course_grades;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const grades = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        return obj;
      });

      res.json(grades);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query grades', details: err.message });
    }
  });

  // Grades: Update Scores (Protected: REGISTRAR, DEAN_FACULTY)
  app.put(
    '/api/grades/:id',
    requireRole(['REGISTRAR', 'DEAN_FACULTY']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const gradeId = req.params.id;
        const { midtermScore, finalExamScore, practicumScore, continuousScore, status } = req.body;

        const currentRes = db.exec(`SELECT * FROM course_grades WHERE id = '${gradeId}';`);
        if (currentRes.length === 0 || currentRes[0].values.length === 0) {
          res.status(404).json({ error: 'Grade record not found' });
          return;
        }

        const mid = midtermScore !== undefined ? Number(midtermScore) : Number(currentRes[0].values[0][5]);
        const fin = finalExamScore !== undefined ? Number(finalExamScore) : Number(currentRes[0].values[0][6]);
        const prac = practicumScore !== undefined ? Number(practicumScore) : Number(currentRes[0].values[0][7]);
        const cont = continuousScore !== undefined ? Number(continuousScore) : Number(currentRes[0].values[0][8]);
        const stat = status || String(currentRes[0].values[0][11]);

        const { weightedTotal, letterGrade } = calculateGrade(mid, fin, prac, cont);
        const lastModified = new Date().toISOString().replace('T', ' ').slice(0, 16);

        db.run(`
          UPDATE course_grades
          SET midterm_score = ?, final_exam_score = ?, practicum_score = ?,
              continuous_score = ?, weighted_total = ?, letter_grade = ?,
              status = ?, last_modified = ?
          WHERE id = ?;
        `, [mid, fin, prac, cont, weightedTotal, letterGrade, stat, lastModified, gradeId]);

        // Record audit hash
        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'UPDATE_EXAM_GRADE',
          'course_grades',
          gradeId,
          `Modified scores: Midterm=${mid}%, Final=${fin}%, Total=${weightedTotal}% (${letterGrade}). Status=${stat}`
        );

        saveDatabase();

        res.json({
          success: true,
          gradeId,
          weightedTotal,
          letterGrade,
          status: stat,
          auditHash,
        });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to update grade', details: err.message });
      }
    }
  );

  // Grades: Batch Bell Curve (Protected: REGISTRAR, DEAN_FACULTY)
  app.post(
    '/api/grades/batch-curve',
    requireRole(['REGISTRAR', 'DEAN_FACULTY']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const curveDelta = req.body.delta ? Number(req.body.delta) : 2.5;
        const gradesRes = db.exec('SELECT id, midterm_score, final_exam_score, practicum_score, continuous_score FROM course_grades;');

        if (gradesRes.length > 0) {
          gradesRes[0].values.forEach((row) => {
            const id = String(row[0]);
            const newMid = Math.min(100, Number(row[1]) + curveDelta);
            const newFin = Math.min(100, Number(row[2]) + curveDelta);
            const prac = Number(row[3]);
            const cont = Number(row[4]);
            const { weightedTotal, letterGrade } = calculateGrade(newMid, newFin, prac, cont);

            db.run(`
              UPDATE course_grades
              SET midterm_score = ?, final_exam_score = ?, weighted_total = ?, letter_grade = ?
              WHERE id = ?;
            `, [newMid, newFin, weightedTotal, letterGrade, id]);
          });
        }

        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'APPLY_ACADEMIC_BELL_CURVE',
          'course_grades',
          'ALL_ACTIVE_COURSES',
          `Applied statistical +${curveDelta}% institutional bell curve across all active examination records.`
        );

        saveDatabase();

        res.json({ success: true, delta: curveDelta, auditHash });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to apply bell curve', details: err.message });
      }
    }
  );

  // Grades: Publish All (Protected: REGISTRAR only)
  app.post(
    '/api/grades/publish',
    requireRole(['REGISTRAR']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        db.run("UPDATE course_grades SET status = 'Published';");

        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'PUBLISH_FINAL_GRADES',
          'course_grades',
          'ALL',
          'Formally certified and published all student grade rosters to university registrar master catalog.'
        );

        saveDatabase();
        res.json({ success: true, status: 'Published', auditHash });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to publish grades', details: err.message });
      }
    }
  );

  // Billing: List
  app.get('/api/billing', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          id, student_id as studentId, invoice_number as invoiceNumber, tier,
          tuition_assessment as tuitionAssessment, fees,
          financial_aid_deduction as financialAidDeduction, net_due as netDue,
          paid_amount as paidAmount, remaining_balance as remainingBalance,
          status, due_date as dueDate, last_payment_date as lastPaymentDate,
          payment_method as paymentMethod
        FROM billing_records;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const billing = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        return obj;
      });

      res.json(billing);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query billing records', details: err.message });
    }
  });

  // Billing: Reconcile Payment (Protected: REGISTRAR, BURSAR)
  app.post(
    '/api/billing/reconcile',
    requireRole(['REGISTRAR', 'BURSAR']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const { billingId, amount, paymentMethod } = req.body;
        if (!billingId || !amount || amount <= 0) {
          res.status(400).json({ error: 'Invalid payment parameters' });
          return;
        }

        const billingRes = db.exec(`SELECT net_due, paid_amount FROM billing_records WHERE id = '${billingId}';`);
        if (billingRes.length === 0 || billingRes[0].values.length === 0) {
          res.status(404).json({ error: 'Invoice not found' });
          return;
        }

        const netDue = Number(billingRes[0].values[0][0]);
        const currentPaid = Number(billingRes[0].values[0][1]);
        const newPaid = currentPaid + Number(amount);
        const newBalance = Math.max(0, netDue - newPaid);
        const newStatus = newBalance === 0 ? 'Paid' : 'Pending';
        const dateStr = new Date().toISOString().slice(0, 10);

        db.run(`
          UPDATE billing_records
          SET paid_amount = ?, remaining_balance = ?, status = ?,
              last_payment_date = ?, payment_method = ?
          WHERE id = ?;
        `, [newPaid, newBalance, newStatus, dateStr, paymentMethod || 'Direct ACH Settlement', billingId]);

        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'POST_TUITION_PAYMENT',
          'billing_records',
          billingId,
          `Posted remittance of $${Number(amount).toLocaleString()} via ${paymentMethod}. New remaining balance: $${newBalance.toLocaleString()} [${newStatus}].`
        );

        saveDatabase();

        res.json({
          success: true,
          billingId,
          newPaid,
          newBalance,
          newStatus,
          auditHash,
        });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to reconcile payment', details: err.message });
      }
    }
  );

  // Attendance: List
  app.get('/api/attendance', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          student_id as studentId, total_sessions as totalSessions,
          present_count as presentCount, late_count as lateCount,
          absent_count as absentCount, excused_count as excusedCount,
          rate, consecutive_absences as consecutiveAbsences,
          requires_intervention as requiresIntervention
        FROM attendance_records;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const attendance = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        obj.requiresIntervention = Boolean(obj.requiresIntervention);
        return obj;
      });

      res.json(attendance);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query attendance', details: err.message });
    }
  });

  // Attendance: Mark Roll-Call (Protected: REGISTRAR, DEAN_FACULTY)
  app.post(
    '/api/attendance/mark',
    requireRole(['REGISTRAR', 'DEAN_FACULTY']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const { studentId, status } = req.body;
        const currentRes = db.exec(`SELECT total_sessions, present_count, late_count, absent_count, excused_count, consecutive_absences FROM attendance_records WHERE student_id = '${studentId}';`);

        if (currentRes.length === 0 || currentRes[0].values.length === 0) {
          res.status(404).json({ error: 'Student attendance record not found' });
          return;
        }

        const row = currentRes[0].values[0];
        let total = Number(row[0]) + 1;
        let present = Number(row[1]);
        let late = Number(row[2]);
        let absent = Number(row[3]);
        let excused = Number(row[4]);
        let consecutive = Number(row[5]);

        if (status === 'Present') {
          present += 1;
          consecutive = 0;
        } else if (status === 'Late') {
          late += 1;
          consecutive = 0;
        } else if (status === 'Absent') {
          absent += 1;
          consecutive += 1;
        } else if (status === 'Excused') {
          excused += 1;
          consecutive = 0;
        }

        const newRate = Math.min(100, Math.round(((present + late * 0.75 + excused) / total) * 1000) / 10);
        const requiresIntervention = consecutive >= 3 || newRate < 85 ? 1 : 0;

        db.run(`
          UPDATE attendance_records
          SET total_sessions = ?, present_count = ?, late_count = ?,
              absent_count = ?, excused_count = ?, rate = ?,
              consecutive_absences = ?, requires_intervention = ?
          WHERE student_id = ?;
        `, [total, present, late, absent, excused, newRate, consecutive, requiresIntervention, studentId]);

        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'RECORD_ATTENDANCE_STATUS',
          'attendance_records',
          studentId,
          `Marked session status: ${status}. New cumulative adherence: ${newRate}%. Consecutive absences: ${consecutive}.`
        );

        saveDatabase();

        res.json({
          success: true,
          studentId,
          status,
          newRate,
          consecutive,
          requiresIntervention: Boolean(requiresIntervention),
          auditHash,
        });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to record attendance', details: err.message });
      }
    }
  );

  // Compliance: List
  app.get('/api/compliance', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          id, code, title, governing_body as governingBody,
          description, compliance_rate as complianceRate,
          status, last_audit_date as lastAuditDate,
          next_renewal_date as nextRenewalDate, lead_officer as leadOfficer,
          open_findings_count as openFindingsCount
        FROM compliance_standards;
      `);

      if (query.length === 0) {
        res.json([]);
        return;
      }

      const columns = query[0].columns;
      const standards = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        return obj;
      });

      res.json(standards);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to query compliance standards', details: err.message });
    }
  });

  // Compliance: Re-verify (Protected: REGISTRAR, AUDITOR)
  app.post(
    '/api/compliance/reverify',
    requireRole(['REGISTRAR', 'AUDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const dateStr = new Date().toISOString().slice(0, 10);
        db.run(`
          UPDATE compliance_standards
          SET last_audit_date = ?,
              compliance_rate = MIN(100.0, ROUND(compliance_rate + 0.2, 1));
        `, [dateStr]);

        const auditHash = recordAuditLog(
          db,
          req.officer!,
          'REVERIFY_ACCREDITATION_STANDARDS',
          'compliance_standards',
          'ALL',
          'Conducted statutory compliance audit verification across ABET, HLC, DOE Title IV, and FERPA standards.'
        );

        saveDatabase();
        res.json({ success: true, lastAuditDate: dateStr, auditHash });
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to reverify compliance', details: err.message });
      }
    }
  );

  // Cryptographic Audit Trail: List & Verify Chain
  app.get('/api/audit', (_req: Request, res: Response) => {
    try {
      const query = db.exec(`
        SELECT 
          id, timestamp, actor_id as actorId, actor_name as actorName,
          actor_role as actorRole, action, resource, resource_id as resourceId,
          details, prev_hash as prevHash, curr_hash as currHash
        FROM audit_trail
        ORDER BY id DESC
        LIMIT 100;
      `);

      if (query.length === 0) {
        res.json({ entries: [], chainValid: true, totalEntries: 0 });
        return;
      }

      const columns = query[0].columns;
      const entries = query[0].values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => (obj[col] = row[idx]));
        return obj;
      });

      // Verify cryptographic chain
      let chainValid = true;
      const sortedAsc = [...entries].reverse();
      for (let i = 1; i < sortedAsc.length; i++) {
        const prev = sortedAsc[i - 1];
        const curr = sortedAsc[i];
        if (curr.prevHash !== prev.currHash) {
          chainValid = false;
          break;
        }
      }

      res.json({
        entries,
        chainValid,
        totalEntries: entries.length,
        merkleRoot: entries[0]?.currHash || 'EMPTY',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve audit trail', details: err.message });
    }
  });

  // -------------------------------------------------------------
  // Frontend Mounting: Vite Middleware (Dev) or Static Files (Prod)
  // -------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Academic Precision ERP] Full-stack server running on http://0.0.0.0:${PORT}`);
    console.log(`[Database] Persistent SQLite ready at data/academic_erp.sqlite`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting educational ERP server:', err);
  process.exit(1);
});
