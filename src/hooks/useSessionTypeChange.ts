import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SessionType } from '@/interface/classroom.interface';
import { updateSessionType } from '@/apis/classroom';

interface UpdateSessionTypeParams {
  sessionId: string;
  type: SessionType;
  generateMeetLink?: boolean;
}

interface UpdateSessionTypeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    type: SessionType;
    meetingUrl?: string | null;
  };
}

export function useSessionTypeChange() {
  const queryClient = useQueryClient();

  return useMutation<UpdateSessionTypeResponse, Error, UpdateSessionTypeParams>({
    mutationFn: async ({ sessionId, type, generateMeetLink }) => {
      return await updateSessionType(sessionId, { type, generateMeetLink });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['system-schedule'] });
    },
  });
}
