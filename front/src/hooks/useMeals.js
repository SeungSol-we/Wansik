import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmPhotoRecognition,
  createManualMeal,
  fetchEatingOrder,
  fetchMealGuide,
  fetchMeals,
  recognizePhoto,
} from '../api/meals';
import { withFallback } from '../api/withFallback';
import { MOCK_MEAL_GUIDE, MOCK_RECOGNITION } from '../api/mockData';
import { useUserStore } from '../store/useUserStore';

export function useMeals({ from, to } = {}) {
  const userId = useUserStore((s) => s.userId);
  return useQuery({
    queryKey: ['meals', userId, from, to],
    queryFn: () => fetchMeals({ userId, from, to }),
    enabled: Boolean(userId),
  });
}

export function useRecognizePhoto() {
  return useMutation({
    mutationFn: ({ file, mealType }) => withFallback(recognizePhoto({ file, mealType }), MOCK_RECOGNITION),
  });
}

export function useConfirmPhotoMeal() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);
  return useMutation({
    mutationFn: ({ mealType, eatenAt, items }) => confirmPhotoRecognition({ userId, mealType, eatenAt, items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useCreateManualMeal() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);
  return useMutation({
    mutationFn: ({ mealType, eatenAt, items }) => createManualMeal({ userId, mealType, eatenAt, items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useMealGuide(mealId) {
  return useQuery({
    queryKey: ['meal-guide', mealId],
    queryFn: () => withFallback(fetchMealGuide({ mealId }), MOCK_MEAL_GUIDE),
    enabled: Boolean(mealId),
  });
}

export function useEatingOrder(mealId) {
  return useQuery({
    queryKey: ['eating-order', mealId],
    queryFn: () =>
      withFallback(fetchEatingOrder({ mealId }), {
        order: MOCK_MEAL_GUIDE.eating_order,
        unclassified: [],
      }),
    enabled: Boolean(mealId),
  });
}