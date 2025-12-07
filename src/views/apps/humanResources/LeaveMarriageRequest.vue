<script setup>
const isLoading = ref(false)
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const startDate = ref('')
const endDate = ref('')
const showStartPicker = ref(false)
const showEndPicker = ref(false)

const monthlyRequests = ref([])

function selectStart(val) {
  startDate.value = val.format ? val.format('jYYYY/jMM/jDD') : val
  showStartPicker.value = false
}
function selectEnd(val) {
  endDate.value = val.format ? val.format('jYYYY/jMM/jDD') : val
  showEndPicker.value = false
}

function submit() {
  if (!startDate.value || !endDate.value) {
    uiState.hasError = true
    uiState.errorMessage = 'لطفا بازه تاریخ را انتخاب کنید'
    return
  }
  if (startDate.value > endDate.value) {
    uiState.hasError = true
    uiState.errorMessage = 'تاریخ شروع نمی‌تواند بزرگتر از تاریخ پایان باشد'
    return
  }

  uiState.success = true
  uiState.successMessage = `درخواست مرخصی از ${startDate.value} تا ${endDate.value} ثبت شد`

  monthlyRequests.value.push({
    from: startDate.value,
    to: endDate.value,
    status: HR_REQUEST_STATUSES.HR_REQUEST_PENDING_STATUS,
  })
  startDate.value = ''
  endDate.value = ''
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
  <VSnackbar
    v-model="uiState.success"
    :timeout="2000"
    location="center"
    variant="flat"
    color="success"
  >
    {{ uiState.successMessage }}
  </VSnackbar>

  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      درخواست مرخصی ازدواج
    </h2>
  </div>

  <VRow class="pa-2" dense>
    <VCol cols="12" md="6" class="mx-auto">
      <VCard class="mb-4 pa-4">
        <label class="font-weight-medium mb-2 d-block text-center">
          تاریخ مرخصی
        </label>

        <VRow>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="startDate"
              label="تاریخ شروع"
              readonly
              variant="outlined"
              @click="showStartPicker = true"
            />
            <VDialog v-model="showStartPicker" max-width="300px">
              <VCard>
                <input id="startDate-input" style="display: none" />
                <PersianDatetimePicker
                  v-model="startDate"
                  format="jYYYY/jMM/jDD"
                  inline
                  custom-input="#startDate-input"
                  @change="selectStart"
                />
              </VCard>
            </VDialog>
          </VCol>

          <VCol cols="12" sm="6">
            <VTextField
              v-model="endDate"
              label="تاریخ پایان"
              readonly
              variant="outlined"
              @click="showEndPicker = true"
            />
            <VDialog v-model="showEndPicker" max-width="300px">
              <VCard>
                <input id="endDate-input" style="display: none" />
                <PersianDatetimePicker
                  v-model="endDate"
                  format="jYYYY/jMM/jDD"
                  inline
                  custom-input="#endDate-input"
                  @change="selectEnd"
                />
              </VCard>
            </VDialog>
          </VCol>
        </VRow>

        <VRow justify="center" class="mt-4">
          <VCol cols="auto">
            <VBtn color="primary" @click="submit">
              ثبت درخواست
            </VBtn>
          </VCol>
        </VRow>
      </VCard>

      <VCard>
        <label class="font-weight-medium mb-2 mt-2 d-block text-center">
          درخواست‌های ماه جاری
        </label>

        <!-- جدول دسکتاپ -->
        <div class="ma-3 overflow-auto d-none d-md-block">
          <table class="requests-table w-100">
            <thead>
              <tr>
                <th>تاریخ شروع</th>
                <th>تاریخ پایان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in monthlyRequests" :key="index">
                <td>{{ item.from }}</td>
                <td>{{ item.to }}</td>
                <td>{{ item.status }}</td>
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
        </div>

        <!-- کارت موبایل -->
        <div class="d-md-none pa-3">
          <VRow dense>
            <VCol v-for="(item, index) in monthlyRequests" :key="index" cols="12">
              <VCard outlined class="pa-3 mb-3">
                <div><strong>تاریخ شروع:</strong> {{ item.from }}</div>
                <div><strong>تاریخ پایان:</strong> {{ item.to }}</div>
                <div><strong>وضعیت:</strong> {{ item.status }}</div>
                <div class="mt-2 text-center">
                  <VBtn color="orange" variant="text" size="small">
                    <VIcon icon="tabler-edit" size="20" />
                  </VBtn>
                  <VBtn color="red" variant="text" size="small">
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>
                </div>
              </VCard>
            </VCol>
          </VRow>
        </div>
      </VCard>
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
