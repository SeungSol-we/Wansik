import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmPhotoRecognition, createManualMeal, fetchEatingOrder, fetchMealGuide, recognizePhoto } from '../api/meals';

export function useRecognizePhoto() {
  return useMutation({
    mutationFn: ({ file }) => recognizePhoto({ file }),
  });
}

export function useConfirmPhotoMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealType, eatenAt, photoUrl, items }) =>
      confirmPhotoRecognition({ mealType, eatenAt, photoUrl, items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useCreateManualMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealType, eatenAt, items }) => createManualMeal({ mealType, eatenAt, items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useMealGuide(mealId) {
  return useQuery({
    queryKey: ['meal-guide', mealId],
    queryFn: () => fetchMealGuide({ mealId }),
    enabled: Boolean(mealId),
  });
}

export function useEatingOrder(mealId) {
  return useQuery({
    queryKey: ['eating-order', mealId],
    queryFn: () => fetchEatingOrder({ mealId }),
    enabled: Boolean(mealId),
  });
}