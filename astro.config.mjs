import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  integrations: [
    starlight({
      title: 'Olympix Documentation',
      logo: { src: './public/olymp-x-logo.png', replacesTitle: true },
      customCss: ['./src/styles/custom.css'],
      favicon: '/olymp-x-logo.png',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/png',
            href: '/olymp-x-logo.png',
          },
        },
      ],
      sidebar: [
        { label: 'Installation', link: '/installation/' },
        { label: 'Config Options', link: '/config-options/' },
        { label: 'Ignore Options', link: '/ignore-options/' },
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
