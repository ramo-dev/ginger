import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Preference } from '@/db/schema'

export type UserPreferences = Preference

// API functions
const fetchPreferences = async (): Promise<UserPreferences> => {
  const response = await fetch('/api/preferences')
  if (!response.ok) {
    throw new Error('Failed to fetch preferences')
  }
  return response.json()
}

const updatePreferences = async (
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> => {
  const response = await fetch('/api/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  })
  if (!response.ok) {
    throw new Error('Failed to update preferences')
  }
  return response.json()
}

// Hooks
export const usePreferences = () => {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: fetchPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['preferences'], updatedPreferences)
    },
  })
}
