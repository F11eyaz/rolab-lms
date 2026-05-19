import { useState } from 'react';
import {
  Title, Button, Table, Group, ActionIcon, Modal, TextInput, NumberInput, Stack
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi } from '../../api/client';
import type { Category } from '../../types';

const emptyForm = { name: '', slug: '', order_index: 0 };

export default function CategoriesAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi.listCategories().then((r) => r.data),
  });
  const categories: Category[] = catData?.data || [];

  const save = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      editing ? adminApi.updateCategory(editing.id, data) : adminApi.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создано', color: 'green' });
      setModal(false); setEditing(null); setForm(emptyForm);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, order_index: c.order_index });
    setModal(true);
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Категории</Title>
        <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openCreate}>Добавить</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Порядок</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td>{c.name}</Table.Td>
              <Table.Td>{c.slug}</Table.Td>
              <Table.Td>{c.order_index}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(c)}><IconEdit size={16} stroke={1.5} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => remove.mutate(c.id)}><IconTrash size={16} stroke={1.5} /></ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={modal} onClose={() => setModal(false)} title={editing ? 'Редактировать' : 'Добавить категорию'}>
        <Stack>
          <TextInput label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextInput label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ent, nish, school" />
          <NumberInput label="Порядок" value={form.order_index} onChange={(v) => setForm({ ...form, order_index: Number(v) })} min={0} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
            <Button color="violet" loading={save.isPending} onClick={() => save.mutate(form)}>{editing ? 'Сохранить' : 'Создать'}</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
