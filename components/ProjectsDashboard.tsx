
import React, { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { PlusIcon } from './icons';
import ProjectModal from './ProjectModal';
import ProjectBoard from './ProjectBoard';
import { useData } from '../contexts/DataContext';

const ProjectsDashboard: React.FC = () => {
    const { projects, saveProject, deleteProject, team } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [activeProject, setActiveProject] = useState<Project | null>(null);

    const handleOpenNewModal = () => {
        setProjectToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProjectToEdit(null);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            deleteProject(id);
        }
    };
    
    const handleSave = (projectData: Omit<Project, 'id' | 'progress' | 'theme' | 'team'> | Project) => {
        saveProject(projectData, team);
        handleCloseModal();
    };

    if (activeProject) {
        return (
            <ProjectBoard 
                project={activeProject} 
                onBack={() => setActiveProject(null)} 
                onEdit={() => handleOpenEditModal(activeProject)}
                onDelete={() => {
                    if (window.confirm('Are you sure you want to delete this project?')) {
                         deleteProject(activeProject.id);
                         setActiveProject(null);
                    }
                }}
            />
        );
    }

    return (
        <>
            <ProjectModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                projectToEdit={projectToEdit}
            />
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                <header className="flex justify-end items-center mb-6">
                    <button onClick={handleOpenNewModal} className="flex items-center px-4 py-2 bg-dark-blue text-white font-semibold rounded-lg shadow-md hover:bg-opacity-80 transition-all">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Project
                    </button>
                </header>
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} onClick={() => setActiveProject(project)} className="cursor-pointer">
                            <ProjectCard 
                                project={project}
                                onEdit={() => handleOpenEditModal(project)}
                                onDelete={() => handleDelete(project.id)}
                            />
                        </div>
                    ))}
                </main>
            </div>
        </>
    );
};

export default ProjectsDashboard;
