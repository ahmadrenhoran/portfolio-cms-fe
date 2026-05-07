<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import Navbar from '@/components/Navbar.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const baseUrl = window.location.origin
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const username = computed(() => authStore.user?.username || 'username')

const publicUrl = computed(() => `${apiBaseUrl}/api/v1/public/${username.value}`)

const copiedField = ref<string | null>(null)

function copyToClipboard(text: string, field: string) {
  navigator.clipboard.writeText(text)
  copiedField.value = field
  setTimeout(() => {
    if (copiedField.value === field) copiedField.value = null
  }, 2000)
}

const endpoints = [
  {
    name: 'Get Portfolios',
    method: 'GET',
    path: '/portfolio',
    description: 'Fetch all portfolios for this user. Supports multi-language description via `?lang=id|en`.',
    query: [{ name: 'lang', desc: 'id | en (default: en)' }]
  },
  {
    name: 'Get CV / Resume',
    method: 'GET',
    path: '/cv',
    description: 'Fetch the primary or latest resume document.'
  },
  {
    name: 'Get Blog Posts',
    method: 'GET',
    path: '/blog',
    description: 'Fetch all published blog posts.'
  },
  {
    name: 'Get Blog Detail',
    method: 'GET',
    path: '/blog/:slug',
    description: 'Fetch a specific blog post by its slug.'
  }
]

const getCurl = (path: string) => `curl "${publicUrl.value}${path}"`
const getFetch = (path: string) => `fetch("${publicUrl.value}${path}")
  .then(res => res.json())
  .then(data => console.log(data))`

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-stone-950 text-stone-300 selection:bg-amber-400 selection:text-stone-950">
    <!-- Glitchy background effect -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3e3e3e_0%,transparent_100%)]"></div>
      <div class="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>
    </div>

    <Navbar :user-name="authStore.user?.name" @logout="logout" />

    <main class="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <header class="mb-16">
        <div class="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          System Status: Operational
        </div>
        <h1 class="font-serif text-5xl font-bold tracking-tighter text-white sm:text-6xl" :data-text="`API Documentation`">
          API Documentation
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-stone-400">
          Build your own portfolio website using our Headless API. Complete control over your data, localized and ready for production.
        </p>
        
        <div class="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
          <div class="text-xs font-bold uppercase tracking-widest text-stone-500">Base URL</div>
          <code class="text-amber-300 font-mono text-sm break-all">{{ publicUrl }}</code>
          <button 
            @click="copyToClipboard(publicUrl, 'base')"
            class="ml-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-stone-400 hover:text-white"
          >
            <svg v-if="copiedField !== 'base'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </header>

      <div class="space-y-20">
        <section v-for="ep in endpoints" :key="ep.path" class="group">
          <div class="flex flex-col lg:flex-row gap-10">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4">
                <span class="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">{{ ep.method }}</span>
                <h3 class="text-xl font-bold text-white">{{ ep.name }}</h3>
              </div>
              <p class="text-stone-400 leading-relaxed mb-6">{{ ep.description }}</p>
              
              <div v-if="ep.query" class="mb-6">
                 <h4 class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Query Parameters</h4>
                 <div class="space-y-2">
                    <div v-for="q in ep.query" :key="q.name" class="flex items-center gap-4 text-sm">
                       <code class="text-amber-200">{{ q.name }}</code>
                       <span class="text-stone-500"> — </span>
                       <span>{{ q.desc }}</span>
                    </div>
                 </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-widest text-stone-600">Endpoint</span>
                <code class="text-sm text-white">{{ ep.path }}</code>
              </div>
            </div>

            <div class="flex-1 max-w-full overflow-hidden">
               <div class="rounded-2xl border border-white/5 bg-stone-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
                  <div class="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                     <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Request Example</span>
                     <div class="flex gap-2">
                        <div class="h-2 w-2 rounded-full bg-red-500/20"></div>
                        <div class="h-2 w-2 rounded-full bg-amber-500/20"></div>
                        <div class="h-2 w-2 rounded-full bg-emerald-500/20"></div>
                     </div>
                  </div>
                  <div class="p-4 space-y-4">
                     <div>
                        <div class="flex items-center justify-between mb-2">
                           <span class="text-[10px] font-bold text-stone-600">cURL</span>
                           <button @click="copyToClipboard(getCurl(ep.path), ep.path + 'curl')" class="text-stone-500 hover:text-white transition">
                              <svg v-if="copiedField !== ep.path + 'curl'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              <span v-else class="text-[10px] text-emerald-400">Copied</span>
                           </button>
                        </div>
                        <pre class="text-[11px] leading-relaxed text-stone-300 overflow-x-auto whitespace-pre-wrap break-all bg-black/30 p-3 rounded-lg border border-white/5"><code>{{ getCurl(ep.path) }}</code></pre>
                     </div>
                     <div>
                        <div class="flex items-center justify-between mb-2">
                           <span class="text-[10px] font-bold text-stone-600">Fetch API</span>
                           <button @click="copyToClipboard(getFetch(ep.path), ep.path + 'fetch')" class="text-stone-500 hover:text-white transition">
                              <svg v-if="copiedField !== ep.path + 'fetch'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              <span v-else class="text-[10px] text-emerald-400">Copied</span>
                           </button>
                        </div>
                        <pre class="text-[11px] leading-relaxed text-amber-100/80 overflow-x-auto whitespace-pre-wrap bg-black/30 p-3 rounded-lg border border-white/5"><code>{{ getFetch(ep.path) }}</code></pre>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          <div class="mt-12 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </section>
      </div>

      <footer class="mt-32 pt-16 border-t border-white/5 text-center">
         <p class="text-sm text-stone-600 italic">"Design is not just what it looks like and feels like. Design is how it works." — SJ</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:deep(body) {
  font-family: 'Space Grotesk', sans-serif;
}

.glitch {
  position: relative;
  text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
    -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
    0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  animation: glitch 1500ms infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
      -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
      -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
      -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
      -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
      0.05em 0 0 rgba(0, 255, 0, 0.75),
      0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
      0.05em 0 0 rgba(0, 255, 0, 0.75),
      0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
      -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
      -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
}
</style>
