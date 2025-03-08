import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractContent(filePath: string): Promise<string> {
  const fileExtension = filePath.split('.').pop()?.toLowerCase();

  if (!fileExtension) {
    throw new Error('Invalid file extension');
  }

  switch (fileExtension) {
    case 'txt':
      return extractTextContent(filePath);
    case 'pdf':
      return await extractPdfContent(filePath);
    case 'docx':
      return await extractDocxContent(filePath);
    default:
      throw new Error('Unsupported file format');
  }
}

function extractTextContent(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

async function extractPdfContent(filePath: string): Promise<string> {
  const dataBuffer = readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

async function extractDocxContent(filePath: string): Promise<string> {
  const dataBuffer = readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value;
}
