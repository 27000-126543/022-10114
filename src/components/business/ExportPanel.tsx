import React, { useState } from 'react';
import {
  X, FileSpreadsheet, FileDown, Eye, Calendar, Building2,
  FileBarChart, Users, FolderKanban, MessageCircleWarning, GraduationCap, Award, Check, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  dashboardKPI,
  projects,
  complaints,
  certificates,
  remedialList,
  stores,
  positions,
  employees,
  knowledgePoints,
  trainingCourses,
  examScores,
  businessRecords,
} from '@/data/mock';

interface ExportPanelProps {
  onClose: () => void;
}

type ExportFormat = 'excel' | 'pdf';

const EXPORT_OPTIONS = [
  { key: 'kpi', label: 'KPI汇总', Icon: FileBarChart },
  { key: 'position', label: '岗位分析', Icon: Users },
  { key: 'project', label: '项目专题', Icon: FolderKanban },
  { key: 'complaint', label: '客诉分析', Icon: MessageCircleWarning },
  { key: 'remedial', label: '补训建议', Icon: GraduationCap },
  { key: 'certificate', label: '证书提醒', Icon: Award },
] as const;

const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d; };

export default function ExportPanel({ onClose }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [options, setOptions] = useState<string[]>(['kpi', 'project', 'complaint', 'certificate']);
  const [startDate, setStartDate] = useState(formatDate(monthStart()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [title, setTitle] = useState('月度培训简报');
  const [orgName, setOrgName] = useState('丽尚医美连锁集团');
  const [exporting, setExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleOption = (key: string) => {
    setOptions(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const selectedLabels = EXPORT_OPTIONS.filter(opt => options.includes(opt.key));

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProjectTrainingGap = () => {
    return projects.map(proj => {
      const projComplaints = complaints.filter(c => c.projectId === proj.id);
      const projDeals = businessRecords.filter(b => b.projectId === proj.id && b.consultationConverted);
      const avgScore = examScores
        .filter(es => trainingCourses.find(tc => tc.id === es.courseId)?.projectId === proj.id)
        .reduce((s, e) => s + e.totalScore, 0) / (examScores.filter(es => trainingCourses.find(tc => tc.id === es.courseId)?.projectId === proj.id).length || 1);
      const trainingCount = trainingCourses.filter(tc => tc.projectId === proj.id).length;
      const gapKps = knowledgePoints
        .filter(kp => projComplaints.some(c => c.relatedKnowledgeGapIds.includes(kp.id)))
        .map(kp => kp.name)
        .slice(0, 3)
        .join('、');
      return {
        项目名: proj.name,
        风险等级: proj.riskLevel,
        培训人次: trainingCount * 5,
        平均考核分: +avgScore.toFixed(1),
        成交量: projDeals.length,
        客诉率: projDeals.length > 0 ? +((projComplaints.length / projDeals.length) * 100).toFixed(2) + '%' : '0%',
        复购率: projDeals.length > 0 ? +((projDeals.filter(b => b.repurchaseFlag).length / projDeals.length) * 100).toFixed(1) + '%' : '0%',
        培训覆盖率: trainingCount > 0 ? '85%' : '0%',
        缺口知识点: gapKps || '无',
      };
    }).sort((a, b) => b.成交量 - a.成交量);
  };

  const getComplaintAssociation = () => {
    const typeMap = new Map<string, { count: number; unresolved: number; kps: Set<string>; emps: Set<string>; actions: Set<string> }>();
    complaints.forEach(c => {
      if (!typeMap.has(c.type)) {
        typeMap.set(c.type, { count: 0, unresolved: 0, kps: new Set(), emps: new Set(), actions: new Set() });
      }
      const data = typeMap.get(c.type)!;
      data.count++;
      if (!c.resolved) data.unresolved++;
      c.relatedKnowledgeGapIds.forEach(kpId => {
        const kp = knowledgePoints.find(k => k.id === kpId);
        if (kp) data.kps.add(kp.name);
      });
      const emp = employees.find(e => e.id === c.employeeId);
      if (emp) data.emps.add(emp.name);
      if (c.severity === '重大') data.actions.add('启动专项调查');
      else if (c.severity === '严重') data.actions.add('安排针对性复训');
      else data.actions.add('案例警示教育');
    });
    return Array.from(typeMap.entries()).map(([type, data]) => ({
      客诉类型: type,
      本月数: data.count,
      未解决: data.unresolved,
      关联知识点: Array.from(data.kps).slice(0, 3).join('、'),
      涉及员工: Array.from(data.emps).slice(0, 3).join('、'),
      对应措施: Array.from(data.actions).join('、'),
    })).sort((a, b) => b.本月数 - a.本月数);
  };

  const getCertificateReminders = () => {
    const empMap = new Map(employees.map(e => [e.id, e]));
    const storeMap = new Map(stores.map(s => [s.id, s]));
    const posMap = new Map(positions.map(p => [p.id, p]));
    const projMap = new Map(projects.map(p => [p.id, p]));
    return certificates
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
      .slice(0, 20)
      .map(cert => {
        const emp = empMap.get(cert.employeeId);
        const store = emp ? storeMap.get(emp.storeId) : undefined;
        const pos = emp ? posMap.get(emp.positionId) : undefined;
        const proj = cert.projectId ? projMap.get(cert.projectId) : undefined;
        return {
          证书类型: cert.type,
          持有人: emp?.name || '',
          岗位: pos?.name || '',
          门店: store?.name || '',
          签发日期: cert.issueDate,
          到期日期: cert.expiryDate,
          剩余天数: cert.daysToExpiry,
          关联项目: proj?.name || '-',
        };
      });
  };

  const getPositionAnalysis = () => {
    return positions.map(pos => {
      const posEmps = employees.filter(e => e.positionId === pos.id);
      const avgLevel = posEmps.reduce((s, e) => s + ({ S: 4, A: 3, B: 2, C: 1 }[e.level] || 0), 0) / (posEmps.length || 1);
      const trainingCount = trainingCourses.filter(tc => tc.requiredPositions.includes(pos.id)).length;
      return {
        岗位名称: pos.name,
        人数: posEmps.length,
        平均职级: ['C', 'C', 'B', 'A', 'S'][Math.round(avgLevel)],
        培训课程数: trainingCount,
        平均完成率: '78%',
        高风险预警: pos.id === 'doctor' ? 3 : pos.id === 'nurse' ? 2 : 1,
      };
    });
  };

  const getRemedialList = () => {
    return remedialList.map(item => ({
      员工姓名: item.employeeName,
      岗位: item.position,
      门店: item.storeName,
      优先级: item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低',
      薄弱知识点: item.knowledgePoints.map(kp => kp.name).join('、'),
      平均分数: Math.round(item.knowledgePoints.reduce((s, kp) => s + kp.avgScore, 0) / item.knowledgePoints.length),
      关联客诉: item.relatedComplaintType || '-',
      建议措施: item.recommendedAction,
    }));
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    if (options.includes('kpi')) {
      const kpiData = [
        ['指标名称', '当前值', '环比'],
        ['培训完成率', `${dashboardKPI.trainingCompletionRate}%`, `${dashboardKPI.momChange.trainingCompletionRate > 0 ? '↑' : '↓'} ${Math.abs(dashboardKPI.momChange.trainingCompletionRate)}%`],
        ['平均考核分', dashboardKPI.avgExamScore.toString(), `${dashboardKPI.momChange.avgExamScore > 0 ? '↑' : '↓'} ${Math.abs(dashboardKPI.momChange.avgExamScore)}分`],
        ['咨询转化率', `${dashboardKPI.consultationConversionRate}%`, `${dashboardKPI.momChange.consultationConversionRate > 0 ? '↑' : '↓'} ${Math.abs(dashboardKPI.momChange.consultationConversionRate)}%`],
        ['客诉率', `${dashboardKPI.complaintRate}%`, `${dashboardKPI.momChange.complaintRate > 0 ? '↑' : '↓'} ${Math.abs(dashboardKPI.momChange.complaintRate)}%`],
        ['复购率', `${dashboardKPI.repurchaseRate}%`, `${dashboardKPI.momChange.repurchaseRate > 0 ? '↑' : '↓'} ${Math.abs(dashboardKPI.momChange.repurchaseRate)}%`],
      ];
      const ws = XLSX.utils.aoa_to_sheet(kpiData);
      ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, '总览KPI');
    }

    if (options.includes('project')) {
      const projData = getProjectTrainingGap();
      const ws = XLSX.utils.json_to_sheet(projData);
      ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, '项目培训缺口');
    }

    if (options.includes('complaint')) {
      const compData = getComplaintAssociation();
      const ws = XLSX.utils.json_to_sheet(compData);
      ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws, '客诉关联');
    }

    if (options.includes('certificate')) {
      const certData = getCertificateReminders();
      const ws = XLSX.utils.json_to_sheet(certData);
      ws['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, '证书到期提醒');
    }

    if (options.includes('position')) {
      const posData = getPositionAnalysis();
      const ws = XLSX.utils.json_to_sheet(posData);
      ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, '岗位分析');
    }

    if (options.includes('remedial')) {
      const remData = getRemedialList();
      const ws = XLSX.utils.json_to_sheet(remData);
      ws['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, '补训建议');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `${title}_${startDate}_${endDate}.xlsx`;
    downloadBlob(blob, filename);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let yPos = margin;
    let pageNum = 1;

    const addPageIfNeeded = (heightNeeded: number) => {
      if (yPos + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        addFooter();
        pageNum++;
      }
    };

    const addFooter = () => {
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`第 ${pageNum} 页`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(224, 90, 90);
    doc.text(title, pageWidth / 2, pageHeight / 2 - 60, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text(orgName, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text(`时间范围：${startDate} 至 ${endDate}`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
    doc.text(`生成日期：${formatDate(new Date())}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

    addFooter();
    doc.addPage();
    pageNum++;

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95);
    doc.text('目  录', margin, yPos);
    yPos += 30;

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    const tocItems = [];
    if (options.includes('kpi')) tocItems.push('第1章 总览KPI');
    if (options.includes('project')) tocItems.push('第2章 项目培训缺口');
    if (options.includes('complaint')) tocItems.push('第3章 客诉关联分析');
    if (options.includes('certificate')) tocItems.push('第4章 证书到期提醒');
    if (options.includes('position')) tocItems.push('第5章 岗位分析');
    if (options.includes('remedial')) tocItems.push('第6章 补训建议');

    tocItems.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item}`, margin + 20, yPos);
      doc.text('...', pageWidth - margin - 100, yPos);
      doc.text((idx + 3).toString(), pageWidth - margin - 30, yPos, { align: 'right' });
      yPos += 25;
    });

    addFooter();

    if (options.includes('kpi')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第1章 总览KPI', margin, yPos);
      yPos += 30;

      const kpis = [
        { name: '培训完成率', value: `${dashboardKPI.trainingCompletionRate}%`, change: dashboardKPI.momChange.trainingCompletionRate },
        { name: '平均考核分', value: `${dashboardKPI.avgExamScore}分`, change: dashboardKPI.momChange.avgExamScore },
        { name: '咨询转化率', value: `${dashboardKPI.consultationConversionRate}%`, change: dashboardKPI.momChange.consultationConversionRate },
        { name: '客诉率', value: `${dashboardKPI.complaintRate}%`, change: dashboardKPI.momChange.complaintRate },
        { name: '复购率', value: `${dashboardKPI.repurchaseRate}%`, change: dashboardKPI.momChange.repurchaseRate },
      ];

      kpis.forEach(kpi => {
        addPageIfNeeded(50);
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 45, 'F');

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.name, margin + 20, yPos + 22);

        doc.setFontSize(18);
        doc.setTextColor(30, 58, 95);
        doc.text(kpi.value, margin + 180, yPos + 25);

        doc.setFontSize(12);
        const arrow = kpi.change > 0 ? '↑' : '↓';
        const changeColor = (kpi.name === '客诉率' ? kpi.change > 0 : kpi.change < 0) ? [220, 38, 38] : [34, 197, 94];
        doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
        doc.text(`${arrow} ${Math.abs(kpi.change)}% 环比`, margin + 300, yPos + 25);

        yPos += 55;
      });

      addPageIfNeeded(80);
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('时间序列说明：', margin, yPos);
      yPos += 20;
      const descriptions = [
        `培训完成率较上月${dashboardKPI.momChange.trainingCompletionRate > 0 ? '上升' : '下降'}${Math.abs(dashboardKPI.momChange.trainingCompletionRate)}个百分点，`,
        `主要得益于Q3合规培训专项的推进。平均考核分${dashboardKPI.momChange.avgExamScore > 0 ? '提升' : '下降'}${Math.abs(dashboardKPI.momChange.avgExamScore)}分，`,
        `说明知识点掌握程度${dashboardKPI.momChange.avgExamScore > 0 ? '有所提升' : '需要加强'}。客诉率${dashboardKPI.momChange.complaintRate < 0 ? '下降' : '上升'}${Math.abs(dashboardKPI.momChange.complaintRate)}个百分点，`,
        `服务质量${dashboardKPI.momChange.complaintRate < 0 ? '有所改善' : '需要关注'}。复购率保持${dashboardKPI.repurchaseRate}%的稳定水平。`
      ];
      descriptions.forEach(d => {
        doc.text(d, margin, yPos);
        yPos += 18;
      });

      addFooter();
    }

    if (options.includes('project')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第2章 项目培训缺口', margin, yPos);
      yPos += 30;

      const projData = getProjectTrainingGap().slice(0, 5);

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(224, 90, 90);
      const headers = ['项目名', '风险', '考核分', '成交量', '客诉率', '复购率'];
      const colWidths = [100, 40, 50, 50, 50, 50];
      let x = margin;
      headers.forEach((h, i) => {
        doc.rect(x, yPos, colWidths[i], 25, 'F');
        doc.text(h, x + 5, yPos + 16);
        x += colWidths[i];
      });
      yPos += 25;

      projData.forEach((row, idx) => {
        addPageIfNeeded(25);
        doc.setTextColor(51, 65, 85);
        if (idx % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 22, 'F');
        }
        x = margin;
        doc.text(row.项目名.toString(), x + 5, yPos + 15); x += colWidths[0];
        doc.text(row.风险等级.toString(), x + 5, yPos + 15); x += colWidths[1];
        doc.text(row.平均考核分.toString(), x + 5, yPos + 15); x += colWidths[2];
        doc.text(row.成交量.toString(), x + 5, yPos + 15); x += colWidths[3];
        doc.text(row.客诉率.toString(), x + 5, yPos + 15); x += colWidths[4];
        doc.text(row.复购率.toString(), x + 5, yPos + 15); x += colWidths[5];
        yPos += 22;
      });

      addPageIfNeeded(100);
      yPos += 15;
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('缺口分析：', margin, yPos);
      yPos += 20;
      const highRisk = projData.filter(p => p.风险等级 === '高');
      doc.text(`• Top5高风险项目中，${highRisk.length}个项目风险等级为"高"，需重点关注。`, margin + 10, yPos);
      yPos += 18;
      doc.text(`• 主要缺口集中在注射层次、无菌操作、应急处理等知识点领域。`, margin + 10, yPos);
      yPos += 18;
      doc.text(`• 建议增加实操带教频次，每月组织一次高风险项目专项考核。`, margin + 10, yPos);

      addFooter();
    }

    if (options.includes('complaint')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第3章 客诉关联分析', margin, yPos);
      yPos += 30;

      const compData = getComplaintAssociation().slice(0, 5);

      doc.setFontSize(11);
      compData.forEach((row, idx) => {
        addPageIfNeeded(50);
        doc.setFillColor(254, 242, 242);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 45, 'F');
        doc.setTextColor(220, 38, 38);
        doc.text(`${idx + 1}. ${row.客诉类型}`, margin + 15, yPos + 20);
        doc.setTextColor(100, 116, 139);
        doc.text(`本月${row.本月数}起 · 未解决${row.未解决}起`, margin + 200, yPos + 20);
        yPos += 45;

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`  关联知识点：${row.关联知识点 || '无'}`, margin + 15, yPos);
        yPos += 18;
        doc.text(`  对应措施：${row.对应措施}`, margin + 15, yPos);
        yPos += 25;
      });

      addPageIfNeeded(80);
      yPos += 10;
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('关联知识点映射：', margin, yPos);
      yPos += 20;
      const mappings = [
        '无菌操作规范 → 感染、红肿淤青类客诉',
        '注射层次控制 → 效果不满意、疼痛类客诉',
        '客户沟通技巧 → 价格争议、沟通误解类客诉',
        '禁忌症排查 → 过敏反应、术后并发症类客诉',
      ];
      mappings.forEach(m => {
        doc.text(`• ${m}`, margin + 10, yPos);
        yPos += 18;
      });

      addFooter();
    }

    if (options.includes('certificate')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第4章 证书到期提醒', margin, yPos);
      yPos += 30;

      const certData = getCertificateReminders();

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(99, 102, 241);
      const certHeaders = ['证书类型', '持有人', '门店', '到期日期', '剩余天数'];
      const certWidths = [120, 60, 90, 70, 60];
      let x = margin;
      certHeaders.forEach((h, i) => {
        doc.rect(x, yPos, certWidths[i], 25, 'F');
        doc.text(h, x + 5, yPos + 16);
        x += certWidths[i];
      });
      yPos += 25;

      certData.slice(0, 15).forEach((row, idx) => {
        addPageIfNeeded(22);
        doc.setTextColor(51, 65, 85);
        if (idx % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
        }
        if (row.剩余天数 <= 30) {
          doc.setTextColor(220, 38, 38);
        }
        let xPos = margin;
        doc.text(row.证书类型.toString(), xPos + 5, yPos + 14); xPos += certWidths[0];
        doc.text(row.持有人.toString(), xPos + 5, yPos + 14); xPos += certWidths[1];
        doc.text(row.门店.toString(), xPos + 5, yPos + 14); xPos += certWidths[2];
        doc.text(row.到期日期.toString(), xPos + 5, yPos + 14); xPos += certWidths[3];
        doc.text(row.剩余天数 + '天', xPos + 5, yPos + 14); xPos += certWidths[4];
        yPos += 20;
      });

      addPageIfNeeded(60);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      const urgentCount = certData.filter(c => c.剩余天数 <= 30).length;
      doc.text(`⚠ 预警提示：${urgentCount}张证书将在30天内到期，请立即启动续期流程。`, margin, yPos);
      yPos += 20;
      doc.setTextColor(100, 116, 139);
      doc.text('建议：1）提前60天启动续期准备；2）建立证书到期自动提醒机制；3）将证书有效性纳入绩效考核。', margin, yPos);

      addFooter();
    }

    if (options.includes('position')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第5章 岗位分析', margin, yPos);
      yPos += 30;

      const posData = getPositionAnalysis();
      doc.setFontSize(11);
      posData.forEach((row, idx) => {
        addPageIfNeeded(40);
        doc.setFillColor(238, 242, 255);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
        doc.setTextColor(79, 70, 229);
        doc.text(`${idx + 1}. ${row.岗位名称}`, margin + 15, yPos + 22);
        doc.setTextColor(100, 116, 139);
        doc.text(`人数：${row.人数} · 平均职级：${row.平均职级} · 培训完成率：${row.平均完成率}`, margin + 120, yPos + 22);
        yPos += 40;
      });
      addFooter();
    }

    if (options.includes('remedial')) {
      doc.addPage();
      pageNum++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text('第6章 补训建议', margin, yPos);
      yPos += 30;

      const remData = getRemedialList().slice(0, 8);
      doc.setFontSize(10);
      remData.forEach((row, idx) => {
        addPageIfNeeded(45);
        const priorityColor = row.优先级 === '高' ? [254, 226, 226] : row.优先级 === '中' ? [254, 243, 199] : [220, 252, 231];
        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
        doc.setTextColor(51, 65, 85);
        doc.text(`${idx + 1}. ${row.员工姓名}（${row.岗位}·${row.门店}）`, margin + 10, yPos + 15);
        const textColor = row.优先级 === '高' ? [220, 38, 38] : row.优先级 === '中' ? [217, 119, 6] : [22, 163, 74];
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(`[${row.优先级}优先级]`, margin + 220, yPos + 15);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text(`薄弱点：${row.薄弱知识点}`, margin + 10, yPos + 32);
        yPos += 45;
      });
      addFooter();
    }

    const pdfBuffer = doc.output('blob');
    const filename = `${title}_${startDate}_${endDate}.pdf`;
    downloadBlob(pdfBuffer, filename);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (format === 'excel') {
        exportToExcel();
      } else {
        exportToPDF();
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePreview = () => {
    alert('预览功能暂未开放，即将展示 PDF 预览页');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-[480px] max-w-[95vw] h-full bg-white shadow-[0_0_40px_rgba(30,58,95,0.18)] animate-slide-in-right flex flex-col"
      >
        <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-brand-rose-50/80 via-white to-brand-indigo-50/60 flex-shrink-0">
          <div>
            <h3 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <FileDown size={18} className="text-brand-rose-600" />
              月度简报导出
            </h3>
            <p className="text-caption text-neutral-text-secondary mt-0.5">一键生成多维度数据报告</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-border/60 flex items-center justify-center text-neutral-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">导出格式</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'excel', label: 'Excel', Icon: FileSpreadsheet, desc: '.xlsx 可编辑表格', accent: '#6FCF97' },
                { key: 'pdf', label: 'PDF', Icon: FileBarChart, desc: '.pdf 精美排版报告', accent: '#E05A5A' },
              ] as const).map(({ key, label, Icon, desc, accent }) => {
                const checked = format === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={cn(
                      'relative p-4 rounded-card border-2 text-left transition-all',
                      checked
                        ? 'border-brand-rose-500 bg-gradient-to-br from-brand-rose-50/80 to-white shadow-card'
                        : 'border-neutral-border bg-white hover:border-brand-indigo-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${accent}15`, color: accent }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-neutral-text-primary">{label}</p>
                        <p className="text-caption text-neutral-text-tertiary mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        checked ? 'border-brand-rose-500 bg-brand-rose-500' : 'border-neutral-border bg-white'
                      )}
                    >
                      {checked && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">
              导出内容 <span className="text-caption text-neutral-text-tertiary ml-1">（已选 {options.length} 项）</span>
            </label>
            <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-brand-rose-50/70 to-brand-indigo-50/50 border border-brand-rose-200/50">
              <div className="text-[11px] font-semibold text-brand-rose-700 mb-2">已选章节预览：</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLabels.map(({ key, label, Icon }) => (
                  <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/80 text-[11px] font-medium text-brand-indigo-700 border border-brand-indigo-100">
                    <Icon size={11} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {EXPORT_OPTIONS.map(({ key, label, Icon }) => {
                const checked = options.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOption(key)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] border text-left transition-all',
                      checked
                        ? 'border-brand-indigo-300 bg-brand-indigo-50/80'
                        : 'border-neutral-border bg-white hover:bg-neutral-bg/50'
                    )}
                  >
                    <input type="checkbox" readOnly checked={checked} className="w-4 h-4 accent-brand-indigo-600" />
                    <Icon size={15} className={checked ? 'text-brand-indigo-700' : 'text-neutral-text-tertiary'} strokeWidth={2} />
                    <span className={cn('text-body font-medium', checked ? 'text-neutral-text-primary' : 'text-neutral-text-secondary')}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">时间范围</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
                  />
                </div>
                <p className="text-caption text-neutral-text-tertiary mt-1">开始</p>
              </div>
              <div>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
                  />
                </div>
                <p className="text-caption text-neutral-text-tertiary mt-1">结束</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2.5">
              {[
                { label: '本月', start: formatDate(monthStart()), end: formatDate(new Date()) },
                { label: '上月', start: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); return formatDate(d); })(), end: (() => { const d = new Date(); d.setDate(0); return formatDate(d); })() },
                { label: 'Q3', start: '2025-07-01', end: '2025-09-30' },
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => { setStartDate(q.start); setEndDate(q.end); }}
                  className="px-3 py-1 text-caption font-medium rounded-pill border border-neutral-border bg-white text-neutral-text-secondary hover:bg-brand-rose-50 hover:border-brand-rose-200 hover:text-brand-rose-700 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-body font-medium text-neutral-text-secondary mb-2 block">封面标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="请输入报告封面标题"
                className="w-full px-4 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-body font-medium text-neutral-text-secondary mb-2 block flex items-center gap-1.5">
                <Building2 size={14} className="text-neutral-text-tertiary" /> 机构名称
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="请输入机构名称"
                className="w-full px-4 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">预览缩略图</label>
            <div className="rounded-card border border-neutral-border bg-gradient-to-br from-brand-indigo-50 via-white to-brand-rose-50 p-4">
              <div className="aspect-[210/297] rounded-[6px] bg-white border border-neutral-border shadow-inner-soft p-3.5">
                <div className="h-full flex flex-col">
                  <div className="h-1 rounded-pill bg-gradient-rose-gold w-2/3 mx-auto mt-2" />
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-indigo flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="h-3.5 w-28 bg-neutral-border/50 rounded mx-auto" />
                      <div className="h-4 w-36 bg-gradient-rose-gold/20 rounded mx-auto" />
                    </div>
                    <div className="pt-4 space-y-1.5 w-full px-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-2 items-center">
                          <div className={cn(
                            'w-3 h-3 rounded-sm',
                            i % 4 === 0 ? 'bg-semantic-danger' : i % 3 === 0 ? 'bg-semantic-warning' : i % 2 === 0 ? 'bg-brand-rose-400' : 'bg-brand-indigo-500'
                          )} />
                          <div className="h-2.5 bg-neutral-border/40 rounded flex-1" />
                          <div className="h-2.5 w-8 bg-neutral-border/40 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center pt-3 border-t border-neutral-border">
                    <div className="h-2 w-20 bg-neutral-border/40 rounded mx-auto" />
                    <div className="h-1.5 w-14 bg-neutral-border/30 rounded mx-auto mt-1" />
                  </div>
                </div>
              </div>
              <p className="text-caption text-neutral-text-tertiary text-center mt-2">
                共 {options.length} 个章节 · 约 {6 + options.length} 页
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg/50 flex-shrink-0">
          {showSuccess && (
            <div className="mb-3 px-4 py-2 rounded-[8px] bg-semantic-success/10 text-semantic-success text-body font-medium flex items-center gap-2 animate-fade-in">
              <Check size={16} /> 导出成功，文件已下载
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreview}
              disabled={exporting}
              className="flex-1 px-4 py-2.5 text-body font-semibold text-brand-indigo-700 rounded-[8px] border border-brand-indigo-200 bg-white hover:bg-brand-indigo-50 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye size={16} strokeWidth={2} /> 预览
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-4 py-2.5 text-body font-semibold text-white rounded-[8px] bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5 ripple disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={2} /> 生成中...
                </>
              ) : (
                <>
                  <FileDown size={16} strokeWidth={2} /> 立即导出
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
