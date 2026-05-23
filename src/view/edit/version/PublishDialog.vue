<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [name: string, note: string]
}>()

const name = ref('')
const note = ref('')

watch(() => props.open, (val) => {
  if (val) {
    name.value = ''
    note.value = ''
  }
})

function handleSubmit() {
  if (!name.value.trim()) return
  emit('submit', name.value.trim(), note.value.trim())
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleClose" />

        <!-- Dialog -->
        <div class="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <!-- Header -->
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">定稿</h2>
            <button
              class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="handleClose"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium">版本名称</label>
              <input
                v-model="name"
                type="text"
                placeholder="例如：v1.0、初稿完成"
                class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                autofocus
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium">备注说明 <span class="text-muted-foreground">(可选)</span></label>
              <textarea
                v-model="note"
                placeholder="描述这个版本的改动..."
                rows="3"
                class="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <p class="text-xs text-muted-foreground">
              定稿会保存当前内容的快照，并标记为已定稿版本。
            </p>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="rounded-md px-4 py-2 text-sm transition-colors hover:bg-accent"
                @click="handleClose"
              >
                取消
              </button>
              <button
                type="submit"
                class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="!name.trim()"
              >
                定稿
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active > div:last-child {
  transition: transform 0.2s ease;
}

.dialog-fade-enter-from > div:last-child {
  transform: scale(0.95);
}
</style>
