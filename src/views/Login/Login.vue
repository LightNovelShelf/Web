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
import { login, refreshToken } from '@/services/user'
import { sha256 } from 'js-sha256'
import { useQuasar } from 'quasar'

app.use(VueReCaptcha, {
  siteKey: '6LfxUnwdAAAAAKx-1uwDXCb1F9zFo80KwBA614cZ',
  loaderOptions: {
    useRecaptchaNet: true,
    autoHideBadge: true
  }
})

const $q = useQuasar()

const name = ref('test@acgdmzy.com')
const password = ref('test_user')
const isPwd = ref(true)
const loading = ref(false)

const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()

const _login = async () => {
  loading.value = true

  try {
    await recaptchaLoaded()
    const token = await executeRecaptcha('login')

    const { RefreshToken } = await login(name.value, sha256(password.value), token)
    $q.notify({
      message: '登录成功'
    })
    const jwtToken = await refreshToken(RefreshToken)
    console.log('jwtToken', jwtToken)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.message
    })
  }

  loading.value = false
}
</script>

<style scoped lang="scss"></style>
