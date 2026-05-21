import { SimpleGrid, Paper, Text, ThemeIcon, Group, Title, Badge } from '@mantine/core';
import { IconBook, IconFileText, IconUsers, IconMessage } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/client';

export default function Dashboard() {
  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.listCourses().then((r) => r.data.data),
  });
  const { data: lessons = [] } = useQuery({
    queryKey: ['admin', 'lessons'],
    queryFn: () => adminApi.listLessons().then((r) => r.data.data),
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: () => adminApi.listTeachers().then((r) => r.data.data),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminApi.listReviews().then((r) => r.data.data),
  });
  const pending = (reviews as { is_approved: boolean }[]).filter((r) => !r.is_approved).length;

  const stats = [
    { label: 'Курсы', value: (courses as unknown[]).length, icon: <IconBook size={24} stroke={1.5} />, color: 'violet' },
    { label: 'Уроки', value: (lessons as unknown[]).length, icon: <IconFileText size={24} stroke={1.5} />, color: 'green' },
    { label: 'Учителя', value: (teachers as unknown[]).length, icon: <IconUsers size={24} stroke={1.5} />, color: 'orange' },
    { label: 'Отзывы', value: (reviews as unknown[]).length, icon: <IconMessage size={24} stroke={1.5} />, color: 'pink', badge: pending },
  ];

  return (
    <div>
      <Title order={2} mb="xl">Обзор</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
        {stats.map((s) => (
          <Paper key={s.label} withBorder p="lg" radius="md">
            <Group justify="space-between" mb="md">
              <ThemeIcon color={s.color} variant="light" size={48} radius="md">
                {s.icon}
              </ThemeIcon>
              {s.badge ? (
                <Badge color="red" variant="filled">{s.badge} ожидают</Badge>
              ) : null}
            </Group>
            <Text size="2xl" fw={700} style={{ fontSize: 32 }}>{s.value}</Text>
            <Text size="sm" c="dimmed">{s.label}</Text>
          </Paper>
        ))}
      </SimpleGrid>
    </div>
  );
}
