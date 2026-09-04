<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 300px" class="column gap-8">
      <div class="text-opacity text-center">
        <q-icon size="60px" name="mdiAccountCircle"></q-icon>
        <div class="text-opacity text-h5">登录到 轻书架</div>
      </div>
      <div>
        <q-form @submit="submitLogin">
          <q-input
            no-error-icon
            :rules="[(val) => /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(val) || '必须是有效的邮箱']"
            v-model="email"
            label="邮箱"
          >
            <template v-slot:prepend>
              <q-icon name="mdiEmail" />
            </template>
          </q-input>
          <q-input
            no-error-icon
            :rules="[(val) => val.length >= 8 || '密码长度必须大于8位']"
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            label="密码"
          >
            <template v-slot:prepend>
              <q-icon name="mdiLock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'mdiEyeOff' : 'mdiEye'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <div class="row">
            <q-btn rounded flat :to="{ name: 'Register' }">注册</q-btn>
            <q-space />
            <q-btn rounded flat :to="{ name: 'Reset' }">忘记密码</q-btn>
          </div>
          <q-btn :loading="loading" color="primary" style="height: 50px" class="full-width" type="submit">
            登录
            <q-icon right size="24px" name="mdiSend" />
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              加载中
            </template>
          </q-btn>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'
import { sha256 } from '@/utils/hash'

import { useSessionStore } from '@/stores/session'

import { login, setRefreshToken } from '@/services/auth'

import type { RouteLocationRaw } from 'vue-router'

const $q = useQuasar()
const appStore = useSessionStore()
const email = ref('')
const password = ref('')
const isPwd = ref(true)
const loading = ref(false)
const route = useRoute()
const router = useRouter()

async function submitLogin() {
  loading.value = true
  try {
    appStore.user = await login(email.value, await sha256(password.value))
    $q.notify({ message: '登录成功', timeout: 3_000 })

    let destination: RouteLocationRaw = { name: 'Home' }
    try {
      const from = route.query.from as string | undefined
      if (from) destination = decodeURIComponent(from)
    } catch {
      // 来源路由无效时返回首页。
    }
    await router.replace(destination)
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrMsg(error) })
  } finally {
    loading.value = false
  }
}

async function storeDebugToken() {
  const token = route.query.token
  if (!token) return
  await setRefreshToken(String(token))
  alert('DEBUG: 已记录，请刷新')
}

onMounted(() => void storeDebugToken())
</script>

<style scoped lang="scss"></style>
