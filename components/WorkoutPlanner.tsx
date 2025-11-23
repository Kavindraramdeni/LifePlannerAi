
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SparklesIcon, WorkoutIcon, CheckSquareIcon, TrashIcon, MoreVerticalIcon, PencilIcon, ArrowDownIcon, CalendarDaysIcon, ClipboardListIcon, TrophyIcon, PlayCircleIcon, StopCircleIcon, TimerIcon, CalculatorIcon, CheckIcon, SettingsIcon, PlusIcon, EyeIcon, FlameIcon, ClockIcon, LineChartIcon, UploadIcon, YogaIcon, InfoIcon, CheckCircleIcon } from './icons';
import { getWeeklyWorkoutPlanStream } from '../services/geminiService';
import Markdown from 'react-markdown';
import { Workout, PersonalRecord } from '../types';
import WorkoutModal from './WorkoutModal';
import { useData } from '../contexts/DataContext';
import PRSettingsModal from './PRSettingsModal';

interface PlanDetail {
    name: string;
    content: string;
}

const SURYA_NAMASKAR_STEPS = [
    { id: 1, name: 'Pranamasana', eng: 'Prayer Pose', desc: 'Stand at the edge of the mat, feet together. Bring palms together in prayer position at the chest.' },
    { id: 2, name: 'Hastauttanasana', eng: 'Raised Arms Pose', desc: 'Inhale, lift arms up and back. Stretch the whole body from heels to fingertips.' },
    { id: 3, name: 'Padahastasana', eng: 'Hand to Foot Pose', desc: 'Exhale, bend forward from the waist. Hands on floor beside feet.' },
    { id: 4, name: 'Ashwa Sanchalanasana', eng: 'Equestrian Pose', desc: 'Inhale, push right leg back. Right knee on floor, look up.' },
    { id: 5, name: 'Dandasana', eng: 'Stick Pose', desc: 'Hold breath, take left leg back. Body in straight line (Plank).' },
    { id: 6, name: 'Ashtanga Namaskara', eng: 'Salute with Eight Parts', desc: 'Exhale, gently bring knees, chest, and chin to the floor.' },
    { id: 7, name: 'Bhujangasana', eng: 'Cobra Pose', desc: 'Inhale, slide forward and raise chest up. Look up.' },
    { id: 8, name: 'Parvatasana', eng: 'Mountain Pose', desc: 'Exhale, lift hips and tailbone up. Chest downwards (Downward Dog).' },
    { id: 9, name: 'Ashwa Sanchalanasana', eng: 'Equestrian Pose', desc: 'Inhale, bring right foot forward between hands. Left knee on floor.' },
    { id: 10, name: 'Padahastasana', eng: 'Hand to Foot Pose', desc: 'Exhale, bring left foot forward. Palms on floor, bend forward.' },
    { id: 11, name: 'Hastauttanasana', eng: 'Raised Arms Pose', desc: 'Inhale, roll up, lift arms up and back.' },
    { id: 12, name: 'Pranamasana', eng: 'Prayer Pose', desc: 'Exhale, return to prayer position. Relax.' },
];

// --- CHILD COMPONENT: WorkoutCard ---
interface WorkoutCardProps {
    workout: Workout;
    onToggle: (id: string) => void;
    onEdit: (workout: Workout) => void;
    onDelete: (id: string) => void;
    onStart: (workout: Workout) => void;
    featured?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onToggle, onEdit, onDelete, onStart, featured }) => {
    const [isExpanded, setIsExpanded] = useState(featured);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    return (
        <div 
            className={`rounded-2xl border border-dark-border transition-all duration-300 ${featured ? 'bg-gradient-to-br from-dark-card to-dark-accent p-6 shadow-lg border-dark-purple/30' : 'bg-dark-card p-4 hover:border-dark-purple/50'} ${workout.completed ? 'opacity-60' : ''}`}
            onClick={() => setActiveMenuId(null)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {featured && <span className="text-xs font-bold bg-dark-purple text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Today's Focus</span>}
                        {workout.day && <span className="text-xs font-bold text-dark-text-secondary uppercase tracking-wide">{workout.day}</span>}
                    </div>
                    <h4 className={`font-bold ${featured ? 'text-2xl' : 'text-lg'} ${workout.completed ? 'line-through text-dark-text-secondary' : 'text-dark-text'}`}>{workout.name}</h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                        {!workout.completed && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onStart(workout); }}
                                className={`flex items-center font-bold rounded-full hover:bg-opacity-90 transition-colors ${featured ? 'px-6 py-2 bg-project-green-from text-white text-sm' : 'px-3 py-1 bg-dark-accent text-project-green-from text-xs'}`}
                            >
                                <PlayCircleIcon className={`${featured ? 'w-5 h-5' : 'w-4 h-4'} mr-1.5`} /> Start
                            </button>
                        )}
                         {workout.completed && (
                            <span className="text-xs text-green-500 flex items-center font-semibold bg-green-500/10 px-2 py-1 rounded">
                                <CheckIcon className="w-3 h-3 mr-1"/> Completed
                            </span>
                        )}
                    </div>
                </div>
                <div className="relative ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(workout.id === activeMenuId ? null : workout.id); }}
                      className="p-2 text-dark-text-secondary hover:text-dark-text rounded-full hover:bg-dark-bg/50"
                    >
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {activeMenuId === workout.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-md shadow-lg z-10 py-1">
                            <button onClick={(e) => { e.stopPropagation(); onToggle(workout.id); setActiveMenuId(null); }} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-accent">
                                <CheckSquareIcon isChecked={workout.completed} className="w-4 h-4 mr-2" /> {workout.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(workout); setActiveMenuId(null); }} className="w-full flex items-center px-3 py-2 text-sm text-dark-text hover:bg-dark-accent">
                                <PencilIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(workout.id); setActiveMenuId(null); }} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-accent">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {workout.notes && (
                <div className="mt-3 text-sm bg-dark-bg/50 p-3 rounded-lg border-l-2 border-dark-purple italic text-dark-text-secondary">
                    "{workout.notes}"
                </div>
            )}
            
            {isExpanded && (
                <div className="prose prose-invert max-w-none text-sm mt-4 pt-4 border-t border-dark-border/50">
                    <Markdown>{workout.content}</Markdown>
                </div>
            )}

            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-xs text-dark-text-secondary hover:text-dark-text font-semibold mt-4 flex items-center w-full justify-center">
                {isExpanded ? 'Show Less' : 'Show Details'}
                <ArrowDownIcon className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
}

// --- YOGA COMPONENT ---
const SuryaNamaskarGuide: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = SURYA_NAMASKAR_STEPS.length;

    const nextStep = () => setCurrentStep((prev) => (prev + 1) % totalSteps);
    const prevStep = () => setCurrentStep((prev) => (prev - 1 + totalSteps) % totalSteps);
    const activePose = SURYA_NAMASKAR_STEPS[currentStep];

    return (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center text-project-green-from">
                    <YogaIcon className="w-6 h-6 mr-2"/> Surya Namaskar (12 Steps)
                </h3>
                <span className="text-sm font-mono bg-dark-accent px-2 py-1 rounded">
                    {currentStep + 1} / {totalSteps}
                </span>
            </div>

            <div className="relative aspect-video bg-dark-accent rounded-xl overflow-hidden mb-6 flex items-center justify-center group">
                {/* Placeholder for real image */}
                <img 
                    src={`https://placehold.co/600x400/1e293b/FFF?text=${encodeURIComponent(activePose.name)}`} 
                    alt={activePose.name}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <h2 className="text-3xl font-bold text-white">{activePose.eng}</h2>
                    <p className="text-white/80 font-mono italic">{activePose.name}</p>
                </div>
            </div>

            <div className="bg-dark-bg/50 p-4 rounded-xl mb-6 border border-dark-border/50">
                <p className="text-center text-lg">{activePose.desc}</p>
            </div>

            <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-3 bg-dark-accent rounded-xl font-bold hover:bg-dark-purple hover:text-white transition-colors">
                    Prev
                </button>
                <button onClick={nextStep} className="flex-1 py-3 bg-project-green-from text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors">
                    Next Pose
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: WorkoutPlanner ---
const WorkoutPlanner: React.FC = () => {
  const { workouts, setWorkouts, personalRecords, updatePersonalRecord } = useData();
  const [activeTab, setActiveTab] = useState<'plan' | 'history' | 'yoga'>('plan');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [aiWeeklyPlan, setAiWeeklyPlan] = useState<Record<string, PlanDetail> | null>(null);
  const [aiPreviewContent, setAiPreviewContent] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(''); // For adding new workout to a specific day
  
  // LIVE WORKOUT STATE
  const [liveWorkout, setLiveWorkout] = useState<Workout | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [finishNote, setFinishNote] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const timerRef = useRef<number | null>(null);

  // History Menu State
  const [activeHistoryMenu, setActiveHistoryMenu] = useState<string | null>(null);

  // Organize workouts by day
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Separate Active vs History
  const historyWorkouts = useMemo(() => {
      return workouts.filter(w => w.completed).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }, [workouts]);

  // Streak Calculation
  const stats = useMemo(() => {
    const completed = workouts.filter(w => w.completed && w.completedAt);
    const totalCompleted = completed.length;
    
    // Calculate Streak (consecutive days with at least 1 workout)
    let streak = 0;
    const sortedDates = [...new Set(completed.map(w => w.completedAt!.toISOString().split('T')[0]))].sort().reverse();
    
    if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Streak is active if worked out today or yesterday
        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            streak = 1;
            let currentDate = new Date(sortedDates[0]);
            
            for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(sortedDates[i] as string);
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    streak++;
                    currentDate = prevDate;
                } else {
                    break;
                }
            }
        }
    }

    return { streak, totalCompleted };
  }, [workouts]);

  // Helper to find workout for a specific day
  const getWorkoutForDay = (day: string) => {
      return workouts.find(w => 
          (w.day === day) || 
          (!w.day && w.name.toLowerCase().includes(day.toLowerCase()))
      );
  };

  const todaysWorkout = getWorkoutForDay(todayName);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
        timerRef.current = window.setInterval(() => {
            setTimerSeconds(prev => {
                if (prev <= 1) {
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
      setTimerSeconds(seconds);
      setIsTimerRunning(true);
  };

  const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Live Workout Handlers
  const handleStartWorkout = (workout: Workout) => {
      setLiveWorkout(workout);
      setCheckedItems(new Set());
      setTimerSeconds(0);
      setIsTimerRunning(false);
      setFinishNote('');
      setShowFinishModal(false);
  };

  const toggleCheckItem = (index: number) => {
      const newSet = new Set(checkedItems);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setCheckedItems(newSet);
  };

  const handleFinishLiveWorkout = () => {
      setShowFinishModal(true);
  };

  const confirmFinishWorkout = () => {
      if (liveWorkout) {
          setWorkouts(workouts.map(w => w.id === liveWorkout.id ? { ...w, completed: true, completedAt: new Date(), notes: finishNote } : w));
      }
      setLiveWorkout(null);
      setShowFinishModal(false);
  };

  // PR Logic
  const handleUpdatePR = (id: string, weight: string) => {
      const numWeight = parseFloat(weight);
      if (!isNaN(numWeight)) {
          const pr = personalRecords.find(r => r.id === id);
          if (pr) {
            updatePersonalRecord({ ...pr, weight: numWeight });
          }
      }
  };

  // AI Generation
  const generateWeeklyPlan = async () => {
    if (!userInput.trim()) {
        setError("Please describe the workout you'd like to plan.");
        return;
    }
    setIsLoading(true);
    setError('');
    setAiWeeklyPlan(null);
    setAiPreviewContent('');
    try {
        const stream = await getWeeklyWorkoutPlanStream(userInput); 
        let jsonString = '';
        for await (const chunk of stream) {
            jsonString += chunk.text;
        }

        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) throw new Error("Invalid JSON response from AI.");
        const cleanJsonString = jsonString.substring(startIndex, endIndex + 1);
        
        const parsedPlan = JSON.parse(cleanJsonString) as Record<string, PlanDetail>;
        setAiWeeklyPlan(parsedPlan);

        let previewMd = '### Your AI-Generated Plan\n\n';
        for (const [day, details] of Object.entries(parsedPlan)) {
            previewMd += `**${day}: ${details.name}**\n`;
            if (details.content && !details.name.toLowerCase().includes('rest')) {
                 previewMd += `${details.content}\n\n`;
            }
        }
        setAiPreviewContent(previewMd);

    } catch (e) {
        console.error(e);
        setError('Failed to generate workout plan.');
    } finally {
        setIsLoading(false);
    }
  };

  const applyGeneratedPlan = () => {
      if (!aiWeeklyPlan) return;
      
      const daysToAdd = Object.keys(aiWeeklyPlan);
      const filteredWorkouts = workouts.filter(w => {
          const dayMatch = w.day && daysToAdd.includes(w.day);
          return !dayMatch;
      });

      const newWorkouts: Workout[] = Object.entries(aiWeeklyPlan)
        .map(([day, details]: [string, PlanDetail]) => ({
            id: `w-${Date.now()}-${day}`,
            name: details.name,
            content: details.content,
            day: day, 
            completed: false,
            createdAt: new Date(),
        }));
      
      setWorkouts([...newWorkouts, ...filteredWorkouts]);
      setAiWeeklyPlan(null);
      setAiPreviewContent('');
      setUserInput('');
  };

  const toggleWorkoutCompletion = (id: string) => {
      setWorkouts(workouts.map(w => {
          if (w.id === id) {
              const isNowCompleted = !w.completed;
              return {
                  ...w,
                  completed: isNowCompleted,
                  completedAt: isNowCompleted ? new Date() : undefined
              };
          }
          return w;
      }));
  };
  
  const deleteWorkout = (id: string) => {
    if (window.confirm("Are you sure you want to remove this workout?")) {
        setWorkouts(workouts.filter(w => w.id !== id));
        setIsModalOpen(false);
    }
  };

  const handleOpenModal = (workout: Workout | null, day?: string) => {
      setWorkoutToEdit(workout);
      setSelectedDay(day || '');
      setIsModalOpen(true);
  };

  const handleSaveWorkout = (workoutData: Omit<Workout, 'id' | 'completed' | 'createdAt' | 'completedAt'> | Workout) => {
    if ('id' in workoutData) {
        setWorkouts(workouts.map(w => w.id === workoutData.id ? workoutData as Workout : w));
    } else {
        const newWorkout: Workout = {
            ...workoutData,
            id: `w-${Date.now()}`,
            completed: false,
            createdAt: new Date(),
        };
        
        let currentWorkouts = workouts;
        if (newWorkout.day) {
            currentWorkouts = workouts.filter(w => w.day !== newWorkout.day);
        }
        setWorkouts([newWorkout, ...currentWorkouts]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <WorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkout}
        onDelete={workoutToEdit ? () => deleteWorkout(workoutToEdit.id) : undefined}
        workoutToEdit={workoutToEdit}
        initialDay={selectedDay}
      />
      
      <PRSettingsModal isOpen={isPRModalOpen} onClose={() => setIsPRModalOpen(false)} />

      {/* LIVE WORKOUT OVERLAY */}
      {liveWorkout && (
          <div className="fixed inset-0 bg-dark-bg z-50 flex flex-col animate-fade-in">
              {/* Header */}
              <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card">
                  <button onClick={() => setLiveWorkout(null)} className="text-dark-text-secondary">Cancel</button>
                  <h2 className="font-bold text-lg">{liveWorkout.name}</h2>
                  <button onClick={handleFinishLiveWorkout} className="text-project-green-from font-bold">Finish</button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="prose prose-invert max-w-none mb-8">
                    {liveWorkout.content.split('\n').map((line, index) => {
                        // FIX: Updated regex to support lists starting with '*' or '-' or numbers '1.'
                        const isItem = /^[0-9]+\.|^[-*]/.test(line.trim());
                        if (isItem) {
                            return (
                                <div key={index} onClick={() => toggleCheckItem(index)} className={`flex items-start p-3 rounded-lg mb-2 cursor-pointer transition-colors ${checkedItems.has(index) ? 'bg-dark-accent/50 opacity-50' : 'bg-dark-card'}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${checkedItems.has(index) ? 'bg-project-green-from border-project-green-from' : 'border-dark-text-secondary'}`}>
                                        {checkedItems.has(index) && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={checkedItems.has(index) ? 'line-through text-dark-text-secondary' : ''}>{line.replace(/^[0-9]+\.|^[-*]/, '').trim()}</span>
                                </div>
                            );
                        }
                        if (!line.trim()) return <br key={index}/>;
                        // Render headers roughly
                        if (line.startsWith('#') || line.startsWith('**')) return <div key={index} className="font-bold text-dark-purple mt-4 mb-2"><Markdown>{line}</Markdown></div>;
                        return <div key={index} className="text-sm text-dark-text-secondary"><Markdown>{line}</Markdown></div>;
                    })}
                  </div>

                  <button 
                      onClick={handleFinishLiveWorkout} 
                      className="w-full py-4 bg-project-green-from text-white font-bold text-lg rounded-xl shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center mb-4"
                  >
                      <CheckCircleIcon className="w-6 h-6 mr-2" />
                      Finish Workout
                  </button>
              </div>

              {/* Finish Modal inside Live View */}
              {showFinishModal && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                      <div className="bg-dark-card w-full max-w-md p-6 rounded-2xl">
                          <h3 className="text-xl font-bold mb-4">Great Job!</h3>
                          <p className="text-sm text-dark-text-secondary mb-2">How did it go? (Optional)</p>
                          <textarea 
                              value={finishNote} 
                              onChange={e => setFinishNote(e.target.value)} 
                              className="w-full bg-dark-accent p-3 rounded-lg mb-4 h-24 focus:outline-none"
                              placeholder="e.g. Bench felt heavy, hit a PR on squats."
                          />
                          <div className="flex gap-4">
                              <button onClick={() => setShowFinishModal(false)} className="flex-1 py-2 bg-dark-accent rounded-lg">Go Back</button>
                              <button onClick={confirmFinishWorkout} className="flex-1 py-2 bg-dark-purple text-white font-bold rounded-lg">Save & Complete</button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Timer Widget */}
              <div className="p-4 bg-dark-card border-t border-dark-border flex items-center justify-between">
                  <div className="flex items-center">
                      <div className={`text-3xl font-mono font-bold mr-4 ${isTimerRunning ? 'text-project-green-from' : 'text-dark-text'}`}>
                          {formatTime(timerSeconds)}
                      </div>
                      {isTimerRunning ? (
                          <button onClick={() => setIsTimerRunning(false)} className="p-2 bg-dark-accent rounded-full"><StopCircleIcon className="w-6 h-6" /></button>
                      ) : (
                          <button onClick={() => setIsTimerRunning(true)} className="p-2 bg-dark-accent rounded-full" disabled={timerSeconds === 0}><PlayCircleIcon className="w-6 h-6" /></button>
                      )}
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => startTimer(30)} className="px-3 py-1 bg-dark-accent rounded-lg text-sm font-semibold">30s</button>
                      <button onClick={() => startTimer(60)} className="px-3 py-1 bg-dark-accent rounded-lg text-sm font-semibold">60s</button>
                      <button onClick={() => startTimer(90)} className="px-3 py-1 bg-dark-accent rounded-lg text-sm font-semibold">90s</button>
                  </div>
              </div>
          </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in" onClick={() => setActiveHistoryMenu(null)}>
        
        {/* Header Stats Bar */}
        <div className="flex flex-wrap gap-6 items-center justify-between bg-dark-card p-4 rounded-2xl border border-dark-border">
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-orange-500 group relative cursor-help">
                    <FlameIcon className="w-6 h-6" />
                    <div>
                        <p className="text-2xl font-bold leading-none">{stats.streak}</p>
                        <p className="text-[10px] uppercase font-bold text-dark-text-secondary flex items-center">
                            Day Streak <InfoIcon className="w-3 h-3 ml-1 opacity-50"/>
                        </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-10">
                        Consecutive days you have logged a workout.
                    </div>
                 </div>
                 <div className="w-px h-8 bg-dark-border"></div>
                 <div className="flex items-center gap-2 text-project-green-from group relative cursor-help">
                    <CheckSquareIcon isChecked={true} className="w-6 h-6" />
                    <div>
                        <p className="text-2xl font-bold leading-none">{stats.totalCompleted}</p>
                        <p className="text-[10px] uppercase font-bold text-dark-text-secondary flex items-center">
                            Total Workouts <InfoIcon className="w-3 h-3 ml-1 opacity-50"/>
                        </p>
                    </div>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-10">
                        The total number of workouts you have completed in your history.
                    </div>
                 </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-dark-border pb-2 overflow-x-auto">
            <button onClick={() => setActiveTab('plan')} className={`text-sm font-semibold pb-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'plan' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>
                <CalendarDaysIcon className="w-4 h-4"/> Active Plan
            </button>
            <button onClick={() => setActiveTab('yoga')} className={`text-sm font-semibold pb-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'yoga' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>
                <YogaIcon className="w-4 h-4"/> Yoga
            </button>
            <button onClick={() => setActiveTab('history')} className={`text-sm font-semibold pb-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'text-dark-purple border-b-2 border-dark-purple' : 'text-dark-text-secondary'}`}>
                <ClockIcon className="w-4 h-4"/> History Log
            </button>
        </div>

        {activeTab === 'plan' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Schedule Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* PR Section */}
                    <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
                                <h3 className="font-bold text-lg">Personal Records</h3>
                            </div>
                            <button onClick={() => setIsPRModalOpen(true)} className="p-2 bg-dark-accent rounded-lg hover:text-white text-dark-text-secondary" title="Manage PRs"><SettingsIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {personalRecords.map(pr => (
                                <div key={pr.id} className="bg-dark-accent/50 p-4 rounded-xl min-w-[140px] flex flex-col items-center">
                                    <span className="text-xs text-dark-text-secondary font-bold uppercase mb-1">{pr.name}</span>
                                    <div className="flex items-baseline">
                                        <input 
                                            type="number" 
                                            defaultValue={pr.weight}
                                            onBlur={(e) => handleUpdatePR(pr.id, e.target.value)}
                                            className="w-16 bg-transparent text-center text-2xl font-bold focus:outline-none border-b border-transparent focus:border-dark-purple"
                                        />
                                        <span className="text-xs text-dark-text-secondary ml-1">{pr.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Workout Card */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center text-project-green-from">
                            <CalendarDaysIcon className="w-5 h-5 mr-2" /> Today's Focus
                        </h3>
                        {todaysWorkout ? (
                            <WorkoutCard 
                                workout={todaysWorkout}
                                onToggle={toggleWorkoutCompletion}
                                onEdit={handleOpenModal}
                                onDelete={deleteWorkout}
                                onStart={handleStartWorkout}
                                featured={true}
                            />
                        ) : (
                            <div className="bg-dark-card p-8 rounded-2xl border border-dashed border-dark-border text-center">
                                <WorkoutIcon className="w-12 h-12 mx-auto text-dark-text-secondary mb-3 opacity-50" />
                                <h4 className="text-lg font-semibold">No workout scheduled for today.</h4>
                                <p className="text-dark-text-secondary text-sm">Enjoy your rest day!</p>
                            </div>
                        )}
                    </div>

                    {/* Weekly Schedule Grid */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Weekly Schedule</h3>
                            <button onClick={() => handleOpenModal(null)} className="text-xs flex items-center bg-dark-blue hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors">
                                <PlusIcon className="w-4 h-4 mr-1.5"/> Custom Workout
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {weekDays.filter(d => d !== todayName).map(day => {
                                const workout = getWorkoutForDay(day);
                                return (
                                    <div key={day} className="bg-dark-card p-4 rounded-xl border border-dark-border/50 flex flex-col h-full">
                                        <h4 className="text-xs font-bold text-dark-text-secondary uppercase mb-2">{day}</h4>
                                        {workout ? (
                                            <div className="group relative flex-1">
                                                <h5 className={`font-bold ${workout.completed ? 'line-through opacity-60' : ''}`}>{workout.name}</h5>
                                                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenModal(workout, day)} className="text-xs text-dark-text-secondary hover:text-dark-purple flex items-center font-semibold bg-dark-accent/50 px-2 py-1 rounded hover:bg-dark-accent transition-colors">
                                                        <EyeIcon className="w-3 h-3 mr-1.5"/> Show Details
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => handleOpenModal(null, day)}
                                                className="flex-1 min-h-[40px] flex items-center justify-center text-dark-text-secondary text-xs italic border border-dashed border-dark-border rounded-lg hover:border-dark-purple hover:bg-dark-accent cursor-pointer transition-colors group"
                                            >
                                                <span className="group-hover:hidden">Rest Day</span>
                                                <span className="hidden group-hover:flex items-center text-dark-purple font-semibold"><PlusIcon className="w-3 h-3 mr-1"/> Add Workout</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* AI Generator Column */}
                <div className="lg:col-span-1">
                    <div className="bg-dark-card p-6 rounded-2xl border border-dark-border sticky top-6">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="w-5 h-5 text-dark-purple mr-2" />
                            <h3 className="font-bold text-lg">AI Workout Planner</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-dark-text-secondary uppercase mb-1 block">Your Goal</label>
                                <textarea 
                                    value={userInput} 
                                    onChange={(e) => setUserInput(e.target.value)} 
                                    className="w-full bg-dark-accent p-3 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-dark-purple resize-none"
                                    placeholder="e.g. Build muscle, 4 days a week. Focus on compound lifts."
                                />
                            </div>
                            
                            <button 
                                onClick={generateWeeklyPlan} 
                                disabled={isLoading} 
                                className="w-full py-3 bg-dark-purple text-white font-bold rounded-xl shadow-lg hover:bg-dark-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Generating...
                                    </div>
                                ) : 'Generate Plan'}
                            </button>
                            
                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

                            {aiWeeklyPlan && (
                                <div className="mt-6 animate-fade-in">
                                    <div className="bg-dark-accent/50 rounded-lg p-3 mb-3 max-h-48 overflow-y-auto text-xs">
                                        <div className="prose prose-invert max-w-none">
                                            <Markdown>{aiPreviewContent}</Markdown>
                                        </div>
                                    </div>
                                    <button onClick={applyGeneratedPlan} className="w-full py-2 bg-dark-blue text-white font-bold rounded-lg text-sm hover:bg-opacity-90 transition-colors">
                                        Apply Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'yoga' && (
            <div className="max-w-4xl mx-auto">
                 <SuryaNamaskarGuide />
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-dark-text-secondary">
                    <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
                        <h4 className="font-bold text-dark-text mb-2">Why do Sun Salutations?</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Improves flexibility and joint mobility.</li>
                            <li>Stimulates the cardiovascular system.</li>
                            <li>Strengthens muscles and improves posture.</li>
                            <li>Calms the mind and reduces stress.</li>
                        </ul>
                    </div>
                    <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
                        <h4 className="font-bold text-dark-text mb-2">Tips for Beginners</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Coordinate your breath with each movement (inhale/exhale).</li>
                            <li>Don't force poses; go only as far as comfortable.</li>
                            <li>Start with 2-4 cycles and gradually increase to 12.</li>
                            <li>Best practiced in the morning on an empty stomach.</li>
                        </ul>
                    </div>
                 </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
                {historyWorkouts.length === 0 ? (
                     <div className="text-center py-12 bg-dark-card rounded-2xl border border-dark-border">
                        <ClockIcon className="w-16 h-16 mx-auto text-dark-text-secondary opacity-30 mb-4" />
                        <h3 className="text-xl font-bold text-dark-text">No History Yet</h3>
                        <p className="text-dark-text-secondary mt-2">Completed workouts will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyWorkouts.map(workout => (
                            <div key={workout.id} className="bg-dark-card p-5 rounded-xl border border-dark-border flex flex-col md:flex-row gap-4 relative">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-dark-text-secondary text-xs mb-1">
                                        <CalendarDaysIcon className="w-3 h-3" />
                                        <span>{workout.completedAt?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{workout.completedAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-dark-text mb-2">{workout.name}</h4>
                                    {workout.notes && (
                                        <div className="bg-dark-accent/50 p-3 rounded-lg text-sm italic text-dark-text-secondary border-l-2 border-project-green-from">
                                            "{workout.notes}"
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => handleOpenModal(workout)} 
                                            className="text-xs text-dark-purple hover:underline"
                                        >
                                            View Workout
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center px-4 border-l border-dark-border/50">
                                     <div className="bg-green-500/10 p-3 rounded-full mb-2">
                                        <CheckIcon className="w-6 h-6 text-project-green-from" />
                                     </div>
                                     <span className="text-xs font-bold text-project-green-from uppercase">Completed</span>
                                </div>
                                {/* History Menu */}
                                <div className="absolute top-4 right-4">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveHistoryMenu(activeHistoryMenu === workout.id ? null : workout.id); }} className="p-1.5 text-dark-text-secondary hover:text-dark-text rounded-full hover:bg-dark-accent">
                                        <MoreVerticalIcon className="w-4 h-4" />
                                    </button>
                                    {activeHistoryMenu === workout.id && (
                                        <div className="absolute right-0 mt-2 w-40 bg-dark-accent border border-dark-border rounded-md shadow-lg z-10 py-1 text-dark-text">
                                            <button onClick={(e) => { e.stopPropagation(); toggleWorkoutCompletion(workout.id); setActiveHistoryMenu(null); }} className="w-full flex items-center px-3 py-2 text-sm hover:bg-dark-card">
                                                <CheckSquareIcon isChecked={true} className="w-4 h-4 mr-2" /> Mark Incomplete
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); setActiveHistoryMenu(null); }} className="w-full flex items-center px-3 py-2 text-sm text-project-red-from hover:bg-dark-card">
                                                <TrashIcon className="w-4 h-4 mr-2" /> Delete Log
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </>
  );
};

export default WorkoutPlanner;
