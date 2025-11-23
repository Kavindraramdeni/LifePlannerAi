
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from './icons';
import { PersonalRecord } from '../types';

interface PRSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRSettingsModal: React.FC<PRSettingsModalProps> = ({ isOpen, onClose }) => {
    const { personalRecords, updatePersonalRecord, deletePersonalRecord } = useData();
    const [newPrName, setNewPrName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editUnit, setEditUnit] = useState<'kg' | 'lbs' | 'reps'>('kg');
    
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) dialogRef.current?.showModal();
        else dialogRef.current?.close();
    }, [isOpen]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPrName.trim()) {
            updatePersonalRecord({
                id: `new-${Date.now()}`, // Temporary ID, context will assign a permanent one
                name: newPrName.trim(),
                weight: 0,
                unit: 'kg',
                lastUpdated: new Date()
            });
            setNewPrName('');
        }
    };

    const startEditing = (pr: PersonalRecord) => {
        setEditingId(pr.id);
        setEditName(pr.name);
        setEditUnit(pr.unit);
    };

    const saveEdit = (pr: PersonalRecord) => {
        if (editName.trim()) {
            updatePersonalRecord({
                ...pr,
                name: editName.trim(),
                unit: editUnit
            });
        }
        setEditingId(null);
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-lg text-dark-text backdrop:bg-black/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Personal Records</h2>
                <button onClick={onClose} className="text-dark-text-secondary hover:text-dark-text text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-dark-text-secondary mb-6">Add or edit exercises to track.</p>
            
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newPrName} 
                    onChange={(e) => setNewPrName(e.target.value)} 
                    placeholder="New Exercise Name (e.g. Pull-ups)" 
                    className="flex-1 bg-dark-accent p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-purple text-sm"
                    required
                />
                <button type="submit" className="bg-dark-purple text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-dark-purple/90 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {personalRecords.map(pr => (
                    <div key={pr.id} className="flex items-center bg-dark-accent/50 p-3 rounded-xl border border-transparent hover:border-dark-border transition-colors">
                        {editingId === pr.id ? (
                            <div className="flex items-center w-full gap-2">
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                    className="flex-1 bg-dark-bg p-2 rounded-lg text-sm border border-dark-purple focus:outline-none"
                                    autoFocus
                                />
                                <select 
                                    value={editUnit} 
                                    onChange={e => setEditUnit(e.target.value as 'kg' | 'lbs' | 'reps')}
                                    className="bg-dark-bg p-2 rounded-lg text-sm border border-dark-purple focus:outline-none"
                                >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="reps">reps</option>
                                </select>
                                <button onClick={() => saveEdit(pr)} className="p-2 bg-project-green-from text-white rounded-lg hover:opacity-90">
                                    <CheckIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <span className="font-semibold block">{pr.name}</span>
                                    <span className="text-xs text-dark-text-secondary">Current Max: {pr.weight} {pr.unit}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => startEditing(pr)} 
                                        className="p-2 text-dark-text-secondary hover:text-dark-purple hover:bg-dark-card rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { if(window.confirm('Delete this record?')) deletePersonalRecord(pr.id); }} 
                                        className="p-2 text-dark-text-secondary hover:text-project-red-from hover:bg-dark-card rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {personalRecords.length === 0 && (
                    <p className="text-center text-dark-text-secondary py-4">No records found. Add one above!</p>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-dark-border">
                 <button onClick={onClose} className="w-full py-2.5 bg-dark-accent hover:bg-dark-card text-dark-text font-semibold rounded-xl transition-colors">Done</button>
            </div>
        </dialog>
    );
};

export default PRSettingsModal;
