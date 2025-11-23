import React, { useState } from 'react';
import { Goal, SubTask } from '../types';
import ViewWrapper from './ViewWrapper';
import { PlusIcon, TargetIcon, CheckSquareIcon, PencilIcon, TrashIcon, CalendarDaysIcon, MoreVerticalIcon } from './icons';
import GoalModal from './GoalModal';
import { useData } from '../contexts/DataContext';

const Goals: React.FC = () => {
    const { goals, setGoals, saveGoal, deleteGoal } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    const [newSubTaskText, setNewSubTaskText] = useState<{ [key: string]: string }>({});
    const [editingSubTask, setEditingSubTask] = useState<{ goalId: string; subTaskId: string; text: string } | null>(null);
    const [activeGoalMenu, setActiveGoalMenu] = useState<string | null>(null);
    const [activeSubTaskMenu, setActiveSubTaskMenu] = useState<string | null>(null);

    const handleOpenNewModal = () => {
        setGoalToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsModalOpen(true);
        setActiveGoalMenu(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setGoalToEdit(null);
    };

    const handleSave = (goalData: Omit<Goal, 'id' | 'subTasks'> | Goal) => {
        saveGoal(goalData);
        handleCloseModal();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this goal and all its sub-tasks?')) {
            deleteGoal(id);
        }
        setActiveGoalMenu(null);
    };
    
    const toggleSubTask = (goalId: string, subTaskId: string) => {
        setGoals(goals.map(g => g.id === goalId ? { ...g, subTasks: g.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st) } : g));
    };

    const handleAddSubTask = (goalId: string) => {
        const text = newSubTaskText[goalId]?.trim();
        if (!text) return;

        const newSubTask: SubTask = { id: `st${Date.now()}`, text, completed: false };
        setGoals(goals.map(g => g.id === goalId ? { ...g, subTasks: [...g.subTasks, newSubTask] } : g));
        setNewSubTaskText(prev => ({ ...prev, [goalId]: '' }));
    };

    const handleDeleteSubTask = (goalId: string, subTaskId: string) => {
        setGoals(goals.map(g => g.id === goalId ? { ...g, subTasks: g.subTasks.filter(st => st.id !== subTaskId) } : g));
        setActiveSubTaskMenu(null);
    };

    const handleUpdateSubTask = () => {
        if (!editingSubTask) return;
        const { goalId, subTaskId, text } = editingSubTask;
        setGoals(goals.map(g => g.id === goalId ? { ...g, subTasks: g.subTasks.map(st => st.id === subTaskId ? { ...st, text } : st) } : g));
        setEditingSubTask(null);
    };

    return (
        <>
            <GoalModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} goalToEdit={goalToEdit} />
            <ViewWrapper title="Goals" onBack={() => {}}>
                <div 
                    className="p-4 sm:p-6 lg:p-8 space-y-6"
                    onClick={() => {
                        setActiveGoalMenu(null);
                        setActiveSubTaskMenu(null);
                    }}
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Your Ambitions</h2>
                        <button onClick={handleOpenNewModal} className="flex items-center px-4 py-2 bg-dark-purple text-white font-semibold rounded-lg">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Goal
                        </button>
                    </div>
                    
                    {goals.length === 0 ? (
                        <div className="text-center py-10 bg-dark-card rounded-lg">
                           <TargetIcon className="w-12 h-12 mx-auto text-dark-text-secondary mb-4" />
                           <p className="text-dark-text-secondary">You haven't set any goals yet. Click "New Goal" to start!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {goals.map(goal => {
                                const completedSubTasks = goal.subTasks.filter(st => st.completed).length;
                                const progress = goal.subTasks.length > 0 ? (completedSubTasks / goal.subTasks.length) * 100 : 0;
                                const daysLeft = goal.dueDate ? Math.ceil((goal.dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

                                return (
                                    <div key={goal.id} className="bg-dark-card p-6 rounded-2xl flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-semibold bg-dark-accent px-2 py-1 rounded-full text-dark-purple">{goal.category}</span>
                                                <h3 className="text-lg font-bold mt-2">{goal.title}</h3>
                                            </div>
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveGoalMenu(activeGoalMenu === goal.id ? null : goal.id); }} 
                                                    className="p-2 text-dark-text-secondary hover:text-dark-text rounded-full hover:bg-dark-accent"
                                                >
                                                    <MoreVerticalIcon className="w-5 h-5"/>
                                                </button>
                                                {activeGoalMenu === goal.id && (
                                                    <div className="absolute right-0 mt-2 w-36 bg-dark-accent border border-dark-border rounded-md shadow-lg z-10 py-1">
                                                        <button onClick={() => handleOpenEditModal(goal)} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-card">
                                                            <PencilIcon className="w-4 h-4 mr-2" /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(goal.id)} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card">
                                                            <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-dark-text-secondary flex-grow">{goal.description}</p>
                                        
                                        {goal.dueDate && (
                                            <div className="flex items-center text-sm text-dark-text-secondary mt-4">
                                                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                                                <span>
                                                    {daysLeft !== null ? (
                                                        daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${-daysLeft} days overdue`
                                                    ) : 'No due date'}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Progress</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="w-full bg-dark-accent rounded-full h-2.5">
                                                <div className="bg-dark-purple h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <h4 className="font-semibold text-sm">Sub-tasks</h4>
                                            {goal.subTasks.map(st => (
                                                <div key={st.id} className="flex items-center">
                                                    <button onClick={() => toggleSubTask(goal.id, st.id)} className="mr-2 flex-shrink-0">
                                                        <CheckSquareIcon isChecked={st.completed} className="w-5 h-5" />
                                                    </button>
                                                    {editingSubTask?.subTaskId === st.id ? (
                                                        <input 
                                                            type="text"
                                                            value={editingSubTask.text}
                                                            onChange={(e) => setEditingSubTask({...editingSubTask, text: e.target.value})}
                                                            onBlur={handleUpdateSubTask}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateSubTask()}
                                                            className="text-sm bg-dark-accent rounded px-1 py-0.5 w-full"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className={`text-sm flex-grow ${st.completed ? 'line-through text-dark-text-secondary' : ''}`}>{st.text}</span>
                                                    )}
                                                    <div className="relative ml-auto">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveSubTaskMenu(activeSubTaskMenu === st.id ? null : st.id); }} 
                                                            className="p-1 text-dark-text-secondary hover:text-dark-text rounded-full hover:bg-dark-accent"
                                                        >
                                                            <MoreVerticalIcon className="w-3.5 h-3.5"/>
                                                        </button>
                                                        {activeSubTaskMenu === st.id && (
                                                            <div className="absolute right-0 mt-2 w-32 bg-dark-accent border border-dark-border rounded-md shadow-lg z-10 py-1">
                                                                <button onClick={() => { setEditingSubTask({ goalId: goal.id, subTaskId: st.id, text: st.text }); setActiveSubTaskMenu(null); }} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-card">
                                                                    <PencilIcon className="w-3.5 h-3.5 mr-2" /> Edit
                                                                </button>
                                                                <button onClick={() => handleDeleteSubTask(goal.id, st.id)} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card">
                                                                    <TrashIcon className="w-3.5 h-3.5 mr-2" /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                             <form onSubmit={(e) => { e.preventDefault(); handleAddSubTask(goal.id); }} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add new sub-task..."
                                                    value={newSubTaskText[goal.id] || ''}
                                                    onChange={(e) => setNewSubTaskText(prev => ({...prev, [goal.id]: e.target.value}))}
                                                    className="w-full bg-dark-accent rounded-md px-2 py-1 text-sm focus:outline-none"
                                                />
                                                <button type="submit" className="p-1.5 bg-dark-accent rounded-md text-dark-text-secondary hover:text-dark-text">
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </ViewWrapper>
        </>
    );
};

export default Goals;
