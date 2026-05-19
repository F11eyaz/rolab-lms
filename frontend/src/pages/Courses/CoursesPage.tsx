import { useState } from 'react';
import {
  Box, Text, Title, TextInput, Group,
  SimpleGrid, Skeleton, Select, Button, Stack
} from '@mantine/core';
import { IconSearch, IconAdjustmentsHorizontal, IconClock, IconBook, IconStarFilled, IconBook2 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Layout/Navbar';
import { coursesApi, categoriesApi } from '../../api/client';
import type { Category, Course } from '../../types';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });
  const categories: (Category & { courses_count: number })[] = catData?.data || [];
  const totalCourses = catData?.total_courses || 0;

  const { data: coursesResp, isLoading } = useQuery({
    queryKey: ['courses', search, selectedCategory, selectedLanguage, sort],
    queryFn: () =>
      coursesApi.list({
        search: search || undefined,
        category_id: selectedCategory || undefined,
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

      <Box style={{ display: 'flex', paddingTop: 72 }}>
        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <Box
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid #f0f0f0',
            minHeight: 'calc(100vh - 72px)',
            position: 'sticky',
            top: 72,
            height: 'calc(100vh - 72px)',
            overflowY: 'auto',
            padding: '32px 0',
          }}
        >
          <Box px="xl" mb="lg">
            <Text fw={700} size="sm" style={{ color: '#09090b', letterSpacing: '-0.2px' }}>
              Категории
            </Text>
          </Box>

          <Stack gap={0}>
            {/* All */}
            <Box
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '10px 24px',
                cursor: 'pointer',
                background: selectedCategory === null ? '#f5f3ff' : 'transparent',
                borderRight: selectedCategory === null ? '2px solid #7c3aed' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Group justify="space-between">
                <Group gap={8}>
                  <Box
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: selectedCategory === null ? '#ede9fe' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBook2 size={14} color={selectedCategory === null ? '#7c3aed' : '#9ca3af'} stroke={1.5} />
                  </Box>
                  <Text
                    size="sm"
                    fw={selectedCategory === null ? 600 : 400}
                    style={{ color: selectedCategory === null ? '#7c3aed' : '#374151' }}
                  >
                    Все курсы
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">{totalCourses}</Text>
              </Group>
            </Box>

            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => setSelectedCategory(active ? null : cat.id)}
                  style={{
                    padding: '10px 24px',
                    cursor: 'pointer',
                    background: active ? '#f5f3ff' : 'transparent',
                    borderRight: active ? '2px solid #7c3aed' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Group justify="space-between">
                    <Text
                      size="sm"
                      fw={active ? 600 : 400}
                      style={{ color: active ? '#7c3aed' : '#374151' }}
                    >
                      {cat.name}
                    </Text>
                    <Text size="xs" c="dimmed">{cat.courses_count || 0}</Text>
                  </Group>
                </Box>
              );
            })}
          </Stack>

          {/* Language filter */}
          <Box px="xl" mt={32}>
            <Text fw={700} size="xs" c="dimmed" mb={12} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Язык
            </Text>
            <Stack gap="xs">
              {[
                { value: null, label: 'Все языки' },
                { value: 'ru', label: 'Русский' },
                { value: 'kz', label: 'Казахский' },
              ].map((lang) => (
                <Box
                  key={String(lang.value)}
                  onClick={() => setSelectedLanguage(lang.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selectedLanguage === lang.value ? '#f5f3ff' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <Text
                    size="sm"
                    fw={selectedLanguage === lang.value ? 600 : 400}
                    c={selectedLanguage === lang.value ? 'violet' : 'dark'}
                  >
                    {lang.label}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <Box style={{ flex: 1, minWidth: 0, padding: '40px 48px' }}>
          {/* Page heading */}
          <Box ta="center" mb={40}>
            <Title
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: '#09090b',
                letterSpacing: '-1px',
                marginBottom: 8,
              }}
            >
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || 'Курсы'
                : 'Все курсы'}
            </Title>
            <Text c="dimmed" size="md">
              {isLoading ? 'Загрузка...' : `${total} курсов доступно`}
            </Text>
          </Box>

          {/* Search + sort bar */}
          <Group mb={32} gap="sm">
            <TextInput
              placeholder="Поиск курсов..."
              leftSection={<IconSearch size={16} stroke={1.5} color="#9ca3af" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
              size="md"
              radius={8}
              styles={{
                input: {
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  '&:focus': { borderColor: '#7c3aed' },
                },
              }}
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
            <Button
              leftSection={<IconAdjustmentsHorizontal size={16} stroke={1.5} />}
              variant="outline"
              size="md"
              radius={8}
              color="gray"
              style={{ borderColor: '#e5e7eb', color: '#374151', fontWeight: 500 }}
            >
              Фильтры
            </Button>
          </Group>

          {/* Course grid */}
          {isLoading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={320} radius={12} />)}
            </SimpleGrid>
          ) : courses.length === 0 ? (
            <Box
              style={{
                border: '1px dashed #e5e7eb',
                borderRadius: 12,
                padding: 80,
                textAlign: 'center',
              }}
            >
              <Text c="dimmed" size="lg" mb={4}>Курсы не найдены</Text>
              <Text c="dimmed" size="sm">Попробуйте изменить запрос или категорию</Text>
            </Box>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {courses.map((course) => <CourseGridCard key={course.id} course={course} />)}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function CourseGridCard({ course }: { course: Course }) {
  const teacher = course.teachers?.[0];

  return (
    <Box
      component={Link}
      to={`/courses/${course.id}`}
      style={{
        textDecoration: 'none',
        display: 'block',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
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
      {/* Image */}
      <Box
        style={{
          height: 200,
          background: course.image_url ? '#000' : 'linear-gradient(135deg, #312e81, #1e1b4b)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBook2 size={40} color="rgba(255,255,255,0.15)" stroke={1} />
          </Box>
        )}
        {course.is_combo && (
          <Box style={{ position: 'absolute', top: 10, left: 10, background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Комбо
          </Box>
        )}
        <Box style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
          {course.price.toLocaleString()} ₸
        </Box>
      </Box>

      {/* Content */}
      <Box p="md">
        <Text fw={700} size="sm" lineClamp={2} mb={6} style={{ color: '#09090b', lineHeight: 1.45 }}>
          {course.title}
        </Text>
        {teacher && (
          <Text size="xs" c="dimmed" mb={10} lineClamp={1}>{teacher.name}</Text>
        )}
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
