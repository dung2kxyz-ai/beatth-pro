const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Lấy API Key từ biến môi trường trên Render (hoặc dán trực tiếp chuỗi AQ... của bạn vào đây)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6Kle-hNwhhKp9DfDFVehp9m60PtSK6wltVeFNgmq7bYkA";

app.post('/generate-beat', async (req, res) => {
    try {
        const { idea, duration, genre, voice } = req.body;
        console.log("🛠️ Đang viết lời cho yêu cầu:", { idea, duration, genre, voice });

        const prompt = `Bạn là một nhạc sĩ chuyên nghiệp. Hãy viết lời bài hát dựa trên các yêu cầu sau:
        - Ý tưởng chủ đạo: ${idea}
        - Thể loại âm nhạc: ${genre}
        - Đặc điểm giọng hát: ${voice}
        - Thời lượng: ${duration}
        
        Yêu cầu nghiêm ngặt:
        - Viết bằng tiếng Việt, chia cấu trúc rõ (Intro, Verse, Chorus, Outro).
        - TRÌNH BÀY SẠCH SẼ: Tuyệt đối không dùng các ký tự Markdown như ** hay ### trong kết quả.`;

        // Gọi trực tiếp REST API của Gemini (tương thích tuyệt đối với khóa AQ...)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const songLyrics = data.candidates[0].content.parts[0].text;
            res.json({ success: true, lyrics: songLyrics });
        } else {
            console.error("❌ Phản hồi từ Google:", data);
            res.status(500).json({ success: false, message: data.error?.message || "Lỗi không lấy được nội dung từ AI" });
        }

    } catch (error) {
        console.error("❌ Lỗi hệ thống:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Máy chủ đang chạy tại cổng ${PORT}`);
});