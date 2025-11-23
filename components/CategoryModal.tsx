
import React, { useState, useEffect, useRef } from 'react';
import { TransactionCategory } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, PencilIcon, XMarkIcon } from './icons';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categories: { [key: string]: TransactionCategory }) => void;
    initialCategories: { [key: string]: TransactionCategory };
    availableIcons: { [key: string]: IconComponent };
}

const availableColors = ['#A855F7', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#9333EA', '#F472B6', '#10B981'];

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialCategories, availableIcons }) => {
    const [categories, setCategories] = useState<{ [key: string]: TransactionCategory }>({});
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(Object.keys(availableIcons)[0]);
    const [selectedColor, setSelectedColor] = useState(availableColors[0]);
    const [editingState, setEditingState] = useState<{ type: 'main' | 'sub', key: string, subName?: string, currentName: string } | null>(null);
    const [newSubcategory, setNewSubcategory] = useState<{ [key: string]: string }>({});
    
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            // FIX: Deep copy using JSON.parse/stringify strips function components (icons).
            // A manual deep copy is needed to preserve them.
            const deepCopiedCategories: { [key: string]: TransactionCategory } = {};
            for (const key in initialCategories) {
                if (Object.prototype.hasOwnProperty.call(initialCategories, key)) {
                    const category = initialCategories[key];
                    deepCopiedCategories[key] = {
                        ...category,
                        // FIX: Ensure subCategories is iterable. Old data from localStorage might be missing this property.
                        subCategories: [...(category.subCategories || [])],
                    };
                }
            }
            setCategories(deepCopiedCategories);

            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
            setEditingState(null);
            setNewSubcategory({});
        }
    }, [isOpen, initialCategories]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        const key = newCategoryName.trim().replace(/\s+/g, '');
        if (categories[key]) { alert('A category with this name already exists.'); return; }
        
        setCategories(prev => ({ ...prev, [key]: { name: newCategoryName.trim(), icon: availableIcons[selectedIcon], color: selectedColor, subCategories: [] } }));
        setNewCategoryName('');
    };

    const handleAddSubcategory = (mainCatKey: string) => {
        const subName = newSubcategory[mainCatKey]?.trim();
        if (!subName || (categories[mainCatKey] as TransactionCategory).subCategories.includes(subName)) {
            if ((categories[mainCatKey] as TransactionCategory).subCategories.includes(subName)) alert('Sub-category already exists.');
            return;
        }
        setCategories(prev => ({
            ...prev,
            [mainCatKey]: { ...(prev[mainCatKey] as TransactionCategory), subCategories: [...(prev[mainCatKey] as TransactionCategory).subCategories, subName] }
        }));
        setNewSubcategory(prev => ({...prev, [mainCatKey]: ''}));
    };

    const handleDeleteCategory = (key: string) => {
        const category = categories[key] as TransactionCategory;
        if (['income', 'miscellaneous'].includes(key)) { alert(`Cannot delete the "${category.name}" category.`); return; }
        if (window.confirm(`Delete "${category.name}"? Transactions will be moved to "Miscellaneous / Others".`)) {
            const newCategories = { ...categories };
            delete newCategories[key];
            setCategories(newCategories);
        }
    };
    
    const handleDeleteSubcategory = (mainCatKey: string, subName: string) => {
        setCategories(prev => ({
            ...prev,
            [mainCatKey]: { ...(prev[mainCatKey] as TransactionCategory), subCategories: (prev[mainCatKey] as TransactionCategory).subCategories.filter(s => s !== subName) }
        }));
    };
    
    const handleSaveEdit = () => {
        if (!editingState) return;
        const { type, key, subName, currentName } = editingState;
        const newName = currentName.trim();
        if (!newName) { setEditingState(null); return; }

        if (type === 'main') {
            if (Object.entries(categories).some(([k, c]) => k !== key && (c as TransactionCategory).name === newName)) {
                alert("Category name already exists.");
                return;
            }
            setCategories(prev => ({ ...prev, [key]: { ...(prev[key] as TransactionCategory), name: newName } }));
        } else if (type === 'sub' && subName) {
            const category = categories[key] as TransactionCategory;
            if (category.subCategories.some(s => s === newName && s !== subName)) {
                alert("Sub-category name already exists.");
                return;
            }
            setCategories(prev => {
                const prevCat = prev[key] as TransactionCategory;
                return {
                    ...prev,
                    [key]: { ...prevCat, subCategories: prevCat.subCategories.map(s => s === subName ? newName : s) }
                };
            });
        }
        setEditingState(null);
    };

    const handleSave = () => {
        onSave(categories);
        onClose();
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-2xl text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
                {Object.entries(categories).map(([key, category]) => {
                    const cat = category as TransactionCategory;
                    return (
                    <div key={key} className="bg-dark-accent rounded-lg p-3">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                                    <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                                </div>
                                {editingState?.type === 'main' && editingState.key === key ? (
                                    <input type="text" value={editingState.currentName} onChange={e => setEditingState({...editingState, currentName: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} onBlur={handleSaveEdit} autoFocus className="bg-dark-bg p-1 rounded" />
                                ) : (
                                    <span className="font-semibold">{cat.name}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingState({ type: 'main', key, currentName: cat.name })} className="p-1.5 text-dark-text-secondary hover:text-dark-text"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCategory(key)} className="p-1.5 text-dark-text-secondary hover:text-project-red-from"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="pl-12 mt-2 space-y-2">
                            {cat.subCategories.map(sub => (
                                <div key={sub} className="flex items-center justify-between text-sm">
                                    {editingState?.type === 'sub' && editingState.key === key && editingState.subName === sub ? (
                                        <input type="text" value={editingState.currentName} onChange={e => setEditingState({...editingState, currentName: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} onBlur={handleSaveEdit} autoFocus className="bg-dark-bg p-1 rounded" />
                                    ) : (
                                        <span className="text-dark-text-secondary">{sub}</span>
                                    )}
                                    <div className="flex items-center gap-1">
                                         <button onClick={() => setEditingState({ type: 'sub', key, subName: sub, currentName: sub })} className="p-1 text-dark-text-secondary/50 hover:text-dark-text"><PencilIcon className="w-3.5 h-3.5" /></button>
                                         <button onClick={() => handleDeleteSubcategory(key, sub)} className="p-1 text-dark-text-secondary/50 hover:text-project-red-from"><XMarkIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <input type="text" placeholder="New sub-category" value={newSubcategory[key] || ''} onChange={e => setNewSubcategory(p => ({...p, [key]: e.target.value}))} onKeyDown={e => e.key === 'Enter' && handleAddSubcategory(key)} className="flex-grow bg-dark-bg p-1 rounded text-sm" />
                                <button onClick={() => handleAddSubcategory(key)} className="p-1 bg-dark-bg rounded text-dark-text-secondary hover:text-white"><PlusIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 p-4 border border-dark-border rounded-lg">
                 <h3 className="font-semibold">Add New Main Category</h3>
                 <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Category Name" className="w-full bg-dark-bg p-2 rounded-lg" />
                <div>
                    <p className="text-sm text-dark-text-secondary mb-2">Icon & Color</p>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-2 border border-dark-bg rounded-lg p-2">
                            {Object.keys(availableIcons).map(iconKey => {
                                const IconComponent = availableIcons[iconKey];
                                return (
                                    <button type="button" key={iconKey} onClick={() => setSelectedIcon(iconKey)} className={`p-2 rounded-lg ${selectedIcon === iconKey ? 'bg-dark-purple' : 'bg-dark-bg'}`}>
                                        <IconComponent className={`w-5 h-5 ${selectedIcon === iconKey ? 'text-white' : 'text-dark-text-secondary'}`} />
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableColors.map(color => (
                                <button type="button" key={color} onClick={() => setSelectedColor(color)} className="w-7 h-7 rounded-full" style={{ backgroundColor: color }}>
                                    {selectedColor === color && <CheckIcon className="w-4 h-4 m-auto text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button type="submit" className="flex items-center justify-center w-full py-2 bg-dark-blue text-white font-semibold rounded-lg">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Category
                </button>
            </form>

            <div className="flex gap-4 pt-6 mt-6 border-t border-dark-border">
                <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                <button type="button" onClick={handleSave} className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save & Close</button>
            </div>
        </dialog>
    );
};

export default CategoryModal;
