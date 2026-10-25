
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { api, params } from '../api';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function ObservationCalendar({
  studentId,
  selectedDate,
  onDateChange,
  refreshKey = 0
}) {
  const [recordDates, setRecordDates] = useState(new Set());
  const [activeMonth, setActiveMonth] = useState(
    new Date(selectedDate + 'T12:00:00')
  );

  useEffect(() => {
    if (!studentId) return;

    let active = true;

    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();

    const firstDay = formatDate(new Date(year, month, 1));
    const lastDay = formatDate(new Date(year, month + 1, 0));

    api(
      `/students/${studentId}/records?${params(firstDay, lastDay)}`
    )
      .then(records => {
        if (active) {
          setRecordDates(
            new Set(records.map(record => record.date))
          );
        }
      })
      .catch(error => {
        console.error('Failed to load calendar records:', error);
        if (active) setRecordDates(new Set());
      });

    return () => {
      active = false;
    };
  }, [studentId, activeMonth.getFullYear(),
      activeMonth.getMonth(), refreshKey]);

  return (
    <div className="observation-calendar">
      <Calendar
        value={new Date(selectedDate + 'T12:00:00')}
        activeStartDate={activeMonth}
        maxDate={new Date()}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) {
            setActiveMonth(activeStartDate);
          }
        }}
        onChange={value => {
          if (value instanceof Date) {
            onDateChange(formatDate(value));
          }
        }}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;

          const key = formatDate(date);

          return recordDates.has(key) ? (
            <span
              className="record-dot"
              title="Saved observation exists"
            />
          ) : null;
        }}
      />
    </div>
  );
}
