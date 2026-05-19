import {
  Title, Table, Group, ActionIcon, Badge, Text
} from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi } from '../../api/client';
import type { Review } from '../../types';
import StarRating from '../../components/StarRating';


export default function ReviewsAdmin() {
  const qc = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminApi.listReviews().then((r) => r.data.data as Review[]),
  });

  const approve = useMutation({
    mutationFn: (id: string) => adminApi.approveReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      notifications.show({ message: 'Отзыв одобрен', color: 'green' });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });

  const pending = reviews.filter((r) => !r.is_approved).length;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Group gap="sm">
          <Title order={2}>Отзывы</Title>
          {pending > 0 && <Badge color="red" variant="filled">{pending} ожидают</Badge>}
        </Group>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Автор</Table.Th>
            <Table.Th>Оценка</Table.Th>
            <Table.Th>Комментарий</Table.Th>
            <Table.Th>Статус</Table.Th>
            <Table.Th>Дата</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reviews.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td>
                <Text size="sm" fw={500}>{r.author_name}</Text>
                {r.author_email && <Text size="xs" c="dimmed">{r.author_email}</Text>}
              </Table.Td>
              <Table.Td><StarRating value={r.rating} size={14} /></Table.Td>
              <Table.Td><Text size="sm" lineClamp={2}>{r.comment}</Text></Table.Td>
              <Table.Td>
                <Badge color={r.is_approved ? 'green' : 'orange'} variant="light">
                  {r.is_approved ? 'Одобрен' : 'Ожидает'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="xs" c="dimmed">{new Date(r.created_at).toLocaleDateString('ru')}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {!r.is_approved && (
                    <ActionIcon variant="subtle" color="green" title="Одобрить" onClick={() => approve.mutate(r.id)}>
                      <IconCheck size={16} stroke={1.5} />
                    </ActionIcon>
                  )}
                  <ActionIcon variant="subtle" color="red" title="Удалить" onClick={() => remove.mutate(r.id)}>
                    <IconTrash size={16} stroke={1.5} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
