import React from 'react';
import OverviewWidget from './OverviewWidget';
import DailyGroceryWidget from './DailyGroceryWidget';

interface TodoPageProps {
    onNavigate?: (page: string) => void;
}

const TodoPage: React.FC<TodoPageProps> = ({ onNavigate }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <OverviewWidget />
            </div>
            <div className="lg:col-span-1">
                <DailyGroceryWidget onNavigate={onNavigate} />
            </div>
        </div>
    );
};

export default TodoPage;