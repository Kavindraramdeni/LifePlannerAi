
import React from 'react';

export interface Category {
  name: string;
  // Broaden the icon component type to accept any valid SVG props.
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export type KanbanColumnStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export interface Task {
  id: string;
  name: string;
  dueDate: Date;
  completed: boolean;
  category: Category;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  projectId?: string;
  recurrence?: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  status?: KanbanColumnStatus; // For Kanban board logic
  tags?: string[];
}

export interface ProjectTheme {
  gradientFrom: string;
  gradientTo: string;
  progressBg: string;
}

export interface TeamMember {
  name: string;
  avatarUrl: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  progress: number;
  theme: ProjectTheme;
  team: TeamMember[];
}

export interface Meal {
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    notes?: string;
}

export interface MealPlan {
    [day: string]: {
        breakfast?: Meal;
        lunch?: Meal;
        dinner?: Meal;
    };
}

export interface MealPlannerSettings {
    calorieTarget: number;
    proteinTarget: number;
    dietType: string;
    allergies: string;
}

export interface PantryItem {
    id: string;
    name: string;
    quantity: string;
    category: 'Produce' | 'Dairy' | 'Protein' | 'Grains' | 'Spices' | 'Other';
}

export interface TransactionCategory {
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    subCategories: string[];
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category: string;
    subCategory?: string;
    description: string;
    date: Date;
    notes?: string;
    countsTowardsBudget?: boolean;
    account: string;
    toAccount?: string; // For transfers
    frequency: 'Once' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    includeInAccountTotal: boolean;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
    icon: string; // Icon key name
}

export type HabitFrequencyType = 'daily' | 'specific_days' | 'times_per_week';

export interface Habit {
    id: string;
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    goal: number; // e.g. 30 for a 30-day goal
    bestStreak: number;
    history: Date[]; // Array of completion dates
    skips?: Date[]; // Array of skipped dates
    createdAt: Date;
    frequencyConfig?: {
        type: HabitFrequencyType;
        days?: number[]; // 0-6 for specific_days
        count?: number; // for times_per_week
    };
    reminderTime?: string; // "HH:MM" 24h format
}

export interface Note {
    id: string;
    title: string;
    content: string; // HTML content
    tags: string[];
    category: string;
    lastUpdated: Date;
    isPinned?: boolean;
}

export interface Movie {
    id: string;
    title: string;
    type: 'Movie' | 'Series';
    posterUrl: string;
    status: 'Watchlist' | 'Watching' | 'Watched';
}

export interface SubTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    category: string;
    dueDate?: Date;
    subTasks: SubTask[];
}

export interface VisionBoard {
    id: string;
    name: string;
}

export interface VisionBoardItem {
    id: string;
    boardId: string;
    type: 'image' | 'note' | 'link';
    content: string; // Image URL, Note text, or Link URL
    x: number;
    y: number;
    width: number;
    height?: number;
    color?: string; // For sticky notes
}

// Backwards compatibility alias
export type VisionBoardImage = VisionBoardItem;

export interface WeightEntry {
    date: Date;
    weight: number;
}

export interface HealthMetric {
    date: Date;
    water: number; // glasses
    sleep: number; // hours
    mood: string; // emoji
    steps: number;
}

export interface Book {
    id:string;
    title: string;
    author: string;
    coverUrl: string;
    status: 'To Read' | 'Reading' | 'Read';
}

export interface TravelActivity {
    id: string;
    time: string;
    activity: string;
    location: string;
    notes: string;
}

export interface TripDay {
    day: string;
    activities: TravelActivity[];
}

export interface TripPlan {
    id: string;
    destination: string;
    duration: number;
    interests: string;
    itinerary: TripDay[];
}

export interface WorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: string; // string to allow "8-12" or "Failure"
    weight: string; // string to allow "BW" or "20kg"
}

export interface Workout {
    id: string;
    name: string;
    content: string; // Markdown content (Legacy or simple)
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
    notes?: string; // For log notes after workout
    day?: string; // Day of the week (e.g., 'Monday')
    exercises?: WorkoutExercise[]; // Structured data
}

export interface PersonalRecord {
    id: string;
    name: string;
    weight: number;
    unit: 'kg' | 'lbs' | 'reps';
    lastUpdated: Date;
}

export interface KanbanTask {
  id: string;
  title: string;
  status: KanbanColumnStatus;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  assignees: TeamMember[];
  color: 'backlog' | 'progress-orange' | 'progress-purple' | 'done' | 'archived';
}

export interface RoutineItem {
    id: string;
    time: string;
    title: string;
    subtitle?: string;
    icon: string; // String key for icon lookup
    color: string;
    details?: Array<{ label: string; value: string }>;
    stats?: Array<{ label: string; value: string; color?: string }>;
}

export interface RoutineCompletion {
    date: string; // YYYY-MM-DD
    completedIds: string[];
}

export type TargetAutoType = 'workout' | 'calories' | 'protein' | 'routine_task' | 'habit_count';

export interface TargetItem {
    id: string;
    label: string;
    type: 'manual' | 'auto';
    autoType?: TargetAutoType; 
    linkedValue?: string; // e.g., "Walk" for routine_task, "2000" for calories target override
}

export interface TargetCategory {
    id: string;
    title: string;
    icon: string;
    color: string;
    items: TargetItem[];
}

export interface TargetCompletion {
    date: string; // YYYY-MM-DD
    completedItemIds: string[]; // IDs of manual items completed today
}

export interface Notification {
    id: string;
    type: 'alert' | 'info' | 'success';
    message: string;
    link?: string;
    date: Date;
    read: boolean;
}
