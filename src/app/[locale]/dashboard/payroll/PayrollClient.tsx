'use client';

import { Wallet, BriefcaseBusiness, PenTool, Microscope } from 'lucide-react';
import styles from './payroll.module.css';

const payrollData = [
  { name: 'نورة', role: 'استراتيجية المحتوى', avatar: <BriefcaseBusiness size={18} />, color: '#8B5CF6', tier: 'مبتدئ', salary: 99 },
  { name: 'فهد', role: 'كاتب إعلانات', avatar: <PenTool size={18} />, color: '#F59E0B', tier: 'مبتدئ', salary: 99 },
  { name: 'ريم', role: 'محللة SEO', avatar: <Microscope size={18} />, color: '#10B981', tier: 'متقدم', salary: 199 },
];

export default function PayrollClient() {
  const total = payrollData.reduce((sum, a) => sum + a.salary, 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}><Wallet size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />كشف الرواتب</h1>
      <p className={styles.subtitle}>ملخص التكاليف الشهرية لموظفيك</p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>التكلفة الشهرية</span>
          <span className={styles.summaryValue}>{total} <small>ر.س</small></span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>عدد الموظفين</span>
          <span className={styles.summaryValue}>{payrollData.length}</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>المهام المستخدمة</span>
          <span className={styles.summaryValue}>12 / 50</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>الباقة</span>
          <span className={styles.summaryValue} style={{ fontSize: '1rem' }}>متقدم</span>
        </div>
      </div>

      <div className={styles.usageSection}>
        <div className={styles.usageHeader}>
          <span>استهلاك المهام</span>
          <span className={styles.usageText}>12 / 50 مهمة</span>
        </div>
        <div className={styles.usageBarBg}>
          <div className={styles.usageBarFill} style={{ width: '24%' }}></div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الدور</th>
              <th>المستوى</th>
              <th>الراتب الشهري</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((agent) => (
              <tr key={agent.name}>
                <td>
                  <div className={styles.agentCell}>
                    <span className={styles.cellAvatar} style={{ background: `${agent.color}15`, color: agent.color }}>
                      {agent.avatar}
                    </span>
                    {agent.name}
                  </div>
                </td>
                <td>{agent.role}</td>
                <td><span className={styles.tierTag}>{agent.tier}</span></td>
                <td className={styles.salaryCell}>{agent.salary} ر.س</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className={styles.totalLabel}>الإجمالي</td>
              <td className={styles.totalValue}>{total} ر.س</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
