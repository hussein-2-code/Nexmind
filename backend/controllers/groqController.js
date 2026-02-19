const AppError = require('../utils/appErrors');

// Lazy init: only create Groq client when actually used (so app can run with only DeepSeek)
function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('GROQ_API_KEY is not configured on the server', 500);
  }
  const Groq = require('groq-sdk');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function buildEditPromptGroq(body) {
  const { editInstruction, previousSummary, previousHtml, previousCss } = body || {};
  return `
You are a senior product designer and frontend engineer. The user is EDITING an existing dashboard UI, not creating a new one.

CURRENT UI:
- Summary: ${previousSummary || '(none)'}
- HTML (root only):
${previousHtml || '<div class="ai-dashboard-wrapper">...</div>'}

- CSS (scoped to .ai-dashboard-wrapper):
${previousCss || '/* styles */'}

USER'S EDIT REQUEST:
${editInstruction}

Apply the user's requested changes. Return the FULL updated design as JSON:
  {
    "summary": "short updated description",
    "html": "<div class=\"ai-dashboard-wrapper\">...</div>",
    "css": "/* full updated CSS */"
  }
Return ONLY the JSON object, no markdown, no backticks.
`;
}

exports.generateDashboardUI = async (req, res, next) => {
  try {
    const body = req.body || {};
    const {
      projectName,
      language,
      targetPlatform,
      description,
      editInstruction,
      previousSummary,
      previousHtml,
      previousCss,
    } = body;

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

    const groq = getGroqClient();

    const prompt = isEditMode
      ? buildEditPromptGroq({ editInstruction, previousSummary, previousHtml, previousCss })
      : `
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

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You respond ONLY with JSON. Do not include backticks or any surrounding text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Updated model
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      return next(
        new AppError('No content received from Groq', 500),
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse JSON:', content);
      return next(
        new AppError('Failed to parse UI response from Groq', 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      data: parsed,
    });
  } catch (err) {
    console.error('Groq error:', err);
    
    if (err.status === 429) {
      return next(
        new AppError('Rate limit exceeded. Please try again later.', 429),
      );
    }
    if (err.status === 401) {
      return next(
        new AppError('Invalid Groq API key', 401),
      );
    }
    
    return next(
      new AppError('Failed to generate UI with Groq. Try again later.', 500),
    );
  }
};