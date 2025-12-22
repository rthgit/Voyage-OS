const { execSync } = require('child_process');

const appType = (process.env.APP_TYPE || 'voyage').toLowerCase().trim();
console.log(`[Launcher] Starting app with APP_TYPE: "${appType}"`);

let command = '';

if (appType === 'excellere') {
    console.log('[Launcher] Selecting Excellere MCP...');
    command = 'cd excellere_mcp && node index.js';
} else {
    console.log('[Launcher] Selecting Voyage OS (Default)...');
    command = 'cd travel_mcp && node index.js';
}

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('[Launcher] Error starting app:', error);
    process.exit(1);
}
