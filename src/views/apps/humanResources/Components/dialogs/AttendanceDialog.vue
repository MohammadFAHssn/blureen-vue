<script setup>

const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  request: { required: true },
  loading: { required: true },
})

const emit = defineEmits(['update:isDialogVisible', 'submit'])

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  loading: false,
})

const attendanceLogs = ref([])

function close() {
  emit('update:isDialogVisible', false)
}

function submit() {
  emit('submit')
}

async function getAttendancesBetweenDates() {
  uiState.loading = true
  uiState.hasError = false
  uiState.errorMessage = ''

  try {
    const { data } = await axiosInstance.get(
      '/kasra/reports/get-attendance-report',
      {
        params: {
          user_id: props.request.user_id,
          start_date: props.request.start_date,
          end_date: props.request.end_date,
        },
      },
    )

    attendanceLogs.value = data?.data?.attendances ?? []
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage
      = error?.response?.data?.message ?? 'خطا در دریافت ترددها'
  }
  finally {
    uiState.loading = false
  }
}

const groupedByDate = computed(() => {
  const map = new Map()

  for (const a of attendanceLogs.value || []) {
    const d = a.date || 'نامشخص'
    if (!map.has(d)) map.set(d, [])
    map.get(d).push(a)
  }

  return Array.from(map.entries()).map(([date, logs]) => ({ date, logs }))
})

watch(
  () => [props.isDialogVisible, props.request],
  ([visible]) => {
    if (visible && props.request) getAttendancesBetweenDates()
  },
  { immediate: true },
)
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

  <VDialog
    :model-value="props.isDialogVisible"
    :width="800"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span> نمایش ترددها </span>

        <VBtn icon variant="text" @click="close">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VSkeletonLoader v-if="uiState.loading" type="list-item@6" />

        <template v-else>
          <VAlert
            v-if="attendanceLogs.length === 0"
            type="info"
            variant="tonal"
          >
            ترددی یافت نشد.
          </VAlert>

          <div v-else class="d-flex flex-column ga-2">
            <div
              v-for="d in groupedByDate"
              :key="d.date"
              class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between pa-3 rounded"
              style="border: 1px solid rgba(0, 0, 0, 0.12)"
            >
              <div class="font-weight-medium mb-2 mb-sm-0">
                تاریخ:
                <span dir="ltr" style="unicode-bidi: isolate">
                  {{ d.date }}
                </span>
              </div>

              <div class="d-flex flex-wrap ga-3">
                <div
                  v-for="(log, i) in d.logs"
                  :key="`${d.date}-${i}`"
                  class="d-flex ga-2 align-center"
                >
                  <span class="text-caption">ورود {{ i + 1 }}:</span>
                  <span class="text-error">{{ log.in || '-' }}</span>

                  <span class="text-caption ms-2">خروج {{ i + 1 }}:</span>
                  <span class="text-error">{{ log.out || '-' }}</span>
                </div>

                <div v-if="d.logs.length === 0" class="text-error">
                  -
                </div>
              </div>
            </div>
          </div>
        </template>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn
          :loading="props.loading"
          color="success"
          variant="tonal"
          @click="submit"
        >
          تایید درخواست
        </VBtn>
        <VBtn color="secondary" variant="tonal" @click="close">
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
