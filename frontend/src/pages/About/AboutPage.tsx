import { Box, Container, Text, Title, SimpleGrid, Group, Stack, Avatar } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { teachersApi } from '../../api/client';
import type { Teacher } from '../../types';

const DARK_BLUE  = '#2235C5';
const CARD_BLUE  = '#2D47D6';
const LIGHT_BG   = 'linear-gradient(145deg, #f0f4ff 0%, #e6eeff 40%, #d8e6ff 100%)';
const BLUE_TEXT  = '#1E35C8';

/* ─── Волна (декоративная лента) ─── */
function Wave({ style }: { style: React.CSSProperties }) {
  return (
    <img
      src="/pdf-assets/wave.png"
      alt=""
      aria-hidden
      style={{ position: 'absolute', pointerEvents: 'none', userSelect: 'none', ...style }}
    />
  );
}

export default function AboutPage() {
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.list().then((r) => r.data.data as Teacher[]),
  });

  return (
    <Box style={{ background: '#fff', overflowX: 'hidden' }}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 2 — КТО МЫ?
          Тёмно-синий фон, волна сверху-слева, 3D логотип
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: DARK_BLUE,
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        {/* Волна — верхний левый угол */}
        <Wave style={{ top: -60, left: -80, width: 340, transform: 'rotate(10deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40} style={{ alignItems: 'center' }}>

            {/* Левая часть — текст */}
            <Stack gap={28}>
              <Title style={{
                fontSize: 'clamp(44px, 6vw, 72px)',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.05,
                letterSpacing: '-1px',
              }}>
                Кто мы?
              </Title>

              <Text style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: '#fff', lineHeight: 1.65 }}>
                «Rolab — стремительно развивающийся образовательная экосистема в сфере ИКТ, робототехники»
              </Text>

              <Text style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.65 }}>
                Наша миссия - сделать обучение робототехнике и ИКТ доступным и понятным для школ Казахстана.
              </Text>
            </Stack>

            {/* Правая часть — 3D логотип */}
            <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', minHeight: 340 }}>
              <img
                src="/pdf-assets/logo3d.png"
                alt="RoLab 3D logo"
                style={{ width: 'clamp(220px, 30vw, 380px)', objectFit: 'contain' }}
              />
            </Box>

          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 3 — РЕАЛИЗОВАННЫЕ ЗАДАЧИ
          Светлый фон, волна справа, 2 синих карточки + 3 белых
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: LIGHT_BG,
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        {/* Волна — правый край */}
        <Wave style={{ top: '0%', right: -120, width: 380, transform: 'scaleX(-1) rotate(-15deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>

          <Title style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900,
            color: BLUE_TEXT,
            marginBottom: 52,
            letterSpacing: '-1px',
          }}>
            Реализованные задачи
          </Title>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={28}>

            {/* Левая колонка — 2 большие синие карточки */}
            <Stack gap={20}>
              <Box style={{
                background: DARK_BLUE,
                borderRadius: 20,
                padding: '36px 44px',
              }}>
                <Text style={{ fontSize: 'clamp(60px, 7vw, 88px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  8000
                </Text>
                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', marginTop: 14, lineHeight: 1.65 }}>
                  У нас прошли обучение более 8000 учеников, получив ценные навыки и знания в области информационных технологий и робототехники.
                </Text>
              </Box>

              <Box style={{
                background: CARD_BLUE,
                borderRadius: 20,
                padding: '36px 44px',
              }}>
                <Text style={{ fontSize: 'clamp(60px, 7vw, 88px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  30
                </Text>
                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', marginTop: 14, lineHeight: 1.65 }}>
                  Мы работаем совместно с 30+ школами Казахстана
                </Text>
              </Box>
            </Stack>

            {/* Правая колонка — 3 белые карточки с обводкой */}
            <Stack gap={20}>
              {[
                { n: '54', t: 'Победы в региональных соревнованиях' },
                { n: '43', t: 'Победы в национальных соревнованиях' },
                { n: '6',  t: 'Победы в международных соревнованиях' },
              ].map(s => (
                <Box key={s.n} style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `1.5px solid ${DARK_BLUE}30`,
                  borderRadius: 20,
                  padding: '28px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 32,
                  flex: 1,
                }}>
                  <Text style={{
                    fontSize: 'clamp(48px, 5.5vw, 72px)',
                    fontWeight: 900,
                    color: BLUE_TEXT,
                    lineHeight: 1,
                    minWidth: '2ch',
                    fontStyle: 'italic',
                  }}>
                    {s.n}
                  </Text>
                  <Text style={{ fontSize: 15, color: '#1a1a2e', lineHeight: 1.5 }}>{s.t}</Text>
                </Box>
              ))}
            </Stack>

          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 4 — НАШИ ПАРТНЁРЫ
          Светлый фон, волна снизу-слева, синий контейнер с логотипами
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f8faff 0%, #edf2ff 50%, #e6eeff 100%)',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        {/* Волна — нижний левый угол */}
        <Wave style={{ bottom: -80, left: -100, width: 360, transform: 'rotate(200deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>

          <Title style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900,
            color: BLUE_TEXT,
            marginBottom: 52,
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Наши партнёры
          </Title>

          {/* Синий контейнер с логотипами — используем извлечённое изображение */}
          <Box style={{
            background: DARK_BLUE,
            borderRadius: 24,
            padding: '48px 40px',
            overflow: 'hidden',
          }}>
            <img
              src="/pdf-assets/p4_img0.jpeg"
              alt="Наши партнёры"
              style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Box>

        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          НАШИ ПРЕПОДАВАТЕЛИ
      ═══════════════════════════════════════════════════ */}
      {teachers.length > 0 && (
        <Box style={{
          minHeight: '60vh',
          position: 'relative',
          overflow: 'hidden',
          background: LIGHT_BG,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
        }}>
          <Container size="xl" style={{ width: '100%', padding: '80px 48px' }}>
            <Title style={{
              fontSize: 'clamp(32px, 4.5vw, 56px)',
              fontWeight: 900,
              color: DARK_BLUE,
              marginBottom: 52,
              textAlign: 'center',
              letterSpacing: '-1px',
            }}>
              Наши преподаватели
            </Title>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={40}>
              {teachers.slice(0, 4).map((t, i) => {
                const colors = ['#2235C5', '#2D47D6', '#4A7EEB', '#1a2fb5'];
                return (
                  <Stack key={t.id} align="center" gap="sm">
                    <Box style={{ position: 'relative' }}>
                      <Box style={{
                        position: 'absolute', inset: -3,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors[i % 4]}, ${colors[(i + 1) % 4]})`,
                        zIndex: 0,
                      }} />
                      <Avatar
                        src={t.photo_url || undefined}
                        size={88}
                        radius="50%"
                        color="blue"
                        style={{ position: 'relative', zIndex: 1, border: '3px solid #fff' }}
                      >
                        {t.name.charAt(0)}
                      </Avatar>
                    </Box>
                    <Text fw={700} size="md" ta="center" style={{ color: '#0a0a0a' }}>{t.name}</Text>
                    <Text size="xs" fw={600} ta="center" style={{ color: DARK_BLUE }}>{t.specialty}</Text>
                    <Text size="xs" c="dimmed" ta="center">{t.experience} лет опыта</Text>
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Container>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 5 — НАШИ ДОСТИЖЕНИЯ
          Светлый фон, волна сверху-справа, коллаж фото
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: LIGHT_BG,
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        {/* Волна — верхний правый угол */}
        <Wave style={{ top: -40, right: -80, width: 360, transform: 'scaleX(-1) rotate(10deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>

          <Title style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900,
            color: BLUE_TEXT,
            marginBottom: 12,
            letterSpacing: '-1px',
          }}>
            Наши достижения
          </Title>

          <Text style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', color: '#374151', marginBottom: 40, lineHeight: 1.6 }}>
            Наши ученики ежегодно участвуют в{' '}
            <Text component="span" fw={700} style={{ color: BLUE_TEXT }}>
              престижных международных соревнованиях
            </Text>
          </Text>

          {/* Коллаж фото — используем извлечённое изображение */}
          <img
            src="/pdf-assets/p5_img0.jpeg"
            alt="Наши достижения"
            style={{ width: '100%', height: 'auto', borderRadius: 16, display: 'block', boxShadow: '0 4px 32px rgba(30,53,200,0.12)' }}
          />

        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 6 — ОСНОВНЫЕ НАПРАВЛЕНИЯ
          Светлый фон, волна внизу-справа, 4 синих карточки
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f8faff 0%, #edf2ff 50%, #e6eeff 100%)',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        <Wave style={{ bottom: -60, right: -80, width: 400, transform: 'scaleX(-1) rotate(170deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>
          <Title style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900,
            color: BLUE_TEXT,
            marginBottom: 52,
            letterSpacing: '-1px',
          }}>
            Основные направления
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={20}>
            {[
              {
                title: 'Платные кружки:',
                items: ['робототехника', 'game dev', 'digital art', 'AI tools'],
              },
              {
                title: 'Аутстаффинг педагогов:',
                items: ['STEM', 'информатика', 'робототехника', 'труд'],
              },
              {
                title: 'Курсы повышения квалификации для учителей',
                items: [],
              },
              {
                title: 'INFOLAB подготовка к ЕНТ',
                items: [],
              },
            ].map((card) => (
              <Box key={card.title} style={{
                background: `linear-gradient(160deg, #2D47D6 0%, #1E35C8 60%, #1a2fb5 100%)`,
                borderRadius: 20,
                padding: '36px 32px 0 32px',
                minHeight: 340,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Text style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
                  {card.title}
                </Text>
                <Stack gap={12} style={{ flex: 1 }}>
                  {card.items.map(item => (
                    <Group key={item} gap={10} align="flex-start">
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, lineHeight: 1.5 }}>• {item}</Text>
                    </Group>
                  ))}
                </Stack>
                {/* Wave bottom decoration */}
                <Box style={{
                  height: 56,
                  marginTop: 20,
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28 Q50 0 100 28 Q150 56 200 28 Q250 0 300 28 Q350 56 400 28 L400 56 L0 56 Z' fill='rgba(255,255,255,0.12)'/%3E%3Cpath d='M0 38 Q50 10 100 38 Q150 66 200 38 Q250 10 300 38 Q350 66 400 38 L400 56 L0 56 Z' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") no-repeat bottom`,
                  backgroundSize: '100% 100%',
                }} />
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 7 — НАПРАВЛЕНИЯ КПК
          Тёмно-синий фон, волна сверху-слева, 2 белые карточки
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: DARK_BLUE,
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        <Wave style={{ top: -60, left: -80, width: 340, transform: 'rotate(10deg)' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>
          <Title style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: 56,
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Направления КПК
          </Title>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={32} style={{ alignItems: 'stretch' }}>
            {[
              {
                header: 'Искусственный интеллект',
                items: [
                  'Подготовка учебных материалов',
                  'Автоматизация оценивания',
                  'Обратная связь и отчетность',
                  'Индивидуализация обучения',
                  'Упрощение административных задач',
                ],
              },
              {
                header: 'Спортивная робототехника',
                items: [
                  'Основы конструирования',
                  'Программирование роботов',
                  'Подготовка к соревнованиям',
                  'Практические проекты',
                ],
              },
              {
                header: 'Научные проекты',
                items: [
                  'Выбор темы и формулировка гипотезы',
                  'Сбор и анализ данных',
                  'Оформление исследовательской работы',
                  'Подготовка к защите проекта',
                ],
              },
            ].map((col) => (
              <Box key={col.header} style={{ position: 'relative', paddingTop: 28, display: 'flex', flexDirection: 'column' }}>
                {/* Синяя pill-шапка */}
                <Box style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  background: CARD_BLUE, borderRadius: 40,
                  padding: '10px 32px', zIndex: 2, whiteSpace: 'nowrap',
                }}>
                  <Text style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                    {col.header}
                  </Text>
                </Box>

                {/* Белая карточка — flex: 1 чтобы растягивалась до одной высоты */}
                <Box style={{
                  background: '#fff', borderRadius: 20,
                  padding: '52px 36px 36px',
                  flex: 1,
                }}>
                  <Stack gap={24}>
                    {col.items.map(item => (
                      <Group key={item} gap={16} align="center">
                        <Box style={{
                          width: 12, height: 12,
                          background: '#4A7EEB',
                          transform: 'rotate(45deg)',
                          flexShrink: 0,
                        }} />
                        <Text style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4 }}>{item}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 8 — СТРУКТУРА ПРОГРАММЫ
          Светлый фон + сферы, 2×2 грид карточек
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f8faff 0%, #edf2ff 50%, #e6eeff 100%)',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 68,
      }}>
        {/* Фон со сферами */}
        <img src="/pdf-assets/p1_img2.jpeg" alt="" aria-hidden style={{
          position: 'absolute', top: 0, right: 0, height: '100%', width: 'auto',
          objectFit: 'cover', pointerEvents: 'none', opacity: 0.6,
        }} />

        <Container size="md" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '60px 48px' }}>
          <Title style={{
            fontSize: 'clamp(32px, 4.5vw, 56px)',
            fontWeight: 900,
            color: BLUE_TEXT,
            marginBottom: 52,
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Структура программы
          </Title>

          <SimpleGrid cols={2} spacing={20}>
            {/* Верхний-левый: синяя */}
            <Box style={{ background: DARK_BLUE, borderRadius: 18, padding: '52px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: '#fff', textAlign: 'center' }}>
                8 модулей
              </Text>
            </Box>

            {/* Верхний-правый: белая с синей рамкой и скобками */}
            <Box style={{ position: 'relative' }}>
              {/* Уголковые скобки */}
              <Box style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: `4px solid ${CARD_BLUE}`, borderLeft: `4px solid ${CARD_BLUE}`, borderRadius: '4px 0 0 0' }} />
              <Box style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: `4px solid ${CARD_BLUE}`, borderRight: `4px solid ${CARD_BLUE}`, borderRadius: '0 0 4px 0' }} />
              <Box style={{ background: '#fff', borderRadius: 18, padding: '52px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${CARD_BLUE}20`, minHeight: 180 }}>
                <Text style={{ textAlign: 'center', color: BLUE_TEXT, lineHeight: 1.25 }}>
                  <Text component="span" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: BLUE_TEXT }}>80</Text>
                  <Text component="span" style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', fontWeight: 700, color: BLUE_TEXT }}> часов</Text>
                </Text>
                <Text style={{ fontSize: 16, color: '#555', marginTop: 8 }}>лекции + практика</Text>
              </Box>
            </Box>

            {/* Нижний-левый: белая с синей рамкой и скобками */}
            <Box style={{ position: 'relative' }}>
              <Box style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: `4px solid ${CARD_BLUE}`, borderLeft: `4px solid ${CARD_BLUE}`, borderRadius: '4px 0 0 0' }} />
              <Box style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: `4px solid ${CARD_BLUE}`, borderRight: `4px solid ${CARD_BLUE}`, borderRadius: '0 0 4px 0' }} />
              <Box style={{ background: '#fff', borderRadius: 18, padding: '52px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${CARD_BLUE}20`, minHeight: 180 }}>
                <Text style={{ textAlign: 'center', color: BLUE_TEXT }}>
                  <Text component="span" style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 900, color: BLUE_TEXT }}>5-15</Text>
                  <Text component="span" style={{ fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 700, color: BLUE_TEXT }}> минутные</Text>
                </Text>
                <Text style={{ fontSize: 16, color: BLUE_TEXT, fontWeight: 600 }}>видео-лекции</Text>
              </Box>
            </Box>

            {/* Нижний-правый: тёмно-синяя */}
            <Box style={{ background: CARD_BLUE, borderRadius: 18, padding: '52px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <Text style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.35 }}>
                практические занятия, тестирования
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════
          СЛАЙД 9 — КОНТАКТЫ
          Светлый фон, волна слева, 2D логотип, карточка с QR
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f8faff 0%, #edf2ff 50%, #e6eeff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 68,
      }}>
        <Wave style={{ top: -60, left: -80, width: 340, transform: 'rotate(10deg)' }} />

        <Box style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 900, padding: '60px 48px', margin: '0 auto' }}>
          {/* 2D логотип по центру */}
          <Box style={{ textAlign: 'center', marginBottom: 52 }}>
            <img src="/pdf-assets/logo2d.png" alt="RoLab" style={{ height: 100, objectFit: 'contain' }} />
          </Box>

          {/* Контактная карточка */}
          <Box style={{
            background: DARK_BLUE,
            borderRadius: 24,
            padding: '44px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Синяя волна внутри карточки */}
            <Box style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 900 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 Q112 0 225 40 Q337 80 450 40 Q562 0 675 40 Q787 80 900 40 L900 80 L0 80 Z' fill='%232D47D6' opacity='0.5'/%3E%3C/svg%3E") no-repeat bottom`,
              backgroundSize: '100% 100%',
              pointerEvents: 'none',
            }} />

            {/* Контакты слева */}
            <Stack gap={20} style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              {[
                { icon: '✉', text: 'rolabacademy@gmail.com' },
                { icon: '📞', text: '+7 776 309 9306' },
                { icon: '📷', text: '@rolab.kz' },
              ].map(c => (
                <Group key={c.text} gap={20} align="center">
                  <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                  <Text style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', color: '#fff', fontWeight: 500 }}>{c.text}</Text>
                </Group>
              ))}
            </Stack>

            {/* QR + Instagram справа */}
            <Box style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
              {/* QR код с наклоном */}
              <Box style={{
                background: '#fff',
                borderRadius: 16,
                padding: 12,
                transform: 'rotate(6deg)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                display: 'inline-block',
              }}>
                <img src="/pdf-assets/p9_img3.jpeg" alt="QR code" style={{ width: 140, height: 140, display: 'block' }} />
              </Box>
              {/* Instagram иконка */}
              <img
                src="/pdf-assets/instagram3d.png"
                alt="Instagram"
                style={{
                  position: 'absolute',
                  bottom: -20,
                  left: -30,
                  width: 64,
                  transform: 'rotate(-15deg)',
                }}
              />
              <img
                src="/pdf-assets/instagram3d.png"
                alt="Instagram"
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -24,
                  width: 48,
                  transform: 'rotate(10deg)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════
          CTA — переход на платформу
      ═══════════════════════════════════════════════════ */}
      <Box style={{
        background: DARK_BLUE,
        padding: '72px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Wave style={{ top: -60, left: -80, width: 300, transform: 'rotate(10deg)', opacity: 0.6 }} />
        <Wave style={{ bottom: -60, right: -80, width: 280, transform: 'scaleX(-1) rotate(-10deg)', opacity: 0.6 }} />
        <Box style={{ position: 'relative', zIndex: 1 }}>
          <Title style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', marginBottom: 20 }}>
            Готовы начать обучение?
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 36 }}>
            Смотрите наши программы и курсы
          </Text>
          <Group justify="center" gap={16}>
            <Link
              to="/platform"
              style={{
                display: 'inline-block',
                background: '#fff',
                color: DARK_BLUE,
                padding: '14px 40px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              Смотреть программы
            </Link>
            <Link
              to="/courses"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: '#fff',
                padding: '14px 40px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.4)',
              }}
            >
              Каталог курсов
            </Link>
          </Group>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
