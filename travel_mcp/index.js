import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import crypto from "crypto";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log("Resolved UI Path:", path.join(__dirname, "../travel_ui/dist"));
console.log("Resolved Index Path:", path.join(__dirname, "../travel_ui/dist/index.html"));

app.use(cors());
app.use(express.json());

// Serve Static UI Files (React Build)
app.use(express.static(path.join(__dirname, "../travel_ui/dist")));

// --- MCP Server Setup ---
const mcp = new McpServer({
    name: "Voyage OS",
    version: "1.0.0",
});

// --- Tool Definitions with Annotations ---

// Tool 1: Search Destinations
mcp.tool(
    "search_destinations",
    {
        query: z.string().describe("The destination or type of vacation to search for (e.g., 'beaches in Italy')"),
        budget_level: z.enum(["low", "medium", "high", "luxury"]).optional().describe("Budget preference"),
    },
    async ({ query, budget_level }) => {
        console.log(`[Tool] Searching for: ${query}, Budget: ${budget_level || "Any"}`);

        const mockResults = [
            {
                id: "dest_001",
                name: "Amalfi Coast",
                country: "Italy",
                description: "Beautiful coastal area with dramatic cliffs.",
                avg_cost_per_day: 250,
                image_url: "https://example.com/amalfi.jpg"
            },
            {
                id: "dest_002",
                name: "Santorini",
                country: "Greece",
                description: "Famous for white buildings and sunsets.",
                avg_cost_per_day: 200,
                image_url: "https://example.com/santorini.jpg"
            },
            {
                id: "dest_003",
                name: "Bali",
                country: "Indonesia",
                description: "Tropical paradise with beaches and temples.",
                avg_cost_per_day: 80,
                image_url: "https://example.com/bali.jpg"
            }
        ];

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(mockResults, null, 2),
                },
            ],
        };
    },
    {
        title: "Search Destinations",
        readOnlyHint: true,
        openWorldHint: true
    }
);

// Tool 2: Get Weather
mcp.tool(
    "get_weather",
    {
        latitude: z.number().describe("Latitude of the location"),
        longitude: z.number().describe("Longitude of the location"),
    },
    async ({ latitude, longitude }) => {
        console.log(`[Tool] Getting weather for: ${latitude}, ${longitude}`);

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
            );
            const data = await response.json();

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error fetching weather: ${error.message}` }],
                isError: true,
            };
        }
    },
    {
        title: "Get Weather Forecast",
        readOnlyHint: true,
        openWorldHint: true
    }
);

// --- SSE Transport ---
const transports = new Map();

app.get("/sse", async (req, res) => {
    console.log("New SSE connection request");
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = crypto.randomUUID();
    transports.set(sessionId, transport);

    res.on("close", () => {
        console.log("SSE connection closed");
        transports.delete(sessionId);
    });

    await mcp.connect(transport);
});

app.post("/messages", async (req, res) => {
    for (const transport of transports.values()) {
        await transport.handlePostMessage(req, res, req.body);
        return;
    }
    res.status(404).send("No active session found");
});

// Fallback for UI (SPA routing)
app.use((req, res) => {
    if (!req.path.startsWith("/sse") && !req.path.startsWith("/messages")) {
        res.sendFile(path.join(__dirname, "../travel_ui/dist/index.html"));
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Travel OS MCP Server running on http://0.0.0.0:${PORT}`);
    console.log(`- UI available at root`);
    console.log(`- SSE Endpoint: /sse`);
});
