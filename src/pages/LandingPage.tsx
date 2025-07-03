import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { useSequentialTypewriter, useSequentialWordTypewriter } from "@/hooks/useTypewriter";

export default function LandingPage() {
  const navigate = useNavigate();
  const { startSession } = useSession();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showNextButton, setShowNextButton] = React.useState(false);

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
      setShowNextButton(false); // Reset button for next step
    } else {
      handleStartSession();
    }
  };

  // Reset button visibility and add transition delay when step changes
  React.useEffect(() => {
    setShowNextButton(false);
    
    // Add a small delay when transitioning to allow previous animations to clean up
    if (step > 1) {
      const timeoutId = setTimeout(() => {
        // This ensures the previous step's animation is fully cleaned up
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [step]);

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

  // Define text content for each step
  const step1Texts = [
    "Hello thinker",
    "I'm really glad you are here.",
    "Thanks not just for your time, but also for your TRUST. That means a lot."
  ];

  const step2Texts = [
    "Who you will meet here?",
    "Think Clear, an AI thinking buddy who talk things through with you by ASKing you questions, to assist you reflect, aware, and change, just like a human coach will do.",
    "What you will NOT get here?",
    "Another AI to give you spoon feed answer",
    "A magic, one-click cure", 
    "A cheer-bot that agrees with everything you say"
  ];

  const step3Texts = [
    "Sounds Good? Lets get ready!",
    "All you need is",
    "A tough decision, big goal, stubborn challenge or just a topic you really wanna to explore",
    "20-30 minutes undisturbed time to be with yourself",
    "A open mind to dive in to discovery mode."
  ];

  // Create separate animation instances for each step
  const step1Animation = useSequentialTypewriter({
    texts: step === 1 ? step1Texts : [],
    speed: 40,
    delayBetween: 800,
    initialDelay: 500,
    onAllComplete: () => {
      if (step === 1) setShowNextButton(true);
    }
  });

  const step2Animation = useSequentialWordTypewriter({
    texts: step === 2 ? step2Texts : [],
    speed: 200, // milliseconds per word (faster than character speed)
    delayBetween: 600,
    initialDelay: 300,
    onAllComplete: () => {
      if (step === 2) setShowNextButton(true);
    }
  });

  const step3Animation = useSequentialTypewriter({
    texts: step === 3 ? step3Texts : [],
    speed: 35,
    delayBetween: 500,
    initialDelay: 300,
    onAllComplete: () => {
      if (step === 3) setShowNextButton(true);
    }
  });

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            
            {/* Fixed position for title */}
            <div className="min-h-[60px] flex items-center justify-center">
              {step1Animation.displayedTexts[0] && (
                <h1 className="text-3xl font-bold text-white">
                  {step1Animation.displayedTexts[0]}
                  {step1Animation.currentStep === 0 && !step1Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </h1>
              )}
            </div>
            
            {/* Fixed position for first paragraph */}
            <div className="min-h-[40px] flex items-center justify-center">
              {step1Animation.displayedTexts[1] && (
                <p className="text-xl text-gray-300 leading-relaxed">
                  {step1Animation.displayedTexts[1]}
                  {step1Animation.currentStep === 1 && !step1Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>
              )}
            </div>
            
            {/* Fixed position for second paragraph */}
            <div className="min-h-[60px] flex items-center justify-center">
              {step1Animation.displayedTexts[2] && (
                <p className="text-xl text-gray-300 leading-relaxed">
                  {step1Animation.displayedTexts[2].includes("TRUST") ? (
                    <>
                      Thanks not just for your time, but also for your{" "}
                      <span className="text-white font-semibold">TRUST</span>. That means a lot.
                    </>
                  ) : (
                    step1Animation.displayedTexts[2]
                  )}
                  {step1Animation.currentStep === 2 && !step1Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center space-y-6">
            {/* Fixed position for title */}
            <div className="min-h-[60px] flex items-center justify-center">
              {step2Animation.displayedTexts[0] && (
                <h1 className="text-3xl font-bold text-white">
                  {step2Animation.displayedTexts[0]}
                  {step2Animation.currentStep === 0 && !step2Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </h1>
              )}
            </div>
            
            {/* Fixed position for description */}
            <div className="min-h-[100px] flex items-center justify-center">
              {step2Animation.displayedTexts[1] && (
                <p className="text-lg text-gray-300 leading-relaxed">
                  {step2Animation.displayedTexts[1].includes("ASKing") ? (
                    <>
                      Think Clear, an AI thinking buddy who talk things through with you by{" "}
                      <span className="text-indigo-400 font-semibold">ASKing</span> you questions, 
                      to assist you reflect, aware, and change, just like a human coach will do.
                    </>
                  ) : (
                    step2Animation.displayedTexts[1]
                  )}
                  {step2Animation.currentStep === 1 && !step2Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>
              )}
            </div>
            
            <div className="text-left space-y-4">
              {/* Fixed position for NOT section title */}
              <div className="min-h-[40px] flex items-center">
                {step2Animation.displayedTexts[2] && (
                  <h2 className="text-xl font-semibold text-white">
                    What you will <em className="text-red-400">NOT</em> get here?
                    {step2Animation.currentStep === 2 && !step2Animation.isComplete && (
                      <span className="animate-pulse">|</span>
                    )}
                  </h2>
                )}
              </div>
              
              {/* Fixed positions for bullet points */}
              <ul className="text-gray-300 space-y-3">
                <div className="min-h-[32px] flex items-start">
                  {step2Animation.displayedTexts[3] && (
                    <li className="flex items-start w-full">
                      <span className="text-red-400 mr-2">•</span>
                      <span>
                        {step2Animation.displayedTexts[3]}
                        {step2Animation.currentStep === 3 && !step2Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
                
                <div className="min-h-[32px] flex items-start">
                  {step2Animation.displayedTexts[4] && (
                    <li className="flex items-start w-full">
                      <span className="text-red-400 mr-2">•</span>
                      <span>
                        {step2Animation.displayedTexts[4]}
                        {step2Animation.currentStep === 4 && !step2Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
                
                <div className="min-h-[32px] flex items-start">
                  {step2Animation.displayedTexts[5] && (
                    <li className="flex items-start w-full">
                      <span className="text-red-400 mr-2">•</span>
                      <span>
                        {step2Animation.displayedTexts[5]}
                        {step2Animation.currentStep === 5 && !step2Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
              </ul>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center space-y-6">
            {/* Fixed position for title */}
            <div className="min-h-[60px] flex items-center justify-center">
              {step3Animation.displayedTexts[0] && (
                <h1 className="text-3xl font-bold text-white">
                  {step3Animation.displayedTexts[0]}
                  {step3Animation.currentStep === 0 && !step3Animation.isComplete && (
                    <span className="animate-pulse">|</span>
                  )}
                </h1>
              )}
            </div>
            
            <div className="text-left space-y-4">
              {/* Fixed position for subtitle */}
              <div className="min-h-[40px] flex items-center">
                {step3Animation.displayedTexts[1] && (
                  <h2 className="text-xl font-semibold text-white">
                    {step3Animation.displayedTexts[1]}
                    {step3Animation.currentStep === 1 && !step3Animation.isComplete && (
                      <span className="animate-pulse">|</span>
                    )}
                  </h2>
                )}
              </div>
              
              {/* Fixed positions for bullet points */}
              <ul className="text-gray-300 space-y-3">
                <div className="min-h-[48px] flex items-start">
                  {step3Animation.displayedTexts[2] && (
                    <li className="flex items-start w-full">
                      <span className="text-indigo-400 mr-2">•</span>
                      <span>
                        {step3Animation.displayedTexts[2]}
                        {step3Animation.currentStep === 2 && !step3Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
                
                <div className="min-h-[48px] flex items-start">
                  {step3Animation.displayedTexts[3] && (
                    <li className="flex items-start w-full">
                      <span className="text-indigo-400 mr-2">•</span>
                      <span>
                        {step3Animation.displayedTexts[3]}
                        {step3Animation.currentStep === 3 && !step3Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
                
                <div className="min-h-[48px] flex items-start">
                  {step3Animation.displayedTexts[4] && (
                    <li className="flex items-start w-full">
                      <span className="text-indigo-400 mr-2">•</span>
                      <span>
                        {step3Animation.displayedTexts[4]}
                        {step3Animation.currentStep === 4 && !step3Animation.isComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </li>
                  )}
                </div>
              </ul>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Skip animation handler - only skip the current step's animation
  const handleSkipAnimation = () => {
    switch (step) {
      case 1:
        step1Animation.skip();
        break;
      case 2:
        step2Animation.skip();
        break;
      case 3:
        step3Animation.skip();
        break;
    }
  };

  // Check if the current step's animation is running
  const isAnimating = React.useMemo(() => {
    switch (step) {
      case 1:
        return !step1Animation.isComplete;
      case 2:
        return !step2Animation.isComplete;
      case 3:
        return !step3Animation.isComplete;
      default:
        return false;
    }
  }, [step, step1Animation.isComplete, step2Animation.isComplete, step3Animation.isComplete]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* App Name Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-light text-gray-400 tracking-wide">Think Clear</h1>
        </div>

        {/* Skip Animation Button */}
        {isAnimating && (
          <div className="flex justify-end">
            <button
              onClick={handleSkipAnimation}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200"
            >
              Skip ⏵
            </button>
          </div>
        )}
        
        {renderProgressDots()}
        
        <div className="min-h-[500px] flex flex-col justify-start">
          {renderStepContent()}
        </div>
        
        <div className="pt-8">
          {showNextButton && (
            <Button 
              onClick={handleNext}
              size="lg" 
              className="w-full py-6 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-xl transition-opacity duration-300"
              disabled={isLoading}
            >
              {step === 3 ? (isLoading ? "Starting..." : "Let's go") : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}