export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const HOSPITAL_NAME = 'Dubai Premier Medical Center'
export const HOSPITAL_SHORT = 'DPMC'
export const HOSPITAL_TAGLINE = 'Excellence in Healthcare — Powered by MediCare Pro'

export const DEPARTMENTS = [
  'Emergency', 'ICU', 'Cardiology', 'Neurology', 'Oncology',
  'Orthopedics', 'Pediatrics', 'Obstetrics', 'General Surgery',
  'Internal Medicine', 'Radiology', 'Laboratory', 'Pharmacy',
  'Physiotherapy', 'Psychiatry', 'Dermatology', 'ENT', 'Ophthalmology',
]

export const BLOOD_TYPES = ['A+','A-','B+','B-','O+','O-','AB+','AB-']

export const ESI_LEVELS = {
  1: { label: 'Resuscitation', color: '#ef4444', bg: 'esi-1', desc: 'Immediate life-threatening' },
  2: { label: 'Emergent',      color: '#f97316', bg: 'esi-2', desc: 'High risk, confused, severe pain' },
  3: { label: 'Urgent',        color: '#f59e0b', bg: 'esi-3', desc: 'Requires multiple resources' },
  4: { label: 'Less Urgent',   color: '#22c55e', bg: 'esi-4', desc: 'One resource needed' },
  5: { label: 'Non-Urgent',    color: '#3b82f6', bg: 'esi-5', desc: 'No resources anticipated' },
}

export const BED_STATUS = {
  available: { label: 'Available', css: 'bed-available' },
  occupied:  { label: 'Occupied',  css: 'bed-occupied'  },
  reserved:  { label: 'Reserved',  css: 'bed-reserved'  },
  cleaning:  { label: 'Cleaning',  css: 'bed-cleaning'  },
  icu:       { label: 'ICU',       css: 'bed-icu'       },
}

export const APPOINTMENT_STATUS = {
  SCHEDULED:  { label: 'Scheduled',  badge: 'badge-blue'   },
  WAITING:    { label: 'Waiting',    badge: 'badge-gold'   },
  IN_PROGRESS:{ label: 'In Progress',badge: 'badge-purple' },
  COMPLETED:  { label: 'Completed',  badge: 'badge-green'  },
  CANCELLED:  { label: 'Cancelled',  badge: 'badge-gray'   },
  NO_SHOW:    { label: 'No Show',    badge: 'badge-red'    },
}

export const INSURANCE_PROVIDERS = [
  'DHA (Dubai Health Authority)', 'Daman', 'Thiqa', 'ADNIC',
  'AXA Gulf', 'Oman Insurance', 'Emirates Insurance', 'Al Ain Ahlia',
  'Watania', 'GIG Gulf', 'Self-Pay',
]

export const LAB_CATEGORIES = [
  'Hematology', 'Biochemistry', 'Microbiology', 'Immunology',
  'Pathology', 'Virology', 'Toxicology', 'Coagulation',
]

export const ROLES = {
  ADMIN:        'Administrator',
  DOCTOR:       'Doctor',
  NURSE:        'Nurse',
  PHARMACIST:   'Pharmacist',
  LAB_TECH:     'Lab Technician',
  RADIOLOGIST:  'Radiologist',
  RECEPTIONIST: 'Receptionist',
  BILLING:      'Billing Officer',
}

export const CHART_COLORS = {
  blue:   '#0ea5e9',
  gold:   '#f59e0b',
  green:  '#10b981',
  red:    '#ef4444',
  purple: '#8b5cf6',
  teal:   '#14b8a6',
  orange: '#f97316',
  pink:   '#ec4899',
}
