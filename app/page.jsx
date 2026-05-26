"use client";
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Wait for GSAP to be available
    const initAnimation = () => {
      if (typeof window.gsap === 'undefined' || typeof window.TextPlugin === 'undefined') {
        setTimeout(initAnimation, 50);
        return;
      }
      
      const gsap = window.gsap;
      const TextPlugin = window.TextPlugin;
      gsap.registerPlugin(TextPlugin);

      const phrases = [
          { phrase: 'Itadakimasu.', translation: 'I HUMBLY RECEIVE.' },
          { phrase: 'Bon Appétit.', translation: 'ENJOY YOUR MEAL.' },
          { phrase: 'Buen Provecho.', translation: 'GOOD BENEFIT.' },
          { phrase: '¡Salud!', translation: 'TO YOUR HEALTH.' },
          { phrase: 'Mangia bene.', translation: 'EAT WELL.' },
          { phrase: 'Skål!', translation: 'GOOD HEALTH.' },
          { phrase: "L'chaim!", translation: 'TO LIFE.' }
      ];

      const tapSound = new Audio('/tap.mp3');
      const selected = phrases[Math.floor(Math.random() * phrases.length)];
      document.getElementById('translationText').innerText = selected.translation;

      let hasStartedTyping = false;
      let typingFinished = false;
      let transitionQueued = false;
      let phase2Active = false;

      function startTypingSequence() {
          if (hasStartedTyping) return;
          hasStartedTyping = true;

          let tl1 = gsap.timeline({
              onComplete: () => {
                  typingFinished = true;
                  if (transitionQueued) {
                      setTimeout(transitionToLogo, 400); 
                  }
              }
          });

          tl1.to(".phrase-container", { opacity: 1, duration: 0.5 })
             .to("#typewriter", { 
                 duration: selected.phrase.length * 0.1,
                 text: selected.phrase, 
                 ease: "none",
                 onUpdate: function() {
                     let clone = tapSound.cloneNode();
                     clone.volume = 0.2;
                     clone.play().catch(e => {}); 
                 }
             })
             .to(".translation", { opacity: 1, duration: 0.8 }, "+=0.2");
      }

      const handleScrollIntent = () => {
          if (phase2Active) return;
          if (!hasStartedTyping) {
              startTypingSequence();
          } else if (!typingFinished) {
              transitionQueued = true; 
          } else {
              transitionToLogo(); 
          }
      };

      window.addEventListener('wheel', (e) => {
          if (e.deltaY > 0) handleScrollIntent();
      });

      let touchStartY = 0;
      window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
      window.addEventListener('touchmove', e => {
          let touchEndY = e.touches[0].clientY;
          if (touchStartY - touchEndY > 30) handleScrollIntent();
      });

      function transitionToLogo() {
          if (phase2Active) return;
          phase2Active = true;

          let tl2 = gsap.timeline();
          tl2.to(".phrase-container", { opacity: 0, duration: 0.5 })
             .set(".logo-container", { visibility: "visible" })
             .to(".logo-container", { opacity: 1, duration: 1.0, ease: "power2.out" });
      }

      const canvas = document.getElementById('bokeh-canvas');
      const ctx = canvas.getContext('2d');
      
      let width, height;
      const lights = [];
      const colors = [
          'rgba(255, 59, 48, 0.5)', 
          'rgba(255, 204, 0, 0.4)', 
          'rgba(255, 255, 255, 0.2)', 
          'rgba(0, 122, 255, 0.2)'
      ];

      function resize() {
          width = window.innerWidth;
          height = window.innerHeight;
          canvas.width = width;
          canvas.height = height;
      }
      window.addEventListener('resize', resize);
      resize();

      for (let i = 0; i < 25; i++) {
          lights.push({
              xOffset: Math.random(),
              yOffset: Math.random(),
              radius: Math.random() * 60 + 20,
              speed: Math.random() * 0.5 + 0.1,
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }

      let time = 0;
      function animateBokeh() {
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, width, height);

          time += 0.002;

          lights.forEach(light => {
              let x = (light.xOffset * width) - (time * width * light.speed);
              let y = (light.yOffset * height) + (Math.sin(time * Math.PI * 2 + light.speed) * 30);

              x = x % width;
              if (x < 0) x += width;

              ctx.beginPath();
              ctx.arc(x, y, light.radius, 0, Math.PI * 2);
              ctx.fillStyle = light.color;
              ctx.shadowBlur = 30;
              ctx.shadowColor = light.color;
              ctx.fill();
          });

          requestAnimationFrame(animateBokeh);
      }

      animateBokeh();
    };

    initAnimation();
  }, []);

  return (
    <>
      <canvas id="bokeh-canvas"></canvas>
      <div className="glass-overlay"></div>

      <div className="phrase-container">
          <h1 className="typing-text"><span id="typewriter"></span><span className="cursor">|</span></h1>
          <div className="translation" id="translationText"></div>
      </div>

      <div className="logo-container">
          <h1 className="logo-title">NYC EATS</h1>
          <p className="logo-subtitle">GOURMET PASSPORTS</p>
          <a href="https://apps.apple.com/in/app/nyc-eats-gourmet-passports/id6761528193" target="_blank" rel="noopener noreferrer">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="app-store-btn" />
          </a>
      </div>

      <div className="footer">
          <span>© 2026 Barbell Apps</span>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms of Service</a>
          <a href="mailto:concierge@gourmetpassports.com">Contact Me</a>
      </div>
    </>
  );
}
