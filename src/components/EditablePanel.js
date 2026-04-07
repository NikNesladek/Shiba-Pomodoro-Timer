import React, { useEffect, useRef } from 'react';
import '../styles/EditablePanel.css';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function EditablePanel({
  children,
  title,
  panelId,
  isEditMode,
  bounds,
  minWidth,
  maxWidth,
  canvasWidth,
  canvasHeight,
  panelHeight,
  onChange,
  onMeasure,
}) {
  const panelRef = useRef(null);
  const interactionRef = useRef(null);
  const frameRef = useRef(null);
  const lastHeightRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current || !onMeasure) {
      return undefined;
    }

    const element = panelRef.current;
    const updateMeasure = () => {
      const rect = element.getBoundingClientRect();
      const roundedHeight = Math.round(rect.height);

      if (lastHeightRef.current === roundedHeight) {
        return;
      }

      lastHeightRef.current = roundedHeight;
      onMeasure(panelId, roundedHeight);
    };

    const scheduleMeasure = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        updateMeasure();
      });
    };

    updateMeasure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleMeasure);

      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
        window.removeEventListener('resize', scheduleMeasure);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      scheduleMeasure();
    });

    resizeObserver.observe(element);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isEditMode, onMeasure, panelId]);

  useEffect(() => {
    return () => {
      if (interactionRef.current) {
        document.removeEventListener('mousemove', interactionRef.current.handleMove);
        document.removeEventListener('mouseup', interactionRef.current.handleUp);
      }
    };
  }, []);

  const beginInteraction = (event, mode) => {
    if (!isEditMode || !bounds || !onChange) {
      return;
    }

    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startingBounds = bounds;

    const handleMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (mode === 'drag') {
        const nextX = clamp(startingBounds.x + deltaX, 0, Math.max(0, canvasWidth - startingBounds.width));
        const maxY = Math.max(0, canvasHeight - (panelHeight || 0) - 12);
        const nextY = clamp(startingBounds.y + deltaY, 0, maxY);

        onChange(panelId, {
          ...startingBounds,
          x: nextX,
          y: nextY,
        });
        return;
      }

      const nextWidth = clamp(startingBounds.width + deltaX, minWidth, Math.min(maxWidth, canvasWidth - startingBounds.x));

      onChange(panelId, {
        ...startingBounds,
        width: nextWidth,
      });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      interactionRef.current = null;
    };

    interactionRef.current = { handleMove, handleUp };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const panelStyle = bounds
    ? {
        left: `${bounds.x}px`,
        top: `${bounds.y}px`,
        width: `${bounds.width}px`,
      }
    : undefined;

  const className = isEditMode
    ? 'editable-panel editable-panel--positioned editable-panel--edit-mode'
    : bounds
      ? 'editable-panel editable-panel--positioned'
      : 'editable-panel';

  return (
    <section className={className} ref={panelRef} style={panelStyle}>
      {isEditMode ? (
        <div className="editable-panel__chrome" onMouseDown={(event) => beginInteraction(event, 'drag')}>
          <span className="editable-panel__title">{title}</span>
          <span className="editable-panel__hint">Drag</span>
        </div>
      ) : null}
      <div className="editable-panel__body">{children}</div>
      {isEditMode ? (
        <button
          className="editable-panel__resize-handle"
          type="button"
          onMouseDown={(event) => beginInteraction(event, 'resize')}
          aria-label={`Resize ${title}`}
        />
      ) : null}
    </section>
  );
}

export default EditablePanel;