import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: 6,
  defaultRadius: 'md',
  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  colors: {
    violet: [
      '#F3F1FF',
      '#E5DCFF',
      '#CBB9FF',
      '#B096FF',
      '#9D77FF',
      '#8B5CF6',
      '#7C3AED',
      '#6C1AD5',
      '#5B10B5',
      '#4A0D8F',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 500 } },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
    NumberInput: {
      defaultProps: { radius: 'md' },
    },
    Textarea: {
      defaultProps: { radius: 'md' },
    },
    Paper: {
      defaultProps: { radius: 'md' },
    },
    Card: {
      defaultProps: { radius: 'md' },
    },
  },
});
