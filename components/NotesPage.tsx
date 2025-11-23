


import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { PlusIcon, DocumentIcon, BookOpenIcon, SparklesIcon, CheckCircleIcon } from './icons';
import NoteEditor from './NoteEditor';
import NoteCard from './NoteCard';
import * as api from '../services/api';

const SkeletonNoteCard: React.FC = () => (
    <div className="bg-dark-card p-5 rounded-xl border border-dark-border flex flex-col animate-pulse">
        <div className="h-4 bg-dark-accent rounded w-3/4 mb-3"></div>
        <div className="space-y-2 flex-1">
            <div className="h-3 bg-dark-accent rounded w-full"></div>
            <div className="h-3 bg-dark-accent rounded w-5/6"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
            <div className="h-3 bg-dark-accent rounded w-1/4"></div>
            <div className="h-3 bg-dark-accent rounded w-1/4"></div>
        </div>
    </div>
);

const NotesPage: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const fetchedNotes = await api.getNotes();
                setNotes(fetchedNotes);
            } catch (err) {
                setError("Failed to load notes. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleSelectNote = (id: string) => {
        setActiveNoteId(id);
    };

    const handleBackToList = () => {
        setActiveNoteId(null);
        // Refresh list to show update date changes
        api.getNotes().then(setNotes);
    };

    const handleSaveNote = async (updatedNote: Note) => {
        try {
            await api.saveNote(updatedNote);
            // Refetching ensures list is correctly sorted by lastUpdated
            const fetchedNotes = await api.getNotes();
            setNotes(fetchedNotes);
            // Keep editor open
        } catch(err) {
            setError("Failed to save note.");
            console.error(err);
        }
    };
    
    const handleNewNote = async () => {
        const newNoteData = {
            title: 'Untitled Note',
            content: '',
            tags: [],
            category: 'Uncategorized',
            isPinned: false
        };
        const newNote = await api.createNote(newNoteData);
        setNotes(prevNotes => [newNote, ...prevNotes]);
        setActiveNoteId(newNote.id);
    };
    
    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.deleteNote(noteId);
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            if (activeNoteId === noteId) setActiveNoteId(null);
        } catch (err) {
            setError("Failed to delete note. Please try again.");
            console.error(err);
        }
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    if (activeNote) {
        return <NoteEditor note={activeNote} onSave={handleSaveNote} onBack={handleBackToList} onDelete={() => handleDeleteNote(activeNote.id)} />;
    }

    const categories = [...new Set(notes.map(n => n.category))];
    const pinnedNotes = notes.filter(n => n.isPinned);
    const otherNotes = notes.filter(n => !n.isPinned);

    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notes</h1>
                    <p className="text-dark-text-secondary">Your most recently updated notes</p>
                </div>
                <button onClick={handleNewNote} className="flex items-center px-4 py-2 bg-dark-blue text-white font-semibold rounded-lg shadow-md hover:bg-opacity-80 transition-all">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Note
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-dark-card p-5 rounded-xl flex items-center">
                    <DocumentIcon className="w-8 h-8 text-dark-blue mr-4" />
                    <div>
                        <p className="text-sm text-dark-text-secondary">Total Docs</p>
                        <p className="text-2xl font-bold">{notes.length}</p>
                    </div>
                </div>
                <div className="bg-dark-card p-5 rounded-xl flex items-center">
                    <BookOpenIcon className="w-8 h-8 text-dark-blue mr-4" />
                    <div>
                        <p className="text-sm text-dark-text-secondary">Categories</p>
                        <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                </div>
                <div className="bg-dark-card p-5 rounded-xl flex items-center">
                    <SparklesIcon className="w-8 h-8 text-dark-blue mr-4" />
                    <div>
                        <p className="text-sm text-dark-text-secondary">Pinned</p>
                        <p className="text-2xl font-bold">{pinnedNotes.length}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => <SkeletonNoteCard key={index} />)}
                </div>
            ) : error ? (
                <div className="text-center py-10 bg-dark-card rounded-lg">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : notes.length === 0 ? (
                    <div className="text-center py-10 bg-dark-card rounded-lg">
                    <p className="text-dark-text-secondary">You don't have any notes yet. Create one!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {pinnedNotes.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center text-dark-purple"><SparklesIcon className="w-5 h-5 mr-2"/> Pinned Notes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pinnedNotes.map(note => (
                                    <NoteCard 
                                        key={note.id} 
                                        note={note} 
                                        onClick={() => handleSelectNote(note.id)} 
                                        onDelete={() => handleDeleteNote(note.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        {pinnedNotes.length > 0 && <h2 className="text-xl font-bold mb-4">Other Notes</h2>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    onClick={() => handleSelectNote(note.id)} 
                                    onDelete={() => handleDeleteNote(note.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;