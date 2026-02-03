<script setup>
import { useDisplay } from 'vuetify/framework'

const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  request: { type: Object, default: null },
})
const emit = defineEmits(['update:isDialogVisible'])

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  loading: false,
})

const { smAndDown } = useDisplay()

const approvalStatusMap = {
  1: { title: 'در حال بررسی', color: 'warning' },
  2: { title: 'تایید شده', color: 'success' },
  3: { title: 'رد شده', color: 'error' },
}

function convertDate(date) {
  return moment(date)
    .utc('jYYYY-jMM-jDDTHH:mm:ss.SSZ')
    .format('jYYYY-jMM-jDD HH:mm')
}
function getFullName(u) {
  if (!u) return 'نامشخص'
  return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'نامشخص'
}
const requestApprovals = ref([])

function close() {
  emit('update:isDialogVisible', false)
}
async function getRequestApprovals() {
  try {
    uiState.loading = true
    const { data } = await axiosInstance.get(
      '/hr-request/request/get-approvals-flow',
      {
        params: {
          requestId: props.request.id,
        },
      },
    )
    requestApprovals.value = data.data
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage = 'خطا در دریافت رده تاییدیه'
    console.log(error)
  }
  finally {
    uiState.loading = false
  }
}

onMounted(() => {
  getRequestApprovals()
})
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
    :width="smAndDown ? 'auto' : 600"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>روند تاییدیه درخواست</span>
        <VBtn icon variant="text" @click="close">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VAlert v-if="!props.request" type="info" variant="tonal">
          درخواستی انتخاب نشده است.
        </VAlert>

        <template v-else>
          <VSkeletonLoader v-if="uiState.loading" type="list-item@3" />
          <VAlert
            v-else-if="!requestApprovals.length"
            type="info"
            variant="tonal"
          >
            برای این درخواست تاییدکننده‌ای ثبت نشده است.
          </VAlert>

          <VList v-else lines="two" class="pa-0">
            <VListItem v-for="a in requestApprovals" :key="a.id" class="px-0">
              <template #prepend>
                <VAvatar size="34">
                  <VIcon icon="tabler-user" />
                </VAvatar>
              </template>

              <VListItemTitle>
                {{ getFullName(a.approver) }}
              </VListItemTitle>

              <VListItemSubtitle>
                <span v-if="a.approved_at">
                  زمان تاییدیه:
                  <span dir="ltr" style="unicode-bidi: isolate">
                    {{ convertDate(a.approved_at) }}
                  </span>
                </span>
              </VListItemSubtitle>

              <template #append>
                <VChip
                  :color="approvalStatusMap[a.status_id].color"
                  size="small"
                  label
                  variant="tonal"
                >
                  {{ approvalStatusMap[a.status_id].title }}
                </VChip>
              </template>
            </VListItem>
          </VList>
        </template>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="secondary" variant="tonal" @click="close">
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
