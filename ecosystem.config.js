module.exports = {
  apps: [
    {
      name: 'flowclass-api',
      script: 'pnpm',
      args: 'start:api',
      cwd: '/var/www/flowclass-open-source',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        APP_PORT: 5000,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'flowclass-web',
      script: 'pnpm',
      args: 'start:web',
      cwd: '/var/www/flowclass-open-source',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
