import React, { useState } from 'react';
import './TasteProfiler.css';

const QUIZ_QUESTIONS = [
  {
    id: 'flavor',
    question: 'Select your preferred flavor profile:',
    options: [
      { text: 'Rich & Decadent', val: 'chocolate', desc: 'Deep cocoa, fudge, and bold taste notes.' },
      { text: 'Light & Delicate', val: 'vanilla', desc: 'Vanilla beans, light cream, and sweet fruit notes.' },
      { text: 'Earthy & Modern', val: 'matcha', desc: 'Finely ground green tea, herbal freshness.' },
      { text: 'Smooth & Elegant', val: 'velvet', desc: 'Classic buttermilk tang with luxury crumbs.' }
    ]
  },
  {
    id: 'vibe',
    question: 'What is the scale of your celebration?',
    options: [
      { text: 'A Grand Soirée', val: 'large', desc: 'Formal atmosphere with many guests.' },
      { text: 'Intimate Gathering', val: 'small', desc: 'Cozy, rustic setting with close friends.' }
    ]
  },
  {
    id: 'style',
    question: 'Choose your desired visual aesthetic:',
    options: [
      { text: 'Clean & Modern', val: 'piped', desc: 'Smooth piping, precise outlines, minimalist charm.' },
      { text: 'Rustic & Textured', val: 'textured', desc: 'Textured buttercream layers, natural, organic.' },
      { text: 'Chic & Exposed', val: 'naked', desc: 'Naked coating, revealing the sponge layers.' }
    ]
  }
];

const MATCHES = {
  chocolate: {
    name: 'The Royal Chocolate Ganache',
    flavor: 'Chocolate Fudge',
    desc: 'A dark chocolate dream with rich layers of cocoa fudge, enveloped in glossy ganache. Best suited for grand indulgence.',
    image: '/chocolate_cake.png'
  },
  vanilla: {
    name: 'Champagne Cream & Blossom',
    flavor: 'Vanilla Bean',
    desc: 'Luxurious vanilla bean layers filled with champagne-infused cream and raspberry compote. A classic choice for wedding receptions.',
    image: '/wedding_cake.png'
  },
  matcha: {
    name: 'Zen Forest Crepe',
    flavor: 'Pistachio Matcha',
    desc: 'Delicate layers of Uji matcha crepes stacked high with whipped pistachio cream. Elegant, modern, and perfectly balanced.',
    image: '/matcha_cake.png'
  },
  velvet: {
    name: 'Classic Velvet Crimson',
    flavor: 'Red Velvet',
    desc: 'Deep crimson cocoa sponge layered with fluffy cream cheese piping. The ultimate timeless luxury statement.',
    image: '/red_velvet.png'
  }
};

export default function TasteProfiler({ onLoadInDesigner, onAddToInquiry }) {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2, 3 (loading), 4 (result)
  const [answers, setAnswers] = useState({});
  const [resultMatch, setResultMatch] = useState(null);

  const handleSelectOption = (questionId, optionVal) => {
    const updatedAnswers = { ...answers, [questionId]: optionVal };
    setAnswers(updatedAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step: trigger mixing animation
      setCurrentStep(QUIZ_QUESTIONS.length); // step 3: loading/mixing
      
      // Calculate match
      const matchedCakeKey = updatedAnswers.flavor; // base match on flavor selection
      const matchedCake = MATCHES[matchedCakeKey] || MATCHES.vanilla;

      setTimeout(() => {
        setResultMatch({
          ...matchedCake,
          tiers: updatedAnswers.vibe === 'large' ? 2 : 1,
          shape: 'round',
          icingStyle: updatedAnswers.style,
          toppings: matchedCakeKey === 'chocolate' ? ['berries'] : ['flowers']
        });
        setCurrentStep(QUIZ_QUESTIONS.length + 1); // step 4: result
      }, 2500);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setResultMatch(null);
    setCurrentStep(0);
  };

  return (
    <section className="quiz-section section-padding" id="quiz">
      <div className="container quiz-container glass-card">
        {/* Step progress bar */}
        {currentStep < QUIZ_QUESTIONS.length && (
          <div className="quiz-progress-bar">
            {QUIZ_QUESTIONS.map((_, idx) => (
              <div 
                key={idx} 
                className={`progress-step-node ${currentStep >= idx ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        )}

        {/* Quiz Questions */}
        {currentStep < QUIZ_QUESTIONS.length && (
          <div className="quiz-question-view animate-fade">
            <span className="quiz-step-count">Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
            <h3 className="quiz-question-title">{QUIZ_QUESTIONS[currentStep].question}</h3>
            <div className="quiz-options-list">
              {QUIZ_QUESTIONS[currentStep].options.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="quiz-option-button glass-card"
                  onClick={() => handleSelectOption(QUIZ_QUESTIONS[currentStep].id, opt.val)}
                >
                  <span className="option-btn-title">{opt.text}</span>
                  <span className="option-btn-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Baking/Mixing Loading Screen */}
        {currentStep === QUIZ_QUESTIONS.length && (
          <div className="quiz-loading-view flex-center">
            <div className="baking-bowl-wrapper">
              <svg className="bowl-svg" viewBox="0 0 100 100" width="80" height="80">
                <path d="M10,40 C10,75 90,75 90,40 Z" fill="none" stroke="#c5a059" strokeWidth="3" />
                <path d="M5,40 L95,40" stroke="#c5a059" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="20" x2="50" y2="35" stroke="#2a0b15" strokeWidth="4" strokeLinecap="round" className="beater-pin" />
              </svg>
              <div className="whisk-loader"></div>
            </div>
            <h3 className="loading-vibe-text">Whisking your flavor profile...</h3>
            <p className="loading-sub-text">Aligning textures, colors, and toppings to match your style.</p>
          </div>
        )}

        {/* Final Result Match Reveal */}
        {currentStep === QUIZ_QUESTIONS.length + 1 && resultMatch && (
          <div className="quiz-result-view animate-fade">
            <div className="result-grid">
              <div className="result-image-panel">
                <img src={resultMatch.image} alt={resultMatch.name} className="result-cake-img" />
                <div className="result-gold-glow"></div>
              </div>
              <div className="result-info-panel">
                <span className="result-tag">Your Perfect Match</span>
                <h3 className="result-cake-title">{resultMatch.name}</h3>
                <p className="result-cake-desc">{resultMatch.desc}</p>
                
                <div className="result-details-box">
                  <div className="res-detail-item">
                    <span className="res-label">Base Flavor</span>
                    <span className="res-val">{resultMatch.flavor}</span>
                  </div>
                  <div className="res-detail-item">
                    <span className="res-label">Structure</span>
                    <span className="res-val">{resultMatch.tiers} Tier ({resultMatch.icingStyle} Icing)</span>
                  </div>
                </div>

                <div className="result-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => onLoadInDesigner({
                      flavor: resultMatch.flavor,
                      tiers: resultMatch.tiers,
                      shape: resultMatch.shape,
                      toppings: resultMatch.toppings,
                      text: 'Bespoke Match'
                    })}
                  >
                    Load in Designer
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      onAddToInquiry({
                        id: `quiz-${Date.now()}`,
                        name: resultMatch.name,
                        type: 'Quiz Match',
                        price: resultMatch.tiers === 2 ? '$115' : '$75',
                        details: `Quiz Matched Design | Flavor: ${resultMatch.flavor} | Tiers: ${resultMatch.tiers}`,
                        image: resultMatch.image
                      });
                    }}
                  >
                    Reserve This Slice
                  </button>
                </div>
                
                <button className="restart-quiz-btn" onClick={handleRestart}>
                  ✦ Retake the Taste Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
