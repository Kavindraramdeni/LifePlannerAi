


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, TransactionCategory, SavingsGoal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { 
    TrendingUpIcon, 
    TrendingDownIcon, 
    DollarSignIcon, 
    PlusCircleIcon, 
    ShoppingCartIcon, 
    HomeIcon, 
    UtensilsIcon, 
    GiftIcon, 
    BriefcaseIcon, 
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    ImageIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    NoSymbolIcon,
    TagIcon,
    BookOpenIcon,
    WorkoutIcon,
    TravelIcon,
    HeartIcon,
    MoreVerticalIcon,
    UploadIcon,
    ExchangeIcon,
    SettingsIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    TargetIcon
} from './icons';
import TransactionModal from './TransactionModal';
import BudgetModal from './BudgetModal';
import CategoryModal from './CategoryModal';
import AccountModal from './AccountModal';
import { useData } from '../contexts/DataContext';

const COLORS = ['#A855F7', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#9333EA', '#F472B6', '#10B981'];

// --- SAVINGS GOAL MODAL ---
interface SavingsGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<SavingsGoal, 'id'> | SavingsGoal) => void;
    goalToEdit?: SavingsGoal | null;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if(goalToEdit) {
                setName(goalToEdit.name);
                setTargetAmount(String(goalToEdit.targetAmount));
                setCurrentAmount(String(goalToEdit.currentAmount));
            } else {
                setName('');
                setTargetAmount('');
                setCurrentAmount('');
            }
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, goalToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const goalData = {
            name,
            targetAmount: parseFloat(targetAmount) || 0,
            currentAmount: parseFloat(currentAmount) || 0,
            color: '#10B981', // Default green for now
            icon: 'TargetIcon'
        };
        if (goalToEdit) {
            onSave({ ...goalToEdit, ...goalData });
        } else {
            onSave(goalData);
        }
        onClose();
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-4">{goalToEdit ? 'Edit Savings Goal' : 'New Savings Goal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm text-dark-text-secondary">Goal Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="e.g. New Car" />
                </div>
                <div>
                    <label className="text-sm text-dark-text-secondary">Target Amount</label>
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="0" />
                </div>
                <div>
                    <label className="text-sm text-dark-text-secondary">Current Saved</label>
                    <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" required placeholder="0" />
                </div>
                <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save</button>
                </div>
            </form>
        </dialog>
    );
};


const FinanceTracker: React.FC = () => {
    const { 
        financeCategories, 
        transactions, 
        budgets, 
        saveTransaction, 
        deleteTransaction,
        saveBudgets,
        saveFinanceCategories,
        parseCSV,
        accounts,
        savingsGoals,
        saveSavingsGoal,
        deleteSavingsGoal
    } = useData();

    const [activeTab, setActiveTab] = useState<'transactions' | 'accounts'>('transactions');
    const [activeAccountFilter, setActiveAccountFilter] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | 'categoryName'; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    
    // Savings Goal State
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

    // Chart Drilldown State
    const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
    const [filterSubCategory, setFilterSubCategory] = useState<string | null>(null);
    
    // Month Navigation State
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter transactions by selected month
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => 
            t.date.getMonth() === currentDate.getMonth() && 
            t.date.getFullYear() === currentDate.getFullYear()
        );
    }, [transactions, currentDate]);

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const allTimeIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const allTimeExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { totalIncome: income, totalExpenses: expenses, balance: allTimeIncome - allTimeExpenses };
    }, [monthTransactions, transactions]);
    
    const accountBalances = useMemo(() => {
        const balances: {[key: string]: number} = {};
        accounts.forEach(acc => balances[acc] = 0);

        transactions.forEach(t => {
            if(t.includeInAccountTotal) {
                if (balances[t.account] === undefined) balances[t.account] = 0;
                
                if (t.type === 'income') balances[t.account] += t.amount;
                else if (t.type === 'expense') balances[t.account] -= t.amount;
                else if (t.type === 'transfer' && t.toAccount) {
                    balances[t.account] -= t.amount;
                    if(balances[t.toAccount] === undefined) balances[t.toAccount] = 0;
                    balances[t.toAccount] += t.amount;
                }
            }
        });
        return balances;
    }, [transactions, accounts]);
    
    // Chart Data Calculation (Supports Drilldown)
    const expenseDataForChart = useMemo(() => {
        const relevantTransactions = monthTransactions.filter(t => t.type === 'expense');

        if (drilldownCategory) {
            // Level 2: Show Sub-categories for selected Main Category
            const filtered = relevantTransactions.filter(t => t.category === drilldownCategory);
            const expenseBySub = filtered.reduce((acc, t) => {
                const subName = t.subCategory || 'Unspecified';
                acc[subName] = (acc[subName] || 0) + t.amount;
                return acc;
            }, {} as { [key: string]: number });

            return (Object.entries(expenseBySub) as [string, number][])
                .map(([name, value]) => ({ name, value, key: name })) // key is subCategory name
                .sort((a, b) => b.value - a.value);
        } else {
            // Level 1: Show Main Categories
            const expenseByCategory = relevantTransactions.reduce((acc, t) => {
                // Store object with full details for mapping later
                if (!acc[t.category]) {
                    acc[t.category] = {
                        amount: 0,
                        name: financeCategories[t.category]?.name || t.category
                    };
                }
                acc[t.category].amount += t.amount;
                return acc;
            }, {} as { [key: string]: { amount: number, name: string } });
            
            return (Object.entries(expenseByCategory) as [string, { amount: number, name: string }][])
                .map(([key, data]) => ({ name: data.name, value: data.amount, key: key })) // key is category ID
                .sort((a, b) => b.value - a.value);
        }
    }, [monthTransactions, financeCategories, drilldownCategory]);

    const monthlySpending = useMemo(() => {
        const spendingByCategory = monthTransactions
            .filter(t => t.type === 'expense' && t.countsTowardsBudget !== false)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as { [key: string]: number });
        return spendingByCategory;
    }, [monthTransactions]);

    const sortedTransactions = useMemo(() => {
        let sortableItems = [...monthTransactions];
        
        // Filter 1: Account
        if (activeAccountFilter) {
            sortableItems = sortableItems.filter(t => t.account === activeAccountFilter || t.toAccount === activeAccountFilter);
        }

        // Filter 2: Drilldown (Main Category)
        if (drilldownCategory) {
            sortableItems = sortableItems.filter(t => t.category === drilldownCategory);
        }

        // Filter 3: Specific Chart Slice (Sub Category)
        if (filterSubCategory) {
            sortableItems = sortableItems.filter(t => (t.subCategory || 'Unspecified') === filterSubCategory);
        }

        sortableItems.sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === 'categoryName') {
                aValue = (financeCategories[a.category]?.name || a.category) + (a.subCategory || '');
                bValue = (financeCategories[b.category]?.name || b.category) + (b.subCategory || '');
            } else {
                aValue = a[sortConfig.key as keyof Transaction];
                bValue = b[sortConfig.key as keyof Transaction];
            }
    
            if (aValue instanceof Date && bValue instanceof Date) {
                aValue = aValue.getTime();
                bValue = bValue.getTime();
            }
    
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [monthTransactions, sortConfig, financeCategories, activeAccountFilter, drilldownCategory, filterSubCategory]);

    const requestSort = (key: keyof Transaction | 'categoryName') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleChartClick = (data: any) => {
        if (!drilldownCategory) {
            // Level 1 Click: Go deeper
            setDrilldownCategory(data.key); // key is categoryID
            setFilterSubCategory(null);
        } else {
            // Level 2 Click: Filter list by subcategory
            setFilterSubCategory(data.name === filterSubCategory ? null : data.name);
        }
    };

    const handleResetDrilldown = () => {
        setDrilldownCategory(null);
        setFilterSubCategory(null);
    };
    
    const handleOpenNewModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTransactionToEdit(null);
    };

    const handleSave = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
        saveTransaction(transactionData);
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction(id);
        }
        setActiveMenuId(null);
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            parseCSV(file);
            e.target.value = '';
        }
    };

    const handleAccountClick = (accountName: string) => {
        setActiveAccountFilter(accountName);
        setActiveTab('transactions');
    };
    
    const renderSortIcon = (key: string) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };
    
    const handleMenuToggle = (id: string) => {
        setActiveMenuId(prev => (prev === id ? null : id));
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
        // Reset chart filters when changing month
        setDrilldownCategory(null);
        setFilterSubCategory(null);
    };

    // Savings Goals Handlers
    const handleAddGoal = () => {
        setGoalToEdit(null);
        setIsGoalModalOpen(true);
    };
    const handleEditGoal = (goal: SavingsGoal) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
    };
    const handleDeleteGoal = (id: string) => {
        if(window.confirm("Delete this savings goal?")) deleteSavingsGoal(id);
    };

    return (
        <>
            <TransactionModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                transactionToEdit={transactionToEdit}
                categories={financeCategories}
            />
            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSave={saveBudgets}
                initialBudgets={budgets}
                categories={financeCategories}
            />
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={saveFinanceCategories}
                initialCategories={financeCategories}
                availableIcons={{ ShoppingCart: ShoppingCartIcon, Briefcase: BriefcaseIcon, Utensils: UtensilsIcon, Gift: GiftIcon, Home: HomeIcon, Workout: WorkoutIcon, Travel: TravelIcon, Heart: HeartIcon, Book: BookOpenIcon, Dollar: DollarSignIcon, TrendingUp: TrendingUpIcon, Tag: TagIcon, Settings: SettingsIcon, Clock: DocumentTextIcon }}
            />
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
            />
            <SavingsGoalModal 
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={saveSavingsGoal}
                goalToEdit={goalToEdit}
            />
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in" onClick={() => setActiveMenuId(null)}>
                
                {/* Month Navigation */}
                <div className="flex items-center justify-between bg-dark-card p-4 rounded-2xl border border-dark-border">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-dark-accent rounded-lg"><ArrowUpIcon className="w-5 h-5 -rotate-90" /></button>
                    <h2 className="text-xl font-bold">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-dark-accent rounded-lg"><ArrowRightIcon className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Balance (All)" amount={balance} icon={DollarSignIcon} color="text-dark-purple" />
                    <StatCard title={`Income (${currentDate.toLocaleString('default', {month: 'short'})})`} amount={totalIncome} icon={TrendingUpIcon} color="text-project-green-from" />
                    <StatCard title={`Expenses (${currentDate.toLocaleString('default', {month: 'short'})})`} amount={totalExpenses} icon={TrendingDownIcon} color="text-project-red-from" />
                </div>
                
                {/* SAVINGS GOALS SECTION */}
                <div className="bg-dark-card rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Savings Goals</h3>
                        <button onClick={handleAddGoal} className="text-sm text-dark-blue font-semibold flex items-center gap-1">
                            <PlusCircleIcon className="w-4 h-4" /> Add Goal
                        </button>
                    </div>
                    {savingsGoals.length === 0 ? (
                        <div className="text-center py-4 text-dark-text-secondary bg-dark-accent/10 rounded-lg border border-dashed border-dark-border">
                            <p>No savings goals yet. Start saving!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savingsGoals.map(goal => {
                                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                                return (
                                    <div key={goal.id} className="bg-dark-accent/30 p-4 rounded-xl border border-dark-border relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-dark-accent rounded-lg mr-3 text-project-green-from">
                                                    <TargetIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{goal.name}</h4>
                                                    <p className="text-xs text-dark-text-secondary">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditGoal(goal)} className="p-1 hover:bg-dark-card rounded text-dark-text-secondary hover:text-dark-text"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 hover:bg-dark-card rounded text-dark-text-secondary hover:text-project-red-from"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                        <div className="w-full bg-dark-card rounded-full h-2 mt-2">
                                            <div className="bg-project-green-from h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                        <p className="text-right text-xs mt-1 font-mono">{progress.toFixed(1)}%</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-dark-card rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Monthly Budgets</h3>
                         <div className="flex items-center space-x-4">
                            <button onClick={() => setIsCategoryModalOpen(true)} className="text-sm text-dark-blue font-semibold flex items-center gap-1">
                                <TagIcon className="w-4 h-4" /> Manage Categories
                            </button>
                            <button onClick={() => setIsBudgetModalOpen(true)} className="text-sm text-dark-blue font-semibold">Set Budgets</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.entries(budgets).map(([categoryKey, limit]) => {
                            const category = financeCategories[categoryKey];
                            if (!category) return null;
                            
                            const numericLimit = limit as number;
                            if (numericLimit > 0) {
                                const spent = monthlySpending[categoryKey] || 0;
                                const progress = (spent / numericLimit) * 100;
                                const remaining = numericLimit - spent;
                                const progressColor = progress > 100 ? 'bg-project-red-from' : progress > 85 ? 'bg-medium-priority' : 'bg-dark-purple';

                                return (
                                    <div key={categoryKey}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold">{category.name}</span>
                                            <span className="text-dark-text-secondary">₹{spent.toFixed(0)} / ₹{numericLimit}</span>
                                        </div>
                                        <div className="w-full bg-dark-accent rounded-full h-2">
                                            <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                        {progress > 85 && (
                                             <p className={`text-xs mt-1 text-right ${progress > 100 ? 'text-project-red-from' : 'text-medium-priority'}`}>
                                                {progress > 100 ? `₹${(-remaining).toFixed(0)} over budget!` : `₹${remaining.toFixed(0)} remaining`}
                                             </p>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>

                <div className="flex space-x-4 border-b border-dark-border pb-2">
                    <button onClick={() => setActiveTab('transactions')} className={`text-sm font-semibold pb-2 ${activeTab === 'transactions' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>Transactions</button>
                    <button onClick={() => setActiveTab('accounts')} className={`text-sm font-semibold pb-2 ${activeTab === 'accounts' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>Accounts</button>
                </div>

                {activeTab === 'transactions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 bg-dark-card rounded-2xl p-6">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-bold">Transactions</h3>
                                    {/* Active Account Filter Badge */}
                                    {activeAccountFilter && (
                                        <span className="text-xs bg-dark-purple text-white px-2 py-1 rounded-full flex items-center gap-1">
                                            Acc: {activeAccountFilter} 
                                            <button onClick={() => setActiveAccountFilter(null)} className="hover:text-red-300"><NoSymbolIcon className="w-3 h-3"/></button>
                                        </span>
                                    )}
                                    {/* Active Category Filter Badge */}
                                    {drilldownCategory && (
                                        <span className="text-xs bg-dark-blue text-white px-2 py-1 rounded-full flex items-center gap-1">
                                            Cat: {financeCategories[drilldownCategory]?.name || drilldownCategory}
                                            <button onClick={handleResetDrilldown} className="hover:text-red-300"><NoSymbolIcon className="w-3 h-3"/></button>
                                        </span>
                                    )}
                                    {/* Active SubCategory Filter Badge */}
                                    {filterSubCategory && (
                                        <span className="text-xs bg-medium-priority text-black px-2 py-1 rounded-full flex items-center gap-1">
                                            Sub: {filterSubCategory}
                                            <button onClick={() => setFilterSubCategory(null)} className="hover:text-white"><NoSymbolIcon className="w-3 h-3"/></button>
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-3 py-2 bg-dark-accent text-dark-text font-semibold rounded-lg text-sm hover:bg-opacity-80" title="Import CSV">
                                        <UploadIcon className="w-5 h-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
                                    <button onClick={handleOpenNewModal} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-dark-blue text-white font-semibold rounded-lg text-sm">
                                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                                        Add New
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-dark-text-secondary px-3 py-2 border-b border-dark-border">
                                <div className="col-span-4 flex items-center cursor-pointer" onClick={() => requestSort('description')}>Description {renderSortIcon('description')}</div>
                                <div className="col-span-3 flex items-center cursor-pointer" onClick={() => requestSort('categoryName')}>Category {renderSortIcon('categoryName')}</div>
                                <div className="col-span-2 flex items-center cursor-pointer" onClick={() => requestSort('date')}>Date {renderSortIcon('date')}</div>
                                <div className="col-span-3 flex items-center justify-end cursor-pointer" onClick={() => requestSort('amount')}>Amount {renderSortIcon('amount')}</div>
                            </div>
                            <div className="max-h-96 overflow-y-auto pr-2">
                                {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
                                    <TransactionItem 
                                        key={t.id} 
                                        transaction={t} 
                                        onEdit={() => handleOpenEditModal(t)}
                                        onDelete={() => handleDelete(t.id)}
                                        categories={financeCategories}
                                        activeMenuId={activeMenuId}
                                        onMenuToggle={handleMenuToggle}
                                    />
                                )) : (
                                    <div className="text-center py-8 text-dark-text-secondary">No transactions found for this month/filter.</div>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-2 bg-dark-card rounded-2xl p-6 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                    {drilldownCategory ? `Breakdown: ${financeCategories[drilldownCategory]?.name}` : "Expense Breakdown"}
                                </h3>
                                {drilldownCategory && (
                                    <button onClick={handleResetDrilldown} className="text-xs flex items-center bg-dark-accent hover:bg-dark-purple hover:text-white px-2 py-1 rounded transition-colors">
                                        <ArrowLeftIcon className="w-3 h-3 mr-1" /> Back
                                    </button>
                                )}
                            </div>
                            <div className="w-full h-80 relative">
                                {expenseDataForChart.length > 0 ? (
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie 
                                                data={expenseDataForChart} 
                                                dataKey="value" 
                                                nameKey="name" 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius={100} 
                                                fill="#8884d8" 
                                                onClick={handleChartClick}
                                                cursor="pointer"
                                            >
                                                {expenseDataForChart.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                        opacity={filterSubCategory && filterSubCategory !== entry.name ? 0.3 : 1}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                                itemStyle={{ color: '#F3F4F6' }}
                                                formatter={(value: number) => `₹${value.toFixed(0)}`}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-dark-text-secondary">
                                        <p>No expenses to display</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-dark-text-secondary mt-2">
                                {drilldownCategory ? "Click a segment to filter transactions." : "Click a slice to view sub-categories."}
                            </p>
                        </div>
                    </div>
                )}
                
                {activeTab === 'accounts' && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsAccountModalOpen(true)} className="text-sm flex items-center text-dark-blue font-semibold bg-dark-card px-3 py-2 rounded-lg shadow-sm">
                                <SettingsIcon className="w-4 h-4 mr-2" /> Manage Accounts
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(Object.entries(accountBalances) as [string, number][]).map(([accountName, accBalance]) => (
                                <div 
                                    key={accountName} 
                                    onClick={() => handleAccountClick(accountName)}
                                    className="bg-dark-card rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-dark-purple transition-all"
                                >
                                    <div className="relative z-10">
                                        <h4 className="text-dark-text-secondary font-semibold">{accountName}</h4>
                                        <h2 className={`text-2xl font-bold mt-1 ${accBalance >= 0 ? 'text-dark-text' : 'text-project-red-from'}`}>₹{accBalance.toFixed(2)}</h2>
                                    </div>
                                    <div className="absolute right-4 top-4 opacity-10 text-dark-text">
                                        {accountName.toLowerCase().includes('card') ? <div className="w-16 h-10 bg-white rounded-md"/> : <div className="w-12 h-12 rounded-full border-4 border-white"/>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </>
    );
};

const StatCard: React.FC<{title: string, amount: number, icon: React.ComponentType<{className?: string}>, color: string}> = ({ title, amount, icon: Icon, color }) => (
    <div className="bg-dark-card p-6 rounded-2xl flex items-center justify-between">
        <div>
            <p className="text-dark-text-secondary text-sm">{title}</p>
            <p className="text-2xl font-bold">₹{amount.toFixed(0)}</p>
        </div>
        <div className={`p-3 bg-dark-accent rounded-full ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: () => void;
    onDelete: () => void;
    categories: { [key: string]: TransactionCategory };
    activeMenuId: string | null;
    onMenuToggle: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete, categories, activeMenuId, onMenuToggle }) => {
    // Fallback to ensure app doesn't crash if category was deleted
    const category = categories[transaction.category] || { name: transaction.category, icon: GiftIcon, color: '#888', subCategories: [] };
    const Icon = transaction.type === 'transfer' ? ExchangeIcon : category.icon;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center p-3 rounded-lg hover:bg-dark-accent">
            {/* Mobile View */}
            <div className="md:hidden col-span-1 flex items-center justify-between w-full">
                 <div className="flex items-center">
                     <div className="p-2 rounded-full mr-3" style={{ backgroundColor: `${category.color}20`}}>
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-xs text-dark-text-secondary">{category.name} • {transaction.date.toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-project-green-from' : transaction.type === 'expense' ? 'text-project-red-from' : 'text-dark-blue'}`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '⇄'}₹{transaction.amount.toFixed(0)}
                    </p>
                 </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex col-span-4 items-center overflow-hidden">
                <div className="p-2 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: `${category.color}20`}}>
                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div className="overflow-hidden">
                    <p className="font-semibold truncate">{transaction.description}</p>
                     <div className="flex items-center space-x-2 mt-1">
                        {transaction.notes && <DocumentTextIcon className="w-3.5 h-3.5 text-dark-text-secondary" title={transaction.notes} />}
                        {transaction.countsTowardsBudget === false && transaction.type === 'expense' && <NoSymbolIcon className="w-3.5 h-3.5 text-dark-text-secondary" title="Excluded from budget" />}
                        {transaction.frequency !== 'Once' && <span className="text-[10px] bg-dark-accent px-1 rounded text-dark-text-secondary">{transaction.frequency}</span>}
                    </div>
                </div>
            </div>
            <div className="hidden md:block col-span-3 text-sm text-dark-text-secondary">
                {transaction.type === 'transfer' ? 'Transfer' : category.name}
                {transaction.subCategory && <span className="block text-xs opacity-70">{transaction.subCategory}</span>}
            </div>
            <div className="hidden md:block col-span-2 text-sm text-dark-text-secondary">{transaction.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
            <div className="hidden md:flex col-span-3 items-center justify-end">
                 <p className={`font-bold mr-2 ${transaction.type === 'income' ? 'text-project-green-from' : transaction.type === 'expense' ? 'text-project-red-from' : 'text-dark-blue'}`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '⇄'}₹{transaction.amount.toFixed(0)}
                </p>
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMenuToggle(transaction.id); }} 
                        className="p-1.5 text-dark-text-secondary hover:text-white hover:bg-dark-accent rounded-full"
                    >
                        <MoreVerticalIcon className="w-4 h-4" />
                    </button>
                    {activeMenuId === transaction.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-dark-accent border border-dark-border rounded-md shadow-lg z-10 py-1">
                            <button onClick={() => { onEdit(); onMenuToggle(''); }} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-card">
                                <PencilIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={() => { onDelete(); onMenuToggle(''); }} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceTracker;