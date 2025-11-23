
import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, SettingsIcon, UserIcon, LogOutIcon, ArrowLeftIcon, MenuIcon, SunIcon, MoonIcon, BellIcon, CheckIcon, TrashIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface MainHeaderProps {
    pageTitle: string;
    onBack?: () => void;
    onMenuClick: () => void;
    onNavigate?: (pageId: string) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ pageTitle, onBack, onMenuClick, onNavigate }) => {
    const { toggleTheme, theme, tasks, notes, projects, transactions, notifications, markNotificationRead, clearAllNotifications } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    const notifRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 1) {
            const lowerQuery = query.toLowerCase();
            const results = [
                ...tasks.filter(t => t.name.toLowerCase().includes(lowerQuery)).map(t => ({ type: 'Task', title: t.name, id: t.id, page: 'todo' })),
                ...notes.filter(n => n.title.toLowerCase().includes(lowerQuery)).map(n => ({ type: 'Note', title: n.title, id: n.id, page: 'notes' })),
                ...projects.filter(p => p.title.toLowerCase().includes(lowerQuery)).map(p => ({ type: 'Project', title: p.title, id: p.id, page: 'projects' })),
                ...transactions.filter(t => t.description.toLowerCase().includes(lowerQuery)).map(t => ({ type: 'Transaction', title: t.description, id: t.id, page: 'finance-tracker' })),
            ];
            setSearchResults(results);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const handleResultClick = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
            setSearchQuery('');
            setShowResults(false);
        }
    };

    const handleNotificationClick = (link?: string) => {
        if (link && onNavigate) {
            onNavigate(link);
            setShowNotifications(false);
        }
    };

    return (
        <header className="flex-shrink-0 bg-dark-bg border-b border-dark-border p-4 flex justify-between items-center z-20 gap-4">
            <div className="flex items-center flex-1 min-w-0">
                <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-dark-accent mr-2 md:hidden flex-shrink-0">
                    <MenuIcon className="w-6 h-6" />
                </button>
                {onBack && (
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-dark-accent mr-4 flex-shrink-0">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="relative flex-1 max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search..."
                        className="bg-dark-card border border-dark-border rounded-lg py-2 pl-10 pr-4 w-full text-sm focus:outline-none focus:ring-2 focus:ring-dark-purple transition-colors"
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                    />
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 w-full bg-dark-card border border-dark-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                            {searchResults.map((res, idx) => (
                                <button 
                                    key={`${res.type}-${res.id}-${idx}`}
                                    onClick={() => handleResultClick(res.page)}
                                    className="w-full text-left px-4 py-2 hover:bg-dark-accent text-sm border-b border-dark-border last:border-0 flex justify-between"
                                >
                                    <span className="font-medium truncate">{res.title}</span>
                                    <span className="text-xs text-dark-text-secondary ml-2">{res.type}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Title centered only on medium+ screens, otherwise hidden or smaller */}
            <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2 hidden lg:block">{pageTitle}</h1>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                 {/* Notification Center */}
                 <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text relative" title="Notifications">
                        <BellIcon className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-dark-bg"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                            <div className="p-3 border-b border-dark-border flex justify-between items-center">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                <button onClick={clearAllNotifications} className="text-xs text-dark-text-secondary hover:text-project-red-from flex items-center">
                                    <TrashIcon className="w-3 h-3 mr-1" /> Clear
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-dark-text-secondary text-sm">No notifications</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className={`p-3 border-b border-dark-border hover:bg-dark-accent/50 transition-colors ${notif.read ? 'opacity-60' : 'bg-dark-accent/10'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${notif.type === 'alert' ? 'bg-red-500/20 text-red-400' : notif.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {notif.type.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-dark-text-secondary">{notif.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p 
                                                onClick={() => handleNotificationClick(notif.link)}
                                                className={`text-sm mb-2 ${notif.link ? 'cursor-pointer hover:underline' : ''}`}
                                            >
                                                {notif.message}
                                            </p>
                                            {!notif.read && (
                                                <button onClick={() => markNotificationRead(notif.id)} className="text-xs flex items-center text-dark-text-secondary hover:text-dark-purple">
                                                    <CheckIcon className="w-3 h-3 mr-1" /> Mark as read
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text" title="Toggle Theme">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                 </button>
                 <button className="p-2 rounded-full hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text hidden sm:block" title="Settings">
                    <SettingsIcon className="w-5 h-5" />
                 </button>
                 <button className="p-2 rounded-full hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text hidden sm:block" title="Profile">
                    <UserIcon className="w-5 h-5" />
                 </button>
                 <button className="p-2 rounded-full hover:bg-dark-accent text-dark-text-secondary hover:text-dark-text" title="Logout">
                    <LogOutIcon className="w-5 h-5" />
                 </button>
            </div>
        </header>
    );
};

export default MainHeader;
