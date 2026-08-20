delete process.env.ELECTRON_RUN_AS_NODE
import { execSync } from 'node:child_process'
const args = process.argv.slice(2).join(' ')
execSync(`npx cypress ${args}`, { stdio: 'inherit', env: process.env })
