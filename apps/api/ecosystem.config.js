module.exports = {
  apps: [
    {
      name: 'flowclass-api',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=5120', // 5GB V8 heap size to prevent OOM crashes
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '5400M', // Restart if total process memory exceeds 5.4GB (leaves headroom for OS)
      pmx: true,
      // Changed to default PM2 logs dir
      error_file: '~/.pm2/logs/flowclass-api-error.log',
      out_file: '~/.pm2/logs/flowclass-api-out.log',
      log_file: '~/.pm2/logs/flowclass-api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '120s', // Minimum 2 minutes uptime before considering it stable (NestJS needs time to start)
      max_restarts: 10,
      restart_delay: 10000, // 10 second delay before restarting
      exp_backoff_restart_delay: 100,
      kill_timeout: 10000, // 10 seconds to gracefully shutdown
      listen_timeout: 120000, // 120 seconds (2 minutes) timeout for app to start listening
      shutdown_with_message: true,
      wait_ready: false,
      instance_var: 'INSTANCE_ID',
      ignore_watch: ['node_modules', 'logs', '.git'],
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=5120', // 5GB V8 heap size to prevent OOM crashes
      },
    },
  ],
};
