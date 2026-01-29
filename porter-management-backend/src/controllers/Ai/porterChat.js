import geminiAIConfig from "../../config/gemini.config.js";

export const porterChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const response = await geminiAIConfig.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "system",
          parts: [
            {
              text: `
You are a helpful assistant for the Porter Management System.
Your job is to help porters understand:
- How the system works
- Their dashboard features
- Job assignments
- Status updates
- Payments and approvals

Answer clearly and briefly.
Do NOT talk about unrelated topics.
`,
            },
          ],
        },
        ...history,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const reply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t understand that.";

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "Chat service unavailable",
    });
  }
};
