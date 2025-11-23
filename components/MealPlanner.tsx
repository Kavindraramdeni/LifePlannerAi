
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MealPlan, Meal, Task, Category, PantryItem } from '../types';
import { SparklesIcon, ShoppingCartIcon, PlusIcon, PencilIcon, ClipboardListIcon, TrashIcon, DocumentTextIcon, UploadIcon, UtensilsIcon, SettingsIcon, PrinterIcon } from './icons';
import { getMealPlanStream, getShoppingListStream, updateMealLogWithAI } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useData } from '../contexts/DataContext';
import MealPlannerSettingsModal from './MealPlannerSettingsModal';

type MealType = 'breakfast' | 'lunch' | 'dinner';

const MealPlanner: React.FC = () => {
    const { addTask, categories, mealPlan, saveMealPlan, pantryItems, addPantryItem, deletePantryItem, mealPlannerSettings, saveMealPlannerSettings } = useData();
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shoppingList, setShoppingList] = useState('');
    const [isShoppingListLoading, setIsShoppingListLoading] = useState(false);
    const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'planner' | 'pantry'>('planner');
    
    // AI Goal Input
    const [goalInput, setGoalInput] = useState('');
    const [showAiInput, setShowAiInput] = useState(false);
    
    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{day: string, mealType: MealType} | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', description: '', calories: '', protein: '' });
    const editDialogRef = useRef<HTMLDialogElement>(null);
    const shoppingListDialog = useRef<HTMLDialogElement>(null);

    // Pantry State
    const [newPantryItem, setNewPantryItem] = useState({ name: '', quantity: '', category: 'Produce' });
    
    // AI Log State
    const [isAiLogModalOpen, setIsAiLogModalOpen] = useState(false);
    const [aiLogDay, setAiLogDay] = useState<string | null>(null);
    const [aiLogInput, setAiLogInput] = useState('');
    const aiLogDialogRef = useRef<HTMLDialogElement>(null);
    const [isAiLogLoading, setIsAiLogLoading] = useState(false);


    useEffect(() => {
        const savedShoppingList = localStorage.getItem('shoppingList');
        if (savedShoppingList) {
            setShoppingList(savedShoppingList);
        }
    }, []);

    const weeklyStats = useMemo(() => {
        const days = Object.values(mealPlan);
        let totalCalories = 0;
        let totalProtein = 0;
        let mealCount = 0;

        for (const day of days) {
            const typedDay = day as MealPlan[string];
            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                const meal = typedDay[mealType as MealType];
                if(meal) {
                    if (meal.calories) totalCalories += meal.calories;
                    if (meal.protein) totalProtein += meal.protein;
                    if (meal.calories) mealCount++;
                }
            });
        }
        
        const daysCount = days.length || 1;
        return {
            avgDailyCalories: daysCount > 0 ? Math.round(totalCalories / daysCount) : 0,
            avgDailyProtein: daysCount > 0 ? Math.round(totalProtein / daysCount) : 0,
            totalCalories,
            totalProtein
        };
    }, [mealPlan]);
    
    useEffect(() => {
        const dialog = shoppingListDialog.current;
        if (dialog) isShoppingListModalOpen ? dialog.showModal() : dialog.close();
    }, [isShoppingListModalOpen]);
    
    useEffect(() => {
        const dialog = editDialogRef.current;
        if (dialog) isEditModalOpen ? dialog.showModal() : dialog.close();
    }, [isEditModalOpen]);

    useEffect(() => {
        const dialog = aiLogDialogRef.current;
        if (dialog) isAiLogModalOpen ? dialog.showModal() : dialog.close();
    }, [isAiLogModalOpen]);

    const generateSmartPlan = async () => {
        setIsLoading(true);
        setError('');
        try {
            const todayIndex = new Date().getDay();
            const todayName = weekDays[todayIndex === 0 ? 6 : todayIndex - 1];
            const todayHasData = mealPlan[todayName] && (mealPlan[todayName]?.breakfast?.name || mealPlan[todayName]?.lunch?.name);
            const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
            const startIndex = todayHasData ? adjustedIndex + 1 : adjustedIndex;
            const daysToGenerate = weekDays.slice(startIndex);

            if (daysToGenerate.length === 0) {
                 if(window.confirm("Week is complete. Generate fresh plan?")) daysToGenerate.push(...weekDays);
                 else { setIsLoading(false); return; }
            }

            const stream = await getMealPlanStream(mealPlannerSettings, goalInput.trim(), daysToGenerate);
            let jsonString = '';
            for await (const chunk of stream) jsonString += chunk.text;
            
            const startIndexJson = jsonString.indexOf('{');
            const endIndexJson = jsonString.lastIndexOf('}');
            if (startIndexJson === -1) throw new Error("Invalid JSON");
            
            const newPlanPart = JSON.parse(jsonString.substring(startIndexJson, endIndexJson + 1));
            saveMealPlan(prev => ({ ...prev, ...newPlanPart }));

        } catch (e) {
            console.error(e);
            setError('Failed to generate meal plan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPantryItem = (e: React.FormEvent) => {
        e.preventDefault();
        if(newPantryItem.name) {
            addPantryItem(newPantryItem as any);
            setNewPantryItem({ name: '', quantity: '', category: 'Produce' });
        }
    };
    
    const handleShoppingListClick = async () => {
        if (shoppingList) { setIsShoppingListModalOpen(true); return; }
        setIsShoppingListLoading(true);
        try {
            const stream = await getShoppingListStream(mealPlan);
            let markdown = '';
            for await (const chunk of stream) markdown += chunk.text;
            setShoppingList(markdown);
            localStorage.setItem('shoppingList', markdown);
            setIsShoppingListModalOpen(true);
        } catch(e) { setError('Failed to generate list.'); } finally { setIsShoppingListLoading(false); }
    };

    const handleEditClick = (day: string, mealType: MealType) => {
        const currentMeal = mealPlan[day]?.[mealType];
        setEditingSlot({ day, mealType });
        setEditFormData({
            name: currentMeal?.name || '',
            description: currentMeal?.description || '',
            calories: currentMeal?.calories ? String(currentMeal.calories) : '',
            protein: currentMeal?.protein ? String(currentMeal.protein) : '',
        });
        setIsEditModalOpen(true);
    };
    
    const handleSaveMeal = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSlot) {
            const { day, mealType } = editingSlot;
            saveMealPlan(prev => ({
                ...prev,
                [day]: {
                    ...prev[day],
                    [mealType]: {
                        ...prev[day]?.[mealType],
                        name: editFormData.name,
                        description: editFormData.description,
                        calories: parseInt(editFormData.calories) || 0,
                        protein: parseInt(editFormData.protein) || 0,
                    }
                }
            }));
            setIsEditModalOpen(false);
        }
    };

    const handleOpenAiLog = (day: string) => {
        setAiLogDay(day);
        setAiLogInput('');
        setIsAiLogModalOpen(true);
    };

    const handleClearDay = (day: string) => {
        if(window.confirm(`Clear all meals for ${day}?`)) {
            saveMealPlan(prev => {
                const newState = { ...prev };
                delete newState[day];
                return newState;
            });
        }
    };

    const handleAiLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiLogDay) return;
        
        setIsAiLogLoading(true);
        try {
            const response = await updateMealLogWithAI(aiLogDay, mealPlan[aiLogDay], aiLogInput);
            const newDayLog = JSON.parse(response.text || '{}');
            
            saveMealPlan(prev => ({
                ...prev,
                [aiLogDay]: newDayLog
            }));
            setIsAiLogModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update log. Please try again.');
        } finally {
            setIsAiLogLoading(false);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(mealPlan, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'weekly_meal_plan.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Weekly Meal Plan</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #000; }
                        h1 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #333; padding: 12px; text-align: left; vertical-align: top; }
                        th { background-color: #f4f4f4; font-weight: bold; }
                        .day-col { width: 12%; font-weight: bold; background-color: #fafafa; }
                        .meal-title { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
                        .meal-desc { font-size: 0.9em; color: #555; }
                        .macros { font-size: 0.8em; font-style: italic; margin-top: 6px; color: #666; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Weekly Meal Plan</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Breakfast</th>
                                <th>Lunch</th>
                                <th>Dinner</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${weekDays.map(day => `
                                <tr>
                                    <td class="day-col">${day}</td>
                                    ${['breakfast', 'lunch', 'dinner'].map(type => {
                                        const meal = mealPlan[day]?.[type as MealType];
                                        return `<td>
                                            ${meal ? `
                                                <div class="meal-title">${meal.name}</div>
                                                ${meal.description ? `<div class="meal-desc">${meal.description}</div>` : ''}
                                                <div class="macros">${meal.calories || 0} kcal | ${meal.protein || 0}g Pro</div>
                                            ` : '<span style="color:#ccc; font-style:italic;">-</span>'}
                                        </td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 20px; text-align: center; font-size: 0.8em; color: #888;">
                        Generated by LifePlannerAI
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in space-y-8">
            
             <MealPlannerSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={(settings) => { saveMealPlannerSettings(settings); setIsSettingsModalOpen(false); }}
                currentSettings={mealPlannerSettings}
             />
            
             {/* Modals */}
             <dialog ref={shoppingListDialog} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-2xl text-dark-text backdrop:bg-black/50" onClose={() => setIsShoppingListModalOpen(false)} onClick={(e) => e.target === shoppingListDialog.current && setIsShoppingListModalOpen(false)}>
                <h2 className="text-2xl font-bold mb-4">Your Shopping List</h2>
                <div className="prose prose-invert max-w-none max-h-[60vh] overflow-y-auto custom-scrollbar"><Markdown>{shoppingList}</Markdown></div>
                <button onClick={() => setIsShoppingListModalOpen(false)} className="mt-6 w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Close</button>
            </dialog>
            
             <dialog ref={editDialogRef} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50" onClose={() => setIsEditModalOpen(false)} onClick={(e) => e.target === editDialogRef.current && setIsEditModalOpen(false)}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">Edit Meal</h2>
                </div>
                <form onSubmit={handleSaveMeal} className="space-y-4">
                    <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="Meal Name" className="w-full bg-dark-accent p-2 rounded-lg" required />
                    <textarea value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} placeholder="Description" className="w-full bg-dark-accent p-2 rounded-lg" rows={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-dark-text-secondary mb-1 block">Calories</label>
                            <input type="number" value={editFormData.calories} onChange={e => setEditFormData({...editFormData, calories: e.target.value})} className="w-full bg-dark-accent p-2 rounded-lg" />
                        </div>
                        <div>
                            <label className="text-xs text-dark-text-secondary mb-1 block">Protein (g)</label>
                            <input type="number" value={editFormData.protein} onChange={e => setEditFormData({...editFormData, protein: e.target.value})} className="w-full bg-dark-accent p-2 rounded-lg" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Changes</button>
                </form>
            </dialog>
            
            <dialog ref={aiLogDialogRef} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50" onClose={() => setIsAiLogModalOpen(false)} onClick={(e) => e.target === aiLogDialogRef.current && setIsAiLogModalOpen(false)}>
                <h2 className="text-2xl font-bold mb-4">Log Intake for {aiLogDay}</h2>
                <form onSubmit={handleAiLogSubmit} className="space-y-4">
                    <p className="text-sm text-dark-text-secondary">Tell me what you actually ate today. I'll update the log and recalculate calories.</p>
                    <textarea 
                        value={aiLogInput} 
                        onChange={e => setAiLogInput(e.target.value)} 
                        placeholder="e.g., I skipped lunch but had 2 slices of pizza for dinner." 
                        className="w-full bg-dark-accent p-3 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                        required
                    />
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsAiLogModalOpen(false)} className="w-full py-2 bg-dark-accent font-semibold rounded-lg">Cancel</button>
                        <button type="submit" disabled={isAiLogLoading} className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">
                            {isAiLogLoading ? 'Updating...' : 'Update Log'}
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Meal Planner</h1>
                    <p className="text-dark-text-secondary text-sm">Plan your nutrition, track your macros, and stay healthy.</p>
                </div>
                <div className="bg-dark-card p-1 rounded-xl inline-flex self-start sm:self-auto border border-dark-border">
                    <button onClick={() => setActiveTab('planner')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'planner' ? 'bg-dark-purple text-white shadow-md' : 'text-dark-text-secondary hover:text-dark-text'}`}>Planner</button>
                    <button onClick={() => setActiveTab('pantry')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pantry' ? 'bg-dark-purple text-white shadow-md' : 'text-dark-text-secondary hover:text-dark-text'}`}>Pantry <span className="ml-1 opacity-70">({pantryItems.length})</span></button>
                </div>
            </div>

            {activeTab === 'planner' && (
                <>
                {/* Control Deck */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* AI Generator Card */}
                    <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-dark-border relative overflow-hidden shadow-lg">
                        <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
                            <SparklesIcon className="w-48 h-48 text-dark-purple"/>
                        </div>
                        <h3 className="text-lg font-bold mb-3 relative z-10 flex items-center">
                            <SparklesIcon className="w-5 h-5 text-dark-purple mr-2" /> 
                            Generate Weekly Plan
                        </h3>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row gap-4">
                                <textarea 
                                    value={goalInput} 
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    placeholder="Describe your goal for the week... (e.g. 'High protein vegetarian meals using pantry items', 'Quick 15-min lunches')"
                                    className="flex-1 bg-dark-accent/50 border border-dark-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-dark-purple resize-none text-sm"
                                    rows={3}
                                />
                                <button 
                                    onClick={generateSmartPlan} 
                                    disabled={isLoading} 
                                    className="self-end md:self-stretch px-6 bg-dark-purple text-white font-bold rounded-xl hover:bg-dark-purple/90 transition-all shadow-lg flex flex-col items-center justify-center min-w-[120px]"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="text-lg">Plan</span>
                                            <span className="text-xs opacity-80">Week</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Stats & Actions Card */}
                    <div className="bg-dark-card p-5 rounded-2xl border border-dark-border flex flex-col justify-between shadow-lg">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm text-dark-text-secondary uppercase tracking-wider">Weekly Average</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold">Calories</span>
                                        <span className="text-dark-text-secondary">{weeklyStats.avgDailyCalories} / {mealPlannerSettings.calorieTarget}</span>
                                    </div>
                                    <div className="w-full bg-dark-accent rounded-full h-2">
                                        <div className="bg-project-green-from h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((weeklyStats.avgDailyCalories / mealPlannerSettings.calorieTarget) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold">Protein</span>
                                        <span className="text-dark-text-secondary">{weeklyStats.avgDailyProtein}g / {mealPlannerSettings.proteinTarget}g</span>
                                    </div>
                                    <div className="w-full bg-dark-accent rounded-full h-2">
                                        <div className="bg-dark-blue h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((weeklyStats.avgDailyProtein / mealPlannerSettings.proteinTarget) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-dark-border/50">
                            <button onClick={() => setIsSettingsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-purple transition-colors group" title="Dietary Settings">
                                <SettingsIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px]">Settings</span>
                            </button>
                            <button onClick={handlePrint} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-purple transition-colors group" title="Print">
                                <PrinterIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px]">Print</span>
                            </button>
                            <button onClick={handleShoppingListClick} disabled={isShoppingListLoading || !Object.keys(mealPlan).length} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-purple transition-colors group disabled:opacity-50" title="Shopping List">
                                <ShoppingCartIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px]">Shop</span>
                            </button>
                            <button onClick={handleExport} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-dark-accent text-dark-text-secondary hover:text-dark-purple transition-colors group" title="Export">
                                <UploadIcon className="w-5 h-5 mb-1 rotate-180 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px]">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Responsive Meal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {weekDays.map((day, idx) => (
                        <div key={day} className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden flex flex-col h-full shadow-md hover:shadow-xl transition-shadow group/day">
                             {/* Day Header */}
                             <div className="bg-dark-accent/30 p-4 flex justify-between items-center border-b border-dark-border">
                                <h3 className="font-bold text-lg">{day}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenAiLog(day)} className="text-dark-purple hover:text-white bg-dark-purple/10 hover:bg-dark-purple p-1.5 rounded-lg transition-colors" title="Log actual intake">
                                        <SparklesIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleClearDay(day)} className="text-dark-text-secondary hover:text-project-red-from hover:bg-dark-accent p-1.5 rounded-lg transition-colors opacity-0 group-hover/day:opacity-100" title="Clear Day">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Meals Container */}
                            <div className="p-4 space-y-4 flex-1">
                                 {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(mealType => {
                                     const meal = mealPlan[day]?.[mealType];
                                     return (
                                         <div key={mealType} className="group/meal relative">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <h4 className="text-xs uppercase text-dark-text-secondary font-bold tracking-wider">{mealType}</h4>
                                                {meal && <span className="text-[10px] font-mono text-dark-text-secondary opacity-70">{meal.calories} kcal</span>}
                                            </div>
                                            
                                            {meal ? (
                                                <div className="bg-dark-accent/40 hover:bg-dark-accent p-3 rounded-xl transition-colors border border-transparent hover:border-dark-border/50 cursor-pointer" onClick={() => handleEditClick(day, mealType)}>
                                                    <p className="text-sm font-semibold leading-snug">{meal.name}</p>
                                                    <div className="flex items-center mt-2">
                                                        <span className="text-xs text-dark-blue bg-dark-blue/10 px-1.5 py-0.5 rounded">{meal.protein}g Pro</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    onClick={() => handleEditClick(day, mealType)}
                                                    className="border-2 border-dashed border-dark-border hover:border-dark-purple/50 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-colors h-16 group-hover/meal:bg-dark-accent/10"
                                                >
                                                    <PlusIcon className="w-4 h-4 text-dark-text-secondary" />
                                                </div>
                                            )}
                                         </div>
                                     )
                                 })}
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}

            {activeTab === 'pantry' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Add Item Card */}
                    <div className="lg:col-span-1">
                         <div className="bg-dark-card rounded-2xl p-6 border border-dark-border sticky top-6 shadow-lg">
                            <h3 className="font-bold text-lg mb-4 flex items-center"><UtensilsIcon className="w-5 h-5 mr-2 text-dark-purple"/> Add Item</h3>
                            <form onSubmit={handleAddPantryItem} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-dark-text-secondary uppercase">Item Name</label>
                                    <input type="text" value={newPantryItem.name} onChange={e => setNewPantryItem({...newPantryItem, name: e.target.value})} className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple" required placeholder="e.g. Olive Oil" />
                                </div>
                                 <div>
                                    <label className="text-xs font-bold text-dark-text-secondary uppercase">Quantity</label>
                                    <input type="text" value={newPantryItem.quantity} onChange={e => setNewPantryItem({...newPantryItem, quantity: e.target.value})} className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple" placeholder="e.g. 500ml" />
                                </div>
                                 <div>
                                    <label className="text-xs font-bold text-dark-text-secondary uppercase">Category</label>
                                    <select value={newPantryItem.category} onChange={e => setNewPantryItem({...newPantryItem, category: e.target.value})} className="w-full bg-dark-accent p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-dark-purple">
                                        <option>Produce</option><option>Dairy</option><option>Protein</option><option>Grains</option><option>Spices</option><option>Other</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-dark-purple text-white font-bold py-2.5 rounded-lg hover:bg-dark-purple/90 transition-colors">Add to Pantry</button>
                            </form>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="lg:col-span-3">
                        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border min-h-[400px] shadow-lg">
                            {pantryItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-dark-text-secondary opacity-60">
                                    <UtensilsIcon className="w-12 h-12 mb-2" />
                                    <p>Your pantry is empty.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {pantryItems.map(item => (
                                        <div key={item.id} className="bg-dark-accent/30 hover:bg-dark-accent border border-dark-border p-4 rounded-xl flex flex-col justify-between relative group transition-all shadow-sm hover:shadow-md">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-bold uppercase text-dark-purple bg-dark-purple/10 px-1.5 py-0.5 rounded">{item.category}</span>
                                                </div>
                                                <p className="font-bold mt-2 text-lg leading-tight">{item.name}</p>
                                                <p className="text-sm text-dark-text-secondary mt-1">{item.quantity}</p>
                                            </div>
                                            <button 
                                                onClick={() => deletePantryItem(item.id)} 
                                                className="absolute top-2 right-2 text-dark-text-secondary hover:text-project-red-from bg-dark-card p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlanner;
