import { Container, Group, Text, Anchor, Box, SimpleGrid, Stack } from '@mantine/core';
import { IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      style={{
        background: '#0f0f1a',
        paddingTop: 64,
        paddingBottom: 32,
        marginTop: 100,
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb={48} spacing="xl">
          <Box>
            <Group gap={10} mb="lg" align="center">
              <img
                src="/logo.jpeg"
                alt="RoLab"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
              />
              <Text fw={800} c="white" size="lg">RoLab</Text>
            </Group>
            <Text c="gray.5" size="sm" style={{ lineHeight: 1.8, maxWidth: 240 }}>
              Современная платформа онлайн-образования. Учись у лучших.
            </Text>
          </Box>

          <Stack gap="xs">
            <Text c="gray.4" size="xs" fw={600} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} mb={4}>
              Навигация
            </Text>
            {[
              { label: 'Главная', to: '/' },
              { label: 'Все курсы', to: '/courses' },
            ].map((l) => (
              <Anchor
                key={l.to}
                component={Link}
                to={l.to}
                c="gray.5"
                style={{ textDecoration: 'none', fontSize: 14 }}
              >
                {l.label}
              </Anchor>
            ))}
          </Stack>

          <Stack gap="sm">
            <Text c="gray.4" size="xs" fw={600} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} mb={4}>
              Контакты
            </Text>
            {[
              { icon: <IconMail size={14} />, text: 'info@rolab.kz' },
              { icon: <IconPhone size={14} />, text: '+7 (777) 123-45-67' },
              { icon: <IconMapPin size={14} />, text: 'г. Алматы' },
            ].map((item) => (
              <Group key={item.text} gap={8}>
                <Box c="gray.5">{item.icon}</Box>
                <Text c="gray.5" size="sm">{item.text}</Text>
              </Group>
            ))}
          </Stack>
        </SimpleGrid>

        <Box style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
          <Text c="gray.6" size="xs" ta="center">
            © {new Date().getFullYear()} RoLab. Все права защищены.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
