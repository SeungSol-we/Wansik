import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMealFromSchoolMeal, fetchSchoolMeal, skipMeal } from '../api/schoolMeals';
import { useUserStore } from '../store/useUserStore';

export function useSchoolMeal(date, mealType = 'LUNCH') {
  const schoolCode = useUserStore((s) => s.schoolCode);
  return useQuery({
    queryKey: ['school-meal', schoolCode, date, mealType],
    queryFn: () => fetchSchoolMeal({ schoolCode, date, mealType }),
    enabled: Boolean(schoolCode),
  });
}

export function useConfirmSchoolMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, mealType }) => createMealFromSchoolMeal({ date, mealType }),
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