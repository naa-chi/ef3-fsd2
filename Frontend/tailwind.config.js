export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dino: {
          bg: '#c0deed',
          panel: '#ffffff',
          accent: '#3b5998',
          glow: '#1c5ea3',
          mint: '#4caf50',
          warn: '#f0ad4e',
          danger: '#d9534f',
          text: '#1e2a38',
          muted: '#5a6b7d'
        }
      },
      fontFamily: {
        display: ['Tahoma', 'Verdana', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace']
      }
    }
  },
  plugins: []
};