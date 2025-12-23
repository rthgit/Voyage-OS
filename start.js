const { execSync } = require('child_process');

const appType = (process.env.APP_TYPE || 'mypdf').toLowerCase().trim();
console.log(`[Launcher] Starting app with APP_TYPE: "${appType}"`);

let command = '';

if (appType === 'voyage') {
    console.log('[Launcher] Selecting Voyage OS...');
    command = 'cd travel_mcp && node index.js';
} else if (appType === 'excellere') {
    console.log('[Launcher] Selecting Excellere MCP...');
    command = 'cd excellere_mcp && node index.js';
} else {
    // Default case is now MyPDF
    console.log('[Launcher] Selecting MyPDF Architect (Default)...');
    command = 'cd mypdf_mcp && node index.js';
}

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('[Launcher] Error starting app:', error);
    process.exit(1);
}
