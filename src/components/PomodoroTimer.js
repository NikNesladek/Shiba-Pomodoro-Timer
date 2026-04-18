import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../styles/PomodoroTimer.css';
import 'react-circular-progressbar/dist/styles.css';

const SESSION_LENGTHS = {
  focus: 20,
  summary: 5,
  break: 5,
};

function PomodoroTimer({ panelWidth, isLayoutEditMode = false }) {
  const [minutes, setMinutes] = useState(SESSION_LENGTHS.focus);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus');
  const [focusSessionCount, setFocusSessionCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const playSound = (frequency = 900, duration = 140) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else {
          if (minutes > 0) {
            setMinutes(minutes - 1);
            setSeconds(59);
          } else {
            clearInterval(interval);
            
            if (sessionType === 'focus') {
              setFocusSessionCount((count) => count + 1);
              setSessionType('summary');
              setMinutes(SESSION_LENGTHS.summary);
              setIsActive(true);
              playSound(720, 150);
            } else if (sessionType === 'summary') {
              setSessionType('break');
              setMinutes(SESSION_LENGTHS.break);
              setIsActive(true);
              playSound(680, 150);
            } else {
              setSessionType('focus');
              setMinutes(SESSION_LENGTHS.focus);
              setIsActive(true);
              playSound(980, 150);
            }
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, sessionType]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(SESSION_LENGTHS.focus);
    setSeconds(0);
    setSessionType('focus');
    setFocusSessionCount(0);
  };

  const totalSeconds = minutes * 60 + seconds;
  const sessionDuration = SESSION_LENGTHS[sessionType] * 60;
  
  const percentage = ((sessionDuration - totalSeconds) / sessionDuration) * 100;

  // Calculate the size of the circular progress bar based on the window width
  const maxSize = 500;
  const minSize = 140;
  const responsiveSize = Math.max(minSize, Math.min(maxSize, windowWidth * 0.2));
  const editableSize = panelWidth ? Math.max(180, Math.min(320, (panelWidth - 48) * 0.68)) : responsiveSize;
  const calculatedSize = isLayoutEditMode ? editableSize : responsiveSize;
  const timerWidth = isLayoutEditMode ? '100%' : calculatedSize * 1.5;

  const pathColorBySession = {
    focus: '#7bb4ff',
    summary: '#f2c14e',
    break: '#e3a06b',
  };

  const getSessionText = () => {
    if (sessionType === 'focus') return 'Focus (20 min)';
    if (sessionType === 'summary') return 'Summary (5 min)';
    return 'Break (5 min)';
  };

  return (
    <div className={isLayoutEditMode ? 'pomodoro-timer pomodoro-timer--editable' : 'pomodoro-timer'} style={{ width: timerWidth }}>
      <CircularProgressbar
        value={percentage}
        text={`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
        styles={buildStyles({
          textColor: '#fff',
          pathColor: pathColorBySession[sessionType],
          trailColor: '#2c3e62',
          strokeLinecap: 'butt',
          textSize: `${calculatedSize / 25}px`,
          root: {
            width: `${calculatedSize}px`,
          },
        })}
        strokeWidth={8}
      />
      <div style={{ marginTop: '10px', color: '#fff' }}>
        {getSessionText()}
      </div>
      <div style={{ marginTop: '5px', color: '#fff', fontSize: '12px' }}>
        Completed focus sessions: {focusSessionCount}
      </div>
      <div className="pomodoro-actions">
        <button className="pomodoro-button" onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
        <button className="pomodoro-button" onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

export default PomodoroTimer;