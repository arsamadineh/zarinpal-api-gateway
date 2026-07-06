#!/usr/bin/env node

/**
 * Zarinpal Gateway - Quick Setup Script
 * One-command installation and configuration
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function setup() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Zarinpal Payment Gateway - Quick Setup             ║
║                    Version 2.0.0                           ║
╚════════════════════════════════════════════════════════════╝
`);

  // Check if .env exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipping .env creation.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 Please provide your Zarinpal credentials:\n');

  const merchantId = await question('Zarinpal Merchant ID: ');
  const apiKey = await question('Zarinpal API Key (optional): ');
  const port = await question('Server Port (default 3000): ') || '3000';
  const sandbox = await question('Use Sandbox Mode? (y/n, default y): ');
  const corsOrigin = await question('CORS Origin (default *): ') || '*';

  const envContent = `
# Zarinpal Payment Gateway Configuration
# Generated at ${new Date().toISOString()}

# Core
NODE_ENV=development
PORT=${port}

# Zarinpal
ZARINPAL_MERCHANT_ID=${merchantId}
${apiKey ? `ZARINPAL_API_KEY=${apiKey}\n` : ''}ZARINPAL_SANDBOX=${sandbox.toLowerCase() !== 'n' ? 'true' : 'false'}
ZARINPAL_TIMEOUT=30000
ZARINPAL_RETRIES=3

# CORS
CORS_ORIGIN=${corsOrigin}

# Logging
LOG_LEVEL=info

# Database (optional - for transaction logging)
# DATABASE_URL=

# JWT (optional - for API authentication)
# JWT_SECRET=your-secret-key

# Webhook (optional - for async payment notifications)
# WEBHOOK_SECRET=your-webhook-secret
# WEBHOOK_ENABLED=false
`.trim();

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env file created successfully!\n');

  // Check for node_modules
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    const install = await question('Install dependencies with npm? (y/n): ');
    if (install.toLowerCase() === 'y') {
      console.log('\n📦 Installing dependencies...\n');
      const { execSync } = await import('child_process');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('\n✅ Dependencies installed!\n');
      } catch (error) {
        console.error('❌ Installation failed:', error.message);
      }
    }
  }

  console.log(`
📚 Next steps:
  1. npm run build        - Build the project
  2. npm run dev          - Start development server
  3. npm run test         - Run tests

📖 Documentation: https://github.com/arsamadineh/zarinpal-api-gateway
🔗 API Endpoints: http://localhost:${port}/

Happy coding! 🚀
  `);

  rl.close();
}

setup().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
