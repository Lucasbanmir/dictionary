'use client';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSignIn } from '../../hooks/useSignIn';
import Image from 'next/image';

export function SigninPage() {
  const signIn = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signIn.mutate({
      email,
      password,
    });
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundColor: '#f8fafc',
      }}>
      <Paper
        component="main"
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
        }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Image src="/logo.png" alt="Logo" width={48} height={48} />

            <Typography color="primary" variant="h5" sx={{ fontWeight: 700 }}>
              Dictionary
            </Typography>

            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Sign In
            </Typography>

            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Sign in to access your personal dictionary and manage your favorite words.
            </Typography>
          </Stack>

          {signIn.error && <Alert severity="error">{signIn.error.message}</Alert>}

          <TextField
            autoComplete="email"
            fullWidth
            label="Email"
            onChange={event => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />

          <TextField
            autoComplete="current-password"
            fullWidth
            label="Password"
            onChange={event => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          <Button disabled={signIn.isPending} fullWidth size="large" type="submit" variant="contained">
            {signIn.isPending ? <CircularProgress color="inherit" size={20} /> : 'Sign In'}
          </Button>

          <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <MuiLink component={Link} href="/signup" underline="hover">
              Create one
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
