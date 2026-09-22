export const colors = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  line: '#E6DFD5',
  text: '#222222',
  muted: '#6F6A63',
  primary: '#2F6B3F',
  primaryTint: '#E3F0E6',
  danger: '#B3402E',
  dangerTint: '#F8E1DC',
  warn: '#8A5A00',
  warnTint: '#FBEBC8',
  white: '#FFFFFF',
  outside: '#EFEAE2',
};

export const statusColors = {
  preparing: [colors.warnTint, colors.warn],
  ready: [colors.warnTint, colors.warn],
  picked: [colors.primaryTint, '#1F5230'],
  arrived: [colors.primary, '#FFFFFF'],
  delivered: ['#ECE8E1', '#5E5850'],
  ok: [colors.primaryTint, '#1F5230'],
  low: [colors.warnTint, colors.warn],
  out: [colors.dangerTint, '#8A2A1B'],
  open: [colors.dangerTint, '#8A2A1B'],
  progress: [colors.warnTint, colors.warn],
  resolved: [colors.primaryTint, '#1F5230'],
};
