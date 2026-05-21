import { useState } from 'react';
import { Box, Paper, Title, TextInput, PasswordInput, Button, Text, Group } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { authApi } from '../../api/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.data.token);
      navigate('/admin');
    } catch {
      notifications.show({ message: 'Неверный email или пароль', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#F3F1FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper withBorder shadow="md" p={40} radius="lg" w={420}>
        <Group justify="center" mb="xl">
          <img
            src="/logo.jpeg"
            alt="RoLab"
            style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 16px rgba(156,95,229,0.2)' }}
          />
        </Group>
        <Title order={2} ta="center" mb={4}>Вход в панель</Title>
        <Text c="dimmed" ta="center" size="sm" mb="xl">RoLab LMS — Администрирование</Text>

        <TextInput
          label="Email"
          placeholder="admin@rolab.kz"
          leftSection={<IconAt size={14} stroke={1.5} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb="md"
        />
        <PasswordInput
          label="Пароль"
          placeholder="••••••••"
          leftSection={<IconLock size={14} stroke={1.5} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="xl"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <Button fullWidth color="violet" size="md" loading={loading} onClick={handleLogin}>
          Войти
        </Button>
      </Paper>
    </Box>
  );
}
