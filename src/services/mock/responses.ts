/**
 * Mock Responses
 * Collection of AI coaching responses with selection logic
 */

// Types
export interface MockResponse {
  text: string;
  category: ResponseCategory;
}

export type ResponseCategory = 
  | 'greeting'
  | 'anxiety'
  | 'work_stress'
  | 'motivation'
  | 'relationships'
  | 'general'
  | 'follow_up'
  | 'closing';

// Mock Responses Database
export const MOCK_RESPONSES: Record<ResponseCategory, string[]> = {
  // Opening greetings
  greeting: [
    "Hello, I'm Kuku, your AI coaching assistant. How are you feeling today?",
    "Welcome to Kuku Coach. I'm here to support you through whatever you'd like to discuss today.",
    "Hi there. I'm Kuku, your AI wellness coach. What's on your mind today?",
    "I'm Kuku, your personal coaching assistant. How can I help you today?",
    "Welcome back. I'm here to continue our conversation. How have things been since we last spoke?"
  ],
  
  // Anxiety-related responses
  anxiety: [
    "I notice you're talking about feeling anxious. Let's pause for a moment. Could you take a deep breath with me? Sometimes just slowing down our breathing can help create a bit of space from those anxious thoughts.",
    "Anxiety can be really challenging. One technique that might help is to focus on what's in your control right now, even if it's something small. What's one tiny thing within your control today?",
    "When you notice those anxious thoughts, try acknowledging them without judgment. 'I notice I'm having the thought that...' This small shift in perspective can sometimes reduce their power over you.",
    "Many people find that anxiety is connected to thoughts about the future. Would it help to bring your attention to the present moment? What can you see, hear, or feel right now?",
    "It sounds like you're experiencing quite a bit of anxiety. Sometimes writing down our worries helps externalize them. Have you tried keeping a worry journal?"
  ],
  
  // Work stress responses
  work_stress: [
    "Work pressure can be overwhelming. Have you been able to take short breaks during your day? Even five minutes to step away from your desk can help reset your mind.",
    "Managing workplace expectations is challenging. Have you tried prioritizing your tasks using the important vs. urgent matrix? It can help clarify what truly needs your attention first.",
    "It sounds like you're carrying a heavy workload. What would it look like to delegate some of these responsibilities or ask for support from colleagues?",
    "Work-related stress often comes from unclear boundaries. What's one boundary you could set that might help protect your wellbeing?",
    "When work feels overwhelming, sometimes breaking tasks into smaller steps can make them more manageable. What's one task you could break down right now?"
  ],
  
  // Motivation responses
  motivation: [
    "Finding motivation can be difficult, especially when we're feeling down. What's something small that you've accomplished recently? Even tiny wins are worth acknowledging.",
    "Sometimes lack of motivation is our mind's way of telling us we need rest. Have you been giving yourself permission to truly rest without productivity expectations?",
    "When motivation is low, connecting to your values can help. What larger purpose or meaning does this task serve in your life?",
    "It can help to make tasks more enjoyable. Could you pair this activity with something you find pleasant, like favorite music or a comfortable environment?",
    "Building momentum often starts with just five minutes of focused effort. Would you be willing to try just five minutes of the task you're avoiding and see how you feel afterward?"
  ],
  
  // Relationship responses
  relationships: [
    "Relationship challenges can be really painful. Have you been able to express your needs directly to the other person involved?",
    "It sounds like there might be a disconnect in communication. What do you think the other person might be feeling or needing in this situation?",
    "Setting healthy boundaries is important in any relationship. What would a healthy boundary look like in this situation?",
    "Conflicts often arise from unmet needs. Have you taken some time to reflect on what need of yours isn't being met in this situation?",
    "It can be helpful to use 'I' statements when discussing difficult topics, like 'I feel...' rather than 'You always...' Have you tried this approach?"
  ],
  
  // General supportive responses
  general: [
    "Thank you for sharing that with me. It takes courage to be vulnerable about these experiences.",
    "I hear how challenging this has been for you. You're showing real resilience in facing these difficulties.",
    "That sounds really difficult. How have you been taking care of yourself through this situation?",
    "I'm here to support you through this. What would feel most helpful to focus on right now?",
    "You've been dealing with a lot. What's one small thing that might bring you a moment of peace today?"
  ],
  
  // Follow-up questions
  follow_up: [
    "How did that make you feel?",
    "What do you think might be behind those feelings?",
    "Have you noticed any patterns or triggers related to this?",
    "What would an ideal outcome look like for you?",
    "What's one small step you could take toward addressing this situation?",
    "How has this affected other areas of your life?",
    "What strategies have you tried so far?",
    "What support do you have around you right now?",
    "How would you like things to be different?"
  ],
  
  // Session closing
  closing: [
    "We're coming to the end of our session. Is there anything else you'd like to discuss before we wrap up?",
    "As we finish for today, what's one small thing you can do to take care of yourself in the coming hours?",
    "Thank you for sharing with me today. What's one insight or idea you're taking away from our conversation?",
    "Before we end, let's recap what we've discussed and any action steps you're considering.",
    "I've appreciated our conversation today. Would you like to schedule another session to continue our work together?"
  ]
};

/**
 * Get a random response from a specific category
 * @param category Response category
 * @returns Random response text
 */
export function getRandomResponse(category: ResponseCategory): string {
  const responses = MOCK_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Basic keyword matching to suggest appropriate response categories
 * @param userInput User's input text
 * @returns Likely matching category
 */
export function suggestResponseCategory(userInput: string): ResponseCategory {
  const normalizedInput = userInput.toLowerCase();
  
  // Simple keyword matching
  if (/anxious|anxiety|worry|panic|fear|stress|overwhelm/i.test(normalizedInput)) {
    return 'anxiety';
  }
  
  if (/work|job|boss|colleague|career|project|deadline|meeting/i.test(normalizedInput)) {
    return 'work_stress';
  }
  
  if (/motivat|energy|tired|procrastinat|focus|distract|avoid/i.test(normalizedInput)) {
    return 'motivation';
  }
  
  if (/relation|partner|spouse|friend|family|parent|child|colleague|conflict/i.test(normalizedInput)) {
    return 'relationships';
  }
  
  // Default to general or follow-up
  return Math.random() > 0.5 ? 'general' : 'follow_up';
}

/**
 * Generate a contextual response based on user input
 * @param userInput User's input text
 * @returns Appropriate response text
 */
export function generateContextualResponse(userInput: string): string {
  // If this is the first message, return a greeting
  if (!userInput) {
    return getRandomResponse('greeting');
  }
  
  // Suggest a category based on content
  const category = suggestResponseCategory(userInput);
  
  // Get a response from the category
  return getRandomResponse(category);
} 