import React, { useEffect, useMemo, useState } from 'react';
import './styles/App.css';
import PomodoroTimer from './components/PomodoroTimer';
import FullscreenButton from './components/FullscreenButton';
import TaskList from './components/TaskList';

function App() {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { timerPanelWidth, taskPanelWidth } = useMemo(() => {
    const layoutWidth = Math.min(1260, Math.max(760, viewportWidth - 32));
    const innerWidth = layoutWidth - 48;
    const gap = 24;
    const available = innerWidth - gap;

    const nextTimerWidth = Math.max(320, Math.min(520, Math.round(available * 0.42)));
    const nextTaskWidth = Math.max(360, Math.min(700, available - nextTimerWidth));

    return {
      timerPanelWidth: nextTimerWidth,
      taskPanelWidth: nextTaskWidth,
    };
  }, [viewportWidth]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="app-header__title-row">
          <h1>Pomodoro Timer</h1>
          <button className="app-header__info" type="button" aria-label="What is a Pomodoro timer?">
            i
            <span className="app-header__tooltip" role="tooltip">
              A Pomodoro timer breaks work into focused 25-minute sessions with short breaks to help you stay productive. Standard sessions are 25 minutes of work followed by a 5-minute break, and after every 4 work sessions, you get a longer 20-minute break.
            </span>
          </button>
        </div>
      </header>
      <main className="app-fixed-layout" aria-label="Pomodoro and tasks">
        <section className="app-fixed-layout__timer" style={{ width: `${timerPanelWidth}px` }}>
          <PomodoroTimer panelWidth={timerPanelWidth} isLayoutEditMode />
        </section>
        <section className="app-fixed-layout__tasks" style={{ width: `${taskPanelWidth}px` }}>
          <TaskList isLayoutEditMode />
        </section>
      </main>

      <FullscreenButton />
    </div>
  );
}

export default App;