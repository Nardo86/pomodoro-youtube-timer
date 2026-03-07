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

## 🚀 Deployment

### Option 1 — Pre-built packages (recommended)

Download the latest ready-to-deploy nginx package from the [Releases](https://github.com/Nardo86/pomodoro-youtube-timer/releases) page, or grab the latest build artifact directly from [GitHub Actions](https://github.com/Nardo86/pomodoro-youtube-timer/actions) (`nginx-deployment-package`).

```bash
tar -xzf pomodoro-timer-nginx-*.tar.gz -C /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo systemctl reload nginx
```

### Option 2 — Build from source

```bash
npm run build
sudo cp -r build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo systemctl reload nginx
```

Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|png|jpg|ico|svg)$ { expires 1y; add_header Cache-Control "public, immutable"; }
}
```

Or use `./deploy.sh` for a guided deploy with backup/rollback support.

---

## 🤝 Contributing
Contributions are welcome! Feel free to submit a Pull Request.

---

## 📄 License
This project is open source and available under the **[MIT License](LICENSE)**.
