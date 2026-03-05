import { defineConfig } from 'orval';

export default defineConfig({
  localhost: {
    input: {
      target: 'http://localhost:8000/openapi.json',
    },
    output: {
      target: '',
      schemas: './schemas', // папка для схем
      client: 'zod',
      mode: 'split',
      biome: true,
      override: {
        namingConvention: {
          enum: 'PascalCase',
        },
        zod: {
          generateEachHttpStatus: false,
        },
        useTypeOverInterfaces: true,
      },
    },

    // Хуки (опционально)
    hooks: {
      afterAllFilesWrite: 'bunx @biomejs/biome check --write --unsafe .',
    },
  },
});
