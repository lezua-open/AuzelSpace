<script setup lang="ts">
import { ref } from 'vue'
import { useGsap } from '@/composables/useGsap'

const { gsap, run } = useGsap()

// ── Demo 1: 基础补间动画 ──
const box1 = ref<HTMLElement | null>(null)
const box2 = ref<HTMLElement | null>(null)
const box3 = ref<HTMLElement | null>(null)

function playBasic() {
  run(() => {
    gsap.from(box1.value, { x: -120, opacity: 0, duration: 0.6, ease: 'power2.out' })
    gsap.from(box2.value, { y: 80, opacity: 0, duration: 0.6, delay: 0.15, ease: 'back.out(1.4)' })
    gsap.from(box3.value, { scale: 0, rotation: 180, duration: 0.8, delay: 0.3, ease: 'elastic.out(1, 0.5)' })
  })
}

// ── Demo 2: 时间线编排 ──
const tlBox1 = ref<HTMLElement | null>(null)
const tlBox2 = ref<HTMLElement | null>(null)
const tlBox3 = ref<HTMLElement | null>(null)
const tlBox4 = ref<HTMLElement | null>(null)

function playTimeline() {
  run(() => {
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.inOut' } })
    tl.from(tlBox1.value, { x: -100, opacity: 0 })
      .from(tlBox2.value, { y: -60, opacity: 0 }, '-=0.3')
      .from(tlBox3.value, { x: 100, opacity: 0 }, '-=0.3')
      .from(tlBox4.value, { scale: 0, opacity: 0 }, '-=0.2')
  })
}

// ── Demo 3: 弹性物理效果 ──
const springBox = ref<HTMLElement | null>(null)

function playSpring() {
  run(() => {
    gsap.from(springBox.value, {
      y: -200,
      opacity: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)',
    })
  })
}

// ── Demo 4: 鼠标跟随 ──
const followerRef = ref<HTMLElement | null>(null)
const areaRef = ref<HTMLElement | null>(null)

function setupFollower() {
  run(() => {
    const area = areaRef.value!
    const follower = followerRef.value!

    area.addEventListener('mousemove', (e) => {
      const rect = area.getBoundingClientRect()
      gsap.to(follower, {
        x: e.clientX - rect.left - 20,
        y: e.clientY - rect.top - 20,
        duration: 0.4,
        ease: 'power2.out',
      })
    })

    area.addEventListener('mouseleave', () => {
      gsap.to(follower, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    })
  })
}

// ── Demo 5: 文字逐字动画 ──
const textRef = ref<HTMLElement | null>(null)

function playText() {
  run(() => {
    const el = textRef.value!
    const chars = el.textContent!.split('')
    el.innerHTML = chars.map((c) => `<span class="inline-block">${c === ' ' ? '&nbsp;' : c}</span>`).join('')

    gsap.from(el.children, {
      opacity: 0,
      y: 40,
      rotationX: -90,
      stagger: 0.04,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
  })
}
</script>

<template>
  <div class="canvas-page">
    <h1 class="text-2xl font-bold mb-8">GSAP 动画示例</h1>

    <!-- Demo 1: 基础补间 -->
    <section class="demo-section">
      <h2 class="demo-title">基础补间动画</h2>
      <p class="demo-desc">from / to / ease / delay</p>
      <div class="flex items-center gap-6 mb-4">
        <div ref="box1" class="demo-box bg-blue-500">X</div>
        <div ref="box2" class="demo-box bg-emerald-500">Y</div>
        <div ref="box3" class="demo-box bg-amber-500">↻</div>
      </div>
      <button class="demo-btn" @click="playBasic">播放</button>
    </section>

    <!-- Demo 2: 时间线 -->
    <section class="demo-section">
      <h2 class="demo-title">时间线编排</h2>
      <p class="demo-desc">timeline / stagger / 偏移</p>
      <div class="flex items-center gap-4 mb-4">
        <div ref="tlBox1" class="demo-box bg-rose-500">1</div>
        <div ref="tlBox2" class="demo-box bg-violet-500">2</div>
        <div ref="tlBox3" class="demo-box bg-cyan-500">3</div>
        <div ref="tlBox4" class="demo-box bg-orange-500">4</div>
      </div>
      <button class="demo-btn" @click="playTimeline">播放</button>
    </section>

    <!-- Demo 3: 弹性效果 -->
    <section class="demo-section">
      <h2 class="demo-title">弹性物理效果</h2>
      <p class="demo-desc">elastic.out</p>
      <div class="flex justify-center mb-4 h-40">
        <div ref="springBox" class="demo-box demo-box-lg bg-fuchsia-500">Boing!</div>
      </div>
      <button class="demo-btn" @click="playSpring">播放</button>
    </section>

    <!-- Demo 4: 鼠标跟随 -->
    <section class="demo-section">
      <h2 class="demo-title">鼠标跟随</h2>
      <p class="demo-desc">mousemove + gsap.to</p>
      <div
        ref="areaRef"
        class="relative h-48 rounded-xl border-2 border-dashed border-muted-foreground/30 overflow-hidden mb-4"
        @mouseenter="setupFollower"
      >
        <div ref="followerRef" class="demo-box demo-box-sm bg-sky-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </section>

    <!-- Demo 5: 文字动画 -->
    <section class="demo-section">
      <h2 class="demo-title">文字逐字动画</h2>
      <p class="demo-desc">stagger + rotationX</p>
      <div class="mb-4 h-16 flex items-center">
        <span ref="textRef" class="text-3xl font-bold">Hello GSAP!</span>
      </div>
      <button class="demo-btn" @click="playText">播放</button>
    </section>
  </div>
</template>

<style scoped>
.canvas-page {
  padding: 2rem;
  max-width: 800px;
}

.demo-section {
  margin-bottom: 2.5rem;
}

.demo-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.demo-desc {
  font-size: 0.8rem;
  color: oklch(0.5 0 0);
  margin-bottom: 1rem;
}

.demo-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.15);
}

.demo-box-lg {
  width: 80px;
  height: 80px;
  font-size: 0.8rem;
}

.demo-box-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.demo-btn {
  padding: 0.4rem 1.2rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  background: oklch(0.95 0 0);
  color: oklch(0.2 0 0);
  border: 1px solid oklch(0.88 0 0);
  cursor: pointer;
  transition: background 0.15s;
}

.demo-btn:hover {
  background: oklch(0.9 0 0);
}

.dark .demo-btn {
  background: oklch(0.2 0 0);
  color: oklch(0.9 0 0);
  border-color: oklch(0.3 0 0);
}

.dark .demo-btn:hover {
  background: oklch(0.25 0 0);
}
</style>
