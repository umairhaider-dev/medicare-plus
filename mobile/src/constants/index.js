// In EAS builds, EXPO_PUBLIC_API_URL is set in eas.json → build → env
// During local dev with Expo Go, falls back to your machine's IP
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.121:5000/api';

export const COLORS = {
  primary:    '#0d9488',
  primaryDark:'#0f766e',
  primaryLight:'#f0fdfa',
  navy:       '#0c1a2e',
  navy2:      '#162032',
  white:      '#ffffff',
  bg:         '#f1f5f9',
  border:     '#e2e8f0',
  text:       '#0c1a2e',
  muted:      '#64748b',
  slate:      '#334155',
  red:        '#ef4444',
  amber:      '#f59e0b',
  green:      '#22c55e',
  blue:       '#3b82f6',
  purple:     '#8b5cf6',
};

export const FONTS = {
  regular: 'System',
  medium:  'System',
  bold:    'System',
};

export const ROLES = {
  ADMIN:        'ADMIN',
  DOCTOR:       'DOCTOR',
  PHARMACIST:   'PHARMACIST',
  RECEPTIONIST: 'RECEPTIONIST',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  WAITING:   'WAITING',
  IN_ROOM:   'IN_ROOM',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW:   'NO_SHOW',
};

export const STATUS_COLORS = {
  SCHEDULED: '#3b82f6',
  WAITING:   '#f59e0b',
  IN_ROOM:   '#8b5cf6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
  NO_SHOW:   '#64748b',
};

export const DOCUMENT_TYPES = [
  'XRAY',
  'LAB_REPORT',
  'PRESCRIPTION',
  'DISCHARGE',
  'CONSENT',
  'OTHER',
];

export const VISIT_TYPES = [
  'OPD',
  'FOLLOWUP',
  'EMERGENCY',
  'LAB_ONLY',
  'PROCEDURE',
];

export const PAYMENT_MODES = [
  'CASH',
  'CARD',
  'BANK_TRANSFER',
  'CREDIT',
];