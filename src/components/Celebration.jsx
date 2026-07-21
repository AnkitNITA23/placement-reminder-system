import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ShieldAlert, Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import successImg from '../assets/success.png';

export default function Celebration({ profile, onReset }) {
  
  useEffect(() => {
    // Launch massive confetti burst on load
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Fire confetti from left and right corners
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    return () => clearInterval(interval);
  }, []);

  const replayVictoryChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Joyous ascending fanfare synthesis (Arpeggio of C major 9)
      const chord = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50]; // C4, E4, G4, B4, C5, E5, G5, B5, C6
      
      chord.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 1.2);
      });
    } catch (e) {
      console.warn("Fanfare synthesis failed", e);
    }
  };

  return (
    <div className="celebrate-container">
      {/* Background ambient glowing rings */}
      <div className="victory-halo rotate-slow-anim"></div>
      
      <div className="celebrate-card glass-panel">
        <div className="celebrate-badge-container">
          <div className="celebrate-icon-ring pulse-glow-anim">
            <Award className="celebrate-icon" />
          </div>
        </div>

        <h1 className="victory-title">Logic Compiled.</h1>
        <h2 className="victory-subtitle">Ankit Kumar is Placed!</h2>
        
        <p className="victory-text">
          Congratulations, Ankit! Your dedication, coding sessions, and preparation have paid off. 
          The circuit is closed, the signals are clear, and your professional journey is officially launched. 
          NIT Agartala is proud to call you an alumnus.
        </p>

        <div className="victory-illustration-container">
          <img 
            src={successImg} 
            alt="Success illustration" 
            className="victory-illustration float-anim" 
          />
        </div>

        <div className="career-details-box">
          <div className="detail-row">
            <span className="detail-lbl">Academic Root</span>
            <span className="detail-val">{profile.fullDegree}</span>
          </div>
          <div className="detail-row">
            <span className="detail-lbl">Institution</span>
            <span className="detail-val">{profile.college}</span>
          </div>
          <div className="detail-row">
            <span className="detail-lbl">Status</span>
            <span className="detail-val text-success">Calibrated for Success</span>
          </div>
        </div>

        <div className="celebration-actions">
          <button className="btn btn-accent" onClick={replayVictoryChime}>
            <Sparkles size={16} />
            <span>Replay Chime</span>
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            <ArrowLeft size={16} />
            <span>Return to Tracker</span>
          </button>
        </div>
      </div>

      <style>{`
        .victory-halo {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
        }

        .celebrate-badge-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .celebrate-icon-ring {
          width: 72px;
          height: 72px;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .celebrate-icon {
          width: 36px;
          height: 36px;
          color: var(--accent);
        }

        .victory-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 30%, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }

        .victory-subtitle {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent);
          margin-top: 4px;
          letter-spacing: -0.01em;
        }

        .victory-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 16px 0 28px 0;
        }

        .victory-illustration-container {
          display: flex;
          justify-content: center;
          height: 200px;
          margin: 24px 0;
        }

        .victory-illustration {
          max-height: 100%;
          max-width: 90%;
          object-fit: contain;
          border-radius: 16px;
        }

        .career-details-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 32px;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-lbl {
          color: var(--text-muted);
          font-weight: 500;
        }

        .detail-val {
          color: var(--text-primary);
          font-weight: 600;
        }

        .text-success {
          color: var(--success) !important;
          text-shadow: 0 0 10px var(--success-glow);
        }

        .celebration-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
