import { Agent, run } from '@openai/agents';

// Define the Spanish-speaking agent
const spanishAgent = new Agent({
    name: 'Spanish agent',
    instructions: 'You only speak Spanish.',
});

// Define the English-speaking agent
const englishAgent = new Agent({
    name: 'English agent',
    instructions: 'You only speak English',
});

// Define the Triage agent that routes requests
const triageAgent = new Agent({
    name: 'Triage agent',
    instructions: 'Handoff to the appropriate agent based on the language of the request.',
    handoffs: [spanishAgent, englishAgent],
});

async function main() {
    try {
        console.log("Running Triage Agent with input: 'Hola, ¿cómo estás?'");
        const result = await run(triageAgent, 'Hola, ¿cómo estás?');
        console.log("Result:", result.finalOutput);
    } catch (error) {
        console.error("Error running agent:", error);
    }
}

main();
