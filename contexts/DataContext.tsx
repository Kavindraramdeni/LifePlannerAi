
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Project, Habit, Movie, Book, Goal, VisionBoardItem, VisionBoard, WeightEntry, HealthMetric, Transaction, TransactionCategory, Category, TeamMember, SubTask, MealPlan, PantryItem, Note, MealPlannerSettings, Workout, PersonalRecord, RoutineItem, RoutineCompletion, TargetCategory, TargetCompletion, TargetItem, SavingsGoal, Notification } from '../types';
import * as Icons from '../components/icons';

// --- DATA TYPES ---
interface AppData {
    tasks: Task[];
    projects: Project[];
    habits: Habit[];
    movies: Movie[];
    books: Book[];
    goals: Goal[];
    visionBoards: VisionBoard[];
    visionBoardItems: VisionBoardItem[];
    weightEntries: WeightEntry[];
    healthMetrics: HealthMetric[];
    transactions: Transaction[];
    financeCategories: { [key: string]: TransactionCategory };
    accounts: string[];
    savingsGoals: SavingsGoal[];
    budgets: { [key: string]: number };
    mealPlan: MealPlan;
    mealPlannerSettings: MealPlannerSettings;
    pantryItems: PantryItem[];
    theme: 'dark' | 'light';
    notes: Note[];
    workouts: Workout[];
    personalRecords: PersonalRecord[];
    routineItems: RoutineItem[];
    routineCompletion: RoutineCompletion;
    targetCategories: TargetCategory[];
    targetCompletion: TargetCompletion;
    notifications: Notification[];
}

interface DataContextType extends AppData {
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    toggleTheme: () => void;
    saveTask: (task: Task) => void;
    addTask: (task: Task) => void;
    deleteTask: (id: string) => void;
    saveProject: (project: Omit<Project, 'id' | 'progress' | 'theme' | 'team'> | Project, team: TeamMember[]) => void;
    deleteProject: (id: string) => void;
    saveHabit: (habit: Habit) => void;
    deleteHabit: (id: string) => void;
    saveMovie: (movie: Omit<Movie, 'id'> | Movie) => void;
    saveBook: (book: Omit<Book, 'id'> | Book) => void;
    deleteBook: (id: string) => void;
    saveGoal: (goal: Omit<Goal, 'id' | 'subTasks'> | Goal) => void;
    deleteGoal: (id: string) => void;
    
    addVisionBoard: (name: string) => void;
    deleteVisionBoard: (id: string) => void;
    addVisionBoardItem: (item: Omit<VisionBoardItem, 'id'>) => void;
    updateVisionBoardItem: (item: VisionBoardItem) => void;
    deleteVisionBoardItem: (id: string) => void;
    
    // Legacy aliases
    visionBoardImages: VisionBoardItem[]; 
    addVisionBoardImage: (item: Omit<VisionBoardItem, 'id'>) => void; 
    deleteVisionBoardImage: (id: string) => void;
    updateVisionBoardImage: (item: VisionBoardItem) => void;

    addWeightEntry: (entry: WeightEntry) => void;
    updateWeightEntry: (index: number, weight: number) => void; 
    deleteWeightEntry: (index: number) => void; 
    saveHealthMetric: (metric: HealthMetric) => void;
    
    saveTransaction: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    deleteTransaction: (id: string) => void;
    saveBudgets: (budgets: { [key: string]: number }) => void;
    saveFinanceCategories: (categories: { [key: string]: TransactionCategory }) => void;
    parseCSV: (file: File) => void;
    categories: { [key: string]: Category };
    team: TeamMember[];
    addAccount: (name: string) => void;
    deleteAccount: (name: string) => void;
    saveSavingsGoal: (goal: Omit<SavingsGoal, 'id'> | SavingsGoal) => void;
    deleteSavingsGoal: (id: string) => void;
    saveMealPlan: (plan: React.SetStateAction<MealPlan>) => void;
    addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
    deletePantryItem: (id: string) => void;
    saveMealPlannerSettings: (settings: MealPlannerSettings) => void;
    updatePersonalRecord: (pr: PersonalRecord) => void;
    deletePersonalRecord: (id: string) => void;
    setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
    
    saveRoutineItem: (item: Omit<RoutineItem, 'id'> | RoutineItem) => void;
    deleteRoutineItem: (id: string) => void;
    toggleRoutineItemCompletion: (id: string) => void;
    
    saveTargetCategory: (category: Omit<TargetCategory, 'id'> | TargetCategory) => void;
    deleteTargetCategory: (id: string) => void;
    toggleTargetItem: (itemId: string) => void;

    markNotificationRead: (id: string) => void;
    clearAllNotifications: () => void;
    setWeightEntries: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
}

// --- ICON MAPPING for JSON serialization ---
const iconMap: { [key: string]: React.ComponentType<any> } = {
    BriefcaseIcon: Icons.BriefcaseIcon,
    HeartIcon: Icons.HeartIcon,
    UserIcon: Icons.UserIcon,
    WorkoutIcon: Icons.WorkoutIcon,
    UtensilsIcon: Icons.UtensilsIcon,
    ShoppingCartIcon: Icons.ShoppingCartIcon,
    HomeIcon: Icons.HomeIcon,
    GiftIcon: Icons.GiftIcon,
    DollarSignIcon: Icons.DollarSignIcon,
    BookOpenIcon: Icons.BookOpenIcon,
    TravelIcon: Icons.TravelIcon,
    BookshelfIcon: Icons.BookshelfIcon,
    TrendingUpIcon: Icons.TrendingUpIcon,
    TagIcon: Icons.TagIcon,
    SparklesIcon: Icons.SparklesIcon,
    CheckSquareIcon: Icons.CheckSquareIcon,
    PlayIcon: Icons.PlayIcon,
    SkipBackIcon: Icons.SkipBackIcon,
    SkipForwardIcon: Icons.SkipForwardIcon,
    MoreHorizontalIcon: Icons.MoreHorizontalIcon,
    MoreVerticalIcon: Icons.MoreVerticalIcon,
    ArrowLeftIcon: Icons.ArrowLeftIcon,
    PlusIcon: Icons.PlusIcon,
    TargetIcon: Icons.TargetIcon,
    ImageIcon: Icons.ImageIcon,
    LineChartIcon: Icons.LineChartIcon,
    MapPinIcon: Icons.MapPinIcon,
    SunIcon: Icons.SunIcon,
    MoonIcon: Icons.MoonIcon,
    FlameIcon: Icons.FlameIcon,
    TrendingDownIcon: Icons.TrendingDownIcon,
    PlusCircleIcon: Icons.PlusCircleIcon,
    SearchIcon: Icons.SearchIcon,
    FilterIcon: Icons.FilterIcon,
    BoldIcon: Icons.BoldIcon,
    ItalicIcon: Icons.ItalicIcon,
    ListUlIcon: Icons.ListUlIcon,
    ListOlIcon: Icons.ListOlIcon,
    DocumentTextIcon: Icons.DocumentTextIcon,
    SettingsIcon: Icons.SettingsIcon,
    LogOutIcon: Icons.LogOutIcon,
    DocumentIcon: Icons.DocumentIcon,
    TrashIcon: Icons.TrashIcon,
    ClipboardListIcon: Icons.ClipboardListIcon,
    PencilIcon: Icons.PencilIcon,
    EyeIcon: Icons.EyeIcon,
    CheckIcon: Icons.CheckIcon,
    ArrowUpIcon: Icons.ArrowUpIcon,
    ArrowDownIcon: Icons.ArrowDownIcon,
    NoSymbolIcon: Icons.NoSymbolIcon,
    UploadIcon: Icons.UploadIcon,
    CalendarDaysIcon: Icons.CalendarDaysIcon,
    MenuIcon: Icons.MenuIcon,
    XMarkIcon: Icons.XMarkIcon,
    ArrowRightIcon: Icons.ArrowRightIcon,
    CheckCircleIcon: Icons.CheckCircleIcon,
    SortAscendingIcon: Icons.SortAscendingIcon,
    ExchangeIcon: Icons.ExchangeIcon,
    ClockIcon: Icons.ClockIcon,
    PrinterIcon: Icons.PrinterIcon,
    TimerIcon: Icons.TimerIcon,
    TrophyIcon: Icons.TrophyIcon,
    PlayCircleIcon: Icons.PlayCircleIcon,
    StopCircleIcon: Icons.StopCircleIcon,
    CalculatorIcon: Icons.CalculatorIcon,
    YogaIcon: Icons.YogaIcon,
    SnowflakeIcon: Icons.SnowflakeIcon,
    InfoIcon: Icons.InfoIcon,
    PieChartIcon: Icons.PieChartIcon,
    ListIcon: Icons.ListIcon,
    BellIcon: Icons.BellIcon,
};

const getIconName = (component: React.ComponentType<any>): string | undefined => 
    Object.keys(iconMap).find(key => iconMap[key] === component);

// --- INITIAL STATIC DATA ---
const staticCategories: { [key: string]: Category } = {
    work: { name: 'Work', icon: Icons.BriefcaseIcon, color: '#3B82F6' },
    personal: { name: 'Personal', icon: Icons.UserIcon, color: '#A855F7' },
    health: { name: 'Health', icon: Icons.HeartIcon, color: '#10B981' },
    workout: { name: 'Workout', icon: Icons.WorkoutIcon, color: '#F59E0B' },
    mealPrep: { name: 'Meal Prep', icon: Icons.UtensilsIcon, color: '#2DD4BF' },
};

const initialFinanceCategories: { [key: string]: TransactionCategory } = {
    foodAndDining: { name: 'Food & Dining', icon: Icons.UtensilsIcon, color: '#F87171', subCategories: ['Groceries', 'Restaurants', 'Beverages', 'Snacks', 'Meal Subscription'] },
    livingHousehold: { name: 'Living / Household', icon: Icons.HomeIcon, color: '#3B82F6', subCategories: ['Rent', 'Electricity Bill', 'Water Bill', 'Gas / Fuel', 'Internet', 'Maintenance / Repairs', 'Cleaning / Laundry', 'Household Supplies'] },
    transportation: { name: 'Transportation', icon: Icons.TravelIcon, color: '#FBBF24', subCategories: ['Public Transport', 'Taxi / Ride Share', 'Fuel', 'Parking', 'Vehicle Maintenance', 'Toll / Highway Fees'] },
    educationAndLearning: { name: 'Education & Learning', icon: Icons.BookOpenIcon, color: '#10B981', subCategories: ['Tuition Fees', 'Courses / Workshops', 'Books / Materials', 'Software / Tools', 'Stationery'] },
    entertainmentAndLeisure: { name: 'Entertainment & Leisure', icon: Icons.GiftIcon, color: '#A855F7', subCategories: ['Movies / Shows', 'Games / Toys', 'Subscriptions (Netflix, Spotify, etc.)', 'Travel / Trips', 'Parties / Events'] },
    personalElectronics: { name: 'Personal Electronics', icon: Icons.SparklesIcon, color: '#2DD4BF', subCategories: ['Mobile Phone', 'Laptop / PC', 'Accessories (Earbuds, Chargers)', 'Repairs / Maintenance', 'Apps / Subscriptions'] },
    vehicleCar: { name: 'Vehicle / Car', icon: Icons.BriefcaseIcon, color: '#F472B6', subCategories: ['Insurance', 'Fuel', 'Servicing', 'Car Wash / Detailing', 'Traffic Fines'] },
    healthAndMedical: { name: 'Health & Medical', icon: Icons.HeartIcon, color: '#EF4444', subCategories: ['Consultation Fees', 'Medicines', 'Health Insurance', 'Fitness / Gym', 'Medical Tests / Checkups'] },
    investmentAndSavings: { name: 'Investment & Savings', icon: Icons.TrendingUpIcon, color: '#34D399', subCategories: ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Crypto', 'Real Estate'] },
    miscellaneous: { name: 'Miscellaneous / Others', icon: Icons.TagIcon, color: '#60A5FA', subCategories: ['Donations / Charity', 'Gifts', 'Pet Care', 'Lending / Borrowing Money', 'Bank Fees / Transfer Charges', 'Others'] },
    income: { name: 'Income', icon: Icons.DollarSignIcon, color: '#34D399', subCategories: ['Salary', 'Freelancing', 'Investments / Dividends', 'Refunds / Returns', 'Others'] },
};

const DEFAULT_ACCOUNTS = ['Cash', 'Bank Account', 'Credit Card', 'Savings', 'Investment Account'];

const INITIAL_WORKOUTS: Workout[] = [];

const INITIAL_ROUTINE_ITEMS: RoutineItem[] = [
    { id: 't1', time: '05:30', title: 'Wake Up & Hydrate', subtitle: '300ml water, fresh up', icon: 'SunIcon', color: 'text-yellow-500 bg-yellow-500/10', details: [{ label: 'Hydration', value: '500ml water + electrolytes' }] },
    { id: 't2', time: '06:00', title: 'Morning Walk / Jog', subtitle: '45 mins', icon: 'UserIcon', color: 'text-cyan-400 bg-cyan-400/10' },
    { id: 't3', time: '06:50', title: 'Mobility & Stretching', subtitle: '15 mins', icon: 'YogaIcon', color: 'text-green-500 bg-green-500/10', details: [{ label: 'Focus', value: 'Posture & Flexibility' }] },
    { id: 't4', time: '07:30', title: 'Breakfast', subtitle: 'Eggs, PB Bread, Banana', icon: 'UtensilsIcon', color: 'text-lime-400 bg-lime-400/10', stats: [{ label: 'Energy', value: '850 kcal' }, { label: 'Protein', value: '40g' }] },
    { id: 't5', time: '08:30', title: 'Gym Session', subtitle: 'Push / Pull / Legs', icon: 'WorkoutIcon', color: 'text-red-500 bg-red-500/10' },
    { id: 't6', time: '09:50', title: 'Post Workout', subtitle: 'Creatine + Whey + Banana', icon: 'UtensilsIcon', color: 'text-blue-400 bg-blue-400/10' },
    { id: 't7', time: '10:20', title: 'Cold Shower', subtitle: '3 mins', icon: 'SnowflakeIcon', color: 'text-cyan-300 bg-cyan-300/10' },
    { id: 't8', time: '10:45', title: 'Kria Tech Work', subtitle: 'Operations & Production', icon: 'BriefcaseIcon', color: 'text-purple-500 bg-purple-500/10', details: [{ label: 'Goal', value: 'Upload 1 AI Short' }] },
    { id: 't9', time: '12:00', title: 'Study Session 1', subtitle: 'GATE - Deep Focus', icon: 'BookOpenIcon', color: 'text-indigo-400 bg-indigo-400/10', details: [{ label: '90 mins', value: 'Theory' }] },
    { id: 't10', time: '13:00', title: 'Lunch', subtitle: 'Chicken/Paneer + Rice', icon: 'UtensilsIcon', color: 'text-lime-400 bg-lime-400/10' },
    { id: 't11', time: '14:00', title: 'Power Nap', subtitle: '1 hour rest', icon: 'MoonIcon', color: 'text-gray-400 bg-gray-700/30' },
    { id: 't12', time: '15:00', title: 'Study Session 2', subtitle: 'GATE - New Topic', icon: 'BookOpenIcon', color: 'text-orange-400 bg-orange-400/10' },
    { id: 't13', time: '16:00', title: 'Kria Tech Work 2', subtitle: 'Digital Products', icon: 'BriefcaseIcon', color: 'text-purple-500 bg-purple-500/10' },
    { id: 't14', time: '17:00', title: 'Evening Snack', subtitle: 'Peanut chikki + fruit', icon: 'UtensilsIcon', color: 'text-lime-400 bg-lime-400/10' },
    { id: 't15', time: '18:30', title: 'Study Session 3', subtitle: 'Light Topics / Aptitude', icon: 'BookOpenIcon', color: 'text-blue-400 bg-blue-400/10' },
    { id: 't16', time: '20:00', title: 'Dinner', subtitle: 'Paneer/Chicken + Veggies', icon: 'UtensilsIcon', color: 'text-lime-400 bg-lime-400/10' },
    { id: 't17', time: '21:00', title: 'Wind Down', subtitle: 'Journal & Plan', icon: 'SparklesIcon', color: 'text-pink-400 bg-pink-400/10' },
    { id: 't18', time: '22:30', title: 'Sleep', subtitle: 'Non-negotiable', icon: 'MoonIcon', color: 'text-indigo-500 bg-indigo-500/10' }
];

const INITIAL_TARGET_CATEGORIES: TargetCategory[] = [
    {
        id: 'tc_fitness',
        title: 'FITNESS',
        icon: 'WorkoutIcon',
        color: 'text-red-500 bg-red-500/10',
        items: [
            { id: 'ti_walk', label: '45-min walk', type: 'auto', autoType: 'routine_task', linkedValue: 'Walk' },
            { id: 'ti_gym', label: '1 gym workout', type: 'auto', autoType: 'workout' },
            { id: 'ti_mob', label: 'Mobility', type: 'auto', autoType: 'routine_task', linkedValue: 'Mobility' },
            { id: 'ti_evening', label: 'Evening walk', type: 'manual' }
        ]
    },
    {
        id: 'tc_nutrition',
        title: 'NUTRITION',
        icon: 'UtensilsIcon',
        color: 'text-green-500 bg-green-500/10',
        items: [
            { id: 'ti_cals', label: 'Calorie Target', type: 'auto', autoType: 'calories' },
            { id: 'ti_prot', label: 'Protein Target', type: 'auto', autoType: 'protein' },
            { id: 'ti_6meals', label: '6 meals/day', type: 'manual' }
        ]
    },
    {
        id: 'tc_gate',
        title: 'GATE (5 Hrs)',
        icon: 'BookOpenIcon',
        color: 'text-blue-500 bg-blue-500/10',
        items: [
            { id: 'ti_theory', label: 'Deep focus theory block', type: 'manual' },
            { id: 'ti_topic', label: 'New topic block', type: 'manual' },
            { id: 'ti_rev', label: 'Light revision block', type: 'manual' },
            { id: 'ti_pyq', label: 'PYQs', type: 'manual' }
        ]
    },
    {
        id: 'tc_work',
        title: 'KRIA TECH',
        icon: 'BriefcaseIcon',
        color: 'text-purple-500 bg-purple-500/10',
        items: [
            { id: 'ti_ops', label: 'Ops & Production', type: 'manual' },
            { id: 'ti_dig', label: 'Digital Products', type: 'manual' },
            { id: 'ti_social', label: 'Social Media Post', type: 'manual' }
        ]
    }
];

const teamMembers: TeamMember[] = [
    { name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
    { name: 'Sam', avatarUrl: 'https://i.pravatar.cc/150?u=sam' },
    { name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/150?u=jordan' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- STATE ---
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved, (key, value) => {
            if (key === 'dueDate' || key === 'createdAt') return new Date(value);
            if (key === 'icon' && value && iconMap[value]) return iconMap[value];
            return value;
        }) : [];
    });

    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('projects');
        return saved ? JSON.parse(saved, (key, value) => key === 'dueDate' ? new Date(value) : value) : [];
    });

    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved, (key, value) => {
            if (key === 'createdAt' || key === 'history' || key === 'skips') return Array.isArray(value) ? value.map((d: string) => new Date(d)) : new Date(value);
            if (key === 'icon' && value && iconMap[value]) return iconMap[value];
            return value;
        }) : [];
    });

    const [movies, setMovies] = useState<Movie[]>(() => {
        const saved = localStorage.getItem('movies');
        return saved ? JSON.parse(saved) : [];
    });

    const [books, setBooks] = useState<Book[]>(() => {
        const saved = localStorage.getItem('books');
        return saved ? JSON.parse(saved) : [];
    });

    const [goals, setGoals] = useState<Goal[]>(() => {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved, (key, value) => key === 'dueDate' ? new Date(value) : value) : [];
    });

    const [visionBoards, setVisionBoards] = useState<VisionBoard[]>(() => {
        const saved = localStorage.getItem('visionBoards');
        return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Main Board' }];
    });

    const [visionBoardItems, setVisionBoardItems] = useState<VisionBoardItem[]>(() => {
        const saved = localStorage.getItem('visionBoardItems');
        return saved ? JSON.parse(saved) : [];
    });

    const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
        const saved = localStorage.getItem('weightEntries');
        return saved ? JSON.parse(saved, (key, value) => key === 'date' ? new Date(value) : value) : [];
    });

    const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => {
        const saved = localStorage.getItem('healthMetrics');
        return saved ? JSON.parse(saved, (key, value) => key === 'date' ? new Date(value) : value) : [];
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved, (key, value) => key === 'date' ? new Date(value) : value) : [];
    });

    const [financeCategories, setFinanceCategories] = useState<{ [key: string]: TransactionCategory }>(() => {
        const saved = localStorage.getItem('financeCategories');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Restore icons from iconMap if stored as string name
            Object.keys(parsed).forEach(key => {
                if (parsed[key].iconName && iconMap[parsed[key].iconName]) {
                    parsed[key].icon = iconMap[parsed[key].iconName];
                } else if (!parsed[key].icon) {
                     // Fallback or if default
                     if (initialFinanceCategories[key]) parsed[key].icon = initialFinanceCategories[key].icon;
                }
            });
            return parsed;
        }
        return initialFinanceCategories;
    });

    const [accounts, setAccounts] = useState<string[]>(() => {
        const saved = localStorage.getItem('accounts');
        return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    });

    const [budgets, setBudgets] = useState<{ [key: string]: number }>(() => {
        const saved = localStorage.getItem('budgets');
        return saved ? JSON.parse(saved) : {};
    });

    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
        const saved = localStorage.getItem('savingsGoals');
        return saved ? JSON.parse(saved) : [];
    });

    const [mealPlan, setMealPlan] = useState<MealPlan>(() => {
        const saved = localStorage.getItem('mealPlan');
        return saved ? JSON.parse(saved) : {};
    });

    const [mealPlannerSettings, setMealPlannerSettings] = useState<MealPlannerSettings>(() => {
        const saved = localStorage.getItem('mealPlannerSettings');
        return saved ? JSON.parse(saved) : { calorieTarget: 2000, proteinTarget: 150, dietType: 'Balanced', allergies: '' };
    });

    const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
        const saved = localStorage.getItem('pantryItems');
        return saved ? JSON.parse(saved) : [];
    });

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });

    const [notes, setNotes] = useState<Note[]>(() => {
        const saved = localStorage.getItem('lifePlannerNotes'); // Key from api.ts to sync
        return saved ? JSON.parse(saved, (key, value) => {
             if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
                return new Date(value);
            }
            return value;
        }) : [];
    });

    const [workouts, setWorkouts] = useState<Workout[]>(() => {
        const saved = localStorage.getItem('workouts');
        return saved ? JSON.parse(saved, (key, value) => (key === 'createdAt' || key === 'completedAt') ? new Date(value) : value) : INITIAL_WORKOUTS;
    });

    const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
        const saved = localStorage.getItem('personalRecords');
        return saved ? JSON.parse(saved, (key, value) => key === 'lastUpdated' ? new Date(value) : value) : [];
    });

    const [routineItems, setRoutineItems] = useState<RoutineItem[]>(() => {
        const saved = localStorage.getItem('routineItems');
        return saved ? JSON.parse(saved) : INITIAL_ROUTINE_ITEMS;
    });

    const [routineCompletion, setRoutineCompletion] = useState<RoutineCompletion>(() => {
        const saved = localStorage.getItem('routineCompletion');
        return saved ? JSON.parse(saved) : { date: new Date().toISOString().split('T')[0], completedIds: [] };
    });

    const [targetCategories, setTargetCategories] = useState<TargetCategory[]>(() => {
        const saved = localStorage.getItem('targetCategories');
        return saved ? JSON.parse(saved) : INITIAL_TARGET_CATEGORIES;
    });

    const [targetCompletion, setTargetCompletion] = useState<TargetCompletion>(() => {
        const saved = localStorage.getItem('targetCompletion');
        return saved ? JSON.parse(saved) : { date: new Date().toISOString().split('T')[0], completedItemIds: [] };
    });

    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Effects
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const processRecurringTasks = () => {
            let tasksUpdated = false;
            const newTasks = [...tasks];
            const tasksToAdd: Task[] = [];

            newTasks.forEach(task => {
                if (task.recurrence && task.recurrence !== 'None' && task.completed) {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0,0,0,0);
                    
                    if (taskDate.getTime() < today.getTime()) {
                        const nextDate = new Date(taskDate);
                        if (task.recurrence === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
                        if (task.recurrence === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
                        if (task.recurrence === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                        if (task.recurrence === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                        
                        const exists = newTasks.some(t => 
                            t.name === task.name && 
                            t.dueDate.toISOString().split('T')[0] === nextDate.toISOString().split('T')[0]
                        ) || tasksToAdd.some(t => 
                            t.name === task.name && 
                            t.dueDate.toISOString().split('T')[0] === nextDate.toISOString().split('T')[0]
                        );

                        if (!exists) {
                            const newTask: Task = {
                                ...task,
                                id: `t-${Date.now()}-${Math.random()}`,
                                dueDate: nextDate,
                                completed: false,
                                createdAt: new Date(),
                            };
                            tasksToAdd.push(newTask);
                            task.recurrence = 'None'; 
                            tasksUpdated = true;
                        }
                    }
                }
            });

            if (tasksUpdated || tasksToAdd.length > 0) {
                const finalTasks = [...newTasks, ...tasksToAdd];
                setTasks(finalTasks);
                localStorage.setItem('tasks', JSON.stringify(finalTasks));
                
                if (tasksToAdd.length > 0) {
                    addNotification({
                        type: 'info',
                        message: `${tasksToAdd.length} recurring tasks created for today.`,
                    });
                }
            }
        };

        const generateNotifications = () => {
            const newNotifs: Notification[] = [];
            const overdueCount = tasks.filter(t => !t.completed && t.dueDate < today).length;
            if (overdueCount > 0) {
                newNotifs.push({
                    id: `notif-overdue-${Date.now()}`,
                    type: 'alert',
                    message: `You have ${overdueCount} overdue tasks!`,
                    date: new Date(),
                    read: false,
                    link: 'todo'
                });
            }
            if (newNotifs.length > 0) {
                setNotifications(prev => [...newNotifs, ...prev]);
            }
        };

        processRecurringTasks();
        generateNotifications();

    }, []); 

    useEffect(() => localStorage.setItem('tasks', JSON.stringify(tasks)), [tasks]);
    useEffect(() => localStorage.setItem('projects', JSON.stringify(projects)), [projects]);
    useEffect(() => {
        const habitsToSave = habits.map(h => ({ ...h, icon: undefined, iconName: getIconName(h.icon) }));
        localStorage.setItem('habits', JSON.stringify(habitsToSave));
    }, [habits]);
    
    useEffect(() => localStorage.setItem('movies', JSON.stringify(movies)), [movies]);
    useEffect(() => localStorage.setItem('books', JSON.stringify(books)), [books]);
    useEffect(() => localStorage.setItem('goals', JSON.stringify(goals)), [goals]);
    useEffect(() => localStorage.setItem('visionBoards', JSON.stringify(visionBoards)), [visionBoards]);
    useEffect(() => localStorage.setItem('visionBoardItems', JSON.stringify(visionBoardItems)), [visionBoardItems]);
    useEffect(() => localStorage.setItem('weightEntries', JSON.stringify(weightEntries)), [weightEntries]);
    useEffect(() => localStorage.setItem('healthMetrics', JSON.stringify(healthMetrics)), [healthMetrics]);
    useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
    useEffect(() => localStorage.setItem('budgets', JSON.stringify(budgets)), [budgets]);
    useEffect(() => localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals)), [savingsGoals]);
    useEffect(() => localStorage.setItem('mealPlan', JSON.stringify(mealPlan)), [mealPlan]);
    useEffect(() => localStorage.setItem('mealPlannerSettings', JSON.stringify(mealPlannerSettings)), [mealPlannerSettings]);
    useEffect(() => localStorage.setItem('pantryItems', JSON.stringify(pantryItems)), [pantryItems]);
    useEffect(() => localStorage.setItem('workouts', JSON.stringify(workouts)), [workouts]);
    useEffect(() => localStorage.setItem('personalRecords', JSON.stringify(personalRecords)), [personalRecords]);
    useEffect(() => localStorage.setItem('routineItems', JSON.stringify(routineItems)), [routineItems]);
    useEffect(() => localStorage.setItem('routineCompletion', JSON.stringify(routineCompletion)), [routineCompletion]);
    useEffect(() => localStorage.setItem('targetCategories', JSON.stringify(targetCategories)), [targetCategories]);
    useEffect(() => localStorage.setItem('targetCompletion', JSON.stringify(targetCompletion)), [targetCompletion]);
    
    useEffect(() => {
        const categoriesToSave = Object.entries(financeCategories).reduce((acc, [key, catVal]) => {
            const cat = catVal as TransactionCategory;
            acc[key] = { ...cat, icon: undefined, iconName: getIconName(cat.icon) };
            return acc;
        }, {} as any);
        localStorage.setItem('financeCategories', JSON.stringify(categoriesToSave));
    }, [financeCategories]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') document.body.classList.remove('light-mode');
        else document.body.classList.add('light-mode');
    }, [theme]);

    // --- ACTIONS ---
    const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
        setNotifications(prev => [{
            ...notif,
            id: `n-${Date.now()}-${Math.random()}`,
            date: new Date(),
            read: false
        }, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const saveTask = (task: Task) => {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };
    
    const addTask = (task: Task) => {
        setTasks(prev => [task, ...prev]);
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const saveProject = (projectData: Omit<Project, 'id' | 'progress' | 'theme' | 'team'> | Project, team: TeamMember[]) => {
        if ('id' in projectData) {
            setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));
        } else {
            const newProject: Project = {
                ...projectData,
                id: `proj-${Date.now()}`,
                progress: 0,
                theme: { gradientFrom: 'from-purple-500', gradientTo: 'to-indigo-600', progressBg: 'bg-white' },
                team: team
            };
            setProjects(prev => [...prev, newProject]);
        }
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        setTasks(prev => prev.filter(t => t.projectId !== id));
    };

    const saveHabit = (habit: Habit) => {
        if (habits.find(h => h.id === habit.id)) {
            setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
        } else {
            setHabits(prev => [...prev, { ...habit, id: `habit-${Date.now()}` }]);
        }
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const saveMovie = (movie: Omit<Movie, 'id'> | Movie) => {
        if ('id' in movie) {
            setMovies(prev => prev.map(m => m.id === movie.id ? movie as Movie : m));
        } else {
            setMovies(prev => [...prev, { ...movie, id: `mov-${Date.now()}` }]);
        }
    };

    const saveBook = (book: Omit<Book, 'id'> | Book) => {
        if ('id' in book) {
            setBooks(prev => prev.map(b => b.id === book.id ? book as Book : b));
        } else {
            setBooks(prev => [...prev, { ...book, id: `book-${Date.now()}` }]);
        }
    };
    
    const deleteBook = (id: string) => {
        setBooks(prev => prev.filter(b => b.id !== id));
    };

    const saveGoal = (goal: Omit<Goal, 'id' | 'subTasks'> | Goal) => {
        if ('id' in goal) {
            setGoals(prev => prev.map(g => g.id === goal.id ? goal as Goal : g));
        } else {
            setGoals(prev => [...prev, { ...goal, id: `goal-${Date.now()}`, subTasks: [] }]);
        }
    };
    
    const deleteGoal = (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const addVisionBoard = (name: string) => {
        setVisionBoards(prev => [...prev, { id: `vb-${Date.now()}`, name }]);
    };

    const deleteVisionBoard = (id: string) => {
        if (id === 'default' || visionBoards.length <= 1) return;
        setVisionBoards(prev => prev.filter(b => b.id !== id));
        setVisionBoardItems(prev => prev.filter(i => i.boardId !== id));
    };

    const addVisionBoardItem = (item: Omit<VisionBoardItem, 'id'>) => {
        setVisionBoardItems(prev => [...prev, { ...item, id: `vbi-${Date.now()}` }]);
    };

    const updateVisionBoardItem = (item: VisionBoardItem) => {
        setVisionBoardItems(prev => prev.map(i => i.id === item.id ? item : i));
    };

    const deleteVisionBoardItem = (id: string) => {
        setVisionBoardItems(prev => prev.filter(i => i.id !== id));
    };

    const addVisionBoardImage = (item: Omit<VisionBoardItem, 'id'>) => addVisionBoardItem({ ...item, type: 'image' });
    const deleteVisionBoardImage = deleteVisionBoardItem;
    const updateVisionBoardImage = updateVisionBoardItem;

    const addWeightEntry = (entry: WeightEntry) => {
        setWeightEntries(prev => [...prev, entry].sort((a, b) => a.date.getTime() - b.date.getTime()));
    };

    const updateWeightEntry = (index: number, weight: number) => {
        setWeightEntries(prev => {
            const newEntries = [...prev];
            newEntries[index] = { ...newEntries[index], weight };
            return newEntries;
        });
    };

    const deleteWeightEntry = (index: number) => {
        setWeightEntries(prev => prev.filter((_, i) => i !== index));
    };

    const saveHealthMetric = (metric: HealthMetric) => {
        setHealthMetrics(prev => {
            const existing = prev.findIndex(m => m.date.toLocaleDateString() === metric.date.toLocaleDateString());
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = metric;
                return updated;
            }
            return [...prev, metric];
        });
    };

    const saveTransaction = (transaction: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transaction) {
            setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction as Transaction : t));
        } else {
            setTransactions(prev => [...prev, { ...transaction, id: `trx-${Date.now()}` }]);
        }
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const saveBudgets = (newBudgets: { [key: string]: number }) => {
        setBudgets(newBudgets);
    };

    const saveFinanceCategories = (newCategories: { [key: string]: TransactionCategory }) => {
        setFinanceCategories(newCategories);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').slice(1);
            const newTransactions: Transaction[] = [];
            
            lines.forEach(line => {
                if (!line.trim()) return;
                const [dateStr, desc, amountStr, typeStr] = line.split(',');
                const type = typeStr?.trim().toLowerCase() === 'income' ? 'income' : 'expense';
                
                newTransactions.push({
                    id: `csv-${Date.now()}-${Math.random()}`,
                    date: new Date(dateStr),
                    description: desc || 'Imported Transaction',
                    amount: parseFloat(amountStr) || 0,
                    type: type,
                    category: 'miscellaneous', 
                    account: 'Bank Account', 
                    frequency: 'Once',
                    includeInAccountTotal: true
                });
            });
            setTransactions(prev => [...prev, ...newTransactions]);
        };
        reader.readAsText(file);
    };

    const addAccount = (name: string) => {
        if (!accounts.includes(name)) setAccounts(prev => [...prev, name]);
    };

    const deleteAccount = (name: string) => {
        setAccounts(prev => prev.filter(a => a !== name));
    };

    const saveSavingsGoal = (goal: Omit<SavingsGoal, 'id'> | SavingsGoal) => {
        if ('id' in goal) {
            setSavingsGoals(prev => prev.map(g => g.id === goal.id ? goal as SavingsGoal : g));
        } else {
            setSavingsGoals(prev => [...prev, { ...goal, id: `sg-${Date.now()}` }]);
        }
    };

    const deleteSavingsGoal = (id: string) => {
        setSavingsGoals(prev => prev.filter(g => g.id !== id));
    };

    const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
        setPantryItems(prev => [...prev, { ...item, id: `pantry-${Date.now()}` }]);
    };

    const deletePantryItem = (id: string) => {
        setPantryItems(prev => prev.filter(i => i.id !== id));
    };

    const updatePersonalRecord = (pr: PersonalRecord) => {
        setPersonalRecords(prev => {
            const idx = prev.findIndex(p => p.id === pr.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...pr, lastUpdated: new Date() };
                return updated;
            }
            return [...prev, { ...pr, id: `pr-${Date.now()}`, lastUpdated: new Date() }];
        });
    };

    const deletePersonalRecord = (id: string) => {
        setPersonalRecords(prev => prev.filter(p => p.id !== id));
    };

    const saveRoutineItem = (item: Omit<RoutineItem, 'id'> | RoutineItem) => {
        if ('id' in item) {
            setRoutineItems(prev => prev.map(i => i.id === item.id ? item as RoutineItem : i));
        } else {
            setRoutineItems(prev => [...prev, { ...item, id: `ri-${Date.now()}` }]);
        }
    };

    const deleteRoutineItem = (id: string) => {
        setRoutineItems(prev => prev.filter(i => i.id !== id));
    };

    const toggleRoutineItemCompletion = (id: string) => {
        setRoutineCompletion(prev => {
            const today = new Date().toISOString().split('T')[0];
            let currentCompleted = prev.date === today ? prev.completedIds : [];
            
            if (currentCompleted.includes(id)) {
                currentCompleted = currentCompleted.filter(i => i !== id);
            } else {
                currentCompleted = [...currentCompleted, id];
            }
            
            return { date: today, completedIds: currentCompleted };
        });
    };

    const saveTargetCategory = (category: Omit<TargetCategory, 'id'> | TargetCategory) => {
        if ('id' in category) {
            setTargetCategories(prev => prev.map(c => c.id === category.id ? category as TargetCategory : c));
        } else {
            setTargetCategories(prev => [...prev, { ...category, id: `tc-${Date.now()}` }]);
        }
    };

    const deleteTargetCategory = (id: string) => {
        setTargetCategories(prev => prev.filter(c => c.id !== id));
    };

    const toggleTargetItem = (itemId: string) => {
        setTargetCompletion(prev => {
            const today = new Date().toISOString().split('T')[0];
            let current = prev.date === today ? prev.completedItemIds : [];
            
            if (current.includes(itemId)) current = current.filter(i => i !== itemId);
            else current = [...current, itemId];
            
            return { date: today, completedItemIds: current };
        });
    };

    return (
        <DataContext.Provider value={{
            tasks, setTasks, projects, habits, setHabits, movies, setMovies, books, setBooks, goals, setGoals, visionBoards, setVisionBoards, visionBoardItems, setVisionBoardItems, weightEntries, setWeightEntries, healthMetrics, setHealthMetrics, transactions, setTransactions, financeCategories, setFinanceCategories, accounts, setAccounts, savingsGoals, setSavingsGoals, budgets, setBudgets, mealPlan, setMealPlan, mealPlannerSettings, setMealPlannerSettings, pantryItems, setPantryItems, theme, setTheme, toggleTheme, notes, workouts, setWorkouts, personalRecords, setPersonalRecords, routineItems, setRoutineItems, routineCompletion, setRoutineCompletion, targetCategories, setTargetCategories, targetCompletion, setTargetCompletion, notifications, setNotifications,
            saveTask, addTask, deleteTask, saveProject, deleteProject, saveHabit, deleteHabit, saveMovie, saveBook, deleteBook, saveGoal, deleteGoal,
            addVisionBoard, deleteVisionBoard, addVisionBoardItem, updateVisionBoardItem, deleteVisionBoardItem, 
            addVisionBoardImage, deleteVisionBoardImage, updateVisionBoardImage,
            visionBoardImages: visionBoardItems,
            addWeightEntry, updateWeightEntry, deleteWeightEntry, saveHealthMetric, saveTransaction, deleteTransaction, saveBudgets, saveFinanceCategories, parseCSV,
            categories: staticCategories, team: teamMembers, addAccount, deleteAccount, saveSavingsGoal, deleteSavingsGoal,
            saveMealPlan: setMealPlan, addPantryItem, deletePantryItem, saveMealPlannerSettings: setMealPlannerSettings, updatePersonalRecord, deletePersonalRecord,
            saveRoutineItem, deleteRoutineItem, toggleRoutineItemCompletion, saveTargetCategory, deleteTargetCategory, toggleTargetItem,
            markNotificationRead, clearAllNotifications
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
