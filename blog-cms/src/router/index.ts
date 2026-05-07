import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/features/auth/views/Index.vue"),
    meta: { layout: "AuthLayout", guestOnly: true },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/features/home/views/Index.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
  {
    path: "/portfolios",
    name: "Portfolios",
    component: () => import("@/features/portfolio/views/PortfolioList.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
  {
    path: "/resumes",
    name: "Resumes",
    component: () => import("@/features/resume/views/ResumeList.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/features/profile/views/ProfileSettings.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
  {
    path: "/api-docs",
    name: "ApiDocs",
    component: () => import("@/features/public/views/ApiDocs.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'Home' }
  }

  return true
})

export default router
