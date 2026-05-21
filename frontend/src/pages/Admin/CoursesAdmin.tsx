import { useState, useRef } from 'react';
import {
  Title, Button, Table, Group, ActionIcon, Modal, TextInput,
  Select, NumberInput, Checkbox, Stack, Text,
  Image, Badge, Tabs, Box, LoadingOverlay, Tooltip,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconFileWord, IconUpload } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow as TiptapTableRow } from '@tiptap/extension-table-row';
import { TableCell as TiptapTableCell } from '@tiptap/extension-table-cell';
import { TableHeader as TiptapTableHeader } from '@tiptap/extension-table-header';
import { adminApi } from '../../api/client';
import type { Course } from '../../types';

const emptyForm = {
  title: '', description: '', program_content: '',
  image_url: '', price: 0, language: 'ru',
  category_id: '', is_combo: false, duration: '80 часов',
};

/* ─── shared rich-text toolbar config ─── */
function RichToolbar() {
  return (
    <RichTextEditor.Toolbar sticky stickyOffset={0}>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
        <RichTextEditor.ClearFormatting />
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
        <RichTextEditor.AlignLeft />
        <RichTextEditor.AlignCenter />
        <RichTextEditor.AlignRight />
      </RichTextEditor.ControlsGroup>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Link />
        <RichTextEditor.Unlink />
        <RichTextEditor.Blockquote />
        <RichTextEditor.Code />
      </RichTextEditor.ControlsGroup>
    </RichTextEditor.Toolbar>
  );
}

export default function CoursesAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const tableExtensions = [
    TiptapTable.configure({ resizable: false }),
    TiptapTableRow,
    TiptapTableHeader,
    TiptapTableCell,
  ];

  /* ─── description editor ─── */
  const descEditor = useEditor({
    extensions: [
      StarterKit, Link, Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Краткое описание курса...' }),
      ...tableExtensions,
    ],
    content: form.description,
    onUpdate: ({ editor }) => setForm((f) => ({ ...f, description: editor.getHTML() })),
  });

  /* ─── program editor ─── */
  const programEditor = useEditor({
    extensions: [
      StarterKit, Link, Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Загрузите Word-файл или введите содержание программы: цели, модули, глоссарий, расписание занятий...' }),
      ...tableExtensions,
    ],
    content: form.program_content,
    onUpdate: ({ editor }) => setForm((f) => ({ ...f, program_content: editor.getHTML() })),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.listCourses().then((r) => r.data.data as Course[]),
  });
  const save = useMutation({
    mutationFn: (data: typeof emptyForm & { category_id: number }) =>
      editing ? adminApi.updateCourse(editing.id, data) : adminApi.createCourse(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      notifications.show({ message: editing ? 'Обновлено' : 'Создан', color: 'green' });
      setModal(false);
      setEditing(null);
      setForm(emptyForm);
      descEditor?.commands.clearContent();
      programEditor?.commands.clearContent();
    },
    onError: () => notifications.show({ message: 'Ошибка', color: 'red' }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'courses'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    descEditor?.commands.clearContent();
    programEditor?.commands.clearContent();
    setModal(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    const f = {
      title: c.title,
      description: c.description || '',
      program_content: c.program_content || '',
      image_url: c.image_url,
      price: c.price,
      language: c.language,
      category_id: String(c.category_id),
      is_combo: c.is_combo,
      duration: c.duration,
    };
    setForm(f);
    descEditor?.commands.setContent(f.description);
    programEditor?.commands.setContent(f.program_content);
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

  /* ─── Word → HTML ─── */
  const handleWordUpload = async (file: File | null) => {
    if (!file) return;
    setWordLoading(true);
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        programEditor?.commands.setContent(result.value);
        setForm((f) => ({ ...f, program_content: result.value }));
        notifications.show({ message: 'Word-файл загружен', color: 'green' });
      }
    } catch {
      notifications.show({ message: 'Ошибка при чтении файла', color: 'red' });
    } finally {
      setWordLoading(false);
      if (wordInputRef.current) wordInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    save.mutate({ ...form, category_id: 1 } as typeof emptyForm & { category_id: number });
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
                    {c.program_content && <Badge size="xs" color="green" ml={4}>Программа ✓</Badge>}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>{c.price > 0 ? `${c.price.toLocaleString()} ₸` : 'Бесплатно'}</Table.Td>
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

      <Modal
        opened={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Редактировать курс' : 'Добавить курс'}
        size="xl"
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        <Tabs defaultValue="general">
          <Tabs.List mb="md">
            <Tabs.Tab value="general">Основное</Tabs.Tab>
            <Tabs.Tab value="program">Программа курса</Tabs.Tab>
          </Tabs.List>

          {/* ── Основное ── */}
          <Tabs.Panel value="general">
            <Stack gap="md">
              <TextInput
                label="Название курса"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <Box>
                <Text size="sm" fw={500} mb={6}>Краткое описание</Text>
                <RichTextEditor editor={descEditor} style={{ minHeight: 160 }}>
                  <RichToolbar />
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Box>

              <Group grow>
                <Select
                  label="Язык"
                  data={[{ value: 'ru', label: 'Русский' }, { value: 'kz', label: 'Казахский' }]}
                  value={form.language}
                  onChange={(v) => setForm({ ...form, language: v || 'ru' })}
                />
                <NumberInput
                  label="Цена (₸)"
                  value={form.price}
                  onChange={(v) => setForm({ ...form, price: Number(v) })}
                  min={0}
                />
                <TextInput
                  label="Длительность"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="80 часов"
                />
              </Group>

              <Checkbox
                label="Комбо-курс"
                checked={form.is_combo}
                onChange={(e) => setForm({ ...form, is_combo: e.target.checked })}
              />

              <Box>
                <Text size="sm" fw={500} mb={4}>Обложка курса</Text>
                {form.image_url && (
                  <Image src={form.image_url} h={80} fit="cover" radius="sm" mb="xs" maw={200} />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} />
              </Box>
            </Stack>
          </Tabs.Panel>

          {/* ── Программа курса ── */}
          <Tabs.Panel value="program">
            <Stack gap="md">
              {/* Word upload bar */}
              <Box
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#f0f4ff', border: '1px dashed #7c3aed40',
                  borderRadius: 10, padding: '12px 16px',
                }}
              >
                <IconFileWord size={24} color="#2B4FD8" stroke={1.5} />
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={600} style={{ color: '#1a1a2e' }}>Загрузить из Word (.docx)</Text>
                  <Text size="xs" c="dimmed">Содержимое файла автоматически вставится в редактор</Text>
                </Box>
                <Tooltip label="Выбрать .docx файл">
                  <Button
                    size="sm"
                    variant="light"
                    color="blue"
                    leftSection={<IconUpload size={14} />}
                    loading={wordLoading}
                    onClick={() => wordInputRef.current?.click()}
                  >
                    Выбрать файл
                  </Button>
                </Tooltip>
                <input
                  ref={wordInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={(e) => handleWordUpload(e.target.files?.[0] || null)}
                />
              </Box>

              <Text size="xs" c="dimmed">
                Один большой блок для всего: описание программы, цели курса, структура модулей, глоссарий — всё в одном месте.
              </Text>

              {/* Big rich text editor */}
              <Box style={{ position: 'relative' }}>
                <LoadingOverlay visible={wordLoading} overlayProps={{ radius: 'sm', blur: 2 }} />
                <RichTextEditor editor={programEditor} style={{ minHeight: 480 }}>
                  <RichToolbar />
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Box>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => setModal(false)}>Отмена</Button>
          <Button color="violet" loading={save.isPending || uploading} onClick={handleSave}>
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
