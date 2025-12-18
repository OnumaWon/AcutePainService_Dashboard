
import React, { useMemo } from 'react';
import { CaseData, TraumaType, Gender, DrugGroup } from '../types';
// Added ClipboardCheck to the imports to resolve "Cannot find name 'ClipboardCheck'" error.
import { X, AlertCircle, CheckCircle2, Star, TrendingUp, Pill, Info, ClipboardCheck } from 'lucide-react';
import { MONTH_NAMES } from '../utils/chartUtils';

interface DataTableProps {
  data: CaseData[];
  filterCriteria: { field: string; value: any } | null;
  onClearFilter: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, filterCriteria, onClearFilter }) => {
  // Sort data by date and then group by month if looking at multiple months
  const groupedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const groups: { month: string; records: CaseData[] }[] = [];

    sorted.forEach(record => {
      const monthName = MONTH_NAMES[new Date(record.date).getMonth()];
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.month === monthName) {
        lastGroup.records.push(record);
      } else {
        groups.push({ month: monthName, records: [record] });
      }
    });

    return groups;
  }, [data]);

  const renderPainBadge = (score: number | null) => {
    if (score === null) return <span className="text-slate-300">-</span>;
    const colorClass = score >= 7 ? 'text-red-600' : score >= 4 ? 'text-amber-600' : 'text-green-600';
    return <span className={`font-bold ${colorClass}`}>{score.toFixed(1)}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[750px] mt-6 transition-all" id="details-table">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Detailed Case Records
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {data.length} Total Cases
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Full longitudinal clinical and experience metrics from Excel import.</p>
        </div>

        {filterCriteria && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-right-4 duration-300 border border-blue-100 dark:border-blue-800">
            <Info size={14} />
            <span>Filter: <strong className="ml-1">{filterCriteria.field} = {String(filterCriteria.value)}</strong></span>
            <button onClick={onClearFilter} className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 p-1 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
          <ClipboardCheck size={48} className="opacity-20 mb-4" />
          <p className="text-sm font-medium">No records match the current month/year selection.</p>
        </div>
      ) : (
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-400 border-collapse">
            <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase bg-slate-100/80 dark:bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-bold tracking-wider">Patient ID</th>
                <th className="px-4 py-3 font-bold tracking-wider">Demographics</th>
                <th className="px-4 py-3 font-bold tracking-wider">Specialty & Procedure</th>
                <th className="px-4 py-3 font-bold tracking-wider">Trauma Type</th>
                <th className="px-4 py-3 font-bold tracking-wider">Medications</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Pain (24h / 72h)</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Outcome / PROMs</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Safety</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Sat.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {groupedData.map((group) => (
                <React.Fragment key={group.month}>
                  {/* Monthly Separator */}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-[37px] z-10 backdrop-blur-sm">
                    <td colSpan={9} className="px-4 py-2 border-y border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{group.month}</span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 opacity-50"></div>
                        <span className="text-[10px] text-slate-400 font-bold">{group.records.length} records</span>
                      </div>
                    </td>
                  </tr>

                  {group.records.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                      {/* ID */}
                      <td className="px-4 py-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{row.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(row.date).toLocaleDateString()}</div>
                      </td>

                      {/* Demographics */}
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                          {row.patientGender === Gender.Male ? 'M' : 'F'}, {row.patientAge}y
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">{row.nationality} • {row.payer}</div>
                      </td>

                      {/* Procedure */}
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={row.operationType}>
                          {row.operationType}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">{row.specialty}</span>
                        </div>
                      </td>

                      {/* Trauma */}
                      <td className="px-4 py-4 align-top">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.traumaType === TraumaType.Trauma
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          }`}>
                          {row.traumaType}
                        </span>
                      </td>

                      {/* Medications */}
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {row.drugGroups.map(dg => (
                            <span key={dg} className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${dg === DrugGroup.Opioids ? 'bg-red-50 text-red-600' :
                                dg === DrugGroup.NonOpioids ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                              {dg}
                            </span>
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 italic truncate" title={row.specificMedications.join(', ')}>
                          {row.specificMedications.slice(0, 2).join(', ')}{row.specificMedications.length > 2 ? '...' : ''}
                        </div>
                      </td>

                      {/* Pain Scores */}
                      <td className="px-4 py-4 align-top text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase">24h</span>
                            {renderPainBadge(row.painScores.rest.h0_24)}
                          </div>
                          <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1"></div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase">72h</span>
                            {renderPainBadge(row.painScores.rest.h48_72)}
                          </div>
                        </div>
                      </td>

                      {/* Outcomes */}
                      <td className="px-4 py-4 align-top text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-blue-600 font-bold">
                            <TrendingUp size={10} />
                            {row.promsImprovement}%
                          </div>
                          <div className="text-[8px] text-slate-400 mt-1 uppercase">Reduction: {row.painReductionRest50Percent ? 'Succ' : 'Fail'}</div>
                        </div>
                      </td>

                      {/* Safety */}
                      <td className="px-4 py-4 align-top text-center">
                        {row.adverseEvents.length > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-red-500 font-bold">
                              <AlertCircle size={12} />
                              {row.adverseEvents.length}
                            </div>
                            <div className="text-[8px] text-slate-400 truncate max-w-[60px]" title={row.adverseEvents.join(', ')}>
                              {row.adverseEvents[0]}
                            </div>
                          </div>
                        ) : (
                          <CheckCircle2 size={16} className="text-green-500 mx-auto opacity-40" />
                        )}
                      </td>

                      {/* Satisfaction */}
                      <td className="px-4 py-4 align-top text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          <span className="font-bold text-slate-700 dark:text-slate-200 mr-0.5">{row.satisfactionScore}</span>
                          <Star size={10} fill="currentColor" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
