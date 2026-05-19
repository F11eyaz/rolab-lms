import {
  Box, Container, Text, Title, Group, Button, Avatar, Paper,
  Stack, Skeleton
} from '@mantine/core';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconBook, IconUser, IconFileText, IconClock } from '@tabler/icons-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { programsApi } from '../../api/client';
import type { Program } from '../../types';

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => programsApi.get(id!).then((r) => r.data.data as Program),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box>
        <Navbar />
        <Skeleton height={400} />
        <Container size="xl" py="xl"><Skeleton height={400} radius="xl" /></Container>
      </Box>
    );
  }
  if (!program) return null;

  const teacher = program.teachers?.[0];

  return (
    <Box style={{ background: '#fafafa' }}>
      <Navbar />

      {/* Hero — светлый */}
      <Box
        style={{
          background: '#f8f7ff',
          borderBottom: '1px solid #ede9fe',
          paddingTop: 90,
          paddingBottom: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box style={{ position: 'absolute', top: '-20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,196,212,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Group gap={6} mb={24}>
            <Text component={Link} to="/" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Главная</Text>
            <Text size="xs" c="dimmed">/</Text>
            <Text component={Link} to="/courses" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Курсы</Text>
            <Text size="xs" c="dimmed">/</Text>
            <Text size="xs" c="dark" lineClamp={1}>{program.title}</Text>
          </Group>

          <Group align="flex-start" gap="xl" wrap="nowrap">
            <Box style={{ flex: 1 }}>
              <Title style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#0a0a0a', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 20 }}>
                {program.title}
              </Title>
              <Group gap="xl" mb={20} wrap="wrap">
                <Group gap={6}>
                  <IconBook size={15} color="#9C5FE5" stroke={1.5} />
                  <Text c="dimmed" size="sm">{program.lessons_count} уроков</Text>
                </Group>
                <Group gap={6}>
                  <IconClock size={15} color="#9C5FE5" stroke={1.5} />
                  <Text c="dimmed" size="sm">1 месяц</Text>
                </Group>
                {teacher && (
                  <Group gap={6}>
                    <IconUser size={15} color="#9C5FE5" stroke={1.5} />
                    <Text c="dimmed" size="sm">{teacher.name}</Text>
                  </Group>
                )}
              </Group>
              {program.description && (
                <Text c="dimmed" size="md" style={{ lineHeight: 1.7, maxWidth: 560 }}>
                  {program.description}
                </Text>
              )}
            </Box>

            {/* Enrollment box */}
            <Box
              style={{
                width: 280, flexShrink: 0,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 20, padding: 24,
                boxShadow: '0 4px 24px rgba(156,95,229,0.08)',
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: 900, color: '#0a0a0a', marginBottom: 4 }}>
                {program.price.toLocaleString()} ₸
              </Text>
              <Text c="dimmed" size="xs" mb={20}>/ 1 месяц</Text>
              <Button fullWidth size="md" radius={12}
                style={{ background: 'linear-gradient(135deg, #9C5FE5, #F0875A)', border: 'none', fontWeight: 700, height: 46 }}>
                Записаться
              </Button>
            </Box>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py={48}>
        <Group align="flex-start" gap="xl">
          <Box style={{ flex: 1, minWidth: 0 }}>
            {/* Teacher */}
            {program.teachers?.length > 0 && (
              <Box mb={40}>
                <Text size="xs" c="violet" fw={700} mb={16} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Преподаватель
                </Text>
                {program.teachers.map((t) => (
                  <Paper key={t.id} withBorder p="lg" radius="xl">
                    <Group gap="lg">
                      <Avatar src={t.photo_url || undefined} size={64} radius="50%" color="violet" style={{ border: '3px solid #f0ebff' }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Text size="xs" c="violet" fw={600} mb={2}>Автор курса</Text>
                        <Text fw={700} size="lg">{t.name}</Text>
                        <Text size="sm" c="dimmed">{t.specialty}</Text>
                      </Box>
                    </Group>
                  </Paper>
                ))}
              </Box>
            )}

            {/* Lessons list */}
            <Box>
              <Text size="xs" c="violet" fw={700} mb={16} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Содержание — {program.lessons_count} уроков
              </Text>
              {program.lessons?.length === 0 ? (
                <Paper withBorder p={48} radius="xl" ta="center">
                  <Text c="dimmed">Уроки ещё не добавлены</Text>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {program.lessons?.map((lesson, index) => (
                    <Paper
                      key={lesson.id}
                      withBorder
                      radius="xl"
                      p={0}
                      component={Link}
                      to={`/lessons/${lesson.id}`}
                      style={{ textDecoration: 'none', overflow: 'hidden' }}
                    >
                      <Group gap={0} align="center">
                        <Box
                          style={{
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fafafa',
                            borderRight: '1px solid #eee',
                            flexShrink: 0,
                          }}
                        >
                          <Text size="sm" c="dimmed" fw={600}>{String(index + 1).padStart(2, '0')}</Text>
                        </Box>
                        <Group gap="sm" style={{ flex: 1, padding: '12px 16px' }}>
                          <IconFileText size={16} color="#8B5CF6" stroke={1.5} style={{ flexShrink: 0 }} />
                          <Text size="sm" fw={500} c="dark">{lesson.title}</Text>
                        </Group>
                        <Box style={{ padding: '0 16px' }}>
                          <Text size="xs" c="violet" fw={500}>Читать →</Text>
                        </Box>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Group>
      </Container>

      <Footer />
    </Box>
  );
}
