import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, BriefcaseIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
    const { accounts, addAccount, deleteAccount, transactions } = useData();
    const [newAccountName, setNewAccountName] = useState('');
    
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
            setNewAccountName('');
        }
    }, [isOpen]);

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newAccountName.trim();
        if (!trimmedName) return;
        
        if (accounts.includes(trimmedName)) {
            alert("Account name already exists.");
            return;
        }

        addAccount(trimmedName);
        setNewAccountName('');
    };

    const handleDeleteAccount = (accountName: string) => {
        // Check if used
        const isUsed = transactions.some(t => t.account === accountName || t.toAccount === accountName);
        if (isUsed) {
            if (!window.confirm(`"${accountName}" is used in existing transactions. Deleting it will assume those transactions belong to a deleted account. Continue?`)) {
                return;
            }
        } else if (!window.confirm(`Delete account "${accountName}"?`)) {
            return;
        }
        deleteAccount(accountName);
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">Manage Accounts</h2>
            <p className="text-sm text-dark-text-secondary mb-4">Add or remove accounts like Bank, Cash, or Credit Cards.</p>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                {accounts.map(account => (
                    <div key={account} className="flex justify-between items-center bg-dark-accent p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-dark-card p-2 rounded-full">
                                <BriefcaseIcon className="w-4 h-4 text-dark-purple" />
                            </div>
                            <span className="font-medium">{account}</span>
                        </div>
                        <button 
                            onClick={() => handleDeleteAccount(account)} 
                            className="text-dark-text-secondary hover:text-project-red-from p-2 rounded-full hover:bg-dark-card transition-colors"
                            disabled={accounts.length <= 1}
                            title="Delete Account"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                    <label className="text-sm text-dark-text-secondary">New Account Name</label>
                    <div className="flex gap-2 mt-1">
                        <input 
                            type="text" 
                            value={newAccountName} 
                            onChange={e => setNewAccountName(e.target.value)} 
                            className="w-full bg-dark-bg p-2 rounded-lg border border-dark-border focus:outline-none focus:border-dark-purple" 
                            placeholder="e.g., Business Card"
                            required
                        />
                        <button type="submit" className="bg-dark-purple text-white p-2 rounded-lg hover:bg-opacity-90">
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-6 pt-4 border-t border-dark-border">
                <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Close</button>
            </div>
        </dialog>
    );
};

export default AccountModal;