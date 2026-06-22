import type {
  Position,
  Store,
  Employee,
  Project,
  KnowledgePoint,
  TrainingCourse,
  TrainingRecord,
  Exam,
  ExamScore,
  BusinessRecord,
  Complaint,
  Certificate,
  Mentorship,
  ReviewComment,
  DashboardKPI,
  WarningItem,
  RemedialListItem,
  MockEndpoint,
  PositionId,
  EmployeeLevel,
  CriticalLevel,
  CourseCategory,
  TrainingStatus,
  ProjectCategory,
  RiskLevel,
  Severity,
  MentorshipStatus,
  RemedialPriority,
  KnowledgePointScore,
} from '../types';

const AVATAR_PLACEHOLDER = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

const rand = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMany = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const daysFromNow = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};
const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const positions: Position[] = [
  { id: 'consultant', name: '咨询师', color: '#6366f1', iconName: 'UserCircle' },
  { id: 'nurse', name: '护士', color: '#22c55e', iconName: 'Stethoscope' },
  { id: 'doctor', name: '医师', color: '#ef4444', iconName: 'GraduationCap' },
  { id: 'reception', name: '前台', color: '#f59e0b', iconName: 'Receipt' },
  { id: 'technician', name: '技师', color: '#06b6d4', iconName: 'Wrench' },
];

export const stores: Store[] = [
  { id: 'store-bj-cy', name: '北京朝阳院', city: '北京', employeeCount: 12, openingDate: '2020-03-15' },
  { id: 'store-sh-ja', name: '上海静安院', city: '上海', employeeCount: 11, openingDate: '2020-06-20' },
  { id: 'store-gz-th', name: '广州天河院', city: '广州', employeeCount: 9, openingDate: '2021-01-10' },
  { id: 'store-sz-ns', name: '深圳南山院', city: '深圳', employeeCount: 8, openingDate: '2021-05-08' },
];

const chineseNames: string[] = [
  '张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏',
  '徐涛', '孙燕', '马超', '朱琳', '胡军', '郭莹', '林峰', '何雪', '高翔', '罗雯',
  '郑华', '梁梅', '谢明', '宋佳', '唐宇', '韩冰', '曹颖', '许阳', '邓辉', '沈婷',
  '彭博', '吕欣', '苏晨', '蒋磊', '蔡琴', '贾婷', '丁宁', '魏然', '薛松', '叶青',
];

const positionIds: PositionId[] = ['consultant', 'nurse', 'doctor', 'reception', 'technician'];
const levels: EmployeeLevel[] = ['S', 'A', 'B', 'C'];

const positionDist: Record<PositionId, number> = {
  consultant: 12,
  nurse: 10,
  doctor: 8,
  reception: 5,
  technician: 5,
};

export const employees: Employee[] = [];
let empIdx = 1;
for (const pos of positionIds) {
  const count = positionDist[pos];
  for (let i = 0; i < count; i++) {
    const storeId = stores[empIdx % stores.length].id;
    const hireDaysAgo = rand(30, 1500);
    const level = pick(levels);
    const tagPool: Record<PositionId, string[]> = {
      consultant: ['金牌销冠', '沟通达人', '产品专家', '新人', '客户好评', '复购王'],
      nurse: ['资深护师', '操作规范', '细心负责', '新人', '带教老师', '应急能手'],
      doctor: ['主刀医师', '副主任', '主治医师', '新人', '学术骨干', '患者好评'],
      reception: ['形象佳', '多语种', '流程熟', '新人', '服务之星', '细心周到'],
      technician: ['仪器专家', '操作熟练', '认证技师', '新人', '维修能手', '效率高'],
    };
    const tags = pickMany(tagPool[pos], rand(1, 3));
    employees.push({
      id: `emp-${empIdx}`,
      name: chineseNames[empIdx - 1],
      avatar: `${AVATAR_PLACEHOLDER}${empIdx}`,
      positionId: pos,
      storeId,
      hireDate: formatDate(daysAgo(hireDaysAgo)),
      level,
      tags,
    });
    empIdx++;
  }
}

const projectDefs: Array<{ name: string; category: ProjectCategory; price: number; risk: RiskLevel; isNew?: boolean }> = [
  { name: '热玛吉', category: '仪器', price: 29800, risk: '中' },
  { name: '玻尿酸填充', category: '注射', price: 6800, risk: '中' },
  { name: '超声炮', category: '仪器', price: 19800, risk: '低' },
  { name: '眼综合', category: '手术', price: 38800, risk: '高' },
  { name: '鼻综合', category: '手术', price: 49800, risk: '高' },
  { name: '光子嫩肤', category: '皮肤', price: 1980, risk: '低', isNew: true },
  { name: '热拉提', category: '仪器', price: 15800, risk: '低' },
  { name: '水光针', category: '注射', price: 2980, risk: '低', isNew: true },
  { name: '肉毒素除皱', category: '注射', price: 3800, risk: '低' },
  { name: '线雕提升', category: '手术', price: 28800, risk: '中' },
  { name: '假体隆胸', category: '手术', price: 88000, risk: '高' },
  { name: '吸脂塑形', category: '手术', price: 36800, risk: '高' },
  { name: '皮秒激光', category: '皮肤', price: 5800, risk: '低' },
  { name: 'Fotona4D', category: '仪器', price: 12800, risk: '低', isNew: true },
  { name: '黄金微针', category: '皮肤', price: 4800, risk: '低' },
];

export const projects: Project[] = projectDefs.map((p, i) => ({
  id: `proj-${i + 1}`,
  name: p.name,
  category: p.category,
  price: p.price,
  trainingCourseIds: [],
  riskLevel: p.risk,
  isNew: p.isNew || false,
}));

const kpCategories = ['合规', '操作规范', '销售技巧', '客户服务', '应急处理', '产品知识', '器械操作', '术后护理'];
const complaintTypes = ['效果不满意', '红肿淤青', '过敏反应', '感染', '疼痛', '价格争议', '服务态度', '预约问题', '术后并发症', '沟通误解'];

export const knowledgePoints: KnowledgePoint[] = [];
const kpNames = [
  '医疗美容主诊医师资格认定', '无菌操作规范流程', '客户需求深度挖掘技巧', '术前知情同意书签署要点',
  '玻尿酸注射层次与剂量控制', '热玛吉能量参数调节', '术后冰敷与护理指导', '激光祛斑禁忌症排查',
  '肉毒素注射点位精准定位', '客户投诉应急处理流程', '高净值客户维护技巧', '医疗废物分类处理规范',
  '皮肤检测仪器操作标准', '线雕线材选择与埋置深度', '敏感肌术前评估要点', '项目组合销售策略',
  '术前拍照标准化流程', '麻醉风险评估与告知', '客户隐私保护规范', '新客到店接待SOP',
  '超声炮治疗头更换规范', '水光针配比与推注速度', '术后随访时间节点与话术', '假体材料验收与溯源流程',
  '吸脂量控制与安全边界', '皮秒光斑重叠率控制', '面部血管分布图识别', '儿童/孕妇禁忌症告知',
  '销售异议处理10大场景', '会员卡办理与权益说明',
];

for (let i = 0; i < 30; i++) {
  const cl: CriticalLevel = (rand(1, 3) as CriticalLevel);
  const hasComplaint = Math.random() > 0.5;
  knowledgePoints.push({
    id: `kp-${i + 1}`,
    name: kpNames[i],
    category: kpCategories[i % kpCategories.length],
    criticalLevel: cl,
    relatedComplaintTypes: hasComplaint ? pickMany(complaintTypes, rand(1, 2)) : undefined,
  });
}

const courseNames: Array<{ name: string; category: CourseCategory; positions: PositionId[] }> = [
  { name: '热玛吉标准化操作认证课程', category: 'project', positions: ['doctor', 'technician', 'nurse'] },
  { name: '医疗美容合规执业必修课', category: 'regulation', positions: ['doctor', 'nurse', 'consultant', 'technician', 'reception'] },
  { name: '金牌咨询师销售特训营', category: 'sales', positions: ['consultant'] },
  { name: '客户满意度提升服务课', category: 'service', positions: ['consultant', 'reception', 'nurse'] },
  { name: '玻尿酸注射进阶课程', category: 'project', positions: ['doctor'] },
  { name: '超声炮操作规范培训', category: 'project', positions: ['technician', 'doctor', 'nurse'] },
  { name: '医疗纠纷预防与应对', category: 'regulation', positions: ['doctor', 'consultant', 'reception'] },
  { name: '眼综合围手术期管理', category: 'project', positions: ['doctor', 'nurse'] },
  { name: '术后护理标准化流程', category: 'service', positions: ['nurse', 'technician'] },
  { name: '皮肤美容项目联合方案设计', category: 'sales', positions: ['consultant', 'doctor'] },
  { name: '肉毒素注射精准技术', category: 'project', positions: ['doctor'] },
  { name: '新员工入职合规培训', category: 'regulation', positions: ['doctor', 'nurse', 'consultant', 'technician', 'reception'] },
  { name: 'Fotona4D多模式操作认证', category: 'project', positions: ['technician', 'doctor'] },
  { name: '高净值客户沟通与维护', category: 'sales', positions: ['consultant'] },
  { name: '鼻综合手术安全规范', category: 'project', positions: ['doctor', 'nurse'] },
  { name: '医疗器械消毒灭菌规范', category: 'regulation', positions: ['nurse', 'technician'] },
  { name: '光子嫩肤全适应症治疗', category: 'project', positions: ['technician', 'doctor', 'nurse'] },
  { name: '客户投诉处理黄金法则', category: 'service', positions: ['consultant', 'reception', 'doctor', 'nurse'] },
  { name: '吸脂手术安全操作培训', category: 'project', positions: ['doctor', 'nurse'] },
  { name: '水光针治疗全流程规范', category: 'project', positions: ['doctor', 'nurse', 'technician'] },
];

export const trainingCourses: TrainingCourse[] = courseNames.map((c, i) => {
  const kpIds = pickMany(knowledgePoints.map(k => k.id), rand(4, 8));
  const projMatch = projects.find(p => c.name.includes(p.name));
  return {
    id: `course-${i + 1}`,
    name: c.name,
    category: c.category,
    requiredPositions: c.positions,
    knowledgePointIds: kpIds,
    projectId: projMatch?.id,
  };
});

projects.forEach(p => {
  p.trainingCourseIds = trainingCourses.filter(c => c.projectId === p.id).map(c => c.id);
});

export const trainingRecords: TrainingRecord[] = [];
let trIdx = 1;
for (const emp of employees) {
  for (const course of trainingCourses) {
    if (!course.requiredPositions.includes(emp.positionId)) continue;
    const r = Math.random();
    let status: TrainingStatus;
    let progress: number;
    let completedTime: string | undefined;
    if (r < 0.55) {
      status = 'completed';
      progress = 100;
      completedTime = formatDate(daysAgo(rand(1, 120)));
    } else if (r < 0.85) {
      status = 'in_progress';
      progress = rand(10, 90);
    } else {
      status = 'not_started';
      progress = 0;
    }
    trainingRecords.push({
      id: `tr-${trIdx}`,
      employeeId: emp.id,
      courseId: course.id,
      status,
      progress,
      lastStudyTime: status === 'not_started' ? formatDate(daysAgo(rand(30, 180))) : formatDate(daysAgo(rand(0, 14))),
      completedTime,
    });
    trIdx++;
  }
}

export const exams: Exam[] = trainingCourses.map((c, i) => ({
  id: `exam-${i + 1}`,
  courseId: c.id,
  name: `${c.name}-结业考试`,
  totalScore: 100,
  passScore: 80,
}));

export const examScores: ExamScore[] = [];
let esIdx = 1;
for (const exam of exams) {
  const course = trainingCourses.find(c => c.id === exam.courseId)!;
  const takenEmployees = pickMany(
    employees.filter(e => course.requiredPositions.includes(e.positionId)),
    rand(3, 5)
  );
  for (const emp of takenEmployees) {
    const kpScores: KnowledgePointScore[] = course.knowledgePointIds.slice(0, rand(4, 6)).map(kpId => {
      const fullScore = Math.ceil(100 / course.knowledgePointIds.length);
      return {
        knowledgePointId: kpId,
        score: rand(5, fullScore),
        fullScore,
      };
    });
    const totalScore = kpScores.reduce((s, k) => s + k.score, 0);
    examScores.push({
      id: `es-${esIdx}`,
      employeeId: emp.id,
      examId: exam.id,
      courseId: course.id,
      knowledgePoints: kpScores,
      totalScore,
      passScore: exam.passScore,
      passed: totalScore >= exam.passScore,
      examDate: formatDate(daysAgo(rand(1, 90))),
      attemptCount: rand(1, 3),
    });
    esIdx++;
  }
}

export const businessRecords: BusinessRecord[] = [];
for (let i = 1; i <= 200; i++) {
  const proj = pick(projects);
  const emp = pick(employees.filter(e =>
    e.positionId === 'consultant' || e.positionId === 'doctor' || e.positionId === 'technician'
  ));
  const store = stores.find(s => s.id === emp.storeId)!;
  const converted = Math.random() < 0.72;
  businessRecords.push({
    id: `br-${i}`,
    employeeId: emp.id,
    projectId: proj.id,
    storeId: store.id,
    date: formatDate(daysAgo(rand(0, 180))),
    consultationConverted: converted,
    dealAmount: converted ? proj.price * (0.8 + Math.random() * 0.4) : 0,
    repurchaseFlag: converted && Math.random() < 0.28,
    postopAbnormal: converted && Math.random() < 0.08,
  });
}

export const complaints: Complaint[] = [];
for (let i = 1; i <= 60; i++) {
  const proj = pick(projects);
  const emp = pick(employees);
  const sevRand = Math.random();
  const severity: Severity = sevRand < 0.6 ? '一般' : sevRand < 0.88 ? '严重' : '重大';
  const gapKps = pickMany(knowledgePoints, rand(1, 3)).map(k => k.id);
  complaints.push({
    id: `comp-${i}`,
    projectId: proj.id,
    storeId: emp.storeId,
    employeeId: emp.id,
    date: formatDate(daysAgo(rand(0, 180))),
    type: pick(complaintTypes),
    severity,
    relatedKnowledgeGapIds: gapKps,
    resolved: Math.random() < 0.65,
  });
}

const certTypes = ['执业医师证', '护士执业证', '美容主诊医师证', '热玛吉操作认证', '超声炮操作认证',
  '玻尿酸注射认证', '肉毒素注射认证', '激光仪器操作证', '医疗美容咨询师证', '麻醉医师资格证'];
const certIssuers = ['国家卫生健康委员会', '中国医师协会', '中国美容医学会', 'Solta Medical原厂认证',
  '半岛医疗原厂认证', '艾尔建学院', '高德美培训学院', '科医人原厂认证'];

export const certificates: Certificate[] = [];
for (let i = 1; i <= 30; i++) {
  const emp = pick(employees);
  const type = pick(certTypes);
  const daysTo = rand(-30, 365);
  const issue = daysAgo(rand(300, 1200));
  const expiry = daysFromNow(daysTo);
  let projId: string | undefined;
  if (type.includes('热玛吉')) projId = 'proj-1';
  else if (type.includes('超声炮')) projId = 'proj-3';
  else if (type.includes('玻尿酸')) projId = 'proj-2';
  else if (type.includes('肉毒素')) projId = 'proj-9';
  certificates.push({
    id: `cert-${i}`,
    employeeId: emp.id,
    type,
    name: type,
    issuer: pick(certIssuers),
    issueDate: formatDate(issue),
    expiryDate: formatDate(expiry),
    daysToExpiry: daysTo,
    projectId: projId,
  });
}

export const mentorships: Mentorship[] = [];
const menteePool = employees.filter(e => e.level === 'C' || e.level === 'B');
const mentorPool = employees.filter(e => e.level === 'S' || e.level === 'A');
for (let i = 1; i <= 10; i++) {
  const mentee = pick(menteePool);
  const mentor = pick(mentorPool.filter(m => m.storeId === mentee.storeId && m.id !== mentee.id)) || pick(mentorPool);
  const status: MentorshipStatus = pick(['ongoing', 'completed', 'pending'] as const);
  mentorships.push({
    id: `mentor-${i}`,
    menteeId: mentee.id,
    mentorId: mentor.id,
    knowledgePointIds: pickMany(knowledgePoints.map(k => k.id), rand(3, 6)),
    startDate: formatDate(daysAgo(rand(15, 120))),
    nextExamDate: formatDate(daysFromNow(rand(7, 60))),
    status,
    planNotes: `针对${mentee.name}的薄弱环节制定专项提升计划，每周进行2次实操带教，每月考核评估。`,
    resultNotes: status === 'completed' ? `通过考核，已独立完成${rand(5, 20)}例操作，客户满意度95%以上。` : undefined,
  });
}

export const dashboardKPI: DashboardKPI = (() => {
  const total = trainingRecords.length;
  const completed = trainingRecords.filter(r => r.status === 'completed').length;
  const trainingCompletionRate = +(completed / total * 100).toFixed(1);
  const avgExamScore = +(examScores.reduce((s, e) => s + e.totalScore, 0) / examScores.length).toFixed(1);
  const convCount = businessRecords.filter(b => b.consultationConverted).length;
  const consultationConversionRate = +(convCount / businessRecords.length * 100).toFixed(1);
  const complaintRate = +(complaints.length / businessRecords.length * 100).toFixed(2);
  const repurchaseCount = businessRecords.filter(b => b.repurchaseFlag).length;
  const repurchaseRate = +(repurchaseCount / convCount * 100).toFixed(1);
  return {
    trainingCompletionRate,
    avgExamScore,
    consultationConversionRate,
    complaintRate,
    repurchaseRate,
    momChange: {
      trainingCompletionRate: +(Math.random() * 6 - 1).toFixed(1),
      avgExamScore: +(Math.random() * 6 - 2).toFixed(1),
      consultationConversionRate: +(Math.random() * 5 - 1.5).toFixed(1),
      complaintRate: +(Math.random() * -4).toFixed(2),
      repurchaseRate: +(Math.random() * 4 - 0.5).toFixed(1),
    },
  };
})();

export const warningItems: WarningItem[] = [
  {
    id: 'warn-1', type: 'danger', category: '证书到期',
    title: '3人执业证书将在30天内到期',
    description: '请及时提醒相关人员办理续期手续，避免合规风险。',
    relatedId: 'cert-expiring-30', relatedRoute: '/certificates', priority: 1,
  },
  {
    id: 'warn-2', type: 'danger', category: '重大客诉',
    title: '深圳南山院1起重大客诉尚未处理',
    description: '涉及鼻综合术后并发症，需在24小时内成立专项处理小组。',
    relatedId: 'comp-12', relatedRoute: '/complaints/comp-12', priority: 2,
  },
  {
    id: 'warn-3', type: 'danger', category: '培训缺失',
    title: '5名咨询师未完成合规必修课',
    description: '涉及新项目销售资格，请暂停其高风险项目推荐权限。',
    relatedId: 'course-2', relatedRoute: '/training/course-2', priority: 3,
  },
  {
    id: 'warn-4', type: 'warning', category: '考试成绩',
    title: '超声炮操作考试3人未通过',
    description: '涉及上海静安院2名技师，请安排补考及带教计划。',
    relatedId: 'exam-6', relatedRoute: '/exams/exam-6', priority: 4,
  },
  {
    id: 'warn-5', type: 'warning', category: '证书到期',
    title: '7张证书将在60-90天内到期',
    description: '涵盖热玛吉、超声炮等操作认证，建议提前启动续期流程。',
    relatedId: 'cert-expiring-90', relatedRoute: '/certificates', priority: 5,
  },
  {
    id: 'warn-6', type: 'warning', category: '知识缺口',
    title: '玻尿酸注射知识点考试平均得分68分',
    description: '关联2起客诉，建议组织针对性复训。',
    relatedId: 'kp-5', relatedRoute: '/knowledge/kp-5', priority: 6,
  },
  {
    id: 'warn-7', type: 'warning', category: '带教进度',
    title: '3条带教计划进度滞后超30%',
    description: '请导师及时跟进，必要时调整带教方案。',
    relatedId: 'mentor-3', relatedRoute: '/mentorships', priority: 7,
  },
  {
    id: 'warn-8', type: 'warning', category: '经营风险',
    title: '北京朝阳院术后异常率环比上升2.1%',
    description: '主要涉及热玛吉和水光针项目，请排查操作流程。',
    relatedId: 'store-bj-cy', relatedRoute: '/stores/store-bj-cy', priority: 8,
  },
  {
    id: 'warn-9', type: 'warning', category: '严重客诉',
    title: '近30天严重客诉新增5起',
    description: '较上月增加2起，主要集中在注射类项目。',
    relatedId: 'complaints-month', relatedRoute: '/complaints', priority: 9,
  },
];

const remedialActions = [
  '参加合规必修课重新学习并补考',
  '安排资深医师一对一带教2周',
  '参加专项复训+操作考核',
  '暂停独立操作权限，跟台观摩10例',
  '完成知识点自学+每周模拟考试',
  '参加客户服务标准化集训营',
  '制定个性化学习计划，每周汇报进度',
];

export const remedialList: RemedialListItem[] = (() => {
  const list: RemedialListItem[] = [];
  const weakEmployees = pickMany(employees, 18);
  for (let i = 0; i < weakEmployees.length; i++) {
    const emp = weakEmployees[i];
    const store = stores.find(s => s.id === emp.storeId)!;
    const pos = positions.find(p => p.id === emp.positionId)!;
    const kpCount = rand(1, 3);
    const selectedKps = pickMany(knowledgePoints, kpCount);
    const relatedComplaint = complaints.find(c => c.employeeId === emp.id);
    const prioRand = Math.random();
    const priority: RemedialPriority = prioRand < 0.35 ? 'high' : prioRand < 0.75 ? 'medium' : 'low';
    list.push({
      id: `remedial-${i + 1}`,
      employeeId: emp.id,
      employeeName: emp.name,
      position: pos.name,
      storeName: store.name,
      knowledgePoints: selectedKps.map(k => ({
        name: k.name,
        examCount: rand(1, 4),
        avgScore: rand(45, 72),
      })),
      relatedComplaintType: relatedComplaint?.type,
      recommendedAction: pick(remedialActions),
      priority,
      selected: false,
    });
  }
  return list;
})();

export const reviewComments: ReviewComment[] = [
  {
    id: 'cmt-1',
    authorId: 'emp-0',
    authorName: '王院长',
    authorRole: '院长',
    targetType: 'dashboard',
    content: '本月培训完成率较上月提升明显，但证书到期预警需高度重视，请人事部门在本周内梳理所有到期人员清单，逐个确认续期进度。同时建议下周组织一次合规专项考试。',
    mentions: ['李娜', '张伟'],
    createdAt: formatDate(daysAgo(1)) + 'T09:30:00',
    attachments: [],
  },
  {
    id: 'cmt-2',
    authorId: 'emp-0',
    authorName: '王院长',
    authorRole: '院长',
    targetType: 'course',
    targetId: 'course-5',
    content: '玻尿酸注射课程考试通过率偏低，问题主要出在注射层次和血管分布知识点。建议课程组增加实操视频和案例分析模块，下次考核需增加实操环节评分。',
    mentions: ['赵磊', '陈静'],
    createdAt: formatDate(daysAgo(2)) + 'T14:20:00',
    attachments: ['玻尿酸注射事故案例汇编.pdf'],
  },
  {
    id: 'cmt-3',
    authorId: 'emp-0',
    authorName: '王院长',
    authorRole: '院长',
    targetType: 'store',
    targetId: 'store-sz-ns',
    content: '深圳南山院近期客诉增多，且有1起重大客诉未关闭。请门店负责人三天内提交整改报告，重点关注术前知情告知和术后随访两个环节。总部将派督导下店检查。',
    mentions: ['刘洋', '黄丽'],
    createdAt: formatDate(daysAgo(3)) + 'T11:05:00',
    attachments: [],
  },
  {
    id: 'cmt-4',
    authorId: 'emp-0',
    authorName: '王院长',
    authorRole: '院长',
    targetType: 'remedial',
    content: '整改清单中高优先级人员请各门店在本月内完成带教闭环。S级员工需承担至少2人的带教任务，带教成果纳入季度绩效考核。HR需跟踪记录每条整改的完成情况。',
    mentions: ['周杰', '吴敏', '徐涛'],
    createdAt: formatDate(daysAgo(5)) + 'T16:45:00',
    attachments: ['Q3带教考核标准.xlsx'],
  },
  {
    id: 'cmt-5',
    authorId: 'emp-0',
    authorName: '王院长',
    authorRole: '院长',
    targetType: 'project',
    targetId: 'proj-6',
    content: '光子嫩肤作为新项目上市首月表现超预期，建议将其培训课程开放给所有咨询师学习，配合水光针做联合方案推广。同时注意观察术后异常情况数据。',
    mentions: ['孙燕', '马超'],
    createdAt: formatDate(daysAgo(7)) + 'T10:15:00',
    attachments: [],
  },
];

type EndpointReturn = {
  kpi: DashboardKPI;
  warnings: WarningItem[];
  positions: Position[];
  stores: Store[];
  employees: Employee[];
  projects: Project[];
  knowledgePoints: KnowledgePoint[];
  trainingCourses: TrainingCourse[];
  trainingRecords: TrainingRecord[];
  exams: Exam[];
  examScores: ExamScore[];
  businessRecords: BusinessRecord[];
  complaints: Complaint[];
  certificates: Certificate[];
  mentorships: Mentorship[];
  remedialList: RemedialListItem[];
  comments: ReviewComment[];
};

const endpointDataMap: EndpointReturn = {
  kpi: dashboardKPI,
  warnings: warningItems,
  positions,
  stores,
  employees,
  projects,
  knowledgePoints,
  trainingCourses,
  trainingRecords,
  exams,
  examScores,
  businessRecords,
  complaints,
  certificates,
  mentorships,
  remedialList,
  comments: reviewComments,
};

export function useMockData<T extends MockEndpoint>(
  endpoint: T
): Promise<EndpointReturn[T]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(endpointDataMap[endpoint] as EndpointReturn[T]);
    }, 500);
  });
}

export default {
  positions,
  stores,
  employees,
  projects,
  knowledgePoints,
  trainingCourses,
  trainingRecords,
  exams,
  examScores,
  businessRecords,
  complaints,
  certificates,
  mentorships,
  dashboardKPI,
  warningItems,
  remedialList,
  reviewComments,
  useMockData,
};
