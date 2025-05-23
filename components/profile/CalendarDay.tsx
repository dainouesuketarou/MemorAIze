import React from 'react';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  hasActivity: boolean;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  hasActivity,
}) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const getDayStyles = () => {
    let baseStyles =
      'h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-md transition-all duration-200 text-sm';
    if (!isCurrentMonth) {
      return `${baseStyles} text-gray-300`;
    }
    if (isToday(date)) {
      return `${baseStyles} border-2 border-blue-400 font-bold text-blue-600`;
    }
    if (hasActivity) {
      return `${baseStyles} bg-blue-500 text-white font-medium transform hover:scale-105`;
    }
    return `${baseStyles} text-gray-700 hover:bg-gray-100`;
  };
  return (
    <div className="flex justify-center">
      <div className={getDayStyles()}>{date.getDate()}</div>
    </div>
  );
};
