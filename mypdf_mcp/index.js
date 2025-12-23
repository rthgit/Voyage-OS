import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import crypto from "crypto";
import fs from "fs";
import PDFDocument from "pdfkit";
import pptxgen from "pptxgenjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Directories
const exportsDir = path.join(__dirname, "exports");
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);

app.use("/exports", express.static(exportsDir));

// Static UI serving (optional - only if built)
const distPath = path.join(__dirname, "../mypdf_ui/dist");
if (fs.existsSync(distPath)) {
    console.log(`[MyPDF] Serving UI from: ${distPath}`);
    app.use(express.static(distPath));
} else {
    console.log(`[MyPDF] UI not built - serving API only`);
}

// --- MCP Server ---
const mcp = new McpServer({
    name: "MyPDF Architect",
    version: "1.0.0",
});

// Tool: Generate PDF Report
mcp.tool(
    "generate_pdf_report",
    {
        title: z.string().describe("Titolo del report"),
        subtitle: z.string().optional().describe("Sottotitolo"),
        sections: z.array(z.object({
            heading: z.string().optional(),
            content: z.string(),
            type: z.enum(["text", "list", "table"]).default("text"),
            data: z.any().optional().describe("Dati per tabelle o liste")
        })).describe("Sezioni del documento")
    },
    async ({ title, subtitle, sections }) => {
        console.log(`[MyPDF] Generating PDF: ${title}`);
        try {
            const doc = new PDFDocument({ margin: 50 });
            const filename = `report_${crypto.randomUUID()}.pdf`;
            const filePath = path.join(exportsDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fillColor("#1a365d").fontSize(26).text(title, { align: "center" });
            if (subtitle) {
                doc.moveDown(0.5);
                doc.fillColor("#4a5568").fontSize(16).text(subtitle, { align: "center" });
            }

            doc.moveDown(2);
            doc.strokeColor("#e2e8f0").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(2);

            // Content
            sections.forEach(section => {
                if (section.heading) {
                    doc.fillColor("#2d3748").fontSize(18).text(section.heading);
                    doc.moveDown(0.5);
                }

                doc.fillColor("#4a5568").fontSize(12).text(section.content);
                doc.moveDown(1.5);
            });

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(10).text(`Pagina ${i + 1}`, 50, 750, { align: "center" });
            }

            doc.end();
            await new Promise(resolve => stream.on("finish", resolve));

            const downloadUrl = process.env.RAILWAY_PUBLIC_DOMAIN
                ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/exports/${filename}`
                : `http://localhost:${PORT}/exports/${filename}`;

            return {
                content: [{ type: "text", text: `PDF generato con successo!\nDownload: ${downloadUrl}` }],
            };
        } catch (error) {
            return { content: [{ type: "text", text: `Errore PDF: ${error.message}` }], isError: true };
        }
    }
);

// Tool: Generate PPTX Slides
mcp.tool(
    "generate_pptx_slides",
    {
        title: z.string().describe("Titolo della presentazione"),
        slides: z.array(z.object({
            title: z.string(),
            content: z.string(),
            notes: z.string().optional()
        }))
    },
    async ({ title, slides }) => {
        console.log(`[MyPDF] Generating PPTX: ${title}`);
        try {
            const pres = new pptxgen();
            pres.title = title;

            // Title Slide
            let titleSlide = pres.addSlide();
            titleSlide.addText(title, { x: 1, y: 2, w: '80%', h: 1, fontSize: 44, color: '363636', align: 'center' });

            // Content Slides
            slides.forEach(s => {
                let slide = pres.addSlide();
                slide.addText(s.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 32, color: '003366' });
                slide.addText(s.content, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 18, color: '666666', bullet: true });
                if (s.notes) slide.addNotes(s.notes);
            });

            const filename = `slides_${crypto.randomUUID()}.pptx`;
            const filePath = path.join(exportsDir, filename);

            await pres.writeFile({ fileName: filePath });

            const downloadUrl = process.env.RAILWAY_PUBLIC_DOMAIN
                ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/exports/${filename}`
                : `http://localhost:${PORT}/exports/${filename}`;

            return {
                content: [{ type: "text", text: `Presentazione PPTX generata con successo!\nDownload: ${downloadUrl}` }],
            };
        } catch (error) {
            return { content: [{ type: "text", text: `Errore PPTX: ${error.message}` }], isError: true };
        }
    }
);

// --- SSE Transport ---
const transports = new Map();

app.get("/sse", async (req, res) => {
    console.log("[MyPDF] New SSE connection");
    const transport = new SSEServerTransport("/messages", res);
    await mcp.connect(transport);

    const sessionId = crypto.randomUUID();
    transports.set(sessionId, transport);

    req.on("close", () => {
        console.log(`[MyPDF] Connection closed: ${sessionId}`);
        transports.delete(sessionId);
    });
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = Array.from(transports.values()).find(t => t.sessionId === sessionId);
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(404).send("Session not found");
    }
});

// Fallback per SPA (only if UI is built)
if (fs.existsSync(distPath)) {
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/exports') && !req.path.startsWith('/sse')) {
            res.sendFile(path.join(distPath, 'index.html'));
        } else {
            next();
        }
    });
}

app.listen(PORT, () => {
    console.log(`MyPDF MCP Server running on port ${PORT}`);
});
