// Simple helper to call Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function askGemini(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ]
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error('Failed to generate AI response');
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
}

export async function generateProjectMatchScore(userContext, projectContext) {
  const systemInstruction = `
    You are an expert project matching assistant for OPEER, a university project collaboration platform.
    Your job is to read a User's profile (skills, bio, department) and a Project's details (title, description, goal, execution plan).
    Output exactly valid JSON (no markdown block, just raw JSON) in this exact format:
    {
      "score": <number 0-100 indicating match quality>,
      "reason": "<A compelling 1-sentence reason why this is a good/bad match>"
    }
  `;

  const userPrompt = `
    User Profile:
    ${JSON.stringify(userContext, null, 2)}
    
    Project Details:
    ${JSON.stringify(projectContext, null, 2)}
    
    Please provide the JSON match result.
  `;

  try {
    let result = await askGemini(systemInstruction, userPrompt);
    // clean up any markdown response if returned
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(result);
  } catch (err) {
    console.error('Failed to parse match score:', err);
    return { score: 0, reason: "Error generating recommendation score." };
  }
}

export async function generateChatResponse(projectContext, chatHistory, userPrompt) {
  const systemInstruction = `
    You are OPEER AI, a helpful chat assistant residing inside a project's collaboration room.
    You have knowledge of the project's details. Answer questions regarding the project.
    Keep your answers highly concise, useful, and conversational.
    If the user asks something completely unrelated to the project or coding, remind them quickly of your purpose.
    Project Information:
    Title: ${projectContext.title}
    Description: ${projectContext.description}
    Goal: ${projectContext.goal || 'Not specified'}
    Execution Plan: ${projectContext.executionPlan || 'Not specified'}
    Resources: ${projectContext.resources || 'Not specified'}
  `;

  let prompt = `Recent Chat History:\n`;
  chatHistory.forEach(msg => {
    prompt += `[${msg.sender.name}]: ${msg.content}\n`;
  });
  prompt += `\nCurrentUser says: ${userPrompt}`;

  return await askGemini(systemInstruction, prompt);
}
