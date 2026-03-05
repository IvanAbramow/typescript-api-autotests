import { log } from '@packages/utils';

const userAgent = process.env.npm_config_user_agent || '';

if (!userAgent.includes('bun')) {
  log.error('❌ This project requires Bun as package manager.');

  log.error('Please use: bun install');
  log.error('Install Bun: https://bun.sh');

  process.exit(1);
}
