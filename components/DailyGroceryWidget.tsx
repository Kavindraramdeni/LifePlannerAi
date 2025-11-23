
import React from 'react';
import { useData } from '../contexts/DataContext';
import { UtensilsIcon, ShoppingCartIcon, ArrowRightIcon } from './icons';
import { Meal } from '../types';

interface DailyGroceryWidgetProps {
    onNavigate?: (page: string) => void;
}

const DailyGroceryWidget: React.FC<DailyGroceryWidgetProps> = ({ onNavigate }) => {
    const { mealPlan } = useData();

    // Calculate tomorrow's day name
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
    
    const mealsForTomorrow = mealPlan[dayName];
    const hasMeals = mealsForTomorrow && (mealsForTomorrow.breakfast || mealsForTomorrow.lunch || mealsForTomorrow.dinner);

    const GroceryItem: React.FC<{ type: string, meal?: Meal }> = ({ type, meal }) => {
        if (!meal) return null;
        return (
            <div className="flex items-start space-x-2 p-2 bg-dark-accent/50 rounded-lg mb-1 last:mb-0 border border-transparent hover:border-dark-border transition-colors">
                <div className="p-1 bg-dark-card rounded-md text-dark-purple shrink-0 mt-0.5">
                   <UtensilsIcon className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-dark-text capitalize flex items-center">
                        {type} <span className="mx-1 text-dark-text-secondary">|</span> <span className="text-dark-purple truncate">{meal.name}</span>
                    </h4>
                    <p className="text-[9px] text-dark-text-secondary mt-0.5 truncate">{meal.description || "No ingredients listed."}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-dark-card rounded-2xl p-4 border border-dark-border h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-dark-purple/20 p-1 rounded-lg">
                        <ShoppingCartIcon className="w-3.5 h-3.5 text-dark-purple" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-dark-text">Grocery & Prep</h3>
                        <p className="text-[9px] text-dark-text-secondary uppercase font-bold">Tomorrow ({dayName})</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {hasMeals ? (
                    <div className="space-y-1">
                        <GroceryItem type="Breakfast" meal={mealsForTomorrow.breakfast} />
                        <GroceryItem type="Lunch" meal={mealsForTomorrow.lunch} />
                        <GroceryItem type="Dinner" meal={mealsForTomorrow.dinner} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-dark-text-secondary p-3 bg-dark-accent/5 rounded-xl border border-dashed border-dark-border">
                        <p className="mb-1 text-[10px]">No meals planned.</p>
                        <button 
                            onClick={() => onNavigate?.('meal-planner')} 
                            className="text-[10px] text-dark-purple flex items-center hover:underline bg-transparent border-none cursor-pointer p-0 font-bold"
                        >
                            Open Planner <ArrowRightIcon className="w-2.5 h-2.5 ml-1" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyGroceryWidget;
