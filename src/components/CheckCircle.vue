<template>
  <div 
    class="w-[20px] h-[20px] border rounded-full flex justify-center items-center transition-colors duration-200"
    :class="{
      'border-[#5972EF] bg-[#5972EF]': active,
      'border-[#000] hover:border-[#5972EF] cursor-pointer': !active
    }"
  >
    <Check 
      :stroke-width="1.2" 
      :width="12" 
      class="transition-opacity duration-200"
      :class="{
        'text-white opacity-100': active,
        'text-[#5972EF] opacity-0 hover:opacity-100': !active
      }"
    />
  </div>
</template>

<script>
import { Check } from 'lucide-vue-next';

export default {
  name: 'CheckCircle',
  components: { Check },
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>