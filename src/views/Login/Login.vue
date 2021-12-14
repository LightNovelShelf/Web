<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 304px">
      <div class="text-grey-7 text-center">
        <q-icon size="60px" :name="icon.mdiAccountCircle"></q-icon>
        <div class="text-grey-7 text-h5">登录到 轻书架</div>
      </div>
      <div style="margin: 12px 0">
        <q-input
          no-error-icon
          :rules="[(val) => /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(val) || '必须是有效的邮箱']"
          v-model="name"
          label="邮箱"
        >
          <template v-slot:prepend>
            <q-icon :name="icon.mdiEmail" />
          </template>
        </q-input>
        <q-input
          no-error-icon
          :rules="[(val) => (val.length >= 8 && val.length <= 16) || '密码必须是8-16长度']"
          :type="isPwd ? 'password' : 'text'"
          v-model="password"
          label="密码"
        >
          <template v-slot:prepend>
            <q-icon :name="icon.mdiLock" />
          </template>
          <template v-slot:append>
            <q-icon :name="isPwd ? icon.mdiEye : icon.mdiEye" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>
      </div>
      <q-btn :loading="loading" color="primary" style="height: 50px" class="full-width" @click="_login">
        登录
        <q-icon right size="24px" :name="icon.mdiSend" />
      </q-btn>

      <div class="absolute-bottom-right">
        本网站受reCAPTCHA和Google的保护
        <a target="_blank" href="https://policies.google.com/privacy">隐私政策</a>
        &
        <a target="_blank" href="https://policies.google.com/terms">服务条款</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icon } from '@/plugins/icon'
import { ref } from 'vue'
import { useReCaptcha, VueReCaptcha } from 'vue-recaptcha-v3'
import app from '@/main'
import { login } from '@/services/user'
import { sha256 } from '@/utils/hash'
import { useQuasar } from 'quasar'
import { getErrMsg } from '@/utils/getErrMsg'
import { useRoute, useRouter, RouteLocationRaw } from 'vue-router'
import { useAppStore } from '@/store'

app.use(VueReCaptcha, {
  // Volar 的缺陷，调用eslint时没有共享ts的全局变量声明过去；在纯ts文件就不需要这种
  // eslint-disable-next-line no-undef
  siteKey: VUE_CAPTCHA_SITE_KEY,
  loaderOptions: {
    useRecaptchaNet: true,
    autoHideBadge: true
  }
})

const $q = useQuasar()
const appStore = useAppStore()

const name = ref('test@acgdmzy.com')
const password = ref('test_user')
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
    const [, user] = await login(name.value, await sha256(password.value), token)
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

    router.replace(to)
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
