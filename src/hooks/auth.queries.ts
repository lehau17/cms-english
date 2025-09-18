import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/apis/auth";

export const useGetMe = (options?: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: options?.enabled,
  });
};
