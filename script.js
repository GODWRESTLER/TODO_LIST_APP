/**
 * Simple To-Do List App
 * MVP implementation with localStorage persistence
 */

class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.initializeElements();
    this.bindEvents();
    this.render();
  }

  initializeElements() {
    this.form = document.getElementById('todo-form');
    this.input = document.getElementById('task-input');
    this.tasksList = document.getElementById('tasks');
    this.emptyState = document.getElementById('empty-state');
    this.taskCount = document.getElementById('task-count');
    this.completedCount = document.getElementById('completed-count');
  }

  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Enter key in input
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTask();
      }
    });

    // Task interactions (checkbox and delete)
    this.tasksList.addEventListener('click', (e) => {
      console.log('Click event:', e.target);
      const taskElement = e.target.closest('.task');
      if (!taskElement) {
        console.log('No task element found');
        return;
      }

      const taskId = taskElement.dataset.taskId; // Keep as string
      console.log('Task ID:', taskId, 'type:', typeof taskId);

      // Check if clicked on checkbox or inside checkbox
      if (e.target.classList.contains('checkbox') || e.target.closest('.checkbox')) {
        console.log('Checkbox clicked');
        this.toggleTask(taskId);
      } else if (e.target.classList.contains('delete-btn')) {
        console.log('Delete button clicked');
        this.deleteTask(taskId);
      }
    });

    // Keyboard navigation
    this.tasksList.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const taskElement = e.target.closest('.task');
        if (taskElement) {
          const taskId = taskElement.dataset.taskId; // Keep as string
          if (e.target.classList.contains('checkbox')) {
            this.toggleTask(taskId);
          } else if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
          }
        }
      }
    });
  }

  loadTasks() {
    try {
      const stored = localStorage.getItem('todo-tasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error);
      return [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.warn('Failed to save tasks to localStorage:', error);
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.showNotification('Storage full! Please delete some tasks.', 'warning');
      }
    }
  }

  sanitizeInput(text) {
    // Basic XSS prevention
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  generateTaskId() {
    return (Date.now() + Math.random()).toString();
  }

  addTask() {
    const text = this.input.value.trim();
    if (!text) return;

    const sanitizedText = this.sanitizeInput(text);
    const newTask = {
      id: this.generateTaskId(),
      text: sanitizedText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask); // Add to beginning
    this.input.value = '';
    this.saveTasks();
    this.render();
    
    // Focus back to input for rapid task entry
    this.input.focus();
  }

  toggleTask(taskId) {
    console.log('toggleTask called with ID:', taskId, 'type:', typeof taskId);
    console.log('Available tasks:', this.tasks.map(t => ({ id: t.id, type: typeof t.id })));
    const task = this.tasks.find(t => t.id == taskId); // Use == instead of === for type coercion
    if (task) {
      console.log('Task found:', task);
      task.completed = !task.completed;
      console.log('Task completed status:', task.completed);
      this.saveTasks();
      this.render();
    } else {
      console.log('Task not found with ID:', taskId);
    }
  }

  deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.add('removing');
      
      setTimeout(() => {
        this.tasks = this.tasks.filter(t => t.id != taskId); // Use == for type coercion
        this.saveTasks();
        this.render();
      }, 300);
    }
  }

  render() {
    this.renderTasks();
    this.renderStats();
    this.renderEmptyState();
  }

  renderTasks() {
    this.tasksList.innerHTML = '';

    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task ${task.completed ? 'completed' : ''}`;
      li.dataset.taskId = task.id;
      li.setAttribute('role', 'listitem');

      li.innerHTML = `
        <div class="checkbox" 
             role="checkbox" 
             aria-checked="${task.completed}"
             tabindex="0"
             aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${task.text}">
          ${task.completed ? '✓' : ''}
        </div>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn" 
                aria-label="Delete task: ${task.text}"
                tabindex="0">
          🗑️
        </button>
      `;

      this.tasksList.appendChild(li);
    });
  }

  renderStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    
    this.taskCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
    this.completedCount.textContent = `${completedTasks} completed`;
  }

  renderEmptyState() {
    if (this.tasks.length === 0) {
      this.emptyState.style.display = 'block';
      this.tasksList.style.display = 'none';
    } else {
      this.emptyState.style.display = 'none';
      this.tasksList.style.display = 'block';
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'warning' ? '#f56565' : '#48bb78'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Public API methods for potential future extensions
  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.saveTasks();
    this.render();
  }

  clearAll() {
    if (confirm('Are you sure you want to delete all tasks?')) {
      this.tasks = [];
      this.saveTasks();
      this.render();
    }
  }

  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});

// Add some global CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
