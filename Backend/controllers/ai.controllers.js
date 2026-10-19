const ExcelModel = require('../models/excel.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Model priority list — first available/non-overloaded model wins
const MODELS = [
    'models/gemini-flash-lite-latest',
    'models/gemini-flash-latest',
    'models/gemini-2.5-flash-lite',
    'models/gemini-3.8-flash',
];

/**
 * Generates content, trying each model in MODELS until one succeeds.
 */
async function generateWithRetry(prompt) {
    let lastError;
    for (const model of MODELS) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await ai.models.generateContent({ model, contents: prompt });
            console.log(`Success with model: ${model}`);
            return response.text;
        } catch (err) {
            const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE');
            const is404 = err.message?.includes('404') || err.message?.includes('not found');
            console.log(`Model ${model} failed: ${is503 ? '503 overloaded' : is404 ? '404 not found' : err.message?.substring(0, 60)}`);
            lastError = err;
            if (!is503 && !is404) throw err; // Non-transient error — stop immediately
        }
    }
    throw lastError;
}

/**
 * Generates an AI summary for the given Excel file using Google Gemini.
 * Stores the summary in the database and returns it to the client.
 */
const generateAISummary = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service is not configured. Please set GEMINI_API_KEY in the environment.'
            });
        }

        const excelFile = await ExcelModel.findOne({ _id: fileId, user: userId });

        if (!excelFile) {
            return res.status(404).json({
                success: false,
                message: 'Excel file not found'
            });
        }

        // Return cached summary if already generated
        if (excelFile.aiSummary) {
            return res.status(200).json({
                success: true,
                message: 'AI summary retrieved from cache',
                data: {
                    summary: excelFile.aiSummary,
                    fileName: excelFile.fileName
                }
            });
        }

        // Build concise data representation for Gemini
        const { headers = [], rows = [] } = excelFile.excelData || {};
        const sampleRows = rows.slice(0, 20);

        const dataPreview = [headers, ...sampleRows]
            .map(row => (Array.isArray(row) ? row.join('\t') : String(row)))
            .join('\n');

        const prompt = `You are a professional data analyst. Analyze this Excel spreadsheet and provide a clear, insightful summary.

File: ${excelFile.fileName}
Total rows: ${rows.length}
Columns (${headers.length}): ${headers.join(', ')}

Data preview (first ${sampleRows.length} rows):
${dataPreview}

Provide a structured analysis with these sections:
1. **Overview** - What this dataset represents (1-2 sentences).
2. **Key Columns** - Brief description of the most important columns.
3. **Data Insights** - 3-5 notable patterns, trends, or statistics.
4. **Data Quality** - Any obvious issues visible in the sample.
5. **Suggested Analyses** - 2-3 chart types or analyses most valuable for this data.

Keep it concise, practical, and use markdown formatting.`;

        const summary = await generateWithRetry(prompt);

        // Cache the summary in DB
        await ExcelModel.findByIdAndUpdate(fileId, { aiSummary: summary });

        return res.status(200).json({
            success: true,
            message: 'AI summary generated successfully',
            data: {
                summary,
                fileName: excelFile.fileName
            }
        });

    } catch (error) {
        console.error('AI summary error:', error.message);

        const is503 = error.message?.includes('503') || error.message?.includes('high demand');
        if (is503) {
            return res.status(503).json({
                success: false,
                message: 'Gemini is temporarily overloaded. Please try again in a few seconds.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to generate AI summary',
            error: error.message
        });
    }
};

/**
 * Clears the cached AI summary so it can be regenerated.
 */
const clearAISummary = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;

        const excelFile = await ExcelModel.findOneAndUpdate(
            { _id: fileId, user: userId },
            { aiSummary: null },
            { new: true }
        );

        if (!excelFile) {
            return res.status(404).json({ success: false, message: 'Excel file not found' });
        }

        return res.status(200).json({ success: true, message: 'AI summary cleared successfully' });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { generateAISummary, clearAISummary };
