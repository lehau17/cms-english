import { CalendarDays, ChevronLeft, ChevronRight, Grid3X3, Plus } from 'lucide-react';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

// Time slots configuration (7:00 AM to 7:00 PM, every 2.5 hours)
const TIME_SLOTS = [
  { id: '07:00', label: '07:00 - 09:30', start: '07:00', end: '09:30' },
  { id: '09:30', label: '09:30 - 12:00', start: '09:30', end: '12:00' },
  { id: '12:00', label: '12:00 - 14:30', start: '12:00', end: '14:30' },
  { id: '14:30', label: '14:30 - 17:00', start: '14:30', end: '17:00' },
  { id: '17:00', label: '17:00 - 19:00', start: '17:00', end: '19:00' }
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Monday', short: 'Mon' },
  { id: 2, label: 'Tuesday', short: 'Tue' },
  { id: 3, label: 'Wednesday', short: 'Wed' },
  { id: 4, label: 'Thursday', short: 'Thu' },
  { id: 5, label: 'Friday', short: 'Fri' },
  { id: 6, label: 'Saturday', short: 'Sat' },
  { id: 0, label: 'Sunday', short: 'Sun' }
];

// Enhanced Mock Data with more realistic scheduling
const mockEvents = [
  {
    id: 1,
    title: 'Advanced Grammar - Live Session',
    start: new Date(2025, 8, 8, 7, 0, 0),  // Monday 7:00 AM
    end: new Date(2025, 8, 8, 9, 30, 0),
    resource: {
      course: 'English 101',
      teacher: 'John Doe',
      type: 'live_session',
      room: 'A101',
      students: 25
    },
  },
  {
    id: 2,
    title: 'Vocabulary Quiz',
    start: new Date(2025, 8, 9, 14, 30, 0), // Tuesday 2:30 PM
    end: new Date(2025, 8, 9, 17, 0, 0),
    resource: {
      course: 'English 102',
      teacher: 'Jane Smith',
      type: 'exam',
      room: 'B205',
      students: 30
    },
  },
  {
    id: 3,
    title: 'Pronunciation Practice',
    start: new Date(2025, 8, 10, 9, 30, 0), // Wednesday 9:30 AM
    end: new Date(2025, 8, 10, 12, 0, 0),
    resource: {
      course: 'English 101',
      teacher: 'John Doe',
      type: 'live_session',
      room: 'A102',
      students: 20
    },
  },
  {
    id: 4,
    title: 'Reading Comprehension',
    start: new Date(2025, 8, 11, 12, 0, 0), // Thursday 12:00 PM
    end: new Date(2025, 8, 11, 14, 30, 0),
    resource: {
      course: 'English 103',
      teacher: 'Mike Johnson',
      type: 'workshop',
      room: 'C301',
      students: 15
    },
  },
  {
    id: 5,
    title: 'Speaking Practice',
    start: new Date(2025, 8, 12, 17, 0, 0), // Friday 5:00 PM
    end: new Date(2025, 8, 12, 19, 0, 0),
    resource: {
      course: 'English 104',
      teacher: 'Sarah Wilson',
      type: 'live_session',
      room: 'D401',
      students: 18
    },
  }
];

// Event styling
const eventStyleGetter = (event: any) => {
  const eventType = event.resource.type;
  let backgroundColor = '#3174ad';
  if (eventType === 'exam') backgroundColor = '#f44336';
  if (eventType === 'live_session') backgroundColor = '#4caf50';
  if (eventType === 'workshop') backgroundColor = '#ff9800';

  const style = {
    backgroundColor,
    borderRadius: '6px',
    opacity: 0.9,
    color: 'white',
    border: '0px',
    display: 'block',
    fontSize: '12px',
    padding: '2px 4px'
  };
  return { style };
};

// Custom Toolbar Component
const CustomToolbar = ({ toolbar, viewType, onViewChange }: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  const getLabel = () => {
    const date = moment(toolbar.date);
    if (viewType === 'week') {
      const startOfWeek = date.clone().startOf('week').add(1, 'day'); // Monday
      const endOfWeek = date.clone().endOf('week').add(1, 'day'); // Sunday
      return `${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`;
    }
    return date.format('MMMM YYYY');
  };

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <button
          onClick={goToBack}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-white hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={goToCurrent}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-white hover:bg-gray-50"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-white hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-xl font-semibold text-gray-800">{getLabel()}</div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewChange('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${viewType === 'month'
            ? 'bg-blue-600 text-white'
            : 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
            }`}
        >
          <CalendarDays className="h-4 w-4" />
          Month
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${viewType === 'week'
            ? 'bg-blue-600 text-white'
            : 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
            }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Week
        </button>
      </div>
    </div>
  );
};

// Week View Component (GitHub Project style)
const WeekView = ({ events, currentDate, onEventMove, onSlotClick }: any) => {
  const [draggedEvent, setDraggedEvent] = useState<any>(null);

  // Get current week dates (Monday to Sunday)
  const getWeekDates = (date: Date) => {
    const startOfWeek = moment(date).startOf('week').add(1, 'day'); // Start from Monday
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.clone().add(i, 'days').toDate()
    );
  };

  const weekDates = getWeekDates(currentDate);

  // Get events for specific day and time slot
  const getEventsForSlot = (date: Date, timeSlot: any) => {
    return events.filter((event: any) => {
      const eventDate = moment(event.start);
      const slotDate = moment(date);
      const eventStart = moment(event.start).format('HH:mm');

      return eventDate.isSame(slotDate, 'day') && eventStart === timeSlot.start;
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, event: any) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, date: Date, timeSlot: any) => {
    e.preventDefault();
    if (draggedEvent) {
      const newStart = moment(date)
        .set('hour', parseInt(timeSlot.start.split(':')[0]))
        .set('minute', parseInt(timeSlot.start.split(':')[1]))
        .toDate();

      const newEnd = moment(date)
        .set('hour', parseInt(timeSlot.end.split(':')[0]))
        .set('minute', parseInt(timeSlot.end.split(':')[1]))
        .toDate();

      onEventMove({
        ...draggedEvent,
        start: newStart,
        end: newEnd
      });

      setDraggedEvent(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 bg-gray-50 font-semibold text-sm text-gray-600 border-r border-gray-200">
          Time
        </div>
        {weekDates.map((date, index) => {
          const dayInfo = DAYS_OF_WEEK[index];
          const isToday = moment(date).isSame(moment(), 'day');
          return (
            <div
              key={date.toISOString()}
              className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50' : 'bg-gray-50'
                }`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {dayInfo?.short}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'text-blue-800' : 'text-gray-900'}`}>
                {moment(date).format('DD')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {TIME_SLOTS.map((timeSlot) => (
          <div key={timeSlot.id} className="grid grid-cols-8 border-b border-gray-100 min-h-[120px]">
            {/* Time label */}
            <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
              <div className="text-sm font-medium text-gray-600">
                {timeSlot.label}
              </div>
            </div>

            {/* Day slots */}
            {weekDates.map((date) => {
              const slotEvents = getEventsForSlot(date, timeSlot);
              return (
                <div
                  key={`${date.toISOString()}-${timeSlot.id}`}
                  className="p-2 border-r border-gray-200 last:border-r-0 min-h-[120px] relative hover:bg-gray-25 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date, timeSlot)}
                  onClick={() => onSlotClick(date, timeSlot)}
                >
                  {slotEvents.map((event: any) => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      className="mb-1 p-2 rounded-md text-xs font-medium cursor-move shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        backgroundColor: eventStyleGetter(event).style.backgroundColor,
                        color: 'white'
                      }}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-xs opacity-90 truncate">
                        {event.resource.teacher}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        Room: {event.resource.room}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal Components (simplified)
const CreateScheduleModal = ({ isOpen, onClose, onEventAdd, selectedSlot }: any) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get form values from state or refs instead of FormData
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const courseInput = document.querySelector('input[name="course"]') as HTMLInputElement;
    const teacherInput = document.querySelector('input[name="teacher"]') as HTMLInputElement;
    const roomInput = document.querySelector('input[name="room"]') as HTMLInputElement;
    const typeSelect = document.querySelector('select[name="type"]') as HTMLSelectElement;
    const studentsInput = document.querySelector('input[name="students"]') as HTMLInputElement;

    const newEvent = {
      id: Date.now(),
      title: titleInput?.value || '',
      start: selectedSlot?.start || new Date(),
      end: selectedSlot?.end || new Date(),
      resource: {
        course: courseInput?.value || '',
        teacher: teacherInput?.value || '',
        type: typeSelect?.value || 'live_session',
        room: roomInput?.value || '',
        students: parseInt(studentsInput?.value || '0') || 0
      }
    };

    onEventAdd(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Create Schedule</h2>
        </div>
        <div onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <input
              name="course"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
            <input
              name="teacher"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
            <input
              name="room"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              name="type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="live_session">Live Session</option>
              <option value="exam">Exam</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
            <input
              name="students"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Schedule Component
const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState(mockEvents);
  const [viewType, setViewType] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const handleEventAdd = (event: any) => {
    setEvents([...events, event]);
  };

  const handleEventMove = (updatedEvent: any) => {
    setEvents(events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleSlotClick = (date: Date, timeSlot: any) => {
    const slotStart = moment(date)
      .set('hour', parseInt(timeSlot.start.split(':')[0]))
      .set('minute', parseInt(timeSlot.start.split(':')[1]))
      .toDate();

    const slotEnd = moment(date)
      .set('hour', parseInt(timeSlot.end.split(':')[0]))
      .set('minute', parseInt(timeSlot.end.split(':')[1]))
      .toDate();

    setSelectedSlot({ start: slotStart, end: slotEnd });
    setIsCreateModalOpen(true);
  };

  const handleViewChange = (newViewType: 'month' | 'week') => {
    setViewType(newViewType);
  };

  const handleNavigate = useCallback((action: string) => {
    let newDate = moment(currentDate);

    if (action === 'PREV') {
      newDate = viewType === 'week'
        ? newDate.subtract(1, 'week')
        : newDate.subtract(1, 'month');
    } else if (action === 'NEXT') {
      newDate = viewType === 'week'
        ? newDate.add(1, 'week')
        : newDate.add(1, 'month');
    } else if (action === 'TODAY') {
      newDate = moment();
    }

    setCurrentDate(newDate.toDate());
  }, [currentDate, viewType]);

  const toolbar = {
    date: currentDate,
    onNavigate: handleNavigate
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Schedule</h1>
            <p className="text-gray-600">View and manage course schedules and events.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Schedule</span>
          </button>
        </div>

        <CustomToolbar
          toolbar={toolbar}
          viewType={viewType}
          onViewChange={handleViewChange}
        />

        {viewType === 'month' ? (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              eventPropGetter={eventStyleGetter}
              date={currentDate}
              onNavigate={setCurrentDate}
              components={{
                toolbar: () => null, // Hide default toolbar since we use custom one
              }}
              views={['month']}
              view='month'
            />
          </div>
        ) : (
          <WeekView
            events={events}
            currentDate={currentDate}
            onEventMove={handleEventMove}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSlot(null);
        }}
        onEventAdd={handleEventAdd}
        selectedSlot={selectedSlot}
      />
    </div>
  );
};

export default SchedulePage;
