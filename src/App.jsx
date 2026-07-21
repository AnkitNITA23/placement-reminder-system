import React, { useState, useEffect } from 'react';
import { quotes } from './quotes';
import Dashboard from './components/Dashboard';
import CalendarGrid from './components/CalendarGrid';
import Settings from './components/Settings';
import Celebration from './components/Celebration';
import { Calendar, LayoutDashboard, Settings as SettingsIcon, GraduationCap } from 'lucide-react';

export default function App() {
  // Profiles
  const profile = {
    name: 'Ankit Kumar',
    college: 'NIT Agartala',
    degree: 'B.Tech EIE',
    fullDegree: 'B.Tech in Electronics & Instrumentation Engineering'
  };

  // State initialization
  const [startDateStr, setStartDateStr] = useState(() => {
    return localStorage.getItem('placement_start_date') || '2026-07-20';
  });
  
  const [isPlaced, setIsPlaced] = useState(() => {
    return localStorage.getItem('placement_is_placed') === 'true';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Custom checklist items stored in localStorage
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('placement_checklist');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Solve 2 LeetCode problems (focus on DSA patterns)', done: false },
      { id: '2', text: 'Revise core EIE Concepts (sensors, transducers, control systems)', done: false },
      { id: '3', text: 'Revise Operating Systems or DBMS basics', done: false },
      { id: '4', text: 'Review standard resume points & projects', done: false }
    ];
  });

  // Daily logs (focus minutes, mood, checklist completion)
  // Format: { [dayIndex]: { focus: number, mood: string, tasksDone: number, totalTasks: number, timestamp: string } }
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('placement_daily_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('placement_start_date', startDateStr);
  }, [startDateStr]);

  useEffect(() => {
    localStorage.setItem('placement_is_placed', isPlaced.toString());
  }, [isPlaced]);

  useEffect(() => {
    localStorage.setItem('placement_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('placement_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  // Recalculate Day index based on current date
  useEffect(() => {
    const calculateDay = () => {
      const start = new Date(startDateStr);
      const today = new Date();
      
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const clampDay = Math.max(1, Math.min(54, diffDays));
      setCurrentDay(clampDay);
      setSelectedDayIndex(clampDay);
    };

    calculateDay();
    // Refresh calculations every hour
    const interval = setInterval(calculateDay, 3600000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  // Play celebration audio (Synthesized using Web Audio API)
  const triggerCelebrationAudio = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Gorgeous synthesizer chime (Ascending major pentatonic scale)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        
        // Custom gain envelope
        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.8);
      });
    } catch (e) {
      console.warn("Audio Context block or unsupported", e);
    }
  };

  const handlePlacedToggle = (placedState) => {
    setIsPlaced(placedState);
    if (placedState) {
      triggerCelebrationAudio();
    }
  };

  // Helper to log checklist stats into the calendar database
  const updateDailyChecklistLog = (updatedList) => {
    const total = updatedList.length;
    const completed = updatedList.filter(t => t.done).length;
    
    setDailyLogs(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        tasksDone: completed,
        totalTasks: total,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handleToggleTask = (taskId) => {
    const updated = checklist.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    setChecklist(updated);
    updateDailyChecklistLog(updated);
  };

  const handleAddTask = (text) => {
    if (!text.trim()) return;
    const newTask = { id: Date.now().toString(), text, done: false };
    const updated = [...checklist, newTask];
    setChecklist(updated);
    updateDailyChecklistLog(updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = checklist.filter(t => t.id !== taskId);
    setChecklist(updated);
    updateDailyChecklistLog(updated);
  };

  // Helper to log focus sessions
  const logFocusTime = (minutes) => {
    setDailyLogs(prev => {
      const existingFocus = prev[currentDay]?.focus || 0;
      return {
        ...prev,
        [currentDay]: {
          ...prev[currentDay],
          focus: existingFocus + minutes,
          timestamp: new Date().toISOString()
        }
      };
    });
  };

  // Helper to log mood
  const logMood = (dayIndex, moodName) => {
    setDailyLogs(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        mood: moodName,
        timestamp: new Date().toISOString()
      }
    }));
  };

  // Render placed celebration page if placed
  if (isPlaced) {
    return (
      <Celebration 
        profile={profile} 
        onReset={() => handlePlacedToggle(false)} 
      />
    );
  }

  // Get active selected quote object
  const activeQuote = quotes.find(q => q.day === selectedDayIndex) || quotes[0];

  return (
    <div className="app-layout">
      {/* Background elements */}
      <div className="glow-container">
        <div className="glow-sphere purple-glow"></div>
        <div className="glow-sphere cyan-glow"></div>
      </div>

      {/* Top Navbar */}
      <header className="glass-panel main-header">
        <div className="header-logo">
          <GraduationCap className="logo-icon" />
          <div className="logo-text">
            <h2>Placement Basecamp</h2>
            <p>{profile.degree} • {profile.college}</p>
          </div>
        </div>
        <nav className="nav-tabs">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={18} />
            <span>54 Days Grid</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="content-container">
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={profile}
            currentDay={currentDay}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            quote={activeQuote}
            checklist={checklist}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            dailyLogs={dailyLogs}
            onLogFocus={logFocusTime}
            onLogMood={logMood}
            onPlaced={() => handlePlacedToggle(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarGrid 
            currentDay={currentDay}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            dailyLogs={dailyLogs}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            startDateStr={startDateStr}
            setStartDateStr={setStartDateStr}
            currentDay={currentDay}
          />
        )}
      </main>

      <footer className="main-footer">
        <p>Stay calibrated, Ankit. Keep working hard, your logic is compile-ready.</p>
      </footer>

      {/* Stylings for global components */}
      <style>{`
        .app-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px 60px 16px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-height: 100vh;
        }

        .glow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .glow-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
        }

        .purple-glow {
          top: -10%;
          left: 10%;
          width: 45vw;
          height: 45vw;
          background: var(--primary);
        }

        .cyan-glow {
          bottom: -10%;
          right: 10%;
          width: 40vw;
          height: 40vw;
          background: var(--accent);
        }

        .main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          position: sticky;
          top: 16px;
          z-index: 100;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          color: var(--accent);
          width: 32px;
          height: 32px;
        }

        .logo-text h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .logo-text p {
          font-size: 12px;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }

        .nav-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--panel-border);
        }

        .nav-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition-smooth);
        }

        .nav-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-btn.active {
          color: #07080a;
          background: var(--text-primary);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .main-footer {
          text-align: center;
          padding: 24px 0 12px 0;
          color: var(--text-muted);
          font-size: 12px;
          border-top: 1px solid var(--panel-border);
        }

        @media (max-width: 768px) {
          .main-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
            align-items: stretch;
            text-align: center;
          }
          
          .header-logo {
            justify-content: center;
          }

          .nav-tabs {
            width: 100%;
            justify-content: space-around;
          }

          .nav-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
