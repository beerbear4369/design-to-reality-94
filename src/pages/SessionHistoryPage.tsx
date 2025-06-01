import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getHistory } from "@/services/api/session";
import type { Message } from "@/services/api/session";

interface SessionStats {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  sessionDuration: string;
  startTime: string;
  lastMessageTime: string;
}

export default function SessionHistoryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<SessionStats | null>(null);

  // Fetch conversation history on mount
  React.useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        console.log(`📖 Fetching history for session: ${sessionId}`);
        
        const response = await getHistory(sessionId);
        setMessages(response.messages);
        
        // Calculate session statistics
        const sessionStats = calculateSessionStats(response.messages);
        setStats(sessionStats);
        
        console.log(`📖 Loaded ${response.messages.length} messages`);
      } catch (err) {
        console.error("Failed to fetch session history:", err);
        setError(err instanceof Error ? err.message : "Failed to load session history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  // Calculate session statistics from messages
  const calculateSessionStats = (messages: Message[]): SessionStats => {
    if (messages.length === 0) {
      return {
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        sessionDuration: "0 minutes",
        startTime: "N/A",
        lastMessageTime: "N/A"
      };
    }

    const userMessages = messages.filter(m => m.sender === 'user').length;
    const aiMessages = messages.filter(m => m.sender === 'ai').length;
    
    const startTime = new Date(messages[0].timestamp);
    const lastTime = new Date(messages[messages.length - 1].timestamp);
    const durationMs = lastTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    return {
      totalMessages: messages.length,
      userMessages,
      aiMessages,
      sessionDuration: durationMinutes > 0 ? `${durationMinutes} minutes` : "< 1 minute",
      startTime: startTime.toLocaleString(),
      lastMessageTime: lastTime.toLocaleString()
    };
  };

  const handleGoBack = () => {
    navigate(`/summary/${sessionId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4">
        <div className="text-white/70 text-lg">Loading session history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-400 text-lg">Error Loading History</div>
          <div className="text-white/70">{error}</div>
          <Button onClick={handleGoBack} className="bg-[#312CA3] hover:bg-[#413DB3]">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white/90">Session History</h1>
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="bg-[#080722] border-white/10 text-white/90 hover:bg-[#121035]"
          >
            ← Back to Summary
          </Button>
        </div>

        {/* Session Statistics */}
        {stats && (
          <div className="bg-[#080722] border border-white/10 rounded-[20px] p-6">
            <h2 className="text-xl font-semibold text-white/90 mb-4">Session Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalMessages}</div>
                <div className="text-white/60 text-sm">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.userMessages}</div>
                <div className="text-white/60 text-sm">Your Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.aiMessages}</div>
                <div className="text-white/60 text-sm">AI Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.sessionDuration}</div>
                <div className="text-white/60 text-sm">Duration</div>
              </div>
              <div className="text-center md:col-span-2">
                <div className="text-lg font-semibold text-white/80">{stats.startTime}</div>
                <div className="text-white/60 text-sm">Session Started</div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation History */}
        <div className="bg-[#080722] border border-white/10 rounded-[20px] p-6">
          <h2 className="text-xl font-semibold text-white/90 mb-6">Conversation History</h2>
          
          {messages.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              No messages found for this session.
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-[#312CA3] text-white'
                        : 'bg-[#121035] border border-white/10 text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">
                        {message.sender === 'user' ? 'You' : 'Kuku Coach'}
                      </span>
                      <span className="text-xs opacity-60">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    {message.audioUrl && message.sender === 'ai' && (
                      <div className="mt-2">
                        <audio 
                          controls 
                          className="w-full h-8"
                          crossOrigin="anonymous"
                        >
                          <source src={message.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleBackToHome}
            className="flex-1 bg-[#312CA3] hover:bg-[#413DB3] text-white/90 font-semibold py-3 rounded-xl"
          >
            Start New Session
          </Button>
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="flex-1 bg-[#080722] border-white/10 text-white/90 hover:bg-[#121035] font-semibold py-3 rounded-xl"
          >
            Back to Summary
          </Button>
        </div>
      </div>
    </div>
  );
} 