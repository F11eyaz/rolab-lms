import { useState, useEffect } from 'react';
import {
  Title, Stack, TextInput, Textarea, NumberInput, Button, Group, Text, Image, Paper
} from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { companyApi, adminApi } from '../../api/client';
import type { Company } from '../../types';

export default function CompanyAdmin() {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<Company>>({});

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyApi.get().then((r) => r.data.data as Company),
  });

  useEffect(() => { if (company) setForm(company); }, [company]);

  const save = useMutation({
    mutationFn: (data: Partial<Company>) => adminApi.updateCompany(data),
    onSuccess: () => notifications.show({ message: 'Сохранено', color: 'green' }),
    onError: () => notifications.show({ message: 'Ошибка сохранения', color: 'red' }),
  });

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file);
      setForm((f) => ({ ...f, logo_url: res.data.data.url }));
    } finally { setUploading(false); }
  };

  return (
    <div>
      <Title order={2} mb="xl">Информация о компании</Title>
      <Paper withBorder p="xl" radius="md" maw={700}>
        <Stack>
          <TextInput label="Название компании" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Описание" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} minRows={4} />
          <Textarea label="Миссия" value={form.mission || ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} minRows={3} />
          <TextInput label="Телефон" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          <TextInput label="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextInput label="Адрес" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <NumberInput label="Год основания" value={form.founded_year || 2020} onChange={(v) => setForm({ ...form, founded_year: Number(v) })} />
          <Group grow>
            <NumberInput label="Студентов" value={form.students_count || 0} onChange={(v) => setForm({ ...form, students_count: Number(v) })} />
            <NumberInput label="Курсов" value={form.courses_count || 0} onChange={(v) => setForm({ ...form, courses_count: Number(v) })} />
            <NumberInput label="Учителей" value={form.teachers_count || 0} onChange={(v) => setForm({ ...form, teachers_count: Number(v) })} />
          </Group>
          <div>
            <Text size="sm" fw={500} mb={4}>Логотип</Text>
            {form.logo_url && <Image src={form.logo_url} h={60} fit="contain" mb="xs" maw={150} />}
            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)} />
          </div>
          <Group justify="flex-end" mt="md">
            <Button color="violet" loading={save.isPending || uploading} onClick={() => save.mutate(form)}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
}
