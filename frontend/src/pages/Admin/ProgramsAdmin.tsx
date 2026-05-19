import { useState } from 'react';
import {
  Title, Button, Table, Group, ActionIcon, Modal, TextInput, Textarea,
  Select, NumberInput, Stack, Text, MultiSelect, Image
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi } from '../../api/client';
import type { Program, Course, Teacher } from '../../types';

const emptyForm = {
  title: '', description: '', image_url: '', price: 0,
  course_id: '', order_index: 0, teacher_ids: [] as string[],
};

export default function ProgramsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: programs = [] } = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: () => adminApi.listPrograms().then((r) => r.data.data as Program[]),
  });
  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.listCourses().then((r) => r.data.data as Course[]),
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: () => adminApi.listTeachers().then((r) => r.data.data as Teacher[]),
  });

  const save = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      editing ? adminApi.updateProgram(editing.id, data) : adminApi.createProgram(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'programs'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создано', color: 'green' });
      setModal(false); setEditing(null); setForm(emptyForm);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteProgram(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'programs'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, image_url: p.image_url, price: p.price, course_id: p.course_id, order_index: p.order_index, teacher_ids: p.teachers?.map((t) => t.id) || [] });
    setModal(true);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file);
      setForm((f) => ({ ...f, image_url: res.data.data.url }));
    } finally { setUploading(false); }
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Программы</Title>
        <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openCreate}>Добавить программу</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Программа</Table.Th>
            <Table.Th>Курс</Table.Th>
            <Table.Th>Цена</Table.Th>
            <Table.Th>Уроков</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {programs.map((p) => (
            <Table.Tr key={p.id}>
              <Table.Td>
                <Group gap="sm">
                  {p.image_url && <Image src={p.image_url} w={40} h={30} fit="cover" radius="sm" />}
                  <Text size="sm" fw={500}>{p.title}</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">{(courses as Course[]).find((c) => c.id === p.course_id)?.title || '-'}</Text>
              </Table.Td>
              <Table.Td>{p.price.toLocaleString()} ₸</Table.Td>
              <Table.Td>{p.lessons_count}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(p)}><IconEdit size={16} stroke={1.5} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => remove.mutate(p.id)}><IconTrash size={16} stroke={1.5} /></ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={modal} onClose={() => setModal(false)} title={editing ? 'Редактировать программу' : 'Добавить программу'} size="lg">
        <Stack>
          <TextInput label="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} minRows={3} />
          <Select label="Курс" data={(courses as Course[]).map((c) => ({ value: c.id, label: c.title }))} value={form.course_id} onChange={(v) => setForm({ ...form, course_id: v || '' })} />
          <NumberInput label="Цена (₸)" value={form.price} onChange={(v) => setForm({ ...form, price: Number(v) })} min={0} />
          <NumberInput label="Порядок" value={form.order_index} onChange={(v) => setForm({ ...form, order_index: Number(v) })} min={0} />
          <MultiSelect label="Преподаватели" data={(teachers as Teacher[]).map((t) => ({ value: t.id, label: t.name }))} value={form.teacher_ids} onChange={(v) => setForm({ ...form, teacher_ids: v })} />
          <div>
            <Text size="sm" fw={500} mb={4}>Изображение</Text>
            {form.image_url && <Image src={form.image_url} h={60} fit="cover" radius="sm" mb="xs" maw={150} />}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} />
          </div>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
            <Button color="violet" loading={save.isPending || uploading} onClick={() => save.mutate(form)}>{editing ? 'Сохранить' : 'Создать'}</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
