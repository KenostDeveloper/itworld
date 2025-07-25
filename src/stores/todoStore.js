import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'todo_app_data';

// Загрузка из LocalStorage
const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  projects: [],
  filters: { statuses: [], tags: [], search: '' }
};

export const tasks = ref(savedData.projects);
export const filters = ref(savedData.filters);

// Автосохранение при изменении
watch([tasks, filters], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    projects: tasks.value,
    filters: filters.value
  }));
}, { deep: true });

// Добавление задачи
export function addTask(title, status = 'todo', tags = []) {
  tasks.value.push({
    id: uuidv4(),
    title,
    status,
    tags,
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
}