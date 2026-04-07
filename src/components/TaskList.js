import React, { useState } from 'react';
import '../styles/TaskList.css';

function TaskList({ isLayoutEditMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTask = newTask.trim();
    if (!trimmedTask) {
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now(),
        text: trimmedTask,
        completed: false,
      },
    ]);
    setNewTask('');
  };

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  return (
    <section className={isLayoutEditMode ? 'task-list task-list--editable' : 'task-list'} aria-labelledby="task-list-title">
      <div className="task-list__header">
        <h2 id="task-list-title">Focus Tasks</h2>
        <p>Add the tasks you want to work through during this session.</p>
      </div>

      <form className="task-list__form" onSubmit={handleSubmit}>
        <input
          className="task-list__input"
          type="text"
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Add a task"
          aria-label="Add a task"
        />
        <button className="task-list__add-button" type="submit">
          Add Task
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="task-list__empty">No tasks yet. Add one to get started.</p>
      ) : (
        <ul className="task-list__items">
          {tasks.map((task) => (
            <li className="task-list__item" key={task.id}>
              <label className="task-list__label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.completed ? 'task-list__text task-list__text--completed' : 'task-list__text'}>
                  {task.text}
                </span>
              </label>
              <button
                className="task-list__remove-button"
                type="button"
                onClick={() => removeTask(task.id)}
                aria-label={`Remove ${task.text}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;