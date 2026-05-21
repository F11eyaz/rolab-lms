import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Text, Group, Stack, Anchor, ThemeIcon, Badge, Button
} from '@mantine/core';
import {
  IconHome, IconBuilding, IconBook, IconFileText,
  IconUsers, IconMessage, IconLogout
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/client';

const navItems = [
  { label: 'Дашборд', to: '/admin', icon: <IconHome size={18} stroke={1.5} />, exact: true },
  { label: 'Компания', to: '/admin/company', icon: <IconBuilding size={18} stroke={1.5} /> },
  { label: 'Курсы', to: '/admin/courses', icon: <IconBook size={18} stroke={1.5} /> },
  { label: 'Уроки', to: '/admin/lessons', icon: <IconFileText size={18} stroke={1.5} /> },
  { label: 'Учителя', to: '/admin/teachers', icon: <IconUsers size={18} stroke={1.5} /> },
  { label: 'Отзывы', to: '/admin/reviews', icon: <IconMessage size={18} stroke={1.5} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: reviewsData } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminApi.listReviews().then((r) => r.data.data),
    refetchInterval: 30000,
  });
  const pendingCount = (reviewsData || []).filter((r: { is_approved: boolean }) => !r.is_approved).length;

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <Box style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        style={{
          width: 220,
          background: '#FAFAFA',
          borderRight: '1px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
          <Group gap="sm">
            <img
              src="/logo.jpeg"
              alt="RoLab"
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
            />
            <Text fw={700} size="md">RoLab.LMS</Text>
          </Group>
        </Box>

        {/* Nav */}
        <Stack gap={4} p="sm" style={{ flex: 1 }}>
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <Anchor
                component={Link}
                to={item.to}
                key={item.to}
                style={{ textDecoration: 'none' }}
              >
                <Group
                  gap="sm"
                  p="xs"
                  style={{
                    borderRadius: 6,
                    background: active ? '#e9e3ff' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <ThemeIcon
                    color={active ? 'violet' : 'gray'}
                    variant={active ? 'light' : 'subtle'}
                    size={28}
                    radius="sm"
                  >
                    {item.icon}
                  </ThemeIcon>
                  <Text
                    size="sm"
                    fw={active ? 600 : 400}
                    c={active ? 'violet' : 'dark'}
                  >
                    {item.label}
                  </Text>
                  {item.label === 'Отзывы' && pendingCount > 0 && (
                    <Badge size="xs" color="red" variant="filled" ml="auto">
                      {pendingCount}
                    </Badge>
                  )}
                </Group>
              </Anchor>
            );
          })}
        </Stack>

        {/* User / logout */}
        <Box p="sm" style={{ borderTop: '1px solid #e9ecef' }}>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={16} stroke={1.5} />}
            size="sm"
            fullWidth
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box style={{ marginLeft: 220, flex: 1, background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <Box
          style={{
            height: 60,
            background: '#fff',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <Text fw={600}>
            {navItems.find((n) => isActive(n.to, n.exact))?.label || 'Панель управления'}
          </Text>
          <Anchor
            component={Link}
            to="/"
            c="violet"
            size="sm"
            ml="auto"
          >
            На сайт
          </Anchor>
        </Box>

        {/* Page content */}
        <Box p="xl">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
