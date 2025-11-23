
import React, { useState, useRef, useEffect } from 'react';
import { TargetCategory, TargetItem, TargetAutoType } from '../types';
import { TrashIcon, PlusIcon, CheckIcon } from './icons';
import * as Icons from './icons';

interface TargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Omit<TargetCategory, 'id'> | TargetCategory) => void;
    onDelete?: () => void;
    categoryToEdit?: TargetCategory | null;
}

const AVAILABLE_ICONS = [
    'WorkoutIcon', 'UtensilsIcon', 'BriefcaseIcon', 'BookOpenIcon', 
    'TargetIcon', 'SparklesIcon', 'HomeIcon', 'UserIcon', 'HeartIcon',
    'LineChartIcon', 'PieChartIcon', 'ListIcon'
];

const AVAILABLE_COLORS = [
    { label: 'Red', class: 'text-red-500 bg-red-500/10' },
    { label: 'Green', class: 'text-green-500 bg-green-500/10' },
    { label: 'Blue', class: 'text-blue-500 bg-blue-500/10' },
    { label: 'Purple', class: 'text-purple-500 bg-purple-500/10' },
    { label: 'Yellow', class: 'text-yellow-500 bg-yellow-500/10' },
    { label: 'Orange', class: 'text-orange-500 bg-orange-500/10' },
    { label: 'Pink', class: 'text-pink-500 bg-pink-500/10' },
    { label: 'Cyan', class: 'text-cyan-500 bg-cyan-500/10' },
];

const AUTO_TYPES: { label: string, value: TargetAutoType | 'manual' }[] = [
    { label: 'Manual Checkbox', value: 'manual' },
    { label: 'Daily Workout (Any)', value: 'workout' },
    { label: 'Routine Task (by keyword)', value: 'routine_task' },
    { label: 'Calorie Target', value: 'calories' },
    { label: 'Protein Target', value: 'protein' },
];

const TargetModal: React.FC<TargetModalProps> = ({ isOpen, onClose, onSave, onDelete, categoryToEdit }) => {
    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('TargetIcon');
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].class);
    const [items, setItems] = useState<TargetItem[]>([]);
    const [newItemLabel, setNewItemLabel] = useState('');
    const [newItemType, setNewItemType] = useState<TargetAutoType | 'manual'>('manual');
    const [newItemLink, setNewItemLink] = useState('');

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (categoryToEdit) {
                setTitle(categoryToEdit.title);
                setSelectedIcon(categoryToEdit.icon);
                setSelectedColor(categoryToEdit.color);
                setItems(categoryToEdit.items);
            } else {
                setTitle('');
                setSelectedIcon('TargetIcon');
                setSelectedColor(AVAILABLE_COLORS[0].class);
                setItems([]);
            }
            setNewItemLabel('');
            setNewItemType('manual');
            setNewItemLink('');
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, categoryToEdit]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemLabel.trim()) return;

        const newItem: TargetItem = {
            id: `ti_${Date.now()}`,
            label: newItemLabel,
            type: newItemType === 'manual' ? 'manual' : 'auto',
            autoType: newItemType !== 'manual' ? (newItemType as TargetAutoType) : undefined,
            linkedValue: newItemLink || undefined
        };

        setItems([...items, newItem]);
        setNewItemLabel('');
        setNewItemType('manual');
        setNewItemLink('');
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryData = {
            title,
            icon: selectedIcon,
            color: selectedColor,
            items
        };

        if (categoryToEdit) {
            onSave({ ...categoryToEdit, ...categoryData });
        } else {
            onSave(categoryData);
        }
        onClose();
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-2xl text-dark-text backdrop:bg-black/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{categoryToEdit ? 'Edit Summary Card' : 'New Summary Card'}</h2>
                {categoryToEdit && onDelete && (
                    <button onClick={() => { if(window.confirm('Delete this card?')) { onDelete(); onClose(); } }} className="text-project-red-from hover:bg-dark-accent p-2 rounded-lg">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-dark-text-secondary">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="e.g. MORNING ROUTINE" />
                    </div>
                    
                    <div>
                        <label className="text-sm text-dark-text-secondary">Color Theme</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {AVAILABLE_COLORS.map((c) => (
                                <button
                                    key={c.label}
                                    type="button"
                                    onClick={() => setSelectedColor(c.class)}
                                    className={`w-6 h-6 rounded-full border-2 ${selectedColor === c.class ? 'border-white' : 'border-transparent'}`}
                                >
                                    <div className={`w-full h-full rounded-full ${c.class.split(' ')[1]}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-dark-text-secondary">Icon</label>
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-dark-accent/30 rounded-lg max-h-24 overflow-y-auto">
                        {AVAILABLE_ICONS.map(iconKey => {
                            // @ts-ignore
                            const IconComp = Icons[iconKey] || Icons.TargetIcon;
                            return (
                                <button
                                    key={iconKey}
                                    type="button"
                                    onClick={() => setSelectedIcon(iconKey)}
                                    className={`p-2 rounded-lg transition-colors ${selectedIcon === iconKey ? 'bg-dark-purple text-white' : 'hover:bg-dark-accent text-dark-text-secondary'}`}
                                >
                                    <IconComp className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Items Manager */}
                <div className="border-t border-dark-border pt-4">
                    <h3 className="font-bold mb-3">Checklist Items</h3>
                    
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                        {items.length === 0 && <p className="text-sm text-dark-text-secondary italic">No items yet.</p>}
                        {items.map((item, idx) => (
                            <div key={item.id} className="flex items-center justify-between bg-dark-accent/50 p-2 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-xs font-bold bg-dark-card px-1.5 py-0.5 rounded mr-2 text-dark-text-secondary">
                                        {item.type === 'manual' ? 'MANUAL' : 'AUTO'}
                                    </span>
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                <button type="button" onClick={() => handleDeleteItem(item.id)} className="text-dark-text-secondary hover:text-project-red-from">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-dark-accent p-3 rounded-lg">
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-5">
                                <label className="text-xs text-dark-text-secondary">Label</label>
                                <input type="text" value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} className="w-full bg-dark-bg p-2 rounded text-sm" placeholder="e.g. Drink Water" />
                            </div>
                            <div className="col-span-4">
                                <label className="text-xs text-dark-text-secondary">Type</label>
                                <select value={newItemType} onChange={e => setNewItemType(e.target.value as any)} className="w-full bg-dark-bg p-2 rounded text-sm">
                                    {AUTO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3 flex items-center gap-2">
                                {newItemType === 'routine_task' && (
                                    <input type="text" value={newItemLink} onChange={e => setNewItemLink(e.target.value)} className="w-full bg-dark-bg p-2 rounded text-sm" placeholder="Keyword" title="Keyword to match in routine" />
                                )}
                                <button onClick={handleAddItem} className="p-2 bg-dark-purple text-white rounded hover:bg-opacity-90 flex-shrink-0 w-full flex justify-center">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {newItemType === 'routine_task' && <p className="text-[10px] text-dark-text-secondary mt-1">Matches keyword in your Daily Routine steps (e.g. "Walk").</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-dark-accent rounded-lg font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-dark-purple text-white rounded-lg font-semibold">Save Card</button>
                </div>
            </form>
        </dialog>
    );
};

export default TargetModal;
