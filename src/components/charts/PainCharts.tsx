
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ReferenceLine,
  LabelList, AreaChart, Area, ZAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { CaseData, OperationType, AdverseEventType, Gender, PostOpPainMgmt, DrugGroup, TraumaType } from '../../types';
import { COLORS, MONTH_NAMES, formatVal, cleanMedName } from '../../utils/chartUtils';

/**
 * Enhanced Table Component that calculates and displays percentages for numerical datasets.
 */
export const SimpleTable = ({ data, columns }: { data: any[], columns?: string[] }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-center py-8 italic">No data available for this period.</div>;
  }

  const allKeys = Object.keys(data[0]);

  const displayKeys = columns || allKeys.filter(k =>
    !k.endsWith('_num') &&
    !k.endsWith('_den') &&
    k !== 'fill' &&
    k !== 'breakdown' &&
    k !== 'total' &&
    k !== 'z' &&
    k !== 'numerator' &&
    k !== 'denominator'
  );

  return (
    <div className="absolute inset-0 p-4 overflow-auto custom-scrollbar bg-white dark:bg-slate-800 rounded-b-xl">
      <table className="w-full text-[11px] text-left border-collapse">
        <thead className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm z-10">
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {displayKeys.map(key => (
              <th key={key} className="px-3 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-700/50">
                {key === 'name' ? 'Label / Group' : key.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              {displayKeys.map(key => (
                <td key={key} className={`px-3 py-2 text-slate-700 dark:text-slate-200 font-medium ${typeof row[key] === 'number' ? 'text-right' : ''}`}>
                  {typeof row[key] === 'number' && (key.includes('%') || key === 'Mild' || key === 'Moderate' || key === 'Severe' || key === 'Percentage (%)') ? row[key].toFixed(1) + '%' : formatVal(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Standard Tooltip showing both value and percentage, along with numerator/denominator if provided
 */
const StandardTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg text-xs z-50 min-w-[180px]">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
          {label || data.name}
        </p>
        {payload.map((entry: any, index: number) => {
          const val = Number(entry.value);
          const isPct = String(entry.name).includes('%') || entry.name === 'Improvement %' || entry.name === 'Severe Rate %' || entry.name === 'Mild' || entry.name === 'Moderate' || entry.name === 'Severe' || entry.name === 'Percentage (%)';
          return (
            <div key={index} className="flex flex-col gap-0.5 mb-2 last:mb-0">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {val.toFixed(2)}{isPct ? '%' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

/**
 * Standard Pie Label
 */
const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, fill, name } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 10;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  if (percent < 0.01) return null;
  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill={fill} dominantBaseline="central" fontSize={9} fontWeight="bold">
        {`${name}: ${formatVal(value)} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// --- MODALITY COMPONENTS (MATCHING IMAGE.PNG) ---

const MODALITY_COLORS: Record<string, string> = {
  [PostOpPainMgmt.ManageBySurgeon]: '#3b82f6', // Blue
  [PostOpPainMgmt.RequestAnesthesiologist]: '#f59e0b', // Yellow/Orange
  // Previous colors kept for potential other uses
  [PostOpPainMgmt.Epidural]: '#8b5cf6',
  [PostOpPainMgmt.IV_Bolus]: '#ef4444',
  [PostOpPainMgmt.IV_PCA]: '#f59e0b',
  [PostOpPainMgmt.NerveBlock]: '#3b82f6',
  [PostOpPainMgmt.Oral]: '#10b981'
};

export const ModalityDistributionDonutChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const targets = [PostOpPainMgmt.ManageBySurgeon, PostOpPainMgmt.RequestAnesthesiologist];

    // If no data, provide mock distribution for these two categories
    if (!data || data.length === 0) {
      const mock = [
        { name: PostOpPainMgmt.ManageBySurgeon, value: 115 },
        { name: PostOpPainMgmt.RequestAnesthesiologist, value: 128 }
      ];
      const total = mock.reduce((a, b) => a + b.value, 0);
      return mock.map(m => ({ ...m, 'Percentage (%)': (m.value / total) * 100 }));
    }

    const counts: Record<string, number> = {
      [PostOpPainMgmt.ManageBySurgeon]: 0,
      [PostOpPainMgmt.RequestAnesthesiologist]: 0
    };

    data.forEach(d => {
      if (d.postOpPainMgmt === PostOpPainMgmt.ManageBySurgeon || d.postOpPainMgmt === PostOpPainMgmt.RequestAnesthesiologist) {
        counts[d.postOpPainMgmt]++;
      }
    });

    const total = counts[PostOpPainMgmt.ManageBySurgeon] + counts[PostOpPainMgmt.RequestAnesthesiologist];

    return targets.map(name => ({
      name,
      value: counts[name],
      'Percentage (%)': total > 0 ? (counts[name] / total) * 100 : 0
    }));
  }, [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={renderPieLabel}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={MODALITY_COLORS[entry.name as PostOpPainMgmt] || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ModalityTrendsLineChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const trendData = useMemo(() => {
    const targets = [PostOpPainMgmt.ManageBySurgeon, PostOpPainMgmt.RequestAnesthesiologist];

    // If no data, provide mock monthly trends
    if (!data || data.length === 0) {
      return MONTH_NAMES.map((name, i) => ({
        name,
        [PostOpPainMgmt.ManageBySurgeon]: 30 + Math.sin(i) * 5 + Math.random() * 5,
        [PostOpPainMgmt.RequestAnesthesiologist]: 35 + Math.cos(i) * 8 + Math.random() * 5
      }));
    }

    const mths = new Map<number, any>();
    for (let i = 0; i < 12; i++) {
      const entry: any = { name: MONTH_NAMES[i] };
      targets.forEach(m => entry[m] = 0);
      mths.set(i, entry);
    }

    data.forEach(d => {
      const m = new Date(d.date).getMonth();
      if (targets.includes(d.postOpPainMgmt)) {
        mths.get(m)[d.postOpPainMgmt]++;
      }
    });

    return Array.from(mths.values());
  }, [data]);

  if (showTable) return <SimpleTable data={trendData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="top" align="right" height={36} iconType="plainline" wrapperStyle={{ fontSize: '10px' }} />
        {[PostOpPainMgmt.ManageBySurgeon, PostOpPainMgmt.RequestAnesthesiologist].map((name) => (
          <Line key={name} type="monotone" dataKey={name} stroke={MODALITY_COLORS[name]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const MedicationGroupUsageBarChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    // If no data, provide mock counts matching image (200, 260, 110 approx)
    if (!data || data.length === 0) {
      return [
        { name: 'OPIOIDS', count: 200, fill: '#ef4444' },
        { name: 'NON-OPIOIDS', count: 260, fill: '#10b981' },
        { name: 'ADJUVANTS', count: 110, fill: '#f59e0b' }
      ];
    }

    const counts: Record<string, number> = { 'OPIOIDS': 0, 'NON-OPIOIDS': 0, 'ADJUVANTS': 0 };
    data.forEach(d => {
      d.drugGroups.forEach(dg => {
        counts[dg]++;
      });
    });

    return [
      { name: 'OPIOIDS', count: counts['OPIOIDS'], fill: '#ef4444' },
      { name: 'NON-OPIOIDS', count: counts['NON-OPIOIDS'], fill: '#10b981' },
      { name: 'ADJUVANTS', count: counts['ADJUVANTS'], fill: '#f59e0b' }
    ];
  }, [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: 'transparent' }} content={<StandardTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={120}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- CORE DASHBOARD COMPONENTS ---

export const MultiLinePainTrendChart = ({ data, type, showTable }: { data: CaseData[], type: 'rest' | 'movement', showTable?: boolean }) => {
  const [opFilter, setOpFilter] = useState<string>('All');

  const chartData = useMemo(() => {
    const filtered = opFilter === 'All' ? data : data.filter(d => d.operationType === opFilter);
    const mths = new Map<number, any>();

    for (let i = 0; i < 12; i++) {
      mths.set(i, { name: MONTH_NAMES[i], h24_sum: 0, h24_count: 0, h48_sum: 0, h48_count: 0, h72_sum: 0, h72_count: 0 });
    }

    filtered.forEach((d) => {
      const m = new Date(d.date).getMonth();
      const stats = mths.get(m);
      if (!stats) return;

      const scores = d.painScores[type];
      if (scores.h0_24 !== null) { stats.h24_sum += scores.h0_24; stats.h24_count++; }
      if (scores.h24_48 !== null) { stats.h48_sum += scores.h24_48; stats.h48_count++; }
      if (scores.h48_72 !== null) { stats.h72_sum += scores.h48_72; stats.h72_count++; }
    });

    return Array.from(mths.values()).map(m => ({
      name: m.name,
      '24h': m.h24_count > 0 ? m.h24_sum / m.h24_count : null,
      '48h': m.h48_count > 0 ? m.h48_sum / m.h48_count : null,
      '72h': m.h72_count > 0 ? m.h72_sum / m.h72_count : null
    }));
  }, [data, type, opFilter]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end mb-4 pr-2">
        <select
          value={opFilter}
          onChange={(e) => setOpFilter(e.target.value)}
          className="text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-2 py-1 outline-none font-medium text-slate-600 dark:text-slate-300"
        >
          <option value="All">All Operations</option>
          {Object.values(OperationType).map(ot => <option key={ot} value={ot}>{ot}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<StandardTooltip />} />
            <Legend verticalAlign="top" align="center" height={36} iconType="plainline" wrapperStyle={{ fontSize: '10px' }} />
            <Line type="monotone" dataKey="24h" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="48h" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="72h" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- CORRELATION HELPERS ---

const calculateGroupedPainData = (data: CaseData[], categoryField: keyof CaseData, categoryValues: any[]) => {
  return categoryValues.map(cat => {
    const catData = data.filter(d => (d as any)[categoryField] === cat);
    const getAvg = (path: (d: CaseData) => number | null) => {
      const vals = catData.map(path).filter(v => v !== null) as number[];
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    return {
      name: String(cat),
      'Rest 24h': getAvg(d => d.painScores.rest.h0_24),
      'Rest 48h': getAvg(d => d.painScores.rest.h24_48),
      'Rest 72h': getAvg(d => d.painScores.rest.h48_72),
      'Move 24h': getAvg(d => d.painScores.movement.h0_24),
      'Move 48h': getAvg(d => d.painScores.movement.h24_48),
      'Move 72h': getAvg(d => d.painScores.movement.h48_72),
      'Discharge': getAvg(d => d.painScoreDischarge)
    };
  });
};

// --- CORRELATION CHARTS ---

export const PainByGenderChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => calculateGroupedPainData(data, 'patientGender', [Gender.Male, Gender.Female]), [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Avg Pain', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
        <Bar dataKey="Discharge" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 24h" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 48h" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 72h" fill="#fcd34d" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 24h" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 48h" fill="#60a5fa" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 72h" fill="#93c5fd" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PainByTraumaTypeChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => calculateGroupedPainData(data, 'traumaType', [TraumaType.Trauma, TraumaType.NonTrauma]), [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Avg Pain', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
        <Bar dataKey="Discharge" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 24h" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 48h" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 72h" fill="#fcd34d" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 24h" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 48h" fill="#60a5fa" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 72h" fill="#93c5fd" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PainByDrugGroupChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const drugGroupLabels = useMemo(() => {
    const labels = data.map(d => d.drugGroupLabel || 'Unspecified');
    return Array.from(new Set(labels)).filter(l => l !== 'Unspecified');
  }, [data]);

  const chartData = useMemo(() => calculateGroupedPainData(data, 'drugGroupLabel', drugGroupLabels), [data, drugGroupLabels]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Avg Pain', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
        <Bar dataKey="Discharge" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 24h" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 48h" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Move 72h" fill="#fcd34d" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 24h" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 48h" fill="#60a5fa" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Rest 72h" fill="#93c5fd" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PainByOpStatusChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const opTypes = [OperationType.Elective, OperationType.NonElective, OperationType.NonOperation];

    return opTypes.map(op => {
      const opData = data.filter(d => d.operationType === op);
      const total = opData.length || 1;

      const mild = opData.filter(d => {
        const p = d.painScores.rest.h0_24;
        return p !== null && p < 4;
      }).length;

      const moderate = opData.filter(d => {
        const p = d.painScores.rest.h0_24;
        return p !== null && p >= 4 && p < 7;
      }).length;

      const severe = opData.filter(d => {
        const p = d.painScores.rest.h0_24;
        return p !== null && p >= 7;
      }).length;

      return {
        name: op,
        'Mild': (mild / total) * 100,
        'Moderate': (moderate / total) * 100,
        'Severe': (severe / total) * 100
      };
    });
  }, [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '10px' }} />
        <Bar dataKey="Mild" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Moderate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Severe" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- EXPERIENCE & PROMS CHARTS (MATCHING MOCKUP) ---

export const SatisfactionScoreDistributionChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0 };
    data.forEach(d => {
      const s = d.satisfactionScore.toString();
      if (counts[s] !== undefined) counts[s]++;
    });
    return [
      { name: '5', count: counts['5'] },
      { name: '4', count: counts['4'] },
      { name: '3', count: counts['3'] },
      { name: '2', count: counts['2'] }
    ];
  }, [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: '#f8fafc' }} content={<StandardTooltip />} />
        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SatisfactionMonthlyTrendChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, { sum: number, count: number }>();
    for (let i = 0; i < 12; i++) mths.set(i, { sum: 0, count: 0 });

    data.forEach(d => {
      const m = new Date(d.date).getMonth();
      const s = d.satisfactionScore;
      if (s > 0) {
        mths.get(m)!.sum += s;
        mths.get(m)!.count++;
      }
    });

    return Array.from(mths.entries()).map(([m, stats]) => ({
      name: MONTH_NAMES[m],
      Score: stats.count > 0 ? stats.sum / stats.count : null
    }));
  }, [data]);

  if (showTable) return <SimpleTable data={trend} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="top" align="right" height={36} iconType="plainline" wrapperStyle={{ fontSize: '9px' }} />
        <Line type="monotone" dataKey="Score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PromsImprovementChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, { sum: number, count: number }>();
    for (let i = 0; i < 12; i++) mths.set(i, { sum: 0, count: 0 });

    data.forEach(d => {
      const m = new Date(d.date).getMonth();
      const imp = d.promsImprovement;
      if (imp > 0) {
        mths.get(m)!.sum += imp;
        mths.get(m)!.count++;
      }
    });

    return Array.from(mths.entries()).map(([m, stats]) => ({
      name: MONTH_NAMES[m],
      'Improvement %': stats.count > 0 ? stats.sum / stats.count : null
    }));
  }, [data]);

  if (showTable) return <SimpleTable data={trend} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 40]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="top" align="right" height={36} iconType="plainline" wrapperStyle={{ fontSize: '9px' }} />
        <Line type="monotone" dataKey="Improvement %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PainInterferenceRadarChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const radarData = useMemo(() => {
    const totals = {
      generalActivity: 0, mood: 0, walkingAbility: 0,
      normalWork: 0, relations: 0, sleep: 0, enjoyment: 0
    };
    let count = 0;

    data.forEach(d => {
      if (d.painInterference) {
        totals.generalActivity += d.painInterference.generalActivity;
        totals.mood += d.painInterference.mood;
        totals.walkingAbility += d.painInterference.walkingAbility;
        totals.normalWork += d.painInterference.normalWork;
        totals.relations += d.painInterference.relations;
        totals.sleep += d.painInterference.sleep;
        totals.enjoyment += d.painInterference.enjoyment;
        count++;
      }
    });

    const safeCount = count || 1;
    return [
      { subject: 'general Activity', A: totals.generalActivity / safeCount, fullMark: 10 },
      { subject: 'mood', A: totals.mood / safeCount, fullMark: 10 },
      { subject: 'walking Ability', A: totals.walkingAbility / safeCount, fullMark: 10 },
      { subject: 'normal Work', A: totals.normalWork / safeCount, fullMark: 10 },
      { subject: 'relations', A: totals.relations / safeCount, fullMark: 10 },
      { subject: 'sleep', A: totals.sleep / safeCount, fullMark: 10 },
      { subject: 'enjoyment', A: totals.enjoyment / safeCount, fullMark: 10 }
    ];
  }, [data]);

  if (showTable) return <SimpleTable data={radarData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8 }} />
        <Radar
          name="Average Score"
          dataKey="A"
          stroke="#818cf8"
          fill="#818cf8"
          fillOpacity={0.6}
        />
        <Tooltip content={<StandardTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// --- PREVIOUS COMPONENTS ---

export const AgeVsInitialPainScatterChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const scatterData = useMemo(() => {
    return data
      .filter(d => d.painScores.rest.h0_24 !== null)
      .map(d => ({
        age: d.patientAge,
        pain: d.painScores.rest.h0_24,
        z: 10
      }));
  }, [data]);

  if (showTable) return <SimpleTable data={scatterData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number"
          dataKey="age"
          name="Age"
          unit=" yrs"
          domain={[0, 100]}
          tick={{ fontSize: 9 }}
          label={{ value: 'Age (yrs)', position: 'insideBottom', offset: -5, fontSize: 10 }}
        />
        <YAxis
          type="number"
          dataKey="pain"
          name="Pain"
          domain={['auto', 'auto']}
          tick={{ fontSize: 9 }}
          label={{ value: 'Pain Score', angle: -90, position: 'insideLeft', fontSize: 10 }}
        />
        <ZAxis type="number" dataKey="z" range={[50, 50]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Patient" data={scatterData} fill="#8b5cf6" fillOpacity={0.5} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const OperationTypeChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((d) => { c[d.operationType] = (c[d.operationType] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
        <YAxis tick={{ fontSize: 9 }} />
        <Tooltip content={<StandardTooltip />} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const OrthoTypePieChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((d) => { c[d.orthoType] = (c[d.orthoType] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={70} label={renderPieLabel} paddingAngle={2}>
          <Cell fill="#ef4444" /><Cell fill="#3b82f6" />
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const PainTrendChart = ({ data, type, hours = '24', showTable }: { data: CaseData[], type: 'rest' | 'movement', hours?: '24' | '72', showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const mths = new Map<number, { count: number, sum: number }>();
    data.forEach((d) => {
      const m = new Date(d.date).getMonth();
      if (!mths.has(m)) mths.set(m, { count: 0, sum: 0 });
      const scores = d.painScores[type];
      const val = hours === '24' ? scores.h0_24 : (scores.h48_72 ?? scores.h24_48);
      if (val !== null) { mths.get(m)!.count++; mths.get(m)!.sum += val; }
    });
    return Array.from(mths.keys()).sort((a, b) => a - b).map(m => ({
      name: MONTH_NAMES[m],
      'Avg Pain': mths.get(m)!.sum / (mths.get(m)!.count || 1)
    }));
  }, [data, type, hours]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} />
        <Tooltip content={<StandardTooltip />} />
        <Area type="monotone" dataKey="Avg Pain" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const PatientTypePieChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((d) => { c[d.patientType] = (c[d.patientType] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" innerRadius={40} outerRadius={60} label={renderPieLabel}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const DemographicsChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const c: Record<string, number> = { Male: 0, Female: 0 };
    data.forEach((d) => { c[d.patientGender]++; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" innerRadius={40} outerRadius={60} label={renderPieLabel}>
          <Cell fill="#6366f1" /><Cell fill="#ec4899" />
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const SpecialtyPieChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((d) => { c[d.specialty] = (c[d.specialty] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" innerRadius={40} outerRadius={60} label={renderPieLabel}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TraumaTypePieChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const trauma = data.filter(d => d.traumaType === TraumaType.Trauma).length;
    const nontrauma = data.filter(d => d.traumaType === TraumaType.NonTrauma).length;
    return [
      { name: 'Trauma', value: trauma, fill: '#f59e0b' },
      { name: 'Non-Trauma', value: nontrauma, fill: '#3b82f6' }
    ];
  }, [data]);
  if (showTable) return <SimpleTable data={chartData} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={70} label={renderPieLabel}>
          <Cell fill="#3b82f6" /><Cell fill="#f59e0b" />
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TraumaTypeMonthlyTrendChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, any>();
    data.forEach((d) => {
      const m = new Date(d.date).getMonth();
      if (!mths.has(m)) mths.set(m, { name: MONTH_NAMES[m], [TraumaType.Trauma]: 0, [TraumaType.NonTrauma]: 0 });
      if (d.traumaType === TraumaType.Trauma) mths.get(m)[TraumaType.Trauma]++;
      else if (d.traumaType === TraumaType.NonTrauma) mths.get(m)[TraumaType.NonTrauma]++;
    });
    return Array.from(mths.keys()).sort((a, b) => a - b).map(m => mths.get(m));
  }, [data]);
  if (showTable) return <SimpleTable data={trend} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={trend} margin={{ top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
        <YAxis tick={{ fontSize: 9 }} />
        <Tooltip content={<StandardTooltip />} />
        <Legend wrapperStyle={{ fontSize: '9px' }} />
        <Bar dataKey={TraumaType.Trauma} fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey={TraumaType.NonTrauma} fill="#f59e0b" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DrugGroupDistributionChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach((d) => {
      const label = d.drugGroupLabel || 'Unspecified';
      c[label] = (c[label] || 0) + 1;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);
  if (showTable) return <SimpleTable data={counts} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <Pie data={counts} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" label={renderPieLabel} paddingAngle={2}>
          {counts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const SpecificMedicationBreakdownChart = ({ data, type, showTable }: { data: CaseData[], type: 'Opioids' | 'Non-Opioids' | 'Adjuvants', showTable?: boolean }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach(d => {
      const rawText = type === 'Opioids' ? d.opioidsText : type === 'Non-Opioids' ? d.nonOpioidsText : d.adjuvantsText;
      const meds = (rawText || '').split(',').map(s => cleanMedName(s)).filter(s => s.length > 1);
      meds.forEach(m => { if (m.toLowerCase() !== 'n/a') c[m] = (c[m] || 0) + 1; });
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [data, type]);
  const total = counts.reduce((acc, curr) => acc + curr.value, 0);
  if (showTable) return <SimpleTable data={counts} />;
  const color = type === 'Opioids' ? '#ef4444' : type === 'Non-Opioids' ? '#10b981' : '#f59e0b';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={counts} layout="vertical" margin={{ top: 5, right: 80, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" axisLine={false} tick={{ fontSize: 9 }} />
        <YAxis type="category" dataKey="name" axisLine={false} tick={{ fontSize: 9 }} width={90} />
        <Tooltip content={<StandardTooltip />} />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 9, fontWeight: 'bold' }} formatter={(v: any) => `${v} (${total > 0 ? ((Number(v) / total) * 100).toFixed(1) : 0}%)`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DrugModalityCompositionChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, any>();
    data.forEach((d) => {
      const m = new Date(d.date).getMonth();
      if (!mths.has(m)) mths.set(m, { name: MONTH_NAMES[m], Opioids: 0, 'Non-Opioids': 0, Adjuvants: 0, total: 0 });
      const entry = mths.get(m);
      entry.total++;
      if (d.opioidsText && d.opioidsText.toLowerCase() !== 'n/a') entry.Opioids++;
      if (d.nonOpioidsText && d.nonOpioidsText.toLowerCase() !== 'n/a') entry['Non-Opioids']++;
      if (d.adjuvantsText && d.adjuvantsText.toLowerCase() !== 'n/a') entry.Adjuvants++;
    });
    return Array.from(mths.keys()).sort((a, b) => a - b).map(m => {
      const e = mths.get(m);
      const tot = e.total || 1;
      return { name: e.name, 'Opioids %': (e.Opioids / tot) * 100, 'Non-Opioids %': (e['Non-Opioids'] / tot) * 100, 'Adjuvants %': (e.Adjuvants / tot) * 100 };
    });
  }, [data]);
  if (showTable) return <SimpleTable data={trend} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis unit="%" tick={{ fontSize: 10 }} />
        <Tooltip content={<StandardTooltip />} />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Bar dataKey="Opioids %" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Non-Opioids %" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Adjuvants %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SeverePainFrequencyChart = ({ data, type, hours, showTable, target = 10, lineColor = '#ef4444' }: { data: CaseData[], type: 'rest' | 'movement', hours: '24' | '72', showTable?: boolean, target?: number, lineColor?: string }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, { count: number, severe: number }>();

    data.forEach((d) => {
      const m = new Date(d.date).getMonth();
      if (!mths.has(m)) mths.set(m, { count: 0, severe: 0 });

      const threshold = hours === '24' ? 3 : 5;
      const freq = type === 'rest'
        ? (hours === '24' ? d.qualityIndicators.freqRest24h : d.qualityIndicators.freqRest72h)
        : (hours === '24' ? d.qualityIndicators.freqMovement24h : d.qualityIndicators.freqMovement72h);

      mths.get(m)!.count++;

      if (freq !== null && freq >= threshold) {
        mths.get(m)!.severe++;
      }
    });

    return Array.from(mths.keys()).sort((a, b) => a - b).map(m => {
      const monthStats = mths.get(m)!;
      return {
        name: MONTH_NAMES[m],
        'Severe Rate %': (monthStats.severe / (monthStats.count || 1)) * 100,
        numerator: monthStats.severe,
        denominator: monthStats.count
      };
    });
  }, [data, type, hours]);

  if (showTable) return <SimpleTable data={trend} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trend}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
        <YAxis unit="%" tick={{ fontSize: 9 }} domain={[0, 100]} />
        <Tooltip content={<StandardTooltip />} />
        <Line type="monotone" dataKey="Severe Rate %" stroke={lineColor} strokeWidth={3} dot={{ r: 4, fill: lineColor }} />
        <ReferenceLine y={target} stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} label={{ position: 'top', value: `Target ≤ ${target}%`, fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const SatisfactionChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    data.forEach((d) => { c[d.satisfactionScore.toString()]++; });
    return Object.entries(c).map(([name, value]) => ({ name: `${name} Star`, value }));
  }, [data]);
  if (showTable) return <SimpleTable data={counts} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={counts} dataKey="value" innerRadius={40} outerRadius={60} label={renderPieLabel}>
          {counts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<StandardTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- SPECIALIZED SAFETY CHARTS (MATCHING MOCKUP IMAGE) ---

export const SafetyTrendChart = ({ data, category, showTable }: { data: CaseData[], category: 'General' | 'Severe', showTable?: boolean }) => {
  const trend = useMemo(() => {
    const mths = new Map<number, number>();
    for (let i = 0; i < 12; i++) mths.set(i, 0);

    data.forEach(d => {
      const m = new Date(d.date).getMonth();
      const events = d.adverseEvents.filter(ae => {
        const isSevere = [
          'Hypotension (Severe)', 'Resp. Depression', 'Hematoma/Bleeding',
          'Nerve Injury', 'Infection', 'Dural Puncture', 'Prolonged Motor Block',
          'Catheter Migration', 'LAST (Toxicity)', 'Anaphylaxis'
        ].includes(ae as string);
        return category === 'Severe' ? isSevere : !isSevere;
      });
      mths.set(m, mths.get(m)! + events.length);
    });

    return Array.from(mths.entries()).map(([idx, count]) => ({
      name: MONTH_NAMES[idx],
      Count: count
    }));
  }, [data, category]);

  if (showTable) return <SimpleTable data={trend} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="top" align="right" height={30} iconType="plainline" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
        <Line type="monotone" dataKey="Count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const SafetyDistributionChart = ({ data, category, showTable }: { data: CaseData[], category: 'General' | 'Severe', showTable?: boolean }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    data.forEach(d => {
      d.adverseEvents.forEach(ae => {
        const isSevere = [
          'Hypotension (Severe)', 'Resp. Depression', 'Hematoma/Bleeding',
          'Nerve Injury', 'Infection', 'Dural Puncture', 'Prolonged Motor Block',
          'Catheter Migration', 'LAST (Toxicity)', 'Anaphylaxis'
        ].includes(ae as string);

        if ((category === 'Severe' && isSevere) || (category === 'General' && !isSevere)) {
          c[ae] = (c[ae] || 0) + 1;
        }
      });
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data, category]);

  if (showTable) return <SimpleTable data={counts} />;

  const fillColor = category === 'General' ? '#f59e0b' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={counts} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9 }}
          interval={0}
          angle={-15}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 9 }} />
        <Tooltip content={<StandardTooltip />} />
        <Bar dataKey="value" fill={fillColor} radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SeverePainRest24Chart = (props: any) => <SeverePainFrequencyChart {...props} type="rest" hours="24" target={10} lineColor="#3b82f6" />;
export const SeverePainMovement24Chart = (props: any) => <SeverePainFrequencyChart {...props} type="movement" hours="24" target={15} lineColor="#f59e0b" />;
export const SeverePainRest72Chart = (props: any) => <SeverePainFrequencyChart {...props} type="rest" hours="72" target={10} lineColor="#ef4444" />;
export const SeverePainMovement72Chart = (props: any) => <SeverePainFrequencyChart {...props} type="movement" hours="72" target={10} lineColor="#8b5cf6" />;

export const PromsTrendChart = ({ data, showTable }: any) => {
  const trend = useMemo(() => {
    const mths = new Map<number, { count: number, sum: number }>();
    data.forEach((d: any) => { const m = new Date(d.date).getMonth(); if (!mths.has(m)) mths.set(m, { count: 0, sum: 0 }); mths.get(m)!.count++; mths.get(m)!.sum += d.promsImprovement; });
    return Array.from(mths.keys()).sort((a, b) => a - b).map(m => ({ name: MONTH_NAMES[m], 'Improvement %': mths.get(m)!.sum / (mths.get(m)!.count || 1) }));
  }, [data]);
  if (showTable) return <SimpleTable data={trend} />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trend}><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} /><Tooltip content={<StandardTooltip />} /><Line type="monotone" dataKey="Improvement %" stroke="#3b82f6" strokeWidth={2} /></LineChart>
    </ResponsiveContainer>
  );
};

export const DischargePainTrendChart = ({ data, showTable }: { data: CaseData[], showTable?: boolean }) => {
  const chartData = useMemo(() => {
    const mths = new Map<number, { sum: number, count: number }>();
    for (let i = 0; i < 12; i++) mths.set(i, { sum: 0, count: 0 });

    data.forEach(d => {
      const m = new Date(d.date).getMonth();
      if (d.painScoreDischarge !== null) {
        const stats = mths.get(m)!;
        stats.sum += d.painScoreDischarge;
        stats.count++;
      }
    });

    return Array.from(mths.entries()).map(([mIdx, stats]) => ({
      name: MONTH_NAMES[mIdx],
      'Avg Discharge Pain': stats.count > 0 ? stats.sum / stats.count : null
    }));
  }, [data]);

  if (showTable) return <SimpleTable data={chartData} />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip content={<StandardTooltip />} />
        <Legend verticalAlign="top" align="center" height={36} iconType="plainline" wrapperStyle={{ fontSize: '10px' }} />
        <Line type="monotone" dataKey="Avg Discharge Pain" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
