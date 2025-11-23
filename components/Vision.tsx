
import React, { useState, useRef, useEffect } from 'react';
import { VisionBoardItem } from '../types';
import ViewWrapper from './ViewWrapper';
import { PlusIcon, ImageIcon, TrashIcon, UploadIcon, MoreVerticalIcon, DocumentTextIcon, ArrowLeftIcon, PencilIcon } from './icons';
import { useData } from '../contexts/DataContext';

const Vision: React.FC = () => {
    const { visionBoards, addVisionBoard, deleteVisionBoard, visionBoardItems, addVisionBoardItem, deleteVisionBoardItem, updateVisionBoardItem } = useData();
    const [activeBoardId, setActiveBoardId] = useState<string>('default');
    
    // Modal States
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemType, setItemType] = useState<'image' | 'note' | 'link'>('image');
    const [itemContent, setItemContent] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    // Canvas Drag State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [localItems, setLocalItems] = useState<VisionBoardItem[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync local items when board changes or global items update
    useEffect(() => {
        setLocalItems(visionBoardItems.filter(i => i.boardId === activeBoardId));
    }, [visionBoardItems, activeBoardId]);

    // Determine active board name safely
    const activeBoard = visionBoards.find(b => b.id === activeBoardId) || { id: 'default', name: 'Main Board' };

    // --- HANDLERS ---

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setNewImageFile(file);
        }
    };

    const handleSaveItem = () => {
        if (itemType === 'image') {
            if (newImageFile) {
                const reader = new FileReader();
                reader.onload = () => {
                    addVisionBoardItem({
                        boardId: activeBoardId,
                        type: 'image',
                        content: reader.result as string,
                        x: 50 + Math.random() * 50,
                        y: 50 + Math.random() * 50,
                        width: 200
                    });
                    closeItemModal();
                };
                reader.readAsDataURL(newImageFile);
            } else if (itemContent) {
                // URL input
                addVisionBoardItem({
                    boardId: activeBoardId,
                    type: 'image',
                    content: itemContent,
                    x: 50, y: 50, width: 200
                });
                closeItemModal();
            }
        } else {
            if (!itemContent.trim()) return;
            addVisionBoardItem({
                boardId: activeBoardId,
                type: itemType,
                content: itemContent,
                x: 50, y: 50, width: 200,
                color: itemType === 'note' ? '#FEF3C7' : undefined // Yellow sticky note default
            });
            closeItemModal();
        }
    };

    const closeItemModal = () => {
        setIsItemModalOpen(false);
        setItemContent('');
        setNewImageFile(null);
        setItemType('image');
    };

    const handleCreateBoard = () => {
        if (newBoardName.trim()) {
            addVisionBoard(newBoardName.trim());
            setNewBoardName('');
            setIsBoardModalOpen(false);
        }
    };

    // --- CANVAS INTERACTIONS ---
    const handleMouseDown = (e: React.MouseEvent, id: string, action: 'move' | 'resize') => {
        e.stopPropagation();
        if (action === 'move') {
            const item = localItems.find(i => i.id === id);
            if (item) {
                setDraggingId(id);
                setDragOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
            }
        } else {
            setResizingId(id);
        }
    };

    const onCanvasMouseMove = (e: React.MouseEvent) => {
        if (draggingId) {
            setLocalItems(prev => prev.map(i => i.id === draggingId ? { ...i, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : i));
        }
        if (resizingId) {
            setLocalItems(prev => prev.map(i => {
                if (i.id === resizingId) {
                    return { ...i, width: Math.max(100, e.clientX - i.x) };
                }
                return i;
            }));
        }
    };

    const onCanvasMouseUp = () => {
        if (draggingId) {
            const item = localItems.find(i => i.id === draggingId);
            if (item) updateVisionBoardItem(item);
        }
        if (resizingId) {
            const item = localItems.find(i => i.id === resizingId);
            if (item) updateVisionBoardItem(item);
        }
        setDraggingId(null);
        setResizingId(null);
    };

    return (
    <ViewWrapper title="Vision Board" onBack={() => {}}>
        {/* Item Modal */}
        {isItemModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeItemModal}>
                <div className="bg-dark-card w-full max-w-md p-6 rounded-2xl border border-dark-border" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">Add to Board</h3>
                    
                    <div className="flex space-x-2 mb-4 bg-dark-accent p-1 rounded-lg">
                        {['image', 'note', 'link'].map(t => (
                            <button key={t} onClick={() => setItemType(t as any)} className={`flex-1 py-2 text-sm font-semibold capitalize rounded-md ${itemType === t ? 'bg-dark-card shadow text-dark-text' : 'text-dark-text-secondary'}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {itemType === 'image' && (
                        <div className="space-y-4">
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-dark-border hover:border-dark-purple rounded-lg p-8 text-center cursor-pointer transition-colors">
                                <UploadIcon className="w-8 h-8 mx-auto mb-2 text-dark-text-secondary" />
                                <p className="text-sm text-dark-text-secondary">{newImageFile ? newImageFile.name : "Click to upload image"}</p>
                                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                            </div>
                            <div className="text-center text-xs text-dark-text-secondary">- OR -</div>
                            <input type="text" placeholder="Paste Image URL" value={itemContent} onChange={e => setItemContent(e.target.value)} className="w-full bg-dark-bg p-2 rounded-lg text-sm border border-dark-border" />
                        </div>
                    )}

                    {itemType === 'note' && (
                        <textarea placeholder="Write your note..." value={itemContent} onChange={e => setItemContent(e.target.value)} className="w-full bg-yellow-100 text-gray-800 p-4 rounded-lg h-32 resize-none focus:outline-none" autoFocus />
                    )}

                    {itemType === 'link' && (
                        <div className="space-y-2">
                            <input type="text" placeholder="Paste Link URL (YouTube, etc)" value={itemContent} onChange={e => setItemContent(e.target.value)} className="w-full bg-dark-bg p-2 rounded-lg text-sm border border-dark-border" />
                            {itemContent && <p className="text-xs text-dark-text-secondary">Will try to embed if supported.</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={closeItemModal} className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text">Cancel</button>
                        <button onClick={handleSaveItem} className="px-4 py-2 text-sm font-bold bg-dark-purple text-white rounded-lg">Add Item</button>
                    </div>
                </div>
            </div>
        )}

        {/* Board Modal */}
        {isBoardModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsBoardModalOpen(false)}>
                <div className="bg-dark-card w-full max-w-sm p-6 rounded-2xl border border-dark-border" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">New Board</h3>
                    <input type="text" placeholder="Board Name" value={newBoardName} onChange={e => setNewBoardName(e.target.value)} className="w-full bg-dark-bg p-2 rounded-lg mb-4 border border-dark-border" autoFocus />
                    <button onClick={handleCreateBoard} className="w-full py-2 bg-dark-purple text-white font-bold rounded-lg">Create</button>
                </div>
            </div>
        )}

        <div className="flex flex-col h-full">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg z-10">
                <div className="flex items-center gap-4">
                    <select 
                        value={activeBoardId} 
                        onChange={(e) => { 
                            if(e.target.value === 'new') setIsBoardModalOpen(true); 
                            else setActiveBoardId(e.target.value); 
                        }}
                        className="bg-dark-card border border-dark-border text-dark-text py-1.5 px-3 rounded-lg font-bold focus:outline-none"
                    >
                        {visionBoards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        <option value="new">+ New Board...</option>
                    </select>
                    {activeBoardId !== 'default' && (
                        <button onClick={() => { if(window.confirm('Delete board?')) { deleteVisionBoard(activeBoardId); setActiveBoardId('default'); } }} className="text-dark-text-secondary hover:text-project-red-from">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button onClick={() => setIsItemModalOpen(true)} className="flex items-center px-4 py-2 bg-dark-purple text-white font-bold rounded-lg shadow-lg hover:bg-dark-purple/90">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Item
                </button>
            </div>

            {/* Canvas Area */}
            <div 
                className="flex-1 relative bg-dark-bg overflow-hidden cursor-grab active:cursor-grabbing"
                ref={containerRef}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
                onMouseLeave={onCanvasMouseUp}
            >
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {localItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-dark-text-secondary pointer-events-none">
                        <div className="text-center opacity-50">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                            <p>Drag items around freely.</p>
                        </div>
                    </div>
                )}

                {localItems.map(item => (
                    <div 
                        key={item.id}
                        style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, zIndex: draggingId === item.id ? 50 : 10 }}
                        className="group"
                        onMouseDown={(e) => handleMouseDown(e, item.id, 'move')}
                    >
                        {/* Content */}
                        {item.type === 'image' && (
                            <img src={item.content} alt="vision" className="w-full rounded-lg shadow-lg border-2 border-transparent hover:border-dark-purple pointer-events-none select-none" />
                        )}
                        {item.type === 'note' && (
                            <div className="p-4 rounded-lg shadow-lg text-gray-800 font-handwriting break-words select-none" style={{ backgroundColor: item.color || '#FEF3C7', minHeight: '150px' }}>
                                {item.content}
                            </div>
                        )}
                        {item.type === 'link' && (
                            <div className="bg-dark-card p-3 rounded-lg border border-dark-border shadow-lg overflow-hidden select-none">
                                <a href={item.content} target="_blank" rel="noreferrer" className="text-dark-blue hover:underline truncate block pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
                                    {item.content}
                                </a>
                                {item.content.includes('youtube.com') && (
                                    <div className="mt-2 aspect-video bg-black">
                                        {/* Placeholder for iframe to avoid drag issues */}
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs">Video Embed</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Controls */}
                        <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); deleteVisionBoardItem(item.id); }} className="p-1.5 bg-project-red-from text-white rounded-full shadow-md hover:scale-110 transition-transform">
                                <TrashIcon className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Resize Handle */}
                        <div 
                            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-0 group-hover:opacity-100"
                            onMouseDown={(e) => handleMouseDown(e, item.id, 'resize')}
                        >
                            <div className="w-3 h-3 bg-dark-purple rounded-full absolute bottom-[-4px] right-[-4px]"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </ViewWrapper>
    );
};

export default Vision;
