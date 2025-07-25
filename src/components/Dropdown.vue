<template>
  <div class="relative w-full" @click.stop>
    <div 
      class="flex items-center justify-between h-[48px] px-4 bg-white/70 backdrop-blur-md rounded-[8px] cursor-pointer transition-all hover:bg-white/80 max-sm:h-10"
      @click="isOpen = !isOpen"
    >
      <span class="text-[#000] truncate">{{ selectedLabel }}</span>
      <ChevronDown 
        :size="16" 
        :stroke-width="2" 
        color="#000" 
        class="transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <!-- Выпадающий список -->
    <div 
      v-if="isOpen"
      class="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white rounded-[8px] shadow-lg border border-white/30"
      @click.stop
    >
      <!-- Поиск -->
      <div v-if="searchable" class="sticky top-0 p-2 bg-white">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск..."
          class="w-full p-2 text-sm border-b border-gray-100 focus:outline-none"
        />
      </div>

      <!-- Опции -->
      <div class="py-1">
        <div 
          v-for="option in filteredOptions"
          :key="option.value"
          class="px-4 py-2 cursor-pointer transition-colors hover:bg-gray-100 flex items-center"
          @click="toggleOption(option)"
        >
          <div 
            v-if="multiple"
            class="w-4 h-4 min-w-4 min-h-4 border border-gray-400 rounded-sm mr-2 flex items-center justify-center"
            :class="{ 'bg-[#5972EF] border-[#5972EF]': isSelected(option) }"
          >
            <Check v-if="isSelected(option)" :size="12" color="white" :stroke-width="3" />
          </div>
          <span class="text-[#000] truncate">{{ option.label }}</span>
        </div>

        <!-- Пустое состояние -->
        <div v-if="filteredOptions.length === 0" class="px-4 py-2 text-gray-500 text-sm">
          Ничего не найдено
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ChevronDown, Check } from 'lucide-vue-next';

export default {
  name: 'Dropdown',
  components: { ChevronDown, Check },
  props: {
    options: {
      type: Array,
      required: true,
      validator: value => value.every(opt => 'value' in opt && 'label' in opt)
    },
    multiple: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Выберите...'
    },
    modelValue: {
      type: [Array, String, Number],
      default: () => []
    }
  },
  data() {
    return {
      isOpen: false,
      searchQuery: ''
    };
  },
  computed: {
    filteredOptions() {
      if (!this.searchQuery) return this.options;
      const query = this.searchQuery.toLowerCase();
      return this.options.filter(opt => 
        opt.label.toLowerCase().includes(query) || 
        String(opt.value).toLowerCase().includes(query))
    },
    selectedLabel() {
      if (!this.modelValue || (Array.isArray(this.modelValue) && this.modelValue.length === 0)) {
        return this.placeholder;
      }

      if (this.multiple) {
        const selected = this.options.filter(opt => this.modelValue.includes(opt.value));
        if (selected.length === 0) return this.placeholder;
        if (selected.length === this.options.length) return 'Все выбраны';
        return selected.map(opt => opt.label).join(', ');
      } else {
        const selected = this.options.find(opt => opt.value === this.modelValue);
        return selected ? selected.label : this.placeholder;
      }
    }
  },
  methods: {
    isSelected(option) {
      return this.multiple 
        ? this.modelValue.includes(option.value)
        : this.modelValue === option.value;
    },
    toggleOption(option) {
      if (this.multiple) {
        const newValue = [...this.modelValue];
        const index = newValue.indexOf(option.value);
        
        if (index === -1) {
          newValue.push(option.value);
        } else {
          newValue.splice(index, 1);
        }
        
        this.$emit('update:modelValue', newValue);
      } else {
        this.$emit('update:modelValue', option.value);
        this.isOpen = false;
      }
    },
    closeDropdown() {
      this.isOpen = false;
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdown);
  }
};
</script>