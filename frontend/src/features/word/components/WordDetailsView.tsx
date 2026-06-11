'use client';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Alert, Box, Chip, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import { WordDetails } from '../types/word';

type WordDetailsViewProps = {
  details?: WordDetails[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isToggling?: boolean;
};

export function WordDetailsView({
  details,
  isFavorite = false,
  onToggleFavorite,
  isToggling = false,
}: WordDetailsViewProps) {
  const entry = details?.[0];

  if (!entry) {
    return <Alert severity="info">No details available for this word.</Alert>;
  }

  const phonetic = entry.phonetic ?? entry.phonetics?.find(item => item.text)?.text;

  const audio = entry.phonetics?.find(item => item.audio)?.audio;

  return (
    <Stack spacing={3}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 4,
        }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Box
            sx={{
              minWidth: 0,
            }}>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 700,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                fontSize: {
                  xs: '2.5rem',
                  md: '3rem',
                },
              }}>
              {entry.word}
            </Typography>

            {phonetic && (
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="h6">
                {phonetic}
              </Typography>
            )}
          </Box>

          {onToggleFavorite && (
            <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'} sx={{ height: '100%' }}>
              <IconButton
                color={isFavorite ? 'error' : 'default'}
                disabled={isToggling}
                onClick={onToggleFavorite}
                size="large">
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {audio && (
          <Box
            sx={{
              mt: 3,
              '& audio': {
                width: {
                  xs: '100%',
                  sm: '40%',
                },
                maxWidth: '100%',
              },
            }}>
            <audio controls src={audio}>
              Your browser does not support audio.
            </audio>
          </Box>
        )}
      </Paper>

      <Stack spacing={3}>
        {entry.meanings?.map((meaning, meaningIndex) => (
          <Paper
            elevation={1}
            key={`${meaning.partOfSpeech}-${meaningIndex}`}
            sx={{
              p: 3,
              borderRadius: 3,
            }}>
            <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Chip color="primary" label={meaning.partOfSpeech} />

              <Divider flexItem sx={{ flexGrow: 1 }} />
            </Stack>

            <Stack
              component="ol"
              spacing={3}
              sx={{
                pl: 3,
                m: 0,
              }}>
              {meaning.definitions.map((definition, definitionIndex) => (
                <li key={`${definition.definition}-${definitionIndex}`}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {definition.definition}
                  </Typography>

                  {definition.example && (
                    <Paper
                      sx={{
                        mt: 1.5,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                      variant="outlined">
                      <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{definition.example}"
                      </Typography>
                    </Paper>
                  )}
                </li>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>

      {entry.sourceUrls?.length ? (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 3,
          }}>
          <Typography gutterBottom variant="h6" sx={{ fontWeight: 600 }}>
            Sources
          </Typography>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {entry.sourceUrls.map(url => (
              <Chip clickable component={Link} href={url} key={url} label={url} target="_blank" variant="outlined" />
            ))}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
