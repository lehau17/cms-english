import { yupResolver } from '@hookform/resolvers/yup';
import { Edit } from 'lucide-react';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  onEventUpdate: (event: any) => void;
}

interface EditScheduleFormValues {
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

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ isOpen, onClose, event, onEventUpdate }) => {
  const methods = useForm<EditScheduleFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset } = methods;

  useEffect(() => {
    if (event) {
      const startDate = event.start ? event.start.toISOString().split('T')[0] : '';
      const startTime = event.start ? event.start.toTimeString().split(' ')[0].substring(0, 5) : '';
      const endDate = event.end ? event.end.toISOString().split('T')[0] : '';
      const endTime = event.end ? event.end.toTimeString().split(' ')[0].substring(0, 5) : '';

      reset({
        title: event.title || '',
        courseName: event.resource?.course || '',
        teacherName: event.resource?.teacher || '',
        type: event.resource?.type || 'live_session',
        startDate,
        startTime,
        endDate,
        endTime,
        description: event.resource?.description || '',
        location: event.resource?.location || '',
      });
    }
  }, [event, reset]);

  const onSubmit = (data: EditScheduleFormValues) => {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);

    onEventUpdate({
      ...event,
      title: data.title,
      start,
      end,
      resource: { 
        course: data.courseName, 
        teacher: data.teacherName, 
        type: data.type,
        description: data.description,
        location: data.location,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Schedule"
      description="Update event details"
      icon={<Edit className="w-6 h-6 text-green-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-4">
          <FormField name="title" label="Event Title *" placeholder="e.g., Advanced Grammar - Live Session" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="courseName" label="Course Name *" placeholder="English 101" />
            <FormField name="teacherName" label="Teacher Name *" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
            <select
              {...register('type')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
            >
              <option value="live_session">Live Session</option>
              <option value="exam">Exam</option>
              <option value="assignment_due">Assignment Due</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="startDate" label="Start Date *" type="date" />
            <FormField name="startTime" label="Start Time *" type="time" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="endDate" label="End Date *" type="date" />
            <FormField name="endTime" label="End Time *" type="time" />
          </div>
          <FormField name="description" label="Description" placeholder="Enter event description" />
          <FormField name="location" label="Location / Link" placeholder="e.g., Google Meet Link" />

          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditScheduleModal;