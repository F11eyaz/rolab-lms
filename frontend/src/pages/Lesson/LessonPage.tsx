import {
  Box, Container, Paper, Text, Group, Button, Anchor, Skeleton
} from '@mantine/core';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconArrowLeft, IconArrowRight, IconFileText, IconChevronRight, IconBook } from '@tabler/icons-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { lessonsApi, coursesApi } from '../../api/client';
import type { Lesson, Course } from '../../types';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.get(id!).then((r) => r.data.data as Lesson),
    enabled: !!id,
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id],
    queryFn: () => coursesApi.get(lesson!.course_id).then((r) => r.data.data as Course),
    enabled: !!lesson?.course_id,
  });

  if (isLoading) {
    return (
      <Box>
        <Navbar />
        <Container size="xl" py={100}>
          <Skeleton height={40} mb="md" />
          <Skeleton height={500} radius="xl" />
        </Container>
      </Box>
    );
  }
  if (!lesson) return null;

  const lessons = course?.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh' }}>
      <Navbar />

      <Box style={{ paddingTop: 80 }}>
        <Container size="xl">
          <Group align="flex-start" gap="xl" pt={32} pb={48}>

            {/* Сайдбар — список уроков курса */}
            {course && lessons.length > 0 && (
              <Box
                style={{
                  width: 280, flexShrink: 0,
                  position: 'sticky', top: 90,
                  maxHeight: 'calc(100vh - 110px)',
                  overflow: 'hidden',
                }}
                visibleFrom="lg"
              >
                <Paper withBorder radius="xl" p={0} style={{ overflow: 'hidden' }}>
                  <Box p="lg" style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Anchor component={Link} to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                      <Group gap="sm">
                        <Box style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <IconBook size={18} color="white" stroke={1.5} />
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Курс</Text>
                          <Text size="sm" fw={600} lineClamp={1}>{course.title}</Text>
                        </Box>
                      </Group>
                    </Anchor>
                  </Box>
                  <Box style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                    {lessons.map((l, idx) => (
                      <Box
                        key={l.id}
                        component={Link}
                        to={`/lessons/${l.id}`}
                        style={{
                          textDecoration: 'none', display: 'flex',
                          alignItems: 'center', gap: 12,
                          padding: '10px 16px',
                          background: l.id === id ? '#f5f3ff' : 'transparent',
                          borderLeft: l.id === id ? '3px solid #8B5CF6' : '3px solid transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <Text size="xs" c={l.id === id ? 'violet' : 'dimmed'} w={20} ta="right">{idx + 1}</Text>
                        <IconFileText size={14} color={l.id === id ? '#8B5CF6' : '#9ca3af'} stroke={1.5} style={{ flexShrink: 0 }} />
                        <Text size="xs" c={l.id === id ? 'violet' : 'dark'} fw={l.id === id ? 600 : 400} lineClamp={2}>
                          {l.title}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Основной контент */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              {/* Breadcrumb */}
              <Group gap={4} mb={24}>
                <Anchor component={Link} to="/" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Главная</Anchor>
                <IconChevronRight size={12} color="#9ca3af" />
                <Anchor component={Link} to="/courses" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Курсы</Anchor>
                {course && (
                  <>
                    <IconChevronRight size={12} color="#9ca3af" />
                    <Anchor component={Link} to={`/courses/${course.id}`} size="xs" c="dimmed" style={{ textDecoration: 'none' }} lineClamp={1}>
                      {course.title}
                    </Anchor>
                  </>
                )}
                <IconChevronRight size={12} color="#9ca3af" />
                <Text size="xs" c="dimmed" lineClamp={1}>{lesson.title}</Text>
              </Group>

              <Paper withBorder radius="xl" p={40} mb="xl">
                <Group gap="sm" mb={24}>
                  <Box style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconFileText size={20} color="#8B5CF6" stroke={1.5} />
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">
                      Урок {currentIndex + 1} из {lessons.length}
                    </Text>
                    {course && (
                      <Text size="xs" c="violet" fw={600}>{course.title}</Text>
                    )}
                  </Box>
                </Group>

                <Box style={{ borderBottom: '2px solid #f5f3ff', paddingBottom: 24, marginBottom: 32 }}>
                  <Text style={{ fontSize: 34, fontWeight: 900, color: '#1a1a2e', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                    {lesson.title}
                  </Text>
                </Box>

                {lesson.content ? (
                  <Box
                    className="lesson-content"
                    style={{ fontSize: 16, lineHeight: 1.85, color: '#374151', maxWidth: 720 }}
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                ) : (
                  <Text c="dimmed">Содержание урока пока не добавлено.</Text>
                )}
              </Paper>

              <Group justify="space-between">
                <Button
                  variant="light" color="violet" radius={100}
                  leftSection={<IconArrowLeft size={16} />}
                  disabled={!prevLesson}
                  onClick={() => prevLesson && navigate(`/lessons/${prevLesson.id}`)}
                  size="md"
                >
                  {prevLesson ? prevLesson.title : 'Начало'}
                </Button>
                {course && (
                  <Button component={Link} to={`/courses/${course.id}`} variant="subtle" color="gray" size="sm">
                    К содержанию курса
                  </Button>
                )}
                <Button
                  color="violet" radius={100}
                  rightSection={<IconArrowRight size={16} />}
                  disabled={!nextLesson}
                  onClick={() => nextLesson && navigate(`/lessons/${nextLesson.id}`)}
                  size="md"
                >
                  {nextLesson ? nextLesson.title : 'Конец'}
                </Button>
              </Group>
            </Box>
          </Group>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
