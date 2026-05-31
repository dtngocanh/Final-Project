import axios from 'axios';

/**
 * AI Controller - Cấu trúc lại để nhận dữ liệu "sạch" từ FastAPI
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, guestId } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        answer: "Please say something! 🌿", 
        products: [] 
      });
    }

    // 1. Session ID (Giữ nguyên logic cũ của bạn)
    const sessionId = req.user?._id?.toString() || guestId || "guest_session"; 

    // 2. Gọi sang FastAPI
    // Lưu ý: Đảm bảo port 8000 đã được bật và FastAPI đang chạy
    const response = await axios.post("http://localhost:8000/chat", 
      {
        message,
        session_id: sessionId
      },
      {
        timeout: 90000 // Tăng nhẹ timeout lên 1.5 phút cho chắc
      }
    );

    const { answer, products } = response.data;

    // 3. CHUẨN HÓA DỮ LIỆU TRƯỚC KHI TRẢ VỀ REACT
    // Vì FastAPI đã bốc đúng data từ Mongo, ở đây ta chỉ cần map lại cho khớp property của Frontend
    const finalProducts = (Array.isArray(products) ? products : []).map(p => ({
      id: p.id,            // ID 24 ký tự từ Mongo
      name: p.name,
      price: p.price,
      image: p.image,      // Link ảnh thật từ DB
      slug: p.id           // Ép slug = id để App.jsx navigate(`/product/${id}`)
    }));

    // 4. TRẢ VỀ CHO FRONTEND
    res.status(200).json({
      answer: answer || "I'm processing your request... 🍃",
      products: finalProducts,
      session_id: sessionId
    });

  } catch (error) {
    console.error("❌ AI Controller Error:", error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        answer: "The AI is taking a bit longer to think. Hang tight! 🐢", 
        products: [] 
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        answer: "AI engine is offline (FastAPI). 🔌", 
        products: [] 
      });
    }

    res.status(500).json({ 
      answer: "Something went wrong in the AI pipeline. 🤖", 
      products: [] 
    });
  }
};