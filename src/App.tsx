import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import PositionAnalysis from '@/pages/PositionAnalysis';
import ProjectTopic from '@/pages/ProjectTopic';
import ComplaintLink from '@/pages/ComplaintLink';
import UserProfile from '@/pages/UserProfile';
import ActionList from '@/pages/ActionList';
import { Home as HomeIcon } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in-up h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="text-[120px] font-black font-serif bg-gradient-to-br from-brand-indigo-600 via-brand-rose-500 to-brand-rose-700 bg-clip-text text-transparent leading-none">
            404
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-rose-gold rounded-full opacity-20 animate-pulse-soft" />
        </div>
        <h2 className="text-section-title font-bold text-neutral-text-primary mb-2">页面未找到</h2>
        <p className="text-sm text-neutral-text-secondary mb-6">您访问的页面不存在或已被移动</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ripple"
        >
          <HomeIcon size={15} />返回首页
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/position" element={<PositionAnalysis />} />
        <Route path="/project" element={<ProjectTopic />} />
        <Route path="/complaint" element={<ComplaintLink />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/profile" element={<Navigate to="/profile/emp-001" replace />} />
        <Route path="/action" element={<ActionList />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
