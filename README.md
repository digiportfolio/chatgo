```markdown
# 🚀 ChatGO - Free AI Assistant

> Sebuah aplikasi chat AI gratis yang menggunakan API Groq dengan backend FastAPI dan frontend murni HTML/CSS/JS. Proyek portofolio untuk Python Developer.

![GitHub](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Groq](https://img.shields.io/badge/Groq-API-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Fitur Unggulan

| Fitur | Status | Deskripsi |
|-------|--------|------------|
| 💬 **Real-time Chat** | ✅ | Kirim pesan dan dapatkan respons instan dari AI |
| 🎯 **Streaming Response** | ✅ | Teks muncul huruf per huruf (seperti ChatGPT) |
| 🌙 **Dark Mode** | ✅ | Toggle antara mode terang dan gelap |
| 📋 **Copy Message** | ✅ | Salin pesan AI dengan satu klik |
| 💾 **Chat History** | ✅ | Percakapan tersimpan otomatis di localStorage |
| 🔄 **Multiple AI Models** | ✅ | Pilih dari 4 model AI gratis berbeda |
| 📱 **Responsive Design** | ✅ | Bekerja sempurna di desktop, tablet, dan HP |
| 🎨 **Code Highlighting** | ✅ | Syntax highlighting untuk kode |
| 🧹 **Clear Chat** | ✅ | Hapus semua percakapan dengan sekali klik |

## 🧠 Model AI Tersedia

| Model | Kode | Kecepatan | Kualitas |
|-------|------|-----------|----------|
| 🦙 Llama 3.3 70B | `llama-3.3-70b-versatile` | Medium | ★★★★★ (Terbaik) |
| 🚀 Llama 3.1 70B | `llama-3.1-70b-versatile` | Medium | ★★★★☆ |
| ⚡ Llama 3.1 8B | `llama-3.1-8b-instant` | Sangat Cepat | ★★★☆☆ |
| 🔬 Gemma 2 9B | `gemma2-9b-it` | Cepat | ★★★☆☆ |

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│         HTML5 + CSS3 + Vanilla JS                   │
│         (LocalStorage, Fetch API, SSE)              │
├─────────────────────────────────────────────────────┤
│                    Backend                           │
│         Python + FastAPI + Uvicorn                  │
├─────────────────────────────────────────────────────┤
│                    AI Provider                       │
│         Groq Cloud API (100% Gratis)                │
│         (Mixtral, Llama 3, Gemma)                   │
├─────────────────────────────────────────────────────┤
│                    Deployment                        │
│         Render / Railway / PythonAnywhere           │
└─────────────────────────────────────────────────────┘
```

## 📁 Struktur Proyek

```
chatgo/
├── main.py              # Backend FastAPI
├── requirements.txt     # Python dependencies
├── .env                 # API key (jangan commit!)
├── static/
│   └── index.html      # Frontend lengkap (html, css, js)
├── .gitignore          # File yang diabaikan Git
└── README.md           # Dokumentasi ini
```

## 🚀 Cara Menjalankan Lokal

### Prasyarat

- Python 3.8 atau lebih baru
- Akun Groq (gratis) di https://console.groq.com

### Langkah 1: Clone Repository

```bash
git clone https://github.com/username/chatgo.git
cd chatgo
```

### Langkah 2: Buat Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### Langkah 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Langkah 4: Setup API Key

Buat file `.env` di root folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Dapatkan API key dari: https://console.groq.com/keys

### Langkah 5: Jalankan Aplikasi

```bash
python main.py
```

### Langkah 6: Buka Browser

Akses: **http://localhost:8000**

## 📦 Dependencies

Buat file `requirements.txt`:

```txt
fastapi==0.104.1
uvicorn==0.24.0
groq==0.4.2
python-dotenv==1.0.0
httpx==0.25.1
```

## 🔧 Konfigurasi

### Mengaktifkan/Nonaktifkan Streaming

Di `static/index.html`, cari baris:

```javascript
const USE_STREAMING = true;  // Set ke false untuk non-streaming
```

### Mengganti Model Default

Di `main.py`:

```python
model: str = "llama-3.3-70b-versatile"  # Ganti sesuai kebutuhan
```

## 🎯 Fitur Detail

### 1. Copy Pesan
- Hover pada pesan AI → muncul tombol "Salin"
- Klik untuk menyalin teks ke clipboard
- Notifikasi konfirmasi muncul

### 2. Dark Mode
- Klik tombol 🌙 Dark di header
- Preferensi tersimpan di localStorage
- Mode terang/gelap bertahan setelah refresh

### 3. Chat History
- Semua percakapan tersimpan otomatis
- Data tetap ada setelah refresh browser
- Tombol "Clear Chat" untuk menghapus semua

### 4. Multiple Models
- Dropdown di header untuk切换 model
- Setiap model punya karakteristik berbeda

### 5. Code Highlighting
- Support HTML tags (ditampilkan sebagai teks, tidak dirender)
- Syntax highlighting untuk kode dalam ``` blocks

## 🌐 Deployment ke Production

### Render.com (Rekomendasi - Gratis)

1. Push kode ke GitHub
2. Buka https://render.com
3. New → Web Service
4. Connect repository
5. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variable: `GROQ_API_KEY`
7. Deploy

### Railway.app (Alternatif)

```bash
railway login
railway init
railway up
```

## 📸 Screenshot

### Light Mode
![Light Mode](screenshots/light-mode.png)

### Dark Mode
![Dark Mode](screenshots/dark-mode.png)

### Mobile View
![Mobile](screenshots/mobile.png)

## 🧪 Testing

### Test API Endpoint

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Halo, apa kabar?", "model":"llama-3.3-70b-versatile"}'
```

### Test Health Check

```bash
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Error 400 - Model decommissioned | Ganti model di dropdown dengan yang aktif |
| API Key invalid | Cek `.env` file dan restart server |
| Port 8000 sudah dipakai | Ganti port di `main.py`: `port=8001` |
| Streaming tidak jalan | Set `USE_STREAMING = false` di HTML |
| CORS error | Pastikan CORS middleware aktif di `main.py` |

## 📈 Roadmap

- [ ] Voice input (Web Speech API)
- [ ] Export chat ke PDF/Markdown
- [ ] Multi-user authentication
- [ ] Database PostgreSQL untuk menyimpan history
- [ ] Custom system prompt
- [ ] Temperature slider untuk kontrol kreativitas

## 🤝 Kontribusi

Pull requests diterima. Untuk perubahan besar, buka issue dulu untuk diskusi.

## 📝 License

MIT License - Bebas digunakan untuk belajar dan portofolio.

## 👨‍💻 Author

**Your Name**
- GitHub: [@username](https://github.com/username)
- LinkedIn: [linkedin.com/in/username](https://linkedin.com/in/username)

## 🙏 Acknowledgments

- [Groq](https://groq.com) untuk API gratis yang cepat
- [FastAPI](https://fastapi.tiangolo.com) untuk framework backend
- [Meta](https://ai.meta.com/llama/) untuk Llama 3 model
- [Google](https://ai.google.dev/gemma) untuk Gemma model

---

## ⭐ Show Your Support

Beri ⭐ jika proyek ini bermanfaat!

**Dibuat dengan ❤️ untuk portofolio Python Developer**
```

---

## Catatan Tambahan

### Jika Ingin Tambah Screenshot

Buat folder `screenshots/` dan tambahkan file:
- `light-mode.png`
- `dark-mode.png` 
- `mobile.png`

### Jika Ingin Badge yang Lebih Banyak

```markdown
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-teal)
![Groq](https://img.shields.io/badge/Groq-API-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
```
