'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import { Alert, Card, CardContent, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useFavorites } from './hooks/useFavorites';
import { useFavoriteActions } from './hooks/useFavoritesActions';

export function FavoritesPage() {
  const favorites = useFavorites(1, 50);
  const { unfavorite } = useFavoriteActions();

  return (
    <>
      <Paper
        component="main"
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
        }}>
        <Stack spacing={3} sx={{ p: 4 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Favorite Words
              </Typography>

              <Typography color="text.secondary">{favorites.data?.totalDocs ?? 0} saved words</Typography>
            </Stack>

            <Chip color="primary" label={`${favorites.data?.totalDocs ?? 0} favorites`} />
          </Stack>

          {favorites.isError ? <Alert severity="error">Failed to load favorites.</Alert> : null}

          {favorites.data?.results.length ? (
            <Stack spacing={2}>
              {favorites.data.results.map(item => (
                <Card
                  elevation={1}
                  key={item.word}
                  sx={{
                    borderRadius: 3,
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack
                        component={Link}
                        href={`/word/${encodeURIComponent(item.word)}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'inherit',
                          flex: 1,
                        }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.word}
                        </Typography>

                        <Typography color="text.secondary" variant="body2">
                          Added on {new Date(item.added).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Stack>

                      <IconButton
                        color="error"
                        disabled={unfavorite.isPending}
                        onClick={() => unfavorite.mutate(item.word)}>
                        <FavoriteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
              }}>
              <Typography gutterBottom variant="h6">
                No favorite words yet
              </Typography>

              <Typography color="text.secondary">
                Start exploring the dictionary and save your favorite words.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </>
  );
}
