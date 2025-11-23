
import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types';
import { ArrowLeftIcon, BoldIcon, ItalicIcon, ListUlIcon, ListOlIcon, ImageIcon, TrashIcon, EyeIcon, PencilIcon, CheckIcon, CheckSquareIcon, SparklesIcon } from './icons';
import Markdown from 'react-markdown';
import TurndownService from 'turndown';

interface NoteEditorProps {
    note: Note;
    onSave: (note: Note) => Promise<void> | void;
    onBack: () => void;
    onDelete: (noteId: string) => Promise<void> | void;
}

// Wrapper for CheckSquareIcon to satisfy EditorButton props
const ChecklistIcon: React.FC<{ className?: string }> = (props) => (
    <CheckSquareIcon isChecked={true} {...props} />
);

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onBack, onDelete }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [tags, setTags] = useState(note.tags.join(', '));
    const [isPinned, setIsPinned] = useState(note.isPinned || false);
    
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    // Slash Command State
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
    const [slashFilter, setSlashFilter] = useState('');
    
    const editorRef = useRef<HTMLDivElement>(null);
    const turndownServiceRef = useRef(new TurndownService());
    const autoSaveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = content;
        }
    }, []); 

    useEffect(() => {
        if (title === note.title && content === note.content && tags === note.tags.join(', ') && isPinned === note.isPinned) return;
        setSaveStatus('idle');
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = window.setTimeout(() => {
            setSaveStatus('saving');
            handleSave();
        }, 2000);
        return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
    }, [title, content, tags, isPinned]);

    const handleContentChange = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        await onSave({
            ...note,
            title,
            content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            isPinned,
            lastUpdated: new Date(),
        });
        setIsSaving(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            setIsSaving(true);
            await onDelete(note.id);
        }
    };

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    };
    
    const insertImage = () => {
        const url = prompt('Enter image URL:');
        if (url) applyFormat('insertHTML', `<img src="${url}" alt="note image" class="rounded-lg my-2 max-w-full" />`);
    };

    // Slash Command Logic
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '/') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Calculate position relative to viewport, might need adjustment if editor scrolls
                setSlashMenuPos({ top: rect.bottom + 5, left: rect.left });
                setShowSlashMenu(true);
                setSlashFilter('');
            }
        } else if (showSlashMenu) {
            if (e.key === 'Escape') {
                setShowSlashMenu(false);
            } else if (e.key === 'Enter') {
                // Handle selection in menu (if we added arrow key nav)
                e.preventDefault();
                // For now, simple enter closes or selects first
                executeCommand('heading1'); // Default
            } else if (e.key.length === 1) {
                // Typing filter
                setSlashFilter(prev => prev + e.key);
            }
        }
    };

    const executeCommand = (type: string) => {
        // Remove the slash and filter text first.
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
             // Remove the '/' character before inserting
             const text = selection.anchorNode.textContent || '';
             if (text.endsWith('/' + slashFilter)) {
                 selection.anchorNode.textContent = text.slice(0, - (1 + slashFilter.length));
             }
        }

        switch(type) {
            case 'h1': applyFormat('formatBlock', 'H1'); break;
            case 'h2': applyFormat('formatBlock', 'H2'); break;
            case 'ul': applyFormat('insertUnorderedList'); break;
            case 'ol': applyFormat('insertOrderedList'); break;
            case 'check': applyFormat('insertHTML', `<div class="flex items-center gap-2 my-1"><input type="checkbox" class="custom-checkbox"> <span>New item</span></div>`); break;
            case 'code': applyFormat('insertHTML', `<pre class="bg-dark-bg p-3 rounded-lg font-mono text-sm my-2"><code></code></pre>`); break;
            case 'image': insertImage(); break;
        }
        setShowSlashMenu(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <button onClick={onBack} className="flex items-center text-dark-text-secondary hover:text-dark-text">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </button>
                <div className="flex items-center space-x-4">
                    <SaveStatusIndicator status={saveStatus} />
                    <button 
                        onClick={() => setIsPinned(!isPinned)} 
                        className={`p-2 rounded-lg transition-colors ${isPinned ? 'text-dark-purple bg-dark-purple/10' : 'text-dark-text-secondary hover:bg-dark-accent'}`}
                        title={isPinned ? "Unpin Note" : "Pin Note"}
                    >
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleDelete} disabled={isSaving} className="p-2 text-project-red-from hover:bg-project-red-from/10 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-dark-blue text-white font-semibold rounded-lg disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
            <div className="bg-dark-card rounded-2xl flex-1 p-6 flex flex-col relative">
                <div className="flex justify-between items-start mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note Title"
                        className="bg-transparent text-3xl font-bold focus:outline-none text-dark-text flex-1"
                    />
                    <button 
                        onClick={() => setViewMode(prev => prev === 'editor' ? 'preview' : 'editor')} 
                        className="p-2 rounded-lg bg-dark-accent text-dark-text-secondary hover:text-dark-text ml-4"
                        title={viewMode === 'editor' ? 'Switch to Reading Mode' : 'Switch to Edit Mode'}
                    >
                        {viewMode === 'editor' ? <EyeIcon className="w-5 h-5"/> : <PencilIcon className="w-5 h-5"/>}
                    </button>
                </div>

                {viewMode === 'editor' && (
                    <div className="flex items-center space-x-2 bg-dark-accent p-2 rounded-lg mb-4 flex-shrink-0 flex-wrap gap-y-2">
                        <EditorButton onClick={() => applyFormat('bold')} icon={BoldIcon} title="Bold" />
                        <EditorButton onClick={() => applyFormat('italic')} icon={ItalicIcon} title="Italic" />
                        <button onClick={() => applyFormat('hiliteColor', '#FBBF24')} className="p-2 rounded-md hover:bg-dark-card text-dark-text-secondary hover:text-yellow-400 font-bold" title="Highlight">H</button>
                        <div className="border-l border-dark-border h-5 mx-1"></div>
                        <EditorButton onClick={() => applyFormat('insertUnorderedList')} icon={ListUlIcon} title="Bullet List" />
                        <EditorButton onClick={() => applyFormat('insertOrderedList')} icon={ListOlIcon} title="Numbered List" />
                        <EditorButton onClick={() => executeCommand('check')} icon={ChecklistIcon} title="Checklist" />
                        <div className="border-l border-dark-border h-5 mx-1"></div>
                        <EditorButton onClick={insertImage} icon={ImageIcon} title="Insert Image" />
                    </div>
                )}
                
                {viewMode === 'editor' ? (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleContentChange}
                        onKeyUp={handleKeyDown}
                        className="flex-1 overflow-y-auto focus:outline-none prose prose-invert max-w-none prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 outline-none"
                    />
                ) : (
                    <div className="flex-1 overflow-y-auto prose prose-invert max-w-none">
                        <Markdown>{turndownServiceRef.current.turndown(content)}</Markdown>
                    </div>
                )}

                 <div className="mt-4 flex-shrink-0">
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (comma, separated)"
                        className="w-full bg-dark-accent p-2 rounded-lg text-sm text-dark-text"
                    />
                </div>

                {/* Slash Menu */}
                {showSlashMenu && (
                    <div 
                        className="fixed z-50 bg-dark-accent border border-dark-border rounded-lg shadow-xl w-48 overflow-hidden"
                        style={{ top: slashMenuPos.top, left: slashMenuPos.left }}
                    >
                        <div className="p-2 text-xs text-dark-text-secondary border-b border-dark-border">Basic Blocks</div>
                        <button onClick={() => executeCommand('h1')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center"><span className="font-bold mr-2">H1</span> Heading 1</button>
                        <button onClick={() => executeCommand('h2')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center"><span className="font-bold mr-2">H2</span> Heading 2</button>
                        <button onClick={() => executeCommand('ul')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center"><ListUlIcon className="w-4 h-4 mr-2"/> Bullet List</button>
                        <button onClick={() => executeCommand('check')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center"><CheckSquareIcon isChecked={true} className="w-4 h-4 mr-2"/> Checklist</button>
                        <button onClick={() => executeCommand('code')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center font-mono"><span className="mr-2">{'<>'}</span> Code Block</button>
                        <button onClick={() => executeCommand('image')} className="w-full text-left px-3 py-2 hover:bg-dark-card text-sm flex items-center"><ImageIcon className="w-4 h-4 mr-2"/> Image</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EditorButton: React.FC<{onClick: () => void, icon: React.ComponentType<{className?: string}>, title?: string}> = ({onClick, icon: Icon, title}) => (
    <button onClick={onClick} className="p-2 rounded-md hover:bg-dark-card text-dark-text-secondary hover:text-dark-text" title={title}>
        <Icon className="w-5 h-5" />
    </button>
);

const SaveStatusIndicator: React.FC<{ status: 'idle' | 'saving' | 'saved' }> = ({ status }) => {
    if (status === 'saving') return <span className="text-sm text-dark-text-secondary animate-pulse">Saving...</span>;
    if (status === 'saved') return <span className="text-sm text-green-500 flex items-center"><CheckIcon className="w-4 h-4 mr-1" /> Saved</span>;
    return null;
};

export default NoteEditor;
