import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/view/HomeView.vue'),
    },
    {
      path: '/space',
      component: () => import('@/view/space/index.vue'),
    },
    {
      path: '/edit',
      component: () => import('@/view/edit/index.vue'),
    },
    {
      path: '/canvas',
      component: () => import('@/view/canvas/index.vue'),
    },
  ],
})

export default router
