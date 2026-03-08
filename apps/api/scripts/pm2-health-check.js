#!/usr/bin/env node

/**
 * PM2 Health Check Script
 * Checks the /health endpoint and restarts the main app if unhealthy
 */

const http = require('http')
const { exec } = require('child_process')

const APP_PORT = process.env.APP_PORT || '3100'
const HEALTH_URL = `http://localhost:${APP_PORT}/health`
const TIMEOUT = 10000 // 10 seconds timeout

console.log(`Running health check for ${HEALTH_URL}`)

const restartMainApp = (callback) => {
  console.log('Health check failed, restarting flowclass-api...')
  exec('pm2 restart flowclass-api', (error, stdout, stderr) => {
    if (error) {
      console.error(`Failed to restart flowclass-api: ${error.message}`)
    } else {
      console.log(`Restarted flowclass-api: ${stdout || stderr || 'success'}`)
    }
    // Always call callback to exit the script
    if (callback) callback()
  })
}

const options = {
  hostname: 'localhost',
  port: APP_PORT,
  path: '/health',
  method: 'GET',
  timeout: TIMEOUT,
}

const request = http.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`Health check passed: ${res.statusCode}`)
      // Exit with code 0 - script completed successfully
      process.exit(0)
    } else {
      console.error(`Health check failed: Status ${res.statusCode}`)
      // Restart main app and exit successfully (script completed its job)
      restartMainApp(() => {
        process.exit(0)
      })
    }
  })
})

request.on('error', (error) => {
  console.error(`Health check error: ${error.message}`)
  // Restart main app and exit successfully (script completed its job)
  restartMainApp(() => {
    process.exit(0)
  })
})

request.on('timeout', () => {
  console.error(`Health check timeout after ${TIMEOUT}ms`)
  request.destroy()
  // Restart main app and exit successfully (script completed its job)
  restartMainApp(() => {
    process.exit(0)
  })
})

request.setTimeout(TIMEOUT)
request.end()

