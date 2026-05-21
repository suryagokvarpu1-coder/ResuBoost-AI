import pdfParser from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts plain text from a PDF file buffer.
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} Plain text content of the PDF
 */
export async function parsePDF(buffer) {
  try {
    const data = await pdfParser(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Ensure the file is not corrupted.');
  }
}

/**
 * Extracts plain text from a DOCX file buffer.
 * @param {Buffer} buffer - The DOCX file buffer
 * @returns {Promise<string>} Plain text content of the DOCX
 */
export async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file. Ensure the file is a valid Word document.');
  }
}

/**
 * Utility to extract text from buffer based on mime type.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File mime type
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromBuffer(buffer, mimeType) {
  if (mimeType === 'application/pdf') {
    return await parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword'
  ) {
    return await parseDOCX(buffer);
  } else if (mimeType.startsWith('text/')) {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Please upload PDF, DOCX or TXT files.`);
  }
}
