import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from './CalendarDay';

interface CalendarProps {
  loginDates: Date[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  loading: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  loginDates,
  currentMonth,
  setCurrentMonth,
  loading,
}) => {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [loginHistory, setLoginHistory] = useState<Date[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      setLoadingHistory(true);
      const start = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const end = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );
      const res = await fetch(
        `/api/auth/login-history?start=${start.toISOString()}&end=${end.toISOString()}`,
      );
      const data = await res.json();
      setLoginHistory(
        data.map((item: { loginAt: string }) => new Date(item.loginAt)),
      );
      setLoadingHistory(false);
    };
    fetchLoginHistory();
  }, [currentMonth]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek;
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    const totalCalendarDays = Math.ceil(totalDays / 7) * 7;
    const days: Date[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
      days.push(new Date(year, month - 1, day));
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    const remainingDays = totalCalendarDays - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    setCalendarDays(days);
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };
  const hasLoginActivity = (date: Date) => {
    return loginDates.some(
      (loginDate) =>
        loginDate.getDate() === date.getDate() &&
        loginDate.getMonth() === date.getMonth() &&
        loginDate.getFullYear() === date.getFullYear(),
    );
  };
  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          aria-label="前の月"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-medium text-gray-800">
          {formatMonthYear(currentMonth)}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          aria-label="次の月"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs md:text-sm text-gray-500 font-medium text-center py-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {loading ? (
          <div className="col-span-7 text-center text-gray-400 py-8">
            読み込み中...
          </div>
        ) : (
          calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              date={day}
              isCurrentMonth={day.getMonth() === currentMonth.getMonth()}
              hasActivity={hasLoginActivity(day)}
            />
          ))
        )}
      </div>
      <div className="flex justify-end items-center mt-6">
        <div className="flex items-center space-x-2 ml-4 text-sm text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
          <span>ログイン日</span>
        </div>
      </div>
    </div>
  );
};
