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
import { useSignUp } from '../../hooks/useSignUp';
import Image from 'next/image';

export function SignupPage() {
  const signUp = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signUp.mutate({
      name,
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
          maxWidth: 460,
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
              Create Account
            </Typography>

            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Create your account and start building your personal dictionary.
            </Typography>
          </Stack>

          {signUp.error && <Alert severity="error">{signUp.error.message}</Alert>}

          <TextField
            autoComplete="name"
            fullWidth
            label="Name"
            onChange={event => setName(event.target.value)}
            required
            value={name}
          />

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
            autoComplete="new-password"
            fullWidth
            helperText="Use at least 6 characters."
            label="Password"
            onChange={event => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          <Button disabled={signUp.isPending} fullWidth size="large" type="submit" variant="contained">
            {signUp.isPending ? <CircularProgress color="inherit" size={20} /> : 'Create Account'}
          </Button>

          <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <MuiLink component={Link} href="/signin" underline="hover">
              Sign in
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
