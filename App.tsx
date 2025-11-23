import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MealPlanner from './components/MealPlanner';
import WorkoutPlanner from './components/WorkoutPlanner';
import TravelPlanner from './components/TravelPlanner';
import HabitTracker from './components/HabitTracker';
import FinanceTracker from './components/FinanceTracker';
import Movies from './components/Movies';
import Bookshelf from './components/Bookshelf';
import Goals from './components/Goals';
import Vision from './components/Vision';
import HealthTracker from './components/HealthTracker';
import MainHeader from './components/MainHeader';
import ProjectsDashboard from './components/ProjectsDashboard';
import NotesPage from './components/NotesPage';
import TodoPage from './components/TodoPage';
import { useData } from './contexts/DataContext';

const App: React.FC = () => {
    const [page, setPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme } = useData();
    
    // Apply theme class to body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }, [theme]);

    const pageTitles: { [key: string]: string } = {
        dashboard: 'Dashboard',
        projects: 'Projects',
        notes: 'Notes',
        todo: 'Todo List',
        'meal-planner': 'Meal Planner',
        'workout-planner': 'Workout Planner',
        'travel-planner': 'Travel Planner',
        'habit-tracker': 'Habit Tracker',
        'finance-tracker': 'Finance Tracker',
        'movies-series': 'Movies & Series',
        'bookshelf': 'Bookshelf',
        'goals': 'Goals',
        'vision-board': 'Vision Board',
        'health-tracker': 'Health Tracker',
    };

    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <Dashboard onNavigate={setPage} />;
            case 'projects':
                return <ProjectsDashboard />;
            case 'todo':
                 return <TodoPage onNavigate={setPage} />;
            case 'meal-planner':
                return <MealPlanner />;
            case 'workout-planner':
                return <WorkoutPlanner />;
            case 'travel-planner':
                return <TravelPlanner />;
            case 'habit-tracker':
                return <HabitTracker />;
            case 'finance-tracker':
                return <FinanceTracker />;
            case 'movies-series':
                return <Movies />;
            case 'bookshelf':
                return <Bookshelf />;
            case 'goals':
                return <Goals />;
            case 'vision-board':
                return <Vision />;
            case 'health-tracker':
                return <HealthTracker />;
             case 'notes':
                return <NotesPage />;
            default:
                return <Dashboard onNavigate={setPage} />;
        }
    };

    return (
        <div className="bg-dark-bg text-dark-text min-h-screen flex font-sans transition-colors duration-300">
            <Sidebar 
                onNavigate={(pageId) => {
                    setPage(pageId);
                    setIsSidebarOpen(false);
                }} 
                currentPage={page} 
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <MainHeader 
                    pageTitle={pageTitles[page] || 'Life Planner'} 
                    onBack={page !== 'dashboard' ? () => setPage('dashboard') : undefined}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onNavigate={setPage}
                />
                <div className="flex-1 overflow-y-auto">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
};
export default App;