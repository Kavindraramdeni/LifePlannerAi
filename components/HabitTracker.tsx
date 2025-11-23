
import React, { useState, useMemo } from 'react';
import { Habit, RoutineItem, TargetCategory, TargetAutoType } from '../types';
import { FlameIcon, PlusCircleIcon, HeartIcon, PencilIcon, TrashIcon, MoreVerticalIcon, ArrowDownIcon, BellIcon, CheckIcon, DownloadIcon, SunIcon, MoonIcon, ClockIcon, PlusIcon, TrophyIcon, TargetIcon, LineChartIcon, SparklesIcon, NoSymbolIcon } from './icons';
import * as Icons from './icons';
import { useData } from '../contexts/DataContext';
import RoutineModal from './RoutineModal';
import TargetModal from './TargetModal';

// --- HELPER FUNCTIONS ---
const isSameDay = (d1: Date | string | number, d2: Date | string | number) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return !isNaN(date1.getTime()) && !isNaN(date2.getTime()) &&
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
};

const calculateStreak = (history: Date[], skips: Date[] = []) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const historySet = new Set(history.map(d => new Date(d).toISOString().split('T')[0]));
    const skipSet = new Set(skips.map(d => new Date(d).toISOString().split('T')[0]));
    
    let checkDate = new Date(today);
    const todayStr = checkDate.toISOString().split('T')[0];
    
    // If today is not done AND not skipped, streak starts checking from yesterday
    if (!historySet.has(todayStr) && !skipSet.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (historySet.has(dateStr)) {
            streak++;
        } else if (skipSet.has(dateStr)) {
            // Continue streak but don't increment
        } else {
            break; // Streak broken
        }
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
};

// --- SUB-COMPONENTS ---

const HabitHeatmap: React.FC<{ habit: Habit }> = ({ habit }) => {
    const [range, setRange] = useState<'1M' | '3M'>('3M');

    const { dates } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); 
        const daysToSaturday = 6 - dayOfWeek;
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysToSaturday);
        
        const w = range === '1M' ? 5 : 13;
        const totalDays = w * 7; 
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - totalDays + 1);

        const generatedDates = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            generatedDates.push(d);
        }
        return { dates: generatedDates };
    }, [range]);

    const historySet = useMemo(() => new Set(habit.history.map(d => new Date(d).toISOString().split('T')[0])), [habit.history]);
    const skipSet = useMemo(() => new Set((habit.skips || []).map(d => new Date(d).toISOString().split('T')[0])), [habit.skips]);

    return (
        <div className="mt-4 select-none">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-xs text-dark-text-secondary uppercase tracking-wider">History</h4>
                <div className="flex bg-dark-accent/50 rounded-lg p-0.5">
                    {(['1M', '3M'] as const).map(r => (
                        <button key={r} onClick={(e) => { e.stopPropagation(); setRange(r); }} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${range === r ? 'bg-dark-purple text-white' : 'text-dark-text-secondary'}`}>{r}</button>
                    ))}
                </div>
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                {dates.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = historySet.has(dateStr);
                    const isSkipped = skipSet.has(dateStr);
                    const isCreated = date >= new Date(new Date(habit.createdAt).setHours(0,0,0,0));
                    
                    let colorClass = 'opacity-0';
                    if (isCompleted) colorClass = 'bg-project-green-from';
                    else if (isSkipped) colorClass = 'bg-yellow-500/50'; // Skipped color
                    else if (isCreated) colorClass = 'bg-dark-accent/40';

                    return <div key={dateStr} className={`w-2.5 h-2.5 rounded-[2px] ${colorClass}`} title={`${dateStr} ${isSkipped ? '(Skipped)' : ''}`}></div>;
                })}
            </div>
        </div>
    );
};

const HabitCard: React.FC<{ habit: Habit, onToggle: (id: string) => void, onSkip: (id: string) => void, onEdit: (h: Habit) => void, onDelete: (id: string) => void }> = ({ habit, onToggle, onSkip, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const completedToday = habit.history.some(d => isSameDay(d, new Date()));
    const skippedToday = (habit.skips || []).some(d => isSameDay(d, new Date()));
    
    const streak = calculateStreak(habit.history, habit.skips);
    
    // Stats Calculations
    const totalDays = Math.max(1, Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const completionRate = Math.round((habit.history.length / totalDays) * 100);
    const goal = habit.goal || 30; // Default goal if missing
    const goalProgress = Math.min(100, Math.round((habit.history.length / goal) * 100));

    return (
        <div className="bg-dark-card p-4 rounded-xl border border-dark-border hover:border-dark-purple/50 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${completedToday ? 'bg-dark-purple text-white' : skippedToday ? 'bg-yellow-500/20 text-yellow-500' : 'bg-dark-accent text-dark-purple'}`}>
                        <habit.icon className="w-5 h-5"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{habit.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-dark-text-secondary mt-0.5">
                            {habit.reminderTime && <span className="flex items-center"><BellIcon className="w-3 h-3 mr-1"/>{formatTime12Hour(habit.reminderTime)}</span>}
                            <span className="text-orange-400 flex items-center"><FlameIcon className="w-3 h-3 mr-0.5"/> {streak}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onSkip(habit.id)} 
                        className={`p-2 rounded-lg transition-colors ${skippedToday ? 'text-yellow-500 bg-yellow-500/10' : 'text-dark-text-secondary hover:text-yellow-500 hover:bg-dark-accent'}`}
                        title="Skip Today"
                    >
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onToggle(habit.id)} 
                        className={`p-2 rounded-lg transition-colors ${completedToday ? 'text-project-green-from bg-project-green-from/10' : 'text-dark-text-secondary hover:bg-dark-accent'}`}
                        title="Mark Complete"
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Goal Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] text-dark-text-secondary mb-1 font-semibold">
                    <span>Goal: {goal} days</span>
                    <span>{goalProgress}%</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-1.5">
                    <div className="bg-dark-purple h-1.5 rounded-full transition-all duration-500" style={{ width: `${goalProgress}%` }}></div>
                </div>
            </div>

            {/* Expanded Stats */}
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-dark-border/50 space-y-4 animate-fade-in">
                    <div>
                        <h5 className="text-[10px] uppercase font-bold text-dark-text-secondary mb-2">Stats</h5>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-dark-accent/30 p-2 rounded-lg flex flex-col items-center">
                                <TrophyIcon className="w-4 h-4 text-yellow-500 mb-1"/>
                                <span className="text-lg font-bold leading-none">{habit.bestStreak || streak}</span>
                                <span className="text-[9px] text-dark-text-secondary">Best Streak</span>
                            </div>
                            <div className="bg-dark-accent/30 p-2 rounded-lg flex flex-col items-center">
                                <LineChartIcon className="w-4 h-4 text-blue-400 mb-1"/>
                                <span className="text-lg font-bold leading-none">{completionRate}%</span>
                                <span className="text-[9px] text-dark-text-secondary">Completion</span>
                            </div>
                        </div>
                    </div>
                    
                    <HabitHeatmap habit={habit} />
                </div>
            )}

            <div className="mt-3 flex justify-between items-center pt-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-[10px] text-dark-text-secondary hover:text-dark-text flex items-center font-bold uppercase tracking-wider">
                    {isExpanded ? 'Hide Stats' : 'View Stats'} <ArrowDownIcon className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(habit)} className="p-1 text-dark-text-secondary hover:text-dark-text"><PencilIcon className="w-3 h-3"/></button>
                    <button onClick={() => onDelete(habit.id)} className="p-1 text-dark-text-secondary hover:text-project-red-from"><TrashIcon className="w-3 h-3"/></button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const HabitTracker: React.FC = () => {
    const { 
        habits, setHabits, saveHabit, deleteHabit,
        routineItems, saveRoutineItem, deleteRoutineItem, toggleRoutineItemCompletion, routineCompletion,
        targetCategories, saveTargetCategory, deleteTargetCategory, toggleTargetItem, targetCompletion,
        workouts, mealPlan, mealPlannerSettings
    } = useData();

    // Modals
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
    
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [routineToEdit, setRoutineToEdit] = useState<RoutineItem | null>(null);

    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [targetCatToEdit, setTargetCatToEdit] = useState<TargetCategory | null>(null);

    // Handlers
    const toggleHabit = (id: string) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id === id) {
                const today = new Date();
                const completedToday = habit.history.some(d => isSameDay(d, today));
                const skippedToday = (habit.skips || []).some(d => isSameDay(d, today));
                
                let newHistory = [...habit.history];
                let newSkips = [...(habit.skips || [])];
                
                // If currently skipped, remove skip and add to history (mark done)
                if (skippedToday) {
                    newSkips = newSkips.filter(d => !isSameDay(d, today));
                    newHistory.push(today);
                } else if (completedToday) {
                    // If completed, toggle off (remove from history)
                    newHistory = newHistory.filter(d => !isSameDay(d, today));
                } else {
                    // Else mark done
                    newHistory.push(today);
                }
                
                // Recalculate Streak
                const newStreak = calculateStreak(newHistory, newSkips);
                const newBestStreak = Math.max(habit.bestStreak || 0, newStreak);

                const updatedHabit = { ...habit, history: newHistory, skips: newSkips, bestStreak: newBestStreak };
                saveHabit(updatedHabit); 
                return updatedHabit;
            }
            return habit;
        }));
    };

    const toggleSkip = (id: string) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id === id) {
                const today = new Date();
                const completedToday = habit.history.some(d => isSameDay(d, today));
                const skippedToday = (habit.skips || []).some(d => isSameDay(d, today));
                
                let newHistory = [...habit.history];
                let newSkips = [...(habit.skips || [])];
                
                // If completed, remove from history and add to skips
                if (completedToday) {
                    newHistory = newHistory.filter(d => !isSameDay(d, today));
                    newSkips.push(today);
                } else if (skippedToday) {
                    // If already skipped, remove skip (toggle off)
                    newSkips = newSkips.filter(d => !isSameDay(d, today));
                } else {
                    // Else mark skipped
                    newSkips.push(today);
                }
                
                const newStreak = calculateStreak(newHistory, newSkips);
                // Note: skips usually don't increase best streak, but preserve it.
                
                const updatedHabit = { ...habit, history: newHistory, skips: newSkips, bestStreak: Math.max(habit.bestStreak || 0, newStreak) };
                saveHabit(updatedHabit);
                return updatedHabit;
            }
            return habit;
        }));
    };

    const handleSaveHabit = (data: any) => {
        const newHabit = habitToEdit 
            ? { ...habitToEdit, ...data } 
            : { 
                ...data, 
                id: `h-${Date.now()}`, 
                history: [], 
                skips: [],
                createdAt: new Date(), 
                bestStreak: 0, 
                icon: HeartIcon 
            };
        saveHabit(newHabit);
        setIsHabitModalOpen(false);
    };

    // Group habits by time of day (simple logic based on reminder time)
    const groupedHabits = useMemo(() => {
        const morning = habits.filter(h => !h.reminderTime || parseInt(h.reminderTime) < 12);
        const afternoon = habits.filter(h => h.reminderTime && parseInt(h.reminderTime) >= 12 && parseInt(h.reminderTime) < 17);
        const evening = habits.filter(h => h.reminderTime && parseInt(h.reminderTime) >= 17);
        return { morning, afternoon, evening };
    }, [habits]);

    // --- DYNAMIC LINKING LOGIC ---
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysMeals = mealPlan[todayName];
    const todaysWorkout = workouts.find(w => 
        (w.day === todayName) || 
        (!w.day && w.name.toLowerCase().includes(todayName.toLowerCase()))
    );

    const sortedRoutine = useMemo(() => {
        const processed = routineItems.map(item => {
            let newItem = { ...item };
            const titleLower = item.title.toLowerCase();

            if (titleLower.includes('breakfast') && todaysMeals?.breakfast) {
                newItem.subtitle = todaysMeals.breakfast.name;
            }
            else if (titleLower.includes('lunch') && todaysMeals?.lunch) {
                newItem.subtitle = todaysMeals.lunch.name;
            }
            else if (titleLower.includes('dinner') && todaysMeals?.dinner) {
                newItem.subtitle = todaysMeals.dinner.name;
            }
            else if ((titleLower.includes('gym') || titleLower.includes('workout') || titleLower.includes('exercise')) && todaysWorkout) {
                newItem.subtitle = todaysWorkout.name;
            }

            return newItem;
        });

        return processed.sort((a, b) => a.time.localeCompare(b.time));
    }, [routineItems, todaysMeals, todaysWorkout]);


    // Auto-Check Logic for Targets
    const isTargetCompleted = (item: any) => {
        if (item.type === 'manual') {
            return targetCompletion.completedItemIds.includes(item.id);
        }
        
        if (item.autoType === 'workout') {
            return workouts.some(w => isSameDay(w.completedAt || '', new Date()));
        }
        if (item.autoType === 'calories') {
            let cals = 0;
            if(todaysMeals) {
                if(todaysMeals.breakfast) cals += todaysMeals.breakfast.calories || 0;
                if(todaysMeals.lunch) cals += todaysMeals.lunch.calories || 0;
                if(todaysMeals.dinner) cals += todaysMeals.dinner.calories || 0;
            }
            return cals >= mealPlannerSettings.calorieTarget;
        }
        if (item.autoType === 'routine_task') {
            const linkedRoutine = routineItems.find(r => r.title.toLowerCase().includes((item.linkedValue || '').toLowerCase()));
            if (linkedRoutine) return routineCompletion.completedIds.includes(linkedRoutine.id);
        }
        return false;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Modal Placeholders */}
            {isHabitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsHabitModalOpen(false)}>
                    <div className="bg-dark-card p-6 rounded-xl w-96 border border-dark-border" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">{habitToEdit ? 'Edit' : 'New'} Habit</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleSaveHabit({
                                name: formData.get('name'),
                                reminderTime: formData.get('time'),
                                goal: parseInt(formData.get('goal') as string) || 30
                            });
                        }}>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-dark-text-secondary block mb-1">Habit Name</label>
                                    <input name="name" defaultValue={habitToEdit?.name} placeholder="e.g. Read Book" className="w-full bg-dark-accent p-2 rounded text-sm" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-dark-text-secondary block mb-1">Reminder</label>
                                        <input name="time" type="time" defaultValue={habitToEdit?.reminderTime} className="w-full bg-dark-accent p-2 rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-dark-text-secondary block mb-1">Goal (Days)</label>
                                        <input name="goal" type="number" defaultValue={habitToEdit?.goal || 30} min="1" className="w-full bg-dark-accent p-2 rounded text-sm" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-dark-purple text-white py-2 rounded mt-6 font-bold">Save Habit</button>
                        </form>
                    </div>
                </div>
            )}
            
            <RoutineModal 
                isOpen={isRoutineModalOpen} 
                onClose={() => setIsRoutineModalOpen(false)} 
                onSave={(item) => { saveRoutineItem(item); setIsRoutineModalOpen(false); }} 
                itemToEdit={routineToEdit} 
            />

            <TargetModal
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                onSave={(cat) => { saveTargetCategory(cat); setIsTargetModalOpen(false); }}
                onDelete={targetCatToEdit ? () => deleteTargetCategory(targetCatToEdit.id) : undefined}
                categoryToEdit={targetCatToEdit}
            />

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Daily Routine</h1>
                    <p className="text-dark-text-secondary">Structure your day for maximum impact.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: TIMELINE (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-dark-card rounded-2xl p-6 border border-dark-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Timeline</h3>
                            <button onClick={() => { setRoutineToEdit(null); setIsRoutineModalOpen(true); }} className="text-xs flex items-center bg-dark-accent hover:bg-dark-purple hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                <PlusIcon className="w-3 h-3 mr-1" /> Add Step
                            </button>
                        </div>
                        
                        <div className="relative space-y-6 before:absolute before:left-[110px] before:w-0.5 before:-translate-x-1/2 before:bg-dark-border before:h-full">
                            {sortedRoutine.map((item) => {
                                // @ts-ignore
                                const ItemIcon = Icons[item.icon] || Icons.SparklesIcon;
                                const isDone = routineCompletion.completedIds.includes(item.id);
                                
                                return (
                                    <div key={item.id} className="relative flex items-center group">
                                        {/* Time Label (Far Left) */}
                                        <div className="w-[95px] text-right pr-3 flex-shrink-0">
                                            <p className="font-mono text-xl font-bold text-dark-purple">{formatTime12Hour(item.time)}</p>
                                        </div>

                                        {/* Timeline Dot */}
                                        <div className={`absolute left-[110px] -translate-x-1/2 w-3 h-3 rounded-full border-2 border-dark-card z-10 transition-colors ${isDone ? 'bg-project-green-from ring-2 ring-project-green-from/20' : 'bg-dark-border'}`}></div>
                                        
                                        <div className="flex-1 ml-8">
                                            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isDone ? 'bg-dark-accent/20 border-project-green-from/30' : 'bg-dark-accent/10 border-transparent hover:bg-dark-accent/30'}`} onClick={() => toggleRoutineItemCompletion(item.id)}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`p-2 rounded-lg shrink-0 ${item.color || 'text-gray-400 bg-gray-500/10'}`}>
                                                        <ItemIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`font-bold text-sm truncate ${isDone ? 'line-through text-dark-text-secondary' : ''}`}>{item.title}</h4>
                                                        {item.subtitle && <p className="text-xs text-dark-text-secondary truncate">{item.subtitle}</p>}
                                                    </div>
                                                </div>
                                                {isDone && <CheckIcon className="w-5 h-5 text-project-green-from shrink-0 ml-2" />}
                                            </div>
                                            
                                            {/* Hover Controls */}
                                            <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                                <button onClick={(e) => { e.stopPropagation(); setRoutineToEdit(item); setIsRoutineModalOpen(true); }} className="text-[10px] text-dark-text-secondary hover:text-dark-text">Edit</button>
                                                <button onClick={(e) => { e.stopPropagation(); deleteRoutineItem(item.id); }} className="text-[10px] text-dark-text-secondary hover:text-project-red-from">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {sortedRoutine.length === 0 && (
                                <div className="text-center py-8 ml-10 text-dark-text-secondary text-sm">
                                    No routine set. Click "Add Step" to build your day.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TARGETS & HABITS (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Daily Targets Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Daily Targets</h3>
                            <button onClick={() => { setTargetCatToEdit(null); setIsTargetModalOpen(true); }} className="text-sm text-dark-purple font-bold flex items-center hover:underline">
                                <PlusIcon className="w-4 h-4 mr-1"/> New Card
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {targetCategories.map(cat => {
                                // @ts-ignore
                                const CatIcon = Icons[cat.icon] || Icons.TargetIcon;
                                const completedCount = cat.items.filter(i => isTargetCompleted(i)).length;
                                const progress = cat.items.length > 0 ? (completedCount / cat.items.length) * 100 : 0;

                                return (
                                    <div key={cat.id} className="bg-dark-card rounded-xl p-5 border border-dark-border relative group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${cat.color || 'bg-dark-accent'}`}>
                                                    <CatIcon className="w-5 h-5"/>
                                                </div>
                                                <h4 className="font-bold uppercase tracking-wider text-sm">{cat.title}</h4>
                                            </div>
                                            <button onClick={() => { setTargetCatToEdit(cat); setIsTargetModalOpen(true); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-accent rounded text-dark-text-secondary">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            {cat.items.map(item => {
                                                const isChecked = isTargetCompleted(item);
                                                const isAuto = item.type === 'auto';
                                                return (
                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center">
                                                            <span className={`${isChecked ? 'text-dark-text-secondary line-through' : ''}`}>{item.label}</span>
                                                            {isAuto && (
                                                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center" title="Automatically tracked from Planner">
                                                                    <SparklesIcon className="w-2.5 h-2.5 mr-1" /> Linked
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => item.type === 'manual' && toggleTargetItem(item.id)} 
                                                            disabled={item.type !== 'manual'}
                                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-project-green-from border-project-green-from' : 'border-dark-border hover:border-dark-purple'} ${item.type !== 'manual' ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                                                        >
                                                            {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="w-full bg-dark-accent h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-project-green-from transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Habits Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Habit Streaks</h3>
                            <button onClick={() => { setHabitToEdit(null); setIsHabitModalOpen(true); }} className="text-sm text-dark-purple font-bold flex items-center hover:underline">
                                <PlusIcon className="w-4 h-4 mr-1"/> New Habit
                            </button>
                        </div>
                        
                        {/* Morning Habits */}
                        {groupedHabits.morning.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-dark-text-secondary uppercase mb-2 flex items-center"><SunIcon className="w-4 h-4 mr-1"/> Morning</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedHabits.morning.map(habit => (
                                        <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onSkip={toggleSkip} onEdit={() => { setHabitToEdit(habit); setIsHabitModalOpen(true); }} onDelete={deleteHabit} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Afternoon Habits */}
                        {groupedHabits.afternoon.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-dark-text-secondary uppercase mb-2 flex items-center"><SunIcon className="w-4 h-4 mr-1 rotate-45"/> Afternoon</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedHabits.afternoon.map(habit => (
                                        <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onSkip={toggleSkip} onEdit={() => { setHabitToEdit(habit); setIsHabitModalOpen(true); }} onDelete={deleteHabit} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Evening Habits */}
                        {groupedHabits.evening.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-dark-text-secondary uppercase mb-2 flex items-center"><MoonIcon className="w-4 h-4 mr-1"/> Evening</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedHabits.evening.map(habit => (
                                        <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onSkip={toggleSkip} onEdit={() => { setHabitToEdit(habit); setIsHabitModalOpen(true); }} onDelete={deleteHabit} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {habits.length === 0 && (
                            <div className="col-span-full py-8 text-center bg-dark-card rounded-xl border border-dashed border-dark-border text-dark-text-secondary">
                                <HeartIcon className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                No habits tracked yet.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HabitTracker;
