import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'BiasLens — AI Bias Detector',
    description:
      'Detect cognitive biases in any text or webpage using AI. Highlights manipulative language, scores neutrality, and suggests balanced rewrites.',
    version: '1.0.0',
    permissions: ['activeTab', 'sidePanel', 'contextMenus', 'storage'],
    action: {
      default_title: 'Open BiasLens',
    },
    icons: {
      '16': 'icon/16.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
  },
});
