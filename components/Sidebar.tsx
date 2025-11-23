
import React from 'react';
import { HomeIcon, SparklesIcon, WorkoutIcon, TravelIcon, HeartIcon, DollarSignIcon, BookshelfIcon, TargetIcon, ImageIcon, LineChartIcon, BriefcaseIcon, GiftIcon, DocumentTextIcon, ClipboardListIcon, XMarkIcon } from './icons';

interface SidebarProps {
  onNavigate: (pageId: string) => void;
  currentPage: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type NavItem = {
    id: string;
    name: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage, isOpen, setIsOpen }) => {
    const navItems: NavItem[] = [
        { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
        { id: 'projects', name: 'Projects', icon: BriefcaseIcon },
        { id: 'notes', name: 'Notes', icon: DocumentTextIcon },
        { id: 'todo', name: 'Todo', icon: ClipboardListIcon },
        { id: 'divider', name: 'divider' },
        { id: 'meal-planner', name: 'Meal Planner', icon: SparklesIcon },
        { id: 'workout-planner', name: 'Workout Planner', icon: WorkoutIcon },
        { id: 'goals', name: 'Goals', icon: TargetIcon },
        { id: 'divider', name: 'divider' },
        { id: 'habit-tracker', name: 'Habit Tracker', icon: HeartIcon },
        { id: 'finance-tracker', name: 'Finance Tracker', icon: DollarSignIcon },
        { id: 'health-tracker', name: 'Health Tracker', icon: LineChartIcon },
        { id: 'divider', name: 'divider' },
        { id: 'movies-series', name: 'Movies & Series', icon: GiftIcon },
        { id: 'bookshelf', name: 'Bookshelf', icon: BookshelfIcon },
        { id: 'travel-planner', name: 'Travel Planner', icon: TravelIcon },
        { id: 'vision-board', name: 'Vision Board', icon: ImageIcon },
    ];
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-card p-6 flex-shrink-0 flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-dark-purple rounded-lg"></div>
                        <h1 className="font-bold text-xl">Life Planner</h1>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-dark-text-secondary hover:text-dark-text" aria-label="Close sidebar">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item, index) => {
                            if (item.id === 'divider') {
                                return <li key={`divider-${index}`}><hr className="border-dark-border my-3" /></li>;
                            }
                            // Ensure Icon exists before rendering
                            if (!item.icon) return null;
                            
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => onNavigate(item.id)}
                                        className={`w-full flex items-center text-left px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-dark-purple text-white' : 'text-dark-text-secondary hover:bg-dark-accent hover:text-dark-text'}`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
};
export default Sidebar;
