import { useState } from 'react';
import { Shield, Users as UsersIcon, FileText, Play, BarChart3 } from 'lucide-react';
import { Users } from './components/Users';
import { Policies } from './components/Policies';
import { Evaluate } from './components/Evaluate';
import { Results } from './components/Results';

type Tab = 'users' | 'policies' | 'evaluate' | 'results';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, label: 'Users', icon: UsersIcon },
    { id: 'policies' as Tab, label: 'Policies', icon: FileText },
    { id: 'evaluate' as Tab, label: 'Evaluate', icon: Play },
    { id: 'results' as Tab, label: 'Results', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Compliance Checker</h1>
                <p className="text-xs text-gray-500">Dynamic compliance evaluation system</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && <Users />}
        {activeTab === 'policies' && <Policies />}
        {activeTab === 'evaluate' && <Evaluate />}
        {activeTab === 'results' && <Results />}
      </main>
    </div>
  );
}

export default App;
