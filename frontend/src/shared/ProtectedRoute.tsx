'use client';

import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getAuthToken } from '@/features/auth/utils/authStorage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace('/signin');
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
        }}>
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  return children;
}
