'use client';

import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { WordDetailsView } from '@/features/word/components/WordDetailsView';
import { WordCard } from './components/WordCard';
import { useWords } from '../word/hooks/useWords';
import { useWordDetails } from '../word/hooks/useWordDetails';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';

export function DictionaryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const words = useWords(search, page);

  const selectedDetails = useWordDetails(selectedWord ?? '', Boolean(selectedWord));

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <>
      <Stack component="main" spacing={4}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Dictionary
          </Typography>

          <Typography color="text.secondary">
            Explore thousands of English words and discover their meanings, phonetics and examples.
          </Typography>
        </Stack>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 4,
          }}>
          <TextField
            fullWidth
            label="Search an English word"
            onChange={event => handleSearch(event.target.value)}
            value={search}
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
        </Paper>

        {words.isError && <Alert severity="error">Failed to load dictionary.</Alert>}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}>
          {words.data?.results.map(word => (
            <WordCard key={word} onClick={() => setSelectedWord(word)} word={word} />
          ))}
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <Pagination count={words.data?.totalPages ?? 1} onChange={(_, value) => setPage(value)} page={page} />
        </Paper>
      </Stack>

      <Dialog fullWidth maxWidth="md" onClose={() => setSelectedWord(null)} open={Boolean(selectedWord)}>
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>
          {selectedWord}
          <Tooltip title="Open word in new tab" sx={{ height: '100%', ml: 2 }}>
            <IconButton
              color="primary"
              component={Link}
              href={`/word/${encodeURIComponent(selectedWord ?? '')}`}
              target="_blank"
              size="large">
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <DialogContent dividers>
          {selectedDetails.isError && <Alert severity="error">No definitions found.</Alert>}
          {selectedDetails.isLoading && <Typography color="text.secondary">Loading details...</Typography>}
          {selectedDetails.data && <WordDetailsView details={selectedDetails.data} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
