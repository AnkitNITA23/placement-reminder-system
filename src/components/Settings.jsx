import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Key, AlertCircle, HelpCircle, Check, Loader2, Send, CalendarDays, Bell, Clock, Download, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { generateICS, downloadICS } from '../utils/generateICS';

export default function Settings({
  startDateStr,
  setStartDateStr,
  currentDay
}) {
  // SMTP credentials saved locally in browser storage for convenience
  const [receiverEmail, setReceiverEmail] = useState(() => localStorage.getItem('placement_receiver_email') || '');
  const [emailUser, setEmailUser] = useState(() => localStorage.getItem('placement_email_user') || '');
  const [emailPass, setEmailPass] = useState(() => localStorage.getItem('placement_email_pass') || '');
  const [emailHost, setEmailHost] = useState(() => localStorage.getItem('placement_email_host') || 'smtp.gmail.com');
  const [emailPort, setEmailPort] = useState(() => localStorage.getItem('placement_email_port') || '465');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showGuide, setShowGuide] = useState(false);

  // Google Calendar / ICS state
  const [reminderHour, setReminderHour] = useState(() =>
    parseInt(localStorage.getItem('placement_cal_hour') || '7')
  );
  const [reminderMinute, setReminderMinute] = useState(() =>
    parseInt(localStorage.getItem('placement_cal_minute') || '30')
  );
  const [alarmOffset, setAlarmOffset] = useState(() =>
    parseInt(localStorage.getItem('placement_cal_offset') || '0')
  );
  const [showCalGuide, setShowCalGuide] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  // Sync SMTP config to localStorage on change
  useEffect(() => {
    localStorage.setItem('placement_receiver_email', receiverEmail);
    localStorage.setItem('placement_email_user', emailUser);
    localStorage.setItem('placement_email_pass', emailPass);
    localStorage.setItem('placement_email_host', emailHost);
    localStorage.setItem('placement_email_port', emailPort);
  }, [receiverEmail, emailUser, emailPass, emailHost, emailPort]);

  // Sync calendar reminder prefs to localStorage
  useEffect(() => {
    localStorage.setItem('placement_cal_hour', String(reminderHour));
    localStorage.setItem('placement_cal_minute', String(reminderMinute));
    localStorage.setItem('placement_cal_offset', String(alarmOffset));
  }, [reminderHour, reminderMinute, alarmOffset]);

  const handleDownloadICS = () => {
    const icsContent = generateICS(startDateStr, reminderHour, reminderMinute, alarmOffset);
    downloadICS(icsContent, 'placement-sprint-54days.ics');
    setDownloadDone(true);
    setTimeout(() => setDownloadDone(false), 4000);
  };

  // Format preview time
  const previewTime = `${pad(reminderHour)}:${pad(reminderMinute)} ${reminderHour < 12 ? 'AM' : 'PM'}`;
  function pad(n) { return String(n).padStart(2, '0'); }

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!receiverEmail || !emailUser || !emailPass) {
      setStatus({ 
        type: 'error', 
        message: 'Please fill in Sender Gmail, App Password, and Receiver Email before testing.' 
      });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Configuring SMTP bridge and sending test email...' });

    try {
      const response = await fetch('/api/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailUser,
          emailPass,
          receiverEmail,
          emailHost,
          emailPort,
          currentDay,
          appUrl: window.location.origin
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: 'Test email successfully sent to your phone! Check your inbox (or spam folder).' 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: `Failed to send email: ${data.error || 'Check credentials.'}` 
        });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: `Network error: Could not reach the serverless function. ${err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-grid">
      {/* Configuration Form */}
      <div className="glass-panel settings-card">
        <div className="settings-header">
          <Mail className="settings-icon icon-cyan" />
          <div>
            <h3>Notification Config</h3>
            <p>Setup daily placement countdown emails sent directly to your phone.</p>
          </div>
        </div>

        <form onSubmit={handleTestEmail} className="settings-form">
          <div className="form-group">
            <label>Receiver Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="ankit.eie.nita@gmail.com" 
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                required
              />
            </div>
            <span className="field-hint">Your email where notifications will appear on your phone.</span>
          </div>

          <div className="form-group">
            <label>Sender Gmail Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="your-account@gmail.com" 
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                required
              />
            </div>
            <span className="field-hint">The Gmail address that will send out the daily reminders.</span>
          </div>

          <div className="form-group">
            <label className="label-with-help">
              <span>Gmail App Password</span>
              <button 
                type="button" 
                className="guide-toggle-btn"
                onClick={() => setShowGuide(!showGuide)}
              >
                <HelpCircle size={14} />
                <span>How to get one?</span>
              </button>
            </label>
            <div className="input-with-icon">
              <Key size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="xxxx xxxx xxxx xxxx" 
                value={emailPass}
                onChange={(e) => setEmailPass(e.target.value)}
                required
              />
            </div>
            <span className="field-hint">A 16-character secure App Password generated in Google Account settings.</span>
          </div>

          {/* Collapsible SMTP details */}
          <div className="advanced-smtp">
            <div className="form-row">
              <div className="form-group half-width">
                <label>SMTP Host</label>
                <input 
                  type="text" 
                  value={emailHost} 
                  onChange={(e) => setEmailHost(e.target.value)} 
                />
              </div>
              <div className="form-group half-width">
                <label>SMTP Port</label>
                <input 
                  type="text" 
                  value={emailPort} 
                  onChange={(e) => setEmailPort(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {status.message && (
            <div className={`status-banner banner-${status.type}`}>
              <AlertCircle size={16} className="banner-icon" />
              <p>{status.message}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="rotate-slow-anim" /> : <Send size={16} />}
              <span>{loading ? 'Sending Test...' : 'Send Test Notification'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ===== GOOGLE CALENDAR SECTION ===== */}
      <div className="glass-panel settings-card cal-sync-card">
        <div className="settings-header">
          <CalendarDays className="settings-icon icon-green" />
          <div>
            <h3>Google Calendar Sync</h3>
            <p>Download 54 daily reminder events — shows as pop-up on your phone.</p>
          </div>
        </div>

        {/* Time Picker Row */}
        <div className="cal-config-grid">
          <div className="form-group">
            <label>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Reminder Time (IST)
            </label>
            <div className="time-picker-row">
              <select
                className="time-select"
                value={reminderHour}
                onChange={e => setReminderHour(Number(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{pad(i)}</option>
                ))}
              </select>
              <span className="time-sep">:</span>
              <select
                className="time-select"
                value={reminderMinute}
                onChange={e => setReminderMinute(Number(e.target.value))}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                  <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
              <span className="time-ampm">{reminderHour < 12 ? 'AM' : 'PM'}</span>
            </div>
            <span className="field-hint">Daily event time. Google Calendar fires a pop-up at this time.</span>
          </div>

          <div className="form-group">
            <label>
              <Bell size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Pop-up Alert
            </label>
            <select
              className="time-select full-width-select"
              value={alarmOffset}
              onChange={e => setAlarmOffset(Number(e.target.value))}
            >
              <option value={0}>At event time (exactly {previewTime})</option>
              <option value={5}>5 min before ({pad(reminderHour)}:{pad(Math.max(0, reminderMinute - 5))} IST)</option>
              <option value={10}>10 min before</option>
              <option value={15}>15 min before</option>
              <option value={30}>30 min before</option>
            </select>
            <span className="field-hint">Your phone pops up this many minutes before the event.</span>
          </div>
        </div>

        {/* Preview Box */}
        <div className="cal-preview-box">
          <div className="cal-preview-header">
            <Smartphone size={14} />
            <span>Phone Notification Preview</span>
          </div>
          <div className="cal-preview-content">
            <div className="cal-preview-dot" />
            <div>
              <div className="cal-preview-title">📚 Day 1/54 — Placement Basecamp</div>
              <div className="cal-preview-sub">Today at {previewTime} · Google Calendar</div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="cal-actions">
          <button
            className={`btn ${downloadDone ? 'btn-success-done' : 'btn-cal-download'}`}
            onClick={handleDownloadICS}
          >
            {downloadDone ? <Check size={16} /> : <Download size={16} />}
            <span>{downloadDone ? 'Downloaded! Import into Google Calendar' : 'Download 54-Day Calendar File (.ics)'}</span>
          </button>
        </div>

        {/* Import Guide Toggle */}
        <button
          className="guide-toggle-btn cal-guide-toggle"
          onClick={() => setShowCalGuide(v => !v)}
        >
          {showCalGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{showCalGuide ? 'Hide import instructions' : 'How to import to Google Calendar on your phone?'}</span>
        </button>

        {showCalGuide && (
          <div className="cal-guide-steps animate-slide">
            <div className="cal-guide-step">
              <span className="step-num">1</span>
              <span>Click <strong>Download .ics</strong> above — a file saves to your device.</span>
            </div>
            <div className="cal-guide-step">
              <span className="step-num">2</span>
              <span>On your phone, open the <strong>Google Calendar app</strong> → tap the <strong>≡ menu</strong> → <strong>Settings</strong> → <strong>Import</strong>.</span>
            </div>
            <div className="cal-guide-step">
              <span className="step-num">3</span>
              <span><em>Alternatively</em> (easiest): Send yourself the <code>.ics</code> file via Gmail/WhatsApp → open it on your phone → tap <strong>"Add to Calendar"</strong>.</span>
            </div>
            <div className="cal-guide-step">
              <span className="step-num">4</span>
              <span>All 54 events are imported instantly. Google Calendar syncs pop-up notifications to your phone automatically.</span>
            </div>
            <div className="cal-guide-step">
              <span className="step-num">5</span>
              <span>At <strong>{previewTime} IST</strong> each day, your phone will show a notification. Tap it to open your Placement Basecamp app!</span>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Settings (Start Date / Vercel Deploy Guide) */}
      <div className="column-settings-right">
        {/* Date Config Card */}
        <div className="glass-panel settings-card">
          <div className="settings-header">
            <Calendar className="settings-icon icon-purple" />
            <div>
              <h3>Timeline Setup</h3>
              <p>Configure the launch date of your 54-day placement sprint.</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Countdown Start Date</label>
              <input 
                type="date" 
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="date-input"
              />
              <span className="field-hint">Day 1 calculated from this date. Current day index: <strong>Day {currentDay}</strong>.</span>
            </div>
          </div>
        </div>

        {/* Collapsible Gmail App Password Step Guide */}
        {showGuide && (
          <div className="glass-panel settings-card guide-card-panel animate-slide">
            <h3>How to generate Gmail App Password</h3>
            <ol className="guide-list">
              <li>Open your Google Account settings page.</li>
              <li>Navigate to the <strong>Security</strong> panel in the left sidebar.</li>
              <li>Under "How you sign in to Google", ensure <strong>2-Step Verification</strong> is enabled.</li>
              <li>Click on <strong>2-Step Verification</strong>, scroll to the bottom, and select <strong>App passwords</strong>.</li>
              <li>Enter an app name (e.g. <code>Placement Basecamp</code>) and click <strong>Create</strong>.</li>
              <li>Copy the generated <strong>16-character code</strong> (yellow box) and paste it into the field on the left.</li>
            </ol>
            <button className="btn btn-secondary close-guide-btn" onClick={() => setShowGuide(false)}>
              <Check size={14} />
              <span>I understand</span>
            </button>
          </div>
        )}

        {/* Deployment notes */}
        <div className="glass-panel settings-card v-deploy-card">
          <h3>Production Vercel Hosting</h3>
          <p>
            Once you push this project to GitHub and connect it to Vercel, the app triggers automatically. 
            To activate daily automated morning emails, configure the following **Environment Variables** in your Vercel Project Settings:
          </p>
          <ul className="env-list">
            <li><code>RECEIVER_EMAIL</code>: your-email@gmail.com</li>
            <li><code>EMAIL_USER</code>: sender-gmail@gmail.com</li>
            <li><code>EMAIL_PASS</code>: your-16-char-app-password</li>
            <li><code>START_DATE</code>: YYYY-MM-DD</li>
            <li><code>APP_URL</code>: your-vercel-project-link</li>
          </ul>
          <p className="cron-note">
            The <code>vercel.json</code> scheduler will trigger the <code>/api/cron</code> endpoint daily at 8:00 AM IST to send your emails.
          </p>
        </div>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        /* ===== GOOGLE CALENDAR SYNC STYLES ===== */
        .cal-sync-card {
          grid-column: 1 / -1;
          padding: 28px;
        }

        .icon-green { color: #34d399; }

        .cal-config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 20px;
        }

        .time-picker-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .time-select {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition-smooth);
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
        }

        .time-select:focus {
          outline: none;
          border-color: rgba(52, 211, 153, 0.5);
        }

        .time-select option {
          background: #1a1b2e;
          color: var(--text-primary);
        }

        .full-width-select {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
        }

        .time-sep {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-muted);
          line-height: 1;
        }

        .time-ampm {
          font-size: 11px;
          font-weight: 700;
          color: #34d399;
          letter-spacing: 0.08em;
          margin-left: 4px;
        }

        /* Phone Notification Preview */
        .cal-preview-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--panel-border);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }

        .cal-preview-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.04), rgba(139, 92, 246, 0.03));
          pointer-events: none;
        }

        .cal-preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .cal-preview-content {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 12px 16px;
        }

        .cal-preview-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #34d399;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        .cal-preview-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3px;
        }

        .cal-preview-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Download Button */
        .cal-actions {
          margin-bottom: 16px;
        }

        .btn-cal-download {
          width: 100%;
          justify-content: center;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.08));
          border: 1px solid rgba(52, 211, 153, 0.35);
          color: #34d399;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.25s ease;
          font-family: var(--font-heading);
        }

        .btn-cal-download:hover {
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(16, 185, 129, 0.15));
          border-color: rgba(52, 211, 153, 0.6);
          box-shadow: 0 4px 20px rgba(52, 211, 153, 0.2);
          transform: translateY(-1px);
        }

        .btn-success-done {
          width: 100%;
          justify-content: center;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.3), rgba(16, 185, 129, 0.2));
          border: 1px solid rgba(52, 211, 153, 0.7);
          color: #34d399;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 10px;
          cursor: default;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-heading);
          animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes pop-in {
          from { transform: scale(0.95); opacity: 0.7; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Cal Guide Toggle */
        .cal-guide-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }

        .cal-guide-toggle:hover {
          color: #34d399;
        }

        /* Import Steps */
        .cal-guide-steps {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
        }

        .cal-guide-step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .step-num {
          background: rgba(52, 211, 153, 0.15);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #34d399;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cal-guide-step code {
          background: rgba(255, 255, 255, 0.05);
          color: #34d399;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
        }

        .column-settings-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          padding: 24px;
        }

        .settings-header {
          display: flex;
          gap: 16px;
          align-items: center;
          border-bottom: 1px solid var(--panel-border);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .settings-icon {
          width: 24px;
          height: 24px;
        }

        .icon-cyan { color: var(--accent); }
        .icon-purple { color: var(--primary); }

        .settings-header h3 {
          font-size: 16px;
          font-weight: 700;
        }

        .settings-header p {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-family: var(--font-heading);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .label-with-help {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .guide-toggle-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-with-icon input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 12px 14px 12px 42px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 13px;
          transition: var(--transition-smooth);
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: rgba(0, 242, 254, 0.4);
          background: rgba(0, 0, 0, 0.3);
        }

        .field-hint {
          font-size: 10px;
          color: var(--text-muted);
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .half-width {
          flex: 1;
        }

        .advanced-smtp input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 13px;
          width: 100%;
        }

        .date-input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 12px 14px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 13px;
          width: 100%;
        }

        .date-input:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.4);
        }

        /* Status Banners */
        .status-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
        }

        .banner-info {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .banner-success {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .banner-error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .banner-icon {
          flex-shrink: 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        /* Guide instructions card */
        .guide-card-panel h3 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .guide-list {
          padding-left: 20px;
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .guide-list code {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        .close-guide-btn {
          width: 100%;
          justify-content: center;
        }

        /* Vercel notes card */
        .v-deploy-card h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .v-deploy-card p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .env-list {
          list-style: none;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .env-list li {
          font-family: monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .env-list code {
          color: var(--accent);
        }

        .cron-note {
          font-size: 10px !important;
          color: var(--text-muted) !important;
          font-style: italic;
        }

        .animate-slide {
          animation: slide-down 0.3s ease-out;
        }

        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
          .cal-config-grid {
            grid-template-columns: 1fr;
          }
          .cal-sync-card {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}
