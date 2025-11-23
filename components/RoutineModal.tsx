
import React, { useState, useEffect, useRef } from 'react';
import { RoutineItem } from '../types';
import * as Icons from './icons';

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<RoutineItem, 'id'> | RoutineItem) => void;
    itemToEdit?: RoutineItem | null;
}

const AVAILABLE_ICONS = [
    'SunIcon', 'MoonIcon', 'WorkoutIcon', 'UtensilsIcon', 'BriefcaseIcon', 
    'BookOpenIcon', 'UserIcon', 'YogaIcon', 'SnowflakeIcon', 'SparklesIcon', 
    'TargetIcon', 'HomeIcon', 'CoffeeIcon' // CoffeeIcon not in original map but might be useful if added
];

const AVAILABLE_COLORS = [
    { label: 'Yellow', class: 'text-yellow-500 bg-yellow-500/10' },
    { label: 'Blue', class: 'text-blue-400 bg-blue-400/10' },
    { label: 'Cyan', class: 'text-cyan-400 bg-cyan-400/10' },
    { label: 'Green', class: 'text-green-500 bg-green-500/10' },
    { label: 'Lime', class: 'text-lime-400 bg-lime-400/10' },
    { label: 'Red', class: 'text-red-500 bg-red-500/10' },
    { label: 'Purple', class: 'text-purple-500 bg-purple-500/10' },
    { label: 'Indigo', class: 'text-indigo-400 bg-indigo-400/10' },
    { label: 'Orange', class: 'text-orange-400 bg-orange-400/10' },
    { label: 'Pink', class: 'text-pink-400 bg-pink-400/10' },
];

const RoutineModal: React.FC<RoutineModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [time, setTime] = useState('08:00');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('SunIcon');
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].class);
    const [detailLabel, setDetailLabel] = useState('');
    const [detailValue, setDetailValue] = useState('');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (itemToEdit) {
                setTime(itemToEdit.time);
                setTitle(itemToEdit.title);
                setSubtitle(itemToEdit.subtitle || '');
                setSelectedIcon(itemToEdit.icon);
                setSelectedColor(itemToEdit.color);
                if (itemToEdit.details && itemToEdit.details.length > 0) {
                    setDetailLabel(itemToEdit.details[0].label);
                    setDetailValue(itemToEdit.details[0].value);
                } else {
                    setDetailLabel('');
                    setDetailValue('');
                }
            } else {
                setTime('08:00');
                setTitle('');
                setSubtitle('');
                setSelectedIcon('SunIcon');
                setSelectedColor(AVAILABLE_COLORS[0].class);
                setDetailLabel('');
                setDetailValue('');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, itemToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newItem: any = {
            time,
            title,
            subtitle,
            icon: selectedIcon,
            color: selectedColor,
            details: (detailLabel && detailValue) ? [{ label: detailLabel, value: detailValue }] : []
        };

        if (itemToEdit) {
            onSave({ ...itemToEdit, ...newItem });
        } else {
            onSave(newItem);
        }
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-lg text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">{itemToEdit ? 'Edit Routine Step' : 'Add Routine Step'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="text-sm text-dark-text-secondary">Time</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-dark-text-secondary">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="e.g. Gym" />
                    </div>
                </div>
                <div>
                    <label className="text-sm text-dark-text-secondary">Subtitle (Optional)</label>
                    <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" placeholder="e.g. Leg Day" />
                </div>
                
                <div>
                    <label className="text-sm text-dark-text-secondary">Icon</label>
                    <div className="flex flex-wrap gap-2 mt-1 p-2 border border-dark-border rounded-lg max-h-32 overflow-y-auto">
                        {AVAILABLE_ICONS.map(iconKey => {
                            // @ts-ignore
                            const Icon = Icons[iconKey] || Icons.SparklesIcon;
                            return (
                                <button 
                                    key={iconKey} 
                                    type="button" 
                                    onClick={() => setSelectedIcon(iconKey)} 
                                    className={`p-2 rounded-lg ${selectedIcon === iconKey ? 'bg-dark-purple text-white' : 'bg-dark-accent text-dark-text-secondary'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-dark-text-secondary">Color Theme</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {AVAILABLE_COLORS.map(c => (
                            <button 
                                key={c.label} 
                                type="button" 
                                onClick={() => setSelectedColor(c.class)} 
                                className={`w-8 h-8 rounded-full border-2 ${selectedColor === c.class ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: c.class.includes('text-') ? 'currentColor' : undefined }} // Simplistic preview
                            >
                                <div className={`w-full h-full rounded-full opacity-50 ${c.class.split(' ')[1]}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-dark-accent/30 p-3 rounded-lg">
                    <div>
                        <label className="text-xs text-dark-text-secondary">Detail Label</label>
                        <input type="text" value={detailLabel} onChange={e => setDetailLabel(e.target.value)} className="w-full bg-dark-accent p-1 rounded text-sm" placeholder="e.g. Focus" />
                    </div>
                    <div>
                        <label className="text-xs text-dark-text-secondary">Detail Value</label>
                        <input type="text" value={detailValue} onChange={e => setDetailValue(e.target.value)} className="w-full bg-dark-accent p-1 rounded text-sm" placeholder="e.g. Deep Work" />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent text-white font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save</button>
                </div>
            </form>
        </dialog>
    );
};

export default RoutineModal;
