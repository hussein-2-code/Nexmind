const AppError = require('../utils/appErrors');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek-chat';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat'; // DeepSeek via OpenRouter

/**
 * Build the same dashboard UI prompt used by Groq.
 */
function buildPrompt(body) {
  const { projectName, language, targetPlatform, description } = body || {};
  return `
You are a senior product designer and frontend engineer.

The user wants a single-page dashboard UI.

Project info:
- Name: ${projectName}
- Main language / stack: ${language || 'not specified'}
- Target: ${targetPlatform || 'not specified'}
- Description: ${description}

Requirements:
- Output MUST be valid JSON with this exact shape:
  {
    "summary": "short plain text description of the UI you designed",
    "html": "<div>...</div>",
    "css": "/* CSS that styles only elements inside a root .ai-dashboard-wrapper */"
  }
- Do NOT include <html>, <head>, or <body> tags in "html" (root should be a single <div class="ai-dashboard-wrapper"> ...).
- CSS must be namespaced so it only affects .ai-dashboard-wrapper and its children.
- The design should be responsive, modern, dark-themed, and suitable for the described project.

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no backticks, no explanations.
`;
}

/**
 * Build prompt for editing the previous UI (user says what to change).
 */
function buildEditPrompt(body) {
  const { editInstruction, previousSummary, previousHtml, previousCss } = body || {};
  return `
You are a senior product designer and frontend engineer. The user is EDITING an existing dashboard UI, not creating a new one.

CURRENT UI:
- Summary: ${previousSummary || '(none)'}
- HTML (root only, no html/head/body):
${previousHtml || '<div class="ai-dashboard-wrapper">...</div>'}

- CSS (scoped to .ai-dashboard-wrapper):
${previousCss || '/* styles */'}

USER'S EDIT REQUEST:
${editInstruction}

Your task: Apply the user's requested changes to the existing UI. Return the FULL updated design as a single JSON object with this exact shape:
  {
    "summary": "short updated description of the UI",
    "html": "<div class=\"ai-dashboard-wrapper\">...</div>",
    "css": "/* full updated CSS for .ai-dashboard-wrapper */"
  }
- Keep the same structure and only change what the user asked for. Do NOT include <html>, <head>, or <body> in "html".
- Return ONLY the JSON object, no markdown, no backticks, no explanations.
`;
}

/**
 * Call DeepSeek: native api.deepseek.com or via OpenRouter if key is sk-or-v1- (OpenRouter key).
 * Returns raw content string.
 */
async function callDeepSeek(prompt, systemContent = 'You respond ONLY with JSON. Do not include backticks or any surrounding text.') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new AppError('DEEPSEEK_API_KEY is not configured on the server', 500);
  }

  const isOpenRouter = apiKey.startsWith('sk-or-v1-');
  const url = isOpenRouter ? OPENROUTER_URL : DEEPSEEK_API_URL;
  const model = isOpenRouter ? OPENROUTER_MODEL : MODEL;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || data.message || `API error: ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.code = data.error?.code;
    throw err;
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new AppError('No content received from AI', 500);
  }
  return content;
}

exports.generateDashboardUI = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { projectName, description, editInstruction, previousSummary, previousHtml, previousCss } = body;

    const isEditMode = editInstruction && (previousHtml || previousSummary);

    if (isEditMode) {
      if (!editInstruction.trim()) {
        return next(new AppError('editInstruction is required when editing', 400));
      }
    } else {
      if (!projectName || !description) {
        return next(
          new AppError('projectName and description are required', 400),
        );
      }
    }

    const prompt = isEditMode
      ? buildEditPrompt({ editInstruction, previousSummary, previousHtml, previousCss })
      : buildPrompt(body);
    const content = await callDeepSeek(prompt);

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse JSON:', content);
      return next(
        new AppError('Failed to parse UI response from DeepSeek', 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      data: parsed,
    });
  } catch (err) {
    console.error('DeepSeek error:', err);

    if (err instanceof AppError) return next(err);
    if (err.status === 429) {
      return next(
        new AppError('Rate limit exceeded. Please try again later.', 429),
      );
    }
    if (err.status === 401) {
      return next(
        new AppError('Invalid DeepSeek API key', 401),
      );
    }

    return next(
      new AppError(err.message || 'Failed to generate UI with DeepSeek. Try again later.', 500),
    );
  }
};
