
// import { useQuery } from "@tanstack/react-query"

// export function useClassroomDetail(classroomId?: string) {
//   return useQuery({
//     queryKey: ["classroom-detail", classroomId],
//     queryFn: () => {
//       if (!classroomId) throw new Error("Missing classroomId")
//       return getClassroomDetail(classroomId)
//     },
//     enabled: !!classroomId,
//     staleTime: 1000 * 60 * 5, // 5 phút
//   })
// }
