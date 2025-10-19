<script setup>
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

// states

const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  resetPassword: false,
})

const refVForm = ref()

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

async function resetPassword() {
  pendingState.resetPassword = true
  try {
    await $api('/base/user/reset-password', {
      method: 'POST',
      body: {
        newPassword: form.value.newPassword,
      },
      onResponseError({ response }) {
        pendingState.resetPassword = false
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در بازنشانی رمز عبور'
      },
    })
    pendingState.resetPassword = false

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  catch (err) {
    console.error(err)
  }
}

function onSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) resetPassword()
  })
}
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-2'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <RouterLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </RouterLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h4 class="text-h6 mb-1">
            بازنشانی رمز عبور
          </h4>
          <p class="mb-0">
            برای حفظ امنیت شما، لطفاً رمزی را انتخاب کنید که حداقل ۸ کاراکتر و
            شامل حروف بزرگ و کوچک انگلیسی و اعداد باشد.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            validate-on="submit lazy"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.newPassword"
                  autofocus
                  label="رمز عبور جدید"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  tabindex="1"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :rules="[passwordValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Confirm Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.confirmPassword"
                  label="تأیید رمز عبور"
                  autocomplete="confirm-password"
                  placeholder="············"
                  tabindex="2"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :rules="[
                    confirmedValidator(form.confirmPassword, form.newPassword),
                  ]"
                  @click:append-inner="
                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                  "
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  tabindex="3"
                  :loading="pendingState.resetPassword"
                  :disabled="pendingState.resetPassword"
                >
                  تأیید رمز عبور جدید
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <span>بازگشت به صفحه ورود</span>
                  <VIcon
                    icon="tabler-chevron-right"
                    size="20"
                    class="me-1 flip-in-rtl"
                  />
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style>
