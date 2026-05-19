import { useState } from 'react';
import {
  Title, Button, SimpleGrid, Card, Avatar, Text, Group, Modal,
  TextInput, Textarea, NumberInput, Stack, ActionIcon
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi } from '../../api/client';
import type { Teacher } from '../../types';

const emptyForm = { name: '', bio: '', specialty: '', experience: 0, photo_url: '', order_index: 0 };

export default function TeachersAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: teachers = [] } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: () => adminApi.listTeachers().then((r) => r.data.data as Teacher[]),
  });

  const save = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      editing
        ? adminApi.updateTeacher(editing.id, data)
        : adminApi.createTeacher(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'teachers'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создан', color: 'green' });
      setModal(false);
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteTeacher(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'teachers'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, bio: t.bio, specialty: t.specialty, experience: t.experience, photo_url: t.photo_url, order_index: t.order_index });
    setModal(true);
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file);
      setForm((f) => ({ ...f, photo_url: res.data.data.url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Учителя</Title>
        <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openCreate}>
          Добавить учителя
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {teachers.map((t) => (
          <Card key={t.id} withBorder shadow="xs" padding="lg">
            <Group justify="space-between" mb="md">
              <Avatar src={t.photo_url || undefined} size={56} radius="50%" color="violet">
                {t.name.charAt(0)}
              </Avatar>
              <Group gap="xs">
                <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(t)}>
                  <IconEdit size={16} stroke={1.5} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => remove.mutate(t.id)}>
                  <IconTrash size={16} stroke={1.5} />
                </ActionIcon>
              </Group>
            </Group>
            <Text fw={600}>{t.name}</Text>
            <Text size="sm" c="violet">{t.specialty}</Text>
            <Text size="xs" c="dimmed" mt={4}>{t.experience} лет опыта</Text>
            <Text size="xs" c="dimmed" lineClamp={2} mt={4}>{t.bio}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={modal} onClose={() => setModal(false)} title={editing ? 'Редактировать учителя' : 'Добавить учителя'} size="md">
        <Stack>
          <TextInput label="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextInput label="Специализация" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          <Textarea label="Биография" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} minRows={3} />
          <NumberInput label="Опыт (лет)" value={form.experience} onChange={(v) => setForm({ ...form, experience: Number(v) })} min={0} />
          <NumberInput label="Порядок отображения" value={form.order_index} onChange={(v) => setForm({ ...form, order_index: Number(v) })} min={0} />
          <div>
            <Text size="sm" fw={500} mb={4}>Фото</Text>
            {form.photo_url && (
              <Avatar src={form.photo_url} size={64} radius="50%" mb="sm" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files?.[0] || null)}
            />
          </div>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
            <Button color="violet" loading={save.isPending || uploading} onClick={() => save.mutate(form)}>
              {editing ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
