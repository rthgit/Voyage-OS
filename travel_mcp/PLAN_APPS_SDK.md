# Travel OS - Apps SDK + MCP Architecture Plan

## 1. App Overview
**Name**: Plan My Trip (Travel OS)
**Goal**: Plan complete trips with smart itineraries, budget breakdowns, and visual inspiration.
**Architecture**:
- **Backend**: MCP Server (Node.js + Express) exposing tools to ChatGPT.
- **Frontend**: React/Next.js Web Component (rendered in ChatGPT iframe).

## 2. MCP Tools Map (The "Brain")
These tools allow ChatGPT to fetch real data and perform actions.

| Tool Name | Description | Inputs | Output |
|-----------|-------------|--------|--------|
| `search_destinations` | Search for places based on vague or specific queries. | `query` (string), `filters` (object: climate, budget) | List of destinations with IDs, images, and summaries. |
| `get_destination_details` | Get deep details for a specific place. | `destination_id` (string) | Weather, currency, top 3 attractions, visa info. |
| `get_flight_estimates` | Get *approximate* flight costs (no booking). | `origin`, `destination`, `date_range` | Price ranges, duration, airlines. |
| `get_accommodation` | Search hotels/rentals. | `location`, `check_in`, `guests`, `budget_level` | List of options with ratings and prices. |
| `generate_itinerary` | Create a day-by-day plan. | `destination`, `days`, `interests` (array) | Structured JSON itinerary. |

## 3. UI Screens (The "Face")
The UI will be a Single Page Application (SPA) embedded in ChatGPT.

### Screen A: The "Dreamer" Dashboard (Home)
- **Visuals**: Large hero background (dynamic based on time/season).
- **Components**:
    - "Inspire Me" Carousel: Trending destinations.
    - Smart Search Bar: "Where do you want to go?"
    - "Trip Cards": Saved or recent trip drafts.

### Screen B: Destination Hub (Context Aware)
- *Triggered when user selects a destination.*
- **Components**:
    - **Live Weather Widget** (via OpenMeteo).
    - **Map View**: Interactive map with pins for attractions.
    - **Cost Estimator**: Sliders for budget (Food, Stay, Flights).

### Screen C: Itinerary Builder (Interactive)
- *Triggered when "Plan Itinerary" is active.*
- **Components**:
    - **Timeline View**: Vertical timeline of Day 1, Day 2...
    - **Drag & Drop**: User can reorder activities suggested by AI.
    - **Export Button**: PDF or Share Link.

## 4. Server Schema (Technical)
We will switch from `Stdio` to `HTTP/SSE` to support the Apps SDK standard.

**Stack**: Node.js, Express, `@modelcontextprotocol/sdk`.

```javascript
// server.js structure
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
const mcp = new McpServer({ name: "TravelOS", version: "1.0.0" });

// Define Tools
mcp.tool("search_destinations", ...);
mcp.tool("get_weather", ...);

// MCP Endpoints for Apps SDK
app.get("/sse", (req, res) => {
  // Handle SSE connection
});

app.post("/messages", (req, res) => {
  // Handle tool calls
});

app.listen(3000);
```

## 5. Next Steps
1.  **Update `package.json`** to include `express`.
2.  **Refactor `index.js`** to use Express and SSE Transport.
3.  **Implement `search_destinations`** with a real (or better mock) API.
