export type PositionId = 'consultant' | 'nurse' | 'doctor' | 'reception' | 'technician';

export interface Position {
  id: PositionId;
  name: string;
  color: string;
  iconName: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  employeeCount: number;
  openingDate: string;
}

export type EmployeeLevel = 'S' | 'A' | 'B' | 'C';

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  positionId: PositionId;
  storeId: string;
  hireDate: string;
  level: EmployeeLevel;
  tags: string[];
}

export type CriticalLevel = 1 | 2 | 3;

export interface KnowledgePoint {
  id: string;
  name: string;
  category: string;
  criticalLevel: CriticalLevel;
  relatedComplaintTypes?: string[];
}

export type CourseCategory = 'project' | 'regulation' | 'service' | 'sales';

export interface TrainingCourse {
  id: string;
  name: string;
  category: CourseCategory;
  requiredPositions: PositionId[];
  knowledgePointIds: string[];
  projectId?: string;
}

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed';

export interface TrainingRecord {
  id: string;
  employeeId: string;
  courseId: string;
  status: TrainingStatus;
  progress: number;
  lastStudyTime: string;
  completedTime?: string;
}

export interface Exam {
  id: string;
  courseId: string;
  name: string;
  totalScore: number;
  passScore: number;
}

export interface KnowledgePointScore {
  knowledgePointId: string;
  score: number;
  fullScore: number;
}

export interface ExamScore {
  id: string;
  employeeId: string;
  examId: string;
  courseId: string;
  knowledgePoints: KnowledgePointScore[];
  totalScore: number;
  passScore: number;
  passed: boolean;
  examDate: string;
  attemptCount: number;
}

export type ProjectCategory = '皮肤' | '注射' | '手术' | '仪器';
export type RiskLevel = '低' | '中' | '高';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  price: number;
  trainingCourseIds: string[];
  riskLevel: RiskLevel;
  isNew: boolean;
}

export interface BusinessRecord {
  id: string;
  employeeId: string;
  projectId: string;
  storeId: string;
  date: string;
  consultationConverted: boolean;
  dealAmount: number;
  repurchaseFlag: boolean;
  postopAbnormal: boolean;
}

export type Severity = '一般' | '严重' | '重大';

export interface Complaint {
  id: string;
  projectId: string;
  storeId: string;
  employeeId: string;
  date: string;
  type: string;
  severity: Severity;
  relatedKnowledgeGapIds: string[];
  resolved: boolean;
}

export interface Certificate {
  id: string;
  employeeId: string;
  type: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  daysToExpiry: number;
  projectId?: string;
}

export type MentorshipStatus = 'ongoing' | 'completed' | 'pending';

export interface Mentorship {
  id: string;
  menteeId: string;
  mentorId: string;
  knowledgePointIds: string[];
  startDate: string;
  nextExamDate: string;
  status: MentorshipStatus;
  planNotes: string;
  resultNotes?: string;
}

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  targetType: string;
  targetId?: string;
  content: string;
  mentions: string[];
  createdAt: string;
  attachments: string[];
}

export interface DashboardKPIMomChange {
  trainingCompletionRate: number;
  avgExamScore: number;
  consultationConversionRate: number;
  complaintRate: number;
  repurchaseRate: number;
}

export interface DashboardKPI {
  trainingCompletionRate: number;
  avgExamScore: number;
  consultationConversionRate: number;
  complaintRate: number;
  repurchaseRate: number;
  momChange: DashboardKPIMomChange;
}

export type WarningType = 'danger' | 'warning';

export interface WarningItem {
  id: string;
  type: WarningType;
  category: string;
  title: string;
  description: string;
  relatedId: string;
  relatedRoute: string;
  priority: number;
}

export interface RemedialKnowledgePoint {
  name: string;
  examCount: number;
  avgScore: number;
}

export type RemedialPriority = 'high' | 'medium' | 'low';

export interface RemedialListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  storeName: string;
  knowledgePoints: RemedialKnowledgePoint[];
  relatedComplaintType?: string;
  recommendedAction: string;
  priority: RemedialPriority;
  selected: boolean;
}

export type MockEndpoint =
  | 'kpi'
  | 'warnings'
  | 'positions'
  | 'stores'
  | 'employees'
  | 'projects'
  | 'knowledgePoints'
  | 'trainingCourses'
  | 'trainingRecords'
  | 'exams'
  | 'examScores'
  | 'businessRecords'
  | 'complaints'
  | 'certificates'
  | 'mentorships'
  | 'remedialList'
  | 'comments';
