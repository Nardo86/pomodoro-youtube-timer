# Pomodoro YouTube Timer

**A productivity app combining the Pomodoro technique with YouTube video playback for focused work sessions.**
🔗 **[Try it here](https://ytpt.erosnardi.me/)**
☕ **[Buy me a coffee](https://paypal.me/ErosNardi)**

---

## ⚠️ Disclaimer
This project is 100% vibe-coded. Open an issue if you find any bugs!

---

## 🌟 Features

| **Pomodoro Timer**          | **YouTube Integration**       | **User Interface**            |
|-----------------------------|--------------------------------|--------------------------------|
| Configurable work/break durations | Embedded YouTube player        | Dark/light mode toggle         |
| Long break after N sessions | Video pauses during breaks     | Responsive design              |
| Cycle progress indicator    | Manage favorite videos         | Clean, intuitive layout        |

---

## 🔄 How It Works

1. **Work Session**
   - Set your work duration (default: 25 min).
   - Start the timer and focus on your task.
   - Video continues playing.

2. **Short Break**
   - Timer switches to break mode after work session ends.
   - Video pauses automatically.
   - Default duration: 5 min.

3. **Long Break**
   - After completing 4 work sessions (default), take a long break.
   - Default duration: 15 min.

4. **Cycle Completion**
   - Each completed session increments the cycle counter.
   - Visual indicators show progress.

---

## 🛠️ Installation

```bash
git clone https://github.com/Nardo86/pomodoro-youtube-timer.git
cd pomodoro-youtube-timer
npm install
npm start
```

---

## 🚀 Manual Deployment with Nginx

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Copy the `build` folder contents to your web server.**

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /path/to/your/build/folder;
       index index.html;

       location / {
           try_files \$uri \$uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```
   - Replace `yourdomain.com` with your actual domain.
   - Update `/path/to/your/build/folder` with the real path.
   - Configure SSL for HTTPS and set proper permissions.

---

## 📚 Documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** – Complete deployment guide with GitHub Actions
- **[DEVELOPMENT.md](DEVELOPMENT.md)** – Development setup and architecture

---

## 🤝 Contributing
Contributions are welcome! Feel free to submit a Pull Request.

---

## 📄 License
This project is open source and available under the **[MIT License](LICENSE)**.
