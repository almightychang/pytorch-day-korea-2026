import { existsSync } from 'node:fs'

const LOCAL_ENV = '.env.local'
if (existsSync(LOCAL_ENV)) process.loadEnvFile(LOCAL_ENV)

export default {
  server: {
    allowedHosts: (process.env.DEV_ALLOWED_HOSTS ?? '').split(',').filter(Boolean),
  },
}
