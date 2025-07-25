<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="handleOverlayClick"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <button
            @click="cancel"
            class="cursor-pointer p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-4 text-gray-600">
          <p>{{ message }}</p>
        </div>

        <div class="flex justify-end gap-3 p-4 bg-gray-50">
          <button
            v-if="showCancel"
            @click="cancel"
            class="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:bg-[#5972EF] focus:opacity-80 focus:ring-offset-2"
          >
            Отмена
          </button>
          <button
            @click="confirm"
            class="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-[#5972EF] border border-transparent rounded-md shadow-sm hover:bg-[#5972EF] hover:opacity-80 focus:outline-none focus:ring-2 focus:bg-[#5972EF] focus:opacity-80 focus:ring-offset-2"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { X } from 'lucide-vue-next'

export default {
  components: { X },
  data() {
    return {
      isVisible: false,
      title: '',
      message: '',
      showCancel: false,
      confirmText: 'OK',
      onConfirm: null,
      onCancel: null,
      closeOnOverlayClick: true
    }
  },
  methods: {
    show(options) {
      this.title = options.title || 'Уведомление'
      this.message = options.message || ''
      this.showCancel = options.showCancel || false
      this.confirmText = options.confirmText || 'OK'
      this.onConfirm = options.onConfirm || (() => {})
      this.onCancel = options.onCancel || (() => {})
      this.closeOnOverlayClick = options.closeOnOverlayClick !== false
      this.isVisible = true

      if (options.showCancel) {
        return new Promise((resolve) => {
          this.onConfirm = () => {
            this.close()
            resolve(true)
          }
          this.onCancel = () => {
            this.close()
            resolve(false)
          }
        })
      }
    },
    confirm() {
      if (this.onConfirm) this.onConfirm()
      this.close()
    },
    cancel() {
      if (this.onCancel) this.onCancel()
      this.close()
    },
    close() {
      this.isVisible = false
    },
    handleOverlayClick() {
      if (this.closeOnOverlayClick) {
        this.cancel()
      }
    }
  }
}
</script>