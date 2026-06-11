'use client';

import { Alert, CircularProgress, Paper, Stack, Typography } from '@mui/material';

import { WordDetailsView } from '@/features/word/components/WordDetailsView';
import { useWordDetails } from './hooks/useWordDetails';
import { useFavorites } from '../favorites/hooks/useFavorites';
import { useFavoriteActions } from '../favorites/hooks/useFavoritesActions';

type Props = {
  word: string;
};

export function WordPage({ word }: Props) {
  const details = useWordDetails(word);

  const favorites = useFavorites(1, 100);

  const { favorite, unfavorite } = useFavoriteActions();

  const normalizedWord = word.toLowerCase();

  const isFavorite = Boolean(favorites.data?.results.some(item => item.word.toLowerCase() === normalizedWord));

  const isToggling = favorite.isPending || unfavorite.isPending;

  function handleToggleFavorite() {
    if (isFavorite) {
      unfavorite.mutate(word);
      return;
    }

    favorite.mutate(word);
  }

  return (
    <>
      <Paper
        component="main"
        elevation={2}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
        }}>
        {details.isLoading && (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />

            <Typography color="text.secondary">Loading word details...</Typography>
          </Stack>
        )}

        {details.isError && <Alert severity="error">Failed to load details for "{word}".</Alert>}

        {(favorite.isError || unfavorite.isError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to update favorites.
          </Alert>
        )}

        {details.data && (
          <WordDetailsView
            details={details.data}
            isFavorite={isFavorite}
            isToggling={isToggling}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </Paper>
    </>
  );
}
