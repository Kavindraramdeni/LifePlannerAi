
import React, { useState } from 'react';
import { WeightEntry, HealthMetric } from '../types';
import ViewWrapper from './ViewWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusIcon, LineChartIcon, TrashIcon, PencilIcon, CalendarDaysIcon } from './icons';
import { useData } from '../contexts/DataContext';

const HealthTracker: React.FC = () => {
    const { 
        weightEntries, 
        addWeightEntry, 
        healthMetrics, 
        saveHealthMetric, 
        deleteWeightEntry, 
        updateWeightEntry 
    } = useData();
    
    const [newWeight, setNewWeight] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null); // Using index as ID for simple array
    const [editWeight, setEditWeight] = useState('');

    const today = new Date();
    const todayKey = today.toLocaleDateString();
    const todaysMetric = healthMetrics.find(m => m.date.toLocaleDateString() === todayKey) || {
        date: today,
        water: 0,
        sleep: 0,
        mood: '',
        steps: 0
    };

    const handleAddWeight = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWeight.trim() && !isNaN(parseFloat(newWeight))) {
            addWeightEntry({
                date: new Date(),
                weight: parseFloat(newWeight),
            });
            setNewWeight('');
        }
    };

    const updateMetric = (key: keyof HealthMetric, value: any) => {
        saveHealthMetric({
            ...todaysMetric,
            [key]: value
        });
    };

    const startEdit = (index: number, weight: number) => {
        setEditingId(index);
        setEditWeight(weight.toString());
    };

    const saveEdit = (index: number) => {
        if (editWeight && !isNaN(parseFloat(editWeight))) {
            updateWeightEntry(index, parseFloat(editWeight));
            setEditingId(null);
        }
    };

    const formattedData = weightEntries.map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: e.weight
    }));

    // Sort entries for the list (newest first)
    const sortedEntries = [...weightEntries].map((entry, originalIndex) => ({...entry, originalIndex})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ViewWrapper title="Health Tracker" onBack={() => {}}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Daily Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Water */}
            <div className="bg-dark-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="font-bold text-lg mb-2">Water Intake</h3>
                <div className="text-4xl font-bold text-blue-400 mb-4">{todaysMetric.water} <span className="text-sm text-dark-text-secondary">glasses</span></div>
                <div className="flex gap-2">
                    <button onClick={() => updateMetric('water', Math.max(0, todaysMetric.water - 1))} className="w-8 h-8 bg-dark-accent rounded-full hover:bg-dark-border">-</button>
                    <button onClick={() => updateMetric('water', todaysMetric.water + 1)} className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600">+</button>
                </div>
            </div>

            {/* Sleep */}
            <div className="bg-dark-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="font-bold text-lg mb-2">Sleep</h3>
                <div className="text-4xl font-bold text-purple-400 mb-4">{todaysMetric.sleep} <span className="text-sm text-dark-text-secondary">hrs</span></div>
                <div className="flex gap-2">
                    <button onClick={() => updateMetric('sleep', Math.max(0, todaysMetric.sleep - 0.5))} className="w-8 h-8 bg-dark-accent rounded-full hover:bg-dark-border">-</button>
                    <button onClick={() => updateMetric('sleep', todaysMetric.sleep + 0.5)} className="w-8 h-8 bg-purple-500 text-white rounded-full hover:bg-purple-600">+</button>
                </div>
            </div>

            {/* Mood */}
            <div className="bg-dark-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="font-bold text-lg mb-2">Mood</h3>
                <div className="text-4xl mb-4">{todaysMetric.mood || '❓'}</div>
                <div className="flex gap-1">
                    {['😀', '😐', '😞', '😡', '😴'].map(emoji => (
                        <button key={emoji} onClick={() => updateMetric('mood', emoji)} className={`w-8 h-8 rounded-full hover:bg-dark-accent transition-colors ${todaysMetric.mood === emoji ? 'bg-dark-purple' : ''}`}>
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Steps */}
            <div className="bg-dark-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="font-bold text-lg mb-2">Steps</h3>
                <input 
                    type="number" 
                    value={todaysMetric.steps || ''} 
                    onChange={(e) => updateMetric('steps', parseInt(e.target.value) || 0)}
                    className="text-3xl font-bold bg-transparent text-center w-full mb-4 focus:outline-none text-green-400 placeholder-dark-accent"
                    placeholder="0"
                />
                <p className="text-sm text-dark-text-secondary">Daily Steps</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-dark-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Weight Trend</h3>
                    <form onSubmit={handleAddWeight} className="flex gap-2">
                        <input 
                            type="number" 
                            step="0.1" 
                            value={newWeight} 
                            onChange={(e) => setNewWeight(e.target.value)} 
                            placeholder="Add (kg)" 
                            className="bg-dark-accent p-2 rounded-lg text-sm w-24 focus:outline-none focus:ring-2 focus:ring-dark-purple"
                        />
                        <button type="submit" className="bg-dark-purple text-white p-2 rounded-lg hover:bg-opacity-90">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
                
                <div className="h-80 w-full">
                    {weightEntries.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="weight" stroke="#A855F7" strokeWidth={3} activeDot={{ r: 6, fill: '#fff' }} dot={{fill: '#A855F7'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-dark-text-secondary">
                            <LineChartIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>Log your weight to see trends over time.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History List Section */}
            <div className="lg:col-span-1 bg-dark-card rounded-2xl p-6 flex flex-col max-h-[450px]">
                <h3 className="font-bold text-lg mb-4">History Log</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {sortedEntries.length === 0 ? (
                        <p className="text-dark-text-secondary text-sm text-center italic">No entries yet.</p>
                    ) : (
                        sortedEntries.map((entry) => (
                            <div key={entry.originalIndex} className="flex items-center justify-between p-3 bg-dark-accent/30 rounded-xl group hover:bg-dark-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-dark-accent rounded-lg text-dark-text-secondary">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-text-secondary font-bold uppercase">{new Date(entry.date).toLocaleDateString()}</p>
                                        {editingId === entry.originalIndex ? (
                                            <input 
                                                type="number" 
                                                value={editWeight} 
                                                onChange={(e) => setEditWeight(e.target.value)}
                                                onBlur={() => saveEdit(entry.originalIndex)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(entry.originalIndex)}
                                                className="w-20 bg-dark-bg border border-dark-purple rounded px-1 py-0.5 text-sm font-bold focus:outline-none"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-lg font-bold">{entry.weight} <span className="text-xs font-normal text-dark-text-secondary">kg</span></p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(entry.originalIndex, entry.weight)} className="p-1.5 text-dark-text-secondary hover:text-dark-text hover:bg-dark-card rounded-lg transition-colors">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if(window.confirm('Delete this entry?')) deleteWeightEntry(entry.originalIndex); }} className="p-1.5 text-dark-text-secondary hover:text-project-red-from hover:bg-dark-card rounded-lg transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </ViewWrapper>
  );
};

export default HealthTracker;