import { BatchStatusLabelPipe } from './batch-status-label-pipe';

describe('BatchStatusLabelPipe', () => {
  const pipe = new BatchStatusLabelPipe();

  it.each([
    ['OPEN', 'Aberto'],
    ['SENT', 'Enviado'],
    ['CONFIRMED', 'Confirmado'],
  ] as const)('should translate %s to %s', (status, label) => {
    expect(pipe.transform(status)).toBe(label);
  });
});
