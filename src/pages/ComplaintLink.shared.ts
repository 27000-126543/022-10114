import type { Employee, KnowledgePoint, Complaint, Store } from '@/data/types';

export const WEEKS = Array.from({ length: 8 }, (_, i) => `第${i + 1}周`);
export const POS_MAP: Record<string, string> = {
  consultant: '咨询师', nurse: '护士', doctor: '医生', reception: '前台', technician: '技师',
};

export type EmpRow = { emp: Employee; store: Store; lastScore: number; failCount: number };
export type KpRow = { kp: KnowledgePoint; failRate: number; avgScore: number; emps: EmpRow[] };
export type CompTypeRow = {
  type: string; monthCount: number; unresolved: number;
  courseCount: number; kpCount: number; empCount: number; kps: KpRow[];
};

export function buildTypeRows(
  complaints: Complaint[],
  kps: KnowledgePoint[],
  employees: Employee[],
  stores: Store[],
): CompTypeRow[] {
  const rnd = (seed: number) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
  const types = Array.from(new Set(complaints.map(c => c.type)));
  return types.slice(0, 7).map((t, idx) => {
    const rand = rnd(idx * 23 + t.length);
    const typeComps = complaints.filter(c => c.type === t);
    const unresolved = typeComps.filter(c => !c.resolved).length;
    const relatedKpIds = new Set(typeComps.flatMap(c => c.relatedKnowledgeGapIds));
    const kpList = kps.filter(k => relatedKpIds.has(k.id) || rand() > 0.5).slice(0, 3 + Math.floor(rand() * 3));
    const courseCount = Math.floor(rand() * 6) + 1;
    const uniqueEmpIds = new Set(typeComps.map(c => c.employeeId));
    const empsPool = employees.filter(e => uniqueEmpIds.has(e.id) || rand() > 0.7).slice(0, 10);
    const kpRows: KpRow[] = kpList.map((kp, ki) => {
      const emps: EmpRow[] = empsPool.slice(ki, ki + 2 + Math.floor(rand() * 3)).map(e => ({
        emp: e,
        store: stores.find(s => s.id === e.storeId) || stores[0],
        lastScore: 40 + Math.floor(rand() * 45),
        failCount: 1 + Math.floor(rand() * 4),
      }));
      return { kp, failRate: 15 + Math.floor(rand() * 70), avgScore: 55 + Math.floor(rand() * 35), emps };
    });
    return {
      type: t,
      monthCount: typeComps.length || 5 + Math.floor(rand() * 25),
      unresolved, courseCount, kpCount: kpList.length, empCount: empsPool.length, kps: kpRows,
    };
  });
}

export const severityBadge = (s: string) => {
  const v = s === '重大' ? 'danger' : s === '严重' ? 'warning' : 'default';
  return v;
};
