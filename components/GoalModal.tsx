import React, { useState, useEffect, useRef } from 'react';
import { Goal } from '../types';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'subTasks'> | Goal) => void;
    goalToEdit?: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [dueDate, setDueDate] = useState('');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (goalToEdit) {
                setTitle(goalToEdit.title);
                setDescription(goalToEdit.description);
                setCategory(goalToEdit.category);
                setDueDate(goalToEdit.dueDate ? goalToEdit.dueDate.toISOString().split('T')[0] : '');
            } else {
                setTitle('');
                setDescription('');
                setCategory('Personal');
                setDueDate('');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, goalToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const goalData = {
            title,
            description,
            category,
            dueDate: dueDate ? new Date(new Date(dueDate).setUTCHours(12,0,0,0)) : undefined,
        };

        if (goalToEdit) {
            onSave({ ...goalToEdit, ...goalData });
        } else {
            onSave(goalData);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-lg text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">{goalToEdit ? 'Edit Goal' : 'New Goal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="goal-title" className="text-sm text-dark-text-secondary">Title</label>
                    <input id="goal-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="goal-desc" className="text-sm text-dark-text-secondary">Description</label>
                    <textarea id="goal-desc" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" rows={3}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goal-category" className="text-sm text-dark-text-secondary">Category</label>
                        <input id="goal-category" type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                    </div>
                     <div>
                        <label htmlFor="goal-due-date" className="text-sm text-dark-text-secondary">Due Date (Optional)</label>
                        <input id="goal-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" />
                    </div>
                </div>
                 <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Goal</button>
                </div>
            </form>
        </dialog>
    );
};

export default GoalModal;