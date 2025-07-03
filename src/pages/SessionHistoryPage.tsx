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
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4 px-6">
        <div className="text-white/70 text-lg text-center">Loading session history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4 px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-red-400 text-xl font-semibold">Error Loading History</div>
          <div className="text-white/70 text-sm leading-relaxed">{error}</div>
          <Button 
            onClick={handleGoBack} 
            className="w-full bg-[#312CA3] hover:bg-[#413DB3] py-3 text-base font-semibold rounded-xl"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#0D0D0D] pb-6">
      {/* Mobile-Optimized Container */}
      <div className="w-full max-w-lg mx-auto">
        
        {/* Header - Mobile Optimized */}
        <div className="sticky top-0 bg-[#0D0D0D] z-10 px-4 py-4 border-b border-white/5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white/90">Session History</h1>
              <Button 
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                className="bg-[#080722] border-white/10 text-white/90 hover:bg-[#121035] text-sm px-3 py-1.5"
              >
                ← Back
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 space-y-4">
          
          {/* Session Statistics - Mobile Grid */}
          {stats && (
            <div className="bg-[#080722] border border-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white/90 mb-4">Session Stats</h2>
              
              {/* Mobile-First Grid Layout */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center bg-[#0D0D0D]/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-blue-400">{stats.totalMessages}</div>
                  <div className="text-white/60 text-xs">Total Messages</div>
                </div>
                <div className="text-center bg-[#0D0D0D]/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-green-400">{stats.userMessages}</div>
                  <div className="text-white/60 text-xs">Your Messages</div>
                </div>
                <div className="text-center bg-[#0D0D0D]/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-purple-400">{stats.aiMessages}</div>
                  <div className="text-white/60 text-xs">AI Responses</div>
                </div>
                <div className="text-center bg-[#0D0D0D]/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-yellow-400">{stats.sessionDuration}</div>
                  <div className="text-white/60 text-xs">Duration</div>
                </div>
              </div>
              
              {/* Session Time Info */}
              <div className="text-center bg-[#0D0D0D]/50 rounded-xl p-3">
                <div className="text-sm font-semibold text-white/80 mb-1">
                  {new Date(stats.startTime).toLocaleDateString()}
                </div>
                <div className="text-white/60 text-xs">
                  {new Date(stats.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}

          {/* Conversation History - Mobile Optimized */}
          <div className="bg-[#080722] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 pb-2">
              <h2 className="text-lg font-semibold text-white/90">Conversation</h2>
            </div>
            
            {messages.length === 0 ? (
              <div className="text-center text-white/60 py-12 px-4">
                <div className="text-4xl mb-2">💬</div>
                <div className="text-sm">No messages found for this session.</div>
              </div>
            ) : (
              <div className="px-4 pb-4">
                {/* Dynamic Height for Mobile */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 ${
                          message.sender === 'user'
                            ? 'bg-[#312CA3] text-white rounded-br-md'
                            : 'bg-[#121035] border border-white/10 text-white/90 rounded-bl-md'
                        }`}
                      >
                        {/* Message Header - Compact for Mobile */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium opacity-80">
                            {message.sender === 'user' ? 'You' : 'Think Clear'}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Message Content */}
                        <p className="text-sm leading-relaxed mb-2">{message.text}</p>
                        
                        {/* Enhanced Mobile Audio Player */}
                        {message.audioUrl && message.sender === 'ai' && (
                          <div className="mt-3 bg-black/20 rounded-xl p-2">
                            <audio 
                              controls 
                              className="w-full h-8 rounded-lg"
                              crossOrigin="anonymous"
                              preload="metadata"
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
              </div>
            )}
          </div>

          {/* Mobile-Optimized Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleBackToHome}
              className="w-full bg-[#312CA3] hover:bg-[#413DB3] text-white font-semibold py-4 rounded-2xl text-base shadow-lg transition-all duration-200 active:scale-95"
            >
              🏠 Start New Session
            </Button>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full bg-[#080722] border-white/10 text-white/90 hover:bg-[#121035] font-semibold py-4 rounded-2xl text-base transition-all duration-200 active:scale-95"
            >
              ← Back to Summary
            </Button>
          </div>
          
          {/* Bottom Padding for Mobile */}
          <div className="h-4"></div>
          
        </div>
      </div>
    </div>
  );
} 