<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 300px" class="q-gutter-sm">
      <div class="text-opacity text-center">
        <q-icon size="60px" name="mdiAccountCircle"></q-icon>
        <div class="text-opacity text-h5">登录到 轻书架</div>
      </div>
      <div>
        <q-form @submit="_login">
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
          <vue-turnstile
            ref="turnstile"
            v-model="token"
            theme="auto"
            @passed="() => (canLogin = true) && (loading = false)"
          />
          <div class="row">
            <q-btn rounded flat :to="{ name: 'Register' }">注册</q-btn>
            <q-space />
            <q-btn rounded flat :to="{ name: 'Reset' }">忘记密码</q-btn>
          </div>
          <q-btn
            :loading="loading"
            :color="canLogin ? 'primary' : 'secondary'"
            style="height: 50px"
            class="full-width"
            type="submit"
            :disable="!canLogin"
          >
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
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from 'src/utils/getErrMsg'
import { sha256 } from 'src/utils/hash'
import { longTermToken } from 'src/utils/session'

import { useAppStore } from 'stores/app'

import VueTurnstile from 'src/pages/Login/VueTurnstile.vue'
import { login } from 'src/services/user'

import type { RouteLocationRaw } from 'vue-router'

const $q = useQuasar()
const appStore = useAppStore()

const email = ref()
const password = ref()
const token = ref()
const turnstile = ref()
const isPwd = ref(true)
const loading = ref(true)
const route = useRoute()
const router = useRouter()
const canLogin = ref(false)

const _login = async () => {
  if (!turnstile.value?.loaded || !token.value) {
    $q.notify({
      type: 'negative',
      message: '请等待Turnstile服务加载和通过验证',
    })
    return
  }

  try {
    // 登录
    const [, user] = await login(email.value, await sha256(password.value), token.value)
    appStore.user = user

    $q.notify({
      message: '登录成功',
      timeout: 3000,
    })

    // 跳转首页或者来源路由
    let to: RouteLocationRaw = { name: 'Home' }

    try {
      const from = route.query.from as string | undefined
      from && (to = decodeURIComponent(from))
    } catch (e) {
      // ignore
    }

    await router.replace(to)
  } catch (e: any) {
    token.value = null
    turnstile.value?.reset()

    if (e?.target?.localName === 'script') {
      $q.notify({
        type: 'negative',
        message: '加载reCAPTCHA服务失败，请检查网络并刷新网页重试',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e),
      })
    }
  }

  loading.value = false
}

/** 检测一次在路由上的token并记录下来
 *
 * 方便局域网调试，规避局域网不好启用人机验证的问题
 */
function checkTokenInQueryOnce() {
  const preDefinedToken = route.query.token
  if (!preDefinedToken) return
  longTermToken.set(preDefinedToken as string)
  alert('DEBUG: 已记录，请刷新')
}

onMounted(checkTokenInQueryOnce)
</script>

<style scoped lang="scss"></style>
