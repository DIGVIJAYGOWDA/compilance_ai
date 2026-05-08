import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Strip markdown code blocks from Gemini responses
function stripMarkdown(text) {
  return text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
}

/**
 * Extract structured license data from OCR text
 */
export async function extractLicenseFromText(ocrText) {
  if (!API_KEY) return { data: null, confidence: 0, error: 'Gemini API key not configured' };
  try {
    const prompt = `You are an expert at reading Indian government license documents. Extract fields from the following OCR text and return ONLY a valid JSON object with no markdown, no explanation, no code blocks.

Required fields:
- license_type (one of: FSSAI/FIRE_NOC/TRADE_LICENSE/SHOP_ESTABLISHMENT/EATING_HOUSE/GST/SIGNAGE/DRUG_LICENSE)
- license_number
- issuing_authority
- business_name
- holder_name
- issue_date (YYYY-MM-DD or null)
- expiry_date (YYYY-MM-DD or null)
- address
- confidence (0-100 integer based on how clearly readable the document was)

Use null for unreadable fields.

OCR Text:
${ocrText}`;

    const result = await model.generateContent(prompt);
    const text = stripMarkdown(result.response.text());
    const parsed = JSON.parse(text);
    return { data: parsed, confidence: parsed.confidence || 50, error: null };
  } catch (err) {
    return { data: null, confidence: 0, error: err.message };
  }
}

/**
 * Generate pre-filled renewal form data using Gemini
 */
export async function generateFormPrefill(businessProfile, licenseType) {
  if (!API_KEY) return { data: null, error: 'Gemini API key not configured' };
  try {
    const prompt = `You are a compliance expert for Indian SMBs. Given the business profile and license type, generate a pre-filled renewal form as JSON.

Return ONLY valid JSON with these fields:
- formFields: array of { fieldName, fieldValue, editable: true/false }
- documentChecklist: array of strings
- renewalInstructions: array of step strings
- estimatedTime: string (e.g. "3-5 business days")
- estimatedCost: string (e.g. "₹2,000 - ₹5,000")

Business profile: ${JSON.stringify(businessProfile)}
License type: ${licenseType}`;

    const result = await model.generateContent(prompt);
    const text = stripMarkdown(result.response.text());
    const parsed = JSON.parse(text);
    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Stream chat response from Gemini for the AI assistant
 */
export async function chatWithAI(message, businessContext, chatHistory = [], onChunk) {
  if (!API_KEY) {
    onChunk?.('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
    return;
  }
  try {
    const systemPrompt = `You are ComplianceAI's helpful assistant for Indian small business owners. You specialize in Indian business compliance, government licenses, penalties, and renewal procedures — specifically for Karnataka and Bengaluru. Always use INR (₹) for money. Be concise and practical.

Current business: ${JSON.stringify(businessContext)}

If asked about specific licenses, give exact penalties and renewal portal URLs. Keep answers short (2-4 sentences) unless the user asks for detail.`;

    const history = chatHistory.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: 'Understood. I am ready to help with compliance questions.' }] }, ...history],
    });

    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) onChunk?.(text);
    }
  } catch (err) {
    onChunk?.(`Sorry, I encountered an error: ${err.message}. Please try again.`);
  }
}
