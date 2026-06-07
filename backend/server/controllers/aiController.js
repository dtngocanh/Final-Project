import axios from "axios";

/**
 * AI Controller
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, guestId } = req.body;

    // ==========================
    // Validate Input
    // ==========================
    if (!message || message.trim() === "") {
      return res.status(400).json({
        answer: "Please say something!",
        products: [],
      });
    }

    // ==========================
    // Session ID
    // ==========================
    const sessionId = req.user?._id?.toString() || guestId || "guest_session";

    // ==========================
    // Debug Log
    // ==========================
    console.log("\n========== AI REQUEST ==========");
    console.log("URL:", "https://freshmart-chat.onrender.com/chat");
    console.log("MESSAGE:", message);
    console.log("SESSION:", sessionId);
    console.log("================================\n");

    // ==========================
    // Call FastAPI
    // ==========================
    const response = await axios.post(
<<<<<<< HEAD
      "https://freshmart-chat.onrender.com/chat",

=======
      "https://freshmart-chat.onrender.com",
      // "http://localhost:8000/chat",
>>>>>>> 5f61afbcb15ab3f4a70f2106fc8765148d458ea9
      {
        message,
        session_id: sessionId,
      },
      {
        timeout: 90000,
      },
    );

    // ==========================
    // Debug Response
    // ==========================
    console.log("\n========== AI RESPONSE ==========");
    console.log(response.data);
    console.log("=================================\n");

    const { answer, products } = response.data;

    // ==========================
    // Normalize Products
    // ==========================
    const finalProducts = (Array.isArray(products) ? products : []).map(
      (p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        slug: p.id,
      }),
    );

    // ==========================
    // Return Frontend
    // ==========================
    return res.status(200).json({
      answer: answer || "I'm processing your request...",
      products: finalProducts,
      session_id: sessionId,
    });
  } catch (error) {
    console.log("\n========== AI ERROR ==========");

    console.log("MESSAGE:", error.message);
    console.log("CODE:", error.code);

    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);
      console.log("HEADERS:", error.response.headers);
    }

    if (error.request) {
      console.log("REQUEST SENT BUT NO RESPONSE");
    }

    console.log("==============================\n");

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        answer: "The AI is taking a bit longer to think.",
        products: [],
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        answer: "AI engine is offline.",
        products: [],
      });
    }

    return res.status(500).json({
      answer: "Something went wrong in the AI pipeline.",
      products: [],
    });
  }
};
