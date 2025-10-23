const pdf = require("pdf-parse");

async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`PDF parse failed: ${error.message}`);
  }
}

module.exports = { parsePDF };
