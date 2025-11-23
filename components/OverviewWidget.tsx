
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, Category } from '../types';
import { CheckSquareIcon, SearchIcon, FlameIcon, TrendingUpIcon, TrendingDownIcon, TrashIcon, TagIcon, PlusIcon, PencilIcon, MoreVerticalIcon, BriefcaseIcon, CalendarDaysIcon, ListIcon } from './icons';
import TaskModal from './TaskModal';
import { useData } from '../contexts/DataContext';

const OverviewWidget: React.FC = () => {
  const { tasks, setTasks, categories, saveTask, addTask, deleteTask, projects } = useData();
  const [activeTab, setActiveTab] = useState('Todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const categoryActionRef = useRef<HTMLDivElement>(null);
  
  const tabs = ['Todo', 'Work', 'Personal', 'Health', 'Workout'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (categoryActionRef.current && !categoryActionRef.current.contains(event.target as Node)) {
            setIsCategoryPickerOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryActionRef]);


  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        saveTask({ ...task, completed: !task.completed });
    }
  };
  
  const processedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (activeTab === 'Todo') {
          if (task.projectId) return false;
      } else if (activeTab === 'Work') {
          if (task.category.name !== 'Work' && !task.projectId) return false;
      } else {
          if (task.category.name !== activeTab) return false;
      }

      if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterPriority !== 'All' && task.priority !== filterPriority) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'dueDate': return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'createdAt':
        default: return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [tasks, activeTab, searchTerm, sortBy, filterPriority]);

  const isAllSelected = useMemo(() => processedTasks.length > 0 && processedTasks.every(t => selectedTasks.has(t.id)), [processedTasks, selectedTasks]);
  const isSomeSelected = useMemo(() => selectedTasks.size > 0 && !isAllSelected, [selectedTasks, isAllSelected]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleSelectTask = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
    } else {
        newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const handleSelectAll = () => {
    const newSelection = new Set(selectedTasks);
    if (isAllSelected) {
        processedTasks.forEach(t => newSelection.delete(t.id));
    } else {
        processedTasks.forEach(t => newSelection.add(t.id));
    }
    setSelectedTasks(newSelection);
  };

  const handleCompleteSelected = () => {
    setTasks(prevTasks => prevTasks.map(task => selectedTasks.has(task.id) ? { ...task, completed: true } : task));
    setSelectedTasks(new Set());
  };

  const handleDeleteSelected = () => {
    setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.has(task.id)));
    setSelectedTasks(new Set());
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        deleteTask(id);
    }
  };

  const handleChangeCategory = (category: Category) => {
    setTasks(prevTasks =>
        prevTasks.map(task =>
            selectedTasks.has(task.id) ? { ...task, category: category } : task
        )
    );
    setSelectedTasks(new Set());
    setIsCategoryPickerOpen(false);
  };

  const handleOpenEditModal = (task: Task) => {
      setTaskToEdit(task);
      setIsModalOpen(true);
  };
  
  const handleOpenNewModal = () => {
      setTaskToEdit(null);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setTaskToEdit(null);
  };

  const handleSave = (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
      if ('id' in taskData) {
          saveTask(taskData as Task);
      } else {
          addTask({
              ...taskData,
              id: `t-${Date.now()}`,
              createdAt: new Date()
          } as Task);
      }
      handleCloseModal();
  };

  const getProjectTitle = (projectId?: string) => {
      if (!projectId) return null;
      const project = projects.find(p => p.id === projectId);
      return project ? project.title : null;
  };

  const priorityClasses = {
    'High': 'bg-high-priority/20 text-high-priority',
    'Medium': 'bg-medium-priority/20 text-medium-priority',
    'Low': 'bg-low-priority/20 text-low-priority',
  };

  const PriorityIcon: React.FC<{ priority: 'High' | 'Medium' | 'Low', className?: string }> = ({ priority, className }) => {
    switch (priority) {
        case 'High': return <FlameIcon className={className} />;
        case 'Medium': return <TrendingUpIcon className={className} />;
        case 'Low': return <TrendingDownIcon className={className} />;
        default: return null;
    }
  };

  return (
    <>
      <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          taskToEdit={taskToEdit}
          categories={categories}
      />
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border flex flex-col max-h-[550px] min-h-[300px]" onClick={() => setActiveTaskMenu(null)}>
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h3 className="text-base font-bold text-dark-text">Overview</h3>
            <div className="flex gap-2">
                <div className="md:hidden flex bg-dark-accent rounded-lg p-0.5">
                    <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-dark-card text-dark-text shadow' : 'text-dark-text-secondary'}`}><ListIcon className="w-3 h-3"/></button>
                    <button onClick={() => setViewMode('card')} className={`p-1 rounded ${viewMode === 'card' ? 'bg-dark-card text-dark-text shadow' : 'text-dark-text-secondary'}`}><BriefcaseIcon className="w-3 h-3"/></button>
                </div>
                <button onClick={handleOpenNewModal} className="flex items-center px-2.5 py-1 bg-dark-blue text-white font-semibold rounded-lg shadow-md hover:bg-opacity-80 transition-all text-xs">
                    <PlusIcon className="w-3 h-3 mr-1" />
                    New Task
                </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center mb-2 pb-2 border-b border-dark-border flex-shrink-0">
              <div className="relative flex-1 min-w-[120px]">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-text-secondary" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-dark-accent border border-dark-border rounded-lg py-1 pl-8 pr-2 w-full text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple" />
              </div>
              <div className="flex items-center gap-2">
                  <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-dark-accent border border-dark-border rounded-lg py-1 px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-dark-purple cursor-pointer">
                      <option value="createdAt">Newest</option>
                      <option value="dueDate">Date</option>
                      <option value="priority">Priority</option>
                      <option value="name">Name</option>
                  </select>
              </div>
              <div className="flex items-center gap-2">
                  <select id="filter-priority" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-dark-accent border border-dark-border rounded-lg py-1 px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-dark-purple cursor-pointer">
                      <option value="All">All Pri</option>
                      <option value="High">High</option>
                      <option value="Medium">Med</option>
                      <option value="Low">Low</option>
                  </select>
              </div>
          </div>

          <div className="flex items-center space-x-1 bg-dark-accent p-0.5 rounded-lg mb-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors w-full whitespace-nowrap ${activeTab === tab ? 'bg-dark-card text-dark-text shadow-sm' : 'text-dark-text-secondary hover:text-dark-text'}`}>
                {tab}
              </button>
            ))}
          </div>

          {selectedTasks.size > 0 && (
              <div className="bg-dark-accent p-1.5 rounded-lg flex justify-between items-center mb-2 animate-fade-in flex-shrink-0">
                  <span className="text-[10px] font-semibold ml-2">{selectedTasks.size} selected</span>
                  <div className="flex items-center space-x-1.5">
                      <button onClick={handleCompleteSelected} className="px-2 py-0.5 text-[10px] bg-dark-blue rounded-md text-white hover:bg-opacity-80">Done</button>
                      <div ref={categoryActionRef} className="relative">
                          <button onClick={() => setIsCategoryPickerOpen(prev => !prev)} className="px-2 py-0.5 text-[10px] bg-dark-card rounded-md text-dark-text hover:bg-opacity-80 flex items-center border border-dark-border">
                              <TagIcon className="w-3 h-3 mr-1" /> Cat
                          </button>
                          {isCategoryPickerOpen && (
                              <div className="absolute z-10 bottom-full mb-1 w-32 bg-dark-accent border border-dark-border rounded-lg shadow-lg py-1 right-0">
                                  {Object.values(categories).map(categoryValue => {
                                      const category = categoryValue as Category;
                                      return (
                                          <button
                                              key={category.name}
                                              onClick={() => handleChangeCategory(category)}
                                              className="w-full text-left px-2 py-1 text-[10px] text-dark-text hover:bg-dark-card flex items-center"
                                          >
                                              <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: category.color }}></div>
                                              {category.name}
                                          </button>
                                      );
                                  })}
                              </div>
                          )}
                      </div>
                      <button onClick={handleDeleteSelected} className="p-1 bg-project-red-from rounded-md text-white hover:bg-opacity-80"><TrashIcon className="w-3 h-3" /></button>
                  </div>
              </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="hidden md:grid grid-cols-12 gap-2 text-[9px] uppercase tracking-wider text-dark-text-secondary px-2 pb-1 font-bold flex-shrink-0">
                  <div className="col-span-1"><input type="checkbox" ref={selectAllCheckboxRef} checked={isAllSelected} onChange={handleSelectAll} className="custom-checkbox w-3 h-3" /></div>
                  <div className="col-span-4">Task</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Due</div>
                  <div className="col-span-2 text-right">Priority</div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {processedTasks.length > 0 ? processedTasks.map(task => (
                    viewMode === 'card' ? (
                        <div key={task.id} className={`md:hidden bg-dark-accent/30 p-2.5 rounded-lg mb-2 border border-transparent hover:border-dark-border transition-all ${task.completed ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={selectedTasks.has(task.id)} onChange={() => handleSelectTask(task.id)} className="custom-checkbox w-3.5 h-3.5" />
                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${priorityClasses[task.priority]}`}>{task.priority}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }} className="text-dark-text-secondary p-1"><MoreVerticalIcon className="w-3.5 h-3.5"/></button>
                            </div>
                            
                            <h4 className={`font-bold text-xs mb-1 ${task.completed ? 'line-through text-dark-text-secondary' : ''}`}>{task.name}</h4>
                            
                            <div className="flex flex-wrap gap-1 mb-1">
                                <span className="text-[9px] px-1 py-0.5 rounded bg-dark-card text-dark-text-secondary flex items-center">
                                    <div className="w-1 h-1 rounded-full mr-1" style={{ backgroundColor: task.category.color }}></div>
                                    {task.category.name}
                                </span>
                                {task.projectId && (
                                    <span className="text-[9px] px-1 py-0.5 rounded bg-dark-blue/10 text-dark-blue flex items-center">
                                        <BriefcaseIcon className="w-2.5 h-2.5 mr-1"/> {getProjectTitle(task.projectId)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-dark-border/30">
                                <div className="flex items-center text-[10px] text-dark-text-secondary">
                                    <CalendarDaysIcon className="w-2.5 h-2.5 mr-1"/> {task.dueDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </div>
                                <button onClick={() => handleToggle(task.id)} className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${task.completed ? 'bg-project-green-from text-white' : 'bg-dark-card text-dark-text-secondary'}`}>
                                    {task.completed ? 'Done' : 'Mark Done'}
                                </button>
                            </div>
                            
                            {activeTaskMenu === task.id && (
                                <div className="mt-1 bg-dark-card rounded-md border border-dark-border p-1 flex justify-around">
                                    <button onClick={() => handleOpenEditModal(task)} className="flex-1 py-1 text-[10px] flex items-center justify-center text-dark-text"><PencilIcon className="w-3 h-3 mr-1"/> Edit</button>
                                    <div className="w-px bg-dark-border mx-1"></div>
                                    <button onClick={() => handleDelete(task.id)} className="flex-1 py-1 text-[10px] flex items-center justify-center text-project-red-from"><TrashIcon className="w-3 h-3 mr-1"/> Delete</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div key={task.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-dark-accent/50 transition-colors group ${task.completed ? 'opacity-50' : ''} ${selectedTasks.has(task.id) ? 'bg-dark-blue/10' : ''}`}>
                            <div className="col-span-1"><input type="checkbox" checked={selectedTasks.has(task.id)} onChange={() => handleSelectTask(task.id)} className="custom-checkbox w-3.5 h-3.5" /></div>
                            <div className="col-span-11 md:col-span-4 flex items-center overflow-hidden">
                                <button onClick={() => handleToggle(task.id)} className={`mr-2 flex-shrink-0 hidden md:block transition-colors ${task.completed ? 'text-project-green-from' : 'text-dark-text-secondary hover:text-dark-purple'}`}>
                                    <CheckSquareIcon isChecked={task.completed} className="w-3.5 h-3.5" />
                                </button>
                                <div className="truncate min-w-0">
                                    <span className={`text-xs block truncate font-medium ${task.completed ? 'line-through text-dark-text-secondary' : 'text-dark-text'}`}>{task.name}</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {task.recurrence && task.recurrence !== 'None' && (
                                            <span className="text-[9px] text-dark-text-secondary flex items-center bg-dark-accent px-1 rounded">
                                                <CalendarDaysIcon className="w-2.5 h-2.5 mr-1"/> {task.recurrence}
                                            </span>
                                        )}
                                        {task.tags && task.tags.map(tag => (
                                            <span key={tag} className="text-[9px] bg-dark-accent px-1 rounded text-dark-text-secondary">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-3 flex-col justify-center">
                                <div className="flex items-center mb-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{backgroundColor: task.category.color}}></div>
                                    <span className="text-[10px] truncate text-dark-text-secondary">{task.category.name}</span>
                                </div>
                                {getProjectTitle(task.projectId) && (
                                    <div className="flex items-center text-dark-blue w-fit rounded">
                                        <BriefcaseIcon className="w-2.5 h-2.5 mr-1" />
                                        <span className="text-[9px] truncate font-medium">{getProjectTitle(task.projectId)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block col-span-2 text-[10px] text-dark-text-secondary">{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="hidden md:flex col-span-2 text-right items-center justify-end">
                                    <span className={`text-[9px] font-bold px-1.5 py-0 rounded-full flex items-center justify-end gap-1 ${priorityClasses[task.priority]}`}>
                                        <PriorityIcon priority={task.priority} className="w-2.5 h-2.5" />
                                        {task.priority}
                                    </span>
                                    <div className="relative ml-1 w-5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                                            className="p-0.5 text-dark-text-secondary hover:text-dark-text rounded-full hover:bg-dark-accent opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreVerticalIcon className="w-3.5 h-3.5" />
                                        </button>
                                        {activeTaskMenu === task.id && (
                                            <div className="absolute right-0 top-full mt-1 w-28 bg-dark-accent border border-dark-border rounded-md shadow-lg z-20 py-1">
                                                <button onClick={() => { handleOpenEditModal(task); setActiveTaskMenu(null); }} className="w-full flex items-center px-2 py-1.5 text-[10px] text-dark-text hover:bg-dark-card">
                                                    <PencilIcon className="w-3 h-3 mr-1.5" /> Edit
                                                </button>
                                                <button onClick={() => { handleDelete(task.id); setActiveTaskMenu(null); }} className="w-full flex items-center px-2 py-1.5 text-[10px] text-project-red-from hover:bg-dark-card">
                                                    <TrashIcon className="w-3 h-3 mr-1.5" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </div>
                    )
                  )) : (
                      <div className="h-full flex items-center justify-center text-dark-text-secondary bg-dark-accent/5 rounded-lg border border-dashed border-dark-border m-1">
                          <p className="text-xs">No tasks found in "{activeTab}".</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </>
  );
};

export default OverviewWidget;
