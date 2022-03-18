<template>
  <div>
    <router-view />

    <div class="absolute-bottom-right">
      本网站受reCAPTCHA和Google的保护
      <a target="_blank" href="https://policies.google.com/privacy">隐私政策</a>
      &
      <a target="_blank" href="https://policies.google.com/terms">服务条款</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { app } from 'src/app'
import { VueReCaptcha } from 'vue-recaptcha-v3'

app.use(VueReCaptcha, {
  // Volar 的缺陷，调用eslint时没有共享ts的全局变量声明过去；在纯ts文件就不需要这种
  // eslint-disable-next-line no-undef
  siteKey: VUE_CAPTCHA_SITE_KEY,
  loaderOptions: {
    useRecaptchaNet: true,
    autoHideBadge: true
  }
})
</script>

<style scoped></style>
