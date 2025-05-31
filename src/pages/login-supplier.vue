<!--
  Admin Email: admin@demo.com / Pass: admin
  Client Email: client@demo.com / Pass: client 
-->

<script setup>
import { VForm } from 'vuetify/components/VForm'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const route = useRoute()
const router = useRouter()
const ability = useAbility()

const errors = ref({
  phoneNumber: undefined,
})

const refVForm = ref()

const credentials = ref({
  phoneNumber: '',
})

const rememberMe = ref(false)

const login = async () => {
  if (phoneNumberValidator(credentials.value.phoneNumber)) {
    errors.value.phoneNumber = "شماره تلفن معتبر نیست"
    
    return
  }

  try {
    const res = await $api('/login', {
      method: 'POST',
      body: {
        phone_number: credentials.value.phoneNumber,
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
      },
    })

    const { accessToken, userData, userAbilityRules } = res

    // useCookie('userAbilityRules').value = userAbilityRules
    // ability.update(userAbilityRules)
    // useCookie('userData').value = userData
    // useCookie('accessToken').value = accessToken
    await nextTick(() => {
      router.replace('/two-step-supplier')
    })
  } catch (err) {
    console.error(err)
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        />

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            خوش آمدید <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
          </h4>

          <p class="mb-0">
            جهت ورود به سامانه، شماره تلفن همراه خود را وارد کنید
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- phoneNumber -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.phoneNumber"
                  label="شماره تلفن همراه"
                  placeholder="مثلاً: 09123456789"
                  type="text"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.phoneNumber"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
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
@use "@core/scss/template/pages/page-auth";
</style>
