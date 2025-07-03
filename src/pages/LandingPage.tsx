import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { startSession } = useSession();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      
      // Use the session context to start a new session
      const newSessionId = await startSession();
      
      // Navigate directly to the session page with the session ID
      navigate(`/session/${newSessionId}`);
    } catch (error) {
      console.error("Failed to start session:", error);
      // In a real implementation, we would display an error toast/message
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleStartSession();
    }
  };

  const renderProgressDots = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-8">
        {[1, 2, 3].map((dotStep) => (
          <div
            key={dotStep}
            className={`w-3 h-3 rounded-full transition-colors ${
              dotStep === step ? "bg-indigo-600" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Hello thinker
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              I'm really glad you are here.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              Thanks not just for your time, but also for your <span className="text-white font-semibold">TRUST</span>. That means a lot.
            </p>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">
              Who you will meet here?
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Kuku, an AI thinking buddy who talk things through with you by <span className="text-indigo-400 font-semibold">ASKing</span> you questions, 
              to assist you reflect, aware, and change, just like a human coach will do.
            </p>
            
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold text-white">
                What you will <em className="text-red-400">NOT</em> get here?
              </h2>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  Another AI to give you spoon feed answer
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  A magic, one-click cure
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  A cheer-bot that agrees with everything you say
                </li>
              </ul>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">
              Sounds Good? Lets get ready!
            </h1>
            
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold text-white">
                All you need is
              </h2>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  A tough decision, big goal, stubborn challenge or just a topic you really wanna to explore
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  20-30 minutes undisturbed time to be with yourself
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  A open mind to dive in to discovery mode.
                </li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {renderProgressDots()}
        
        <div className="min-h-[400px] flex flex-col justify-center">
          {renderStepContent()}
        </div>
        
        <div className="pt-8">
          <Button 
            onClick={handleNext}
            size="lg" 
            className="w-full py-6 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-xl"
            disabled={isLoading}
          >
            {step === 3 ? (isLoading ? "Starting..." : "Let's go") : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}