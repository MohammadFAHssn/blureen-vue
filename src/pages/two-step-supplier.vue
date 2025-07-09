<script setup>
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw"
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw"
import { VNodeRenderer } from "@layouts/components/VNodeRenderer"
import { themeConfig } from "@themeConfig"

definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: true,
  },
})

defineOptions({
  beforeRouteEnter(to, from, next) {
    if (useCookie("otpExpiresAt").value < Math.floor(Date.now() / 1000)) {
      return next({ name: "login-supplier" })
    }
    next()
  },
})

const route = useRoute()
const router = useRouter()
const ability = useAbility()

const otpCode = ref("")
const isOtpCodeInserted = ref(false)

const errors = ref({
  other: undefined,
})

const hasError = ref(false)

const otpExpiresIn = ref(
  useCookie("otpExpiresAt").value - Math.floor(Date.now() / 1000),
)

const intervalId = setInterval(() => {
  otpExpiresIn.value -= 1

  if (otpExpiresIn.value <= 0) {
    clearInterval(intervalId)
    otpExpiresIn.value = 0
    router.replace("/login-supplier")
  }
}, 1000)

const timeRemaining = computed(() => {
  const totalSeconds = otpExpiresIn.value

  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  }
})

const onFinish = async () => {
  isOtpCodeInserted.value = true
  try {
    const res = await $api("/verify-supplier-otp", {
      method: "POST",
      body: {
        mobileNumber: route.query.mobileNumber,
        otpCode: otpCode.value,
      },
      onResponseError({ response }) {
        isOtpCodeInserted.value = false
        if (response._data.errors) {
          errors.value = response._data.errors
        } else {
          errors.value.other = response._data.message
          hasError.value = true
        }
      },
    })

    const { accessToken, userData, userAbilityRules } = res

    useCookie("userAbilityRules").value = userAbilityRules
    ability.update(userAbilityRules)
    useCookie("userData").value = userData
    useCookie("accessToken").value = accessToken
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : "/")
    })
  } catch (err) {
    console.error(err)
  }
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
          <h4 class="text-h4 mb-1">
            احراز هویت دو مرحله‌ای
          </h4>
          <p class="mb-1">
            کد تأیید به تلفن همراه شما ارسال شد. لطفاً کد دریافتی را در کادر زیر
            وارد کنید
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VOtpInput
                  v-model="otpCode"
                  style="direction: ltr;"
                  :disabled="isOtpCodeInserted"
                  type="number"
                  class="pa-0"
                  @finish="onFinish"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  :loading="isOtpCodeInserted"
                  :disabled="isOtpCodeInserted"
                  block
                  type="submit"
                >
                  تأیید
                </VBtn>
              </VCol>

              <VCol>
                <VCol cols="12">
                  <div class="d-flex justify-center align-center flex-wrap">
                    <span class="me-1">
                      {{ timeRemaining.minutes }}:{{ timeRemaining.seconds }}
                    </span>
                    <span class="me-1">تا درخواست دوباره</span>
                  </div>
                </VCol>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.v-otpCode-input {
  .v-otpCode-input__content {
    padding-inline: 0;
  }
}
</style>
