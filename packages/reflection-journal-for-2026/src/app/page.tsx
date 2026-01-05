'use client';

import { useEffect, useState } from 'react';

type Reflection = {
  id: string;
  promptId: number;
  text: string;
  timestamp: number;
  date: string;
};

type DailyProgress = {
  [date: string]: number;
};

type Mode = 'home' | 'journey' | 'explore' | 'reflections';

const prompts = [
  { id: 1, category: 'What You Love', question: 'What activities make you lose track of time?', color: 'from-rose-500 to-pink-500' },
  { id: 2, category: 'What You Love', question: 'What brings you genuine joy, even on difficult days?', color: 'from-rose-500 to-pink-500' },
  { id: 3, category: 'What You Love', question: 'If money were no object, how would you spend your days?', color: 'from-rose-500 to-pink-500' },
  { id: 4, category: 'What You\'re Good At', question: 'What do people often ask for your help with?', color: 'from-purple-500 to-indigo-500' },
  { id: 5, category: 'What You\'re Good At', question: 'What skills come naturally to you that others find challenging?', color: 'from-purple-500 to-indigo-500' },
  { id: 6, category: 'What You\'re Good At', question: 'What accomplishment are you most proud of?', color: 'from-purple-500 to-indigo-500' },
  { id: 7, category: 'What the World Needs', question: 'What problems in the world deeply concern you?', color: 'from-blue-500 to-cyan-500' },
  { id: 8, category: 'What the World Needs', question: 'How do you want to make a difference in others\' lives?', color: 'from-blue-500 to-cyan-500' },
  { id: 9, category: 'What the World Needs', question: 'What change would you like to see in your community?', color: 'from-blue-500 to-cyan-500' },
  { id: 10, category: 'What You Can Be Paid For', question: 'What value do you provide that people would pay for?', color: 'from-emerald-500 to-teal-500' },
  { id: 11, category: 'What You Can Be Paid For', question: 'What professional skills have you developed over time?', color: 'from-emerald-500 to-teal-500' },
  { id: 12, category: 'What You Can Be Paid For', question: 'What unique combination of skills do you offer?', color: 'from-emerald-500 to-teal-500' },
];

export default function IkigaiJournal() {
  const [mode, setMode] = useState<Mode>('home');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [unlockedPrompts, setUnlockedPrompts] = useState(1);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({});
  const [todayPromptIndex, setTodayPromptIndex] = useState(0);
  const [hasReflectedToday, setHasReflectedToday] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ikigai-reflections');
    const savedUnlocked = localStorage.getItem('ikigai-unlocked');
    const savedDaily = localStorage.getItem('ikigai-daily-progress');
    
    if (saved) {
      setReflections(JSON.parse(saved));
    }
    if (savedUnlocked) {
      setUnlockedPrompts(parseInt(savedUnlocked));
    }
    if (savedDaily) {
      setDailyProgress(JSON.parse(savedDaily));
    }
    
    const today = new Date().toISOString().split('T')[0];
    const progress = savedDaily ? JSON.parse(savedDaily) : {};
    
    if (progress[today] !== undefined) {
      setTodayPromptIndex(progress[today]);
      setHasReflectedToday(true);
    } else {
      const lastCompletedDay = Object.keys(progress).length;
      setTodayPromptIndex(lastCompletedDay % prompts.length);
      setHasReflectedToday(false);
    }
  }, []);

  const saveReflection = () => {
    if (!reflectionText.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newReflection: Reflection = {
      id: Date.now().toString(),
      promptId: prompts[currentPromptIndex].id,
      text: reflectionText,
      timestamp: Date.now(),
      date: today,
    };
    
    const updated = [...reflections, newReflection];
    setReflections(updated);
    localStorage.setItem('ikigai-reflections', JSON.stringify(updated));
    
    if (mode === 'journey') {
      const updatedProgress = { ...dailyProgress, [today]: currentPromptIndex };
      setDailyProgress(updatedProgress);
      localStorage.setItem('ikigai-daily-progress', JSON.stringify(updatedProgress));
      setHasReflectedToday(true);
      
      if (currentPromptIndex + 1 === unlockedPrompts && unlockedPrompts < prompts.length) {
        const newUnlocked = unlockedPrompts + 1;
        setUnlockedPrompts(newUnlocked);
        localStorage.setItem('ikigai-unlocked', newUnlocked.toString());
      }
    }
    
    setReflectionText('');
    setIsFlipped(false);
    
    if (mode === 'explore' && currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const nextCard = () => {
    const maxIndex = mode === 'journey' ? unlockedPrompts - 1 : prompts.length - 1;
    if (currentPromptIndex < maxIndex) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setIsFlipped(false);
      setReflectionText('');
    }
  };

  const prevCard = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
      setIsFlipped(false);
      setReflectionText('');
    }
  };

  const currentPrompt = prompts[currentPromptIndex];

  if (mode === 'home') {
    const today = new Date().toISOString().split('T')[0];
    const totalDays = Object.keys(dailyProgress).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 tracking-tight">
              My Little Ikigai Journal
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              A guided journey to discover your purpose through reflection
            </p>
            {totalDays > 0 && (
              <p className="text-lg text-purple-600 font-semibold">
                🌟 {totalDays} day{totalDays !== 1 ? 's' : ''} of reflection
              </p>
            )}
          </div>
          
          <div className="grid gap-4 max-w-md mx-auto pt-8">
            <button
              onClick={() => {
                setMode('journey');
                setCurrentPromptIndex(todayPromptIndex);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all hover:scale-105 relative"
            >
              🌱 {hasReflectedToday ? "Today's Reflection ✓" : "Start Today's Reflection"}
              {hasReflectedToday && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setMode('explore')}
              className="bg-white text-gray-800 px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-200 hover:shadow-xl transition-all hover:scale-105"
            >
              🎨 Free Exploration
            </button>
            <button
              onClick={() => setMode('reflections')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              📖 My Reflections ({reflections.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'reflections') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">My Reflections</h2>
            <button
              onClick={() => setMode('home')}
              className="px-6 py-2 bg-white rounded-xl text-gray-700 font-medium hover:shadow-lg transition-all"
            >
              ← Home
            </button>
          </div>
          
          {reflections.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No reflections yet. Start your journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.map((reflection) => {
                const prompt = prompts.find(p => p.id === reflection.promptId);
                return (
                  <div key={reflection.id} className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-full bg-gradient-to-b ${prompt?.color} rounded-full`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 mb-2">{prompt?.category}</p>
                        <p className="text-lg font-medium text-gray-800 mb-3">{prompt?.question}</p>
                        <p className="text-gray-700 leading-relaxed">{reflection.text}</p>
                        <p className="text-sm text-gray-400 mt-3">
                          {new Date(reflection.timestamp).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayReflection = reflections.find(r => r.date === today && r.promptId === prompts[currentPromptIndex].id);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setMode('home')}
            className="px-6 py-2 bg-white rounded-xl text-gray-700 font-medium hover:shadow-lg transition-all"
          >
            ← Home
          </button>
          <div className="text-sm font-medium text-gray-600">
            {mode === 'journey' ? (
              <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            ) : (
              <span>Card {currentPromptIndex + 1} of {prompts.length}</span>
            )}
          </div>
        </div>
        
        {mode === 'journey' && todayReflection && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-800 font-semibold">✓ You've completed today's reflection!</p>
            <p className="text-green-600 text-sm mt-1">Come back tomorrow for a new prompt</p>
          </div>
        )}

        <div className="perspective-1000">
          <div
            className={`relative w-full h-[500px] transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front of card - Prompt */}
            <div className="absolute inset-0 backface-hidden">
              <div className={`h-full bg-gradient-to-br ${currentPrompt.color} rounded-3xl shadow-2xl p-8 flex flex-col justify-between text-white`}>
                <div>
                  <p className="text-sm font-semibold opacity-90 mb-4">{currentPrompt.category}</p>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">{currentPrompt.question}</h2>
                </div>
                
                <button
                  onClick={() => setIsFlipped(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-8 py-4 rounded-2xl font-semibold transition-all"
                >
                  Reflect on this →
                </button>
              </div>
            </div>

            {/* Back of card - Reflection input */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <div className="h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col">
                <p className="text-sm font-semibold text-gray-500 mb-2">{currentPrompt.category}</p>
                <p className="text-lg font-medium text-gray-800 mb-4">{currentPrompt.question}</p>
                
                {todayReflection ? (
                  <div className="flex-1 w-full p-4 bg-gray-50 rounded-2xl text-gray-700">
                    <p className="text-sm text-gray-500 mb-2">Your reflection:</p>
                    <p className="leading-relaxed">{todayReflection.text}</p>
                  </div>
                ) : (
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Write your reflection here..."
                    className="flex-1 w-full p-4 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-purple-400 text-gray-700"
                  />
                )}
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    ← Back
                  </button>
                  {!todayReflection && (
                    <button
                      onClick={saveReflection}
                      disabled={!reflectionText.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Reflection
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Only show in explore mode */}
        {mode === 'explore' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevCard}
              disabled={currentPromptIndex === 0}
              className="px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={nextCard}
              disabled={currentPromptIndex >= prompts.length - 1}
              className="px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



