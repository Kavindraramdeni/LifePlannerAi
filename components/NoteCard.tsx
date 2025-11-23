


import React from 'react';
import { Note } from '../types';
import { DocumentTextIcon, TrashIcon, SparklesIcon } from './icons';

interface NoteCardProps {
    note: Note;
    onClick: () => void;
    onDelete?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => {
    // Create a snippet and remove HTML tags
    const snippet = note.content.replace(/<[^>]*>?/gm, '').substring(0, 100);

    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <div className={`w-full text-left bg-dark-card p-5 rounded-xl border transition-colors flex flex-col group relative cursor-pointer ${note.isPinned ? 'border-dark-purple shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'border-dark-border hover:border-dark-blue'}`} onClick={onClick}>
            {note.isPinned && (
                <div className="absolute top-0 right-0 p-2">
                    <SparklesIcon className="w-4 h-4 text-dark-purple" />
                </div>
            )}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold mb-2 pr-6 truncate w-full">{note.title}</h3>
                </div>
                {note.category && <span className="text-xs bg-dark-accent px-2 py-1 rounded-full text-dark-text-secondary inline-block mb-2">{note.category}</span>}
                <p className="text-sm text-dark-text-secondary break-words">
                    {snippet}{snippet.length === 100 ? '...' : ''}
                </p>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center text-xs text-dark-text-secondary">
                <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    <span>Note</span>
                </div>
                <span>{timeSince(note.lastUpdated)}</span>
            </div>
            {onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} 
                    className="absolute bottom-2 right-2 p-1.5 bg-dark-card text-dark-text-secondary hover:text-project-red-from rounded-full hover:bg-dark-accent opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                    title="Delete Note"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default NoteCard;