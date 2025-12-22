const { execSync } = require('child_process');

// Default to 'excellere' if not specified, since that's what we are working on now
const appType = (process.env.APP_TYPE || 'excellere').toLowerCase().trim();
console.log(`[Launcher] Starting app with APP_TYPE: "${appType}"`);

let command = '';

if (appType === 'voyage') {
    console.log('[Launcher] Selecting Voyage OS...');
    command = 'cd travel_mcp && node index.js';
} else {
    // Default case is now Excellere
    console.log('[Launcher] Selecting Excellere MCP (Default)...');
    command = 'cd excellere_mcp && node index.js';
}

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('[Launcher] Error starting app:', error);
    process.exit(1);
}
