import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  prefetch: true,
  integrations: [
    starlight({
      title: 'Olympix Documentation',
      logo: { src: './public/olymp-x-logo.png', replacesTitle: true },
      customCss: ['./src/styles/custom.css'],
      favicon: '/favicon-32.png',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicon-32.png',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/apple-touch-icon.png',
          },
        },
      ],
      sidebar: [
        { label: 'Installation', link: '/installation/' },
        { label: 'Config Options', link: '/config-options/' },
        {
          label: 'CLI',
          items: [{ autogenerate: { directory: 'cli' } }],
        },
        {
          label: 'GitHub Actions',
          items: [{ autogenerate: { directory: 'github-actions' } }],
        },
        {
          label: 'VSCode Extension',
          items: [{ autogenerate: { directory: 'vscode-extension' } }],
        },
      ],
    }),
  ],
});
