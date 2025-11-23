
import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, KanbanColumnStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { PlusIcon, TrashIcon, PencilIcon, CalendarDaysIcon, MoreVerticalIcon } from './icons';
import TaskModal from './TaskModal';

interface ProjectBoardProps {
    project: Project;
    onBack: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const COLUMNS: { id: KanbanColumnStatus; title: string; color: string }[] = [
    { id: 'BACKLOG', title: 'Backlog', color: 'border-dark-border' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-dark-purple' },
    { id: 'DONE', title: 'Done', color: 'border-project-green-from' },
];

const ProjectBoard: React.FC<ProjectBoardProps> = ({ project, onBack, onEdit, onDelete }) => {
    const { tasks, addTask, saveTask, deleteTask, categories } = useData();
    const [projectTasks, setProjectTasks] = useState<Task[]>([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [activeColumn, setActiveColumn] = useState<KanbanColumnStatus>('BACKLOG');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Drag State
    const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnStatus | null>(null);

    useEffect(() => {
        setProjectTasks(tasks.filter(t => t.projectId === project.id));
    }, [tasks, project.id]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: KanbanColumnStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            saveTask({ 
                ...task, 
                status, 
                completed: status === 'DONE' 
            });
        }
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, status: KanbanColumnStatus) => {
        e.preventDefault();
        if (dragOverColumn !== status) {
            setDragOverColumn(status);
        }
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleAddNewTask = (status: KanbanColumnStatus) => {
        setTaskToEdit(null);
        setActiveColumn(status);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
        if ('id' in taskData) {
            // Edit existing
            saveTask(taskData as Task);
        } else {
            // Create new - ensure it has the correct project and status
            addTask({
                ...taskData,
                id: `t-${Date.now()}`,
                createdAt: new Date(),
                projectId: project.id,
                status: activeColumn, // Set status based on which column the user clicked "+"
                completed: activeColumn === 'DONE'
            } as Task);
        }
        setIsModalOpen(false);
        setTaskToEdit(null);
    };

    const priorityColors = {
        'High': 'text-high-priority bg-high-priority/10',
        'Medium': 'text-medium-priority bg-medium-priority/10',
        'Low': 'text-low-priority bg-low-priority/10',
    };

    return (
        <>
            <TaskModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={taskToEdit}
                categories={categories}
                initialProjectId={project.id}
            />
            
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-4 p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text transition-colors">
                            &larr; Back
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold">{project.title}</h2>
                            <p className="text-sm text-dark-text-secondary">{project.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                             {project.team.map(m => (
                                 <img key={m.name} src={m.avatarUrl} className="w-8 h-8 rounded-full border-2 border-dark-bg" alt={m.name} title={m.name} />
                             ))}
                        </div>
                        {onEdit && onDelete && (
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text">
                                    <MoreVerticalIcon className="w-5 h-5" />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-dark-card border border-dark-border rounded-md shadow-lg z-10 py-1 text-dark-text animate-fade-in">
                                        <button onClick={() => { setIsMenuOpen(false); onEdit(); }} className="w-full flex items-center px-4 py-2 text-sm hover:bg-dark-accent">
                                            <PencilIcon className="w-4 h-4 mr-2" /> Edit Project
                                        </button>
                                        <button onClick={() => { setIsMenuOpen(false); onDelete(); }} className="w-full flex items-center px-4 py-2 text-sm text-project-red-from hover:bg-dark-accent">
                                            <TrashIcon className="w-4 h-4 mr-2" /> Delete Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex h-full gap-6 min-w-[900px]">
                        {COLUMNS.map(col => (
                            <div 
                                key={col.id} 
                                className={`flex-1 bg-dark-card rounded-xl flex flex-col border-t-4 ${col.color} ${dragOverColumn === col.id ? 'bg-dark-accent/20' : ''}`}
                                onDragOver={(e) => handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                <div className="p-4 border-b border-dark-border flex justify-between items-center">
                                    <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                                    <span className="text-xs bg-dark-accent px-2 py-1 rounded-full text-dark-text-secondary">
                                        {projectTasks.filter(t => (t.status || 'BACKLOG') === col.id).length}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                    {projectTasks
                                        .filter(t => (t.status || 'BACKLOG') === col.id)
                                        .map(task => (
                                            <div 
                                                key={task.id} 
                                                draggable 
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                className="bg-dark-accent/30 p-4 rounded-lg border border-transparent hover:border-dark-border cursor-move group shadow-sm hover:shadow-md transition-all"
                                                onClick={() => handleEditTask(task)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>{task.priority}</span>
                                                    {/* Delete button visible on hover */}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete task?')) deleteTask(task.id); }}
                                                        className="text-dark-text-secondary hover:text-project-red-from opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <h4 className={`font-semibold text-sm mb-3 ${task.completed ? 'line-through text-dark-text-secondary' : 'text-dark-text'}`}>{task.name}</h4>
                                                <div className="flex items-center justify-between text-xs text-dark-text-secondary">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: task.category.color }}></div>
                                                        {task.category.name}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <CalendarDaysIcon className="w-3 h-3 mr-1" />
                                                        {task.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                    ))}
                                    <button 
                                        onClick={() => handleAddNewTask(col.id)}
                                        className="w-full py-2 border-2 border-dashed border-dark-border rounded-lg text-dark-text-secondary hover:text-dark-purple hover:border-dark-purple transition-colors flex items-center justify-center text-sm font-medium"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" /> Add Task
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectBoard;
