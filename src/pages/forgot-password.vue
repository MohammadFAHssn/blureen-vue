<script setup>
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

defineOptions({
  beforeRouteEnter(to, from, next) {
    if (useCookie('otpExpiresAt').value > Math.floor(Date.now() / 1000)) {
      return next({ name: 'two-step-forgot-password' })
    }
    next()
  },
})

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()

const errors = ref({
  mobileNumber: undefined,
  other: undefined,
})

const refVForm = ref()

const credentials = ref({
  mobileNumber: '',
})

const hasError = ref(false)
const IsItWaitingServerResponse = ref(false)

async function getOtpCode() {
  IsItWaitingServerResponse.value = true
  try {
    const res = await $api('/get-otp-code', {
      method: 'POST',
      body: {
        mobileNumber: credentials.value.mobileNumber,
      },
      onResponseError({ response }) {
        IsItWaitingServerResponse.value = false
        if (response._data.errors) {
          errors.value = response._data.errors
        }
        else {
          errors.value.other = response._data.message
          hasError.value = true
        }
      },
    })

    const { otpExpiresAt } = res

    useCookie('otpExpiresAt').value = otpExpiresAt
    useCookie('mobileNumber').value = credentials.value.mobileNumber
    await nextTick(() => {
      router.replace({
        path: '/two-step-forgot-password',
      })
    })
  }
  catch (err) {
    console.error(err)
  }
}

function onSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) getOtpCode()
  })
}
</script>

<template>
  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ errors.other }}
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

      <!-- 👉 Auth card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
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
            رمز عبور خود را فراموش کرده‌اید؟
          </h4>
          <p class="mb-0">
            شماره تلفن همراه خود را وارد کنید تا کد تأیید برای شما ارسال شود
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            validate-on="submit lazy"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.mobileNumber"
                  label="شماره تلفن همراه"
                  placeholder="مثلاً: 09123456789"
                  type="number"
                  autofocus
                  :rules="[requiredValidator, mobileNumberValidator]"
                  :error-messages="errors.mobileNumber"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="IsItWaitingServerResponse"
                  :disabled="IsItWaitingServerResponse"
                >
                  ارسال کد تأیید
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
