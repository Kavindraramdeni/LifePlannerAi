
import React, { useState, useEffect, useMemo } from 'react';
import OverviewWidget from './OverviewWidget';
import UpcomingWidget from './UpcomingWidget';
import CalendarWidget from './CalendarWidget';
import CategoryCard from './Header';
import { HeartIcon, DocumentTextIcon, UtensilsIcon, TravelIcon, WorkoutIcon, BookshelfIcon, GiftIcon, DollarSignIcon, TargetIcon, ImageIcon, LineChartIcon, PlayCircleIcon, StopCircleIcon, SunIcon, SettingsIcon, ClockIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface DashboardProps {
    onNavigate: (pageId: string) => void;
}

const GreetingHeader: React.FC = () => {
    const [greeting, setGreeting] = useState('');
    const [quote, setQuote] = useState({ text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        const quotes = [
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" }
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className="relative h-32 rounded-2xl overflow-hidden mb-4 shadow-md">
            <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop" alt="Life Planner banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center p-6">
                <h1 className="text-2xl font-bold text-white mb-1">{greeting}!</h1>
                <p className="text-white/90 italic text-sm">"{quote.text}"</p>
                <p className="text-white/60 text-[10px] mt-1">- {quote.author}</p>
            </div>
        </div>
    );
};

const TimeProgressWidget: React.FC = () => {
    const [progress, setProgress] = useState({ year: 0, month: 0, week: 0, day: 0 });
    const [labels, setLabels] = useState({ year: '', month: '', week: '', day: '' });

    useEffect(() => {
        const calculateProgress = () => {
            const now = new Date();
            
            // Day Progress
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dayPercent = ((now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24)) * 100;
            
            // Week Progress
            const dayOfWeek = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
            const weekPercent = ((dayOfWeek - 1) / 7) * 100 + (dayPercent / 7);

            // Month Progress
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const daysInMonth = endOfMonth.getDate();
            const monthPercent = ((now.getDate() - 1) / daysInMonth) * 100 + (dayPercent / daysInMonth);

            // Year Progress
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
            const yearPercent = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;

            setProgress({
                year: yearPercent,
                month: monthPercent,
                week: weekPercent,
                day: dayPercent
            });

            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
            setLabels({
                year: `Year: ${dayOfYear}/365`,
                month: `Month: ${now.getDate()}/${daysInMonth}`,
                week: `Week: ${dayOfWeek}/7`,
                day: `Day: ${now.getHours()}/24`
            });
        };

        calculateProgress();
        const timer = setInterval(calculateProgress, 60000);
        return () => clearInterval(timer);
    }, []);

    const ProgressBar = ({ label, percent }: { label: string, percent: number }) => (
        <div className="mb-3 last:mb-0">
            <div className="flex justify-between text-[10px] text-dark-text-secondary mb-1 font-mono uppercase tracking-wider">
                <span>{label.split(':')[0]}</span>
                <span>{label.split(':')[1]}</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2 border border-dark-border/50 p-[1px]">
                <div 
                    className="bg-dark-purple h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
            <ProgressBar label={labels.year} percent={progress.year} />
            <ProgressBar label={labels.month} percent={progress.month} />
            <ProgressBar label={labels.week} percent={progress.week} />
            <ProgressBar label={labels.day} percent={progress.day} />
        </div>
    );
};

const FocusWidget: React.FC = () => {
    const [mode, setMode] = useState<'pomodoro' | 'short' | 'long'>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    const modes = {
        pomodoro: { label: 'pomodoro', time: 25 * 60 },
        short: { label: 'short break', time: 5 * 60 },
        long: { label: 'long break', time: 15 * 60 },
    };

    useEffect(() => {
        let interval: number | null = null;
        if (isRunning && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isRunning, timeLeft]);

    const switchMode = (newMode: 'pomodoro' | 'short' | 'long') => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(modes[newMode].time);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-dark-border relative h-64 group bg-dark-card">
            <img 
                src="https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop" 
                alt="Focus Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/60 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-white">
                <div className="flex space-x-2 mb-6">
                    {Object.entries(modes).map(([key, { label }]) => (
                        <button
                            key={key}
                            onClick={() => switchMode(key as any)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm border transition-all ${mode === key ? 'bg-white text-black border-white' : 'bg-black/30 border-white/20 text-white/70 hover:bg-black/50'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="text-6xl font-mono font-bold mb-6 tracking-tight drop-shadow-lg">
                    {formatTime(timeLeft)}
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsRunning(!isRunning)} 
                        className="bg-white text-black px-8 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg flex items-center"
                    >
                        {isRunning ? 'PAUSE' : 'START'}
                    </button>
                    <button 
                        onClick={() => { setIsRunning(false); setTimeLeft(modes[mode].time); }} 
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                    >
                        <SettingsIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const MorningBriefing: React.FC = () => {
    const { tasks, workouts } = useData();
    const today = new Date();
    
    const highPriorityTask = useMemo(() => {
        return tasks.filter(t => !t.completed && t.priority === 'High').sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
    }, [tasks]);

    const todaysWorkout = useMemo(() => {
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        return workouts.find(w => w.day === dayName || (w.createdAt.toDateString() === today.toDateString()));
    }, [workouts, today]);

    return (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
            <h3 className="font-bold text-sm mb-3 flex items-center text-dark-text">
                <SunIcon className="w-4 h-4 mr-2 text-yellow-500" /> Morning Briefing
            </h3>
            <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-dark-accent/30 rounded-lg">
                    <div className="p-1 bg-blue-500/10 rounded-md text-blue-400">
                        <DocumentTextIcon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] text-dark-text-secondary font-bold uppercase">Top Priority</p>
                        <p className="font-medium text-xs truncate">{highPriorityTask ? highPriorityTask.name : "No high priority tasks!"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-dark-accent/30 rounded-lg">
                    <div className="p-1 bg-orange-500/10 rounded-md text-orange-400">
                        <WorkoutIcon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] text-dark-text-secondary font-bold uppercase">Today's Workout</p>
                        <p className="font-medium text-xs truncate">{todaysWorkout ? todaysWorkout.name : "Rest Day"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-dark-accent/30 rounded-lg">
                    <div className="p-1 bg-yellow-500/10 rounded-md text-yellow-400">
                        <SunIcon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] text-dark-text-secondary font-bold uppercase">Weather</p>
                        <p className="font-medium text-xs truncate">24°C Sunny (Forecast)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const categoryCards = {
        daily: {
            title: 'Daily',
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop',
            links: [
                { id: 'habit-tracker', name: 'Habits', icon: HeartIcon },
                { id: 'notes', name: 'Notes', icon: DocumentTextIcon },
            ],
        },
        planners: {
            title: 'Planners',
            image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop',
            links: [
                { id: 'meal-planner', name: 'Meal Planner', icon: UtensilsIcon },
                { id: 'workout-planner', name: 'Workout Planner', icon: WorkoutIcon },
                { id: 'goals', name: 'Goals', icon: TargetIcon },
            ],
        },
        personal: {
            title: 'Personal',
            image: 'https://images.unsplash.com/photo-1513127653583-1f6d0095c9e6?q=80&w=2070&auto=format&fit=crop',
            links: [
                { id: 'bookshelf', name: 'Bookshelf', icon: BookshelfIcon },
                { id: 'movies-series', name: 'Movies & Series', icon: GiftIcon },
                { id: 'finance-tracker', name: 'Finance', icon: DollarSignIcon },
            ],
        },
        goals: {
            title: 'Goals & Travel',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
            links: [
                { id: 'travel-planner', name: 'Travel Planner', icon: TravelIcon },
                { id: 'vision-board', name: 'Vision', icon: ImageIcon },
                { id: 'health-tracker', name: 'Health', icon: LineChartIcon },
            ],
        },
    };

    // Draggable Widget State
    const [isEditMode, setIsEditMode] = useState(false);
    const [leftColumnWidgets, setLeftColumnWidgets] = useState(['Overview', 'Calendar']);
    const [rightColumnWidgets, setRightColumnWidgets] = useState(['TimeProgress', 'FocusTimer', 'MorningBriefing', 'Upcoming']);

    const widgetComponents: {[key: string]: React.ReactNode} = {
        Overview: <OverviewWidget />,
        Calendar: <CalendarWidget />,
        MorningBriefing: <MorningBriefing />,
        FocusTimer: <FocusWidget />,
        Upcoming: <UpcomingWidget />,
        TimeProgress: <TimeProgressWidget />
    };

    const handleDragStart = (e: React.DragEvent, widgetId: string, sourceCol: 'left' | 'right') => {
        e.dataTransfer.setData('widgetId', widgetId);
        e.dataTransfer.setData('sourceCol', sourceCol);
    };

    const handleDrop = (e: React.DragEvent, targetCol: 'left' | 'right') => {
        e.preventDefault();
        const widgetId = e.dataTransfer.getData('widgetId');
        const sourceCol = e.dataTransfer.getData('sourceCol');

        if (sourceCol === targetCol) return; 

        if (sourceCol === 'left') {
            setLeftColumnWidgets(prev => prev.filter(w => w !== widgetId));
            setRightColumnWidgets(prev => [widgetId, ...prev]);
        } else {
            setRightColumnWidgets(prev => prev.filter(w => w !== widgetId));
            setLeftColumnWidgets(prev => [widgetId, ...prev]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in">
            <GreetingHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CategoryCard {...categoryCards.daily} onNavigate={onNavigate} />
                <CategoryCard {...categoryCards.planners} onNavigate={onNavigate} />
                <CategoryCard {...categoryCards.personal} onNavigate={onNavigate} />
                <CategoryCard {...categoryCards.goals} onNavigate={onNavigate} />
            </div>

            <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold">Overview</h2>
                <button onClick={() => setIsEditMode(!isEditMode)} className={`text-xs px-3 py-1 rounded-lg border ${isEditMode ? 'bg-dark-purple border-dark-purple text-white' : 'border-dark-border text-dark-text-secondary'}`}>
                    {isEditMode ? 'Done' : 'Edit Layout'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column */}
                <div 
                    className={`lg:col-span-2 flex flex-col gap-4 ${isEditMode ? 'border-2 border-dashed border-dark-border/50 rounded-xl p-2 min-h-[200px]' : ''}`}
                    onDrop={(e) => isEditMode && handleDrop(e, 'left')}
                    onDragOver={handleDragOver}
                >
                    {leftColumnWidgets.map(id => (
                        <div 
                            key={id} 
                            draggable={isEditMode} 
                            onDragStart={(e) => handleDragStart(e, id, 'left')}
                            className={isEditMode ? 'cursor-move opacity-90 hover:opacity-100 transition-opacity' : ''}
                        >
                            {widgetComponents[id]}
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div 
                    className={`space-y-4 ${isEditMode ? 'border-2 border-dashed border-dark-border/50 rounded-xl p-2 min-h-[200px]' : ''}`}
                    onDrop={(e) => isEditMode && handleDrop(e, 'right')}
                    onDragOver={handleDragOver}
                >
                    {rightColumnWidgets.map(id => (
                        <div 
                            key={id} 
                            draggable={isEditMode} 
                            onDragStart={(e) => handleDragStart(e, id, 'right')}
                            className={isEditMode ? 'cursor-move opacity-90 hover:opacity-100 transition-opacity' : ''}
                        >
                            {widgetComponents[id]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
