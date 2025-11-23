
import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'id' | 'progress' | 'theme' | 'team'> | Project) => void;
    projectToEdit?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (projectToEdit) {
                setTitle(projectToEdit.title);
                setCategory(projectToEdit.category);
                setDueDate(projectToEdit.dueDate.toISOString().split('T')[0]);
            } else {
                // Reset form for new project
                setTitle('');
                setCategory('');
                setDueDate(new Date().toISOString().split('T')[0]);
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, projectToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            title,
            category,
            dueDate: new Date(new Date(dueDate).setUTCHours(12, 0, 0, 0)), // Avoid timezone issues
        };

        if (projectToEdit) {
            onSave({ ...projectToEdit, ...projectData });
        } else {
            onSave(projectData);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-lg text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">{projectToEdit ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="project-title" className="text-sm text-dark-text-secondary">Project Title</label>
                    <input id="project-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div>
                    <label htmlFor="project-category" className="text-sm text-dark-text-secondary">Category</label>
                    <input id="project-category" type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="e.g., Marketing, Development" />
                </div>
                <div>
                    <label htmlFor="project-due-date" className="text-sm text-dark-text-secondary">Due Date</label>
                    <input id="project-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Project</button>
                </div>
            </form>
        </dialog>
    );
};

export default ProjectModal;
      