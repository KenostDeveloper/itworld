<template>
  <transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
        
        <div class="p-4">
          <p class="mb-4 text-gray-600">{{ message }}</p>
          
          <input
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            placeholder="Введите пароль"
            @keyup.enter="confirm"
          >
        </div>
        
        <div class="flex justify-end gap-3 p-4 bg-gray-50">
          <button
            @click="cancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
          >
            Отмена
          </button>
          <button
            @click="confirm"
            class="px-4 py-2 text-sm font-medium text-white bg-[#5972EF] rounded-md shadow-sm hover:bg-[#5972EF] cursor-pointer"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
      title: '',
      message: '',
      confirmText: 'OK',
      password: ''
    }
  },
  methods: {
    show(options) {
        this.title = options.title || '';
        this.message = options.message || '';
        this.confirmText = options.confirmText || 'OK';
        this.password = '';
        this.isVisible = true;
        
        return new Promise((resolve) => {
        this.resolve = resolve;
        });
    },
    confirm() {
        if (!this.password) return;
        this.isVisible = false;
        this.resolve(this.password);
        this.resolve = null;
    },
    cancel() {
        this.isVisible = false;
        if (this.resolve) {
        this.resolve(null);
        this.resolve = null;
        }
    }
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>