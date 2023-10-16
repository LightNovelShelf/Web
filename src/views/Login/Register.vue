<template>
  <div class="fit row flex-center column absolute-full">
    <div style="width: 300px" class="q-gutter-sm">
      <div class="text-opacity text-center">
        <q-icon size="60px" :name="icon.mdiAccountCircle"></q-icon>
        <div class="text-opacity text-h5">注册到 轻书架</div>
      </div>
      <div>
        <q-form @submit="_register">
          <q-input no-error-icon :rules="[(val) => !!val || '无效的用户名']" v-model="userName" label="昵称">
            <template v-slot:prepend>
              <q-icon :name="icon.mdiAccount" />
            </template>
          </q-input>
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
          <q-input v-model="registerPassword" label="注册口令(一般不填)">
            <template v-slot:prepend>
              <q-icon :name="icon.mdiLockPlus" />
            </template>
          </q-input>
          <vue-turnstile style="margin-top: 8px" ref="turnstile" v-model="token" />
          <div class="row">
            <q-btn rounded flat :to="{ name: 'Login' }">登录</q-btn>
            <q-space />
            <q-btn rounded flat :to="{ name: 'Reset' }">忘记密码</q-btn>
          </div>
          <q-btn :loading="loading" color="primary" style="height: 50px" class="full-width" type="submit">
            注册
            <q-icon right size="24px" :name="icon.mdiSend" />
          </q-btn>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { icon } from 'assets/icon'
import { ref } from 'vue'
import { register, sendRegisterEmail } from 'src/services/user'
import { sha256 } from 'src/utils/hash'
import { useQuasar } from 'quasar'
import { getErrMsg } from 'src/utils/getErrMsg'
import { useRouter } from 'vue-router'
import { useAppStore } from 'stores/app'
import VueTurnstile from 'src/views/Login/VueTurnstile.vue'

const $q = useQuasar()
const appStore = useAppStore()

const userName = ref('')
const email = ref('')
const password = ref('')
const rePassword = ref('')
const code = ref('')
const registerPassword = ref(null)
const isPwd = ref(true)
const loading = ref(false)
const sending = ref(false)
const router = useRouter()
const token = ref()
const turnstile = ref()

const sendEmail = async () => {
  if (!turnstile.value?.loaded || !token.value) {
    $q.notify({
      type: 'negative',
      message: '请等待Turnstile服务加载和通过验证'
    })
    return
  }

  sending.value = true
  try {
    await sendRegisterEmail(email.value, token.value)

    $q.notify({
      message: '发送成功',
      timeout: 3000
    })
  } catch (e) {
    token.value = null
    turnstile.value?.reset()

    if (e?.target?.localName === 'script') {
      $q.notify({
        type: 'negative',
        message: '加载reCAPTCHA服务失败，请检查网络并刷新网页重试'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  }
  sending.value = false
}

const _register = async () => {
  loading.value = true

  try {
    const [, user] = await register(
      userName.value,
      email.value,
      await sha256(password.value),
      code.value,
      registerPassword.value
    )
    appStore.user = user
    $q.notify({
      message: '注册成功',
      timeout: 3000
    })
    await router.replace({ name: 'Home' })
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
