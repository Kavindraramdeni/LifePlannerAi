import React, { useState, useEffect, useRef } from 'react';
import { TransactionCategory } from '../types';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budgets: { [categoryKey: string]: number }) => void;
    initialBudgets: { [categoryKey: string]: number };
    categories: { [key: string]: TransactionCategory };
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSave, initialBudgets, categories }) => {
    const [budgets, setBudgets] = useState(initialBudgets);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        setBudgets(initialBudgets);
    }, [initialBudgets]);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    const handleBudgetChange = (categoryKey: string, value: string) => {
        const newLimit = parseFloat(value);
        setBudgets(prev => ({
            ...prev,
            [categoryKey]: isNaN(newLimit) ? 0 : newLimit,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(budgets);
        onClose();
    };

    const expenseCategories = Object.entries(categories).filter(([key]) => key !== 'income');

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-lg text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">Set Monthly Budgets</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {expenseCategories.map(([key, category]) => (
                        <div key={key} className="flex items-center justify-between">
                            <label htmlFor={`budget-${key}`} className="text-dark-text">{(category as TransactionCategory).name}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-secondary">₹</span>
                                <input
                                    id={`budget-${key}`}
                                    type="number"
                                    step="10"
                                    min="0"
                                    value={budgets[key] || ''}
                                    onChange={e => handleBudgetChange(key, e.target.value)}
                                    className="w-32 bg-dark-accent p-2 pl-6 rounded-lg text-right"
                                    placeholder="No limit"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 pt-6 mt-2 border-t border-dark-border">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Budgets</button>
                </div>
            </form>
        </dialog>
    );
};

export default BudgetModal;