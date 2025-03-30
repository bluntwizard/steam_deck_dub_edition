#!/usr/bin/env node

/**
 * Deployment script for Grimoire
 * 
 * This script handles the deployment process to different environments:
 * - Staging: For testing before production
 * - Production: Live environment
 * 
 * Usage:
 * npm run deploy -- [--staging|--production]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const package = require('../package.json');

// Configuration
const config = {
  staging: {
    host: process.env.STAGING_HOST || 'staging.grimoiredubedition.com',
    user: process.env.STAGING_USER || 'deploy',
    path: process.env.STAGING_PATH || '/var/www/staging.grimoiredubedition.com',
    sourcePath: 'dist',
  },
  production: {
    host: process.env.PRODUCTION_HOST || 'grimoiredubedition.com',
    user: process.env.PRODUCTION_USER || 'deploy',
    path: process.env.PRODUCTION_PATH || '/var/www/grimoiredubedition.com',
    sourcePath: 'dist',
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isStaging = args.includes('--staging') || !isProduction; // Default to staging

const env = isProduction ? 'production' : 'staging';
const envConfig = config[env];

console.log(`🚀 Deploying version ${package.version} to ${env} environment...`);

// Ensure the dist directory exists
if (!fs.existsSync(path.resolve(__dirname, '..', envConfig.sourcePath))) {
  console.error(`❌ Error: ${envConfig.sourcePath} directory does not exist. Please build the project first.`);
  process.exit(1);
}

// Create a version file
try {
  fs.writeFileSync(
    path.resolve(__dirname, '..', envConfig.sourcePath, 'version.json'),
    JSON.stringify({
      version: package.version,
      buildDate: new Date().toISOString(),
      environment: env
    }, null, 2)
  );
  console.log(`📝 Created version file for ${package.version}`);
} catch (error) {
  console.error('❌ Error creating version file:', error);
  process.exit(1);
}

// Deploy to server
try {
  const sourceDir = path.resolve(__dirname, '..', envConfig.sourcePath) + '/';
  const deployCmd = `rsync -avz --delete ${sourceDir} ${envConfig.user}@${envConfig.host}:${envConfig.path}`;
  
  console.log(`📤 Deploying to ${envConfig.host}...`);
  console.log(`Command: ${deployCmd}`);
  
  execSync(deployCmd, { stdio: 'inherit' });
  
  console.log(`✅ Deployment to ${env} completed successfully!`);
} catch (error) {
  console.error(`❌ Deployment failed: ${error.message}`);
  process.exit(1);
}

// Post-deployment tasks
if (isProduction) {
  try {
    console.log('🔄 Running post-deployment tasks...');
    
    // Clear cache if applicable
    // execSync(`ssh ${envConfig.user}@${envConfig.host} 'cd ${envConfig.path} && ./clear-cache.sh'`, { stdio: 'inherit' });
    
    console.log('🔔 Sending deployment notification...');
    // Add notification logic here if needed
    
    console.log('✅ All post-deployment tasks completed!');
  } catch (error) {
    console.error('⚠️ Post-deployment tasks failed:', error.message);
    // Non-critical, so don't exit with error
  }
}

console.log(`🎉 Version ${package.version} successfully deployed to ${env}!`);
console.log(`🌍 Visit https://${envConfig.host} to view the deployed application.`); 