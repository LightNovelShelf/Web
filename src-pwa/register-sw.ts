import { Notify } from 'quasar'
import { register } from 'register-service-worker'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    // console.log('Service worker is active.')
  },

  registered(/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    // console.log('New content is downloading.')
  },

  updated(registration) {
    // A = 旧版本，B = 新版本，- = 空
    // 阶段     | 安装中 | 待激活 | 活动
    // ---------+--------+--------+-----
    // 旧版运行 |   -    |   -    |  A
    // 新版安装 |   B    |   -    |  A
    // 安装完成 |   -    |   B    |  A  <- 触发更新回调
    // 开始激活 |   -    |   -    |  B
    const newWorker = registration.waiting
    if (!newWorker) return

    const cleanup = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', notifyWhenControlling)
      newWorker.removeEventListener('statechange', notifyWhenControlling)
    }

    const notifyWhenControlling = () => {
      // 安装失败 或者 有 new-new-worker 了
      if (newWorker.state === 'redundant') {
        cleanup()
        return
      }

      // controller 不是 / 还不是 controller: 纯保险，唯一可能的情况是 dev 环境下 sw 被瞬间刷新
      if (navigator.serviceWorker.controller !== newWorker) return

      // 如果被激活了，就 可以 刷新了
      cleanup()
      Notify.create({
        message: '有新内容可用了，请刷新或重新打开网页',
        position: 'bottom',
        timeout: 0,
        type: 'positive',
        actions: [{ label: '刷新', color: 'white', handler: () => location.reload() }],
      })
    }

    // updated 表示安装完成；等这次的新 SW 接管页面后，再允许用户刷新。
    navigator.serviceWorker.addEventListener('controllerchange', notifyWhenControlling)
    newWorker.addEventListener('statechange', notifyWhenControlling)
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
})
