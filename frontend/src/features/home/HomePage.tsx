'use client';

import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitEvent, useState } from 'react';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { useHistory } from './hooks/useHistory';
import { useProfile } from '@/features/home/hooks/useProfile';
import { ProtectedRoute } from '@/shared/ProtectedRoute';

export function HomePage() {
  const [search, setSearch] = useState('');

  const router = useRouter();

  const history = useHistory();
  const profile = useProfile();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const word = search.trim();

    if (word) {
      router.push(`/word/${encodeURIComponent(word)}`);
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <Stack spacing={4}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 4,
            }}>
            <Stack spacing={1}>
              <Typography color="text.secondary">Welcome back,</Typography>

              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                {profile.data?.name ?? 'Reader'}
              </Typography>

              <Typography color="text.secondary">Search, save and organize your favorite words.</Typography>
            </Stack>
          </Paper>

          <Paper
            component="section"
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 4,
            }}>
            <Stack component="form" direction={{ xs: 'column', md: 'row' }} onSubmit={handleSubmit} spacing={2}>
              <TextField
                fullWidth
                label="Search an English word"
                value={search}
                onChange={event => setSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button size="large" sx={{ minWidth: 140 }} type="submit" variant="contained">
                Search
              </Button>
            </Stack>
          </Paper>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
              Search History
            </Typography>

            <Chip icon={<HistoryIcon />} label={`${history.data?.results.length ?? 0} searches`} />
          </Stack>

          {history.isError && <Alert severity="error">Failed to load search history.</Alert>}

          {history.data?.results.length ? (
            <Stack spacing={2}>
              {history.data.results.map(item => (
                <Card
                  component={Link}
                  href={`/word/${encodeURIComponent(item.word)}`}
                  key={`${item.word}-${item.added}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.word}
                    </Typography>

                    <Typography color="text.secondary" variant="body2">
                      {new Date(item.added).toLocaleString('pt-BR')}
                    </Typography>
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
                No searches yet
              </Typography>

              <Typography color="text.secondary">Start searching words to build your history.</Typography>
            </Paper>
          )}
        </Stack>
      </AppLayout>
    </ProtectedRoute>
  );
}
