# PM2 EC2 Deployment Guide

This document describes the PM2-based deployment flow for the Flowclass API on EC2 instances.

## Overview

The deployment uses PM2 (Process Manager 2) to manage the Node.js application directly on EC2 instances, without containers. PM2 provides:

- **Automatic Restart**: Restarts the application if it crashes or exits
- **Health Monitoring**: Monitors the application process
- **Memory Management**: Restarts if memory usage exceeds limits
- **Database Failure Recovery**: When database connections fail, the application exits and PM2 automatically restarts it

## How Health Checks Work

PM2 monitors the application in several ways:

1. **Process Exit Monitoring**: If the Node.js process exits (exit code != 0), PM2 automatically restarts it
2. **Uncaught Exception Handling**: If an uncaught exception crashes the process, PM2 restarts it
3. **Memory Limits**: If memory usage exceeds `max_memory_restart` (2GB), PM2 restarts the process
4. **Database Connection Failures**: When the database connection fails, NestJS typically causes the process to exit, which PM2 detects and restarts

The `/health` endpoint is used for:
- External monitoring (load balancers, monitoring tools)
- Deployment verification
- Manual health checks

## Configuration Files

### `ecosystem.config.js`

PM2 configuration file that defines:
- Application name and script path
- Auto-restart policies
- Memory limits
- Logging configuration
- Restart delays and backoff strategies

### `scripts/pm2-health-check.sh`

Optional health check script that can be used for external monitoring or cron jobs.

## GitLab CI/CD Variables

The following variables must be set in GitLab CI/CD settings:

- `EC2_HOST`: EC2 instance hostname or IP address
- `EC2_USER`: SSH user (typically `ec2-user` or `ubuntu`)
- `EC2_SSH_PRIVATE_KEY`: SSH private key for EC2 access
- `EC2_DEPLOY_PATH`: Deployment path on EC2 (e.g., `/var/app/flowclass-api`)

## Deployment Process

1. **Build**: The `prod_build` job builds the application
2. **Deploy**: The `production_ec2_deploy` job:
   - Connects to EC2 via SSH
   - Creates a new release directory
   - Transfers files to EC2
   - Installs dependencies
   - Builds the application
   - Stops the old PM2 process
   - Starts the new version with PM2
   - Verifies health check
   - Cleans up old releases

## PM2 Commands

After deployment, you can manage the application using PM2:

```bash
# View application status
pm2 list

# View logs
pm2 logs flowclass-api

# Restart application
pm2 restart flowclass-api

# Stop application
pm2 stop flowclass-api

# View monitoring
pm2 monit

# Save current process list (for auto-start on reboot)
pm2 save
```

## Auto-Start on Reboot

PM2 is configured to automatically start the application when the EC2 instance reboots. This is set up during the first deployment.

## Troubleshooting

### Application not starting

1. Check PM2 logs: `pm2 logs flowclass-api`
2. Check application logs in `logs/` directory
3. Verify environment variables are set correctly
4. Check database connectivity

### Health check failing

1. Verify the application is running: `pm2 list`
2. Check if the port is correct in `.env`
3. Test the health endpoint manually: `curl http://localhost:3100/health`
4. Check database connection

### PM2 not restarting on failure

1. Verify PM2 is running: `pm2 list`
2. Check PM2 logs: `pm2 logs`
3. Verify `autorestart: true` in `ecosystem.config.js`
4. Check if process is exiting with code 0 (PM2 won't restart on successful exit)

