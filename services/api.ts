import { Note } from '../types';

const NOTES_KEY = 'lifePlannerNotes';

// The initial data is now a fallback if localStorage is empty.
const initialNotes: Note[] = [
    { id: 'n1', title: 'Home Assistant automations', content: '<div>- Google Calendar - Hot weather warning</div>', tags: ['work'], category: 'Work', lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { id: 'n2', title: 'Explorer Notes: The Island', content: '<div>| Type | Topic | Author | Lat | Lon | Location |<br>|---|---|---|---|---|---|<br>|...|...|...|...|...|...|</div>', tags: ['ark'], category: 'Personal', lastUpdated: new Date(Date.now() - 21 * 60 * 60 * 1000) },
    { id: 'n3', title: 'Guided Learning notes', content: '<div>Lots of metaphors and questions. I found this a bit frustrating. I\'m autistic, so while I understand...</div>', tags: ['work', 'learning'], category: 'Work', lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    { id: 'n4', title: 'Meeting Notes: Project Kickoff', content: '<div><strong>Date:</strong> Oct 25th<br><strong>Attendees:</strong> Mike, Sarah<br><ul><li>Defined core MVP features</li><li>Agreed on timeline</li></ul></div>', tags: ['work', 'meeting'], category: 'Work', lastUpdated: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 'n5', title: 'Grocery List Ideas', content: '<div><ul><li>Almond milk</li><li>Spinach</li><li>Protein powder</li><li>Bananas</li></ul></div>', tags: ['personal'], category: 'Personal', lastUpdated: new Date(Date.now() - 5 * 24 * 3600 * 1000) }
];

const dateReviver = (key: string, value: any) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
        return new Date(value);
    }
    return value;
};

const getNotesFromStorage = (): Note[] => {
    try {
        const notesJSON = localStorage.getItem(NOTES_KEY);
        if (notesJSON) {
            return JSON.parse(notesJSON, dateReviver);
        }
    } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
    }
    // If nothing in storage or parsing fails, set initial data
    localStorage.setItem(NOTES_KEY, JSON.stringify(initialNotes));
    return initialNotes;
};

const saveNotesToStorage = (notes: Note[]) => {
    try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error("Failed to save notes to localStorage", error);
    }
};

let notes: Note[] = getNotesFromStorage();

// This function simulates network latency
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Fetches all notes.
 */
export const getNotes = async (): Promise<Note[]> => {
    await simulateDelay(200); // Shorter delay as it's local
    notes = getNotesFromStorage();
    const sortedNotes = [...notes].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    return sortedNotes;
};

/**
 * Saves an existing note.
 * @param updatedNote The note object with updated content.
 */
export const saveNote = async (updatedNote: Note): Promise<Note> => {
    await simulateDelay(100);
    const index = notes.findIndex(n => n.id === updatedNote.id);
    const noteToSave = { ...updatedNote, lastUpdated: new Date() };
    if (index !== -1) {
        notes[index] = noteToSave;
        saveNotesToStorage(notes);
        return { ...noteToSave };
    }
    throw new Error("Note not found");
};

type NewNoteData = Omit<Note, 'id' | 'lastUpdated'>;

/**
 * Creates a new note.
 * @param noteData The data for the new note.
 */
export const createNote = async (noteData: NewNoteData): Promise<Note> => {
    await simulateDelay(100);
    const newNote: Note = {
        ...noteData,
        id: `n${Date.now()}`,
        lastUpdated: new Date()
    };
    notes.unshift(newNote);
    saveNotesToStorage(notes);
    return { ...newNote };
};

/**
 * Deletes a note by its ID.
 * @param noteId The ID of the note to delete.
 */
export const deleteNote = async (noteId: string): Promise<void> => {
    await simulateDelay(100);
    const index = notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
        notes.splice(index, 1);
        saveNotesToStorage(notes);
        return;
    }
    throw new Error("Note not found for deletion");
};