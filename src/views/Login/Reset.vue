<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 300px" class="q-gutter-sm">
      <div class="text-opacity text-center">
        <q-icon size="60px" :name="icon.mdiAccountCircle"></q-icon>
        <div class="text-opacity text-h5">重置密码</div>
      </div>
      <div>
        <q-form @submit="_reset">
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
            label="新密码"
          >
            <template v-slot:prepend>
              <q-icon :name="icon.mdiLock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? icon.mdiEyeOff : icon.mdiEye" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <q-input
            no-error-icon
            :rules="[(val) => val === password || '两次输入密码必须一致']"
            :type="isPwd ? 'password' : 'text'"
            v-model="rePassword"
            label="确认新密码"
          >
            <template v-slot:prepend>
              <q-icon :name="icon.mdiLock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? icon.mdiEyeOff : icon.mdiEye" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <q-input no-error-icon :rules="[(val) => !!val || '无效的验证码']" v-model="code" label="验证码">
            <template v-slot:prepend>
              <q-icon :name="icon.mdiShieldCheck" />
            </template>
            <template v-slot:after>
              <q-btn @click="sendEmail" :loading="sending">发送验证码</q-btn>
            </template>
          </q-input>
          <div class="row">
            <q-btn rounded flat disable>注册</q-btn>
            <q-space />
            <q-btn rounded flat :to="{ name: 'Login' }">登录</q-btn>
          </div>
          <q-btn :loading="loading" color="primary" style="height: 50px" class="full-width" type="submit">
            重置
            <q-icon right size="24px" :name="icon.mdiSend" />
          </q-btn>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { icon } from '@/plugins/icon'
import { ref } from 'vue'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { login, resetPassword, sendResetEmail } from '@/services/user'
import { sha256 } from '@/utils/hash'
import { useQuasar } from 'quasar'
import { getErrMsg } from '@/utils/getErrMsg'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'

const $q = useQuasar()
const appStore = useAppStore()

const email = ref('')
const password = ref('')
const rePassword = ref('')
const code = ref('')
const isPwd = ref(true)
const loading = ref(false)
const sending = ref(false)
const router = useRouter()

const { executeRecaptcha, recaptchaLoaded } = useReCaptcha() || {}

const sendEmail = async () => {
  sending.value = true
  try {
    await recaptchaLoaded!()
    const token = await executeRecaptcha!('login')

    await sendResetEmail(email.value, token)

    $q.notify({
      message: '发送成功',
      timeout: 3000
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }
  sending.value = false
}

const _reset = async () => {
  loading.value = true

  try {
    await resetPassword(email.value, await sha256(password.value), code.value)
    $q.notify({
      message: '重置成功',
      timeout: 3000
    })
    await router.replace({ name: 'Login' })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }

  loading.value = false
}
</script>

<style scoped></style>
