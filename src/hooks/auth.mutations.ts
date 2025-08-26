import { login, logout, register } from '@/apis/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../interface/auth.interface'


export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}


export function useRegisterMutation() {
  const queryClient = useQueryClient()
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
