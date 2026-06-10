'use client';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Avatar, Button, Stack, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser } from '@/features/auth/utils/authStorage';
import { useLogout } from '@/features/auth/hooks/useLogout';

const links = [
  { href: '/', label: 'Home' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/dictionary', label: 'Dictionary' },
];

export function Navigation() {
  const pathname = usePathname();
  const logout = useLogout();
  const user = getStoredUser();

  return (
    <AppBar
      color="transparent"
      elevation={0}
      position="sticky"
      sx={{
        backdropFilter: 'blur(10px)',
        bgcolor: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
      <Toolbar>
        <Stack direction="row" spacing={1} sx={{ mr: 4, alignItems: 'center' }}>
          <MenuBookIcon color="primary" />

          <Typography color="primary" variant="h6" sx={{ fontWeight: 700 }}>
            Dictionary
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          {links.map(link => {
            const active = pathname === link.href;

            return (
              <Button
                key={link.href}
                LinkComponent={Link}
                href={link.href}
                color={active ? 'primary' : 'inherit'}
                variant={active ? 'contained' : 'text'}
                sx={{
                  borderRadius: 999,
                }}>
                {link.label}
              </Button>
            );
          })}
        </Stack>

        {user && (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
              }}>
              {user.name[0]?.toUpperCase()}
            </Avatar>

            <Typography
              color="text.secondary"
              sx={{
                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}>
              {user.name}
            </Typography>

            <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
