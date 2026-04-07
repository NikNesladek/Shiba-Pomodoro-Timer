import React, { useEffect, useState } from 'react';
import './styles/App.css';
import PomodoroTimer from './components/PomodoroTimer';
import FullscreenButton from './components/FullscreenButton';
import TaskList from './components/TaskList';
import EditablePanel from './components/EditablePanel';
import './styles/EditablePanel.css';

const DESKTOP_BREAKPOINT = 768;
const STORAGE_KEY = 'pomodoro-layout-v1';
const DESKTOP_UI_RESERVED_HEIGHT = 180;
const PANEL_LIMITS = {
  timer: { minWidth: 300, maxWidth: 520 },
  tasks: { minWidth: 340, maxWidth: 700 },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCanvasWidth(viewportWidth) {
  return Math.max(680, Math.min(1200, viewportWidth - 32));
}

function getDefaultLayout(canvasWidth) {
  const timerWidth = clamp(Math.min(420, canvasWidth - 96), PANEL_LIMITS.timer.minWidth, PANEL_LIMITS.timer.maxWidth);
  const tasksWidth = clamp(Math.min(540, canvasWidth - 96), PANEL_LIMITS.tasks.minWidth, PANEL_LIMITS.tasks.maxWidth);

  if (canvasWidth >= 980) {
    return {
      timer: {
        x: 48,
        y: 40,
        width: timerWidth,
      },
      tasks: {
        x: canvasWidth - tasksWidth - 48,
        y: 120,
        width: tasksWidth,
      },
    };
  }

  return {
    timer: {
      x: Math.max(24, Math.round((canvasWidth - timerWidth) / 2)),
      y: 32,
      width: timerWidth,
    },
    tasks: {
      x: Math.max(24, Math.round((canvasWidth - tasksWidth) / 2)),
      y: 440,
      width: tasksWidth,
    },
  };
}

function loadStoredLayout(canvasWidth) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return getDefaultLayout(canvasWidth);
    }

    const parsed = JSON.parse(saved);
    if (parsed.version !== 1 || !parsed.panels) {
      return getDefaultLayout(canvasWidth);
    }

    return parsed.panels;
  } catch (error) {
    return getDefaultLayout(canvasWidth);
  }
}

function clampLayout(layout, canvasWidth) {
  return {
    timer: {
      ...layout.timer,
      width: clamp(layout.timer.width, PANEL_LIMITS.timer.minWidth, Math.min(PANEL_LIMITS.timer.maxWidth, canvasWidth - 24)),
      x: clamp(layout.timer.x, 0, Math.max(0, canvasWidth - layout.timer.width)),
      y: Math.max(0, layout.timer.y),
    },
    tasks: {
      ...layout.tasks,
      width: clamp(layout.tasks.width, PANEL_LIMITS.tasks.minWidth, Math.min(PANEL_LIMITS.tasks.maxWidth, canvasWidth - 24)),
      x: clamp(layout.tasks.x, 0, Math.max(0, canvasWidth - layout.tasks.width)),
      y: Math.max(0, layout.tasks.y),
    },
  };
}

function clampPanelBounds(panelId, bounds, canvasWidth, canvasHeight, panelHeights) {
  const limits = PANEL_LIMITS[panelId];
  const maxAllowedWidth = Math.max(limits.minWidth, Math.min(limits.maxWidth, canvasWidth - 24));
  const width = clamp(bounds.width, limits.minWidth, maxAllowedWidth);
  const panelHeight = panelHeights[panelId] || 360;
  const maxY = Math.max(0, canvasHeight - panelHeight - 12);

  return {
    ...bounds,
    width,
    x: clamp(bounds.x, 0, Math.max(0, canvasWidth - width)),
    y: clamp(bounds.y, 0, maxY),
  };
}

function App() {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [panelHeights, setPanelHeights] = useState({ timer: 360, tasks: 420 });
  const canvasWidth = getCanvasWidth(viewportWidth);
  const [layout, setLayout] = useState(() => clampLayout(loadStoredLayout(canvasWidth), canvasWidth));
  const isDesktop = viewportWidth >= DESKTOP_BREAKPOINT;
  const canvasHeight = Math.max(520, viewportHeight - DESKTOP_UI_RESERVED_HEIGHT);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setLayout((currentLayout) => ({
      timer: clampPanelBounds('timer', currentLayout.timer, canvasWidth, canvasHeight, panelHeights),
      tasks: clampPanelBounds('tasks', currentLayout.tasks, canvasWidth, canvasHeight, panelHeights),
    }));
  }, [canvasWidth, canvasHeight, panelHeights]);

  useEffect(() => {
    if (!isDesktop && isLayoutEditMode) {
      setIsLayoutEditMode(false);
    }
  }, [isDesktop, isLayoutEditMode]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        panels: layout,
      })
    );
  }, [layout]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTypingTarget || !isDesktop) {
        return;
      }

      if (event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setIsLayoutEditMode((currentMode) => !currentMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktop]);

  const handlePanelChange = (panelId, nextBounds) => {
    setLayout((currentLayout) => ({
      ...currentLayout,
      [panelId]: clampPanelBounds(panelId, nextBounds, canvasWidth, canvasHeight, panelHeights),
    }));
  };

  const handlePanelMeasure = (panelId, height) => {
    setPanelHeights((currentHeights) => {
      if (currentHeights[panelId] === height) {
        return currentHeights;
      }

      return {
        ...currentHeights,
        [panelId]: height,
      };
    });
  };

  const handleResetLayout = () => {
    setLayout(getDefaultLayout(canvasWidth));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pomodoro Timer</h1>
      </header>
      <div className="app-layout-controls">
        <button
          className={isLayoutEditMode ? 'app-layout-controls__button app-layout-controls__button--active' : 'app-layout-controls__button'}
          type="button"
          onClick={() => isDesktop && setIsLayoutEditMode((currentMode) => !currentMode)}
          aria-pressed={isLayoutEditMode}
          disabled={!isDesktop}
        >
          {isLayoutEditMode ? 'Exit Layout Mode' : 'Layout Mode'}
        </button>
        <button
          className="app-layout-controls__button"
          type="button"
          onClick={handleResetLayout}
          disabled={!isDesktop}
        >
          Reset Layout
        </button>
        <span className="app-layout-controls__hint">
          {isDesktop ? 'Shift+R toggles layout editing' : 'Layout editing is disabled on small screens'}
        </span>
      </div>

      {isDesktop ? (
        <div className="app-layout-canvas" style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>
          <EditablePanel
            title="Timer"
            panelId="timer"
            isEditMode={isLayoutEditMode}
            bounds={layout.timer}
            minWidth={PANEL_LIMITS.timer.minWidth}
            maxWidth={PANEL_LIMITS.timer.maxWidth}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            panelHeight={panelHeights.timer}
            onChange={handlePanelChange}
            onMeasure={handlePanelMeasure}
          >
            <PomodoroTimer panelWidth={layout.timer.width} isLayoutEditMode />
          </EditablePanel>
          <EditablePanel
            title="Tasks"
            panelId="tasks"
            isEditMode={isLayoutEditMode}
            bounds={layout.tasks}
            minWidth={PANEL_LIMITS.tasks.minWidth}
            maxWidth={PANEL_LIMITS.tasks.maxWidth}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            panelHeight={panelHeights.tasks}
            onChange={handlePanelChange}
            onMeasure={handlePanelMeasure}
          >
            <TaskList isLayoutEditMode />
          </EditablePanel>
        </div>
      ) : (
        <div className="app-layout-stack">
          <div className="app-layout-stack__timer">
            <PomodoroTimer />
          </div>
          <TaskList />
        </div>
      )}

      <FullscreenButton />
    </div>
  );
}

export default App;