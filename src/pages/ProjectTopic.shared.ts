import type { Project, Employee, KnowledgePoint, ExamScore, BusinessRecord, Complaint } from '@/data/types';

export const POSITION_NAMES = ['咨询师', '护士', '医生', '前台', '技师'];
export const POSITION_IDS: Array<'consultant' | 'nurse' | 'doctor' | 'reception' | 'technician'> = [
  'consultant', 'nurse', 'doctor', 'reception', 'technician',
];
export const PROJECT_CATEGORIES = ['全部', '皮肤', '注射', '手术', '仪器'] as const;
export const RISK_LEVELS = ['全部', '低', '中', '高'] as const;
export const STATUS_FILTERS = ['全部', '新项目优先', '高客诉优先'] as const;
export const SORT_OPTIONS = [
  { key: 'complaintRate', label: '按客诉率↓', order: 'desc' as const },
  { key: 'volume', label: '按成交量↓', order: 'desc' as const },
  { key: 'avgScore', label: '按考核分↑', order: 'asc' as const },
];

export type CategoryFilter = typeof PROJECT_CATEGORIES[number];
export type RiskFilter = typeof RISK_LEVELS[number];
export type StatusFilter = typeof STATUS_FILTERS[number];

export interface ProjectRowData {
  id: string;
  name: string;
  category: string;
  isNew: boolean;
  riskLevel: '低' | '中' | '高';
  trainingCount: number;
  avgScore: number;
  volume: number;
  amount: number;
  complaintRate: number;
  complaintRateMom: number;
  repurchaseRate: number;
  repurchaseRateMom: number;
  coverage: number;
  complaintTypes: { name: string; value: number }[];
  recentTrend: { date: string; volume: number; complaint: number; repurchase: number }[];
  weakKnowledge: { id: string; name: string; failRate: number }[];
  failedEmployees: { id: string; name: string; avatar: string; position: string; score: number }[];
}

export const riskBadgeVariant = (r: string): 'danger' | 'warning' | 'success' => (r === '高' ? 'danger' : r === '中' ? 'warning' : 'success');
export const scoreVariant = (s: number): 'danger' | 'warning' | 'success' => (s < 70 ? 'danger' : s < 85 ? 'warning' : 'success');

export function genHeatmapData(projects: Project[]): [number, number, number][] {
  const data: [number, number, number][] = [];
  for (let y = 0; y < projects.length; y++) {
    for (let x = 0; x < POSITION_NAMES.length; x++) {
      const seed = (y + 1) * 7 + (x + 1) * 13 + projects[y].name.length;
      data.push([x, y, 30 + (seed * 7) % 71]);
    }
  }
  return data;
}

export function buildProjectRows(
  projects: Project[],
  employees: Employee[],
  examScores: ExamScore[],
  businessRecords: BusinessRecord[],
  complaints: Complaint[],
  kps: KnowledgePoint[]
): ProjectRowData[] {
  const rnd = (seed: number) => {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  };

  return projects.map((p, idx) => {
    const rand = rnd(idx * 17 + p.name.charCodeAt(0));
    const projRecords = businessRecords.filter(b => b.projectId === p.id);
    const projComplaints = complaints.filter(c => c.projectId === p.id);
    const volume = projRecords.filter(b => b.consultationConverted).length;
    const complaintRate = volume > 0 ? +(projComplaints.length / volume * 100).toFixed(2) : 0;
    const repurchaseCount = projRecords.filter(b => b.repurchaseFlag).length;
    const repurchaseRate = volume > 0 ? +(repurchaseCount / volume * 100).toFixed(1) : 0;
    const amount = +projRecords.reduce((s, b) => s + b.dealAmount, 0).toFixed(0);

    const kpIds = new Set(kps.map(k => k.id));
    const projExamScores = examScores.filter(es =>
      es.knowledgePoints.some(kp => kpIds.has(kp.knowledgePointId))
    ).slice(0, 8 + Math.floor(rand() * 12));

    const avgScore = projExamScores.length > 0
      ? +(projExamScores.reduce((s, e) => s + e.totalScore, 0) / projExamScores.length).toFixed(1)
      : 70 + Math.floor(rand() * 25);

    const recentTrend = Array.from({ length: 3 }, (_, i) => ({
      date: `${i + 1}月前`,
      volume: Math.floor(volume * (0.6 + rand() * 0.6)),
      complaint: Math.max(0, +(complaintRate * (0.8 + rand() * 0.4)).toFixed(1)),
      repurchase: Math.max(0, +(repurchaseRate * (0.8 + rand() * 0.4)).toFixed(1)),
    })).reverse();

    const complaintTypeNames = ['效果不满意', '操作不规范', '术后红肿', '价格争议', '其他'];
    const complaintTypes = complaintTypeNames.map(n => ({
      name: n, value: Math.max(1, Math.floor(rand() * Math.max(2, projComplaints.length / 2))),
    }));

    const weakKps = kps.slice(Math.floor(rand() * 10), Math.floor(rand() * 10) + 5).map(k => ({
      id: k.id, name: k.name, failRate: 20 + Math.floor(rand() * 60),
    }));

    const failedEmployees = employees
      .filter(() => rand() > 0.7)
      .slice(0, 3 + Math.floor(rand() * 4))
      .map(e => ({
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        position: POSITION_NAMES[POSITION_IDS.indexOf(e.positionId)],
        score: 50 + Math.floor(rand() * 28),
      }));

    return {
      id: p.id, name: p.name, category: p.category, isNew: p.isNew, riskLevel: p.riskLevel,
      trainingCount: 20 + Math.floor(rand() * 80), avgScore, volume, amount,
      complaintRate, complaintRateMom: +(rand() * 8 - 4).toFixed(1),
      repurchaseRate, repurchaseRateMom: +(rand() * 6 - 3).toFixed(1),
      coverage: 40 + Math.floor(rand() * 55),
      complaintTypes, recentTrend, weakKnowledge: weakKps, failedEmployees,
    };
  });
}
