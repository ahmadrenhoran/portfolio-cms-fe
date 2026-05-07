<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { updateProfile } from '../services/profile.service'
import Navbar from '@/components/Navbar.vue'
import TextField from '@/components/forms/TextField.vue'
import { getErrorMessage } from '@/utils/utils'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const saving = ref(false)
const message = ref('')
const error = ref('')

const form = reactive({
  name: authStore.user?.name || '',
  username: authStore.user?.username || '',
})

async function handleSave() {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    const res = await updateProfile(form)
    authStore.setUser(res.data.data) // Update store
    message.value = 'Profile updated successfully'
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    saving.value = false
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f1e8] text-stone-900">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]"></div>

    <Navbar :user-name="authStore.user?.name" @logout="logout" />

    <main class="relative mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div class="mb-8">
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-stone-950">Profile Settings</h1>
        <p class="mt-2 text-sm text-stone-500">Manage your account information and public identifier.</p>
      </div>

      <form @submit.prevent="handleSave" class="space-y-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div v-if="message" class="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-100">
          {{ message }}
        </div>
        <div v-if="error" class="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-100">
          {{ error }}
        </div>

        <TextField
          v-model="form.name"
          label="Full Name"
          placeholder="Enter your full name"
        />

        <div>
          <label class="mb-2 block text-sm font-semibold text-stone-700">Username</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">@</span>
            <input
              v-model="form.username"
              type="text"
              class="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-8 pr-4 text-sm outline-none transition-all focus:border-stone-400 focus:bg-white"
              placeholder="username"
            />
          </div>
          <p class="mt-2 text-xs text-stone-500">
            This will be used for your public API URL: 
            <code class="bg-stone-100 px-1 rounded text-stone-800 font-mono">/v1/public/{{ form.username || 'your-username' }}/...</code>
          </p>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {{ saving ? 'Saving Changes...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>
