
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { AiLab } from './components/AiLab';
import { generateMockData } from './utils/mockData';
import { CaseData } from './types';
import { Menu } from 'lucide-react';

function App() {
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rawData, setRawData] = useState<CaseData[]>(() => generateMockData(500));
    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState<number | 'All'>('All');

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // For now, mock upload by regenerating data
        console.log("Upload triggered - continuing with mock data");
        // In a real app, parse Excel here
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onUpload={handleUpload}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 justify-between shrink-0">
                    <span className="font-bold text-lg">APS Dashboard</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
                        <Menu size={24} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {activeSection === 'ai-lab' ? (
                            <AiLab />
                        ) : (
                            <Dashboard
                                rawData={rawData}
                                year={year}
                                month={month}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
