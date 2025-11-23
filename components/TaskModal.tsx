
import React, { useState, useEffect, useRef } from 'react';
import { Task, Category, Project } from '../types';
import { useData } from '../contexts/DataContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'createdAt'> | Task) => void;
    taskToEdit?: Task | null;
    categories: { [key: string]: Category };
    initialProjectId?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit, categories, initialProjectId }) => {
    const { projects } = useData();
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
    const [categoryName, setCategoryName] = useState('personal');
    const [completed, setCompleted] = useState(false);
    const [recurrence, setRecurrence] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('None');
    const [projectId, setProjectId] = useState<string>('');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (taskToEdit) {
                setName(taskToEdit.name);
                setDueDate(taskToEdit.dueDate.toISOString().split('T')[0]);
                setPriority(taskToEdit.priority);
                setCategoryName(Object.keys(categories).find(key => categories[key].name === taskToEdit.category.name) || 'personal');
                setCompleted(taskToEdit.completed);
                setRecurrence(taskToEdit.recurrence || 'None');
                setProjectId(taskToEdit.projectId || '');
            } else {
                // Reset form for new task
                setName('');
                setDueDate(new Date().toISOString().split('T')[0]);
                setPriority('Medium');
                setCategoryName('personal');
                setCompleted(false);
                setRecurrence('None');
                setProjectId(initialProjectId || '');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, taskToEdit, categories, initialProjectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const taskData = {
            name,
            dueDate: new Date(new Date(dueDate).setUTCHours(12,0,0,0)), // Avoid timezone issues
            priority,
            category: categories[categoryName],
            completed,
            recurrence,
            projectId: projectId || undefined,
            tags: taskToEdit?.tags || [] // Preserve existing tags if editing, otherwise empty
        };

        if (taskToEdit) {
            onSave({ ...taskToEdit, ...taskData });
        } else {
            onSave(taskData);
        }
    };

    // Filter categories based on context
    const availableCategories = Object.entries(categories).filter(([key]) => {
        if (initialProjectId) {
            // In Project context: Only Work and Personal
            return key === 'work' || key === 'personal';
        } else {
            // In Todo context: Everything except Meal Prep
            return key !== 'mealPrep';
        }
    });

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="task-name" className="text-sm text-dark-text-secondary">Task Name</label>
                    <input id="task-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="task-due-date" className="text-sm text-dark-text-secondary">Due Date</label>
                    <input id="task-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="task-priority" className="text-sm text-dark-text-secondary">Priority</label>
                        <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="task-category" className="text-sm text-dark-text-secondary">Category</label>
                        <select id="task-category" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            {availableCategories.map(([key, category]) => (
                                <option key={key} value={key}>{(category as Category).name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="task-recurrence" className="text-sm text-dark-text-secondary">Recurring</label>
                        <select id="task-recurrence" value={recurrence} onChange={e => setRecurrence(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            <option value="None">None</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="task-project" className="text-sm text-dark-text-secondary">Link Project</label>
                        <select id="task-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1">
                            <option value="">None</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                 <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent text-white font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Task</button>
                </div>
            </form>
        </dialog>
    );
};

export default TaskModal;
