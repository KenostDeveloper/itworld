<template>
  <div>
    <!-- Основной блок с текстом задачи -->
    <div class="flex bg-[#FFF] px-[12px] py-[20px] rounded-[8px] border-[#ECECEC] border">
      <CheckCircle
        :key="this.task?.status"
        class="mr-[12px] mt-[4px] flex-shrink-0"
        :active="this.task?.status === 'done'"
        @click.stop="updateStatus(this.task?.status === 'done' ? 'todo' : 'done')"
      />
      
      <!-- Режим просмотра -->
      <div 
        v-if="!isEditing" 
        ref="textDisplay"
        class="w-full cursor-text text-[20px] leading-[125%] font-medium whitespace-pre-wrap break-words"
        :style="textDisplayStyle"
        @click="startEditing"
      >
        <span v-html="highlightLinks(localTask.title)"></span>
      </div>
      
      <!-- Режим редактирования -->
      <textarea 
        v-else
        maxlength="500"
        ref="textarea"
        v-model="localTask.title" 
        class="w-full bg-transparent text-[#1D1D1D] text-[20px] leading-[125%] font-medium border-none focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
        :style="textDisplayStyle"
        @blur="stopEditing"
        @keydown.enter.exact.prevent="stopEditing"
        @input="handleInput"
        spellcheck="false"
        rows="1"
      ></textarea>
    </div>
    
    <!-- Блок для добавления хэштегов -->
    <div class="flex flex-col bg-[#FFF] px-[12px] py-[20px] rounded-[8px] border-[#ECECEC] border mt-[12px]">
      <div class="mb-[8px] font-medium">Теги</div>
      <HashtagInput
        :initial-tags="localTask.tags"
        :all-available-tags="allUniqueTags"
        @tags-updated="updateTags"
      />
    </div>

    <!-- Остальные кнопки управления -->
    <div 
        v-if="localTask.status == 'todo'" 
        class="flex items-center bg-[#FFF] px-[12px] py-[12px] rounded-[8px] border-[#ECECEC] border mt-[12px] gap-[8px] text-[#636363] cursor-pointer"
        @click="updateStatus('in-progress')"
    >
        <Play :stroke-width="1.25" :size="20" />
        <div>Начать выполнение</div>
    </div>

    <div 
        v-else-if="localTask.status == 'in-progress'" 
        class="flex items-center bg-[#FFF] px-[12px] py-[12px] rounded-[8px] border-[#ECECEC] border mt-[12px] gap-[8px] text-[#636363] cursor-pointer"
        @click="updateStatus('todo')"
    >
        <Pause :stroke-width="1.25" />
        <div>Остановить выполнение</div>
    </div>
    
    <!-- Список подзадач -->
    <div v-if="localTask.subtasks && localTask.subtasks.length > 0" class="mt-[16px] space-y-[12px]">
      <div class="mb-[8px] font-medium">Подзадачи</div>
      <div 
        v-for="subtask in localTask.subtasks" 
        :key="subtask.id"
        class="flex items-center bg-[#FFF] px-[12px] py-[12px] rounded-[8px] border-[#ECECEC] border gap-[8px]"
      >
        <CheckCircle
          class="flex-shrink-0"
          :active="subtask.status === 'done'"
          @click.stop="toggleSubtaskStatus(subtask)"
        />
        <div class="flex-1">{{ subtask.title }}</div>
        <Trash2 
          :stroke-width="1" 
          :size="16" 
          class="text-[#636363] cursor-pointer hover:text-[#ff3b30]"
          @click.stop="removeSubtask(subtask.id)"
        />
      </div>
    </div>
    
    <!-- Добавление новой подзадачи (только для основных задач) -->
    <div v-if="!isAddingSubtask && !isSubtask" class="mt-[12px]">
      <div 
        class="flex items-center bg-[#FFF] px-[12px] py-[12px] rounded-[8px] border-[#ECECEC] border gap-[8px] text-[#636363] cursor-pointer"
        @click="startAddingSubtask"
      >
        <Plus :stroke-width="1.25" :size="20" />
        <div>Добавить подзадачу</div>
      </div>
    </div>
    <div v-else-if="!isSubtask" class="mt-[12px]">
      <div class="flex items-center bg-[#FFF] px-[12px] py-[12px] rounded-[8px] border-[#ECECEC] border gap-[8px]">
        <input
          ref="subtaskInput"
          v-model="newSubtaskTitle"
          type="text"
          class="flex-1 border-none focus:outline-none"
          placeholder="Введите название подзадачи"
          @keydown.enter="addSubtask"
          @blur="addSubtask"
        />
      </div>
    </div>

    <div class="flex items-center h-[46px] absolute bottom-0 w-full justify-between left-0 border-t-[#ECECEC] border-t">
        <div class="flex justify-center w-[calc(100%-46px)] text-[#636363] text-[14px]">
            Созданно: {{ formatDate(localTask.createdAt) }}
        </div>
        <div @click="deleteTask()" class="w-[46px] h-full flex items-center justify-center hover:bg-[#ECECEC] cursor-pointer">
            <Trash2 :stroke-width="1" :size="20" />
        </div>
    </div>
  </div>
</template>

<script>
import CheckCircle from './CheckCircle.vue'
import HashtagInput from './HashtagInput.vue'
import { Trash2, Play, Pause, Plus } from 'lucide-vue-next';

export default {
  components: { CheckCircle, HashtagInput, Trash2, Play, Pause, Plus },
  props: {
    task: Object,
    allTasks: {
      type: Array,
      default: () => []
    },
    isSubtask: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localTask: {
        ...this.task,
        tags: [...(this.task.tags || [])],
        subtasks: [...(this.task.subtasks || [])]
      },
      isEditing: false,
      isAddingSubtask: false,
      newSubtaskTitle: '',
      textDisplayStyle: {
        fontFamily: 'inherit',
        fontSize: '20px',
        lineHeight: '125%',
        padding: '0',
        margin: '0'
      }
    }
  },
  computed: {
    allUniqueTags() {
      const allTags = this.allTasks
        .filter(t => t.id !== this.task.id)
        .flatMap(t => t.tags || [])
      return [...new Set(allTags)]
    }
  },
  methods: {
    highlightLinks(text) {
      if (!text) return ''
      const div = document.createElement('div')
      div.textContent = text
      const escapedText = div.innerHTML
      
      return escapedText
        .replace(
          /(\b(https?:\/\/|www\.)[^\s<]+)/gi, 
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#5972EF] hover:underline">$1</a>'
        )
    },
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const day = date.getDate()
      const month = date.toLocaleString('ru-RU', { month: 'long' })
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day} ${month} в ${hours}:${minutes}`
    },
    updateTextStyles() {
      if (this.$refs.textDisplay) {
        const style = window.getComputedStyle(this.$refs.textDisplay)
        this.textDisplayStyle = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          padding: style.padding,
          margin: style.margin
        }
      }
    },
    startEditing(e) {
      if (e.target.tagName === 'A') return
      this.isEditing = true
      this.$nextTick(() => {
        this.$refs.textarea.focus()
        this.autoResize()
      })
    },
    stopEditing() {
      this.isEditing = false
      this.$emit('update-task', this.localTask)
    },
    handleInput() {
      this.autoResize()
      requestAnimationFrame(this.autoResize)
    },
    autoResize() {
      const textarea = this.$refs.textarea
      if (!textarea) return
      
      const cursorPosition = textarea.selectionStart
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    },
    updateTags(updatedTags) {
      this.localTask.tags = updatedTags
      this.$emit('update-task', this.localTask)
    },
    deleteTask() {
      this.$emit('delete-task', this.localTask)
    },
    updateStatus(status) {
      console.log(status)
      this.localTask.status = status;
      this.localTask.updatedAt = new Date();
      this.$emit('update-task', this.localTask);
    },
    // Методы для работы с подзадачами
    startAddingSubtask() {
      this.isAddingSubtask = true
      this.newSubtaskTitle = ''
      this.$nextTick(() => {
        this.$refs.subtaskInput.focus()
      })
    },
    addSubtask() {
      if (this.newSubtaskTitle.trim()) {
        const newSubtask = {
          id: this.generateId(),
          title: this.newSubtaskTitle,
          status: 'todo',
          tags: [],
          subtasks: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        if (!this.localTask.subtasks) {
          this.localTask.subtasks = []
        }
        
        this.localTask.subtasks.push(newSubtask)
        this.$emit('update-task', this.localTask)
      }
      
      this.isAddingSubtask = false
      this.newSubtaskTitle = ''
    },
    removeSubtask(subtaskId) {
      this.localTask.subtasks = this.localTask.subtasks.filter(t => t.id !== subtaskId)
      this.$emit('update-task', this.localTask)
    },
    toggleSubtaskStatus(subtask) {
      subtask.status = subtask.status === 'done' ? 'todo' : 'done'
      subtask.updatedAt = new Date()
      this.$emit('update-task', this.localTask)
    },
    generateId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}
</script>

<style scoped>
.text-display, textarea {
  font-family: inherit;
  font-size: 20px;
  line-height: 125%;
  letter-spacing: normal;
  word-spacing: normal;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1em;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

a {
  pointer-events: auto;
  color: #5972EF;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>