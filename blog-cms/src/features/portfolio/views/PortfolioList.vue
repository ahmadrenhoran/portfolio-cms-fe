<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import Navbar from '@/components/Navbar.vue'
import TextField from '@/components/forms/TextField.vue'
import DialogConfirm from '@/components/DialogConfirm.vue'
import { getErrorMessage, uploadSingleFile } from '@/utils/utils'
import {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  type Portfolio
} from '../services/portfolio.service'

const authStore = useAuthStore()
const router = useRouter()

const portfolios = ref<Portfolio[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  title: '',
  description_id: '',
  description_en: '',
  image_url: '',
  tech_stack: [] as string[],
  demo_url: '',
  repo_url: '',
  is_featured: false,
})

const techInput = ref('')
const activeLangTab = ref<'id' | 'en'>('en')

const confirmVisible = ref(false)
const confirmId = ref<number | null>(null)

async function fetchPortfolios() {
  loading.value = true
  try {
    const res = await getPortfolios()
    portfolios.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingId.value = null
  Object.assign(form, {
    title: '',
    description_id: '',
    description_en: '',
    image_url: '',
    tech_stack: [],
    demo_url: '',
    repo_url: '',
    is_featured: false,
  })
  showModal.value = true
}

function openEditModal(p: Portfolio) {
  editingId.value = p.id
  Object.assign(form, {
    title: p.title || '',
    description_id: p.description?.id || '',
    description_en: p.description?.en || '',
    image_url: p.image_url || '',
    tech_stack: p.tech_stack || [],
    demo_url: p.demo_url || '',
    repo_url: p.repo_url || '',
    is_featured: p.is_featured || false,
  })
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      ...form,
      description: {
        id: form.description_id,
        en: form.description_en
      }
    }
    if (editingId.value) {
      await updatePortfolio(editingId.value, payload)
    } else {
      await createPortfolio(payload)
    }
    showModal.value = false
    await fetchPortfolios()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const res = await uploadSingleFile(file)
    form.image_url = res.data.url
  } catch (e) {
    console.error(e)
  }
}

function addTech() {
  if (techInput.value.trim()) {
    form.tech_stack.push(techInput.value.trim())
    techInput.value = ''
  }
}

function removeTech(index: number) {
  form.tech_stack.splice(index, 1)
}

function askDelete(id: number) {
  confirmId.value = id
  confirmVisible.value = true
}

async function handleConfirmDelete() {
  if (!confirmId.value) return
  try {
    await deletePortfolio(confirmId.value)
    await fetchPortfolios()
  } catch (e) {
    console.error(e)
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(fetchPortfolios)
</script>

<template>
  <div class="min-h-screen bg-[#f7f1e8] text-stone-900">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]"></div>

    <Navbar :user-name="authStore.user?.name" @logout="logout" />

    <main class="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-stone-950">Portfolio</h1>
          <p class="mt-1 text-sm text-stone-500">Showcase your best projects to the world.</p>
        </div>
        <button 
          @click="openCreateModal"
          class="rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          + Add Portfolio
        </button>
      </div>

      <div v-if="loading" class="mt-12 flex justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900"></div>
      </div>

      <div v-else-if="portfolios.length === 0" class="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-[#fffaf4] p-12 text-center">
        <h2 class="font-serif text-2xl font-semibold text-stone-950">No portfolios yet</h2>
        <p class="mt-2 max-w-sm text-sm text-stone-500">Add your first project to display it on your public API.</p>
        <button @click="openCreateModal" class="mt-6 rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition">Add Project</button>
      </div>

      <div v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article 
          v-for="p in portfolios" 
          :key="p.id"
          class="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all hover:shadow-md"
        >
          <div class="relative h-48 overflow-hidden bg-stone-100">
            <img v-if="p.image_url" :src="p.image_url" alt="" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div v-else class="flex h-full items-center justify-center text-stone-300">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div v-if="p.is_featured" class="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-900 shadow-sm">
              Featured
            </div>
          </div>
          <div class="flex flex-1 flex-col p-5">
            <h3 class="font-serif text-xl font-semibold text-stone-950">{{ p.title || 'Untitled Project' }}</h3>
            <p class="mt-2 line-clamp-2 text-sm text-stone-500">{{ p.description?.en || p.description?.id || 'No description provided.' }}</p>
            
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span v-for="tech in p.tech_stack?.slice(0, 3)" :key="tech" class="rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-600">
                {{ tech }}
              </span>
              <span v-if="(p.tech_stack?.length || 0) > 3" class="rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-600">
                +{{ (p.tech_stack?.length || 0) - 3 }}
              </span>
            </div>

            <div class="mt-auto flex items-center justify-between gap-2 pt-6">
              <div class="flex gap-2">
                <a v-if="p.demo_url" :href="p.demo_url" target="_blank" class="text-stone-400 hover:text-stone-900 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                <a v-if="p.repo_url" :href="p.repo_url" target="_blank" class="text-stone-400 hover:text-stone-900 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></a>
              </div>
              <div class="flex gap-2">
                <button @click="openEditModal(p)" class="text-xs font-bold text-stone-600 hover:text-stone-950 transition">Edit</button>
                <button @click="askDelete(p.id)" class="text-xs font-bold text-red-500 hover:text-red-700 transition">Delete</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-8 shadow-2xl">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="font-serif text-2xl font-semibold text-stone-950">{{ editingId ? 'Edit Project' : 'New Project' }}</h2>
            <button @click="showModal = false" class="text-stone-400 hover:text-stone-900 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div class="space-y-5">
            <TextField v-model="form.title" label="Project Title" placeholder="e.g. Awesome SaaS Platform" />

            <!-- Description Tabs -->
            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-stone-700">Description</label>
                <div class="flex rounded-lg bg-stone-100 p-0.5">
                  <button 
                    @click="activeLangTab = 'en'" 
                    class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition rounded-md"
                    :class="activeLangTab === 'en' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400'"
                  >EN</button>
                  <button 
                    @click="activeLangTab = 'id'" 
                    class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition rounded-md"
                    :class="activeLangTab === 'id' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400'"
                  >ID</button>
                </div>
              </div>
              <textarea 
                v-if="activeLangTab === 'en'"
                v-model="form.description_en"
                rows="4"
                class="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                placeholder="Describe your project in English..."
              ></textarea>
              <textarea 
                v-else
                v-model="form.description_id"
                rows="4"
                class="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                placeholder="Jelaskan proyek Anda dalam Bahasa Indonesia..."
              ></textarea>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <TextField v-model="form.demo_url" label="Live Demo URL" placeholder="https://..." />
              <TextField v-model="form.repo_url" label="Repository URL" placeholder="https://github.com/..." />
            </div>

            <!-- Tech Stack -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-stone-700">Tech Stack</label>
              <div class="flex gap-2">
                <input 
                  v-model="techInput" 
                  @keydown.enter.prevent="addTech"
                  type="text" 
                  class="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                  placeholder="Press Enter to add (e.g. Vue.js)"
                />
                <button @click="addTech" class="rounded-2xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-900 hover:bg-stone-200 transition">Add</button>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="(tech, i) in form.tech_stack" :key="i" class="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
                  {{ tech }}
                  <button @click="removeTech(i)" class="text-white/50 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                </span>
              </div>
            </div>

            <!-- Image Upload -->
            <div>
               <label class="mb-2 block text-sm font-semibold text-stone-700">Project Image</label>
               <div v-if="form.image_url" class="relative mb-3 h-40 overflow-hidden rounded-2xl border border-stone-200">
                  <img :src="form.image_url" class="h-full w-full object-cover" />
                  <button @click="form.image_url = ''" class="absolute right-2 top-2 rounded-full bg-stone-950/50 p-1.5 text-white backdrop-blur-sm hover:bg-stone-950 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
               <input type="file" @change="handleFileChange" accept="image/*" class="block w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-stone-100 file:text-stone-900 hover:file:bg-stone-200 file:transition file:cursor-pointer" />
            </div>

            <div class="flex items-center gap-3">
              <input v-model="form.is_featured" type="checkbox" id="is_featured" class="h-5 w-5 rounded-lg border-stone-200 text-stone-900 focus:ring-stone-400" />
              <label for="is_featured" class="text-sm font-semibold text-stone-700">Feature this project on top</label>
            </div>

            <div class="pt-6">
              <button 
                @click="handleSave"
                :disabled="saving"
                class="w-full rounded-2xl bg-stone-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : (editingId ? 'Update Project' : 'Create Project') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <DialogConfirm 
      v-model="confirmVisible"
      title="Delete Project"
      message="Are you sure you want to delete this project? This action cannot be undone."
      confirm-text="Delete"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
