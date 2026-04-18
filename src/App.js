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
              This timer cycles through 20 minutes of focus, then 5 minutes of summary time, then a normal 5-minute break to help you reset before the next session.
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