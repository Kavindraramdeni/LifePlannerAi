
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Transaction, TransactionCategory } from '../types';
import { useData } from '../contexts/DataContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    transactionToEdit?: Transaction | null;
    categories: { [key: string]: TransactionCategory };
}

const FREQUENCIES = ['Once', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, categories }) => {
    const { transactions, accounts } = useData();
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryKey, setCategoryKey] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [countsTowardsBudget, setCountsTowardsBudget] = useState(true);
    
    const [account, setAccount] = useState('');
    const [toAccount, setToAccount] = useState(''); // For transfers
    const [frequency, setFrequency] = useState<'Once' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Once');
    const [includeInAccountTotal, setIncludeInAccountTotal] = useState(true);

    const dialogRef = useRef<HTMLDialogElement>(null);
    
    const expenseCategories = useMemo(() => Object.entries(categories).filter(([key]) => key !== 'income'), [categories]);

    // Calculate Recent Categories based on transaction history
    const recentCategories = useMemo(() => {
        const history = transactions
            .filter(t => t.type === 'expense' && t.category !== 'miscellaneous')
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        const uniqueKeys = new Set<string>();
        const recents: string[] = [];
        
        for (const t of history) {
            if (!uniqueKeys.has(t.category) && categories[t.category]) {
                uniqueKeys.add(t.category);
                recents.push(t.category);
                if (recents.length >= 3) break;
            }
        }
        return recents;
    }, [transactions, categories]);

    // Effect 1: Handle Dialog Open/Close state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                dialog.close();
            }
        }
    }, [isOpen]);

    // Effect 2: Handle Form Data Population
    useEffect(() => {
        if (isOpen) {
            // Ensure we have a valid default account
            const defaultAccount = accounts.length > 0 ? accounts[0] : '';
            const defaultToAccount = accounts.length > 1 ? accounts[1] : accounts[0];

            if (transactionToEdit) {
                setType(transactionToEdit.type);
                setAmount(String(transactionToEdit.amount));
                setDescription(transactionToEdit.description);
                setCategoryKey(transactionToEdit.category);
                setSubCategory(transactionToEdit.subCategory || '');
                setDate(transactionToEdit.date.toISOString().split('T')[0]);
                setNotes(transactionToEdit.notes || '');
                setCountsTowardsBudget(transactionToEdit.countsTowardsBudget !== false);
                setAccount(transactionToEdit.account || defaultAccount);
                setToAccount(transactionToEdit.toAccount || defaultToAccount);
                setFrequency(transactionToEdit.frequency || 'Once');
                setIncludeInAccountTotal(transactionToEdit.includeInAccountTotal !== false);
            } else {
                // Reset form defaults
                setType('expense');
                setAmount('');
                setDescription('');
                
                // Default category logic (prefer recent, else first available)
                const defaultCat = recentCategories.length > 0 ? recentCategories[0] : (expenseCategories.length > 0 ? expenseCategories[0][0] : '');
                setCategoryKey(defaultCat);
                
                // Reset subcategory based on default category
                const defaultSubs = defaultCat ? (categories[defaultCat]?.subCategories || []) : [];
                setSubCategory(defaultSubs.length > 0 ? defaultSubs[0] : '');

                setDate(new Date().toISOString().split('T')[0]);
                setNotes('');
                setCountsTowardsBudget(true);
                setAccount(defaultAccount);
                setToAccount(defaultToAccount);
                setFrequency('Once');
                setIncludeInAccountTotal(true);
            }
        }
    }, [isOpen, transactionToEdit, expenseCategories, categories, recentCategories, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use "Untitled Transaction" if description is empty
        const finalDescription = description.trim() === '' ? 'Untitled Transaction' : description;

        const transactionData = {
            type,
            amount: parseFloat(amount) || 0,
            description: type === 'transfer' ? `Transfer to ${toAccount}` : finalDescription,
            category: type === 'transfer' ? 'miscellaneous' : (type === 'income' ? 'income' : categoryKey),
            subCategory: type === 'transfer' ? 'Transfer' : subCategory,
            date: new Date(new Date(date).setUTCHours(12, 0, 0, 0)),
            notes,
            countsTowardsBudget: type === 'expense' ? countsTowardsBudget : undefined,
            account,
            toAccount: type === 'transfer' ? toAccount : undefined,
            frequency,
            includeInAccountTotal
        };

        if (transactionToEdit) {
            onSave({ ...transactionToEdit, ...transactionData });
        } else {
            onSave(transactionData);
        }
    };

    // Handle main category change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setCategoryKey(newCategory);
        // Reset subcategory when main category changes
        const availableSubs = categories[newCategory]?.subCategories || [];
        setSubCategory(availableSubs.length > 0 ? availableSubs[0] : '');
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg text-dark-text backdrop:bg-black/50 overflow-hidden">
            <div className="flex flex-col h-full max-h-[90vh]">
                <div className="p-6 border-b border-dark-border">
                    <h2 className="text-2xl font-bold">{transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                        
                        <div>
                            <label className="text-sm text-dark-text-secondary block mb-1">Type</label>
                            <div className="flex space-x-2 bg-dark-accent p-1 rounded-lg">
                                <button type="button" onClick={() => setType('expense')} className={`w-full py-2 rounded-md transition-colors ${type === 'expense' ? 'bg-dark-card text-white shadow' : 'text-dark-text-secondary'}`}>Expense</button>
                                <button type="button" onClick={() => setType('income')} className={`w-full py-2 rounded-md transition-colors ${type === 'income' ? 'bg-dark-card text-white shadow' : 'text-dark-text-secondary'}`}>Income</button>
                                <button type="button" onClick={() => setType('transfer')} className={`w-full py-2 rounded-md transition-colors ${type === 'transfer' ? 'bg-dark-card text-white shadow' : 'text-dark-text-secondary'}`}>Transfer</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-dark-text-secondary">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-secondary">₹</span>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-dark-accent p-2 pl-8 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple" required placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-dark-text-secondary">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple" required />
                            </div>
                        </div>

                        {type !== 'transfer' && (
                            <div>
                                <label className="text-sm text-dark-text-secondary">Description (Optional)</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple" placeholder="e.g., Coffee" />
                            </div>
                        )}
                        
                        {type === 'expense' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-dark-text-secondary">Category</label>
                                    <select 
                                        value={categoryKey} 
                                        onChange={handleCategoryChange} 
                                        className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                                    >
                                        {recentCategories.length > 0 && (
                                            <optgroup label="Recent">
                                                {recentCategories.map(key => (
                                                    <option key={`recent-${key}`} value={key}>{categories[key].name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                        <optgroup label="All Categories">
                                            {expenseCategories.map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-dark-text-secondary">Sub-category</label>
                                    <select 
                                        value={subCategory} 
                                        onChange={e => setSubCategory(e.target.value)} 
                                        className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                                    >
                                        <option value="">Select...</option>
                                        {categories[categoryKey]?.subCategories.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-dark-text-secondary">{type === 'transfer' ? 'From Account' : 'Account'}</label>
                                <select 
                                    value={account} 
                                    onChange={e => setAccount(e.target.value)} 
                                    className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                                >
                                    {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                </select>
                            </div>
                             {type === 'transfer' && (
                                 <div>
                                    <label className="text-sm text-dark-text-secondary">To Account</label>
                                    <select 
                                        value={toAccount} 
                                        onChange={e => setToAccount(e.target.value)} 
                                        className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                                    >
                                        {accounts.filter(a => a !== account).map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                    </select>
                                </div>
                             )}
                        </div>

                        <div>
                            <label className="text-sm text-dark-text-secondary">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-dark-purple" rows={2}></textarea>
                        </div>

                        <div>
                            <label className="text-sm text-dark-text-secondary">Frequency</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full bg-dark-accent p-2 rounded-lg mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-dark-purple">
                                {FREQUENCIES.map(freq => <option key={freq} value={freq}>{freq}</option>)}
                            </select>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-dark-border flex gap-4">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                    <button type="submit" form="transaction-form" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save</button>
                </div>
            </div>
        </dialog>
    );
};

export default TransactionModal;
