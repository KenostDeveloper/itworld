<template>
  <div>
    <div class="relative">
      <!-- Тени (только для родительских задач) -->
      <div 
        v-if="hasSubtasks && !isExpanded && task.subtasks.length > 1"
        class="h-full w-full bg-[#e0e0e0] rounded-[8px] absolute top-[6px] left-[5px] right-0 border-[#636363] border"
      ></div>
      <div
        v-if="hasSubtasks && !isExpanded"
        class="h-full w-full bg-[#f0f0f0] rounded-[8px] absolute top-[3px] left-[3px] right-0 border-[#636363] border"
      ></div>
      
      <!-- Основная карточка -->
      <div 
        class="min-h-[56px] w-full bg-[#FFF] rounded-[8px] flex px-[16px] py-[10px] items-center hover:bg-gray-50 transition-colors relative border-[#636363] border justify-between"
        @click="handleMainClick"
      > 
        <div class="flex items-start">
          <CheckCircle
            class="mr-[12px] mt-[4px]"
            :active="task.status === 'done'"
            @click.stop="toggleTaskStatus"
          />
      
          <div class="text-[16px] leading-[125%] w-full max-w-[calc(100%-32px)]">
            <span class="max-sm:text-[14px] block truncate" :class="task.status == 'done' ? 'line-through' : ''" v-html="highlightContent(task.title)"></span>
            
                <div class="flex flex-wrap gap-1 mt-1 overflow-hidden">
                    <span class="text-xs text-[#1D1D1D] rounded-full leading-[100%] flex-shrink-0 flex items-center justify-center">
                    {{ statusText }}
                    </span>
                    
                    <template v-for="tag in task.tags" :key="tag">
                    <span 
                        class="text-xs px-2 h-[18px] bg-[#5972EF]/10 text-[#5972EF] rounded-full leading-[100%] flex-shrink-0 flex items-center justify-center truncate max-w-[120px]"
                    >
                        #{{ tag }}
                    </span>
                    </template>
                </div>
            </div>
        </div>
        <div 
          v-if="hasSubtasks"
          class="cursor-pointer transition-transform" 
          :class="{'rotate-180': isExpanded}"
          @click.stop="toggleExpand"
        >
          <ChevronDown :stroke-width="1.25" />
        </div>
      </div>
    </div>

    <!-- Подзадачи -->
    <div v-if="isExpanded && hasSubtasks" class="mt-2 pl-6 space-y-2 max-sm:pl-3">
      <TaskItem
        v-for="subtask in task.subtasks"
        :key="subtask.id"
        :task="subtask"
        @task-selected="emitTaskSelected"
        @update-status="updateTaskStatus"
      />
    </div>
  </div>
</template>

<script>
import { ChevronDown } from 'lucide-vue-next';
import CheckCircle from './CheckCircle.vue';

export default {
  name: 'TaskItem',
  components: { CheckCircle, ChevronDown },
  props: {
    task: {
      type: Object,
      required: true,
      validator: (task) => {
        return (
          typeof task.id === 'string' &&
          typeof task.title === 'string' &&
          ['todo', 'in-progress', 'done'].includes(task.status) &&
          Array.isArray(task.tags) &&
          (task.subtasks ? Array.isArray(task.subtasks) : true)
        )
      }
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {
    hasSubtasks() {
      return this.task.subtasks?.length > 0;
    },
    statusText() {
      return {
        'todo': 'Активна',
        'in-progress': 'В процессе',
        'done': 'Завершена'
      }[this.task.status];
    }
  },
  methods: {
    handleMainClick() {
        this.emitTaskSelected(this.task);
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
    toggleTaskStatus() {
      const newStatus = this.task.status === 'done' ? 'todo' : 'done';
      this.$emit('update-status', {id: this.task?.id, status: newStatus});
    },
    updateTaskStatus(data){
        this.$emit('update-status', {id: data?.id, status: data?.status});
    },
    emitTaskSelected(task) {
      this.$emit('task-selected', task);
    },
    highlightContent(text) {
      const div = document.createElement('div');
      div.textContent = text;
      const escapedText = div.innerHTML;
      
      return escapedText
        .replace(
          /(\b(https?:\/\/|www\.)[^\s<]+)/gi, 
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#5972EF] hover:underline">$1</a>'
        );
    }
  }
}
</script>

<style>
.rotate-180 {
  transform: rotate(180deg);
}
</style>