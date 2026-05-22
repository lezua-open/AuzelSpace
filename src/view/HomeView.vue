<script setup lang="ts">
import { AuroraBackground } from '@/components/ui/aurora-background'
import { PatternBackground } from '@/components/ui/pattern-background'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { LinkPreview } from '@/components/ui/link-preview'
import { BoxReveal } from '@/components/ui/box-reveal'



</script>

<template>
  <AuroraBackground>
    <!-- <InteractiveGridPattern
      class="inset-0 h-[100%] skew-y-12 mask-[radial-gradient(350px_circle_at_center,white,transparent)]" /> -->

    <PatternBackground class="flex h-[100%] w-full items-center justify-center" :animate="true" direction="top"
      :speed="25000" mask="ellipse" variant="dot" size="md">
      <div class="flex h-160 flex-col items-center justify-center px-4">
        <BoxReveal color="#E1251B" :duration="0.8">
          <p class="mx-auto max-w-3xl text-xl text-neutral-500 md:text-3xl dark:text-neutral-400">
            Welcome to
            <LinkPreview url="https://inspira-ui.com" :width="700" :height="500">
              <span class="bg-linear-to-br from-purple-500 to-pink-500 bg-clip-text font-bold text-transparent">
                Auzel
              </span>
            </LinkPreview>
            home space
          </p>
        </BoxReveal>
      </div>
      <!-- <TextHoverEffect class="w-[90%] lg:min-h-64" text="Auzel" /> -->
    </PatternBackground>




  </AuroraBackground>
</template>
