import React, { useEffect, useMemo } from 'react';
import { href, Link } from 'react-router';

// Pour faire fonctionner ce composant, vous devez l'importer et le rendre
// dans votre application principale, par exemple dans App.js :
// import OnboardingPage from './OnboardingPage';
// function App() {
//   return <OnboardingPage />;
// }

const OnboardingPage = () => {
  // --- CSS ---
  // Le CSS est placé dans une chaîne de caractères pour être injecté via une balise <style>.
  const styles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        background: #0a0a0a;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-height: 100vh;
        overflow-x: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .background-glow {
        position: fixed;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.3;
        pointer-events: none;
        animation: float 20s ease-in-out infinite;
    }
    
    .glow-1 {
        background: #667eea;
        top: -250px;
        left: -250px;
    }
    
    .glow-2 {
        background: #ec4899;
        bottom: -250px;
        right: -250px;
        animation-delay: 10s;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(50px, 30px);
        }
    }
    
    .particles {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
    }
    
    .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        opacity: 0;
        animation: particleFloat 15s infinite;
    }
    
    @keyframes particleFloat {
        0% {
            opacity: 0;
            transform: translateY(100vh) translateX(0);
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) translateX(100px);
        }
    }
    
    .onboarding-container {
        max-width: 900px;
        width: 90%;
        padding: 60px 40px;
        position: relative;
        z-index: 10;
        opacity: 0;
        animation: fadeInUp 1s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .header-section {
        text-align: center;
        margin-bottom: 60px;
    }
    
    .welcome-text {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 20px;
        letter-spacing: 1px;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 0.3s forwards;
    }
    
    .main-title {
        font-size: 56px;
        font-weight: 200;
        line-height: 1.2;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0;
        animation: fadeInScale 1s ease-out 0.5s forwards;
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .subtitle {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 300;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 0.7s forwards;
    }
    
    .journey-section {
        margin-bottom: 60px;
    }
    
    .journey-title {
        font-size: 24px;
        font-weight: 300;
        text-align: center;
        margin-bottom: 40px;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 1s forwards;
    }
    
    .steps-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
    }
    
    .step-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        backdrop-filter: blur(10px);
        opacity: 0;
        animation: fadeInUp 0.8s ease-out forwards;
        transition: all 0.3s ease;
    }
    
    .step-card:nth-child(1) { animation-delay: 1.2s; }
    .step-card:nth-child(2) { animation-delay: 1.4s; }
    .step-card:nth-child(3) { animation-delay: 1.6s; }
    
    .step-card:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
    }
    
    .step-icon {
        font-size: 48px;
        margin-bottom: 20px;
        display: inline-block;
        animation: pulse 3s ease-in-out infinite;
    }
    
    .step-card:nth-child(1) .step-icon { animation-delay: 0s; }
    .step-card:nth-child(2) .step-icon { animation-delay: 1s; }
    .step-card:nth-child(3) .step-icon { animation-delay: 2s; }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
    
    .step-title {
        font-size: 20px;
        font-weight: 400;
        margin-bottom: 10px;
        color: #ffffff;
    }
    
    .step-description {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
    }
    
    .demo-section {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 30px;
        padding: 40px;
        margin-bottom: 50px;
        text-align: center;
        backdrop-filter: blur(10px);
        opacity: 0;
        animation: fadeIn 0.8s ease-out 2s forwards;
    }
    
    .demo-title {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 30px;
    }
    
    .voice-demo {
        position: relative;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }
    
    .waveform-demo {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 100px;
    }
    
    .wave-bar {
        width: 4px;
        background: linear-gradient(to top, #667eea, #ec4899);
        border-radius: 2px;
        opacity: 0;
        animation: waveAnimation 1.5s ease-in-out infinite;
    }
    
    .wave-bar:nth-child(1) { height: 30px; animation-delay: 0s; }
    .wave-bar:nth-child(2) { height: 50px; animation-delay: 0.1s; }
    .wave-bar:nth-child(3) { height: 40px; animation-delay: 0.2s; }
    .wave-bar:nth-child(4) { height: 60px; animation-delay: 0.3s; }
    .wave-bar:nth-child(5) { height: 45px; animation-delay: 0.4s; }
    .wave-bar:nth-child(6) { height: 70px; animation-delay: 0.5s; }
    .wave-bar:nth-child(7) { height: 55px; animation-delay: 0.6s; }
    .wave-bar:nth-child(8) { height: 65px; animation-delay: 0.7s; }
    .wave-bar:nth-child(9) { height: 50px; animation-delay: 0.8s; }
    .wave-bar:nth-child(10) { height: 40px; animation-delay: 0.9s; }
    .wave-bar:nth-child(11) { height: 35px; animation-delay: 1s; }
    .wave-bar:nth-child(12) { height: 30px; animation-delay: 1.1s; }
    
    @keyframes waveAnimation {
        0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
        }
        50% {
            transform: scaleY(1);
            opacity: 1;
        }
    }
    
    .demo-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .tips-section {
        margin-bottom: 50px;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 2.5s forwards;
    }
    
    .tips-title {
        font-size: 20px;
        text-align: center;
        margin-bottom: 30px;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .tips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .tip {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
        background: rgba(102, 126, 234, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(102, 126, 234, 0.2);
    }
    
    .tip-icon {
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .tip-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
    }
    
    .cta-section {
        text-align: center;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 3s forwards;
    }
    
    .cta-button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
        color: white;
        padding: 20px 40px;
        border-radius: 50px;
        font-size: 18px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
    
    .cta-icon {
        font-size: 24px;
        animation: moveRight 1.5s ease-in-out infinite;
    }
    
    @keyframes moveRight {
        0%, 100% {
            transform: translateX(0);
        }
        50% {
            transform: translateX(5px);
        }
    }
    
    .progress-section {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 20;
    }
    
    .progress-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
    }
    
    .progress-dot.active {
        background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
        transform: scale(1.2);
    }
    
    .progress-dot.completed {
        background: rgba(255, 255, 255, 0.5);
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .onboarding-container {
            padding: 40px 20px;
        }
        
        .main-title {
            font-size: 36px;
        }
        
        .steps-container {
            grid-template-columns: 1fr;
        }
        
        .tips-grid {
            grid-template-columns: 1fr;
        }
    }
  `;

  // --- LOGIC ---
  // Remplacer la création impérative des particules par une approche déclarative.
  // useMemo garantit que le tableau n'est calculé qu'une seule fois.
  const particles = useMemo(() => {
    const particleCount = 30;
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${15 + Math.random() * 10}s`,
      },
    }));
  }, []);

  // Gérer les effets de bord (comme les écouteurs d'événements) avec useEffect
  useEffect(() => {
    // Le code original ajoutait un effet de survol via JS.
    // Cet effet peut être répliqué ici si nécessaire, bien que le CSS gère déjà
    // le `transform` et `border-color` au survol. Le JS changeait la couleur de fond.
    const stepCards = document.querySelectorAll('.step-card');
    const handleMouseEnter = (e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    };
    const handleMouseLeave = (e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
    };

    stepCards.forEach((card) => {
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    // Nettoyage : supprimer les écouteurs lorsque le composant est démonté
    return () => {
      stepCards.forEach((card) => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []); // Le tableau de dépendances vide signifie que cet effet ne s'exécute qu'une fois.

  // Gérer le clic sur le bouton CTA
  const handleCtaClick = (e) => {
    e.preventDefault();
    // Dans une vraie application, cela déclencherait une navigation ou une autre action.
    console.log('Navigating to voice capture...');
  };

  // --- JSX ---
  // Rendre le HTML converti en JSX
  return (
    <>
      <style>{styles}</style>

      {/* Background Effects */}
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>

      {/* Particles (rendu déclaratif) */}
      <div className="particles">
        {particles.map((p) => (
          <div key={p.id} className="particle" style={p.style}></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="onboarding-container">
        {/* Header */}
        <div className="header-section">
          <p className="welcome-text">Welcome to a new way of connecting</p>
          <h1 className="main-title">Your Voice Tells Your Story</h1>
          <p className="subtitle">
            Let's prepare for your 3-minute journey to authentic connection
          </p>
        </div>

        {/* Journey Steps */}
        <div className="journey-section">
          <h2 className="journey-title">How This Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon">🎙️</div>
              <h3 className="step-title">Speak Freely</h3>
              <p className="step-description">
                Talk for 3 minutes about what matters to you. No scripts, no
                pressure - just be yourself.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">✨</div>
              <h3 className="step-title">AI Understands</h3>
              <p className="step-description">
                Our AI analyzes not just what you say, but how you say it - your
                rhythm, energy, and authentic self.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">🌟</div>
              <h3 className="step-title">Find Your Match</h3>
              <p className="step-description">
                Your AI agent mingles with others 24/7, finding deep
                compatibility beyond the surface.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Demo */}
        <div className="demo-section">
          <h3 className="demo-title">Your voice creates a unique pattern</h3>
          <div className="voice-demo">
            <div className="waveform-demo">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="wave-bar"></div>
              ))}
            </div>
          </div>
          <p className="demo-text">Every voice is unique, just like you</p>
        </div>

        {/* Tips */}
        <div className="tips-section">
          <h3 className="tips-title">Quick Tips for Your Recording</h3>
          <div className="tips-grid">
            <div className="tip">
              <span className="tip-icon">🏠</span>
              <p className="tip-text">
                Find a quiet, comfortable space where you can speak naturally
              </p>
            </div>
            <div className="tip">
              <span className="tip-icon">💭</span>
              <p className="tip-text">
                Think about your perfect weekend, passions, or what makes you
                laugh
              </p>
            </div>
            <div className="tip">
              <span className="tip-icon">❤️</span>
              <p className="tip-text">
                Be authentic - pauses, laughs, and "ums" make you human
              </p>
            </div>
            <div className="tip">
              <span className="tip-icon">🎯</span>
              <p className="tip-text">
                There's no wrong answer - your truth is what we're looking for
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <Link
            to={href('/profile-capture/conversation')}
            className="cta-button"
          >
            <span>I'm Ready to Share My Voice</span>
            <span className="cta-icon">→</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default OnboardingPage;
