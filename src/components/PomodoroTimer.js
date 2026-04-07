import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../styles/PomodoroTimer.css';
import 'react-circular-progressbar/dist/styles.css';

function PomodoroTimer({ panelWidth, isLayoutEditMode = false }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [workSessionCount, setWorkSessionCount] = useState(0); // Track completed work sessions
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to play a sound
  const playSound = (frequency = 800, duration = 200) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
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
            
            // Switch between work and break sessions
            if (isWorkSession) {
              // Work session just completed
              const newWorkSessionCount = workSessionCount + 1;
              setWorkSessionCount(newWorkSessionCount);
              setIsWorkSession(false);
              
              if (newWorkSessionCount % 4 === 0) {
                // After 4 work sessions, take a long break (20 minutes)
                setMinutes(20);
                setIsActive(true); // Auto-start long break
                playSound(600, 1000); // Longer sound for long break
                setTimeout(() => playSound(600, 500), 500);
              } else {
                // Short break (5 minutes) - auto start
                setMinutes(5);
                setIsActive(true); // Continue timer automatically
                playSound(600, 500);
                setTimeout(() => playSound(600, 500),500);
              }
            } else {
              // Break session just completed
              const wasLongBreak = (workSessionCount % 4 === 0 && workSessionCount > 0);
              
              setMinutes(25);
              setIsWorkSession(true);
              
              if (wasLongBreak) {
                setIsActive(false); // Manual start required after long break
              } else {
                setIsActive(true); // Auto-start after short break
              }
              
              playSound(1500, 500);
              setTimeout(() => playSound(1000, 500), 500);
            }
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isWorkSession, workSessionCount]);

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
    setMinutes(25);
    setSeconds(0);
    setIsWorkSession(true);
    setWorkSessionCount(0); // Reset work session count
  };

  const totalSeconds = minutes * 60 + seconds;
  let sessionDuration;
  
  if (isWorkSession) {
    sessionDuration = 25 * 60; // 25 minutes for work
  } else {
    // Check if this is a long break (after 4 work sessions)
    sessionDuration = (workSessionCount % 4 === 0 && workSessionCount > 0) ? 20 * 60 : 5 * 60;
  }
  
  const percentage = ((sessionDuration - totalSeconds) / sessionDuration) * 100;

  // Calculate the size of the circular progress bar based on the window width
  const maxSize = 500;
  const minSize = 140;
  const responsiveSize = Math.max(minSize, Math.min(maxSize, windowWidth * 0.2));
  const editableSize = panelWidth ? Math.max(180, Math.min(320, (panelWidth - 48) * 0.68)) : responsiveSize;
  const calculatedSize = isLayoutEditMode ? editableSize : responsiveSize;
  const timerWidth = isLayoutEditMode ? '100%' : calculatedSize * 1.5;

  // Set color based on session type
  let pathColor;
  if (isWorkSession) {
    pathColor = 'purple'; // Work session
  } else if (workSessionCount % 4 === 0 && workSessionCount > 0) {
    pathColor = 'orange'; // Long break
  } else {
    pathColor = 'green'; // Short break
  }

  // Get session type text
  const getSessionText = () => {
    if (isWorkSession) {
      return `Work Session ${(workSessionCount % 4) + 1}/4`;
    } else if (workSessionCount % 4 === 0 && workSessionCount > 0) {
      return 'Long Break (20 min)';
    } else {
      return 'Short Break (5 min)';
    }
  };

  return (
    <div className={isLayoutEditMode ? 'pomodoro-timer pomodoro-timer--editable' : 'pomodoro-timer'} style={{ width: timerWidth }}>
      <CircularProgressbar
        value={percentage}
        text={`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
        styles={buildStyles({
          textColor: '#fff',
          pathColor: pathColor,
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
        Completed work sessions: {workSessionCount}
      </div>
      <div className="pomodoro-actions">
        <button className="pomodoro-button" onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
        <button className="pomodoro-button" onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

export default PomodoroTimer;