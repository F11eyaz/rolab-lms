import {
  Box, Container, Text, Title, Button, Group, SimpleGrid,
  Avatar, Skeleton, Stack
} from '@mantine/core';
import {
  IconArrowRight, IconStarFilled, IconBook2,
  IconUsers, IconCheck, IconSparkles
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { companyApi, teachersApi, coursesApi } from '../../api/client';
import type { Company, Teacher, Course } from '../../types';

// Brand colors from the logo
const PURPLE = '#9C5FE5';
const ORANGE = '#F0875A';
const TEAL = '#5BC4D4';
const VIOLET = '#7B66E8';

export default function LandingPage() {
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyApi.get().then((r) => r.data.data as Company),
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.list().then((r) => r.data.data as Teacher[]),
  });
  const { data: coursesResp } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => coursesApi.list({ limit: 6, sort: 'rating' }).then((r) => r.data),
  });
  const courses: Course[] = coursesResp?.data || [];

  return (
    <Box style={{ background: '#fff', overflowX: 'hidden' }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════
          HERO  — светлый, яркий, фирменные цвета логотипа
      ══════════════════════════════════════════════════ */}
      <Box
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 68,
          overflow: 'hidden',
          background: '#fafafa',
        }}
      >
        {/* Большие цветные blobs на фоне */}
        <Box style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${PURPLE}22 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', top: '5%', right: '-8%',
          width: 550, height: 550, borderRadius: '50%',
          background: `radial-gradient(circle, ${TEAL}22 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', bottom: '-5%', left: '35%',
          width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, ${ORANGE}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80} style={{ alignItems: 'center' }}>

            {/* LEFT — текст */}
            <Stack gap={0}>
              {/* Пилюля */}
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(156,95,229,0.08)',
                  border: '1px solid rgba(156,95,229,0.2)',
                  borderRadius: 100,
                  padding: '6px 16px 6px 8px',
                  width: 'fit-content',
                  marginBottom: 28,
                }}
              >
                <IconSparkles size={16} color={PURPLE} stroke={1.5} />
                <Text size="xs" fw={600} style={{ color: PURPLE }}>
                  Образовательная платформа RoLab
                </Text>
              </Box>

              <Title
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 72px)',
                  fontWeight: 900,
                  color: '#0a0a0a',
                  lineHeight: 1.07,
                  letterSpacing: '-2px',
                  marginBottom: 24,
                }}
              >
                Учись.{' '}
                <Text
                  component="span"
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE} 0%, ${ORANGE} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Исследуй.
                </Text>
                {' '}Достигай.
              </Title>

              <Text
                size="lg"
                style={{ color: '#6b7280', lineHeight: 1.7, maxWidth: 460, marginBottom: 40 }}
              >
                Практические программы для педагогов и обучающихся: научные проекты, робототехника и ИИ-инструменты. Минимум теории — максимум результата.
              </Text>

              <Group gap="sm" mb={48}>
                <Button
                  component={Link}
                  to="/courses"
                  size="lg"
                  radius={10}
                  rightSection={<IconArrowRight size={18} />}
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE}, ${ORANGE})`,
                    border: 'none',
                    height: 52,
                    padding: '0 28px',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: `0 4px 24px ${PURPLE}40`,
                  }}
                >
                  Смотреть курсы
                </Button>
                <Button
                  size="lg"
                  radius={10}
                  variant="outline"
                  style={{
                    height: 52,
                    padding: '0 24px',
                    fontWeight: 500,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    background: '#fff',
                  }}
                >
                  О платформе
                </Button>
              </Group>

              {/* Трасты */}
              <Group gap="xl">
                {[
                  { v: company?.students_count?.toLocaleString() || '15 000+', l: 'студентов' },
                  { v: String(company?.courses_count || 50) + '+', l: 'курсов' },
                  { v: String(company?.teachers_count || 30) + '+', l: 'учителей' },
                ].map((s) => (
                  <Box key={s.l}>
                    <Text
                      fw={900}
                      style={{
                        fontSize: 28,
                        lineHeight: 1,
                        background: `linear-gradient(135deg, ${VIOLET}, ${TEAL})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {s.v}
                    </Text>
                    <Text size="xs" c="dimmed" mt={3}>{s.l}</Text>
                  </Box>
                ))}
              </Group>
            </Stack>

            {/* RIGHT — визуальный блок */}
            <Box style={{ position: 'relative', height: 520 }}>
              {/* Центральный большой круг — как "o" в логотипе */}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${VIOLET}33, ${TEAL}33)`,
                  border: `2px solid ${VIOLET}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${VIOLET}55, ${TEAL}55)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/logo.jpeg" alt="RoLab" style={{ width: 120, height: 120, borderRadius: 24, objectFit: 'cover', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                </Box>

                {/* Molecule dots */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <Box
                    key={deg}
                    style={{
                      position: 'absolute',
                      width: i % 2 === 0 ? 10 : 7,
                      height: i % 2 === 0 ? 10 : 7,
                      borderRadius: '50%',
                      background: i % 3 === 0 ? PURPLE : i % 3 === 1 ? ORANGE : TEAL,
                      top: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                      left: `${50 + 46 * Math.cos((deg * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </Box>

              {/* Floating course cards */}
              {courses.slice(0, 3).map((course, i) => {
                const positions = [
                  { top: '4%', left: '-8%' },
                  { top: '50%', right: '-12%', transform: 'translateY(-50%)' },
                  { bottom: '4%', left: '5%' },
                ];
                const grads = [
                  `linear-gradient(135deg, ${PURPLE}, ${VIOLET})`,
                  `linear-gradient(135deg, ${TEAL}, ${VIOLET})`,
                  `linear-gradient(135deg, ${ORANGE}, ${PURPLE})`,
                ];
                return (
                  <Box
                    key={course.id}
                    component={Link}
                    to={`/courses/${course.id}`}
                    style={{
                      position: 'absolute',
                      ...positions[i],
                      width: 200,
                      background: '#fff',
                      borderRadius: 14,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      padding: 14,
                      textDecoration: 'none',
                      zIndex: 2,
                    }}
                  >
                    <Box
                      style={{
                        height: 60,
                        borderRadius: 8,
                        background: grads[i],
                        marginBottom: 10,
                        overflow: 'hidden',
                      }}
                    >
                      {course.image_url && (
                        <img src={course.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                      )}
                    </Box>
                    <Text size="xs" fw={700} lineClamp={1} style={{ color: '#0a0a0a' }}>{course.title}</Text>
                    <Group gap={4} mt={4}>
                      <IconStarFilled size={10} color="#f59e0b" />
                      <Text size="10px" c="dimmed">{course.average_rating.toFixed(1)}</Text>
                      <Text size="10px" c="dimmed">· {course.price.toLocaleString()} ₸</Text>
                    </Group>
                  </Box>
                );
              })}
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════
          FEATURES  — горизонтальные блоки
      ══════════════════════════════════════════════════ */}
      <Box style={{ background: '#fff', borderTop: '1px solid #f3f4f6', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="xl">
          <Box ta="center" mb={56}>
            <Text
              size="xs" fw={700} mb={8}
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: PURPLE }}
            >
              Наши программы
            </Text>
            <Title style={{ fontSize: 40, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px' }}>
              Три направления — один результат
            </Title>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[
              {
                grad: `linear-gradient(135deg, ${PURPLE}18, ${VIOLET}08)`,
                border: `${PURPLE}25`,
                icon: <IconBook2 size={24} color={PURPLE} stroke={1.5} />,
                iconBg: `${PURPLE}18`,
                title: 'Научный проект',
                text: 'Проектирование, реализация и защита научных проектов. Тема за 1 занятие вместо 3–5 дней, оформление за 4–5 часов вместо 12.',
              },
              {
                grad: `linear-gradient(135deg, ${TEAL}18, ${VIOLET}08)`,
                border: `${TEAL}25`,
                icon: <IconUsers size={24} color={TEAL} stroke={1.5} />,
                iconBg: `${TEAL}18`,
                title: 'Спортивная робототехника',
                text: 'Методика преподавания и подготовка команд к соревнованиям FLL, WRO, RoboCup. 100% практика — без лишней теории.',
              },
              {
                grad: `linear-gradient(135deg, ${ORANGE}18, ${PURPLE}08)`,
                border: `${ORANGE}25`,
                icon: <IconCheck size={24} color={ORANGE} stroke={1.5} />,
                iconBg: `${ORANGE}18`,
                title: 'ИИ для педагога',
                text: 'Промпты, контент и аналитика. Урок за 15 минут вместо 2 часов, тест за 3 минуты вместо 30. Готовые инструменты с первого занятия.',
              },
            ].map((f) => (
              <Box
                key={f.title}
                style={{
                  background: f.grad,
                  border: `1px solid ${f.border}`,
                  borderRadius: 16,
                  padding: 32,
                }}
              >
                <Box
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: f.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </Box>
                <Text fw={700} size="lg" mb={10} style={{ color: '#0a0a0a' }}>{f.title}</Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.75 }}>{f.text}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════
          COURSES
      ══════════════════════════════════════════════════ */}
      <Box style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="xl">
          <Group justify="space-between" align="flex-end" mb={40}>
            <Box>
              <Text size="xs" fw={700} mb={8}
                style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: PURPLE }}>
                Каталог
              </Text>
              <Title style={{ fontSize: 38, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px' }}>
                Популярные курсы
              </Title>
            </Box>
            <Button
              component={Link} to="/courses"
              variant="subtle" color="gray"
              rightSection={<IconArrowRight size={16} />}
              style={{ color: '#6b7280', fontWeight: 500 }}
            >
              Все курсы
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {courses.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={280} radius={14} />)
              : courses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)
            }
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════
          TEACHERS
      ══════════════════════════════════════════════════ */}
      <Box style={{ background: '#fff', borderTop: '1px solid #f0f0f0', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="xl">
          <Box ta="center" mb={56}>
            <Text size="xs" fw={700} mb={8}
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: PURPLE }}>
              Команда
            </Text>
            <Title style={{ fontSize: 38, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px' }}>
              Наши преподаватели
            </Title>
          </Box>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={40}>
            {teachers.slice(0, 4).map((t, i) => {
              const colors = [PURPLE, TEAL, ORANGE, VIOLET];
              return (
                <Stack key={t.id} align="center" gap="sm">
                  <Box style={{ position: 'relative' }}>
                    <Box
                      style={{
                        position: 'absolute', inset: -3,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors[i % 4]}, ${colors[(i + 1) % 4]})`,
                        zIndex: 0,
                      }}
                    />
                    <Avatar
                      src={t.photo_url || undefined}
                      size={80}
                      radius="50%"
                      color="violet"
                      style={{ position: 'relative', zIndex: 1, border: '3px solid #fff' }}
                    >
                      {t.name.charAt(0)}
                    </Avatar>
                  </Box>
                  <Text fw={700} size="md" ta="center" style={{ color: '#0a0a0a' }}>{t.name}</Text>
                  <Text size="xs" fw={500} ta="center" style={{ color: colors[i % 4] }}>{t.specialty}</Text>
                  <Text size="xs" c="dimmed" ta="center">{t.experience} лет опыта</Text>
                </Stack>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════
          CTA — фирменный градиент из логотипа
      ══════════════════════════════════════════════════ */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${VIOLET} 40%, ${TEAL} 100%)`,
          paddingTop: 100,
          paddingBottom: 100,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box style={{
          position: 'absolute', top: '-30%', right: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', bottom: '-20%', left: '-5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <Container size="sm" style={{ position: 'relative', zIndex: 1 }}>
          <Box ta="center">
            <Title
              style={{
                fontSize: 52, fontWeight: 900, color: '#fff',
                letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16,
              }}
            >
              Готов к росту?
            </Title>
            <Text c="rgba(255,255,255,0.75)" size="lg" mb={40}>
              Выбери программу и получи практический результат уже с первого занятия
            </Text>
            <Button
              component={Link} to="/courses"
              size="xl" radius={10}
              rightSection={<IconArrowRight size={20} />}
              style={{
                background: '#fff',
                color: PURPLE,
                height: 56, padding: '0 36px',
                fontWeight: 800, fontSize: 16, border: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              }}
            >
              Смотреть курсы
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const grads = [
    `linear-gradient(135deg, ${PURPLE}, ${VIOLET})`,
    `linear-gradient(135deg, ${TEAL}, ${VIOLET})`,
    `linear-gradient(135deg, ${ORANGE}, ${PURPLE})`,
    `linear-gradient(135deg, ${VIOLET}, ${TEAL})`,
    `linear-gradient(135deg, ${PURPLE}, ${TEAL})`,
    `linear-gradient(135deg, ${ORANGE}, ${VIOLET})`,
  ];
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
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      <Box style={{ height: 180, background: grads[index % grads.length], position: 'relative', overflow: 'hidden' }}>
        {course.image_url && (
          <img src={course.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'overlay', opacity: 0.5 }} />
        )}
        <Box style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <Text size="sm" fw={700} c="white" lineClamp={2} style={{ lineHeight: 1.35 }}>
            {course.title}
          </Text>
        </Box>
        {course.is_combo && (
          <Box style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
            Комбо
          </Box>
        )}
      </Box>
      <Box p="md">
        {teacher && <Text size="xs" c="dimmed" mb={8}>{teacher.name}</Text>}
        <Group justify="space-between" align="center">
          <Group gap={4}>
            <IconStarFilled size={12} color="#f59e0b" />
            <Text size="xs" fw={600}>{course.average_rating.toFixed(1)}</Text>
            <Text size="xs" c="dimmed">({course.reviews_count})</Text>
          </Group>
          <Text fw={800} size="md" style={{ color: '#0a0a0a' }}>{course.price.toLocaleString()} ₸</Text>
        </Group>
      </Box>
    </Box>
  );
}
