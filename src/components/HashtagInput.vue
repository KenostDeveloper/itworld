<template>
  <div class="w-full relative">
    <!-- Отображение текущих тегов -->
    <div class="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg">
      <span 
        v-for="(tag, index) in internalTags" 
        :key="tag"
        class="flex items-center px-3 py-1 bg-blue-100 text-[#5972EF] rounded-full text-sm"
      >
        {{ tag }}
        <button 
          @click="removeTag(index)" 
          class="ml-1 text-xs cursor-pointer"
        >
          <X
            color="#5972EF"
            :size="14"
            :stroke-width="1.25"
            />
        </button>
      </span>
      <input
        ref="tagInput"
        v-model="inputValue"
        type="text"
        class="flex-1 min-w-[100px] px-3 py-1 bg-transparent outline-none text-sm"
        placeholder="Добавить тег"
        @keydown.enter="addTag"
        @keydown.backspace="handleBackspace"
        @focus="showDropdown = true"
        @blur="hideDropdown"
      >
      <!-- Выпадающий список -->
      <div 
        v-if="showDropdown && filteredOptions.length"
        class="absolute z-10 mt-1 w-full top-[100%] left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <div
          v-for="option in filteredOptions"
          :key="option"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          @mousedown="selectOption(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { X } from 'lucide-vue-next';
export default {
  props: {
    // Начальные теги
    initialTags: {
      type: Array,
      default: () => []
    },
    // Все доступные теги
    allAvailableTags: {
      type: Array,
      default: () => []
    }
  },
  components: { X },
  data() {
    return {
      inputValue: '',
      showDropdown: false,
      internalTags: [...this.initialTags]
    }
  },
  computed: {
    filteredOptions() {
      const searchText = this.inputValue.toLowerCase()
      
      // Если ничего не введено, показываем все доступные варианты
      if (searchText === '') {
        return this.allAvailableTags.filter(tag => !this.internalTags.includes(tag))
      }
      
      // Фильтруем по введенному тексту
      return this.allAvailableTags.filter(tag => 
        tag.toLowerCase().includes(searchText) && 
        !this.internalTags.includes(tag)
      )
    }
  },
  watch: {
    initialTags(newVal) {
      this.internalTags = [...newVal]
    }
  },
  methods: {
    addTag() {
      const newTag = this.inputValue.trim()
      if (newTag && !this.internalTags.includes(newTag)) {
        this.internalTags.push(newTag)
        this.$emit('tags-updated', [...this.internalTags])
        this.inputValue = ''
        this.showDropdown = false
      }
    },
    
    removeTag(index) {
      this.internalTags.splice(index, 1)
      this.$emit('tags-updated', [...this.internalTags])
    },
    
    handleBackspace(e) {
      if (this.inputValue === '' && this.internalTags.length > 0) {
        this.internalTags.pop()
        this.$emit('tags-updated', [...this.internalTags])
      }
    },
    
    selectOption(option) {
      if (!this.internalTags.includes(option)) {
        this.internalTags.push(option)
        this.$emit('tags-updated', [...this.internalTags])
      }
      this.inputValue = ''
      this.showDropdown = false
    },
    
    hideDropdown() {
      setTimeout(() => {
        this.showDropdown = false
      }, 200)
    }
  }
}
</script>