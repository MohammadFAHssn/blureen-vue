<script setup>
import jalaali from 'jalaali-js'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const pendingState = reactive({
  fetchingReservedMeals: false,
  fetchingContractors: false,
})

const dates = ref([])

const contractors = ref([])
const reservedMeals = ref([])

const selectedContractor = ref(null)

// helper methods
// computed string just for showing in text field
const reserveDatesDisplay = computed(() => {
  if (!dates.value || dates.value.length === 0) return ''
  if (Array.isArray(dates.value))
    return dates.value.join(' - ')
  return dates.value
})
// error showcase
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
async function fetchReservedMealsForContractorOnDate() {
  reservedMeals.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-contractor-on-date', {
      method: 'GET',
      params: {
        'date[]': dates.value,
      },
    })

    // res.data is [ [reservation], [reservation], ... ]
    reservedMeals.value = (res.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchContractors() {
  pendingState.fetchingContractors = true
  try {
    const res = await $api('/contractor/get-actives', { method: 'GET' })
    contractors.value = res?.data.contractors || []
  }
  catch (e) {
    console.error('Error fetching contractors:', e)
    setError(e.message || 'خطا در دریافت پیمانکاران')
  }
  finally {
    pendingState.fetchingContractors = false
  }
}

const sortedReservedMealsForContractor = computed(() =>
  [...reservedMeals.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

onMounted(async () => {
  await Promise.all([fetchContractors()])

  const today = new Date()

  const [jToday] = [today].map(d =>
    jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()),
  )

  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  dates.value = [fmt(jToday)]
})
</script>

<template>
  <VContainer>
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

    <VRow dense>
      <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
        <input id="custom-input" style="display: none" />
        <PersianDatetimePicker
          v-model="dates"
          format="jYYYY/jMM/jDD"
          inline
          range
          custom-input="#custom-input"
        />
      </VCol>

      <VCol cols="12" md="8">
        <VCard class="mb-4">
          <label class="font-weight-medium mb-2 mt-2 d-block text-center">
            جزئیات
          </label>
          <VRow class="mb-4 px-4">
            <VCol cols="12" sm="12" md="12">
              <VTextField
                :model-value="reserveDatesDisplay"
                label="بازه زمانی"
                variant="outlined"
                readonly
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12" sm="12" md="12">
              <VAutocomplete
                v-model="selectedContractor"
                :items="contractors"
                item-title="fullName"
                item-value="id"
                label="پیمانکار"
                chips
                clearable
                variant="outlined"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow justify="center" class="mb-4">
            <VCol cols="auto">
              <VBtn
                color="primary"
                :loading="pendingState.fetchingReservedMeals"
                :disabled="pendingState.fetchingReservedMeals"
                @click="fetchReservedMealsForContractorOnDate"
              >
                جستجو
              </VBtn>
            </VCol>
          </VRow>
        </VCard>

        <!-- برای دسکتاپ -->
        <div class="ma-3 overflow-auto d-none d-md-block">
          <VCard class="pa-4">
            <label class="font-weight-medium mb-4 d-block text-center">
              رزروهای تاریخ‌های انتخاب شده
            </label>

            <VTable v-if="!pendingState.fetchingReservedMeals">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>کد تحویل</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>پیمانکار</th>
                  <th>تعداد</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in sortedReservedMealsForContractor" :key="item.id">
                  <td>{{ index + 1 }}</td>

                  <td>{{ item.meal?.name }}</td>

                  <td>
                    <VChip color="success">
                      {{ item.delivery_code }}
                    </VChip>
                  </td>

                  <td>
                    <VChip :color="item.status ? 'success' : 'error'" size="small">
                      {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                    </VChip>
                  </td>

                  <td>
                    <VChip>
                      {{ item.date }}
                    </VChip>
                  </td>

                  <td>
                    <VChip>
                      {{
                        item.details?.[0]?.contractor
                          ? `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                          : '—'
                      }}
                    </VChip>
                  </td>

                  <td>
                    {{
                      item.details?.reduce(
                        (sum, detail) => sum + (detail.quantity || 0),
                        0,
                      )
                    }}
                  </td>

                  <td>
                    <VBtn color="primary" variant="text" size="small">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VSkeletonLoader v-else type="card" />
          </VCard>
        </div>

        <!-- برای موبایل -->
        <div class="d-md-none pa-3">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                رزروهای تاریخ‌های انتخاب شده
              </VExpansionPanelTitle>

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsForContractor"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.meal?.name }}</span>
                        <span>
                          <VChip>
                            {{ item.date }}
                          </VChip>
                        </span>
                        <VChip
                          :color="item.status ? 'success' : 'error'"
                          size="small"
                          label
                        >
                          {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                        </VChip>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div>
                          <strong>کد تحویل:</strong> <VChip color="success">
                            {{ item.delivery_code }}
                          </VChip>
                        </div>
                        <div>
                          <strong>پیمانکار:</strong>
                          <VChip>
                            {{
                              item.details?.[0]?.contractor
                                ? `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                                : '—'
                            }}
                          </VChip>
                        </div>
                        <div>
                          <strong>تعداد:</strong> {{
                            item.details?.reduce(
                              (sum, detail) => sum + (detail.quantity || 0),
                              0,
                            )
                          }}
                        </div>
                        <div class="mt-2 text-center">
                          <VBtn color="primary" variant="text" size="small">
                            <VIcon icon="tabler-file-description" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
              <VSkeletonLoader v-else type="card" />
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>
