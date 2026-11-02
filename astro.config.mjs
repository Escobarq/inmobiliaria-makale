import { defineConfig } from 'astro/config';

export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pictures.domus.la' },
      { protocol: 'https', hostname: 'www.inmobiliariamakale.com.co' }
    ]
  }
});
