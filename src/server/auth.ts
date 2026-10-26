import { Request, Response, NextFunction } from 'express';

export type UserRole = 'REGISTRAR' | 'DEAN_FACULTY' | 'BURSAR' | 'AUDITOR';

export interface OfficerPersona {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
  permissions: string[];
}

export const OFFICER_PERSONAS: OfficerPersona[] = [
  {
    id: 'OFFICER-001',
    name: 'Dr. Evelyn Vance',
    title: 'University Registrar',
    role: 'REGISTRAR',
    department: 'Office of Academic Records & Governance',
    avatarInitials: 'EV',
    permissions: [
      'students:read',
      'students:write',
      'grades:read',
      'grades:write',
      'grades:publish',
      'billing:read',
      'billing:reconcile',
      'attendance:read',
      'attendance:write',
      'compliance:read',
      'compliance:verify',
      'audit:read',
    ],
  },
  {
    id: 'OFFICER-002',
    name: 'Prof. Claire Sterling',
    title: 'Dean of Academic Affairs',
    role: 'DEAN_FACULTY',
    department: 'College Curriculum & Faculty Senate',
    avatarInitials: 'CS',
    permissions: [
      'students:read',
      'grades:read',
      'grades:write',
      'grades:curve',
      'attendance:read',
      'attendance:write',
      'billing:read',
      'compliance:read',
      'audit:read',
    ],
  },
  {
    id: 'OFFICER-003',
    name: 'Marcus Sterling',
    title: 'University Bursar',
    role: 'BURSAR',
    department: 'Treasury & Financial Accounts',
    avatarInitials: 'MS',
    permissions: [
      'students:read',
      'billing:read',
      'billing:write',
      'billing:reconcile',
      'attendance:read',
      'grades:read',
      'compliance:read',
      'audit:read',
    ],
  },
  {
    id: 'OFFICER-004',
    name: 'Sarah Jenkins',
    title: 'Lead Accreditation Auditor',
    role: 'AUDITOR',
    department: 'State Board of Regents & ABET',
    avatarInitials: 'SJ',
    permissions: [
      'students:read',
      'grades:read',
      'billing:read',
      'attendance:read',
      'compliance:read',
      'compliance:verify',
      'audit:read',
      'audit:verify',
    ],
  },
];

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  officer?: OfficerPersona;
}

// Extract current officer from headers
export function getOfficerFromRequest(req: Request): OfficerPersona {
  const roleHeader = req.headers['x-officer-role'] as string;
  const officerId = req.headers['x-officer-id'] as string;

  if (officerId) {
    const matched = OFFICER_PERSONAS.find((p) => p.id === officerId);
    if (matched) return matched;
  }

  if (roleHeader) {
    const matched = OFFICER_PERSONAS.find((p) => p.role === roleHeader);
    if (matched) return matched;
  }

  // Default to Registrar for seamless workflow
  return OFFICER_PERSONAS[0];
}

// RBAC Middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const officer = getOfficerFromRequest(req);
    req.officer = officer;

    if (!allowedRoles.includes(officer.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient Institutional Permissions',
        message: `Role '${officer.role}' (${officer.title}) is not authorized to execute this operation. Required roles: [${allowedRoles.join(', ')}]`,
        requiredRoles: allowedRoles,
        currentRole: officer.role,
      });
      return;
    }

    next();
  };
}
