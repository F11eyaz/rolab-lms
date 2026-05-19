import { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Text, Title, Group, Button, Avatar, Paper,
  Progress, Textarea, TextInput, Select, Skeleton, Stack, Divider, ThemeIcon
} from '@mantine/core';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  IconBook, IconLanguage,
  IconStarFilled, IconStar, IconClock, IconChevronRight
} from '@tabler/icons-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import StarRating from '../../components/StarRating';
import { coursesApi, programsApi } from '../../api/client';
import type { Course, Review } from '../../types';

const NAV_ITEMS = [
  { id: 'about', label: 'О курсе' },
  { id: 'teachers', label: 'Преподаватели' },
  { id: 'content', label: 'Содержание' },
  { id: 'reviews', label: 'Отзывы' },
];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('about');

  const aboutRef = useRef<HTMLDivElement>(null);
  const teachersRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    about: aboutRef,
    teachers: teachersRef,
    content: contentRef,
    reviews: reviewsRef,
  };

  const scrollTo = (sectionId: string) => {
    const ref = refs[sectionId];
    if (ref?.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Highlight active nav item on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 160;
      for (const { id: sid } of [...NAV_ITEMS].reverse()) {
        const el = refs[sid]?.current;
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sid);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.get(id!).then((r) => r.data.data as Course),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => coursesApi.getReviews(id!).then((r) => r.data.data as Review[]),
    enabled: !!id,
  });

  const [reviewForm, setReviewForm] = useState({ author_name: '', comment: '', rating: 0, program_id: '' });

  const submitReview = useMutation({
    mutationFn: ({ program_id, ...data }: typeof reviewForm) =>
      programsApi.submitReview(program_id, data),
    onSuccess: () => {
      notifications.show({ message: 'Отзыв успешно добавлен!', color: 'green' });
      setReviewForm({ author_name: '', comment: '', rating: 0, program_id: '' });
      qc.invalidateQueries({ queryKey: ['reviews', id] });
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Navbar />
        <Skeleton height={400} />
        <Container size="xl" py="xl"><Skeleton height={300} radius="xl" /></Container>
      </Box>
    );
  }
  if (!course) return null;

  const teacher = course.teachers?.[0];
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));

  return (
    <Box style={{ background: '#fafafa' }}>
      <Navbar />

      {/* Hero banner — светлый */}
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
        {/* Soft blobs */}
        <Box style={{ position: 'absolute', top: '-20%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(156,95,229,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Box style={{ position: 'absolute', bottom: '-20%', right: '0%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,196,212,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <Group gap={6} mb={24}>
            <Text component={Link} to="/" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Главная</Text>
            <Text size="xs" c="dimmed">/</Text>
            <Text component={Link} to="/courses" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Курсы</Text>
            <Text size="xs" c="dimmed">/</Text>
            <Text size="xs" c="dark" lineClamp={1}>{course.title}</Text>
          </Group>

          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Left info */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Title
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 40px)',
                  fontWeight: 900,
                  color: '#0a0a0a',
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                  marginBottom: 20,
                }}
              >
                {course.title}
              </Title>

              <Group gap="lg" mb={20} wrap="wrap">
                <Group gap={5}>
                  <IconStarFilled size={15} color="#f59e0b" />
                  <Text fw={700} size="sm" c="dark">{course.average_rating.toFixed(1)}</Text>
                  <Text size="sm" c="dimmed">({course.reviews_count} отзывов)</Text>
                </Group>
                <Group gap={5}>
                  <IconBook size={15} color="#9C5FE5" stroke={1.5} />
                  <Text size="sm" c="dimmed">
                    {course.programs_count || course.programs?.length || 0} программ · {course.lessons_count} уроков
                  </Text>
                </Group>
                <Group gap={5}>
                  <IconClock size={15} color="#9C5FE5" stroke={1.5} />
                  <Text size="sm" c="dimmed">{course.duration}</Text>
                </Group>
                <Group gap={5}>
                  <IconLanguage size={15} color="#9C5FE5" stroke={1.5} />
                  <Text size="sm" c="dimmed">{course.language === 'ru' ? 'Русский' : 'Казахский'}</Text>
                </Group>
              </Group>

              {teacher && (
                <Group gap="sm">
                  <Avatar
                    src={teacher.photo_url || undefined}
                    size={30} radius="50%" color="violet"
                    style={{ border: '2px solid #ede9fe' }}
                  >
                    {teacher.name.charAt(0)}
                  </Avatar>
                  <Text size="sm" c="dark" fw={500}>{teacher.name}</Text>
                </Group>
              )}
            </Box>

            {/* Enrollment card */}
            <Box
              style={{
                width: 280,
                flexShrink: 0,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 24px rgba(156,95,229,0.08)',
              }}
            >
              <Box
                style={{
                  height: 130,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #9C5FE5, #7B66E8)',
                  marginBottom: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {course.image_url
                  ? <img src={course.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <IconBook size={40} color="rgba(255,255,255,0.4)" stroke={1} />
                }
              </Box>
              <Text style={{ fontSize: 30, fontWeight: 900, color: '#0a0a0a', marginBottom: 2 }}>
                {course.price.toLocaleString()} ₸
              </Text>
              <Text c="dimmed" size="xs" mb={16}>/ {course.duration}</Text>
              <Button
                fullWidth size="md" radius={12}
                style={{
                  background: 'linear-gradient(135deg, #9C5FE5, #F0875A)',
                  border: 'none',
                  fontWeight: 700,
                  height: 46,
                }}
              >
                Записаться на курс
              </Button>
            </Box>
          </Group>
        </Container>
      </Box>

      {/* ── Sticky anchor navigation ─────────────────── */}
      <Box
        style={{
          position: 'sticky',
          top: 68,
          zIndex: 100,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Container size="xl">
          <Group gap={4} py={4}>
            {NAV_ITEMS.map(({ id: sid, label }) => {
              const active = activeSection === sid;
              return (
                <Button
                  key={sid}
                  variant="subtle"
                  onClick={() => scrollTo(sid)}
                  style={{
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 100,
                    fontWeight: active ? 600 : 400,
                    fontSize: 14,
                    color: active ? '#7c3aed' : '#6b7280',
                    background: active ? 'transparent' : 'transparent',
                    border: active ? '1.5px solid #7c3aed' : '1.5px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Group>
        </Container>
      </Box>

      {/* ── ALL SECTIONS on one page ────────────────── */}
      <Container size="xl" py={48}>
        <Box style={{ maxWidth: 800 }}>

          {/* О курсе */}
          <Box ref={aboutRef} mb={64}>
            <Text fw={800} size="xl" mb={20} style={{ color: '#0a0a0a' }}>О курсе</Text>
            <Paper withBorder p="xl" radius="xl">
              <div
                className="lesson-content"
                dangerouslySetInnerHTML={{ __html: course.description || '<p>Описание курса отсутствует.</p>' }}
              />
            </Paper>
          </Box>

          {/* Преподаватели */}
          <Box ref={teachersRef} mb={64}>
            <Text fw={800} size="xl" mb={20} style={{ color: '#0a0a0a' }}>Преподаватели</Text>
            <Stack gap="md">
              {course.teachers?.map((t) => (
                <Paper key={t.id} withBorder p="xl" radius="xl">
                  <Group gap="lg">
                    <Avatar src={t.photo_url || undefined} size={72} radius="50%" color="violet" style={{ border: '3px solid #f0ebff', flexShrink: 0 }}>
                      {t.name.charAt(0)}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" c="violet" fw={600} mb={4}>Автор курса</Text>
                      <Text fw={800} size="xl" mb={4}>{t.name}</Text>
                      <Text size="sm" c="dimmed">{t.specialty} · {t.experience} лет опыта</Text>
                      {t.bio && <Text size="sm" c="dimmed" mt="sm" style={{ lineHeight: 1.7 }}>{t.bio}</Text>}
                    </Box>
                  </Group>
                </Paper>
              ))}
              {(!course.teachers || course.teachers.length === 0) && (
                <Paper withBorder p="xl" radius="xl" ta="center"><Text c="dimmed">Преподаватели не указаны</Text></Paper>
              )}
            </Stack>
          </Box>

          {/* Содержание */}
          <Box ref={contentRef} mb={64}>
            <Text fw={800} size="xl" mb={20} style={{ color: '#0a0a0a' }}>Содержание</Text>
            <Stack gap="sm">
              {course.programs?.map((prog) => (
                <Paper
                  key={prog.id}
                  withBorder radius="xl" p="lg"
                  component={Link} to={`/programs/${prog.id}`}
                  style={{ textDecoration: 'none', transition: 'box-shadow 0.2s' }}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <ThemeIcon size={48} radius="md" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', flexShrink: 0 }}>
                        <IconBook size={22} stroke={1.5} color="white" />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} mb={4}>{prog.title}</Text>
                        <Group gap="md">
                          <Text size="xs" c="dimmed">{prog.lessons_count} уроков</Text>
                          {prog.price > 0 && <Text size="xs" c="violet" fw={600}>{prog.price.toLocaleString()} ₸</Text>}
                        </Group>
                      </Box>
                    </Group>
                    <IconChevronRight size={18} color="#9ca3af" />
                  </Group>
                </Paper>
              ))}
              {(!course.programs || course.programs.length === 0) && (
                <Paper withBorder p="xl" radius="xl" ta="center"><Text c="dimmed">Программы ещё не добавлены</Text></Paper>
              )}
            </Stack>
          </Box>

          {/* Отзывы */}
          <Box ref={reviewsRef}>
            <Text fw={800} size="xl" mb={20} style={{ color: '#0a0a0a' }}>Отзывы</Text>

            {/* Rating summary */}
            <Paper withBorder p="xl" radius="xl" mb="lg">
              <Group align="flex-start" gap="xl" wrap="wrap">
                <Box ta="center" style={{ minWidth: 100 }}>
                  <Text style={{ fontSize: 56, fontWeight: 900, color: '#0a0a0a', lineHeight: 1 }}>
                    {course.average_rating.toFixed(1)}
                  </Text>
                  <Group gap={2} justify="center" mt={8}>
                    {[1, 2, 3, 4, 5].map((s) => s <= Math.round(course.average_rating)
                      ? <IconStarFilled key={s} size={16} color="#f59e0b" />
                      : <IconStar key={s} size={16} color="#d1d5db" stroke={1.5} />
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>{course.reviews_count} оценок</Text>
                </Box>
                <Box style={{ flex: 1, minWidth: 180 }}>
                  {ratingCounts.map(({ rating, count }) => (
                    <Group key={rating} gap="sm" mb={6} align="center">
                      <Text size="xs" w={12} ta="right">{rating}</Text>
                      <IconStarFilled size={10} color="#f59e0b" />
                      <Progress value={reviews.length > 0 ? (count / reviews.length) * 100 : 0} color="yellow" style={{ flex: 1 }} size={8} radius={100} />
                      <Text size="xs" c="dimmed" w={20}>{count}</Text>
                    </Group>
                  ))}
                </Box>
              </Group>
            </Paper>

            {/* Reviews list */}
            <Stack gap="md" mb="xl">
              {reviews.map((review) => (
                <Paper key={review.id} withBorder p="lg" radius="xl">
                  <Group justify="space-between" mb={8}>
                    <Group gap="sm">
                      <Avatar color="violet" radius="xl" size={36}>{review.author_name.charAt(0)}</Avatar>
                      <Box>
                        <Text fw={600} size="sm">{review.author_name}</Text>
                        <Group gap={6} mt={2}>
                          <Text size="xs" c="dimmed">{new Date(review.created_at).toLocaleDateString('ru')}</Text>
                          {review.program && (
                            <>
                              <Text size="xs" c="dimmed">·</Text>
                              <Box
                                style={{
                                  background: 'rgba(124,58,237,0.08)',
                                  color: '#7c3aed',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '1px 8px',
                                  borderRadius: 4,
                                }}
                              >
                                {review.program.title}
                              </Box>
                            </>
                          )}
                        </Group>
                      </Box>
                    </Group>
                    <Group gap={2}>
                      {[1, 2, 3, 4, 5].map((s) => s <= review.rating
                        ? <IconStarFilled key={s} size={13} color="#f59e0b" />
                        : <IconStar key={s} size={13} color="#d1d5db" stroke={1.5} />
                      )}
                    </Group>
                  </Group>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{review.comment}</Text>
                </Paper>
              ))}
              {reviews.length === 0 && (
                <Paper withBorder p={48} radius="xl" ta="center">
                  <Text c="dimmed">Пока нет отзывов. Будьте первым!</Text>
                </Paper>
              )}
            </Stack>

            {/* Review form */}
            <Divider mb="xl" />
            <Paper withBorder p="xl" radius="xl">
              <Text fw={700} size="lg" mb="lg">Оставить отзыв</Text>
              <Stack gap="md">
                <Select
                  label="Программа"
                  placeholder="Выберите программу..."
                  data={(course.programs || []).map((p) => ({ value: p.id, label: p.title }))}
                  value={reviewForm.program_id}
                  onChange={(v) => setReviewForm({ ...reviewForm, program_id: v || '' })}
                  radius="xl"
                />
                <TextInput
                  label="Ваше имя" placeholder="Введите имя"
                  value={reviewForm.author_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                  radius="xl"
                />
                <Box>
                  <Text size="sm" fw={500} mb="xs">Оценка</Text>
                  <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} size={28} />
                </Box>
                <Textarea
                  label="Комментарий" placeholder="Поделитесь впечатлением о программе..." minRows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  radius="xl"
                />
                <Button
                  color="violet" radius={100} size="md"
                  onClick={() => submitReview.mutate(reviewForm)}
                  loading={submitReview.isPending}
                  disabled={!reviewForm.author_name || !reviewForm.comment || !reviewForm.rating || !reviewForm.program_id}
                >
                  Отправить отзыв
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
