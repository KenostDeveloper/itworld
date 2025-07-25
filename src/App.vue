<template>
  <div class="h-dvh w-dvw flex overflow-hidden">
    <div class="bg-[#5972EF] px-16 transition-all max-xl:w-full max-sm:px-2" :class="menu ? 'w-[calc(100%-430px)]' : 'w-full'">
      <div class="flex items-center justify-between mt-8 mb-2 max-sm:mt-4">
        <div class="text-[32px] font-medium text-[#FFF] max-sm:text-[20px]">Todo-лист</div>
        <div class="flex gap-2">
          <button
            @click="exportData"
            class="flex items-center justify-center h-10 px-3 bg-white/70 hover:bg-white/90 rounded-[8px] transition-all cursor-pointer max-sm:h-8 max-sm:text-[14px]"
          >
            <Download :size="18" class="mr-2 max-sm:mr-0" /> <span class="max-sm:hidden">Экспорт</span>
          </button>
          <button
            @click="triggerFileInput"
            class="flex items-center justify-center h-10 px-3 bg-white/70 hover:bg-white/90 rounded-[8px] transition-all cursor-pointer max-sm:h-8 max-sm:text-[14px]"
          >
            <Upload :size="18" class="mr-2 max-sm:mr-0" /> <span class="max-sm:hidden">Импорт</span>
          </button>
          <input
            type="file"
            ref="fileInput"
            accept=".token"
            @change="importData"
            class="hidden"
          />
        </div>
      </div>

      <!-- Фильтры и поиск -->
      <div class="flex gap-2 mb-6 flex-col lg:flex-row">
        <!-- Поле поиска -->
        <div class="relative h-10 sm:h-12 w-full lg:w-3/5 xl:w-2/3 2xl:w-1/2">
          <div class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-[1]">
            <Search :size="18" :stroke-width="0.6" color="#000" class="sm:w-5 sm:h-5 w-4 h-4" />
          </div>
          <input
            v-model="filters.search"
            placeholder="Поиск задач..." 
            type="text"
            class="h-full w-full bg-white/70 backdrop-blur-md rounded-lg sm:rounded-[8px] pl-9 sm:pl-12 pr-4 text-sm sm:text-base text-[#000] placeholder:text-[#000] focus:outline-none focus:bg-white transition-all"
            @input="saveFilters"
          />
        </div>
        
        <!-- Фильтры и кнопка -->
        <div class="w-full flex xs:flex-row gap-2 lg:w-2/5 xl:w-1/3 2xl:w-1/2 max-sm:flex-col">
          <Dropdown
            class="h-10 xs:flex-1 min-w-[120px] max-w-full max-sm:text-sm"
            v-model="filters.statuses"
            :options="statusOptions"
            multiple
            placeholder="Статусы"
            @update:modelValue="saveFilters"
          />
          
          <Dropdown
            class="h-10 xs:flex-1 min-w-[120px] max-w-full max-sm:text-sm"
            v-model="filters.tags"
            :options="tagOptions"
            multiple
            searchable
            placeholder="Теги"
            @update:modelValue="saveFilters"
          />

          <button
            @click="resetFilters"
            class="h-12 px-3 sm:px-4 bg-white/70 hover:bg-white/90 rounded-lg sm:rounded-[8px] transition-all flex items-center justify-center max-sm:h-10"
            :class="{ 'opacity-50 cursor-default': !hasActiveFilters }"
            :disabled="!hasActiveFilters"
          >
            <X :size="16" :stroke-width="2" color="#000" class="sm:w-4 sm:h-4 w-3.5 h-3.5" />
            <span class="ml-1.5 sm:ml-2 text-sm sm:text-base">Очистить</span>
          </button>
        </div>
      </div>
      
      <div class="overflow-y-auto h-[calc(100dvh-270px)] pr-2 scrollbar-thin text-[#FFF] flex flex-col justify-center items-center gap-2 max-lg:h-[calc(100dvh-320px)]" v-if="filteredTasks.length == 0">
        <img src="/epmty.svg" alt="">
        <div class="max-w-[400px] text-center">Ничего не найдено. Добавьте свою первую задачу или очистите список фильтров</div>
      </div>
      
      <!-- Список задач -->
      <div v-else class="overflow-y-auto h-[calc(100dvh-270px)] pr-2 scrollbar-thin max-lg:h-[calc(100dvh-320px)]">
        <div class="flex flex-col gap-2">
          <TaskItem 
            v-for="task in filteredTasks" 
            :key="task.id"
            :task="task"
            @update-status="updateTaskStatus"
            @task-selected="openTaskDetails"
          />
        </div>
      </div>
      
      <!-- Форма добавления задачи -->
      <div class="mt-[24px] pr-[8px] max-sm:mt-[8px]">
        <div class="relative h-[56px] w-full max-sm:h-10">
          <div class="absolute left-3 top-[50%] -translate-y-1/2 z-[1]">
            <Plus :size="28" :stroke-width="0.6" color="#000" />
          </div>
          <input
            maxlength="500"
            v-model="newTaskTitle"
            type="text"
            placeholder="Добавьте новую задачу"
            class="h-full w-full bg-white/70 backdrop-blur-md rounded-[8px] pl-12 pr-4 text-[#000] placeholder:text-[#000] focus:outline-none focus:bg-white transition-all max-sm:text-sm"
            @keyup.enter="addTask"
          />
        </div>
      </div>
    </div>
    
    <!-- Детали задачи -->
    <div class="bg-[#FAFAFA] h-dvh relative transition-all max-xl:fixed max-xl:right-0 max-xl:z-[10]" :class="menu ? 'w-[430px] max-sm:w-full' : 'w-0 hidden'">
      <div @click="menu = false" class="cursor-pointer absolute left-[-42px] top-[32px] w-[42px] h-[34px] rounded-l-full flex items-center justify-center bg-[#FFF] opacity-90 hover:opacity-80 transition-all max-sm:bg-transparent max-sm:right-0 max-sm:left-[unset] max-sm:top-2">
        <X
          color="#000"
          :size="20"
          :stroke-width="1.25"
        />
      </div>
      <div class="h-full overflow-y-auto scrollbar-thin px-[12px] py-[32px] max-sm:pt-[50px]">
        <TaskDetails
          :key="currentTaskDetails?.id"
          v-if="currentTaskDetails"
          :task="currentTaskDetails"
          :all-tasks="allTasksForTags"
          :is-subtask="isSubtask(currentTaskDetails)"
          @update-task="updateTask"
          @delete-task="deleteTask"
        />
      </div>
    </div>
  </div>
  
  <!-- Модальные окна -->
  <ModalAlert ref="modalAlert" />
  <PasswordModal 
    ref="passwordModal"
    @confirm="handlePasswordConfirm"
  />
</template>

<script>
import { X, Plus, Search, Download, Upload } from 'lucide-vue-next';
import TaskItem from './components/TaskItem.vue';
import TaskDetails from './components/TaskDetails.vue';
import Dropdown from './components/Dropdown.vue';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import ModalAlert from './components/ModalAlert.vue';
import PasswordModal from './components/PasswordModal.vue';

export default {
  name: 'App',
  components: { 
    TaskItem, TaskDetails, X, Plus, Search, Dropdown, 
    Download, Upload, ModalAlert, PasswordModal 
  },
  data() {
    return {
      menu: false,
      newTaskTitle: '',
      tasks: [],
      selectedTaskId: null,
      statusOptions: [
        { value: 'todo', label: 'Активна' },
        { value: 'in-progress', label: 'В процессе' },
        { value: 'done', label: 'Завершена' }
      ],
      filters: {
        statuses: [],
        tags: [],
        search: ''
      },
      pendingAction: null,
      importFile: null
    }
  },
  computed: {
    currentTaskDetails() {
      if (!this.selectedTaskId) return null;
      const task = this.findTaskById(this.selectedTaskId);
      return task ? JSON.parse(JSON.stringify(task)) : null;
    },
    allTasksForTags() {
      const allTasks = [];
      this.tasks.forEach(task => {
        allTasks.push({...task});
        if (task.subtasks) {
          task.subtasks.forEach(subtask => allTasks.push({...subtask}));
        }
      });
      return allTasks;
    },
    tagOptions() {
      const tags = new Set();
      this.allTasksForTags.forEach(task => {
        if (task.tags && task.tags.length) {
          task.tags.forEach(tag => tags.add(tag));
        }
      });
      return Array.from(tags).map(tag => ({ value: tag, label: tag }));
    },
    hasActiveFilters() {
      return (
        this.filters.search || 
        this.filters.statuses.length > 0 || 
        this.filters.tags.length > 0
      );
    },
    filteredTasks() {
      if (!Array.isArray(this.tasks)) return [];
      const result = [];
      
      this.tasks.forEach(task => {
        const taskMatches = this.taskMatchesFilters(task);
        let matchingSubtasks = [];
        
        if (task.subtasks) {
          matchingSubtasks = task.subtasks.filter(subtask => 
            this.taskMatchesFilters(subtask)
          );
        }
        
        if (taskMatches || matchingSubtasks.length > 0) {
          const taskCopy = {
            ...task,
            subtasks: taskMatches ? task.subtasks : matchingSubtasks,
            _showAsParent: !taskMatches && matchingSubtasks.length > 0
          };
          result.push(taskCopy);
        }
      });
      
      return result;
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    async exportData() {
      this.pendingAction = 'export';
      try {
        const password = await this.$refs.passwordModal.show({
          title: 'Шифрование данных',
          message: 'Введите пароль для шифрования:',
          confirmText: 'Зашифровать'
        });
        
        if (password) {
          await this.processExport(password);
        }
      } catch (error) {
        this.showError('Ошибка экспорта', error.message);
      }
    },

    async processExport(password) {
      this.showLoading('Шифрование данных...');
      
      try {
        const exportData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          tasks: this.tasks
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        const encryptedData = this.encryptData(jsonData, password);
        
        this.downloadFile(
          JSON.stringify(encryptedData),
          `todo_export_${new Date().toISOString().slice(0, 10)}.token`
        );
        
        this.showSuccess('Экспорт завершен', 'Файл успешно зашифрован и скачан');
      } catch (error) {
        this.showError('Ошибка экспорта', error.message);
      }
    },

    async importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        this.pendingAction = 'import';
        const fileContent = await this.readFile(file);
        const encryptedData = JSON.parse(fileContent);
        
        if (encryptedData.version !== '1.0') {
          throw new Error('Неподдерживаемая версия файла');
        }

        const password = await this.$refs.passwordModal.show({
          title: 'Дешифрование данных',
          message: 'Введите пароль для расшифровки:',
          confirmText: 'Расшифровать'
        });

        if (!password) {
          event.target.value = '';
          return;
        }

        const decryptedData = await this.decryptData(encryptedData, password);
        const parsedData = JSON.parse(decryptedData);

        if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
          throw new Error('Некорректный формат данных');
        }

        const confirmed = await this.confirmAction(
          'Подтверждение импорта',
          `Найдено ${parsedData.tasks.length} задач. Заменить текущие данные?`,
          'Заменить'
        );

        if (confirmed) {
          this.tasks = parsedData.tasks;
          this.saveTasks();
          this.selectedTaskId = null;
          this.showSuccess('Импорт завершен', `Успешно импортировано ${this.tasks.length} задач!`);
        }
      } catch (error) {
        this.showError('Ошибка импорта', error.message);
      } finally {
        event.target.value = '';
      }
    },

    encryptData(data, password) {
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 1000
      });
      
      const iv = CryptoJS.lib.WordArray.random(128/8);
      const encrypted = CryptoJS.AES.encrypt(data, key, { 
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      return {
        salt: salt.toString(),
        iv: iv.toString(),
        ciphertext: encrypted.toString(),
        version: '1.0'
      };
    },

    async decryptData(encryptedData, password) {
      try {
        const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
        const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
        const key = CryptoJS.PBKDF2(password, salt, {
          keySize: 256/32,
          iterations: 1000
        });

        const decrypted = CryptoJS.AES.decrypt(
          encryptedData.ciphertext, 
          key, 
          { 
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
          }
        );

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
          throw new Error('Неверный пароль');
        }

        return decryptedText;
      } catch (error) {
        throw new Error('Ошибка дешифровки. Убедитесь, что вы ввели верный пароль');
      }
    },

    downloadFile(content, filename) {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    },

    async readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsText(file);
      });
    },

    showLoading(message) {
      this.$refs.modalAlert.show({
        title: 'Пожалуйста, подождите',
        message: message,
        noButtons: true
      });
    },

    showSuccess(title, message) {
      this.$refs.modalAlert.show({
        title: title,
        message: message
      });
    },

    showError(title, message) {
      this.$refs.modalAlert.show({
        title: title || 'Ошибка',
        message: message || 'Произошла неизвестная ошибка'
      });
    },

    async confirmAction(title, message, confirmText) {
      return await this.$refs.modalAlert.show({
        title: title,
        message: message,
        showCancel: true,
        confirmText: confirmText || 'Подтвердить'
      });
    },

    // Остальные методы управления задачами
    taskMatchesFilters(task) {
      const matchesStatus = this.filters.statuses.length === 0 || 
        this.filters.statuses.includes(task.status);
      const matchesTags = this.filters.tags.length === 0 || 
        (task.tags && task.tags.some(tag => this.filters.tags.includes(tag)));
      const matchesSearch = !this.filters.search || 
        task.title.toLowerCase().includes(this.filters.search.toLowerCase());
      return matchesStatus && matchesTags && matchesSearch;
    },

    loadTasks() {
      const savedTasks = localStorage.getItem('todo_app_data');
      this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    },

    loadFilters() {
      const savedFilters = localStorage.getItem('todo_app_filters');
      if (savedFilters) {
        this.filters = JSON.parse(savedFilters);
      }
    },

    saveFilters() {
      localStorage.setItem('todo_app_filters', JSON.stringify(this.filters));
    },

    saveTasks() {
      localStorage.setItem('todo_app_data', JSON.stringify(this.tasks));
    },

    isSubtask(task) {
      if (!task) return false;
      return this.tasks.some(t => t.subtasks && t.subtasks.some(s => s.id === task.id));
    },

    resetFilters() {
      this.filters = { statuses: [], tags: [], search: '' };
      this.saveFilters();
    },

    addTask() {
      if (!this.newTaskTitle.trim()) return;
      
      const tags = this.extractTags(this.newTaskTitle);
      const newTask = {
        id: uuidv4(),
        title: this.newTaskTitle,
        status: 'todo',
        tags,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.tasks.unshift(newTask);
      this.newTaskTitle = '';
      this.saveTasks();
    },

    extractTags(text) {
      const tags = [];
      const tagRegex = /#(\w+)/g;
      let match;
      while ((match = tagRegex.exec(text)) !== null) {
        tags.push(match[1]);
      }
      return tags;
    },

    openTaskDetails(task) {
      this.selectedTaskId = task.id;
      this.menu = true;
    },

    updateTaskStatus(statusData) {
      const task = this.findTaskById(statusData.id);
      if (task) {
        task.status = statusData.status;
        task.updatedAt = new Date();
        this.saveTasks();
      }
    },

    findTaskById(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) return task;
      
      for (const parentTask of this.tasks) {
        if (parentTask.subtasks) {
          const subtask = parentTask.subtasks.find(s => s.id === id);
          if (subtask) return subtask;
        }
      }
      return null;
    },

    findParentTask(subtaskId) {
      return this.tasks.find(task => 
        task.subtasks && task.subtasks.some(s => s.id === subtaskId)
      );
    },

    updateTask(updatedTask) {
      const taskIndex = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        updatedTask.updatedAt = new Date();
        this.tasks.splice(taskIndex, 1, updatedTask);
        this.saveTasks();
        return;
      }
      
      const parentTask = this.findParentTask(updatedTask.id);
      if (parentTask) {
        const subtaskIndex = parentTask.subtasks.findIndex(s => s.id === updatedTask.id);
        if (subtaskIndex !== -1) {
          updatedTask.updatedAt = new Date();
          parentTask.subtasks.splice(subtaskIndex, 1, updatedTask);
          parentTask.updatedAt = new Date();
          this.saveTasks();
        }
      }
    },

    async deleteTask(taskToDelete) {
      const confirmed = await this.confirmAction(
        'Удаление задачи',
        'Вы уверены, что хотите удалить эту задачу?',
        'Удалить'
      );

      if (!confirmed) return;

      this.tasks = this.tasks.filter(t => t.id !== taskToDelete.id);
      
      for (const task of this.tasks) {
        if (task.subtasks) {
          task.subtasks = task.subtasks.filter(s => s.id !== taskToDelete.id);
          if (task.subtasks.length === 0) {
            delete task.subtasks;
          }
        }
      }
      
      this.menu = false;
      this.saveTasks();
      this.showSuccess('Успешно', 'Задача была удалена');
    }
  },
  created() {
    this.loadTasks();
    this.loadFilters();
  }
}
</script>