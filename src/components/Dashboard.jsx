import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Circle, Smile, BookOpen, Flame, Award } from 'lucide-react';
import prepCoding from '../assets/prep_coding.png';
import resilienceImg from '../assets/resilience.png';

export default function Dashboard({
  profile,
  currentDay,
  selectedDayIndex,
  setSelectedDayIndex,
  quote,
  checklist,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  dailyLogs,
  onLogFocus,
  onLogMood,
  onPlaced
}) {
  // Focus Timer States
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [cheerMessage, setCheerMessage] = useState('');
  
  const timerRef = useRef(null);

  // Calculate completion percentage
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(t => t.done).length;
  const prepPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Retrieve current day's focus log
  const todayFocus = dailyLogs[currentDay]?.focus || 0;
  const todayMood = dailyLogs[currentDay]?.mood || '';

  // Timer Tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            
            // Audio synthesizer alert for timer completion (EIE themed tone)
            playTimerAlarm();

            if (timerMode === 'focus') {
              onLogFocus(25);
              setCheerMessage('Focus block completed! Outstanding effort, Ankit. Take a well-deserved 5-minute break.');
              setTimerMode('break');
              return 5 * 60;
            } else {
              setCheerMessage('Break completed! Let\'s synchronize and lock back in.');
              setTimerMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning, timerMode]);

  // Audio synthethizer for alarm
  const playTimerAlarm = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Warm electronic harmonic alert
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.frequency.setValueAtTime(440, now); // A4
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      
      osc2.frequency.setValueAtTime(554.37, now); // C#5
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.3);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn("Timer alarm synthesis failed", e);
    }
  };

  const handleStartPause = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNoPlacedClick = () => {
    const encouragementPhrases = [
      "No worries, Ankit! Placements are a marathon, not a sprint. Your preparations are loading.",
      "Stay calibrated! Every coding challenge you work through is filtering out the noise of self-doubt.",
      "Keep compiling. Persistence is the key logic that secures the offer. You are on track.",
      "Calibrating systems... Keep your focus. The ideal position is matching your impedance.",
      "Your efforts are accumulator nodes. One day very soon, it will pay off beautifully."
    ];
    const randomPhrase = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
    setCheerMessage(randomPhrase);
    
    // Auto clear cheer message after 7 seconds
    setTimeout(() => {
      setCheerMessage('');
    }, 7000);
  };

  // Determine illustration
  const displayIllustration = quote.category === 'coding' ? prepCoding : resilienceImg;

  // Mood options (Well-styled tags instead of default emojis)
  const moodOptions = [
    { name: 'Focused', class: 'mood-focused' },
    { name: 'Calm', class: 'mood-calm' },
    { name: 'Tired', class: 'mood-tired' },
    { name: 'Recharging', class: 'mood-recharging' }
  ];

  return (
    <div className="dashboard-grid">
      {/* LEFT COLUMN: Main Countdown & Interactive Cheer */}
      <section className="column-left">
        {/* Banner Card */}
        <div className="glass-panel profile-banner">
          <div className="banner-details">
            <span className="welcome-tag">Active Preparation Basecamp</span>
            <h1>{profile.name}</h1>
            <p className="college-text">{profile.fullDegree} • {profile.college}</p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat-item">
              <span className="stat-label">Countdown</span>
              <span className="stat-value">Day {currentDay}/54</span>
            </div>
          </div>
        </div>

        {/* Cheering Daily Card */}
        <div className="glass-panel cheer-card">
          <div className="cheer-header">
            <span className="cheer-badge">Day {selectedDayIndex} Motivation</span>
            <span className="topic-badge">{quote.topic}</span>
          </div>

          <div className="cheer-illustration-container">
            <img 
              src={displayIllustration} 
              alt={quote.topic} 
              className="cheer-illustration float-anim"
            />
          </div>

          <div className="cheer-content">
            <blockquote className="cheer-quote">
              "{quote.quote}"
            </blockquote>
          </div>

          {/* Placement Status Query Module */}
          {currentDay === selectedDayIndex && (
            <div className="placement-checker">
              <h4>Have you secured your placement today?</h4>
              <div className="checker-buttons">
                <button 
                  className="btn btn-accent pulse-glow-anim" 
                  onClick={onPlaced}
                >
                  <Award size={16} />
                  <span>Yes, I am Placed!</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleNoPlacedClick}
                >
                  <span>Not yet, staying focused</span>
                </button>
              </div>
            </div>
          )}

          {cheerMessage && (
            <div className="cheer-toast glass-panel">
              <p>{cheerMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT COLUMN: Interactive Prep Checklist, Pomodoro, Logs */}
      <section className="column-right">
        {/* Core Stats Overview */}
        <div className="stats-row">
          <div className="glass-panel stat-card">
            <div className="stat-card-header">
              <Flame className="stat-icon icon-cyan" />
              <span>Prep Score</span>
            </div>
            <div className="stat-card-body">
              <h3>{prepPercentage}%</h3>
              <p>{completedTasks} of {totalTasks} tasks logged</p>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-card-header">
              <BookOpen className="stat-icon icon-purple" />
              <span>Focus Log</span>
            </div>
            <div className="stat-card-body">
              <h3>{todayFocus} m</h3>
              <p>Accumulated today</p>
            </div>
          </div>
        </div>

        {/* Pomodoro Focus Timer */}
        <div className="glass-panel pomodoro-card">
          <div className="pomodoro-header">
            <h3>Focus Synchronizer</h3>
            <span className={`timer-mode-tag ${timerMode}`}>
              {timerMode === 'focus' ? 'Focus Block' : 'Break'}
            </span>
          </div>

          <div className="timer-display">
            <h2>{formatTime(timeLeft)}</h2>
          </div>

          <div className="timer-controls">
            <button className="btn btn-secondary" onClick={handleResetTimer}>
              <RotateCcw size={16} />
            </button>
            <button 
              className={`btn ${timerRunning ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={handleStartPause}
            >
              {timerRunning ? <Pause size={16} /> : <Play size={16} />}
              <span>{timerRunning ? 'Pause' : 'Synchronize'}</span>
            </button>
          </div>
        </div>

        {/* Preparation Checklist */}
        <div className="glass-panel checklist-card">
          <div className="checklist-header">
            <h3>Daily Calibration Tasks</h3>
            <span className="count-label">{completedTasks}/{totalTasks}</span>
          </div>

          <form onSubmit={handleAddTaskSubmit} className="add-task-form">
            <input 
              type="text" 
              placeholder="Add custom task (e.g. Solve binary search)..." 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="task-input"
            />
            <button type="submit" className="btn btn-primary btn-icon">
              <Plus size={16} />
            </button>
          </form>

          <div className="task-list">
            {checklist.map(task => (
              <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                <button className="task-checkbox" onClick={() => onToggleTask(task.id)}>
                  {task.done ? <CheckCircle2 className="checked-icon" size={18} /> : <Circle className="unchecked-icon" size={18} />}
                </button>
                <span className="task-text">{task.text}</span>
                <button className="task-delete-btn" onClick={() => onDeleteTask(task.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {checklist.length === 0 && (
              <p className="empty-tasks">No tasks calibrated. Add some goals above!</p>
            )}
          </div>
        </div>

        {/* Daily Mood Check-in */}
        <div className="glass-panel mood-card">
          <div className="mood-header">
            <h3>Daily System Check-in</h3>
            <p>Log your current operating mood state</p>
          </div>
          <div className="mood-selectors">
            {moodOptions.map(m => (
              <button 
                key={m.name} 
                className={`mood-tag-btn ${m.class} ${todayMood === m.name ? 'active' : ''}`}
                onClick={() => onLogMood(currentDay, m.name)}
              >
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Styled JSX for dashboard layouts */}
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        .column-left, .column-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Profile Banner */
        .profile-banner {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 242, 254, 0.05));
          border-color: rgba(139, 92, 246, 0.15);
        }

        .welcome-tag {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
        }

        .profile-banner h1 {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
        }

        .college-text {
          color: var(--text-secondary);
          font-size: 13px;
          margin-top: 4px;
        }

        .banner-stats {
          text-align: right;
        }

        .banner-stat-item .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          display: block;
        }

        .banner-stat-item .stat-value {
          font-size: 24px;
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--text-primary);
        }

        /* Cheering Daily Card */
        .cheer-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
        }

        .cheer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cheer-badge {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .topic-badge {
          font-size: 11px;
          font-weight: 600;
          background: rgba(0, 242, 254, 0.1);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(0, 242, 254, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cheer-illustration-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 180px;
          position: relative;
        }

        .cheer-illustration {
          max-height: 100%;
          max-width: 80%;
          object-fit: contain;
          border-radius: 12px;
        }

        .cheer-content {
          text-align: center;
        }

        .cheer-quote {
          font-size: 18px;
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.6;
          font-weight: 500;
        }

        /* Placement status checker */
        .placement-checker {
          border-top: 1px solid var(--panel-border);
          padding-top: 24px;
          text-align: center;
        }

        .placement-checker h4 {
          font-size: 15px;
          color: var(--text-primary);
          margin-bottom: 16px;
          font-weight: 600;
        }

        .checker-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .cheer-toast {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          padding: 16px;
          background: rgba(11, 12, 16, 0.95);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: 12px;
          text-align: center;
          animation: slide-up-fade 0.4s ease-out;
        }

        .cheer-toast p {
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
        }

        @keyframes slide-up-fade {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Right Column Cards */
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .stat-card {
          padding: 16px;
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-icon {
          width: 16px;
          height: 16px;
        }

        .icon-cyan { color: var(--accent); }
        .icon-purple { color: var(--primary); }

        .stat-card-body {
          margin-top: 12px;
        }

        .stat-card-body h3 {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-card-body p {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Pomodoro focus timer */
        .pomodoro-card {
          padding: 24px;
          text-align: center;
        }

        .pomodoro-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .pomodoro-header h3 {
          font-size: 15px;
          font-weight: 700;
        }

        .timer-mode-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .timer-mode-tag.focus {
          background: rgba(139, 92, 246, 0.1);
          color: var(--primary);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .timer-mode-tag.break {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .timer-display h2 {
          font-size: 48px;
          font-family: var(--font-heading);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 12px 0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
        }

        .timer-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        /* Calibration Checklist */
        .checklist-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .checklist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checklist-header h3 {
          font-size: 15px;
          font-weight: 700;
        }

        .count-label {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 700;
        }

        .add-task-form {
          display: flex;
          gap: 8px;
        }

        .task-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 13px;
          transition: var(--transition-smooth);
        }

        .task-input:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(0, 0, 0, 0.3);
        }

        .btn-icon {
          padding: 10px;
          border-radius: 8px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          transition: var(--transition-smooth);
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .task-checkbox {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .task-checkbox:hover {
          color: var(--accent);
        }

        .checked-icon {
          color: var(--success);
        }

        .task-text {
          flex: 1;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          transition: var(--transition-smooth);
        }

        .task-item.done .task-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: var(--transition-smooth);
          padding: 2px;
        }

        .task-item:hover .task-delete-btn {
          opacity: 1;
        }

        .task-delete-btn:hover {
          color: #ef4444;
        }

        .empty-tasks {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          padding: 20px 0;
        }

        /* Mood check in */
        .mood-card {
          padding: 20px;
        }

        .mood-header h3 {
          font-size: 15px;
          font-weight: 700;
        }

        .mood-header p {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .mood-selectors {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .mood-tag-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--panel-border);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-family: var(--font-heading);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .mood-tag-btn:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .mood-tag-btn.active {
          color: #07080a;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .mood-focused.active { background-color: var(--primary); }
        .mood-calm.active { background-color: var(--accent); }
        .mood-tired.active { background-color: var(--warning); }
        .mood-recharging.active { background-color: var(--success); }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
