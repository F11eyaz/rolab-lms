import { useState } from 'react';
import {
  Box, Text, Title, TextInput, Group,
  SimpleGrid, Skeleton, Select, Container
} from '@mantine/core';
import { IconSearch, IconClock, IconBook, IconStarFilled, IconBook2 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { coursesApi } from '../../api/client';
import type { Course } from '../../types';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');

  const { data: coursesResp, isLoading } = useQuery({
    queryKey: ['courses', search, selectedLanguage, sort],
    queryFn: () =>
      coursesApi.list({
        search: search || undefined,
        language: selectedLanguage || undefined,
        sort,
        limit: 30,
      }).then((r) => r.data),
  });
  const courses: Course[] = coursesResp?.data || [];
  const total = coursesResp?.total || 0;

  return (
    <Box style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />

      <Box style={{ paddingTop: 88, paddingBottom: 80 }}>
        <Container size="xl">
          {/* Heading */}
          <Box ta="center" mb={48}>
            <Title style={{ fontSize: 40, fontWeight: 900, color: '#09090b', letterSpacing: '-1px', marginBottom: 8 }}>
              Все курсы
            </Title>
            <Text c="dimmed" size="md">
              {isLoading ? 'Загрузка...' : `${total} курсов доступно`}
            </Text>
          </Box>

          {/* Search + sort */}
          <Group mb={40} gap="sm">
            <TextInput
              placeholder="Поиск курсов..."
              leftSection={<IconSearch size={16} stroke={1.5} color="#9ca3af" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
              size="md"
              radius={8}
              styles={{ input: { border: '1px solid #e5e7eb', fontSize: 14 } }}
            />
            <Select
              data={[
                { value: 'newest', label: 'Новые' },
                { value: 'rating', label: 'По рейтингу' },
                { value: 'price_asc', label: 'Дешевле' },
                { value: 'price_desc', label: 'Дороже' },
              ]}
              value={sort}
              onChange={(v) => setSort(v || 'newest')}
              size="md"
              radius={8}
              w={160}
              styles={{ input: { border: '1px solid #e5e7eb' } }}
            />
            <Select
              data={[
                { value: '', label: 'Все языки' },
                { value: 'ru', label: 'Русский' },
                { value: 'kz', label: 'Казахский' },
              ]}
              value={selectedLanguage ?? ''}
              onChange={(v) => setSelectedLanguage(v || null)}
              size="md"
              radius={8}
              w={150}
              styles={{ input: { border: '1px solid #e5e7eb' } }}
            />
          </Group>

          {/* Grid */}
          {isLoading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={320} radius={12} />)}
            </SimpleGrid>
          ) : courses.length === 0 ? (
            <Box style={{ border: '1px dashed #e5e7eb', borderRadius: 12, padding: 80, textAlign: 'center' }}>
              <Text c="dimmed" size="lg" mb={4}>Курсы не найдены</Text>
              <Text c="dimmed" size="sm">Попробуйте изменить запрос</Text>
            </Box>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {courses.map((course) => <CourseGridCard key={course.id} course={course} />)}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

function CourseGridCard({ course }: { course: Course }) {
  return (
    <Box
      component={Link}
      to={`/courses/${course.id}`}
      style={{
        textDecoration: 'none', display: 'block',
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.09)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      <Box style={{ height: 200, background: course.image_url ? '#000' : 'linear-gradient(135deg, #312e81, #1e1b4b)', position: 'relative', overflow: 'hidden' }}>
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <Box style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBook2 size={40} color="rgba(255,255,255,0.15)" stroke={1} />
          </Box>
        )}
        {course.is_combo && (
          <Box style={{ position: 'absolute', top: 10, left: 10, background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
            Комбо
          </Box>
        )}
        <Box style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
          {course.price > 0 ? `${course.price.toLocaleString()} ₸` : 'Бесплатно'}
        </Box>
      </Box>
      <Box p="md">
        <Text fw={700} size="sm" lineClamp={2} mb={6} style={{ color: '#09090b', lineHeight: 1.45 }}>{course.title}</Text>
        <Group gap="lg" style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          <Group gap={4}>
            <IconStarFilled size={12} color="#f59e0b" />
            <Text size="xs" fw={600} c="dark">{course.average_rating.toFixed(1)}</Text>
          </Group>
          <Group gap={4}>
            <IconBook size={12} color="#9ca3af" stroke={1.5} />
            <Text size="xs" c="dimmed">{course.lessons_count} ур.</Text>
          </Group>
          <Group gap={4}>
            <IconClock size={12} color="#9ca3af" stroke={1.5} />
            <Text size="xs" c="dimmed">{course.duration}</Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
