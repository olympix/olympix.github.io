import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  integrations: [
    starlight({
      title: 'Olympix',
      // logo: { src: './public/olymp-x-logo.png' }, // Task 3 moves the logo file here
    }),
  ],
});
