import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../services/favoritesService';

export function useFavoriteActions() {
  const queryClient = useQueryClient();

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  const favorite = useMutation({
    mutationFn: addFavorite,
    onSuccess: invalidateFavorites,
  });

  const unfavorite = useMutation({
    mutationFn: removeFavorite,
    onSuccess: invalidateFavorites,
  });

  return { favorite, unfavorite };
}
