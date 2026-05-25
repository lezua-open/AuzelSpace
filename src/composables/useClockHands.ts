import { computed, type Ref } from 'vue'

export function useClockHands(now: Ref<Date>) {
  const hours = computed(() => now.value.getHours() % 12)
  const minutes = computed(() => now.value.getMinutes())
  const seconds = computed(() => now.value.getSeconds())
  const ms = computed(() => now.value.getMilliseconds())

  const hourDeg = computed(
    () => hours.value * 30 + minutes.value * 0.5 + seconds.value * (0.5 / 60),
  )
  const minuteDeg = computed(
    () => minutes.value * 6 + seconds.value * 0.1 + ms.value * (0.1 / 1000),
  )
  const secondDeg = computed(
    () => seconds.value * 6 + ms.value * (6 / 1000),
  )

  return { hours, minutes, seconds, ms, hourDeg, minuteDeg, secondDeg }
}
