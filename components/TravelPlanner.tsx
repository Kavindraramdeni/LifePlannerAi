import React, { useState } from 'react';
import { TripPlan, TripDay, TravelActivity } from '../types';
import { SparklesIcon, TravelIcon, MapPinIcon, PencilIcon, TrashIcon, PlusIcon, MoreVerticalIcon } from './icons';
import { getTravelItineraryStream } from '../services/geminiService';
import Markdown from 'react-markdown';

const TravelPlanner: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState(3);
    const [interests, setInterests] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [currentPlan, setCurrentPlan] = useState<TripDay[] | null>(null);
    const [planId, setPlanId] = useState<string | null>(null);

    // Edit state
    const [editingActivity, setEditingActivity] = useState<{ dayIndex: number, activityId: string } | null>(null);
    const [editForm, setEditForm] = useState<TravelActivity | null>(null);

    const generatePlan = async () => {
        if (!destination || !duration || !interests) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCurrentPlan(null);
        
        try {
            const stream = await getTravelItineraryStream(destination, duration, interests);
            let jsonString = '';
            for await (const chunk of stream) {
                jsonString += chunk.text;
            }
            
            // Extract JSON
            const startIndex = jsonString.indexOf('{');
            const endIndex = jsonString.lastIndexOf('}');
            if (startIndex === -1) throw new Error("Invalid JSON");
            
            const json = JSON.parse(jsonString.substring(startIndex, endIndex + 1));
            
            // Normalize data to have IDs
            const normalizedPlan: TripDay[] = json.itinerary.map((day: any, dIdx: number) => ({
                day: day.day,
                activities: day.activities.map((act: any, aIdx: number) => ({
                    ...act,
                    id: `act-${Date.now()}-${dIdx}-${aIdx}`
                }))
            }));
            
            setCurrentPlan(normalizedPlan);
            setPlanId(`trip-${Date.now()}`);

        } catch (e) {
            console.error(e);
            setError('Failed to generate itinerary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditActivity = (dayIndex: number, activity: TravelActivity) => {
        setEditingActivity({ dayIndex, activityId: activity.id });
        setEditForm({ ...activity });
    };

    const handleSaveActivity = () => {
        if (!currentPlan || !editingActivity || !editForm) return;
        
        const newPlan = [...currentPlan];
        const dayActivities = newPlan[editingActivity.dayIndex].activities;
        const actIndex = dayActivities.findIndex(a => a.id === editingActivity.activityId);
        
        if (actIndex !== -1) {
            dayActivities[actIndex] = editForm;
            setCurrentPlan(newPlan);
        }
        setEditingActivity(null);
        setEditForm(null);
    };

    const handleDeleteActivity = (dayIndex: number, activityId: string) => {
        if (!currentPlan) return;
        if (window.confirm("Remove this activity?")) {
            const newPlan = [...currentPlan];
            newPlan[dayIndex].activities = newPlan[dayIndex].activities.filter(a => a.id !== activityId);
            setCurrentPlan(newPlan);
        }
    };

    const handleAddActivity = (dayIndex: number) => {
        if (!currentPlan) return;
        const newActivity: TravelActivity = {
            id: `new-${Date.now()}`,
            time: 'TBD',
            activity: 'New Activity',
            location: 'TBD',
            notes: ''
        };
        const newPlan = [...currentPlan];
        newPlan[dayIndex].activities.push(newActivity);
        setCurrentPlan(newPlan);
        
        // Immediately edit
        handleEditActivity(dayIndex, newActivity);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in h-full">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-dark-card p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-lg">Plan a New Trip</h3>
                    <div>
                        <label className="text-sm text-dark-text-secondary">Destination</label>
                        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1" placeholder="e.g. Tokyo, Japan" />
                    </div>
                    <div>
                        <label className="text-sm text-dark-text-secondary">Duration (days)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-dark-accent p-2 rounded-lg mt-1" min="1" max="14" />
                    </div>
                    <div>
                        <label className="text-sm text-dark-text-secondary">Interests</label>
                        <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full bg-dark-accent p-2 rounded-lg mt-1 h-24" placeholder="e.g., food, anime, shrines, history" />
                    </div>
                    <button onClick={generatePlan} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 bg-dark-purple text-white font-semibold rounded-lg">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Generating...' : 'Generate Itinerary'}
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            </div>

            <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl flex flex-col h-full max-h-[85vh]">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                    <TravelIcon className="w-5 h-5 mr-2 text-dark-purple"/>
                    {currentPlan ? `Itinerary for ${destination}` : 'Your Itinerary'}
                </h3>
                
                 {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-dark-accent border-t-dark-purple rounded-full animate-spin-slow mb-4"></div>
                        <p className="text-dark-text-secondary">AI is crafting your perfect trip...</p>
                    </div>
                 ) : currentPlan ? (
                     <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                        {currentPlan.map((day, dIdx) => (
                            <div key={dIdx} className="bg-dark-accent/30 rounded-xl p-4">
                                <h4 className="font-bold text-dark-purple mb-3 text-lg border-b border-dark-border pb-2 flex justify-between items-center">
                                    {day.day}
                                    <button onClick={() => handleAddActivity(dIdx)} className="text-xs bg-dark-accent hover:bg-dark-card text-dark-text px-2 py-1 rounded flex items-center">
                                        <PlusIcon className="w-3 h-3 mr-1"/> Add
                                    </button>
                                </h4>
                                <div className="space-y-3">
                                    {day.activities.map((act) => (
                                        <div key={act.id} className="bg-dark-card p-3 rounded-lg border border-dark-border group">
                                            {editingActivity?.activityId === act.id && editForm ? (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="text" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="bg-dark-accent p-1 rounded text-sm" placeholder="Time" />
                                                        <input type="text" value={editForm.activity} onChange={e => setEditForm({...editForm, activity: e.target.value})} className="bg-dark-accent p-1 rounded text-sm" placeholder="Activity" />
                                                    </div>
                                                    <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="bg-dark-accent p-1 rounded text-sm w-full" placeholder="Location" />
                                                    <textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="bg-dark-accent p-1 rounded text-sm w-full" placeholder="Notes" />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingActivity(null)} className="px-3 py-1 text-xs bg-dark-accent rounded">Cancel</button>
                                                        <button onClick={handleSaveActivity} className="px-3 py-1 text-xs bg-dark-purple text-white rounded">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline mb-1">
                                                            <span className="font-mono text-xs text-dark-text-secondary mr-2 bg-dark-accent px-1 rounded">{act.time}</span>
                                                            <span className="font-semibold">{act.activity}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-dark-text-secondary mb-1">
                                                            <MapPinIcon className="w-3 h-3 mr-1"/> {act.location}
                                                        </div>
                                                        {act.notes && <p className="text-sm text-dark-text-secondary mt-1 italic">"{act.notes}"</p>}
                                                    </div>
                                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEditActivity(dIdx, act)} className="p-1 hover:bg-dark-accent rounded text-dark-text-secondary hover:text-dark-text"><PencilIcon className="w-3 h-3"/></button>
                                                        <button onClick={() => handleDeleteActivity(dIdx, act.id)} className="p-1 hover:bg-dark-accent rounded text-dark-text-secondary hover:text-project-red-from"><TrashIcon className="w-3 h-3"/></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                     </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-dark-text-secondary">
                        <TravelIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p>Your generated travel plan will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelPlanner;