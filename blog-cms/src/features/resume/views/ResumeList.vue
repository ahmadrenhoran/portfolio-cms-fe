<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import Navbar from '@/components/Navbar.vue'
import DialogConfirm from '@/components/DialogConfirm.vue'
import { uploadSingleFile } from '@/utils/utils'
import {
  getResumes,
  uploadResume,
  deleteResume,
  setPrimaryResume,
  type Resume
} from '../services/resume.service'

const authStore = useAuthStore()
const router = useRouter()

const resumes = ref<Resume[]>([])
const loading = ref(false)
const uploading = ref(false)

const confirmVisible = ref(false)
const confirmId = ref<number | null>(null)

async function fetchResumes() {
  loading.value = true
  try {
    const res = await getResumes()
    resumes.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const uploadRes = await uploadSingleFile(file)
    await uploadResume({
      file_url: uploadRes.data.url,
      file_name: file.name,
      is_primary: resumes.value.length === 0 // First one is primary by default
    })
    await fetchResumes()
  } catch (e) {
    console.error(e)
  } finally {
    uploading.value = false
    // Clear input
    if (e.target) (e.target as HTMLInputElement).value = ''
  }
}

async function handleSetPrimary(id: number) {
  try {
    await setPrimaryResume(id)
    await fetchResumes()
  } catch (e) {
    console.error(e)
  }
}

function askDelete(id: number) {
  confirmId.value = id
  confirmVisible.value = true
}

async function handleConfirmDelete() {
  if (!confirmId.value) return
  try {
    await deleteResume(confirmId.value)
    await fetchResumes()
  } catch (e) {
    console.error(e)
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(fetchResumes)
</script>

<template>
  <div class="min-h-screen bg-[#f7f1e8] text-stone-900">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]"></div>

    <Navbar :user-name="authStore.user?.name" @logout="logout" />

    <main class="relative mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div class="mb-8">
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-stone-950">CV & Resume</h1>
        <p class="mt-2 text-sm text-stone-500">Upload and manage your professional documents.</p>
      </div>

      <div class="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div class="mb-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 class="text-lg font-semibold text-stone-950">Upload New Resume</h2>
          <p class="mt-2 text-sm text-stone-500">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
          
          <label class="mt-6 cursor-pointer rounded-2xl bg-stone-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50">
            <span v-if="!uploading">Choose File</span>
            <span v-else class="flex items-center gap-2"><svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading...</span>
            <input type="file" @change="handleFileUpload" class="hidden" accept=".pdf,.doc,.docx" :disabled="uploading" />
          </label>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-stone-400">Your Documents ({{ resumes.length }})</h3>
          
          <div v-if="loading" class="flex justify-center py-8">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900"></div>
          </div>

          <div v-else-if="resumes.length === 0" class="py-8 text-center text-sm text-stone-400">
            No documents uploaded yet.
          </div>

          <div v-for="resume in resumes" :key="resume.id" class="group flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 transition hover:border-stone-200 hover:shadow-sm">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-semibold text-stone-900">{{ resume.file_name }}</p>
                <span v-if="resume.is_primary" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Primary</span>
              </div>
              <p class="text-xs text-stone-400">Uploaded on {{ formatDate(resume.uploaded_at) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <a :href="resume.file_url ?? ''" target="_blank" class="rounded-xl bg-stone-100 p-2 text-stone-600 hover:bg-stone-200 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <button 
                v-if="!resume.is_primary"
                @click="handleSetPrimary(resume.id)" 
                class="text-xs font-bold text-stone-500 hover:text-stone-900 transition"
              >Set Primary</button>
              <button @click="askDelete(resume.id)" class="text-stone-400 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <DialogConfirm 
      v-model="confirmVisible"
      title="Delete Document"
      message="Are you sure you want to delete this document?"
      confirm-text="Delete"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
