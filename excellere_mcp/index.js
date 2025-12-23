import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import crypto from "crypto";
import ExcelJS from "exceljs";
import fs from "fs";
import multer from "multer";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Ensure directories exist
const exportsDir = path.join(__dirname, "exports");
const uploadsDir = path.join(__dirname, "uploads");
[exportsDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Multer setup for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}_${file.originalname}`)
});
const upload = multer({ storage });

const distPath = path.join(__dirname, "../excellere_ui/dist");
console.log(`[Excellere] Serving static files from: ${distPath}`);

app.use(cors());
app.use(express.json());

// Serve Static UI Files (React Build)
app.use(express.static(distPath));
app.use("/exports", express.static(exportsDir));

// --- MCP Server Setup ---
const mcp = new McpServer({
    name: "Excellere",
    version: "1.0.0",
});

// --- Tool Definitions ---

// Tool: Generate Spreadsheet
mcp.tool(
    "generate_spreadsheet",
    {
        filename: z.string().describe("The name of the file to create (e.g., 'Budget2024.xlsx')"),
        sheets: z.array(z.object({
            name: z.string().describe("Name of the worksheet"),
            columns: z.array(z.object({
                header: z.string(),
                key: z.string(),
                width: z.number().optional()
            })).describe("Column definitions"),
            rows: z.array(z.record(z.any())).describe("Data rows (array of objects where keys match column keys)"),
            styles: z.array(z.object({
                range: z.string().describe("Cell range (e.g., 'A1:C1')"),
                bold: z.boolean().optional(),
                color: z.string().optional().describe("Hex color code"),
                bgColor: z.string().optional().describe("Hex background color code")
            })).optional()
        })).describe("List of sheets to create")
    },
    async ({ filename, sheets }) => {
        console.log(`[Excellere] Generating spreadsheet: ${filename}`);

        try {
            const workbook = new ExcelJS.Workbook();

            for (const sheetData of sheets) {
                const worksheet = workbook.addWorksheet(sheetData.name);
                worksheet.columns = sheetData.columns;
                worksheet.addRows(sheetData.rows);

                // Auto-style header
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
            }

            const safeFilename = `${crypto.randomUUID()}_${filename.replace(/[^a-z0-9.]/gi, '_')}.xlsx`;
            const filePath = path.join(exportsDir, safeFilename);
            await workbook.xlsx.writeFile(filePath);

            const downloadUrl = process.env.RAILWAY_PUBLIC_DOMAIN
                ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/exports/${safeFilename}`
                : `http://localhost:${PORT}/exports/${safeFilename}`;

            return {
                content: [
                    {
                        type: "text",
                        text: `Spreadsheet generated successfully!\nDownload link: ${downloadUrl}`,
                    },
                ],
            };
        } catch (error) {
            console.error("Error generating spreadsheet:", error);
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// Tool: Read Spreadsheet (for AI Analysis)
mcp.tool(
    "read_spreadsheet",
    {
        file_path: z.string().describe("Il percorso o il nome del file da leggere (deve essere nella cartella uploads o exports)")
    },
    async ({ file_path }) => {
        console.log(`[Excellere] Reading spreadsheet for analysis: ${file_path}`);

        try {
            // Try to find the file in uploads or exports
            let fullPath = path.join(uploadsDir, path.basename(file_path));
            if (!fs.existsSync(fullPath)) {
                fullPath = path.join(exportsDir, path.basename(file_path));
            }

            if (!fs.existsSync(fullPath)) {
                throw new Error("File non trovato.");
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(fullPath);

            const result = {};
            workbook.eachSheet((worksheet, sheetId) => {
                const sheetData = [];
                worksheet.eachRow((row, rowNumber) => {
                    sheetData.push(row.values);
                });
                result[worksheet.name] = sheetData;
            });

            return {
                content: [
                    {
                        type: "text",
                        text: `Dati estratti dal file:\n${JSON.stringify(result, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Errore durante la lettura: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// --- SSE Transport ---
const transports = new Map();

app.get("/sse", async (req, res) => {
    console.log("New SSE connection request for Excellere");
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

// --- REST API for UI ---
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "Nessun file caricato." });

    const downloadUrl = process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/uploads/${req.file.filename}`
        : `http://localhost:${PORT}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        filename: req.file.filename,
        url: downloadUrl
    });
});

app.use("/uploads", express.static(uploadsDir));

app.post("/api/generate", async (req, res) => {
    const { filename, sheets } = req.body;
    console.log(`[API] Generating spreadsheet: ${filename}`);

    try {
        const workbook = new ExcelJS.Workbook();

        for (const sheetData of sheets) {
            const worksheet = workbook.addWorksheet(sheetData.name);
            worksheet.columns = sheetData.columns;
            worksheet.addRows(sheetData.rows);

            // Auto-style header
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF217346' } // Excel Green
            };

            // Auto-width columns
            worksheet.columns.forEach(column => {
                column.width = column.header.length < 12 ? 15 : column.header.length + 5;
            });
        }

        const safeFilename = `${crypto.randomUUID()}_${filename.replace(/[^a-z0-9.]/gi, '_')}.xlsx`;
        const filePath = path.join(exportsDir, safeFilename);
        await workbook.xlsx.writeFile(filePath);

        const host = req.get('host');
        const protocol = req.protocol;
        const downloadUrl = process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/exports/${safeFilename}`
            : `${protocol}://${host}/exports/${safeFilename}`;

        res.json({
            success: true,
            filename: safeFilename,
            downloadUrl: downloadUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fallback for UI (SPA routing)
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith("/sse") && !req.path.startsWith("/messages") && !req.path.startsWith("/api") && !req.path.startsWith("/exports")) {
        res.sendFile(path.join(distPath, "index.html"));
    } else {
        next();
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Excellere MCP Server running on port ${PORT}`);
});
