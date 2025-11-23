


import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { MoreVerticalIcon, PencilIcon, TrashIcon } from './icons';

interface ProjectCardProps {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const daysLeft = Math.ceil((project.dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    return (
        <div className={`bg-gradient-to-br ${project.theme.gradientFrom} ${project.theme.gradientTo} p-5 rounded-2xl flex flex-col text-white shadow-lg h-full relative group`}>
            <div className="flex justify-between items-start mb-4 relative z-20">
                <span className="text-xs opacity-80 font-medium bg-black/20 px-2 py-1 rounded">{project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <div className="relative" ref={menuRef}>
                    <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="opacity-80 hover:opacity-100 p-1.5 rounded-full hover:bg-white/10 transition-colors">
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-dark-accent border border-dark-border rounded-lg shadow-xl z-50 py-1 text-dark-text animate-fade-in">
                            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit(); }} className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-card transition-colors">
                                <PencilIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete(); }} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card transition-colors">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg leading-tight mb-1">{project.title}</h3>
                <p className="text-sm opacity-80 font-medium">{project.category}</p>
            </div>

            <div className="flex-grow"></div>

            <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-medium opacity-90">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5">
                    <div className={`${project.theme.progressBg} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center min-h-[32px]">
                <div className="flex -space-x-2">
                    {project.team && project.team.length > 0 ? project.team.map((member, idx) => (
                        <img
                            key={idx}
                            src={member.avatarUrl}
                            alt={member.name}
                            title={member.name}
                            className="w-8 h-8 rounded-full border-2 border-white/30"
                        />
                    )) : (
                         <span className="text-xs opacity-50 italic">No team assigned</span>
                    )}
                </div>
                <div className={`text-xs px-3 py-1 rounded-full font-medium ${daysLeft < 0 ? 'bg-red-500/80 text-white' : 'bg-white/20'}`}>
                    {daysLeft > 1 ? `${daysLeft} days left` : daysLeft >= 0 ? `${daysLeft} day left` : `${-daysLeft} days overdue`}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;