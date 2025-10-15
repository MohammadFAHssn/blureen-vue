<script setup>
const constants = inject('constants')

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const isLoading = ref(false)
const startDate = ref('')
const endDate = ref('')
const description = ref('')
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

async function submit() {
  if (!startDate.value || !endDate.value) {
    uiState.hasError = true
    uiState.errorMessage = 'لطفا بازه تاریخ را انتخاب کنید'
  }
  else if (startDate.value > endDate.value) {
    uiState.hasError = true
    uiState.errorMessage = 'تاریخ شروع نمی‌تواند بزرگتر از تاریخ پایان باشد'
  }
  else {
    const requestData = {
      request_type_id: constants.HR_REQUEST_TYPE_SICK_LEAVE,
      user_id: useCookie('userData').value.id,
      start_date: startDate.value,
      end_date: endDate.value,
      details: {
        description: description.value,
      },
    }

    try {
      await $api('/hr-request/create', {
        method: 'POST',
        body: requestData,
        onResponseError({ response }) {
          uiState.hasError = true
          uiState.errorMessage = response._data.message || 'خطا در ثبت مرخصی'
        },
      })

      uiState.success = true
      uiState.successMessage = `درخواست مرخصی استعلاجی ثبت گردید.`

      monthlyRequests.value.push({
        start_date: startDate.value,
        end_date: endDate.value,
        status_id: constants.HR_REQUEST_PENDING_STATUS,
      })
      startDate.value = ''
      endDate.value = ''
    }
    catch (err) {
      console.log(err)
    }
    finally {
      isLoading.value = false
    }
  }
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
  <div>
    <VBtn variant="text" prepend-icon="tabler-arrow-right" class="mb-4" @click="$emit('back')">
      صفحه اصلی
    </VBtn>
  </div>
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      ثبت استعلاجی
    </h2>
  </div>

  <VRow class="pa-2" dense>
    <VCol cols="12" md="6" class="mx-auto">
      <VCard class="mb-4 pa-4">
        <label class="font-weight-medium mb-2 d-block text-center">
          تاریخ استعلاجی
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
          <VCol cols="12">
            <VTextarea
              v-model="description"
              label="توضیحات"
              auto-grow
              variant="outlined"
              rows="3"
              placeholder="توضیحات بیماری..."
            />
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

      <div class="ma-3 overflow-auto d-none d-md-block">
        <VCard class="pa-4">
          <label class="font-weight-medium mb-4 d-block text-center">
            استعلاجی های ماه جاری
          </label>

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
                <td>{{ item.start_date }}</td>
                <td>{{ item.end_date }}</td>
                <td>{{ item.status_id }}</td>
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

      <div class="d-md-none pa-3">
        <VExpansionPanels variant="accordion">
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <span class="font-weight-medium">
                استعلاجی های ماه جاری
              </span>
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VRow dense>
                <VCol
                  v-for="(item, index) in monthlyRequests"
                  :key="index"
                  cols="12"
                >
                  <VCard outlined class="pa-3 mb-3">
                    <div><strong>تاریخ شروع:</strong> {{ item.start_date }}</div>
                    <div><strong>تاریخ پایان:</strong> {{ item.end_date }}</div>

                    <div class="d-flex align-center mt-1">
                      <strong class="mr-1">وضعیت:</strong>
                      <VChip
                        :color="
                          item.status_id === 'تایید شده'
                            ? 'success'
                            : item.status_id === 'رد شده'
                              ? 'error'
                              : 'warning'
                        "
                        size="small"
                        label
                        variant="tonal"
                      >
                        {{ item.status_id }}
                      </VChip>
                    </div>

                    <div class="mt-3 text-center">
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

              <div v-if="!monthlyRequests.length" class="text-center text-medium-emphasis mt-2">
                موردی یافت نشد!
              </div>
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
