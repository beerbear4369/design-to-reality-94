# Think Clear - AI Voice Coaching Assistant

## Overview
Think Clear is an AI-powered voice coaching assistant that provides personal development and mental health support through natural voice interactions. The application features real-time voice processing, dynamic audio visualizations, and seamless conversation flow.

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd design-to-reality-94
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- **Voice Interaction**: Real-time voice recording and AI response playback
- **Audio Visualization**: Dynamic multi-layered waveform visualization
- **Session Management**: Persistent conversation history and session summaries
- **Responsive Design**: Mobile-optimized interface with touch-friendly controls
- **Real-time Feedback**: Visual indicators for recording, processing, and response states

## Technical Stack

- **Frontend**: React 18 + TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI components
- **State Management**: React Context API, TanStack Query
- **Audio Processing**: Web Audio API
- **Routing**: React Router v6

## Production Deployment

This application can be deployed to various hosting platforms:

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up custom domain if needed

### Vercel Deployment
1. Connect repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

## API Integration

The application supports both mock and production API backends:

- **Mock Mode**: Built-in mock responses for development
- **Production Mode**: REST API integration with configurable base URL
- **Health Checking**: Automatic backend availability detection

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software developed for Think Clear.
