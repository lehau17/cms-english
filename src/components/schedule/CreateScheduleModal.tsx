import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Video, Building, Layers } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useState } from 'react';
import { SessionType } from '@/interface/classroom.interface';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdd: (event: any) => void;
}

interface CreateScheduleFormValues {
  title: string;
  courseName: string;
  teacherName: string;
  type: 'live_session' | 'exam' | 'assignment_due';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description?: string;
  location?: string;
}

const schema = yup.object({
  title: yup.string().required('Title is required'),
  courseName: yup.string().required('Course name is required'),
  teacherName: yup.string().required('Teacher name is required'),
  type: yup.string().oneOf(['live_session', 'exam', 'assignment_due']).required('Event type is required'),
  startDate: yup.string().required('Start date is required'),
  startTime: yup.string().required('Start time is required'),
  endDate: yup.string().required('End date is required'),
  endTime: yup.string().required('End time is required'),
  description: yup.string(),
  location: yup.string(),
});

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({ isOpen, onClose, onEventAdd }) => {
  const [sessionType, setSessionType] = useState<SessionType>('offline');
  const [generateMeetLink, setGenerateMeetLink] = useState(true);

  const methods = useForm<CreateScheduleFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'live_session',
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const onSubmit = (data: CreateScheduleFormValues) => {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);

    onEventAdd({
      id: new Date().getTime(), // mock id
      title: data.title,
      start,
      end,
      resource: {
        course: data.courseName,
        teacher: data.teacherName,
        type: data.type,
        sessionType,
        generateMeetLink: sessionType === 'online' ? generateMeetLink : false,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Schedule"
      description="Add a new event to the calendar"
      icon={<Plus className="w-6 h-6 text-purple-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">
          <FormField name="title" label="Event Title *" placeholder="e.g., Advanced Grammar - Live Session" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="courseName" label="Course Name *" placeholder="English 101" />
            <FormField name="teacherName" label="Teacher Name *" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Event Type *</label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
            >
              <option value="live_session">Live Session</option>
              <option value="exam">Exam</option>
              <option value="assignment_due">Assignment Due</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="startDate" label="Start Date *" type="date" />
            <FormField name="startTime" label="Start Time *" type="time" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="endDate" label="End Date *" type="date" />
            <FormField name="endTime" label="End Time *" type="time" />
          </div>
          <FormField name="description" label="Description" placeholder="Enter event description" />
          <FormField name="location" label="Location / Link" placeholder="e.g., Google Meet Link" />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Session Type *</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sessionType"
                  value="online"
                  checked={sessionType === 'online'}
                  onChange={(e) => {
                    setSessionType('online');
                    setGenerateMeetLink(true);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <Video className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Online</span>
              </label>

              <label className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sessionType"
                  value="offline"
                  checked={sessionType === 'offline'}
                  onChange={(e) => setSessionType('offline')}
                  className="w-4 h-4 text-gray-600"
                />
                <Building className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Offline</span>
              </label>

              <label className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sessionType"
                  value="hybrid"
                  checked={sessionType === 'hybrid'}
                  onChange={(e) => setSessionType('hybrid')}
                  className="w-4 h-4 text-purple-600"
                />
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Hybrid</span>
              </label>
            </div>
          </div>

          {sessionType === 'online' && (
            <label className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                checked={generateMeetLink}
                onChange={(e) => setGenerateMeetLink(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-green-600"
              />
              <span className="text-xs text-green-800">
                Auto-generate Google Meet link for this session
              </span>
            </label>
          )}

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                <span>Create Event</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CreateScheduleModal;
