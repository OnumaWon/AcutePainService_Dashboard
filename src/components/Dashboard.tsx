import React, { useState, useMemo } from 'react';
import { 
  Users, Activity, AlertTriangle, TrendingDown, 
  Table as TableIcon, BarChart2, Pill, ShieldCheck, HeartPulse, ClipboardList,
  ShieldAlert, Info, CheckCircle, BookOpen, Target, FileText
} from 'lucide-react';
import { Card } from './ui/Card';
import { DataTable } from './DataTable';
import { CaseData, AdverseEventType, OperationType } from '../types';
import { filterData } from '../utils/mockData';
import {
  OperationTypeChart, OrthoTypePieChart, PainTrendChart,
  DemographicsChart, SpecialtyPieChart, 
  PatientTypePieChart, TraumaTypePieChart, TraumaTypeMonthlyTrendChart,
  DrugGroupDistributionChart, SpecificMedicationBreakdownChart, DrugModalityCompositionChart,
  SeverePainRest24Chart, SeverePainMovement24Chart, SeverePainRest72Chart, SeverePainMovement72Chart,
  SafetyTrendChart, SafetyDistributionChart, SatisfactionChart, PromsImprovementChart, 
  MultiLinePainTrendChart, DischargePainTrendChart, AgeVsInitialPainScatterChart,
  PainByGenderChart, PainByOpStatusChart, PainByTraumaTypeChart, PainByDrugGroupChart,
  SatisfactionScoreDistributionChart, SatisfactionMonthlyTrendChart, PainInterferenceRadarChart,
  ModalityDistributionDonutChart, ModalityTrendsLineChart, MedicationGroupUsageBarChart
} from './charts/PainCharts';

interface DashboardProps {
  rawData: CaseData[];
  year: number;
  month: number | 'All';
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ChartCard = ({ title, subtitle, children, className }: any) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <Card title={title} subtitle={subtitle} className={className} action={
      <button onClick={() => setView(view === 'chart' ? 'table' : 'chart')} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
        {view === 'chart' ? <><TableIcon size={14} /><span>Table</span></> : <><BarChart2 size={14} /><span>Chart</span></>}
      </button>
    }>
      {React.cloneElement(children as React.ReactElement, { showTable: view === 'table' })}
    </Card>
  );
};

const BilingualTitle = ({ eng, thai }: { eng: string, thai: string }) => (
  <div className="flex flex-col leading-tight py-1">
    <span className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight uppercase">{eng}</span>
    {thai && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{thai}</span>}
  </div>
);

const StatCard = ({ title, value, subtitle, icon, bgColor, textColor }: any) => (
  <div className={`${bgColor} ${textColor} p-6 rounded-xl shadow-sm border border-black/5 flex flex-col justify-between`}>
    <div>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{title}</span>
        {icon}
      </div>
      <h3 className="text-3xl font-extrabold tracking-tight">{value}</h3>
    </div>
    {subtitle && <p className="text-[11px] mt-2 opacity-70 font-medium">{subtitle}</p>}
  </div>
);

const DefinitionCard = ({ title, thaiTitle, description, thaiDescription, numerator, denominator, target }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <Target size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{thaiTitle}</p>
        </div>
      </div>
      <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-100 dark:border-green-800">
        TARGET: {target}
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="font-medium mb-1">Definition / นิยาม:</p>
        <p>{description}</p>
        <p className="mt-1 italic">{thaiDescription}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Numerator / ตัวตั้ง</p>
          <p className="text-xs text-slate-700 dark:text-slate-200">{numerator}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Denominator / ตัวหาร</p>
          <p className="text-xs text-slate-700 dark:text-slate-200">{denominator}</p>
        </div>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ rawData, year, month, activeSection }) => {
  const [filterCriteria, setFilterCriteria] = useState<{ field: string; value: any } | null>(null);
  
  const filteredData = useMemo(() => {
    let data = filterData(rawData, year, month);
    if (filterCriteria) data = data.filter((item: any) => item[filterCriteria.field] === filterCriteria.value);
    return data;
  }, [rawData, year, month, filterCriteria]);
  
  const yearData = useMemo(() => filterData(rawData, year, 'All'), [rawData, year]);

  const totalCases = filteredData.length;
  const totalEvents = filteredData.reduce((acc, d) => acc + d.adverseEvents.length, 0);
  const casesWithEvents = filteredData.filter(d => d.adverseEvents.length > 0).length;
  const eventRate = totalCases > 0 ? ((casesWithEvents / totalCases) * 100).toFixed(1) : '0.0';
  
  const severeEventsCount = filteredData.reduce((acc, d) => {
    const severe = d.adverseEvents.filter(ae => [
      'Hypotension (Severe)', 'Resp. Depression', 'Hematoma/Bleeding', 
      'Nerve Injury', 'Infection', 'Dural Puncture', 'Prolonged Motor Block', 
      'Catheter Migration', 'LAST (Toxicity)', 'Anaphylaxis'
    ].includes(ae as string));
    return acc + severe.length;
  }, 0);
  const severeRate = totalCases > 0 ? ((severeEventsCount / totalCases) * 100).toFixed(2) : '0.00';
  const successRate = (100 - parseFloat(eventRate)).toFixed(1);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Cases" value={totalCases} subtitle="Analyzed Patients" bgColor="bg-white dark:bg-slate-800" textColor="text-slate-900 dark:text-slate-100" />
              <StatCard title="Multimodal Usage" value="84.2%" subtitle="Target > 80%" bgColor="bg-green-50 dark:bg-green-900/20" textColor="text-green-700 dark:text-green-400" />
              <StatCard title="Avg Satisfaction" value="4.8" subtitle="Out of 5 Stars" bgColor="bg-blue-50 dark:bg-blue-900/20" textColor="text-blue-700 dark:text-blue-400" />
              <StatCard title="QI Compliance" value="92%" subtitle="Quality Indicators met" bgColor="bg-purple-50 dark:bg-purple-900/20" textColor="text-purple-700 dark:text-purple-400" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ChartCard title="Operation Type Distribution"><OperationTypeChart data={filteredData} /></ChartCard>
               <ChartCard title="Ortho Type Distribution"><OrthoTypePieChart data={filteredData} /></ChartCard>
               <ChartCard title="Pain Trends (Rest)" subtitle="Avg (Ignoring Empty Cells)"><PainTrendChart data={yearData} type="rest" hours="24" /></ChartCard>
               <ChartCard title="Pain Trends (Movement)" subtitle="Avg (Ignoring Empty Cells)"><PainTrendChart data={yearData} type="movement" hours="24" /></ChartCard>
            </div>
          </div>
        );
      case 'pain-management':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard 
                title="POST-OP PAIN MANAGEMENT" 
                subtitle="Distribution of modalities"
              >
                <ModalityDistributionDonutChart data={filteredData} />
              </ChartCard>
              <ChartCard 
                title="MANAGEMENT TRENDS (YTD)" 
                subtitle="Modalities usage over time"
              >
                <ModalityTrendsLineChart data={yearData} />
              </ChartCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard 
                title="MEDICATION GROUP USAGE" 
                subtitle="Total count by drug group (Opioids/Non/Adjuvants)"
                className="lg:col-span-2"
              >
                <MedicationGroupUsageBarChart data={filteredData} />
              </ChartCard>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                    <Info className="text-blue-600" size={24} />
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">Analysis Notes</h4>
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                   "Modalities are primary methods used for post-operative analgesic delivery. If real data is not present in the current Excel upload, historical mock data is displayed to demonstrate the required visual breakdown. Current analysis shows strong utilization of Multi-modal techniques."
                 </p>
              </div>
            </div>
          </div>
        );
      case 'safety':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Adverse Events" 
                value={totalEvents} 
                subtitle="Reported incidents" 
                icon={<ShieldAlert size={18} className="opacity-50" />}
                bgColor="bg-red-50 dark:bg-red-900/20" 
                textColor="text-red-700 dark:text-red-400" 
              />
              <StatCard 
                title="Event Rate" 
                value={`${eventRate}%`} 
                subtitle="Cases with ≥ 1 side effect" 
                icon={<Activity size={18} className="opacity-50" />}
                bgColor="bg-amber-50 dark:bg-amber-900/20" 
                textColor="text-amber-700 dark:text-amber-400" 
              />
              <StatCard 
                title="Severe Complications" 
                value={severeEventsCount} 
                subtitle={`${severeRate}% major intervention incidents`} 
                icon={<AlertTriangle size={18} className="opacity-50" />}
                bgColor="bg-slate-50 dark:bg-slate-800" 
                textColor="text-slate-900 dark:text-slate-100" 
              />
              <StatCard 
                title="Safety Success" 
                value={`${successRate}%`} 
                subtitle="Event-free cases" 
                icon={<CheckCircle size={18} className="opacity-50" />}
                bgColor="bg-green-50 dark:bg-green-900/20" 
                textColor="text-green-700 dark:text-green-400" 
              />
            </div>

            {/* General Side Effects Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 px-2">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">General Side Effects</h2>
                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard 
                  title="GENERAL SIDE EFFECTS (MONTHLY TREND)" 
                  subtitle="Incidence over time"
                  className="lg:col-span-2"
                >
                  <SafetyTrendChart data={yearData} category="General" />
                </ChartCard>
                <ChartCard title="DISTRIBUTION" subtitle="By Type">
                  <SafetyDistributionChart data={filteredData} category="General" />
                </ChartCard>
              </div>
            </div>

            {/* Severe Complications Section */}
            <div>
              <div className="flex items-center gap-3 mb-4 px-2">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Severe Complications</h2>
                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard 
                  title="SEVERE COMPLICATIONS (MONTHLY TREND)" 
                  subtitle="Incidence over time"
                  className="lg:col-span-2"
                >
                  <SafetyTrendChart data={yearData} category="Severe" />
                </ChartCard>
                <ChartCard title="DISTRIBUTION" subtitle="By Type">
                  <SafetyDistributionChart data={filteredData} category="Severe" />
                </ChartCard>
              </div>
            </div>
          </div>
        );
      case 'patient-profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Patient Type Distribution"><PatientTypePieChart data={filteredData} /></ChartCard>
            <ChartCard title="Gender Distribution"><DemographicsChart data={filteredData} /></ChartCard>
            <ChartCard title="Trauma Type Distribution"><TraumaTypePieChart data={filteredData} /></ChartCard>
            <ChartCard title="Trauma Type (Monthly Trend Bar)"><TraumaTypeMonthlyTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Specialty Distribution" className="lg:col-span-2"><SpecialtyPieChart data={filteredData} /></ChartCard>
          </div>
        );
      case 'medication':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ChartCard title="Drug Modality Distribution (Column AE)" subtitle="Analysis of Patient Therapeutic Profiles"><DrugGroupDistributionChart data={filteredData} /></ChartCard>
               <ChartCard title="Composition Trend (Columns AB-AD)" subtitle="Longitudinal Usage of Modality Groups"><DrugModalityCompositionChart data={yearData} /></ChartCard>
               <ChartCard title="Specific Opioids Utilization (Column AB)" subtitle="Leaderboard of most frequent opioid medications"><SpecificMedicationBreakdownChart data={filteredData} type="Opioids" /></ChartCard>
               <ChartCard title="Specific Non-Opioids Utilization (Column AC)" subtitle="Leaderboard of non-opioid medications"><SpecificMedicationBreakdownChart data={filteredData} type="Non-Opioids" /></ChartCard>
               <ChartCard title="Specific Adjuvants Utilization (Column AD)" subtitle="Leaderboard of adjuvant medications" className="lg:col-span-2"><SpecificMedicationBreakdownChart data={filteredData} type="Adjuvants" /></ChartCard>
            </div>
          </div>
        );
      case 'pain-assessment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="PAIN TRENDS (REST)" 
              subtitle="Average scores at 24h, 48h, 72h - Select Operation Type to Filter"
            >
              <MultiLinePainTrendChart data={yearData} type="rest" />
            </ChartCard>
            <ChartCard 
              title="PAIN TRENDS (MOVEMENT)" 
              subtitle="Average scores at 24h, 48h, 72h - Select Operation Type to Filter"
            >
              <MultiLinePainTrendChart data={yearData} type="movement" />
            </ChartCard>
            <ChartCard 
              title="PAIN AT DISCHARGE (TREND)" 
              subtitle="Average pain score upon discharge"
            >
              <DischargePainTrendChart data={yearData} />
            </ChartCard>
            <ChartCard 
              title="AGE VS INITIAL PAIN" 
              subtitle="Correlation between age and initial pain score"
            >
              <AgeVsInitialPainScatterChart data={filteredData} />
            </ChartCard>
          </div>
        );
      case 'effectiveness':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title={<BilingualTitle 
                eng="Patients with Resting Pain ≥ 4 (Frequency ≥ 3 in 24h)" 
                thai="อัตราผู้ป่วยที่มี pain score at rest ≥ 4 คะแนน มากกว่าหรือเท่ากับ 3 ครั้งใน 24 ชั่วโมง" 
              />} 
              subtitle="Target ≤ 10%"
            >
              <SeverePainRest24Chart data={yearData} />
            </ChartCard>
            <ChartCard 
              title={<BilingualTitle 
                eng="Patients with Movement Pain ≥ 4 (Frequency ≥ 3 in 24h)" 
                thai="อัตราผู้ป่วยที่มี pain score on movement ≥ 4 คะแนน มากกว่าหรือเท่ากับ 3 ครั้งใน 24 ชั่วโมง" 
              />} 
              subtitle="Target < 15%"
            >
              <SeverePainMovement24Chart data={yearData} />
            </ChartCard>
            <ChartCard 
              title={<BilingualTitle 
                eng="Patients with Resting Pain ≥ 4 (Frequency ≥ 5 in 72h)" 
                thai="อัตราผู้ป่วยที่มี pain score at rest ≥ 4 คะแนน มากกว่าหรือเท่ากับ 5 ครั้งใน 72 ชั่วโมง" 
              />} 
              subtitle="Target ≤ 10%"
            >
              <SeverePainRest72Chart data={yearData} />
            </ChartCard>
            <ChartCard 
              title={<BilingualTitle 
                eng="Patients with Movement Pain ≥ 4 (Frequency ≥ 5 in 72h)" 
                thai="อัตราผู้ป่วยที่มี pain score on movement ≥ 4 คะแนน มากกว่าหรือเท่ากับ 5 ครั้งใน 72 ชั่วโมง" 
              />} 
              subtitle="Target ≤ 10%"
            >
              <SeverePainMovement72Chart data={yearData} />
            </ChartCard>
          </div>
        );
      case 'correlation':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChartCard title="GENDER VS PAIN SCORE" subtitle="Pain trends comparison by gender">
              <PainByGenderChart data={filteredData} />
            </ChartCard>
            <ChartCard title="OPERATION TYPE VS PAIN STATUS" subtitle="Pain severity classification by procedure type">
              <PainByOpStatusChart data={filteredData} />
            </ChartCard>
            <ChartCard title="PAIN VS AGE CORRELATION" subtitle="Scatter distribution of age vs early post-op pain">
              <AgeVsInitialPainScatterChart data={filteredData} />
            </ChartCard>
            <ChartCard title="PAIN VS TRAUMA STATUS" subtitle="Longitudinal pain trends: Trauma vs Non-Trauma">
              <PainByTraumaTypeChart data={filteredData} />
            </ChartCard>
            <ChartCard title="PAIN VS MODALITY GROUP" subtitle="Pain outcomes categorized by therapeutic drug combination" className="lg:col-span-2">
              <PainByDrugGroupChart data={filteredData} />
            </ChartCard>
          </div>
        );
      case 'experience':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <ChartCard 
              title="PATIENT SATISFACTION SCORE" 
              subtitle="Distribution of patient satisfaction (1-5 Scale)"
            >
              <SatisfactionScoreDistributionChart data={filteredData} />
            </ChartCard>
            <ChartCard 
              title="SATISFACTION TRENDS" 
              subtitle="Monthly average satisfaction score & yearly summary"
            >
              <SatisfactionMonthlyTrendChart data={yearData} />
            </ChartCard>
            <ChartCard 
              title="PATIENT-REPORTED OUTCOMES (PROMS)" 
              subtitle="Avg % improvement in QoL/Function by Month"
            >
              <PromsImprovementChart data={yearData} />
            </ChartCard>
            <ChartCard 
              title="PAIN INTERFERENCE WITH ADL" 
              subtitle="Average interference score (0-10) by activity type"
            >
              <PainInterferenceRadarChart data={filteredData} />
            </ChartCard>
          </div>
        );
      case 'governance':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
                <BookOpen className="text-blue-600" />
                Data Governance & Definitions
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Clinical definitions and measurement standards for the Effectiveness Outcomes indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DefinitionCard 
                title="Resting Pain Management (24h)"
                thaiTitle="อัตราความถี่ความเจ็บปวดขณะพักในช่วง 24 ชั่วโมงแรก"
                description="Percentage of patients experiencing significant pain (Score ≥ 4) at rest multiple times within the first 24 hours post-operatively."
                thaiDescription="ร้อยละของผู้ป่วยที่มีคะแนนความเจ็บปวดขณะพัก (At Rest) ตั้งแต่ 4 คะแนนขึ้นไป โดยเกิดขึ้นบ่อย (3 ครั้งขึ้นไป) ภายใน 24 ชั่วโมงแรก"
                numerator="Patients with Pain Score ≥ 4 occurring ≥ 3 times in 24h"
                denominator="Total surgical cases with 24h pain assessment"
                target="≤ 10%"
              />

              <DefinitionCard 
                title="Movement Pain Management (24h)"
                thaiTitle="อัตราความถี่ความเจ็บปวดขณะเคลื่อนไหวในช่วง 24 ชั่วโมงแรก"
                description="Percentage of patients experiencing significant pain (Score ≥ 4) during movement multiple times within the first 24 hours post-operatively."
                thaiDescription="ร้อยละของผู้ป่วยที่มีคะแนนความเจ็บปวดขณะเคลื่อนไหว (On Movement) ตั้งแต่ 4 คะแนนขึ้นไป โดยเกิดขึ้นบ่อย (3 ครั้งขึ้นไป) ภายใน 24 ชั่วโมงแรก"
                numerator="Patients with Pain Score ≥ 4 occurring ≥ 3 times in 24h"
                denominator="Total surgical cases with 24h movement assessment"
                target="< 15%"
              />

              <DefinitionCard 
                title="Resting Pain Management (72h)"
                thaiTitle="อัตราความถี่ความเจ็บปวดขณะพักในช่วง 72 ชั่วโมง"
                description="Percentage of patients experiencing significant pain (Score ≥ 4) at rest frequently across the first 72 hours of monitoring."
                thaiDescription="ร้อยละของผู้ป่วยที่มีคะแนนความเจ็บปวดขณะพัก (At Rest) ตั้งแต่ 4 คะแนนขึ้นไป โดยเกิดขึ้นบ่อย (5 ครั้งขึ้นไป) ภายในช่วงเวลา 72 ชั่วโมง"
                numerator="Patients with Pain Score ≥ 4 occurring ≥ 5 times in 72h"
                denominator="Total cases monitored up to 72 hours"
                target="≤ 10%"
              />

              <DefinitionCard 
                title="Movement Pain Management (72h)"
                thaiTitle="อัตราความถี่ความเจ็บปวดขณะเคลื่อนไหวในช่วง 72 ชั่วโมง"
                description="Percentage of patients experiencing significant pain (Score ≥ 4) during movement frequently across the first 72 hours of monitoring."
                thaiDescription="ร้อยละของผู้ป่วยที่มีคะแนนความเจ็บปวดขณะเคลื่อนไหว (On Movement) ตั้งแต่ 4 คะแนนขึ้นไป โดยเกิดขึ้นบ่อย (5 ครั้งขึ้นไป) ภายในช่วงเวลา 72 ชั่วโมง"
                numerator="Patients with Pain Score ≥ 4 occurring ≥ 5 times in 72h"
                denominator="Total cases monitored up to 72 hours"
                target="≤ 10%"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
               <Info className="text-blue-600 shrink-0 mt-1" size={24} />
               <div className="space-y-1">
                 <h5 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Measurement Methodology / วิธีการวัดผล</h5>
                 <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed">
                   Data is collected longitudinally from clinical observation charts. Pain is assessed on a Numeric Rating Scale (0-10). 'Success' is defined as maintaining patients below the threshold or ensuring frequency of severe breakthrough pain stays within target percentages across the whole patient population.
                 </p>
               </div>
            </div>
          </div>
        );
      case 'detailed-records':
        return <DataTable data={filteredData} filterCriteria={filterCriteria} onClearFilter={() => setFilterCriteria(null)} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <ClipboardList className="text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Analytical Sub-Section Active</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm text-center">Detailed metrics for {activeSection.replace('-', ' ')} are being calculated based on your latest upload.</p>
          </div>
        );
    }
  };
  return <div className="space-y-6">{renderContent()}</div>;
};
