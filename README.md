# Pomodoro Timer with YouTube Integration

A productivity application that combines the Pomodoro technique with YouTube video playback for focused work sessions.

## Features

- **Pomodoro Timer**:
  - Configurable work and break durations
  - Long break after a set number of work sessions
  - Visual cycle progress indicator
  - Notifications at the end of each timer period

- **YouTube Integration**:
  - Embedded YouTube video player
  - Search functionality for videos
  - Video pauses during break periods

- **User Interface**:
  - Dark/light mode toggle
  - Responsive design
  - Clean, intuitive layout

- **Offline Functionality**:
  - Works offline after initial load
  - Service worker implementation

## How It Works

1. **Work Session**:
   - Set your work duration (default 25 minutes)
   - Start the timer and focus on your task
   - Video continues playing during work sessions

2. **Break**:
   - After work session ends, timer switches to break mode
   - Video pauses automatically
   - Take a short break (default 5 minutes)

3. **Long Break**:
   - After completing a set number of work sessions (default 4)
   - Take a longer break (default 15 minutes)

4. **Cycle Completion**:
   - Each completed work session increments the cycle counter
   - Visual indicators show progress through the cycle

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pomodoro-timer.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Deployment with Nginx

To deploy the application with Nginx:

1. Build the production version:
   ```
   npm run build
   ```

2. Copy the contents of the `build` folder to your web server.

3. Configure Nginx with the following basic configuration:

```
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/your/build/folder;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

Remember to:
- Replace `yourdomain.com` with your actual domain name
- Replace `/path/to/your/build/folder` with the actual path to your build folder
- Adjust the port number in the proxy_pass directive if your backend API runs on a different port
- Configure SSL if you want to use HTTPS
- Set up proper permissions for the web server to access the files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
