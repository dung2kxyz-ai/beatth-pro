const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Đặt trực tiếp API Key vào đây để chạy ổn định tuyệt đối
const genAI = new GoogleGenerativeAI("AQ.Ab8RN6LcnRnqe6FDDuPApe-4TLAK_tcadG4qSW6pYE8MkXtsIA");

app.post('/generate-beat', async (req, res) => {
    try {
        const { idea, duration, genre, voice } = req.body;
        console.log("🛠️ Đang viết lời cho yêu cầu:", { idea, duration, genre, voice });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Bạn là một nhạc sĩ chuyên nghiệp. Hãy viết lời bài hát dựa trên các yêu cầu sau:
        - Ý tưởng chủ đạo: ${idea}
        - Thể loại âm nhạc: ${genre}
        - Đặc điểm giọng hát: ${voice}
        - Thời lượng: ${duration}
        
        Yêu cầu nghiêm ngặt:
        - Viết bằng tiếng Việt, chia cấu trúc rõ (Intro, Verse, Chorus, Outro).
        - TRÌNH BÀY SẠCH SẼ: Tuyệt đối không dùng các ký tự Markdown như ** hay ### trong kết quả.`;

        const result = await model.generateContent(prompt);
        const songLyrics = result.response.text();

        res.json({ success: true, lyrics: songLyrics });

    } catch (error) {
        console.error("❌ Lỗi hệ thống:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Máy chủ đang chạy tại cổng ${PORT}`);
});