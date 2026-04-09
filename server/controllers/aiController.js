import axios from 'axios';

/**
 * AI Controller - Cầu nối giữa Frontend và FastAPI (Ollama)
 * Đảm bảo dữ liệu trả về chuẩn format để React có thể render và navigate đúng route /product/:id
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    // 1. Kiểm tra đầu vào
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        answer: "Please say something! 🌿", 
        products: [] 
      });
    }

    // 2. Xác định Session ID để AI nhớ lịch sử hội thoại
    // Ưu tiên ID người dùng đã đăng nhập, nếu không dùng guestId hoặc mặc định
    const sessionId = req.user?._id?.toString() || req.body.guestId || "guest_session"; 

    // 3. Gọi đến FastAPI Server (nơi chạy Ollama + Vector Search)
    const response = await axios.post("http://localhost:8000/chat", 
      {
        message,
        session_id: sessionId
      },
      {
        // Timeout 60s vì LLM chạy local (Ollama) có thể phản hồi chậm
        timeout: 60000 
      }
    );

    const aiData = response.data;

    // 4. CHUẨN HÓA DỮ LIỆU (DATA NORMALIZATION) - QUAN TRỌNG NHẤT
    // Ép kiểu dữ liệu để Frontend không bao giờ bị crash và link luôn đúng format ID
    const finalProducts = (Array.isArray(aiData.products) ? aiData.products : []).map(p => {
      // Lấy ID gốc (mã hex 24 ký tự) từ FastAPI trả về
      const productId = p.id || p._id;

      return {
        id: productId, 
        name: p.name || "Unknown Product",
        price: p.price || 0,
        image: p.image || "/default-product.png",
        // CÁCH 1: Ép slug = productId. 
        // Điều này đảm bảo khi navigate(`/product/${slug}`) sẽ khớp với Route :id ở App.jsx
        slug: productId 
      };
    });

    // 5. TRẢ VỀ CHO FRONTEND
    res.status(200).json({
      answer: aiData.answer || "I'm not quite sure how to help with that. Could you clarify? 🍃",
      products: finalProducts,
      session_id: sessionId
    });

  } catch (error) {
    console.error("❌ AI Controller Error:", error.message);

    // 6. XỬ LÝ LỖI (ERROR HANDLING)
    
    // Lỗi Timeout (FastAPI hoặc Ollama quá tải)
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        answer: "The AI is thinking a bit slowly today. Please try again in a moment! 🐢", 
        products: [] 
      });
    }

    // Lỗi kết nối (FastAPI server chưa bật)
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        answer: "AI services are currently offline. Please check your FastAPI server. 🔌", 
        products: [] 
      });
    }

    // Lỗi server chung
    res.status(500).json({ 
      answer: "Oops! I encountered a glitch while processing your request. 🤖", 
      products: [] 
    });
  }
};