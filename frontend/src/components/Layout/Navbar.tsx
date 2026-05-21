import { useState, useEffect } from 'react';
import { Group, Text, Box, Anchor, Drawer, Stack, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'О компании', to: '/' },
  { label: 'Платформа', to: '/platform' },
  { label: 'Курсы', to: '/courses' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, { open, close }] = useDisclosure(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Box
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          transition: 'background 0.3s ease',
        }}
      >
        <Box style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <Group justify="space-between" align="center" style={{ height: 68 }}>

            {/* Logo */}
            <Anchor component={Link} to="/" style={{ textDecoration: 'none' }}>
              <Group gap={10} align="center">
                <img
                  src="/logo.jpeg"
                  alt="RoLab"
                  style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }}
                />
                <Text fw={900} size="lg" style={{ color: '#0a0a0a', letterSpacing: '-0.5px' }}>
                  RoLab
                </Text>
              </Group>
            </Anchor>

            {/* Nav links */}
            <Group gap={4} visibleFrom="sm">
              {links.map((l) => {
                const active = location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to));
                return (
                  <Anchor
                    key={l.to}
                    component={Link}
                    to={l.to}
                    style={{
                      textDecoration: 'none',
                      padding: '7px 16px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#7c3aed' : '#555',
                      background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {l.label}
                  </Anchor>
                );
              })}
            </Group>

            {/* Mobile menu */}
            <ActionIcon hiddenFrom="sm" variant="subtle" size="lg" style={{ color: '#333' }} onClick={open}>
              <IconMenu2 size={20} />
            </ActionIcon>
          </Group>
        </Box>
      </Box>

      <Drawer opened={drawerOpen} onClose={close} size="xs" withCloseButton={false} styles={{ body: { padding: 24 } }}>
        <Group justify="space-between" mb="xl">
          <Group gap={8}>
            <img src="/logo.jpeg" alt="RoLab" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <Text fw={900} size="md">RoLab</Text>
          </Group>
          <ActionIcon variant="subtle" onClick={close}><IconX size={18} /></ActionIcon>
        </Group>
        <Stack gap="xs">
          {links.map((l) => (
            <Anchor key={l.to} component={Link} to={l.to} onClick={close}
              style={{ textDecoration: 'none', color: '#333', fontSize: 16, fontWeight: 500, padding: '8px 0' }}>
              {l.label}
            </Anchor>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}
