import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateScheduleModal from '@/components/schedule/CreateScheduleModal';
import EditScheduleModal from '@/components/schedule/EditScheduleModal';
import DeleteScheduleModal from '@/components/schedule/DeleteScheduleModal';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

// Mock Data
const mockEvents = [
  {
    id: 1,
    title: 'Advanced Grammar - Live Session',
    start: new Date(2025, 7, 28, 10, 0, 0),
    end: new Date(2025, 7, 28, 11, 30, 0),
    resource: { course: 'English 101', teacher: 'John Doe', type: 'live_session' },
  },
  {
    id: 2,
    title: 'Vocabulary Quiz',
    start: new Date(2025, 7, 29, 14, 0, 0),
    end: new Date(2025, 7, 29, 15, 0, 0),
    resource: { course: 'English 102', teacher: 'Jane Smith', type: 'exam' },
  },
  {
    id: 3,
    title: 'Pronunciation Practice',
    start: new Date(2025, 8, 1, 9, 0, 0),
    end: new Date(2025, 8, 1, 10, 0, 0),
    resource: { course: 'English 101', teacher: 'John Doe', type: 'live_session' },
  },
];

const eventStyleGetter = (event: any) => {
  const eventType = event.resource.type;
  let backgroundColor = '#3174ad'; // Default
  if (eventType === 'exam') backgroundColor = '#f44336';
  if (eventType === 'live_session') backgroundColor = '#4caf50';
  
  const style = {
    backgroundColor,
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block'
  };
  return {
    style: style
  };
};

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="text-2xl font-bold text-gray-800">{date.format('MMMM YYYY')}</span>
    );
  };

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <Button onClick={goToBack} variant="outline" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
        <Button onClick={goToCurrent} variant="outline">Today</Button>
        <Button onClick={goToNext} variant="outline" size="icon"><ChevronRight className="h-5 w-5" /></Button>
      </div>
      <div>{label()}</div>
      <div className="flex items-center gap-2">
        {/* Placeholder for view switcher */}
      </div>
    </div>
  );
};

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState(mockEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const handleEventAdd = (event: any) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: any) => {
    setEvents(events.map(event => (event.id === updatedEvent.id ? updatedEvent : event)));
  };

  const handleEventDelete = (eventId: any) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedEvent(null);
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

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      <CreateScheduleModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModals} 
        onEventAdd={handleEventAdd} 
      />

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        event={selectedEvent}
        onEventUpdate={handleEventUpdate}
      />

      <DeleteScheduleModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        event={selectedEvent}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
};

// A simple button component for the toolbar
const Button = ({ onClick, children, ...props }: any) => (
  <button 
    onClick={onClick} 
    className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

export default SchedulePage;
