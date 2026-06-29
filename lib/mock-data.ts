// Comprehensive mock data for Hospital Management System - Guatemala

// ============ TYPES ============
export interface User {
  id: string
  name: string
  email: string
  role:
  | "super_admin"
  | "admin"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "receptionist"
  | "lab_technician"
  | "billing_staff"
  | "warehouse_manager"
  avatar: string
  status: "active" | "inactive"
  lastLogin: string
  phone: string
  specialty?: string
}

export interface Patient {
  id: string
  fileNumber: string
  firstName: string
  lastName: string
  dpi: string
  birthDate: string
  age: number
  gender: "M" | "F"
  bloodType: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  allergies: string[]
  chronicConditions: string[]
  currentMedications: string[]
  insuranceProvider?: string
  insuranceNumber?: string
  lastVisit: string
  hasActiveCase: boolean
}

export interface CaseFile {
  id: string
  caseNumber: string
  patientId: string
  patientName: string
  admissionDate: string
  stage: "emergency" | "consultation" | "hospitalized" | "surgery" | "recovery" | "discharged"
  primaryDoctor: string
  assignedRoom?: string
  totalCost: number
  paidAmount: number
  notes: string
}

export interface Product {
  id: string
  code: string
  name: string
  category: "medications" | "surgical_supplies" | "lab_supplies" | "medical_equipment" | "ppe"
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  expirationDate?: string
  warehouseId: string
  requiresPrescription: boolean
}

export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  paymentTerms: "immediate" | "30_days" | "60_days" | "90_days"
  currentBalance: number
  creditLimit: number
  status: "active" | "inactive"
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  date: string
  status: "draft" | "pending" | "approved" | "received" | "cancelled"
  totalAmount: number
  paymentTerms: string
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[]
}

export interface Invoice {
  id: string
  invoiceNumber: string
  patientId: string
  patientName: string
  caseFileId?: string
  date: string
  dueDate: string
  items: { description: string; quantity: number; unitPrice: number }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paidAmount: number
  status: "paid" | "partial" | "pending" | "overdue" | "cancelled"
}

export interface Payment {
  id: string
  paymentNumber: string
  date: string
  category: "patient" | "supplier"
  payerPayee: string
  amount: number
  method: "cash" | "card" | "transfer" | "check" | "insurance"
  referenceNumber?: string
  status: "completed" | "pending" | "failed"
}

export interface PharmacySale {
  id: string
  transactionNumber: string
  date: string
  customerName?: string
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "transfer"
  hasPrescription: boolean
}

export interface Room {
  id: string
  number: string
  type: "standard" | "semi_private" | "private" | "icu" | "operating" | "emergency"
  floor: number
  dailyRate: number
  status: "available" | "occupied" | "maintenance" | "reserved"
  currentPatient?: string
}

export interface Operation {
  id: string
  name: string
  complexity: "minor" | "intermediate" | "major" | "critical"
  estimatedDuration: number
  baseCost: number
  preRequirements: string[]
  postRequirements: string[]
}

export interface ScheduledOperation {
  id: string
  operationId: string
  operationName: string
  patientId: string
  patientName: string
  date: string
  time: string
  primarySurgeon: string
  team: string[]
  room: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
}

export interface Warehouse {
  id: string
  name: string
  location: string
  manager: string
  capacity: number
  currentUsage: number
}

export interface MedicalPackage {
  id: string
  name: string
  description: string
  services: { name: string; quantity: number }[]
  includesRoom: boolean
  validityDays: number
  totalPrice: number
  status: "active" | "inactive"
}

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export type Prescription = {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  date: string;
  medications: Medication[];
  status: 'pending' | 'dispensed' | 'partial' | 'cancelled' | 'expired';
  diagnosis: string;
  notes?: string;
};


// ============ MOCK DATA ============

export const users: User[] = [
  {
    id: "1",
    name: "Dr. Carlos Mendoza",
    email: "carlos.mendoza@medicare.gt",
    role: "super_admin",
    avatar: "/doctor-male-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 08:30",
    phone: "+502 5555-1234",
    specialty: "Administración",
  },
  {
    id: "2",
    name: "Dra. María Fernanda García",
    email: "maria.garcia@medicare.gt",
    role: "doctor",
    avatar: "/female-doctor-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 07:45",
    phone: "+502 5555-2345",
    specialty: "Cardiología",
  },
  {
    id: "3",
    name: "Dr. Juan Pablo López",
    email: "juan.lopez@medicare.gt",
    role: "doctor",
    avatar: "/professional-male-doctor.png",
    status: "active",
    lastLogin: "2024-01-15 08:00",
    phone: "+502 5555-3456",
    specialty: "Medicina General",
  },
  {
    id: "4",
    name: "Dra. Ana Lucía Pérez",
    email: "ana.perez@medicare.gt",
    role: "doctor",
    avatar: "/female-doctor-latina.jpg",
    status: "active",
    lastLogin: "2024-01-14 16:30",
    phone: "+502 5555-4567",
    specialty: "Pediatría",
  },
  {
    id: "5",
    name: "Dr. Roberto Castillo",
    email: "roberto.castillo@medicare.gt",
    role: "doctor",
    avatar: "/male-surgeon-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 06:00",
    phone: "+502 5555-5678",
    specialty: "Cirugía General",
  },
  {
    id: "6",
    name: "Lic. Carmen Rodríguez",
    email: "carmen.rodriguez@medicare.gt",
    role: "nurse",
    avatar: "/female-nurse-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 07:00",
    phone: "+502 5555-6789",
  },
  {
    id: "7",
    name: "Lic. Pedro Morales",
    email: "pedro.morales@medicare.gt",
    role: "nurse",
    avatar: "/male-nurse-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 07:15",
    phone: "+502 5555-7890",
  },
  {
    id: "8",
    name: "Lic. Sofía Hernández",
    email: "sofia.hernandez@medicare.gt",
    role: "pharmacist",
    avatar: "/female-pharmacist-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 08:00",
    phone: "+502 5555-8901",
  },
  {
    id: "9",
    name: "Andrea Martínez",
    email: "andrea.martinez@medicare.gt",
    role: "receptionist",
    avatar: "/female-receptionist-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 07:30",
    phone: "+502 5555-9012",
  },
  {
    id: "10",
    name: "Lic. Diego Ramírez",
    email: "diego.ramirez@medicare.gt",
    role: "lab_technician",
    avatar: "/male-lab-technician-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 07:45",
    phone: "+502 5555-0123",
  },
  {
    id: "11",
    name: "Patricia Gómez",
    email: "patricia.gomez@medicare.gt",
    role: "billing_staff",
    avatar: "/female-accountant-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 08:15",
    phone: "+502 5555-1235",
  },
  {
    id: "12",
    name: "Miguel Sánchez",
    email: "miguel.sanchez@medicare.gt",
    role: "warehouse_manager",
    avatar: "/male-warehouse-manager.jpg",
    status: "active",
    lastLogin: "2024-01-15 06:30",
    phone: "+502 5555-2346",
  },
  {
    id: "13",
    name: "Dr. Fernando Juárez",
    email: "fernando.juarez@medicare.gt",
    role: "doctor",
    avatar: "/male-doctor-elderly.jpg",
    status: "active",
    lastLogin: "2024-01-14 18:00",
    phone: "+502 5555-3457",
    specialty: "Traumatología",
  },
  {
    id: "14",
    name: "Dra. Claudia Vásquez",
    email: "claudia.vasquez@medicare.gt",
    role: "doctor",
    avatar: "/female-doctor-professional-glasses.jpg",
    status: "inactive",
    lastLogin: "2024-01-10 12:00",
    phone: "+502 5555-4568",
    specialty: "Ginecología",
  },
  {
    id: "15",
    name: "Luis Alejandro Torres",
    email: "luis.torres@medicare.gt",
    role: "admin",
    avatar: "/male-administrator-professional.jpg",
    status: "active",
    lastLogin: "2024-01-15 08:45",
    phone: "+502 5555-5679",
  },
]

export const patients: Patient[] = [
  {
    id: "1",
    fileNumber: "EXP-2024-0001",
    firstName: "José",
    lastName: "García Mendoza",
    dpi: "1234 56789 0101",
    birthDate: "1985-03-15",
    age: 38,
    gender: "M",
    bloodType: "O+",
    phone: "+502 4123-4567",
    email: "jose.garcia@email.com",
    address: "Zona 10, Ciudad de Guatemala",
    emergencyContact: "María García",
    emergencyPhone: "+502 4123-4568",
    allergies: ["Penicilina"],
    chronicConditions: ["Hipertensión"],
    currentMedications: ["Losartán 50mg"],
    insuranceProvider: "Seguros G&T",
    insuranceNumber: "SGT-123456",
    lastVisit: "2024-01-15",
    hasActiveCase: true,
  },
  {
    id: "2",
    fileNumber: "EXP-2024-0002",
    firstName: "Ana María",
    lastName: "López Pérez",
    dpi: "2345 67890 0102",
    birthDate: "1992-07-22",
    age: 31,
    gender: "F",
    bloodType: "A+",
    phone: "+502 5234-5678",
    email: "ana.lopez@email.com",
    address: "Zona 15, Ciudad de Guatemala",
    emergencyContact: "Pedro López",
    emergencyPhone: "+502 5234-5679",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    insuranceProvider: "El Roble",
    insuranceNumber: "ER-234567",
    lastVisit: "2024-01-14",
    hasActiveCase: true,
  },
  {
    id: "3",
    fileNumber: "EXP-2024-0003",
    firstName: "Carlos",
    lastName: "Martínez Hernández",
    dpi: "3456 78901 0103",
    birthDate: "1978-11-30",
    age: 45,
    gender: "M",
    bloodType: "B+",
    phone: "+502 3345-6789",
    email: "carlos.martinez@email.com",
    address: "Zona 1, Mixco",
    emergencyContact: "Rosa Martínez",
    emergencyPhone: "+502 3345-6790",
    allergies: ["Sulfas", "Mariscos"],
    chronicConditions: ["Diabetes Tipo 2", "Hipertensión"],
    currentMedications: ["Metformina 850mg", "Enalapril 10mg"],
    lastVisit: "2024-01-13",
    hasActiveCase: true,
  },
  {
    id: "4",
    fileNumber: "EXP-2024-0004",
    firstName: "Lucía",
    lastName: "Ramírez Castillo",
    dpi: "4567 89012 0104",
    birthDate: "2015-05-10",
    age: 8,
    gender: "F",
    bloodType: "O-",
    phone: "+502 4456-7890",
    email: "lucia.ramirez@email.com",
    address: "Zona 7, Ciudad de Guatemala",
    emergencyContact: "Juan Ramírez",
    emergencyPhone: "+502 4456-7891",
    allergies: [],
    chronicConditions: ["Asma"],
    currentMedications: ["Salbutamol PRN"],
    insuranceProvider: "Seguros Universal",
    insuranceNumber: "SU-345678",
    lastVisit: "2024-01-15",
    hasActiveCase: false,
  },
  {
    id: "5",
    fileNumber: "EXP-2024-0005",
    firstName: "Roberto",
    lastName: "Juárez Morales",
    dpi: "5678 90123 0105",
    birthDate: "1965-08-25",
    age: 58,
    gender: "M",
    bloodType: "AB+",
    phone: "+502 5567-8901",
    email: "roberto.juarez@email.com",
    address: "Zona 11, Ciudad de Guatemala",
    emergencyContact: "Carmen Juárez",
    emergencyPhone: "+502 5567-8902",
    allergies: ["Aspirina"],
    chronicConditions: ["Artritis", "Hipertensión"],
    currentMedications: ["Prednisona 5mg", "Amlodipino 5mg"],
    lastVisit: "2024-01-12",
    hasActiveCase: true,
  },
  {
    id: "6",
    fileNumber: "EXP-2024-0006",
    firstName: "María Elena",
    lastName: "Vásquez Torres",
    dpi: "6789 01234 0106",
    birthDate: "1988-02-14",
    age: 35,
    gender: "F",
    bloodType: "A-",
    phone: "+502 6678-9012",
    email: "maria.vasquez@email.com",
    address: "Zona 14, Ciudad de Guatemala",
    emergencyContact: "Luis Vásquez",
    emergencyPhone: "+502 6678-9013",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    insuranceProvider: "Mapfre",
    insuranceNumber: "MP-456789",
    lastVisit: "2024-01-14",
    hasActiveCase: true,
  },
  {
    id: "7",
    fileNumber: "EXP-2024-0007",
    firstName: "Pedro",
    lastName: "Gómez Sánchez",
    dpi: "7890 12345 0107",
    birthDate: "1955-12-01",
    age: 68,
    gender: "M",
    bloodType: "B-",
    phone: "+502 7789-0123",
    email: "pedro.gomez@email.com",
    address: "Zona 5, Villa Nueva",
    emergencyContact: "Ana Gómez",
    emergencyPhone: "+502 7789-0124",
    allergies: ["Contraste yodado"],
    chronicConditions: ["Insuficiencia Cardíaca", "Diabetes Tipo 2"],
    currentMedications: ["Furosemida 40mg", "Digoxina 0.25mg", "Insulina NPH"],
    lastVisit: "2024-01-15",
    hasActiveCase: true,
  },
  {
    id: "8",
    fileNumber: "EXP-2024-0008",
    firstName: "Sofía",
    lastName: "Hernández López",
    dpi: "8901 23456 0108",
    birthDate: "1995-09-18",
    age: 28,
    gender: "F",
    bloodType: "O+",
    phone: "+502 8890-1234",
    email: "sofia.hernandez@email.com",
    address: "Zona 16, Ciudad de Guatemala",
    emergencyContact: "Jorge Hernández",
    emergencyPhone: "+502 8890-1235",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    lastVisit: "2024-01-11",
    hasActiveCase: false,
  },
  {
    id: "9",
    fileNumber: "EXP-2024-0009",
    firstName: "Fernando",
    lastName: "Castillo Pérez",
    dpi: "9012 34567 0109",
    birthDate: "1970-04-05",
    age: 53,
    gender: "M",
    bloodType: "A+",
    phone: "+502 9901-2345",
    email: "fernando.castillo@email.com",
    address: "Zona 12, Ciudad de Guatemala",
    emergencyContact: "Martha Castillo",
    emergencyPhone: "+502 9901-2346",
    allergies: ["Látex"],
    chronicConditions: ["EPOC"],
    currentMedications: ["Tiotropio 18mcg", "Salbutamol PRN"],
    insuranceProvider: "Seguros G&T",
    insuranceNumber: "SGT-567890",
    lastVisit: "2024-01-10",
    hasActiveCase: true,
  },
  {
    id: "10",
    fileNumber: "EXP-2024-0010",
    firstName: "Andrea",
    lastName: "Morales Juárez",
    dpi: "0123 45678 0110",
    birthDate: "2000-01-20",
    age: 24,
    gender: "F",
    bloodType: "B+",
    phone: "+502 3012-3456",
    email: "andrea.morales@email.com",
    address: "Zona 18, Ciudad de Guatemala",
    emergencyContact: "Rosa Juárez",
    emergencyPhone: "+502 3012-3457",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    lastVisit: "2024-01-09",
    hasActiveCase: false,
  },
]

export const caseFiles: CaseFile[] = [
  {
    id: "1",
    caseNumber: "CASO-2024-001",
    patientId: "1",
    patientName: "José García Mendoza",
    admissionDate: "2024-01-15",
    stage: "hospitalized",
    primaryDoctor: "Dra. María Fernanda García",
    assignedRoom: "301",
    totalCost: 12500.0,
    paidAmount: 5000.0,
    notes: "Paciente ingresado por dolor torácico. En observación cardíaca.",
  },
  {
    id: "2",
    caseNumber: "CASO-2024-002",
    patientId: "2",
    patientName: "Ana María López Pérez",
    admissionDate: "2024-01-14",
    stage: "surgery",
    primaryDoctor: "Dr. Roberto Castillo",
    assignedRoom: "QX-01",
    totalCost: 35000.0,
    paidAmount: 20000.0,
    notes: "Colecistectomía laparoscópica programada.",
  },
  {
    id: "3",
    caseNumber: "CASO-2024-003",
    patientId: "3",
    patientName: "Carlos Martínez Hernández",
    admissionDate: "2024-01-13",
    stage: "recovery",
    primaryDoctor: "Dr. Juan Pablo López",
    assignedRoom: "205",
    totalCost: 8500.0,
    paidAmount: 8500.0,
    notes: "Recuperación post-crisis hiperglucémica. Evolución favorable.",
  },
  {
    id: "4",
    caseNumber: "CASO-2024-004",
    patientId: "5",
    patientName: "Roberto Juárez Morales",
    admissionDate: "2024-01-12",
    stage: "hospitalized",
    primaryDoctor: "Dr. Fernando Juárez",
    assignedRoom: "402",
    totalCost: 15750.0,
    paidAmount: 7000.0,
    notes: "Fractura de cadera. Pendiente cirugía ortopédica.",
  },
  {
    id: "5",
    caseNumber: "CASO-2024-005",
    patientId: "6",
    patientName: "María Elena Vásquez Torres",
    admissionDate: "2024-01-14",
    stage: "consultation",
    primaryDoctor: "Dra. Ana Lucía Pérez",
    totalCost: 450.0,
    paidAmount: 450.0,
    notes: "Consulta de seguimiento prenatal.",
  },
  {
    id: "6",
    caseNumber: "CASO-2024-006",
    patientId: "7",
    patientName: "Pedro Gómez Sánchez",
    admissionDate: "2024-01-15",
    stage: "emergency",
    primaryDoctor: "Dra. María Fernanda García",
    assignedRoom: "UCI-03",
    totalCost: 28000.0,
    paidAmount: 10000.0,
    notes: "Ingreso de emergencia por descompensación cardíaca.",
  },
  {
    id: "7",
    caseNumber: "CASO-2024-007",
    patientId: "9",
    patientName: "Fernando Castillo Pérez",
    admissionDate: "2024-01-10",
    stage: "hospitalized",
    primaryDoctor: "Dr. Juan Pablo López",
    assignedRoom: "108",
    totalCost: 9200.0,
    paidAmount: 4600.0,
    notes: "Exacerbación de EPOC. Tratamiento con oxigenoterapia.",
  },
]

export const products: Product[] = [
  {
    id: "1",
    code: "MED-001",
    name: "Paracetamol 500mg",
    category: "medications",
    unit: "Tableta",
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    unitPrice: 0.5,
    warehouseId: "2",
    requiresPrescription: false,
  },
  {
    id: "2",
    code: "MED-002",
    name: "Ibuprofeno 400mg",
    category: "medications",
    unit: "Tableta",
    currentStock: 1800,
    minStock: 400,
    maxStock: 4000,
    unitPrice: 0.75,
    warehouseId: "2",
    requiresPrescription: false,
  },
  {
    id: "3",
    code: "MED-003",
    name: "Amoxicilina 500mg",
    category: "medications",
    unit: "Cápsula",
    currentStock: 320,
    minStock: 300,
    maxStock: 2000,
    unitPrice: 1.25,
    expirationDate: "2024-06-15",
    warehouseId: "2",
    requiresPrescription: true,
  },
  {
    id: "4",
    code: "MED-004",
    name: "Omeprazol 20mg",
    category: "medications",
    unit: "Cápsula",
    currentStock: 1200,
    minStock: 300,
    maxStock: 3000,
    unitPrice: 0.85,
    warehouseId: "2",
    requiresPrescription: false,
  },
  {
    id: "5",
    code: "MED-005",
    name: "Metformina 850mg",
    category: "medications",
    unit: "Tableta",
    currentStock: 150,
    minStock: 200,
    maxStock: 2000,
    unitPrice: 0.65,
    warehouseId: "2",
    requiresPrescription: true,
  },
  {
    id: "6",
    code: "MED-006",
    name: "Losartán 50mg",
    category: "medications",
    unit: "Tableta",
    currentStock: 890,
    minStock: 250,
    maxStock: 2500,
    unitPrice: 0.9,
    warehouseId: "2",
    requiresPrescription: true,
  },
  {
    id: "7",
    code: "MED-007",
    name: "Insulina NPH 100UI",
    category: "medications",
    unit: "Frasco",
    currentStock: 45,
    minStock: 50,
    maxStock: 200,
    unitPrice: 125.0,
    expirationDate: "2024-03-20",
    warehouseId: "2",
    requiresPrescription: true,
  },
  {
    id: "8",
    code: "SUR-001",
    name: "Guantes Quirúrgicos Estériles",
    category: "surgical_supplies",
    unit: "Par",
    currentStock: 850,
    minStock: 200,
    maxStock: 2000,
    unitPrice: 8.5,
    warehouseId: "3",
    requiresPrescription: false,
  },
  {
    id: "9",
    code: "SUR-002",
    name: "Sutura Vicryl 3-0",
    category: "surgical_supplies",
    unit: "Unidad",
    currentStock: 120,
    minStock: 100,
    maxStock: 500,
    unitPrice: 45.0,
    warehouseId: "3",
    requiresPrescription: false,
  },
  {
    id: "10",
    code: "SUR-003",
    name: "Bisturí Desechable #15",
    category: "surgical_supplies",
    unit: "Unidad",
    currentStock: 75,
    minStock: 100,
    maxStock: 400,
    unitPrice: 12.0,
    warehouseId: "3",
    requiresPrescription: false,
  },
  {
    id: "11",
    code: "LAB-001",
    name: "Tubos de Ensayo 10ml",
    category: "lab_supplies",
    unit: "Unidad",
    currentStock: 2000,
    minStock: 500,
    maxStock: 5000,
    unitPrice: 0.35,
    warehouseId: "1",
    requiresPrescription: false,
  },
  {
    id: "12",
    code: "LAB-002",
    name: "Reactivo Glucosa",
    category: "lab_supplies",
    unit: "Kit",
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unitPrice: 350.0,
    expirationDate: "2024-04-30",
    warehouseId: "1",
    requiresPrescription: false,
  },
  {
    id: "13",
    code: "EQU-001",
    name: "Tensiómetro Digital",
    category: "medical_equipment",
    unit: "Unidad",
    currentStock: 15,
    minStock: 5,
    maxStock: 30,
    unitPrice: 450.0,
    warehouseId: "1",
    requiresPrescription: false,
  },
  {
    id: "14",
    code: "PPE-001",
    name: "Mascarilla N95",
    category: "ppe",
    unit: "Unidad",
    currentStock: 500,
    minStock: 300,
    maxStock: 2000,
    unitPrice: 15.0,
    warehouseId: "1",
    requiresPrescription: false,
  },
  {
    id: "15",
    code: "PPE-002",
    name: "Bata Desechable",
    category: "ppe",
    unit: "Unidad",
    currentStock: 180,
    minStock: 200,
    maxStock: 1000,
    unitPrice: 25.0,
    warehouseId: "1",
    requiresPrescription: false,
  },
]

export const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Distribuidora Médica Guatemala",
    contact: "Carlos Méndez",
    email: "ventas@dismedgt.com",
    phone: "+502 2222-1111",
    address: "Zona 4, Ciudad de Guatemala",
    paymentTerms: "30_days",
    currentBalance: 45000.0,
    creditLimit: 100000.0,
    status: "active",
  },
  {
    id: "2",
    name: "Pharma Centro América",
    contact: "Ana Rodríguez",
    email: "pedidos@pharmaca.com",
    phone: "+502 2222-2222",
    address: "Zona 10, Ciudad de Guatemala",
    paymentTerms: "60_days",
    currentBalance: 78500.0,
    creditLimit: 150000.0,
    status: "active",
  },
  {
    id: "3",
    name: "Equipo Médico S.A.",
    contact: "Roberto Juárez",
    email: "info@equipomedico.gt",
    phone: "+502 2222-3333",
    address: "Zona 12, Ciudad de Guatemala",
    paymentTerms: "90_days",
    currentBalance: 125000.0,
    creditLimit: 200000.0,
    status: "active",
  },
  {
    id: "4",
    name: "Suministros Hospitalarios",
    contact: "María López",
    email: "ventas@sumhosp.com",
    phone: "+502 2222-4444",
    address: "Zona 7, Mixco",
    paymentTerms: "30_days",
    currentBalance: 12500.0,
    creditLimit: 50000.0,
    status: "active",
  },
  {
    id: "5",
    name: "Lab Supply Guatemala",
    contact: "Pedro García",
    email: "contacto@labsupply.gt",
    phone: "+502 2222-5555",
    address: "Zona 1, Ciudad de Guatemala",
    paymentTerms: "immediate",
    currentBalance: 0,
    creditLimit: 25000.0,
    status: "active",
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    orderNumber: "OC-2024-001",
    supplierId: "1",
    supplierName: "Distribuidora Médica Guatemala",
    date: "2024-01-10",
    status: "received",
    totalAmount: 15000.0,
    paymentTerms: "30 días",
    items: [
      { productId: "1", productName: "Paracetamol 500mg", quantity: 5000, unitPrice: 0.5 },
      { productId: "2", productName: "Ibuprofeno 400mg", quantity: 3000, unitPrice: 0.75 },
    ],
  },
  {
    id: "2",
    orderNumber: "OC-2024-002",
    supplierId: "2",
    supplierName: "Pharma Centro América",
    date: "2024-01-12",
    status: "approved",
    totalAmount: 25000.0,
    paymentTerms: "60 días",
    items: [
      { productId: "3", productName: "Amoxicilina 500mg", quantity: 2000, unitPrice: 1.25 },
      { productId: "7", productName: "Insulina NPH 100UI", quantity: 100, unitPrice: 125.0 },
    ],
  },
  {
    id: "3",
    orderNumber: "OC-2024-003",
    supplierId: "3",
    supplierName: "Equipo Médico S.A.",
    date: "2024-01-14",
    status: "pending",
    totalAmount: 45000.0,
    paymentTerms: "90 días",
    items: [
      { productId: "13", productName: "Tensiómetro Digital", quantity: 10, unitPrice: 450.0 },
      { productId: "8", productName: "Guantes Quirúrgicos Estériles", quantity: 1000, unitPrice: 8.5 },
    ],
  },
  {
    id: "4",
    orderNumber: "OC-2024-004",
    supplierId: "4",
    supplierName: "Suministros Hospitalarios",
    date: "2024-01-15",
    status: "draft",
    totalAmount: 8500.0,
    paymentTerms: "30 días",
    items: [
      { productId: "14", productName: "Mascarilla N95", quantity: 500, unitPrice: 15.0 },
      { productId: "15", productName: "Bata Desechable", quantity: 50, unitPrice: 25.0 },
    ],
  },
]

export const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "FAC-2024-0001",
    patientId: "1",
    patientName: "José García Mendoza",
    caseFileId: "1",
    date: "2024-01-15",
    dueDate: "2024-01-30",
    items: [
      { description: "Hospitalización (3 días)", quantity: 3, unitPrice: 2500.0 },
      { description: "Electrocardiograma", quantity: 1, unitPrice: 350.0 },
      { description: "Medicamentos", quantity: 1, unitPrice: 1150.0 },
    ],
    subtotal: 9000.0,
    tax: 1080.0,
    discount: 0,
    total: 10080.0,
    paidAmount: 5000.0,
    status: "partial",
  },
  {
    id: "2",
    invoiceNumber: "FAC-2024-0002",
    patientId: "2",
    patientName: "Ana María López Pérez",
    caseFileId: "2",
    date: "2024-01-14",
    dueDate: "2024-01-29",
    items: [
      { description: "Colecistectomía Laparoscópica", quantity: 1, unitPrice: 25000.0 },
      { description: "Anestesia General", quantity: 1, unitPrice: 5000.0 },
      { description: "Quirófano (2 horas)", quantity: 2, unitPrice: 2000.0 },
    ],
    subtotal: 34000.0,
    tax: 4080.0,
    discount: 2000.0,
    total: 36080.0,
    paidAmount: 20000.0,
    status: "partial",
  },
  {
    id: "3",
    invoiceNumber: "FAC-2024-0003",
    patientId: "3",
    patientName: "Carlos Martínez Hernández",
    caseFileId: "3",
    date: "2024-01-13",
    dueDate: "2024-01-28",
    items: [
      { description: "Hospitalización (2 días)", quantity: 2, unitPrice: 1800.0 },
      { description: "Laboratorios", quantity: 1, unitPrice: 850.0 },
      { description: "Medicamentos", quantity: 1, unitPrice: 650.0 },
    ],
    subtotal: 5100.0,
    tax: 612.0,
    discount: 0,
    total: 5712.0,
    paidAmount: 5712.0,
    status: "paid",
  },
  {
    id: "4",
    invoiceNumber: "FAC-2024-0004",
    patientId: "5",
    patientName: "Roberto Juárez Morales",
    caseFileId: "4",
    date: "2024-01-12",
    dueDate: "2024-01-27",
    items: [
      { description: "Hospitalización (4 días)", quantity: 4, unitPrice: 2200.0 },
      { description: "Rayos X", quantity: 3, unitPrice: 250.0 },
      { description: "Medicamentos", quantity: 1, unitPrice: 1200.0 },
    ],
    subtotal: 10150.0,
    tax: 1218.0,
    discount: 500.0,
    total: 10868.0,
    paidAmount: 0,
    status: "pending",
  },
  {
    id: "5",
    invoiceNumber: "FAC-2024-0005",
    patientId: "7",
    patientName: "Pedro Gómez Sánchez",
    caseFileId: "6",
    date: "2024-01-15",
    dueDate: "2024-01-30",
    items: [
      { description: "UCI (1 día)", quantity: 1, unitPrice: 8500.0 },
      { description: "Medicamentos Cardíacos", quantity: 1, unitPrice: 3500.0 },
      { description: "Monitoreo Continuo", quantity: 1, unitPrice: 2000.0 },
    ],
    subtotal: 14000.0,
    tax: 1680.0,
    discount: 0,
    total: 15680.0,
    paidAmount: 10000.0,
    status: "partial",
  },
  {
    id: "6",
    invoiceNumber: "FAC-2024-0006",
    patientId: "4",
    patientName: "Lucía Ramírez Castillo",
    date: "2024-01-10",
    dueDate: "2024-01-10",
    items: [
      { description: "Consulta Pediátrica", quantity: 1, unitPrice: 350.0 },
      { description: "Nebulización", quantity: 1, unitPrice: 150.0 },
    ],
    subtotal: 500.0,
    tax: 60.0,
    discount: 0,
    total: 560.0,
    paidAmount: 560.0,
    status: "paid",
  },
]

export const payments: Payment[] = [
  {
    id: "1",
    paymentNumber: "PAG-2024-0001",
    date: "2024-01-15",
    category: "patient",
    payerPayee: "José García Mendoza",
    amount: 5000.0,
    method: "card",
    referenceNumber: "FAC-2024-0001",
    status: "completed",
  },
  {
    id: "2",
    paymentNumber: "PAG-2024-0002",
    date: "2024-01-14",
    category: "patient",
    payerPayee: "Ana María López Pérez",
    amount: 20000.0,
    method: "transfer",
    referenceNumber: "FAC-2024-0002",
    status: "completed",
  },
  {
    id: "3",
    paymentNumber: "PAG-2024-0003",
    date: "2024-01-13",
    category: "patient",
    payerPayee: "Carlos Martínez Hernández",
    amount: 5712.0,
    method: "insurance",
    referenceNumber: "FAC-2024-0003",
    status: "completed",
  },
  {
    id: "4",
    paymentNumber: "PAG-2024-0004",
    date: "2024-01-15",
    category: "patient",
    payerPayee: "Pedro Gómez Sánchez",
    amount: 10000.0,
    method: "cash",
    referenceNumber: "FAC-2024-0005",
    status: "completed",
  },
  {
    id: "5",
    paymentNumber: "PAG-2024-0005",
    date: "2024-01-10",
    category: "patient",
    payerPayee: "Lucía Ramírez Castillo",
    amount: 560.0,
    method: "cash",
    referenceNumber: "FAC-2024-0006",
    status: "completed",
  },
  {
    id: "6",
    paymentNumber: "PAG-2024-0006",
    date: "2024-01-11",
    category: "supplier",
    payerPayee: "Distribuidora Médica Guatemala",
    amount: 15000.0,
    method: "transfer",
    referenceNumber: "OC-2024-001",
    status: "completed",
  },
  {
    id: "7",
    paymentNumber: "PAG-2024-0007",
    date: "2024-01-12",
    category: "supplier",
    payerPayee: "Lab Supply Guatemala",
    amount: 5000.0,
    method: "check",
    status: "pending",
  },
]

export const pharmacySales: PharmacySale[] = [
  {
    id: "1",
    transactionNumber: "VF-2024-0001",
    date: "2024-01-15 09:30",
    customerName: "María Pérez",
    items: [
      { productId: "1", productName: "Paracetamol 500mg", quantity: 20, unitPrice: 0.5 },
      { productId: "4", productName: "Omeprazol 20mg", quantity: 14, unitPrice: 0.85 },
    ],
    subtotal: 21.9,
    tax: 2.63,
    discount: 0,
    total: 24.53,
    paymentMethod: "cash",
    hasPrescription: false,
  },
  {
    id: "2",
    transactionNumber: "VF-2024-0002",
    date: "2024-01-15 10:15",
    customerName: "Juan García",
    items: [
      { productId: "3", productName: "Amoxicilina 500mg", quantity: 21, unitPrice: 1.25 },
      { productId: "2", productName: "Ibuprofeno 400mg", quantity: 10, unitPrice: 0.75 },
    ],
    subtotal: 33.75,
    tax: 4.05,
    discount: 0,
    total: 37.8,
    paymentMethod: "card",
    hasPrescription: true,
  },
  {
    id: "3",
    transactionNumber: "VF-2024-0003",
    date: "2024-01-15 11:45",
    items: [{ productId: "1", productName: "Paracetamol 500mg", quantity: 10, unitPrice: 0.5 }],
    subtotal: 5.0,
    tax: 0.6,
    discount: 0,
    total: 5.6,
    paymentMethod: "cash",
    hasPrescription: false,
  },
  {
    id: "4",
    transactionNumber: "VF-2024-0004",
    date: "2024-01-15 14:20",
    customerName: "Ana Rodríguez",
    items: [
      { productId: "5", productName: "Metformina 850mg", quantity: 60, unitPrice: 0.65 },
      { productId: "6", productName: "Losartán 50mg", quantity: 30, unitPrice: 0.9 },
    ],
    subtotal: 66.0,
    tax: 7.92,
    discount: 5.0,
    total: 68.92,
    paymentMethod: "card",
    hasPrescription: true,
  },
  {
    id: "5",
    transactionNumber: "VF-2024-0005",
    date: "2024-01-15 16:00",
    customerName: "Pedro López",
    items: [{ productId: "7", productName: "Insulina NPH 100UI", quantity: 2, unitPrice: 125.0 }],
    subtotal: 250.0,
    tax: 30.0,
    discount: 0,
    total: 280.0,
    paymentMethod: "transfer",
    hasPrescription: true,
  },
]

export const rooms: Room[] = [
  { id: "1", number: "101", type: "standard", floor: 1, dailyRate: 1200.0, status: "available" },
  {
    id: "2",
    number: "102",
    type: "standard",
    floor: 1,
    dailyRate: 1200.0,
    status: "occupied",
    currentPatient: "Fernando Castillo Pérez",
  },
  { id: "3", number: "103", type: "standard", floor: 1, dailyRate: 1200.0, status: "maintenance" },
  { id: "4", number: "201", type: "semi_private", floor: 2, dailyRate: 1800.0, status: "available" },
  {
    id: "5",
    number: "202",
    type: "semi_private",
    floor: 2,
    dailyRate: 1800.0,
    status: "occupied",
    currentPatient: "Carlos Martínez Hernández",
  },
  {
    id: "6",
    number: "301",
    type: "private",
    floor: 3,
    dailyRate: 2500.0,
    status: "occupied",
    currentPatient: "José García Mendoza",
  },
  { id: "7", number: "302", type: "private", floor: 3, dailyRate: 2500.0, status: "available" },
  { id: "8", number: "401", type: "private", floor: 4, dailyRate: 2500.0, status: "reserved" },
  {
    id: "9",
    number: "402",
    type: "private",
    floor: 4,
    dailyRate: 2500.0,
    status: "occupied",
    currentPatient: "Roberto Juárez Morales",
  },
  { id: "10", number: "UCI-01", type: "icu", floor: 1, dailyRate: 8500.0, status: "available" },
  { id: "11", number: "UCI-02", type: "icu", floor: 1, dailyRate: 8500.0, status: "available" },
  {
    id: "12",
    number: "UCI-03",
    type: "icu",
    floor: 1,
    dailyRate: 8500.0,
    status: "occupied",
    currentPatient: "Pedro Gómez Sánchez",
  },
  {
    id: "13",
    number: "QX-01",
    type: "operating",
    floor: 2,
    dailyRate: 4000.0,
    status: "occupied",
    currentPatient: "Ana María López Pérez",
  },
  { id: "14", number: "QX-02", type: "operating", floor: 2, dailyRate: 4000.0, status: "available" },
  { id: "15", number: "EM-01", type: "emergency", floor: 1, dailyRate: 1500.0, status: "available" },
  { id: "16", number: "EM-02", type: "emergency", floor: 1, dailyRate: 1500.0, status: "available" },
]

export const operations: Operation[] = [
  {
    id: "1",
    name: "Apendicectomía",
    complexity: "intermediate",
    estimatedDuration: 90,
    baseCost: 15000.0,
    preRequirements: ["Ayuno 8 horas", "Laboratorios preoperatorios"],
    postRequirements: ["Observación 24 horas", "Antibióticos IV"],
  },
  {
    id: "2",
    name: "Colecistectomía Laparoscópica",
    complexity: "intermediate",
    estimatedDuration: 120,
    baseCost: 25000.0,
    preRequirements: ["Ayuno 8 horas", "Ultrasonido reciente", "Laboratorios"],
    postRequirements: ["Dieta blanda", "Analgésicos"],
  },
  {
    id: "3",
    name: "Cesárea",
    complexity: "major",
    estimatedDuration: 60,
    baseCost: 20000.0,
    preRequirements: ["Monitoreo fetal", "Laboratorios", "Tipo de sangre"],
    postRequirements: ["Observación 48 horas", "Cuidados neonatales"],
  },
  {
    id: "4",
    name: "Cirugía de Cadera",
    complexity: "major",
    estimatedDuration: 180,
    baseCost: 45000.0,
    preRequirements: ["Rayos X", "Evaluación cardíaca", "Banco de sangre"],
    postRequirements: ["Rehabilitación física", "Anticoagulantes"],
  },
  {
    id: "5",
    name: "Biopsia",
    complexity: "minor",
    estimatedDuration: 30,
    baseCost: 5000.0,
    preRequirements: ["Consentimiento informado"],
    postRequirements: ["Cuidados de herida"],
  },
  {
    id: "6",
    name: "Cirugía Cardíaca",
    complexity: "critical",
    estimatedDuration: 360,
    baseCost: 150000.0,
    preRequirements: ["Cateterismo", "Ecocardiograma", "Banco de sangre"],
    postRequirements: ["UCI 48-72 horas", "Monitoreo continuo"],
  },
]

export const scheduledOperations: ScheduledOperation[] = [
  {
    id: "1",
    operationId: "2",
    operationName: "Colecistectomía Laparoscópica",
    patientId: "2",
    patientName: "Ana María López Pérez",
    date: "2024-01-15",
    time: "08:00",
    primarySurgeon: "Dr. Roberto Castillo",
    team: ["Dra. María Fernanda García", "Lic. Carmen Rodríguez"],
    room: "QX-01",
    status: "in_progress",
  },
  {
    id: "2",
    operationId: "4",
    operationName: "Cirugía de Cadera",
    patientId: "5",
    patientName: "Roberto Juárez Morales",
    date: "2024-01-16",
    time: "07:00",
    primarySurgeon: "Dr. Fernando Juárez",
    team: ["Dr. Juan Pablo López", "Lic. Pedro Morales"],
    room: "QX-01",
    status: "scheduled",
  },
  {
    id: "3",
    operationId: "1",
    operationName: "Apendicectomía",
    patientId: "8",
    patientName: "Sofía Hernández López",
    date: "2024-01-16",
    time: "14:00",
    primarySurgeon: "Dr. Roberto Castillo",
    team: ["Lic. Carmen Rodríguez"],
    room: "QX-02",
    status: "scheduled",
  },
  {
    id: "4",
    operationId: "5",
    operationName: "Biopsia",
    patientId: "10",
    patientName: "Andrea Morales Juárez",
    date: "2024-01-17",
    time: "10:00",
    primarySurgeon: "Dra. Ana Lucía Pérez",
    team: [],
    room: "QX-02",
    status: "scheduled",
  },
]

export const warehouses: Warehouse[] = [
  {
    id: "1",
    name: "Bodega Principal",
    location: "Edificio A, Sótano 1",
    manager: "Miguel Sánchez",
    capacity: 5000,
    currentUsage: 3200,
  },
  {
    id: "2",
    name: "Farmacia",
    location: "Edificio A, Planta Baja",
    manager: "Lic. Sofía Hernández",
    capacity: 2000,
    currentUsage: 1450,
  },
  {
    id: "3",
    name: "Suministros Quirúrgicos",
    location: "Edificio B, Piso 2",
    manager: "Dr. Roberto Castillo",
    capacity: 1000,
    currentUsage: 650,
  },
]

export const medicalPackages: MedicalPackage[] = [
  {
    id: "1",
    name: "Paquete Maternidad",
    description: "Incluye parto natural o cesárea, hospitalización y cuidados neonatales",
    services: [
      { name: "Parto/Cesárea", quantity: 1 },
      { name: "Hospitalización", quantity: 2 },
      { name: "Cuidados Neonatales", quantity: 1 },
      { name: "Laboratorios", quantity: 1 },
    ],
    includesRoom: true,
    validityDays: 365,
    totalPrice: 35000.0,
    status: "active",
  },
  {
    id: "2",
    name: "Chequeo Ejecutivo",
    description: "Evaluación médica completa con laboratorios y estudios de imagen",
    services: [
      { name: "Consulta Médica", quantity: 1 },
      { name: "Laboratorios Completos", quantity: 1 },
      { name: "Electrocardiograma", quantity: 1 },
      { name: "Rayos X Tórax", quantity: 1 },
    ],
    includesRoom: false,
    validityDays: 30,
    totalPrice: 2500.0,
    status: "active",
  },
  {
    id: "3",
    name: "Paquete Cirugía Menor",
    description: "Procedimientos ambulatorios con anestesia local",
    services: [
      { name: "Procedimiento Quirúrgico", quantity: 1 },
      { name: "Anestesia Local", quantity: 1 },
      { name: "Materiales", quantity: 1 },
    ],
    includesRoom: false,
    validityDays: 30,
    totalPrice: 8000.0,
    status: "active",
  },
]

// lib/mock-data.ts
export type InventoryItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  unit: string;
  status: 'active' | 'low-stock' | 'out-of-stock' | 'inactive';
};

export type InventoryMovement = {
  id: string;
  itemId: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
};

export const inventoryMovements: InventoryMovement[] = [
  {
    id: 'mv-001',
    itemId: '1',
    type: 'entry',
    quantity: 500,
    date: '2024-01-15',
    reference: 'OC-2024-001',
    notes: 'Recepción de compra a Distribuidora Médica Guatemala',
  },
  {
    id: 'mv-002',
    itemId: '2',
    type: 'entry',
    quantity: 300,
    date: '2024-01-15',
    reference: 'OC-2024-001',
    notes: 'Recepción de compra a Distribuidora Médica Guatemala',
  },
  {
    id: 'mv-003',
    itemId: '1',
    type: 'exit',
    quantity: 50,
    date: '2024-01-15',
    reference: 'DISP-2024-001',
    notes: 'Despacho a Farmacia',
  },
  {
    id: 'mv-004',
    itemId: '5',
    type: 'entry',
    quantity: 200,
    date: '2024-01-14',
    reference: 'OC-2024-002',
    notes: 'Recepción de compra a Pharma Centro América',
  },
  {
    id: 'mv-005',
    itemId: '2',
    type: 'adjustment',
    quantity: -10,
    date: '2024-01-14',
    reference: 'AJ-2024-001',
    notes: 'Ajuste por inventario físico, merma detectada',
  },
  {
    id: 'mv-006',
    itemId: '4',
    type: 'entry',
    quantity: 100,
    date: '2024-01-13',
    reference: 'OC-2024-003',
    notes: 'Recepción de compra a Equipo Médico S.A.',
  },
  {
    id: 'mv-007',
    itemId: '3',
    type: 'exit',
    quantity: 5,
    date: '2024-01-13',
    reference: 'DISP-2024-002',
    notes: 'Despacho a Cirugía',
  },
  {
    id: 'mv-008',
    itemId: '1',
    type: 'exit',
    quantity: 30,
    date: '2024-01-12',
    reference: 'DISP-2024-003',
    notes: 'Venta farmacia - turno mañana',
  },
  {
    id: 'mv-009',
    itemId: '5',
    type: 'adjustment',
    quantity: -5,
    date: '2024-01-12',
    reference: 'AJ-2024-002',
    notes: 'Ajuste por daño en almacén',
  },
  {
    id: 'mv-010',
    itemId: '2',
    type: 'entry',
    quantity: 150,
    date: '2024-01-11',
    reference: 'OC-2024-004',
    notes: 'Recepción de compra a Suministros Hospitalarios',
  },
];

export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    code: 'MED-001',
    name: 'Paracetamol 500mg',
    category: 'Medicamentos',
    currentStock: 150,
    minStock: 50,
    unitCost: 0.25,
    unit: 'tabletas',
    status: 'active'
  },
  {
    id: '2',
    code: 'MAT-002',
    name: 'Jeringa 10ml',
    category: 'Material Médico',
    currentStock: 25,
    minStock: 30,
    unitCost: 0.15,
    unit: 'unidades',
    status: 'low-stock'
  },
  {
    id: '3',
    code: 'EQU-003',
    name: 'Estetoscopio',
    category: 'Equipamiento',
    currentStock: 0,
    minStock: 5,
    unitCost: 45.00,
    unit: 'unidades',
    status: 'out-of-stock'
  },
  {
    id: '4',
    code: 'MED-004',
    name: 'Ibuprofeno 400mg',
    category: 'Medicamentos',
    currentStock: 80,
    minStock: 40,
    unitCost: 0.30,
    unit: 'tabletas',
    status: 'active'
  },
  {
    id: '5',
    code: 'MAT-005',
    name: 'Guantes Latex T/M',
    category: 'Insumos',
    currentStock: 200,
    minStock: 100,
    unitCost: 0.08,
    unit: 'pares',
    status: 'active'
  }
];

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Roberto Mendoza',
    specialty: 'Medicina General',
    licenseNumber: 'MG-12345'
  },
  {
    id: '2',
    name: 'Dra. Sofia Castillo',
    specialty: 'Cardiología',
    licenseNumber: 'CAR-67890'
  },
  {
    id: '3',
    name: 'Dr. Miguel Ángel Santos',
    specialty: 'Pediatría',
    licenseNumber: 'PED-54321'
  },
  {
    id: '4',
    name: 'Dra. Elena Rivera',
    specialty: 'Ginecología',
    licenseNumber: 'GIN-98765'
  }
];

export const prescriptions: Prescription[] = [
  {
    id: '1',
    prescriptionNumber: 'RX-2024-001',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-15',
    diagnosis: 'Hipertensión arterial',
    status: 'dispensed',
    medications: [
      {
        id: 'med1',
        name: 'Losartán',
        dosage: '50 mg',
        frequency: '1 vez al día',
        duration: '30 días',
        instructions: 'Tomar en la mañana'
      },
      {
        id: 'med2',
        name: 'Hidroclorotiazida',
        dosage: '25 mg',
        frequency: '1 vez al día',
        duration: '30 días',
        instructions: 'Tomar con el desayuno'
      }
    ]
  },
  {
    id: '2',
    prescriptionNumber: 'RX-2024-002',
    patientId: '2',
    doctorId: '2',
    date: '2024-01-16',
    diagnosis: 'Arritmia cardíaca',
    status: 'pending',
    medications: [
      {
        id: 'med3',
        name: 'Amiodarona',
        dosage: '200 mg',
        frequency: '2 veces al día',
        duration: '15 días',
        instructions: 'Monitorear función tiroidea'
      }
    ]
  },
  {
    id: '3',
    prescriptionNumber: 'RX-2024-003',
    patientId: '3',
    doctorId: '3',
    date: '2024-01-17',
    diagnosis: 'Infección respiratoria',
    status: 'dispensed',
    medications: [
      {
        id: 'med4',
        name: 'Amoxicilina',
        dosage: '500 mg',
        frequency: '3 veces al día',
        duration: '7 días',
        instructions: 'Tomar con alimentos'
      },
      {
        id: 'med5',
        name: 'Ibuprofeno',
        dosage: '400 mg',
        frequency: 'Cada 8 horas',
        duration: '5 días',
        instructions: 'Tomar con comida'
      }
    ]
  },
  {
    id: '4',
    prescriptionNumber: 'RX-2024-004',
    patientId: '4',
    doctorId: '4',
    date: '2024-01-18',
    diagnosis: 'Control prenatal',
    status: 'cancelled',
    medications: [
      {
        id: 'med6',
        name: 'Ácido Fólico',
        dosage: '1 mg',
        frequency: '1 vez al día',
        duration: '90 días',
        instructions: 'Tomar en la mañana'
      }
    ],
    notes: 'Paciente canceló cita'
  },
  {
    id: '5',
    prescriptionNumber: 'RX-2024-005',
    patientId: '1',
    doctorId: '1',
    date: '2023-12-01',
    diagnosis: 'Diabetes tipo 2',
    status: 'expired',
    medications: [
      {
        id: 'med7',
        name: 'Metformina',
        dosage: '850 mg',
        frequency: '2 veces al día',
        duration: '30 días',
        instructions: 'Tomar con alimentos'
      }
    ]
  }
];

// Dashboard statistics helper
export const getDashboardStats = () => {
  const today = new Date().toISOString().split("T")[0]
  const activeCases = caseFiles.filter((c) => c.stage !== "discharged")
  const todayPatients = patients.filter((p) => p.lastVisit === today || p.lastVisit === "2024-01-15")
  const occupiedRooms = rooms.filter((r) => r.status === "occupied")
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock)
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "partial")
  const todayRevenue = payments
    .filter((p) => p.date === "2024-01-15" && p.category === "patient")
    .reduce((sum, p) => sum + p.amount, 0)
  const monthRevenue = payments.filter((p) => p.category === "patient").reduce((sum, p) => sum + p.amount, 0)
  const scheduledOps = scheduledOperations.filter((o) => o.status === "scheduled")

  return {
    todayPatients: todayPatients.length,
    activeCases: activeCases.length,
    scheduledOperations: scheduledOps.length,
    todayRevenue,
    monthRevenue,
    pendingPayments: pendingInvoices.reduce((sum, i) => sum + (i.total - i.paidAmount), 0),
    lowStockAlerts: lowStockProducts.length,
    occupancyRate: Math.round((occupiedRooms.length / rooms.length) * 100),
    totalRooms: rooms.length,
    occupiedRooms: occupiedRooms.length,
  }
}

// Chart data helpers
export const getAdmissionsChartData = () => {
  return [
    { date: "01/01", admissions: 12, discharges: 8 },
    { date: "02/01", admissions: 15, discharges: 10 },
    { date: "03/01", admissions: 8, discharges: 12 },
    { date: "04/01", admissions: 18, discharges: 14 },
    { date: "05/01", admissions: 14, discharges: 11 },
    { date: "06/01", admissions: 11, discharges: 9 },
    { date: "07/01", admissions: 16, discharges: 13 },
    { date: "08/01", admissions: 13, discharges: 15 },
    { date: "09/01", admissions: 19, discharges: 12 },
    { date: "10/01", admissions: 15, discharges: 16 },
    { date: "11/01", admissions: 12, discharges: 10 },
    { date: "12/01", admissions: 17, discharges: 14 },
    { date: "13/01", admissions: 14, discharges: 11 },
    { date: "14/01", admissions: 16, discharges: 13 },
    { date: "15/01", admissions: 18, discharges: 12 },
  ]
}

export const getRevenueByDepartmentData = () => {
  return [
    { name: "Hospitalización", value: 45000, fill: "var(--color-chart-1)" },
    { name: "Cirugía", value: 65000, fill: "var(--color-chart-2)" },
    { name: "Farmacia", value: 18000, fill: "var(--color-chart-3)" },
    { name: "Laboratorio", value: 12000, fill: "var(--color-chart-4)" },
    { name: "Consultas", value: 8500, fill: "var(--color-chart-5)" },
  ]
}

export const getMonthlyRevenueData = () => {
  return [
    { month: "Ago", revenue: 125000, expenses: 85000 },
    { month: "Sep", revenue: 145000, expenses: 92000 },
    { month: "Oct", revenue: 138000, expenses: 88000 },
    { month: "Nov", revenue: 162000, expenses: 95000 },
    { month: "Dic", revenue: 178000, expenses: 102000 },
    { month: "Ene", revenue: 148500, expenses: 89000 },
  ]
}

// Utility functions
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const getRoleLabel = (role: User["role"]) => {
  const labels: Record<User["role"], string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    doctor: "Doctor",
    nurse: "Enfermero/a",
    pharmacist: "Farmacéutico/a",
    receptionist: "Recepcionista",
    lab_technician: "Técnico Lab.",
    billing_staff: "Facturación",
    warehouse_manager: "Jefe Bodega",
  }
  return labels[role]
}

export const getStageLabel = (stage: CaseFile["stage"]) => {
  const labels: Record<CaseFile["stage"], string> = {
    emergency: "Emergencia",
    consultation: "Consulta",
    hospitalized: "Hospitalizado",
    surgery: "Cirugía",
    recovery: "Recuperación",
    discharged: "Alta",
  }
  return labels[stage]
}

export const getCategoryLabel = (category: Product["category"]) => {
  const labels: Record<Product["category"], string> = {
    medications: "Medicamentos",
    surgical_supplies: "Suministros Quirúrgicos",
    lab_supplies: "Suministros Lab.",
    medical_equipment: "Equipo Médico",
    ppe: "EPP",
  }
  return labels[category]
}

export const getRoomTypeLabel = (type: Room["type"]) => {
  const labels: Record<Room["type"], string> = {
    standard: "Estándar",
    semi_private: "Semi-Privada",
    private: "Privada",
    icu: "UCI",
    operating: "Quirófano",
    emergency: "Emergencia",
  }
  return labels[type]
}
