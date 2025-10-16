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

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,

    // public,
  },
})

const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAbility()

const errors = ref({
  username: undefined,
  password: undefined,
})

const refVForm = ref()

const credentials = ref({
  username: '',
  password: '',
})

const rememberMe = ref(false)

const hasError = ref(false)
const IsItWaitingServerResponse = ref(false)

const isRedirectedFromUnauthorizedStatus = ref(
  route.query.isRedirectedFromUnauthorizedStatus === 'true',
)

async function login() {
  IsItWaitingServerResponse.value = true
  try {
    const res = await $api('/login', {
      method: 'POST',
      body: {
        username: credentials.value.username,
        password: credentials.value.password,
      },
      onResponseError({ response }) {
        IsItWaitingServerResponse.value = false
        if (response._data.errors) {
          errors.value = response._data.errors
        }
        else {
          IsItWaitingServerResponse.value = false
          hasError.value = true
        }
      },
    })

    const { accessToken, userData, userAbilityRules } = res

    useCookie('userAbilityRules').value = userAbilityRules
    ability.update(userAbilityRules)
    useCookie('userData').value = userData
    useCookie('accessToken').value = accessToken
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
    if (isValid) login()
  })
}
</script>

<template>
  <VSnackbar
    v-model="isRedirectedFromUnauthorizedStatus"
    :timeout="5000"
    location="center"
    variant="flat"
    color="error"
  >
    زمان اعتبار توکن شما 8 ساعت می‌باشد و هم‌اکنون منقضی شده‌است. لطفاً دوباره
    وارد شوید.
  </VSnackbar>

  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    خطایی رخ داده‌است.
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
          style="padding-inline: 6.25rem;"
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
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            validate-on="submit lazy"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- username -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.username"
                  label="نام کاربری"
                  placeholder="کد پرسنلی"
                  type="text"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.username"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="رمز عبور"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="off"
                  :error-messages="errors.password"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox v-model="rememberMe" label="مرا به خاطر بسپار" />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    رمز عبور خود را فراموش کرده‌اید؟
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="IsItWaitingServerResponse"
                  :disabled="IsItWaitingServerResponse"
                >
                  ورود
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
