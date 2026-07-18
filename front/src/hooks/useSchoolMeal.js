import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMealFromSchoolMeal, fetchSchoolMeal, skipMeal } from '../api/schoolMeals';
import { withFallback } from '../api/withFallback';
import { MOCK_SCHOOL_MEAL } from '../api/mockData';
import { useUserStore } from '../store/useUserStore';

export function useSchoolMeal(date) {
  const schoolCode = useUserStore((s) => s.schoolCode);
  return useQuery({
    queryKey: ['school-meal', schoolCode, date],
    queryFn: () => withFallback(fetchSchoolMeal({ schoolCode, date }), MOCK_SCHOOL_MEAL),
  });
}

export function useConfirmSchoolMeal() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);
  return useMutation({
    mutationFn: ({ date, mealType }) => createMealFromSchoolMeal({ userId, date, mealType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useSkipMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, reason }) => skipMeal({ mealId, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}