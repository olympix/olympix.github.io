import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  integrations: [
    starlight({
      title: 'Olympix',
      logo: { src: './public/olymp-x-logo.png', replacesTitle: true },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Installation', link: '/installation/' },
        { label: 'Config Options', link: '/config-options/' },
        { label: 'Ignore Options', link: '/ignore-options/' },
        {
          label: 'CLI',
          autogenerate: { directory: 'cli' },
        },
        {
          label: 'GitHub Actions',
          autogenerate: { directory: 'github-actions' },
        },
        {
          label: 'VSCode Extension',
          autogenerate: { directory: 'vscode-extension' },
        },
      ],
    }),
  ],
});
