


import React, { useState, useEffect, useRef } from 'react';
import { Workout, WorkoutExercise } from '../types';
import { TrashIcon, PlusIcon, XMarkIcon } from './icons';

interface WorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workout: Omit<Workout, 'id' | 'completed' | 'createdAt' | 'completedAt'> | Workout) => void;
    onDelete?: () => void;
    workoutToEdit?: Workout | null;
    initialDay?: string;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, onSave, onDelete, workoutToEdit, initialDay }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [day, setDay] = useState('Monday');
    const [mode, setMode] = useState<'text' | 'structured'>('text');
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    const dialogRef = useRef<HTMLDialogElement>(null);
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (workoutToEdit) {
                setName(workoutToEdit.name);
                setContent(workoutToEdit.content);
                setDay(workoutToEdit.day || initialDay || 'Monday');
                setExercises(workoutToEdit.exercises || []);
                setMode(workoutToEdit.exercises && workoutToEdit.exercises.length > 0 ? 'structured' : 'text');
            } else {
                setName('');
                setContent('');
                setDay(initialDay || 'Monday');
                setExercises([]);
                setMode('text');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, workoutToEdit, initialDay]);

    const handleAddExercise = () => {
        setExercises([...exercises, { id: `ex-${Date.now()}`, name: '', sets: 3, reps: '10', weight: '' }]);
    };

    const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Auto-generate markdown content from structured data if in structured mode
        let finalContent = content;
        if (mode === 'structured') {
            finalContent = exercises.map(ex => `**${ex.name}**\n- ${ex.sets} sets x ${ex.reps} ${ex.weight ? `@ ${ex.weight}` : ''}`).join('\n\n');
        }

        const workoutData = {
            name,
            content: finalContent,
            day,
            exercises: mode === 'structured' ? exercises : undefined
        };

        if (workoutToEdit) {
            onSave({ ...workoutToEdit, ...workoutData });
        } else {
            onSave(workoutData);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-2xl text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">{workoutToEdit ? 'Edit Workout' : 'New Custom Workout'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="workout-name" className="text-sm text-dark-text-secondary">Workout Name</label>
                    <input id="workout-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="e.g., Chest & Triceps" />
                </div>
                
                <div>
                    <label htmlFor="workout-day" className="text-sm text-dark-text-secondary">Scheduled Day</label>
                    <select 
                        id="workout-day" 
                        value={day} 
                        onChange={e => setDay(e.target.value)} 
                        className="w-full bg-dark-accent p-2 rounded-lg mt-1"
                    >
                        {weekDays.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4 border-b border-dark-border pb-2">
                    <button type="button" onClick={() => setMode('text')} className={`text-sm font-bold pb-1 ${mode === 'text' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>Text Description</button>
                    <button type="button" onClick={() => setMode('structured')} className={`text-sm font-bold pb-1 ${mode === 'structured' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>Exercise Log</button>
                </div>

                {mode === 'text' ? (
                    <div>
                        <label htmlFor="workout-content" className="text-sm text-dark-text-secondary">Exercises (Markdown supported)</label>
                        <textarea id="workout-content" value={content} onChange={e => setContent(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" rows={6} placeholder="e.g.,&#10;- Bench Press: 4 sets of 8-12 reps&#10;- Incline Dumbbell Press: 3 sets of 10-15 reps"></textarea>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs text-dark-text-secondary font-bold uppercase mb-1">
                            <div className="col-span-5">Exercise</div>
                            <div className="col-span-2 text-center">Sets</div>
                            <div className="col-span-2 text-center">Reps</div>
                            <div className="col-span-2 text-center">Weight</div>
                            <div className="col-span-1"></div>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {exercises.map((ex, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <input type="text" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="w-full bg-dark-accent p-2 rounded text-sm" placeholder="Name" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" value={ex.sets} onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value))} className="w-full bg-dark-accent p-2 rounded text-sm text-center" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="text" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} className="w-full bg-dark-accent p-2 rounded text-sm text-center" placeholder="10" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="text" value={ex.weight} onChange={e => updateExercise(idx, 'weight', e.target.value)} className="w-full bg-dark-accent p-2 rounded text-sm text-center" placeholder="kg/lbs" />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button type="button" onClick={() => removeExercise(idx)} className="text-dark-text-secondary hover:text-project-red-from"><XMarkIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddExercise} className="text-xs flex items-center text-dark-purple font-bold mt-2 hover:underline">
                            <PlusIcon className="w-3 h-3 mr-1" /> Add Exercise
                        </button>
                    </div>
                )}
                
                <div className="flex gap-4 pt-4 items-center">
                    {workoutToEdit && onDelete && (
                        <button type="button" onClick={() => { if(window.confirm('Delete this workout?')) onDelete(); }} className="p-2 text-dark-text-secondary hover:text-project-red-from rounded-lg border border-transparent hover:border-dark-border transition-colors mr-auto" title="Delete">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className={`flex gap-4 flex-1 justify-end ${(!workoutToEdit || !onDelete) ? 'w-full' : ''}`}>
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-dark-accent font-semibold rounded-lg hover:bg-opacity-80">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-dark-purple text-white font-semibold rounded-lg hover:bg-opacity-90">Save Workout</button>
                    </div>
                </div>
            </form>
        </dialog>
    );
};

export default WorkoutModal;