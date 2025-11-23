
import React, { useState } from 'react';
import { Task } from '../types';
import { useData } from '../contexts/DataContext';

const CalendarWidget: React.FC = () => {
  const { tasks } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('en-US', { month: 'short' });
  };
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = getMonthName(month);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.dueDate.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
  };

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-dark-text">Calendar</h3>
        <div className="flex items-center space-x-1 text-xs">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-dark-accent rounded text-dark-text-secondary hover:text-dark-text">&lt;</button>
          <span className="font-semibold min-w-[60px] text-center">{monthName} {year}</span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-dark-accent rounded text-dark-text-secondary hover:text-dark-text">&gt;</button>
        </div>
      </div>

      {/* Mobile View: Day List */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3 bg-dark-accent/30 p-1.5 rounded-lg">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} className="text-sm font-bold px-2">&lt;</button>
            <span className="font-bold text-xs">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} className="text-sm font-bold px-2">&gt;</button>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {tasksByDate[selectedDate.toISOString().split('T')[0]]?.map(task => (
                <div key={task.id} className="flex items-center p-1.5 bg-dark-accent rounded-lg border-l-2" style={{ borderLeftColor: task.category.color }}>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate">{task.name}</p>
                    </div>
                    <span className={`text-[8px] px-1 py-0 rounded ml-1 ${task.completed ? 'bg-project-green-from text-white' : 'bg-dark-card'}`}>
                        {task.completed ? 'Done' : 'Todo'}
                    </span>
                </div>
            )) || <p className="text-center text-dark-text-secondary text-[10px] py-2">No tasks.</p>}
        </div>
      </div>

      {/* Desktop View: Compact Grid */}
      <div className="hidden md:block">
          <div className="grid grid-cols-7 gap-1 text-center text-[8px] uppercase font-bold text-dark-text-secondary mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`blank-${i}`} className="h-12 bg-dark-accent/10 rounded-md"></div>)}
            {days.map(day => {
              const dateStr = new Date(year, month, day).toISOString().split('T')[0];
              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = isSameDay(new Date(), new Date(year, month, day));
              
              return (
                <div key={day} className={`h-12 bg-dark-accent/30 rounded-md p-0.5 flex flex-col overflow-hidden ${isToday ? 'ring-1 ring-dark-purple bg-dark-purple/10' : ''}`}>
                  <span className={`text-[8px] font-bold mb-0.5 ml-0.5 ${isToday ? 'text-dark-purple' : 'text-dark-text-secondary'}`}>{day}</span>
                  <div className="flex-1 overflow-hidden space-y-0.5">
                    {dayTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="h-1 rounded-full w-full" style={{ backgroundColor: task.category.color }} title={task.name}></div>
                    ))}
                    {dayTasks.length > 3 && <div className="text-[6px] text-dark-text-secondary leading-none text-center">+{dayTasks.length - 3}</div>}
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
