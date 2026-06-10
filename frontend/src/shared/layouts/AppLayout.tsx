'use client';

import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';
import { Navigation } from './Navigation';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
      }}
    >
      <Navigation />

      <Container
        sx={{
          py: 4,
        }}
        maxWidth="xl"
      >
        {children}
      </Container>
    </Box>
  );
}