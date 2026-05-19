import { Card, Image, Text, Badge, Group, Button, Box } from '@mantine/core';
import { IconHeart, IconBook, IconLanguage, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  view?: 'list' | 'grid';
}

export default function CourseCard({ course, view = 'list' }: CourseCardProps) {
  const teacher = course.teachers?.[0];

  if (view === 'grid') {
    return (
      <Card withBorder shadow="xs" padding="md" style={{ height: '100%' }}>
        <Card.Section>
          <Image
            src={course.image_url || 'https://placehold.co/400x200?text=Course'}
            height={160}
            alt={course.title}
            fit="cover"
          />
        </Card.Section>
        <Box mt="md">
          {course.is_combo && <Badge color="violet" size="sm" mb="xs">Комбо</Badge>}
          <Text fw={600} lineClamp={2} mb="xs">{course.title}</Text>
          <StarRating value={course.average_rating} size={14} />
          <Text size="xs" c="dimmed">({course.reviews_count} отзывов)</Text>
          <Group mt="sm" gap="sm">
            <Text fw={700} c="violet">{course.price.toLocaleString()} ₸</Text>
            <Text size="xs" c="dimmed">| {course.duration}</Text>
          </Group>
          <Button
            component={Link}
            to={`/courses/${course.id}`}
            color="green"
            size="sm"
            fullWidth
            mt="md"
          >
            Подробнее
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="xs" padding={0} mb="md">
      <Group align="stretch" gap={0} wrap="nowrap">
        <Box style={{ width: 180, minWidth: 180, flexShrink: 0 }}>
          <Image
            src={course.image_url || 'https://placehold.co/180x140?text=Course'}
            height={160}
            w={180}
            alt={course.title}
            fit="cover"
            style={{ borderRadius: '8px 0 0 8px' }}
          />
        </Box>
        <Box p="md" style={{ flex: 1, position: 'relative' }}>
          <Box style={{ position: 'absolute', top: 12, right: 12 }}>
            <IconHeart size={20} color="#9ca3af" stroke={1.5} style={{ cursor: 'pointer' }} />
          </Box>
          <Group gap="xs" mb="xs">
            {course.is_combo && <Badge color="violet" size="sm">Комбо</Badge>}
            {course.programs?.length > 0 && (
              <Badge color="gray" size="sm" variant="light">{course.programs.length} курсов</Badge>
            )}
          </Group>
          <Text fw={600} size="lg" mb={4}>{course.title}</Text>
          <Group gap="xs" mb="sm">
            <StarRating value={course.average_rating} size={14} />
            <Text size="xs" c="dimmed">({course.reviews_count} отзывов)</Text>
          </Group>
          <Group gap="xl" mb="sm">
            <Group gap={6}>
              <IconBook size={14} color="#8B5CF6" stroke={1.5} />
              <Box>
                <Text size="xs" c="dimmed">Уроки</Text>
                <Text size="sm" fw={500}>{course.lessons_count} уроков</Text>
              </Box>
            </Group>
            <Group gap={6}>
              <IconLanguage size={14} color="#8B5CF6" stroke={1.5} />
              <Box>
                <Text size="xs" c="dimmed">Язык</Text>
                <Text size="sm" fw={500}>{course.language === 'ru' ? 'Русский язык' : 'Қазақ тілі'}</Text>
              </Box>
            </Group>
            {teacher && (
              <Group gap={6}>
                <IconUser size={14} color="#8B5CF6" stroke={1.5} />
                <Box>
                  <Text size="xs" c="dimmed">Автор</Text>
                  <Text size="sm" fw={500}>{teacher.name}</Text>
                </Box>
              </Group>
            )}
          </Group>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text fw={700} size="lg">{course.price.toLocaleString()} ₸</Text>
              <Text size="sm" c="dimmed">| {course.duration}</Text>
            </Group>
            <Button
              component={Link}
              to={`/courses/${course.id}`}
              color="green"
              size="sm"
            >
              Подписаться
            </Button>
          </Group>
        </Box>
      </Group>
    </Card>
  );
}
