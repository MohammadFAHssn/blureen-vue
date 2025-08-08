<!--
  Admin Email: admin@demo.com / Pass: admin
  Client Email: client@demo.com / Pass: client
-->

<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'

defineOptions({
  beforeRouteEnter(to, from, next) {
    if (useCookie('otpExpiresAt').value > Math.floor(Date.now() / 1000)) {
      return next({ name: 'two-step-supplier' })
    }
    next()
  },
})

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const route = useRoute()
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

const isRedirectedFromUnauthorizedStatus = ref(
  route.query.isRedirectedFromUnauthorizedStatus === 'true',
)

async function login() {
  IsItWaitingServerResponse.value = true
  try {
    const res = await $api('/login-supplier', {
      method: 'POST',
      body: {
        mobileNumber: credentials.value.mobileNumber,
      },
      onResponseError({ response }) {
        IsItWaitingServerResponse.value = false
        if (response._data.errors) {
          errors.value = response._data.errors
        } else {
          errors.value.other = response._data.message
          hasError.value = true
        }
      },
    })

    const { otpExpiresAt } = res

    useCookie('otpExpiresAt').value = otpExpiresAt
    await nextTick(() => {
      router.replace({
        path: '/two-step-supplier',
        query: { mobileNumber: credentials.value.mobileNumber },
      })
    })
  } catch (err) {}
}

function onSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) login()
  })
}
</script>

<template>
  <VSnackbar
    v-model="isRedirectedFromUnauthorizedStatus"
    :timeout="5000"
    location="center"
    variant="outlined"
    color="error"
  >
    زمان اعتبار توکن شما 8 ساعت می‌باشد و هم‌اکنون منقضی شده‌است. لطفاً دوباره
    وارد شوید.
  </VSnackbar>

  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="outlined"
    color="error"
  >
    {{ errors.other }}
  </VSnackbar>

  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem"
        />

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
        <VCardText>
          <h4 class="text-h4 mb-1">
            خوش آمدید
            <span class="text-capitalize"> {{ themeConfig.app.title }} </span>!
            👋🏻
          </h4>

          <p class="mb-0">
            جهت ورود به سامانه، شماره تلفن همراه خود را وارد کنید
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            validate-on="submit lazy"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- mobileNumber -->
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
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style>
