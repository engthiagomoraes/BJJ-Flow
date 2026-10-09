import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Student, 
  Instructor, 
  ClassSchedule, 
  AttendanceRecord, 
  LessonPlan, 
  Technique, 
  GraduationHistory, 
  PaymentRecord, 
  NotificationItem, 
  AcademyProduct,
  BeltColor,
  PaymentStatus,
  AuthUser,
  AcademyEvent,
  StudentPurchase,
  UserRole,
  LearnedTechnique,
  AcademySettings,
  GraduationSystemType,
  BeltGraduationRule,
  StudentGraduationStatus,
  UserPermissions,
  DEFAULT_MASTER_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_PROFESSOR_PERMISSIONS,
  DEFAULT_STUDENT_PERMISSIONS,
  SupabaseConfig,
  StudentEvaluation,
  DevelopmentScores
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_INSTRUCTORS, 
  INITIAL_CLASSES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LESSON_PLANS, 
  INITIAL_TECHNIQUES, 
  INITIAL_GRADUATIONS, 
  INITIAL_PAYMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PRODUCTS,
  INITIAL_EVENTS,
  INITIAL_PURCHASES,
  DEMO_USERS,
  DEFAULT_ACADEMY_SETTINGS,
  DEFAULT_IBJJF_BELT_RULES
} from '../data/mockData';
import { exportAllToSupabase, importAllFromSupabase, isSecretApiKey, getSupabaseClient } from '../services/supabaseService';

interface BjjContextType {
  currentUser: AuthUser;
  allUsers: AuthUser[];
  switchUser: (userId: string) => void;
  loginWithEmail: (email: string) => boolean;
  loginWithEmailAndPassword: (email: string, password?: string) => { success: boolean; message: string; user?: AuthUser };
  updateUser: (userId: string, partialUser: Partial<AuthUser>) => void;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (userData: Omit<AuthUser, 'id'>) => AuthUser;
  deleteUser: (userId: string) => boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  logout: () => void;

  academySettings: AcademySettings;
  updateAcademySettings: (settings: Partial<AcademySettings>) => void;
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncDataWithSupabase: () => Promise<{ success: boolean; details?: Record<string, number>; errors?: string[] }>;
  pullDataFromSupabaseContext: () => Promise<{ success: boolean; error?: string }>;
  getBeltGraduationRule: (faixa: BeltColor) => BeltGraduationRule;
  updateBeltGraduationRule: (faixa: BeltColor, ruleUpdate: Partial<BeltGraduationRule>) => void;
  resetBeltGraduationRulesToIBJJF: () => void;
  getStudentGraduationStatus: (student: Student) => StudentGraduationStatus;

  students: Student[];
  instructors: Instructor[];
  classes: ClassSchedule[];
  attendance: AttendanceRecord[];
  lessonPlans: LessonPlan[];
  techniques: Technique[];
  graduations: GraduationHistory[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  products: AcademyProduct[];
  events: AcademyEvent[];
  purchases: StudentPurchase[];
  evaluations: StudentEvaluation[];
  
  // Actions
  addAttendance: (studentId: string, classId: string, date?: string, time?: string) => void;
  removeAttendance: (attendanceId: string) => void;
  checkInStudentToday: (studentId: string, turmaId: string) => void;
  
  addStudent: (student: Omit<Student, 'id' | 'presencasNaFaixa' | 'totalPresencasHistorico' | 'performance'>) => void;
  importStudents: (studentsList: Omit<Student, 'id' | 'presencasNaFaixa' | 'totalPresencasHistorico' | 'performance'>[]) => number;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateStudentGraduationSystem: (studentId: string, system: GraduationSystemType) => void;

  addClassSchedule: (classSchedule: Omit<ClassSchedule, 'id'>) => void;
  importClasses: (classesList: Omit<ClassSchedule, 'id'>[]) => number;
  deleteClassSchedule: (id: string) => void;

  addInstructor: (instructor: Omit<Instructor, 'id'>) => void;
  importInstructors: (instructorsList: Omit<Instructor, 'id'>[]) => number;
  updateInstructor: (id: string, updated: Partial<Instructor>) => void;
  deleteInstructor: (id: string) => void;
  updateInstructorGraduationSystem: (instructorId: string, system: GraduationSystemType) => void;
  
  importAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => number;
  importPayments: (paymentsList: Omit<PaymentRecord, 'id'>[]) => number;
  
  graduateStudent: (
    studentId: string, 
    novaFaixa: BeltColor, 
    novosGraus: number, 
    professorAvaliador: string, 
    observacao: string
  ) => void;
  
  addLessonPlan: (plan: Omit<LessonPlan, 'id'>) => void;
  updateLessonPlan: (id: string, plan: Partial<LessonPlan>) => void;
  toggleLessonPlanDone: (id: string) => void;
  
  addTechnique: (technique: Omit<Technique, 'id'>) => void;
  importTechniques: (techniquesList: Omit<Technique, 'id'>[]) => number;
  updateTechnique: (id: string, technique: Partial<Technique>) => void;
  deleteTechnique: (id: string) => void;
  
  addLearnedTechnique: (studentId: string, technique: Omit<LearnedTechnique, 'id'>) => void;
  removeLearnedTechnique: (studentId: string, learnedTechniqueId: string) => void;
  
  markPaymentPaid: (paymentId: string, metodo?: 'PIX' | 'Dinheiro' | 'Cartão de Crédito' | 'Boleto' | 'Isento Social') => void;
  addPaymentRecord: (payment: Omit<PaymentRecord, 'id'>) => void;
  
  sendNotification: (item: Omit<NotificationItem, 'id' | 'dataHora' | 'statusEnvio'>) => void;
  resendNotification: (id: string) => void;
  
  addProduct: (product: Omit<AcademyProduct, 'id'>) => void;
  updateProductStock: (id: string, delta: number) => void;

  addEvent: (event: Omit<AcademyEvent, 'id' | 'participantesIds'>) => void;
  toggleEnrollEvent: (eventId: string, studentId: string) => void;
  addPurchase: (produtoId: string, studentId: string) => void;
  
  // Avaliação de Desenvolvimento Histórica
  addStudentEvaluation: (evalData: Omit<StudentEvaluation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StudentEvaluation>;
  updateStudentEvaluation: (id: string, evalData: Partial<Omit<StudentEvaluation, 'id' | 'studentId' | 'createdAt'>>) => Promise<void>;
  deleteStudentEvaluation: (id: string) => Promise<void>;
  getStudentEvaluations: (studentId: string) => StudentEvaluation[];

  resetDataToDefault: () => void;
}

const BjjContext = createContext<BjjContextType | undefined>(undefined);

const STORAGE_PREFIX = 'bjj_flow_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const BjjProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<AuthUser[]>(() => {
    const loaded = loadFromStorage<AuthUser[]>('allUsers', DEMO_USERS);
    const thiagoMaster = DEMO_USERS[0]; // Thiago Lopes de Moraes Silva
    const existingIndex = loaded.findIndex(u => u.id === 'user-thiago-master' || u.email.toLowerCase() === 'thiagomoraes.mail@gmail.com');
    if (existingIndex >= 0) {
      loaded[existingIndex] = {
        ...loaded[existingIndex],
        ...thiagoMaster,
        isMasterAdmin: true,
        password: 'Pindorama@2507',
        permissions: { ...DEFAULT_MASTER_PERMISSIONS }
      };
      return loaded;
    } else {
      return [thiagoMaster, ...loaded];
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const loaded = loadFromStorage<AuthUser>('currentUser', DEMO_USERS[0]);
    if (!loaded || loaded.id === 'user-admin' || loaded.id === 'user-thiago-master' || loaded.email === 'thiagomoraes.mail@gmail.com') {
      return DEMO_USERS[0];
    }
    return loaded;
  });

  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', INITIAL_STUDENTS));
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const loaded = loadFromStorage<Instructor[]>('instructors', INITIAL_INSTRUCTORS);
    const thiagoInst = INITIAL_INSTRUCTORS[0];
    if (!loaded.some(i => i.id === 'inst-thiago' || i.email === 'thiagomoraes.mail@gmail.com')) {
      return [thiagoInst, ...loaded];
    }
    return loaded;
  });

  const [classes, setClasses] = useState<ClassSchedule[]>(() => {
    const loaded = loadFromStorage<ClassSchedule[]>('classes', INITIAL_CLASSES);
    const thiagoClass = INITIAL_CLASSES.find(c => c.id === 'turma-sabado-thiago');
    if (thiagoClass && !loaded.some(c => c.id === 'turma-sabado-thiago')) {
      return [...loaded, thiagoClass];
    }
    return loaded;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadFromStorage('attendance', INITIAL_ATTENDANCE));
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => loadFromStorage('lessonPlans', INITIAL_LESSON_PLANS));
  const [techniques, setTechniques] = useState<Technique[]>(() => loadFromStorage('techniques', INITIAL_TECHNIQUES));
  const [graduations, setGraduations] = useState<GraduationHistory[]>(() => loadFromStorage('graduations', INITIAL_GRADUATIONS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadFromStorage('payments', INITIAL_PAYMENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [products, setProducts] = useState<AcademyProduct[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [events, setEvents] = useState<AcademyEvent[]>(() => loadFromStorage('events', INITIAL_EVENTS));
  const [purchases, setPurchases] = useState<StudentPurchase[]>(() => loadFromStorage('purchases', INITIAL_PURCHASES));
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>(() => loadFromStorage<StudentEvaluation[]>('evaluations', []));
  const [academySettings, setAcademySettings] = useState<AcademySettings>(() => {
    const loaded = loadFromStorage('academySettings', DEFAULT_ACADEMY_SETTINGS);
    return {
      ...DEFAULT_ACADEMY_SETTINGS,
      ...loaded,
      regrasGraduacao: {
        ...DEFAULT_IBJJF_BELT_RULES,
        ...(loaded?.regrasGraduacao || {})
      },
      supabaseConfig: loaded?.supabaseConfig || DEFAULT_ACADEMY_SETTINGS.supabaseConfig
    };
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const loaded = loadFromStorage<AcademySettings>('academySettings', DEFAULT_ACADEMY_SETTINGS);
    return loaded?.supabaseConfig || DEFAULT_ACADEMY_SETTINGS.supabaseConfig || {
      url: '',
      anonKey: '',
      serviceRoleKey: '',
      enabled: false,
      autoSync: false
    };
  });

  const updateSupabaseConfig = (partial: Partial<SupabaseConfig>) => {
    setSupabaseConfig(prev => {
      const next = { ...prev, ...partial };
      setAcademySettings(curr => ({
        ...curr,
        supabaseConfig: next
      }));
      return next;
    });
  };

  const syncDataWithSupabase = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      return { 
        success: false, 
        errors: ['Credenciais do Supabase não configuradas no sistema. Acesse Configurações > Banco de Dados.'] 
      };
    }

    const key = supabaseConfig.anonKey.trim();

    // Proteção contra bloqueio do navegador pelo Supabase
    if (isSecretApiKey(key)) {
      return {
        success: false,
        errors: [
          'A chave configurada é uma Chave Secreta ("service_role").',
          'O Supabase bloqueia o uso de chaves secretas no navegador ("Forbidden use of secret API key in browser").',
          'Solução: No painel do Supabase, vá em Project Settings > API e copie a Chave Pública ("anon / publishable"). Salve-a no campo Chave Pública (anon key).'
        ]
      };
    }

    const res = await exportAllToSupabase(supabaseConfig.url, key, {
      students,
      instructors,
      classes,
      attendance,
      graduations,
      payments,
      lessonPlans,
      techniques,
      allUsers,
      academySettings,
      evaluations
    });

    if (res.success) {
      const nowStr = new Date().toLocaleString('pt-BR');
      updateSupabaseConfig({
        lastSync: nowStr,
        lastConnected: nowStr
      });
    }
    return res;
  };

  const pullDataFromSupabaseContext = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      return { success: false, error: 'Credenciais do Supabase não configuradas no sistema.' };
    }

    const key = supabaseConfig.anonKey.trim();
    if (isSecretApiKey(key)) {
      return { 
        success: false, 
        error: 'Chave secreta detectada. O Supabase exige a chave pública (anon) no navegador.' 
      };
    }

    const res = await importAllFromSupabase(supabaseConfig.url, key);
    if (res.error) {
      return { success: false, error: res.error };
    }

    if (res.students && res.students.length > 0) setStudents(res.students);
    if (res.instructors && res.instructors.length > 0) setInstructors(res.instructors);
    if (res.classes && res.classes.length > 0) setClasses(res.classes);
    if (res.attendance && res.attendance.length > 0) setAttendance(res.attendance);
    if (res.graduations && res.graduations.length > 0) setGraduations(res.graduations);
    if (res.payments && res.payments.length > 0) setPayments(res.payments);
    if (res.lessonPlans && res.lessonPlans.length > 0) setLessonPlans(res.lessonPlans);
    if (res.techniques && res.techniques.length > 0) setTechniques(res.techniques);
    if (res.allUsers && res.allUsers.length > 0) setAllUsers(res.allUsers);
    if (res.evaluations && res.evaluations.length > 0) setEvaluations(res.evaluations);
    if (res.academySettings) {
      setAcademySettings(prev => ({
        ...prev,
        ...res.academySettings
      }));
    }

    const nowStr = new Date().toLocaleString('pt-BR');
    updateSupabaseConfig({
      lastSync: nowStr,
      lastConnected: nowStr
    });

    return { success: true };
  };

  // Sync to localStorage
  useEffect(() => saveToStorage('allUsers', allUsers), [allUsers]);
  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveToStorage('students', students), [students]);
  useEffect(() => saveToStorage('instructors', instructors), [instructors]);
  useEffect(() => saveToStorage('classes', classes), [classes]);
  useEffect(() => saveToStorage('attendance', attendance), [attendance]);
  useEffect(() => saveToStorage('lessonPlans', lessonPlans), [lessonPlans]);
  useEffect(() => saveToStorage('techniques', techniques), [techniques]);
  useEffect(() => saveToStorage('graduations', graduations), [graduations]);
  useEffect(() => saveToStorage('payments', payments), [payments]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('events', events), [events]);
  useEffect(() => saveToStorage('purchases', purchases), [purchases]);
  useEffect(() => saveToStorage('evaluations', evaluations), [evaluations]);
  useEffect(() => saveToStorage('academySettings', academySettings), [academySettings]);

  // Auth logic & User Management
  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const loginWithEmail = (email: string): boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginWithEmailAndPassword = (email: string, password?: string): { success: boolean; message: string; user?: AuthUser } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Usuário com este e-mail não foi encontrado.' };
    }

    if (user.status === 'inativo') {
      return { success: false, message: 'Esta conta está inativa no momento. Contate o Administrador Master.' };
    }

    if (user.password && password !== undefined) {
      if (user.password !== password) {
        return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
      }
    }

    const updatedUser: AuthUser = {
      ...user,
      ultimoAcesso: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    return { success: true, message: `Bem-vindo, ${user.nome}! Login efetuado com sucesso.`, user: updatedUser };
  };

  const updateUser = (userId: string, partialUser: Partial<AuthUser>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...partialUser };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const updateUserPermissions = (userId: string, permissions: Partial<UserPermissions>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const base = u.permissions || (
          u.isMasterAdmin ? DEFAULT_MASTER_PERMISSIONS :
          u.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS :
          u.role === 'professor' ? DEFAULT_PROFESSOR_PERMISSIONS :
          DEFAULT_STUDENT_PERMISSIONS
        );
        const updatedPerms: UserPermissions = {
          ...base,
          ...permissions
        };
        const updated = { ...u, permissions: updatedPerms };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        let defaultPerms = DEFAULT_STUDENT_PERMISSIONS;
        if (newRole === 'admin') defaultPerms = DEFAULT_ADMIN_PERMISSIONS;
        if (newRole === 'professor') defaultPerms = DEFAULT_PROFESSOR_PERMISSIONS;

        const updated = {
          ...u,
          role: newRole,
          permissions: { ...defaultPerms, ...(u.permissions || {}) }
        };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const addUser = (userData: Omit<AuthUser, 'id'>): AuthUser => {
    const newId = 'user-' + Date.now();
    let defaultPerms = DEFAULT_STUDENT_PERMISSIONS;
    if (userData.role === 'admin') defaultPerms = DEFAULT_ADMIN_PERMISSIONS;
    if (userData.role === 'professor') defaultPerms = DEFAULT_PROFESSOR_PERMISSIONS;

    const newUser: AuthUser = {
      ...userData,
      id: newId,
      permissions: userData.permissions || defaultPerms,
      status: userData.status || 'ativo'
    };

    setAllUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const deleteUser = (userId: string): boolean => {
    const target = allUsers.find(u => u.id === userId);
    if (target?.isMasterAdmin || target?.email.toLowerCase() === 'thiagomoraes.mail@gmail.com') {
      return false; // Protected
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    return true;
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (currentUser.role === 'admin' && currentUser.isMasterAdmin) return true;
    if (currentUser.permissions && currentUser.permissions[permission] !== undefined) {
      return !!currentUser.permissions[permission];
    }
    if (currentUser.role === 'admin') return true;
    return false;
  };

  const logout = () => {
    setCurrentUser(DEMO_USERS[0]); // default to Master Admin Thiago
  };

  // Event actions
  const addEvent = (eventData: Omit<AcademyEvent, 'id' | 'participantesIds'>) => {
    const newEvt: AcademyEvent = {
      ...eventData,
      id: 'evt-' + Date.now(),
      participantesIds: []
    };
    setEvents(prev => [newEvt, ...prev]);
  };

  const toggleEnrollEvent = (eventId: string, studentId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const isEnrolled = evt.participantesIds.includes(studentId);
        return {
          ...evt,
          participantesIds: isEnrolled 
            ? evt.participantesIds.filter(id => id !== studentId)
            : [...evt.participantesIds, studentId]
        };
      }
      return evt;
    }));
  };

  // Purchase actions
  const addPurchase = (produtoId: string, studentId: string) => {
    const prod = products.find(p => p.id === produtoId);
    const st = students.find(s => s.id === studentId);
    if (!prod || !st) return;

    const newPur: StudentPurchase = {
      id: 'pur-' + Date.now(),
      studentId: st.id,
      studentNome: st.nome,
      produtoId: prod.id,
      produtoNome: prod.nome,
      preco: prod.preco,
      data: new Date().toISOString().split('T')[0],
      status: 'pago',
      professorId: st.professorId
    };
    setPurchases(prev => [newPur, ...prev]);
    updateProductStock(prod.id, -1);
  };

  // Helper to extract taught techniques from a lesson plan
  const extractTechniquesFromPlan = (plan: LessonPlan, allTechniques: Technique[]): Array<{ techniqueId?: string; titulo: string; categoria: string }> => {
    const result: Array<{ techniqueId?: string; titulo: string; categoria: string }> = [];
    const addedTitles = new Set<string>();

    if (plan.techniqueIds && plan.techniqueIds.length > 0) {
      plan.techniqueIds.forEach(id => {
        const tech = allTechniques.find(t => t.id === id);
        if (tech && !addedTitles.has(tech.titulo.toLowerCase())) {
          addedTitles.add(tech.titulo.toLowerCase());
          result.push({
            techniqueId: tech.id,
            titulo: tech.titulo,
            categoria: tech.categoria
          });
        }
      });
    }

    if (plan.tecnicasNomes && plan.tecnicasNomes.length > 0) {
      plan.tecnicasNomes.forEach(nome => {
        if (!addedTitles.has(nome.toLowerCase())) {
          addedTitles.add(nome.toLowerCase());
          const tech = allTechniques.find(t => t.titulo.toLowerCase() === nome.toLowerCase());
          result.push({
            techniqueId: tech?.id,
            titulo: nome,
            categoria: tech?.categoria || 'Fundamento'
          });
        }
      });
    }

    if (result.length === 0 && plan.tecnicaPrincipal) {
      const tecPrinc = plan.tecnicaPrincipal;
      allTechniques.forEach(tech => {
        if (
          (tecPrinc.toLowerCase().includes(tech.titulo.toLowerCase()) ||
           plan.temaPrincipal.toLowerCase().includes(tech.titulo.toLowerCase())) &&
          !addedTitles.has(tech.titulo.toLowerCase())
        ) {
          addedTitles.add(tech.titulo.toLowerCase());
          result.push({
            techniqueId: tech.id,
            titulo: tech.titulo,
            categoria: tech.categoria
          });
        }
      });

      if (result.length === 0 && tecPrinc.trim()) {
        const cleanTitle = tecPrinc.split(':')[1]?.trim() || tecPrinc.split('.')[0]?.trim() || tecPrinc;
        result.push({
          titulo: cleanTitle.slice(0, 50),
          categoria: 'Posição do Dia'
        });
      }
    }

    return result;
  };

  // Helper to record learned techniques onto student when present in a class
  const recordLearnedTechniquesForStudent = (
    stId: string,
    turmaObj: ClassSchedule,
    dateStr: string
  ) => {
    const plan = lessonPlans.find(lp => 
      lp.data === dateStr && (
        lp.turma === turmaObj.titulo || 
        (lp.turma && turmaObj.titulo.toLowerCase().includes(lp.turma.toLowerCase())) || 
        (lp.turma && lp.turma.toLowerCase().includes(turmaObj.titulo.toLowerCase())) ||
        lp.turmaId === turmaObj.id
      )
    ) || lessonPlans.find(lp => lp.data === dateStr);

    if (!plan) return;

    const techsTaught = extractTechniquesFromPlan(plan, techniques);
    if (techsTaught.length === 0) return;

    setStudents(prevStudents => prevStudents.map(s => {
      if (s.id !== stId) return s;

      const existingLearned = s.tecnicasAprendidas || [];
      const newItems: LearnedTechnique[] = [];

      techsTaught.forEach(t => {
        const alreadyHas = existingLearned.some(el => 
          (el.techniqueId && el.techniqueId === t.techniqueId) ||
          (el.titulo.toLowerCase() === t.titulo.toLowerCase() && el.dataAprendida === dateStr)
        );

        if (!alreadyHas) {
          newItems.push({
            id: 'lrn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            techniqueId: t.techniqueId,
            titulo: t.titulo,
            categoria: t.categoria,
            dataAprendida: dateStr,
            aulaTitulo: plan.temaPrincipal || turmaObj.titulo,
            turmaNome: turmaObj.titulo,
            professorNome: plan.professor || turmaObj.professorNome
          });
        }
      });

      if (newItems.length === 0) return s;
      return {
        ...s,
        tecnicasAprendidas: [...newItems, ...existingLearned]
      };
    }));
  };

  // Attendance logic
  const checkInStudentToday = (studentId: string, turmaId: string) => {
    const student = students.find(s => s.id === studentId);
    const turma = classes.find(c => c.id === turmaId) || classes[0];
    if (!student) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check if already checked in today for this class
    const already = attendance.some(a => a.studentId === studentId && a.turmaId === turmaId && a.data === todayStr);
    if (already) return;

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      studentId: student.id,
      studentNome: student.nome,
      studentFaixa: student.faixa,
      studentGraus: student.graus,
      turmaId: turma.id,
      turmaTitulo: turma.titulo,
      data: todayStr,
      horario: timeStr,
      confirmadoPor: turma.professorNome || 'Professor Responsável'
    };

    setAttendance(prev => [newRecord, ...prev]);

    // Increment student attendances and sparring time
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          presencasNaFaixa: s.presencasNaFaixa + 1,
          totalPresencasHistorico: s.totalPresencasHistorico + 1,
          performance: {
            ...s.performance,
            tempoRolaMinutos: s.performance.tempoRolaMinutos + 25 // 25 min rola per class
          }
        };
      }
      return s;
    }));

    // Automatically record techniques taught in today's class plan
    recordLearnedTechniquesForStudent(student.id, turma, todayStr);
  };

  const addAttendance = (studentId: string, classId: string, date?: string, time?: string) => {
    const student = students.find(s => s.id === studentId);
    const turma = classes.find(c => c.id === classId) || classes[0];
    if (!student) return;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const timeStr = time || '19:30';

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      studentId: student.id,
      studentNome: student.nome,
      studentFaixa: student.faixa,
      studentGraus: student.graus,
      turmaId: turma.id,
      turmaTitulo: turma.titulo,
      data: dateStr,
      horario: timeStr,
      confirmadoPor: turma.professorNome
    };

    setAttendance(prev => [newRecord, ...prev]);
    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s,
      presencasNaFaixa: s.presencasNaFaixa + 1,
      totalPresencasHistorico: s.totalPresencasHistorico + 1
    } : s));

    // Automatically record techniques taught in that day's class plan
    recordLearnedTechniquesForStudent(student.id, turma, dateStr);
  };

  const removeAttendance = (attendanceId: string) => {
    const rec = attendance.find(a => a.id === attendanceId);
    if (!rec) return;

    setAttendance(prev => prev.filter(a => a.id !== attendanceId));
    setStudents(prev => prev.map(s => {
      if (s.id === rec.studentId) {
        return {
          ...s,
          presencasNaFaixa: Math.max(0, s.presencasNaFaixa - 1),
          totalPresencasHistorico: Math.max(0, s.totalPresencasHistorico - 1)
        };
      }
      return s;
    }));
  };

  // Student management
  const addStudent = (studentData: Omit<Student, 'id' | 'presencasNaFaixa' | 'totalPresencasHistorico' | 'performance'>) => {
    const prof = instructors.find(i => i.id === studentData.professorId || i.nome === studentData.professorNome) || instructors[0];
    const newId = 'aluno-' + Date.now();
    const system = studentData.sistemaGraduacao || prof?.sistemaGraduacao || academySettings.sistemaGraduacaoPadrao || 'graus_e_faixas';
    
    const beltRule = getBeltGraduationRule(studentData.faixa);
    const calculatedMeta = system === 'apenas_faixas' 
      ? beltRule.aulasPorFaixaDireta 
      : ((studentData.graus || 0) < 4 ? ((studentData.graus || 0) + 1) * beltRule.aulasPorGrau : 4 * beltRule.aulasPorGrau);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      professorId: prof?.id,
      professorNome: prof?.nome,
      sistemaGraduacao: system,
      presencasNaFaixa: 0,
      presencasMetaGrau: calculatedMeta,
      totalPresencasHistorico: 0,
      performance: {
        guarda: 6.0,
        passagem: 6.0,
        quedas: 5.5,
        finalizacoes: 5.5,
        defesa: 6.0,
        disciplina: 8.5,
        tempoRolaMinutos: 0,
        finalizacoesAplicadas: 0,
        raspagensFeitas: 0
      }
    };
    setStudents(prev => [newStudent, ...prev]);

    // Also register Auth user so student can login immediately
    const newAuth: AuthUser = {
      id: 'user-' + newId,
      nome: newStudent.nome,
      email: newStudent.email,
      role: 'aluno',
      studentId: newId,
      professorId: prof?.id,
      faixa: newStudent.faixa,
      graus: newStudent.graus
    };
    setAllUsers(prev => [...prev, newAuth]);

    // Also create initial payment record linked to the student's responsible instructor
    const newPayment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      studentId: newStudent.id,
      studentNome: newStudent.nome,
      plano: newStudent.plano,
      mesReferencia: 'Outubro/2026',
      valor: newStudent.valorMensalidade,
      valorOriginal: 180,
      desconto: Math.max(0, 180 - newStudent.valorMensalidade),
      dataVencimento: `2026-10-${String(newStudent.diaVencimento || 10).padStart(2, '0')}`,
      status: newStudent.statusPagamento,
      professorId: prof?.id,
      professorNome: prof?.nome,
      chavePixProfessor: prof?.chavePix
    };
    setPayments(prev => [newPayment, ...prev]);
  };

  const importStudents = (studentsList: Omit<Student, 'id' | 'presencasNaFaixa' | 'totalPresencasHistorico' | 'performance'>[]): number => {
    if (!studentsList.length) return 0;
    const now = Date.now();
    const newCreatedStudents: Student[] = [];
    const newCreatedPayments: PaymentRecord[] = [];

    studentsList.forEach((sData, index) => {
      const prof = instructors.find(i => 
        (sData.professorId && i.id === sData.professorId) || 
        (sData.professorNome && i.nome.toLowerCase() === sData.professorNome.toLowerCase())
      ) || instructors[0];

      const stId = `aluno-${now}-${index}`;
      const newStudent: Student = {
        ...sData,
        id: stId,
        professorId: prof?.id,
        professorNome: prof?.nome,
        presencasNaFaixa: 0,
        totalPresencasHistorico: 0,
        performance: {
          guarda: 6.0,
          passagem: 6.0,
          quedas: 5.5,
          finalizacoes: 5.5,
          defesa: 6.0,
          disciplina: 8.5,
          tempoRolaMinutos: 0,
          finalizacoesAplicadas: 0,
          raspagensFeitas: 0
        }
      };

      const newPay: PaymentRecord = {
        id: `pay-${now}-${index}`,
        studentId: stId,
        studentNome: newStudent.nome,
        plano: newStudent.plano,
        mesReferencia: 'Outubro/2026',
        valor: newStudent.valorMensalidade,
        valorOriginal: 180,
        desconto: Math.max(0, 180 - newStudent.valorMensalidade),
        dataVencimento: `2026-10-${String(newStudent.diaVencimento || 10).padStart(2, '0')}`,
        status: newStudent.statusPagamento,
        professorId: prof?.id,
        professorNome: prof?.nome,
        chavePixProfessor: prof?.chavePix
      };

      newCreatedStudents.push(newStudent);
      newCreatedPayments.push(newPay);
    });

    const newAuthUsers: AuthUser[] = newCreatedStudents.map(st => ({
      id: 'user-' + st.id,
      nome: st.nome,
      email: st.email,
      role: 'aluno',
      studentId: st.id,
      professorId: st.professorId,
      faixa: st.faixa,
      graus: st.graus
    }));

    setStudents(prev => [...newCreatedStudents, ...prev]);
    setPayments(prev => [...newCreatedPayments, ...prev]);
    setAllUsers(prev => [...prev, ...newAuthUsers]);
    return newCreatedStudents.length;
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    // If professor changes, update pending payments
    if (updated.professorId || updated.professorNome) {
      const prof = instructors.find(i => i.id === updated.professorId || i.nome === updated.professorNome);
      if (prof) {
        setPayments(prev => prev.map(p => {
          if (p.studentId === id && (p.status === 'pendente' || p.status === 'atrasado')) {
            return {
              ...p,
              professorId: prof.id,
              professorNome: prof.nome,
              chavePixProfessor: prof.chavePix
            };
          }
          return p;
        }));
      }
    }

    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const updateStudentGraduationSystem = (studentId: string, system: GraduationSystemType) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          sistemaGraduacao: system,
          presencasMetaGrau: system === 'apenas_faixas' ? (academySettings.aulasPorFaixaDireta || 160) : 40
        };
      }
      return s;
    }));
  };

  // Class Schedules (Turmas & Horários)
  const addClassSchedule = (classData: Omit<ClassSchedule, 'id'>) => {
    const newClass: ClassSchedule = {
      ...classData,
      id: 'turma-' + Date.now()
    };
    setClasses(prev => [...prev, newClass]);
  };

  const deleteClassSchedule = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const importClasses = (classesList: Omit<ClassSchedule, 'id'>[]): number => {
    if (!classesList.length) return 0;
    const now = Date.now();
    const newClasses: ClassSchedule[] = classesList.map((c, idx) => {
      const matchedProf = instructors.find(i => 
        (c.professorId && i.id === c.professorId) || 
        (c.professorNome && i.nome.toLowerCase().includes(c.professorNome.toLowerCase()))
      ) || instructors[0];

      return {
        ...c,
        id: `turma-${now}-${idx}`,
        professorId: matchedProf ? matchedProf.id : (c.professorId || 'inst-thiago'),
        professorNome: matchedProf ? matchedProf.nome : (c.professorNome || 'Thiago Lopes de Moraes Silva')
      };
    });
    setClasses(prev => [...prev, ...newClasses]);
    return newClasses.length;
  };

  // Instructors
  const addInstructor = (instData: Omit<Instructor, 'id'>) => {
    const newId = 'inst-' + Date.now();
    const newInst: Instructor = {
      ...instData,
      id: newId,
      sistemaGraduacao: instData.sistemaGraduacao || academySettings.sistemaGraduacaoPadrao || 'graus_e_faixas'
    };
    setInstructors(prev => [...prev, newInst]);

    const newAuth: AuthUser = {
      id: 'user-' + newId,
      nome: instData.nome,
      email: instData.email,
      role: 'professor',
      professorId: newId,
      faixa: instData.faixa,
      graus: instData.graus
    };
    setAllUsers(prev => [...prev, newAuth]);
  };

  const importInstructors = (instructorsList: Omit<Instructor, 'id'>[]): number => {
    if (!instructorsList.length) return 0;
    const now = Date.now();
    const newInsts: Instructor[] = [];
    const newUsers: AuthUser[] = [];

    instructorsList.forEach((inst, idx) => {
      const id = `inst-${now}-${idx}`;
      const newInst: Instructor = {
        ...inst,
        id,
        sistemaGraduacao: inst.sistemaGraduacao || academySettings.sistemaGraduacaoPadrao || 'graus_e_faixas'
      };
      newInsts.push(newInst);
      newUsers.push({
        id: `user-${id}`,
        nome: inst.nome,
        email: inst.email,
        role: 'professor',
        professorId: id,
        faixa: inst.faixa,
        graus: inst.graus
      });
    });

    setInstructors(prev => [...prev, ...newInsts]);
    setAllUsers(prev => [...prev, ...newUsers]);
    return newInsts.length;
  };

  const importAttendance = (records: Omit<AttendanceRecord, 'id'>[]): number => {
    if (!records.length) return 0;
    const now = Date.now();
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `pres-${now}-${idx}`
    }));

    setAttendance(prev => [...newRecords, ...prev]);

    // Update students attendance counters
    const studentCounts: Record<string, number> = {};
    newRecords.forEach(r => {
      if (r.studentId) {
        studentCounts[r.studentId] = (studentCounts[r.studentId] || 0) + 1;
      }
    });

    setStudents(prev => prev.map(s => {
      const added = studentCounts[s.id] || 0;
      if (!added) return s;
      return {
        ...s,
        presencasNaFaixa: s.presencasNaFaixa + added,
        totalPresencasHistorico: s.totalPresencasHistorico + added
      };
    }));

    return newRecords.length;
  };

  const importPayments = (paymentsList: Omit<PaymentRecord, 'id'>[]): number => {
    if (!paymentsList.length) return 0;
    const now = Date.now();
    const newPayments: PaymentRecord[] = paymentsList.map((p, idx) => ({
      ...p,
      id: `pay-${now}-${idx}`
    }));
    setPayments(prev => [...newPayments, ...prev]);
    return newPayments.length;
  };

  const updateInstructor = (id: string, updated: Partial<Instructor>) => {
    setInstructors(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    setAllUsers(prev => prev.map(u => u.professorId === id ? {
      ...u,
      nome: updated.nome || u.nome,
      email: updated.email || u.email,
      faixa: updated.faixa || u.faixa,
      graus: updated.graus !== undefined ? updated.graus : u.graus
    } : u));
  };

  const deleteInstructor = (id: string) => {
    setInstructors(prev => prev.filter(i => i.id !== id));
    setAllUsers(prev => prev.filter(u => u.professorId !== id));
  };

  const updateInstructorGraduationSystem = (instructorId: string, system: GraduationSystemType) => {
    setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, sistemaGraduacao: system } : i));
    // Cascade to their students
    setStudents(prev => prev.map(s => {
      if (s.professorId === instructorId) {
        return {
          ...s,
          sistemaGraduacao: system,
          presencasMetaGrau: system === 'apenas_faixas' ? (academySettings.aulasPorFaixaDireta || 160) : 40
        };
      }
      return s;
    }));
  };

  // Academy Settings Update
  const updateAcademySettings = (newSettings: Partial<AcademySettings>) => {
    setAcademySettings(prev => {
      const updated = { ...prev, ...newSettings };

      if (newSettings.mestreResponsavel) {
        const newMestre = newSettings.mestreResponsavel;
        const oldMestre = prev.mestreResponsavel;

        setInstructors(prevInst => prevInst.map(inst => {
          if (inst.id === 'inst-1' || inst.nome === oldMestre) {
            return {
              ...inst,
              nome: newMestre,
              faixa: newSettings.faixaMestre || inst.faixa,
              graus: newSettings.grausMestre !== undefined ? newSettings.grausMestre : inst.graus,
              registroCBJJ: newSettings.registroCBJJMestre || inst.registroCBJJ,
              chavePix: newSettings.chavePix || inst.chavePix,
              banco: newSettings.banco || inst.banco
            };
          }
          return inst;
        }));

        setAllUsers(prevUsers => prevUsers.map(u => {
          if (u.role === 'admin' || u.id === 'user-admin' || u.nome === oldMestre) {
            return {
              ...u,
              nome: newMestre,
              faixa: newSettings.faixaMestre || u.faixa,
              graus: newSettings.grausMestre !== undefined ? newSettings.grausMestre : u.graus
            };
          }
          return u;
        }));

        setCurrentUser(curr => {
          if (curr.role === 'admin' || curr.id === 'user-admin' || curr.nome === oldMestre) {
            return {
              ...curr,
              nome: newMestre,
              faixa: newSettings.faixaMestre || curr.faixa,
              graus: newSettings.grausMestre !== undefined ? newSettings.grausMestre : curr.graus
            };
          }
          return curr;
        });

        // Cascade to students assigned to this master
        setStudents(prevSt => prevSt.map(st => {
          if (st.professorId === 'inst-1' || st.professorNome === oldMestre) {
            return { ...st, professorNome: newMestre };
          }
          return st;
        }));

        // Cascade to classes taught by this master
        setClasses(prevCl => prevCl.map(cl => {
          if (cl.professorId === 'inst-1' || cl.professorNome === oldMestre) {
            return { ...cl, professorNome: newMestre };
          }
          return cl;
        }));

        // Cascade to lesson plans
        setLessonPlans(prevLp => prevLp.map(lp => {
          if (lp.professor === oldMestre) {
            return { ...lp, professor: newMestre };
          }
          return lp;
        }));

        // Cascade to events
        setEvents(prevEvt => prevEvt.map(ev => {
          if (ev.organizador === oldMestre || ev.organizador?.includes(oldMestre)) {
            return { ...ev, organizador: ev.organizador.replace(oldMestre, newMestre) };
          }
          return ev;
        }));
      }

      return updated;
    });
  };

  // Belt-specific graduation rules & IBJJF compliance helpers
  const getBeltGraduationRule = (faixa: BeltColor): BeltGraduationRule => {
    return (academySettings.regrasGraduacao && academySettings.regrasGraduacao[faixa])
      || DEFAULT_IBJJF_BELT_RULES[faixa]
      || DEFAULT_IBJJF_BELT_RULES.branca;
  };

  const updateBeltGraduationRule = (faixa: BeltColor, ruleUpdate: Partial<BeltGraduationRule>) => {
    setAcademySettings(prev => {
      const currentRules = prev.regrasGraduacao || DEFAULT_IBJJF_BELT_RULES;
      const currentRule = currentRules[faixa] || DEFAULT_IBJJF_BELT_RULES[faixa] || DEFAULT_IBJJF_BELT_RULES.branca;
      const updatedRules = {
        ...currentRules,
        [faixa]: {
          ...currentRule,
          ...ruleUpdate
        }
      };
      return {
        ...prev,
        regrasGraduacao: updatedRules
      };
    });
  };

  const resetBeltGraduationRulesToIBJJF = () => {
    setAcademySettings(prev => ({
      ...prev,
      regrasGraduacao: { ...DEFAULT_IBJJF_BELT_RULES }
    }));
  };

  const getStudentGraduationStatus = (student: Student): StudentGraduationStatus => {
    const rule = getBeltGraduationRule(student.faixa);
    const system = student.sistemaGraduacao || academySettings.sistemaGraduacaoPadrao || 'graus_e_faixas';
    
    // Determine target classes based on system & current stripes
    let metaAulas: number;
    let proximaAcao: 'grau' | 'faixa' = 'grau';
    let proximaMetaDescricao: string;

    const isInfantil = rule.categoria === 'infantil' || student.plano === 'infantil';
    const beltOrder: Record<BeltColor, BeltColor> = isInfantil ? {
      branca: 'cinza',
      cinza: 'amarela',
      amarela: 'laranja',
      laranja: 'verde',
      verde: 'azul',
      azul: 'roxa',
      roxa: 'marrom',
      marrom: 'preta',
      preta: 'preta'
    } : {
      branca: 'azul',
      cinza: 'azul',
      amarela: 'azul',
      laranja: 'azul',
      verde: 'azul',
      azul: 'roxa',
      roxa: 'marrom',
      marrom: 'preta',
      preta: 'preta'
    };

    const proximaFaixa = beltOrder[student.faixa] || 'azul';

    if (system === 'apenas_faixas') {
      metaAulas = rule.aulasPorFaixaDireta;
      proximaAcao = 'faixa';
      proximaMetaDescricao = `Exame para Faixa ${proximaFaixa.toUpperCase()}`;
    } else {
      if (student.graus < 4) {
        metaAulas = (student.graus + 1) * rule.aulasPorGrau;
        proximaAcao = 'grau';
        proximaMetaDescricao = `${student.graus + 1}º Grau da ${rule.nome}`;
      } else {
        metaAulas = 4 * rule.aulasPorGrau;
        proximaAcao = 'faixa';
        proximaMetaDescricao = `Exame para Faixa ${proximaFaixa.toUpperCase()}`;
      }
    }

    const aulasRestantes = Math.max(0, metaAulas - student.presencasNaFaixa);
    const progressoAulasPct = metaAulas > 0 ? Math.min(100, Math.round((student.presencasNaFaixa / metaAulas) * 100)) : 100;

    // Calculate time elapsed in the belt (in months)
    const refDateStr = student.dataUltimaGraduacao || student.dataInicio || '2024-01-01';
    const refDate = new Date(refDateStr + 'T00:00:00');
    const now = new Date();
    const mesesNaFaixa = Math.max(0, 
      (now.getFullYear() - refDate.getFullYear()) * 12 + (now.getMonth() - refDate.getMonth())
    );

    const tempoMinimoMesesIBJJF = rule.tempoMinimoMesesIBJJF;
    const tempoMinimoCumprido = mesesNaFaixa >= tempoMinimoMesesIBJJF;
    const aptoPorAulas = student.presencasNaFaixa >= metaAulas;
    const aptoTotalIBJJF = aptoPorAulas && (tempoMinimoMesesIBJJF === 0 || tempoMinimoCumprido);

    return {
      rule,
      metaAulas,
      aulasRestantes,
      progressoAulasPct,
      mesesNaFaixa,
      tempoMinimoMesesIBJJF,
      tempoMinimoCumprido,
      aptoPorAulas,
      aptoTotalIBJJF,
      proximaFaixa,
      proximaAcao,
      proximaMetaDescricao
    };
  };

  // Graduation
  const graduateStudent = (
    studentId: string, 
    novaFaixa: BeltColor, 
    novosGraus: number, 
    professorAvaliador: string, 
    observacao: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    const newGradRecord: GraduationHistory = {
      id: 'grad-' + Date.now(),
      studentId: student.id,
      studentNome: student.nome,
      faixaAnterior: student.faixa,
      grausAnteriores: student.graus,
      novaFaixa,
      novosGraus,
      data: todayStr,
      professorAvaliador,
      totalAulasAtingidas: student.presencasNaFaixa,
      motivoObservacao: observacao || 'Evolução técnica consistente, disciplina nos tatames e cumprimento da carga horária requerida.'
    };

    setGraduations(prev => [newGradRecord, ...prev]);

    // Update student belt, stripes and reset presencasNaFaixa if belt changed
    const beltChanged = student.faixa !== novaFaixa;
    const nextRule = getBeltGraduationRule(novaFaixa);
    const system = student.sistemaGraduacao || academySettings.sistemaGraduacaoPadrao || 'graus_e_faixas';
    const newTarget = system === 'apenas_faixas' 
      ? nextRule.aulasPorFaixaDireta 
      : ((novosGraus < 4 ? novosGraus + 1 : 4) * nextRule.aulasPorGrau);

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          faixa: novaFaixa,
          graus: novosGraus,
          dataUltimaGraduacao: todayStr,
          presencasNaFaixa: beltChanged ? 0 : s.presencasNaFaixa,
          presencasMetaGrau: newTarget
        };
      }
      return s;
    }));

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      tipo: 'graduacao',
      titulo: `Graduação Confirmada: ${student.nome}`,
      mensagem: `Parabéns ao atleta ${student.nome}! Promovido com honras para a ${novaFaixa.toUpperCase()} (${novosGraus}º Grau) por ${professorAvaliador}. Oss!`,
      destinatario: student.nome,
      telefoneDestinatario: student.telefone,
      dataHora: todayStr + ' ' + new Date().toLocaleTimeString().slice(0, 5),
      statusEnvio: 'enviado',
      canal: 'whatsapp'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Sync plan techniques to students who already have attendance
  const syncPlanWithExistingAttendance = (plan: LessonPlan) => {
    const techsTaught = extractTechniquesFromPlan(plan, techniques);
    if (techsTaught.length === 0) return;

    const attendancesForPlan = attendance.filter(a => 
      a.data === plan.data && (
        a.turmaTitulo === plan.turma ||
        (plan.turma && a.turmaTitulo.toLowerCase().includes(plan.turma.toLowerCase())) ||
        (plan.turma && plan.turma.toLowerCase().includes(a.turmaTitulo.toLowerCase())) ||
        (plan.turmaId && a.turmaId === plan.turmaId)
      )
    );

    if (attendancesForPlan.length === 0) return;
    const presentStudentIds = new Set(attendancesForPlan.map(a => a.studentId));

    setStudents(prevStudents => prevStudents.map(s => {
      if (!presentStudentIds.has(s.id)) return s;

      const existingLearned = s.tecnicasAprendidas || [];
      const newItems: LearnedTechnique[] = [];

      techsTaught.forEach(t => {
        const alreadyHas = existingLearned.some(el => 
          (el.techniqueId && el.techniqueId === t.techniqueId) ||
          (el.titulo.toLowerCase() === t.titulo.toLowerCase() && el.dataAprendida === plan.data)
        );

        if (!alreadyHas) {
          newItems.push({
            id: 'lrn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            techniqueId: t.techniqueId,
            titulo: t.titulo,
            categoria: t.categoria,
            dataAprendida: plan.data,
            aulaTitulo: plan.temaPrincipal || plan.turma,
            turmaNome: plan.turma,
            professorNome: plan.professor
          });
        }
      });

      if (newItems.length === 0) return s;
      return {
        ...s,
        tecnicasAprendidas: [...newItems, ...existingLearned]
      };
    }));
  };

  // Lesson Plans
  const addLessonPlan = (plan: Omit<LessonPlan, 'id'>) => {
    const newPlan: LessonPlan = {
      ...plan,
      id: 'aula-' + Date.now()
    };
    setLessonPlans(prev => [newPlan, ...prev]);
    syncPlanWithExistingAttendance(newPlan);
  };

  const updateLessonPlan = (id: string, updated: Partial<LessonPlan>) => {
    let fullUpdatedPlan: LessonPlan | undefined;
    setLessonPlans(prev => prev.map(p => {
      if (p.id === id) {
        fullUpdatedPlan = { ...p, ...updated };
        return fullUpdatedPlan;
      }
      return p;
    }));

    if (fullUpdatedPlan) {
      syncPlanWithExistingAttendance(fullUpdatedPlan);
    }
  };

  const toggleLessonPlanDone = (id: string) => {
    let fullUpdatedPlan: LessonPlan | undefined;
    setLessonPlans(prev => prev.map(p => {
      if (p.id === id) {
        fullUpdatedPlan = { ...p, concluida: !p.concluida };
        return fullUpdatedPlan;
      }
      return p;
    }));

    if (fullUpdatedPlan) {
      syncPlanWithExistingAttendance(fullUpdatedPlan);
    }
  };

  // Direct learned techniques management
  const addLearnedTechnique = (studentId: string, item: Omit<LearnedTechnique, 'id'>) => {
    const newItem: LearnedTechnique = {
      ...item,
      id: 'lrn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const existing = s.tecnicasAprendidas || [];
        return {
          ...s,
          tecnicasAprendidas: [newItem, ...existing]
        };
      }
      return s;
    }));
  };

  const removeLearnedTechnique = (studentId: string, learnedId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          tecnicasAprendidas: (s.tecnicasAprendidas || []).filter(t => t.id !== learnedId)
        };
      }
      return s;
    }));
  };

  // Techniques
  const addTechnique = (technique: Omit<Technique, 'id'>) => {
    const newTec: Technique = {
      ...technique,
      id: 'tec-' + Date.now()
    };
    setTechniques(prev => [newTec, ...prev]);
  };

  const importTechniques = (techniquesList: Omit<Technique, 'id'>[]): number => {
    if (!techniquesList.length) return 0;
    const now = Date.now();
    const newCreated: Technique[] = techniquesList.map((t, idx) => ({
      ...t,
      id: `tec-${now}-${idx}`
    }));
    setTechniques(prev => [...newCreated, ...prev]);
    return newCreated.length;
  };

  const updateTechnique = (id: string, updated: Partial<Technique>) => {
    setTechniques(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTechnique = (id: string) => {
    setTechniques(prev => prev.filter(t => t.id !== id));
  };

  // Payments
  const markPaymentPaid = (paymentId: string, metodo: 'PIX' | 'Dinheiro' | 'Cartão de Crédito' | 'Boleto' | 'Isento Social' = 'PIX') => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'em_dia' as PaymentStatus,
          dataPagamento: todayStr,
          metodo
        };
      }
      return p;
    }));

    // Also update student status
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setStudents(prev => prev.map(s => s.id === payment.studentId ? { ...s, statusPagamento: 'em_dia' } : s));
    }
  };

  const addPaymentRecord = (payment: Omit<PaymentRecord, 'id'>) => {
    const newPay: PaymentRecord = {
      ...payment,
      id: 'pay-' + Date.now()
    };
    setPayments(prev => [newPay, ...prev]);
  };

  // Notifications
  const sendNotification = (item: Omit<NotificationItem, 'id' | 'dataHora' | 'statusEnvio'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString().slice(0, 5);
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now(),
      dataHora: `${todayStr} ${timeStr}`,
      statusEnvio: 'enviado'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const resendNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, statusEnvio: 'enviado' } : n));
  };

  // Products
  const addProduct = (product: Omit<AcademyProduct, 'id'>) => {
    const newP: AcademyProduct = {
      ...product,
      id: 'prod-' + Date.now()
    };
    setProducts(prev => [newP, ...prev]);
  };

  const updateProductStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, estoque: Math.max(0, p.estoque + delta) } : p));
  };

  // Avaliação Histórica de Desenvolvimento dos Alunos
  const getStudentEvaluations = (studentId: string): StudentEvaluation[] => {
    return evaluations
      .filter(e => e.studentId === studentId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const addStudentEvaluation = async (
    evalData: Omit<StudentEvaluation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StudentEvaluation> => {
    // 1. Verificação de Autorização
    if (currentUser.role === 'aluno') {
      throw new Error('Acesso negado: Alunos não possuem autorização para registrar avaliações técnicas.');
    }

    const targetStudent = students.find(s => s.id === evalData.studentId);
    if (!targetStudent) {
      throw new Error('Aluno não encontrado para vinculação da avaliação.');
    }

    if (currentUser.role === 'professor' && !currentUser.isMasterAdmin) {
      const isMyStudent = targetStudent.professorId === currentUser.professorId ||
        (targetStudent.professorNome && targetStudent.professorNome.toLowerCase() === currentUser.nome.toLowerCase()) ||
        hasPermission('canManageStudents');
      if (!isMyStudent) {
        throw new Error('Acesso negado: Você só pode avaliar alunos sob sua responsabilidade técnica.');
      }
    }

    // 2. Validação rigorosa de notas: 0 a 10 em passos de 0,5
    const dimensions: (keyof DevelopmentScores)[] = ['guarda', 'passagem', 'quedas', 'finalizacoes', 'defesa', 'disciplina'];
    for (const dim of dimensions) {
      const val = evalData.scores[dim];
      if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 10) {
        throw new Error(`Nota inválida para a dimensão "${dim}": deve estar entre 0.0 e 10.0.`);
      }
      if (Math.round(val * 2) !== val * 2) {
        throw new Error(`Nota para a dimensão "${dim}" (${val}) deve respeitar o incremento de 0,5.`);
      }
    }

    if (!evalData.data || !/^\d{4}-\d{2}-\d{2}$/.test(evalData.data)) {
      throw new Error('Data da avaliação inválida (formato esperado: AAAA-MM-DD).');
    }

    const nowIso = new Date().toISOString();
    const newEval: StudentEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setEvaluations(prev => [newEval, ...prev]);

    // Sincronização em segundo plano se Supabase estiver ativo
    if (supabaseConfig.enabled && supabaseConfig.autoSync && supabaseConfig.url && supabaseConfig.anonKey) {
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        client.from('avaliacoes_desenvolvimento').insert({
          id: newEval.id,
          student_id: newEval.studentId,
          data: newEval.data,
          avaliador_id: newEval.avaliadorId || null,
          avaliador_nome: newEval.avaliadorNome || null,
          scores: newEval.scores,
          observacoes: newEval.observacoes || null,
          foco_desenvolvimento: newEval.focoDesenvolvimento || null,
          created_at: newEval.createdAt,
          updated_at: newEval.updatedAt
        }).then(({ error }) => {
          if (error) console.error('Erro ao sincronizar avaliação com Supabase:', error);
        });
      }
    }

    return newEval;
  };

  const updateStudentEvaluation = async (
    id: string,
    evalData: Partial<Omit<StudentEvaluation, 'id' | 'studentId' | 'createdAt'>>
  ): Promise<void> => {
    if (currentUser.role === 'aluno') {
      throw new Error('Acesso negado: Alunos não possuem autorização para editar avaliações.');
    }

    const currentEval = evaluations.find(e => e.id === id);
    if (!currentEval) {
      throw new Error('Avaliação não encontrada.');
    }

    const targetStudent = students.find(s => s.id === currentEval.studentId);
    if (currentUser.role === 'professor' && !currentUser.isMasterAdmin) {
      const isMyStudent = (targetStudent && (
        targetStudent.professorId === currentUser.professorId ||
        (targetStudent.professorNome && targetStudent.professorNome.toLowerCase() === currentUser.nome.toLowerCase())
      )) || hasPermission('canManageStudents');
      if (!isMyStudent) {
        throw new Error('Acesso negado: Você só pode editar avaliações de alunos sob sua responsabilidade técnica.');
      }
    }

    if (evalData.scores) {
      const dimensions: (keyof DevelopmentScores)[] = ['guarda', 'passagem', 'quedas', 'finalizacoes', 'defesa', 'disciplina'];
      for (const dim of dimensions) {
        const val = evalData.scores[dim];
        if (val !== undefined) {
          if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 10) {
            throw new Error(`Nota inválida para a dimensão "${dim}": deve estar entre 0.0 e 10.0.`);
          }
          if (Math.round(val * 2) !== val * 2) {
            throw new Error(`Nota para a dimensão "${dim}" (${val}) deve respeitar o incremento de 0,5.`);
          }
        }
      }
    }

    const nowIso = new Date().toISOString();
    let updatedObj: StudentEvaluation | null = null;
    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        updatedObj = {
          ...e,
          ...evalData,
          scores: evalData.scores ? { ...e.scores, ...evalData.scores } : e.scores,
          updatedAt: nowIso
        };
        return updatedObj;
      }
      return e;
    }));

    if (supabaseConfig.enabled && supabaseConfig.autoSync && supabaseConfig.url && supabaseConfig.anonKey && updatedObj) {
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        const u = updatedObj as StudentEvaluation;
        client.from('avaliacoes_desenvolvimento').update({
          data: u.data,
          avaliador_id: u.avaliadorId || null,
          avaliador_nome: u.avaliadorNome || null,
          scores: u.scores,
          observacoes: u.observacoes || null,
          foco_desenvolvimento: u.focoDesenvolvimento || null,
          updated_at: u.updatedAt
        }).eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao atualizar avaliação no Supabase:', error);
        });
      }
    }
  };

  const deleteStudentEvaluation = async (id: string): Promise<void> => {
    if (currentUser.role === 'aluno') {
      throw new Error('Acesso negado: Alunos não possuem autorização para excluir avaliações.');
    }

    const currentEval = evaluations.find(e => e.id === id);
    if (!currentEval) return;

    const targetStudent = students.find(s => s.id === currentEval.studentId);
    if (currentUser.role === 'professor' && !currentUser.isMasterAdmin) {
      const isMyStudent = (targetStudent && (
        targetStudent.professorId === currentUser.professorId ||
        (targetStudent.professorNome && targetStudent.professorNome.toLowerCase() === currentUser.nome.toLowerCase())
      )) || hasPermission('canManageStudents');
      if (!isMyStudent) {
        throw new Error('Acesso negado: Você só pode excluir avaliações de alunos sob sua responsabilidade técnica.');
      }
    }

    setEvaluations(prev => prev.filter(e => e.id !== id));

    if (supabaseConfig.enabled && supabaseConfig.autoSync && supabaseConfig.url && supabaseConfig.anonKey) {
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        client.from('avaliacoes_desenvolvimento').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao excluir avaliação no Supabase:', error);
        });
      }
    }
  };

  const resetDataToDefault = () => {
    setStudents(INITIAL_STUDENTS);
    setInstructors(INITIAL_INSTRUCTORS);
    setClasses(INITIAL_CLASSES);
    setAttendance(INITIAL_ATTENDANCE);
    setLessonPlans(INITIAL_LESSON_PLANS);
    setTechniques(INITIAL_TECHNIQUES);
    setGraduations(INITIAL_GRADUATIONS);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProducts(INITIAL_PRODUCTS);
    setEvents(INITIAL_EVENTS);
    setPurchases(INITIAL_PURCHASES);
    setEvaluations([]);
    setAllUsers(DEMO_USERS);
    setCurrentUser(DEMO_USERS[0]);
    setAcademySettings(DEFAULT_ACADEMY_SETTINGS);
    localStorage.clear();
  };

  return (
    <BjjContext.Provider value={{
      currentUser,
      allUsers,
      switchUser,
      loginWithEmail,
      loginWithEmailAndPassword,
      updateUser,
      updateUserPermissions,
      updateUserRole,
      addUser,
      deleteUser,
      hasPermission,
      logout,
      academySettings,
      updateAcademySettings,
      supabaseConfig,
      updateSupabaseConfig,
      syncDataWithSupabase,
      pullDataFromSupabaseContext,
      getBeltGraduationRule,
      updateBeltGraduationRule,
      resetBeltGraduationRulesToIBJJF,
      getStudentGraduationStatus,
      students,
      instructors,
      classes,
      attendance,
      lessonPlans,
      techniques,
      graduations,
      payments,
      notifications,
      products,
      events,
      purchases,
      addAttendance,
      removeAttendance,
      checkInStudentToday,
      addStudent,
      importStudents,
      updateStudent,
      deleteStudent,
      updateStudentGraduationSystem,
      addClassSchedule,
      importClasses,
      deleteClassSchedule,
      addInstructor,
      importInstructors,
      updateInstructor,
      deleteInstructor,
      updateInstructorGraduationSystem,
      importAttendance,
      importPayments,
      graduateStudent,
      addLessonPlan,
      updateLessonPlan,
      toggleLessonPlanDone,
      addTechnique,
      importTechniques,
      updateTechnique,
      deleteTechnique,
      addLearnedTechnique,
      removeLearnedTechnique,
      markPaymentPaid,
      addPaymentRecord,
      sendNotification,
      resendNotification,
      addProduct,
      updateProductStock,
      addEvent,
      toggleEnrollEvent,
      addPurchase,
      evaluations,
      addStudentEvaluation,
      updateStudentEvaluation,
      deleteStudentEvaluation,
      getStudentEvaluations,
      resetDataToDefault
    }}>
      {children}
    </BjjContext.Provider>
  );
};

export const useBjj = () => {
  const context = useContext(BjjContext);
  if (!context) {
    throw new Error('useBjj must be used within a BjjProvider');
  }
  return context;
};
