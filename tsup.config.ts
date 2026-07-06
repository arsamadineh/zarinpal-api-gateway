import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'core/index': 'src/core/index.ts',
    'adapters/express': 'src/adapters/express.ts',
    'adapters/fastify': 'src/adapters/fastify.ts',
    'adapters/hono': 'src/adapters/hono.ts',
  },
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  minify: true,
  shims: true,
  splitting: false,
});
