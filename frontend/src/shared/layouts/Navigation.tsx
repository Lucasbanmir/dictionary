'use client';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Avatar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser } from '@/features/auth/utils/authStorage';
import { useLogout } from '@/features/auth/hooks/useLogout';
import Image from 'next/image';

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
      <Toolbar
        sx={{
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: {
            xs: 2,
            sm: 0,
          },
          py: {
            xs: 2,
            sm: 0,
          },
        }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            mr: {
              xs: 0,
              sm: 4,
            },
            justifyContent: 'center',
            width: {
              xs: '100%',
              sm: 'auto',
            },
          }}>
          <Image src="/logo.png" alt="Logo" width={32} height={32} />

          <Typography color="primary" variant="h6" sx={{ fontWeight: 700 }}>
            Dictionary
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexGrow: {
              xs: 0,
              sm: 1,
            },
            width: {
              xs: '100%',
              sm: 'auto',
            },
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
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

            <Button
              color="inherit"
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                minWidth: 'auto',
              }}>
              <Box
                component="span"
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'inline',
                  },
                }}>
                Logout
              </Box>
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
