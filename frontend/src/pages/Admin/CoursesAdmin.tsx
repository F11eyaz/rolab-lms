import { useState } from 'react';
import {
  Title, Button, Table, Group, ActionIcon, Modal, TextInput, Textarea,
  Select, NumberInput, Checkbox, Stack, Text, MultiSelect, Image, Badge
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi, categoriesApi } from '../../api/client';
import type { Course, Teacher, Category } from '../../types';

const emptyForm = {
  title: '', description: '', image_url: '', price: 0, language: 'ru',
  category_id: '', is_combo: false, duration: '1 мес', teacher_ids: [] as string[],
};

export default function CoursesAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.listCourses().then((r) => r.data.data as Course[]),
  });
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: () => adminApi.listTeachers().then((r) => r.data.data as Teacher[]),
  });

  const categories = catData?.data as Category[] || [];

  const save = useMutation({
    mutationFn: (data: typeof emptyForm & { category_id: number }) =>
      editing
        ? adminApi.updateCourse(editing.id, data)
        : adminApi.createCourse(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создан', color: 'green' });
      setModal(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: () => notifications.show({ message: 'Ошибка', color: 'red' }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'courses'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title, description: c.description, image_url: c.image_url,
      price: c.price, language: c.language, category_id: String(c.category_id),
      is_combo: c.is_combo, duration: c.duration,
      teacher_ids: c.teachers?.map((t) => t.id) || [],
    });
    setModal(true);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file);
      setForm((f) => ({ ...f, image_url: res.data.data.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    save.mutate({ ...form, category_id: Number(form.category_id) } as typeof emptyForm & { category_id: number });
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Курсы</Title>
        <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openCreate}>
          Добавить курс
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Курс</Table.Th>
            <Table.Th>Категория</Table.Th>
            <Table.Th>Цена</Table.Th>
            <Table.Th>Уроков</Table.Th>
            <Table.Th>Рейтинг</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {courses.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td>
                <Group gap="sm">
                  {c.image_url && <Image src={c.image_url} w={40} h={30} fit="cover" radius="sm" />}
                  <div>
                    <Text size="sm" fw={500}>{c.title}</Text>
                    {c.is_combo && <Badge size="xs" color="violet">Комбо</Badge>}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>{c.category?.name || '-'}</Table.Td>
              <Table.Td>{c.price.toLocaleString()} ₸</Table.Td>
              <Table.Td>{c.lessons_count}</Table.Td>
              <Table.Td>⭐ {c.average_rating.toFixed(1)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(c)}>
                    <IconEdit size={16} stroke={1.5} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => remove.mutate(c.id)}>
                    <IconTrash size={16} stroke={1.5} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={modal} onClose={() => setModal(false)} title={editing ? 'Редактировать курс' : 'Добавить курс'} size="lg">
        <Stack>
          <TextInput label="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea
            label="Описание (HTML)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            minRows={4}
            placeholder="<p>Описание курса...</p>"
          />
          <Select
            label="Категория"
            data={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            value={form.category_id}
            onChange={(v) => setForm({ ...form, category_id: v || '' })}
          />
          <Select
            label="Язык"
            data={[{ value: 'ru', label: 'Русский' }, { value: 'kz', label: 'Казахский' }]}
            value={form.language}
            onChange={(v) => setForm({ ...form, language: v || 'ru' })}
          />
          <NumberInput label="Цена (₸)" value={form.price} onChange={(v) => setForm({ ...form, price: Number(v) })} min={0} />
          <TextInput label="Продолжительность" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="1 мес" />
          <Checkbox label="Комбо-курс" checked={form.is_combo} onChange={(e) => setForm({ ...form, is_combo: e.target.checked })} />
          <MultiSelect
            label="Преподаватели"
            data={teachers.map((t) => ({ value: t.id, label: t.name }))}
            value={form.teacher_ids}
            onChange={(v) => setForm({ ...form, teacher_ids: v })}
          />
          <div>
            <Text size="sm" fw={500} mb={4}>Изображение</Text>
            {form.image_url && <Image src={form.image_url} h={80} fit="cover" radius="sm" mb="xs" maw={200} />}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} />
          </div>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
            <Button color="violet" loading={save.isPending || uploading} onClick={handleSave}>
              {editing ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
