
import React, { useState, useRef, useEffect } from 'react';
import { MealPlannerSettings } from '../types';

interface MealPlannerSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: MealPlannerSettings) => void;
    currentSettings: MealPlannerSettings;
}

const MealPlannerSettingsModal: React.FC<MealPlannerSettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
    const [calorieTarget, setCalorieTarget] = useState(2000);
    const [proteinTarget, setProteinTarget] = useState(150);
    const [dietType, setDietType] = useState('Balanced');
    const [allergies, setAllergies] = useState('');
    
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            setCalorieTarget(currentSettings.calorieTarget);
            setProteinTarget(currentSettings.proteinTarget);
            setDietType(currentSettings.dietType);
            setAllergies(currentSettings.allergies);
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, currentSettings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            calorieTarget,
            proteinTarget,
            dietType,
            allergies
        });
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md text-dark-text backdrop:bg-black/50">
            <h2 className="text-2xl font-bold mb-6">Dietary Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-dark-text-secondary">Daily Calories</label>
                        <input 
                            type="number" 
                            value={calorieTarget} 
                            onChange={e => setCalorieTarget(parseInt(e.target.value) || 0)} 
                            className="w-full bg-dark-accent p-2 rounded-lg mt-1" 
                        />
                    </div>
                    <div>
                        <label className="text-sm text-dark-text-secondary">Protein (g)</label>
                        <input 
                            type="number" 
                            value={proteinTarget} 
                            onChange={e => setProteinTarget(parseInt(e.target.value) || 0)} 
                            className="w-full bg-dark-accent p-2 rounded-lg mt-1" 
                        />
                    </div>
                </div>
                
                <div>
                    <label className="text-sm text-dark-text-secondary">Diet Type</label>
                    <select 
                        value={dietType} 
                        onChange={e => setDietType(e.target.value)} 
                        className="w-full bg-dark-accent p-2 rounded-lg mt-1"
                    >
                        <option value="Balanced">Balanced</option>
                        <option value="Low Carb">Low Carb</option>
                        <option value="Keto">Keto</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Paleo">Paleo</option>
                        <option value="High Protein">High Protein</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm text-dark-text-secondary">Allergies / Exclusions</label>
                    <textarea 
                        value={allergies} 
                        onChange={e => setAllergies(e.target.value)} 
                        className="w-full bg-dark-accent p-2 rounded-lg mt-1" 
                        placeholder="e.g., Peanuts, Dairy, Shellfish"
                        rows={3}
                    />
                </div>

                <div className="flex gap-4 mt-6">
                    <button type="button" onClick={onClose} className="w-full py-2 bg-dark-accent text-white font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="w-full py-2 bg-dark-purple text-white font-semibold rounded-lg">Save Profile</button>
                </div>
            </form>
        </dialog>
    );
};

export default MealPlannerSettingsModal;
