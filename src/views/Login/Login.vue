<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 300px" class="q-gutter-sm">
      <div class="text-opacity text-center">
        <q-icon size="60px" :name="icon.mdiAccountCircle"></q-icon>
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
              <q-icon :name="icon.mdiEmail" />
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
              <q-icon :name="icon.mdiLock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? icon.mdiEyeOff : icon.mdiEye" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <div class="row">
            <q-btn rounded flat disable>注册</q-btn>
            <q-space />
            <q-btn rounded flat :to="{ name: 'Reset' }">忘记密码</q-btn>
          </div>
          <q-btn :loading="loading" color="primary" style="height: 50px" class="full-width" type="submit">
            登录
            <q-icon right size="24px" :name="icon.mdiSend" />
          </q-btn>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icon } from '@/plugins/icon'
import { ref } from 'vue'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { login } from '@/services/user'
import { sha256 } from '@/utils/hash'
import { useQuasar } from 'quasar'
import { getErrMsg } from '@/utils/getErrMsg'
import { useRoute, useRouter, RouteLocationRaw } from 'vue-router'
import { useAppStore } from '@/store'

const $q = useQuasar()
const appStore = useAppStore()

const email = ref('')
const password = ref('')
const isPwd = ref(true)
const loading = ref(false)
const route = useRoute()
const router = useRouter()

const { executeRecaptcha, recaptchaLoaded } = useReCaptcha() || {}

const _login = async () => {
  loading.value = true

  try {
    // 获取人机校验结果
    await recaptchaLoaded!() // 忽略为空的情况，出错了由catch兜住
    const token = await executeRecaptcha!('login')

    // 登录
    const [, user] = await login(email.value, await sha256(password.value), token)
    appStore.user = user

    $q.notify({
      message: '登录成功',
      timeout: 3000
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
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }

  loading.value = false
}
</script>

<style scoped lang="scss"></style>
