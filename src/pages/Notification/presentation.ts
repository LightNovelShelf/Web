export interface NotificationTonePresentation {
  icon: string
  color: string
  borderClass: string
}

const neutral: NotificationTonePresentation = {
  icon: 'mdiBell',
  color: 'grey-6',
  borderClass: 'notification-preview--neutral',
}

const presentations: Record<string, NotificationTonePresentation> = {
  neutral,
  info: {
    icon: 'mdiInformation',
    color: 'primary',
    borderClass: 'notification-preview--info',
  },
  success: {
    icon: 'mdiCheckCircle',
    color: 'positive',
    borderClass: 'notification-preview--success',
  },
  warning: {
    icon: 'mdiShieldAlertOutline',
    color: 'warning',
    borderClass: 'notification-preview--warning',
  },
  danger: {
    icon: 'mdiAlertCircleOutline',
    color: 'negative',
    borderClass: 'notification-preview--danger',
  },
}

export const notificationTonePresentation = (tone: string): NotificationTonePresentation =>
  presentations[tone] ?? neutral
