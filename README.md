# Kuku Coach - AI Voice Coaching Assistant

An AI-powered voice coaching application that helps users work through mental health challenges with an accessible, conversation-style interface.

## 🎯 Features

- **Voice Interaction**: Record voice input and receive AI-generated spoken responses
- **Real-time Visualization**: Multi-layered voice waveform visualization during conversations
- **Session Management**: Track conversation history and session progress
- **Mobile Optimized**: Responsive design with touch-friendly interface
- **China-Friendly**: Optimized for global deployment including China

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Audio Processing**: Web Audio API
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v6

## 🏗️ Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd design-to-reality-94

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file in the root directory:
```bash
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### Build for Production
```bash
npm run build
```

## 🌐 Deployment

### Netlify Deployment
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variable: `VITE_API_BASE_URL`
4. Deploy automatically with the included `netlify.toml` configuration

### Environment Configuration
- **Development**: Uses `http://localhost:8000/api` by default
- **Production**: Uses `VITE_API_BASE_URL` environment variable

## 📱 Mobile Support

The application is fully optimized for mobile devices with:
- Touch-friendly interface
- Responsive design
- Mobile-optimized audio controls
- China-compatible resource loading

## 🎨 Key Components

- **KukuCoach**: Main conversation interface
- **VoiceVisualization**: Real-time audio visualization
- **SessionHistory**: Conversation replay and statistics
- **AudioRecorder**: Voice recording functionality

## 🔧 API Integration

The app communicates with a backend API for:
- Session creation and management
- Audio processing and AI responses
- Conversation history retrieval

## 📄 License

This project is proprietary software for Kuku Coach.

## 🤝 Contributing

This is a private project. For development questions, please contact the development team.
