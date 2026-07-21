import React from 'react';
import { Lock, Unlock, Check, Clock, SunDim } from 'lucide-react';

export default function CalendarGrid({
  currentDay,
  selectedDayIndex,
  setSelectedDayIndex,
  dailyLogs,
  onSelectTab
}) {
  const totalDays = 54;
  
  const handleDayClick = (dayIndex) => {
    if (dayIndex > currentDay) return; // Locked
    setSelectedDayIndex(dayIndex);
    onSelectTab('dashboard'); // Redirect to dashboard to read quote/illustration
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'Focused': return '#8b5cf6'; // Primary Purple
      case 'Calm': return '#00f2fe';    // Accent Cyan
      case 'Tired': return '#f59e0b';   // Warning Orange
      case 'Recharging': return '#10b981'; // Success Green
      default: return null;
    }
  };

  return (
    <div className="calendar-panel glass-panel">
      <div className="calendar-header">
        <div className="header-titles">
          <h3>54-Day Placement Roadmap</h3>
          <p>Click on any unlocked day to view its specific motivational quote and vector art on the Dashboard.</p>
        </div>
        
        {/* Status Indicators (Legend) */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot status-past-empty"></span>
            <span>Unlogged Day</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-past-logged"></span>
            <span>Logged Work</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-today"></span>
            <span>Active Today</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-future"></span>
            <span>Locked</span>
          </div>
        </div>
      </div>

      <div className="days-grid">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayIndex = i + 1;
          const isToday = dayIndex === currentDay;
          const isPast = dayIndex < currentDay;
          const isFuture = dayIndex > currentDay;
          const isSelected = dayIndex === selectedDayIndex;
          
          const log = dailyLogs[dayIndex];
          const hasLog = log && (log.focus > 0 || log.mood || log.tasksDone > 0);
          
          // Determine day status styling class
          let statusClass = '';
          if (isFuture) statusClass = 'day-locked';
          else if (isToday) statusClass = 'day-today';
          else if (hasLog) statusClass = 'day-logged';
          else statusClass = 'day-unlogged';

          if (isSelected) statusClass += ' day-selected';

          return (
            <div 
              key={dayIndex}
              className={`day-card glass-panel ${statusClass}`}
              onClick={() => handleDayClick(dayIndex)}
            >
              {/* Day Badge */}
              <div className="day-card-header">
                <span className="day-number">Day {dayIndex}</span>
                {isFuture && <Lock size={12} className="lock-icon" />}
                {isToday && <Unlock size={12} className="today-icon" />}
                {isPast && !hasLog && <Check size={12} className="past-icon" />}
                {isPast && hasLog && <span className="logged-badge">LOGGED</span>}
              </div>

              {/* Day Contents */}
              <div className="day-card-body">
                {isFuture ? (
                  <div className="locked-view">
                    <span className="lock-text">Locked</span>
                  </div>
                ) : (
                  <div className="unlocked-view">
                    {/* Logged stats inside the card */}
                    {log && log.focus > 0 && (
                      <div className="card-log-stat">
                        <Clock size={10} />
                        <span>{log.focus}m</span>
                      </div>
                    )}
                    {log && log.mood && (
                      <div 
                        className="card-log-mood" 
                        style={{ borderLeftColor: getMoodColor(log.mood) }}
                      >
                        <SunDim size={10} style={{ color: getMoodColor(log.mood) }} />
                        <span>{log.mood}</span>
                      </div>
                    )}
                    {(!log || (!log.focus && !log.mood)) && (
                      <div className="quote-hint-text">
                        <span>Click to view cheer quote</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .calendar-panel {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          border-bottom: 1px solid var(--panel-border);
          padding-bottom: 20px;
        }

        .header-titles h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .header-titles p {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .calendar-legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-past-empty { background-color: rgba(255, 255, 255, 0.15); }
        .status-past-logged { background-color: var(--success); }
        .status-today { background-color: var(--primary); }
        .status-future { background-color: rgba(255, 255, 255, 0.03); }

        /* Grid */
        .days-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 16px;
        }

        .day-card {
          aspect-ratio: 1.1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 12px;
          transition: var(--transition-smooth);
        }

        .day-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .day-number {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 13px;
        }

        .lock-icon { color: var(--text-muted); }
        .today-icon { color: var(--primary); }
        .past-icon { color: var(--text-muted); }
        
        .logged-badge {
          font-size: 8px;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 2px 5px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .day-card-body {
          flex: 1;
          display: flex;
          align-items: flex-end;
          margin-top: 10px;
        }

        .unlocked-view {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .card-log-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--text-secondary);
        }

        .card-log-mood {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--text-secondary);
          border-left: 2px solid transparent;
          padding-left: 4px;
        }

        .quote-hint-text {
          font-size: 9px;
          color: var(--text-muted);
          line-height: 1.1;
        }

        /* Status Colors */
        .day-locked {
          opacity: 0.4;
          background: rgba(255, 255, 255, 0.02);
          cursor: not-allowed;
          border-color: transparent;
        }

        .day-locked:hover {
          box-shadow: none;
          border-color: transparent;
        }

        .day-unlogged {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.04);
        }

        .day-unlogged:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .day-logged {
          cursor: pointer;
          background: rgba(16, 185, 129, 0.04);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .day-logged:hover {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1);
        }

        .day-today {
          cursor: pointer;
          background: rgba(139, 92, 246, 0.05);
          border-color: var(--primary);
          box-shadow: 0 0 15px var(--primary-glow);
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0% { border-color: rgba(139, 92, 246, 0.6); }
          50% { border-color: rgba(139, 92, 246, 1); }
          100% { border-color: rgba(139, 92, 246, 0.6); }
        }

        .day-selected {
          border-color: var(--accent) !important;
          box-shadow: 0 0 20px var(--accent-glow) !important;
        }
      `}</style>
    </div>
  );
}
