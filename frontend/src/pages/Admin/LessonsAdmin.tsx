import { useState } from 'react';
import {
  Title, Button, Table, Group, ActionIcon, Modal, TextInput,
  Select, NumberInput, Stack, Text, Box
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow as TiptapTableRow } from '@tiptap/extension-table-row';
import { TableCell as TiptapTableCell } from '@tiptap/extension-table-cell';
import { TableHeader as TiptapTableHeader } from '@tiptap/extension-table-header';
import { adminApi } from '../../api/client';
import type { Lesson, Course } from '../../types';

const emptyForm = { title: '', content: '', course_id: '', order_index: 0 };

export default function LessonsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Placeholder.configure({ placeholder: 'Введите содержание урока...' }),
      TiptapTable.configure({ resizable: false }),
      TiptapTableRow,
      TiptapTableHeader,
      TiptapTableCell,
    ],
    content: form.content,
    onUpdate: ({ editor }) => setForm((f) => ({ ...f, content: editor.getHTML() })),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['admin', 'lessons'],
    queryFn: () => adminApi.listLessons().then((r) => r.data.data as Lesson[]),
  });
  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.listCourses().then((r) => r.data.data as Course[]),
  });

  const save = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      editing ? adminApi.updateLesson(editing.id, data) : adminApi.createLesson(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'lessons'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создан', color: 'green' });
      setModal(false); setEditing(null); setForm(emptyForm);
      editor?.commands.clearContent();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteLesson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'lessons'] }),
  });

  const openCreate = () => {
    setEditing(null); setForm(emptyForm);
    editor?.commands.clearContent();
    setModal(true);
  };
  const openEdit = (l: Lesson) => {
    setEditing(l);
    setForm({ title: l.title, content: l.content, course_id: l.course_id, order_index: l.order_index });
    editor?.commands.setContent(l.content);
    setModal(true);
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Уроки</Title>
        <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openCreate}>Добавить урок</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Урок</Table.Th>
            <Table.Th>Курс</Table.Th>
            <Table.Th>Порядок</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lessons.map((l) => (
            <Table.Tr key={l.id}>
              <Table.Td><Text size="sm" fw={500}>{l.title}</Text></Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {courses.find((c) => c.id === l.course_id)?.title || l.course_id}
                </Text>
              </Table.Td>
              <Table.Td>{l.order_index}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(l)}><IconEdit size={16} stroke={1.5} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => remove.mutate(l.id)}><IconTrash size={16} stroke={1.5} /></ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={modal} onClose={() => setModal(false)} title={editing ? 'Редактировать урок' : 'Добавить урок'} size="xl">
        <Stack>
          <TextInput label="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select
            label="Курс"
            data={courses.map((c) => ({ value: c.id, label: c.title }))}
            value={form.course_id}
            onChange={(v) => setForm({ ...form, course_id: v || '' })}
          />
          <NumberInput label="Порядок" value={form.order_index} onChange={(v) => setForm({ ...form, order_index: Number(v) })} min={0} />
          <Box>
            <Text size="sm" fw={500} mb={4}>Содержание урока</Text>
            <RichTextEditor editor={editor} style={{ minHeight: 300 }}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Code />
                  <RichTextEditor.Blockquote />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>
          </Box>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
            <Button color="violet" loading={save.isPending} onClick={() => save.mutate(form)}>{editing ? 'Сохранить' : 'Создать'}</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
