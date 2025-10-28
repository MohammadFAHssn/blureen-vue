<script setup>
const constants = inject('constants')
const isLoading = ref(false)
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})

const overtimeDate = ref('')
const startTime = ref('')
const endTime = ref('')
const description = ref('')
const currentMonthRequests = ref([])
const attendanceLogs = ref([
  { in: '07:25', out: '09:27' },
])

async function submit() {
  if (!overtimeDate.value || !startTime.value || !endTime.value || !description.value) {
    uiState.hasError = true
    uiState.errorMessage = 'اطلاعات درخواست ناقص است.'
  }
  /*  else if (startTime.value > endTime.value) {
    uiState.hasError = true
    uiState.errorMessage = 'زمان شروع نمی‌تواند بزرگتر از زمان پایان باشد'
  } */
  else {
    const requestData = {
      request_type_id: constants.HR_REQUEST_TYPE_OVERTIME,
      user_id: useCookie('userData').value.id,
      start_date: overtimeDate.value,
      end_date: overtimeDate.value,
      start_time: startTime.value,
      end_time: endTime.value,
      details: {
        description: description.value,
      },
    }

    try {
      await $api('/hr-request/requests/create', {
        method: 'POST',
        body: requestData,
        onResponseError({ response }) {
          uiState.hasError = true
          uiState.errorMessage = response._data.message || 'خطا در ثبت مرخصی'
        },
      })

      uiState.success = true
      uiState.successMessage = `درخواست اضافه کار ثبت شد`

      currentMonthRequests.value.push({
        start_date: overtimeDate.value,
        start_time: startTime.value,
        end_time: endTime.value,
        status_id: constants.HR_REQUEST_PENDING_STATUS,
      })
      overtimeDate.value = ''
      startTime.value = ''
      endTime.value = ''
      description.value = ''
    }
    catch (err) {
      console.log(err)
    }
    finally {
      isLoading.value = false
    }
  }
}

async function getCurrentMonthRequests() {
  isLoading.value = true
  try {
    const { data, error } = await useApi(
      createUrl(`/hr-request/requests/get-user-requests?request_type=${constants.HR_REQUEST_TYPE_OVERTIME}`),
    )
    isLoading.value = false
    if (error.value) {
      uiState.hasError = true
      uiState.errorMessage = 'خطا در دریافت درخواست ها'
      throw error.value
    }

    if (data.value.data) {
      currentMonthRequests.value = data.value.data
    }
  }
  catch (e) {
    isLoading.value = false
    console.error('Unexpected error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطای غیرمنتظره هنگام دریافت درخواست ها'
  }
}

onMounted(() => {
  getCurrentMonthRequests()
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
  <VSnackbar
    v-model="uiState.success"
    :timeout="2000"
    location="center"
    variant="flat"
    color="success"
  >
    {{ uiState.successMessage }}
  </VSnackbar>
  <div>
    <VBtn variant="text" prepend-icon="tabler-arrow-right" class="mb-4" @click="$emit('back')">
      صفحه اصلی
    </VBtn>
  </div>
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      ثبت مجوز اضافه کار
    </h2>
  </div>

  <VRow class="pa-2" dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="overtimeDate"
        format="jYYYY/jMM/jDD"
        inline
        custom-input="#custom-input"
      />
    </VCol>

    <VCol cols="12" md="8">
      <VCard class="mb-4">
        <label class="font-weight-medium mb-4 mt-2 d-block text-center">
          ترددهای روز
        </label>
        <VRow justify="center" dense>
          <template v-if="attendanceLogs.length">
            <template v-for="(log, i) in attendanceLogs" :key="`pair-${i}`">
              <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
                <div class="mb-1 font-weight-medium">
                  ورود {{ i + 1 }}
                </div>
                <div class="text-error">
                  {{ log.in || '-' }}
                </div>
              </VCol>
              <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
                <div class="mb-1 font-weight-medium">
                  خروج {{ i + 1 }}
                </div>
                <div class="text-error">
                  {{ log.out || '-' }}
                </div>
              </VCol>
            </template>
          </template>
          <VCol v-else cols="12" class="text-center text-error">
            -
          </VCol>
        </VRow>
      </VCard>

      <VCard class="mb-4">
        <label class="font-weight-medium mb-2 mt-2 d-block text-center">
          جزئیات درخواست
        </label>
        <VRow class="mb-4 px-4">
          <VCol cols="12" sm="12" md="12">
            <VTextField
              v-model="overtimeDate"
              label="تاریخ اضافه کاری"
              variant="outlined"
              readonly
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="startTime"
              label="ساعت شروع"
              type="time"
              density="compact"
              variant="outlined"
              step="60"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="endTime"
              label="ساعت پایان"
              type="time"
              density="compact"
              variant="outlined"
              step="60"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="description"
              label="توضیحات"
              auto-grow
              variant="outlined"
              rows="3"
              placeholder="توضیحات اضافه کار را وارد کنید..."
            />
          </VCol>
        </VRow>
        <VRow justify="center" class="mb-4">
          <VCol cols="auto">
            <VBtn color="primary" @click="submit">
              ثبت درخواست
            </VBtn>
          </VCol>
        </VRow>
      </VCard>

      <!-- برای دسکتاپ -->
      <div class="ma-3 overflow-auto d-none d-md-block">
        <VCard class="pa-4">
          <label class="font-weight-medium mb-4 d-block text-center">
            اضافه کاری های ماه جاری
          </label>
          <VSkeletonLoader v-if="isLoading" type="card" />
          <table v-else class="requests-table w-100">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>ساعت شروع</th>
                <th>ساعت پایان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in currentMonthRequests" :key="index">
                <td>{{ item.start_date }}</td>
                <td>{{ item.start_time }}</td>
                <td>{{ item.end_time }}</td>
                <td>
                  <VChip
                    :color="item.status.color"
                    size="small"
                    label
                  >
                    {{ item.status.title }}
                  </VChip>
                </td>
                <td>
                  <VBtn color="orange" variant="text" size="small">
                    <VIcon icon="tabler-edit" size="20" />
                  </VBtn>
                  <VBtn color="red" variant="text" size="small">
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </table>
        </VCard>
      </div>

      <!-- برای موبایل -->
      <div class="d-md-none pa-3">
        <VExpansionPanels variant="accordion">
          <!-- کشوی اصلی مربوط به "مرخصی‌های ماه جاری" -->
          <VExpansionPanel>
            <VExpansionPanelTitle class="font-weight-bold">
              اضافه کاری های ماه جاری
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <!-- کشوهای داخلی برای هر مرخصی -->
              <VExpansionPanels variant="accordion">
                <VExpansionPanel
                  v-for="(item, index) in currentMonthRequests"
                  :key="index"
                  class="mb-2"
                >
                  <VExpansionPanelTitle>
                    <div class="d-flex justify-space-between w-100 align-center">
                      <span>{{ item.date }}</span>
                      <VChip
                        :color="item.status.color"
                        size="small"
                        label
                        variant="tonal"
                      >
                        {{ item.status.title }}
                      </VChip>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="pa-2">
                      <div><strong>تاریخ:</strong> {{ item.start_date }}</div>
                      <div><strong>ساعت شروع:</strong> {{ item.start_time }}</div>
                      <div><strong>ساعت پایان:</strong> {{ item.end_time }}</div>
                      <div class="mt-2 text-center">
                        <VBtn color="orange" variant="text" size="small">
                          <VIcon icon="tabler-edit" size="20" />
                        </VBtn>
                        <VBtn color="red" variant="text" size="small">
                          <VIcon icon="tabler-trash" size="20" />
                        </VBtn>
                      </div>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </VCol>
  </VRow>
</template>

<style scoped>
.requests-table {
  width: 100%;
  border-collapse: collapse;
}
.requests-table th,
.requests-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.requests-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
