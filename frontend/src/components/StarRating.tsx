import { Group } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  return (
    <Group gap={2}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= Math.round(value) ? (
          <IconStarFilled
            key={star}
            size={size}
            color="#f59e0b"
            style={{ cursor: onChange ? 'pointer' : 'default' }}
            onClick={() => onChange?.(star)}
          />
        ) : (
          <IconStar
            key={star}
            size={size}
            color="#d1d5db"
            stroke={1.5}
            style={{ cursor: onChange ? 'pointer' : 'default' }}
            onClick={() => onChange?.(star)}
          />
        )
      )}
    </Group>
  );
}
