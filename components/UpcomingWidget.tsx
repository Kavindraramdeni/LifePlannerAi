
import React from 'react';
import { Task } from '../types';
import { CheckSquareIcon } from './icons';
import { useData } from '../contexts/DataContext';

const UpcomingWidget: React.FC = () => {
  const { tasks, saveTask } = useData();
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const todayTasks = tasks.filter(t => isSameDay(t.dueDate, today) && !t.completed);
  const tomorrowTasks = tasks.filter(t => isSameDay(t.dueDate, tomorrow) && !t.completed);
  const next7DaysTasks = tasks.filter(t => t.dueDate > tomorrow && t.dueDate <= nextWeek && !t.completed);
  
  const priorityClasses = {
    'High': 'bg-high-priority text-white',
    'Medium': 'bg-medium-priority text-black',
    'Low': 'bg-low-priority text-black',
  };

  const handleToggle = (task: Task) => {
      saveTask({ ...task, completed: !task.completed });
  };

  const TaskItem: React.FC<{task: Task}> = ({task}) => (
     <li className="flex items-center justify-between py-1.5 border-b border-dark-border/30 last:border-0">
        <div className="flex items-center overflow-hidden mr-2">
            <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0" style={{backgroundColor: task.category.color}}></div>
            <span className="text-xs truncate text-dark-text">{task.name}</span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            {task.priority !== 'Low' && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priorityClasses[task.priority]}`}>{task.priority}</span>}
            <button 
                onClick={() => handleToggle(task)} 
                className="text-dark-text-secondary hover:text-dark-purple transition-colors focus:outline-none p-0.5"
                title="Mark Complete"
            >
                <CheckSquareIcon isChecked={task.completed} className="w-3.5 h-3.5"/>
            </button>
        </div>
     </li>
  );

  const TaskGroup: React.FC<{title: string, count: number, tasks: Task[]}> = ({title, count, tasks}) => (
    <div className="mb-3 last:mb-0">
        <h4 className="text-[10px] font-bold text-dark-text-secondary mb-1.5 uppercase tracking-wider flex justify-between items-center">
            {title} <span className="bg-dark-accent px-1.5 rounded text-[9px] text-dark-text">{count}</span>
        </h4>
        <ul className="bg-dark-accent/20 rounded-xl px-3 py-1">
            {tasks.map(task => <TaskItem key={task.id} task={task} />)}
        </ul>
    </div>
  );

  return (
    <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-dark-text">Upcoming</h3>
      </div>
      <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {todayTasks.length > 0 && <TaskGroup title="Today" count={todayTasks.length} tasks={todayTasks} />}
        {tomorrowTasks.length > 0 && <TaskGroup title="Tomorrow" count={tomorrowTasks.length} tasks={tomorrowTasks} />}
        {next7DaysTasks.length > 0 && <TaskGroup title="Next 7 days" count={next7DaysTasks.length} tasks={next7DaysTasks} />}
        {todayTasks.length === 0 && tomorrowTasks.length === 0 && next7DaysTasks.length === 0 && (
             <div className="text-center text-dark-text-secondary text-[10px] py-8 bg-dark-accent/10 rounded-xl border border-dashed border-dark-border">
                 No upcoming tasks.
             </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingWidget;
