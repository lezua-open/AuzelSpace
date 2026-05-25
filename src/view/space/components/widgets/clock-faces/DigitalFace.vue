<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ now: Date }>()

const hours = computed(() => String(props.now.getHours()).padStart(2, '0'))
const minutes = computed(() => String(props.now.getMinutes()).padStart(2, '0'))
const seconds = computed(() => String(props.now.getSeconds()).padStart(2, '0'))
</script>

<template>
  <div class="size-45 flex items-center justify-center">
    <span class="text-[36px] font-light tabular-nums text-foreground dark:text-foreground/80">
      {{ hours }}:{{ minutes }}:{{ seconds }}
    </span>
  </div>
</template>
