<script setup>
import jalaali from 'jalaali-js'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isDetailsDialogVisible: false,
})
const pendingState = reactive({
  fetchingReservedMeals: false,
  fetchingContractors: false,
})

const dates = ref([])

const contractors = ref([])
const reservedMeals = ref([])
const selectedReservedMeal = ref(null)

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
// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDetailsDialogVisible = val
}

function onClickDetail(reserv) {
  selectedReservedMeal.value = reserv
  uiState.isDetailsDialogVisible = true
}

async function fetchReservedMealsForContractorOnDate() {
  if (!dates.value[1]) {
    setError('تاریخ باید به صورت بازه‌ای باشد.')
    return
  }
  if (!selectedContractor.value) {
    setError('یک پیمانکار انتخاب کنید.')
    return
  }
  reservedMeals.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-specific-contractor-on-date', {
      method: 'GET',
      params: {
        'contractor': selectedContractor.value,
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

const sortedReservedMeals = computed(() =>
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
          <VCard v-if="!pendingState.fetchingReservedMeals && sortedReservedMeals.length > 0" class="pa-4">
            <label class="font-weight-medium mb-4 d-block text-center">
              رزروهای تحویل شده
            </label>
            <label class="font-weight-medium mb-4 d-block text-center">
              پیمانکار:
              {{
                sortedReservedMeals?.[0]?.details?.find(d => d.contractor)?.contractor
                  ? `${sortedReservedMeals[0].details.find(d => d.contractor).contractor.first_name}
                  ${sortedReservedMeals[0].details.find(d => d.contractor).contractor.last_name}`
                  : '—'
              }}
            </label>

            <VTable>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>تاریخ</th>
                  <th>تعداد</th>
                  <th>مبلغ</th>
                  <th>جزئیات</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in sortedReservedMeals" :key="item.id">
                  <td>{{ index + 1 }}</td>

                  <td>{{ item.meal?.name }}</td>

                  <td>
                    <VChip>
                      {{ item.date }}
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
                    <VChip color="primary">
                      {{ Number(item.details?.reduce(
                        (sum, detail) =>
                          sum + ((detail.quantity || 0) * (detail.food_price || 0)),
                        0,
                      )).toLocaleString('fa-IR') }} ریال
                    </VChip>
                  </td>

                  <td>
                    <VBtn color="primary" variant="text" size="small" @click="onClickDetail(item)">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>
          <VSkeletonLoader v-else-if="pendingState.fetchingReservedMeals" type="card" />
          <div v-else class="text-center">
            <VChip color="error">
              رزروی برای نمایش وجود ندارد
            </VChip>
          </div>
        </div>

        <!-- برای موبایل -->
        <div class="d-md-none pa-3">
          <VExpansionPanels v-if="!pendingState.fetchingReservedMeals && sortedReservedMeals.length > 0" variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                <label class="font-weight-medium mb-4 d-block text-center">
                  رزروهای تحویل شده
                  پیمانکار:
                  {{
                    sortedReservedMeals?.[0]?.details?.find(d => d.contractor)?.contractor
                      ? `${sortedReservedMeals[0].details.find(d => d.contractor).contractor.first_name}
                  ${sortedReservedMeals[0].details.find(d => d.contractor).contractor.last_name}`
                      : '—'
                  }}
                </label>
              </VExpansionPanelTitle>

              <VExpansionPanelText>
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMeals"
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
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div>
                          <strong>تعداد:</strong> {{
                            item.details?.reduce(
                              (sum, detail) => sum + (detail.quantity || 0),
                              0,
                            )
                          }}
                        </div>
                        <div>
                          <strong>مبلغ:</strong>
                          <VChip color="primary">
                            {{ Number(item.details?.reduce(
                              (sum, detail) =>
                                sum + ((detail.quantity || 0) * (detail.food_price || 0)),
                              0,
                            )).toLocaleString('fa-IR') }} ریال
                          </VChip>
                        </div>
                        <div class="mt-2 text-center">
                          <VBtn color="primary" variant="text" size="small" @click="onClickDetail(item)">
                            <VIcon icon="tabler-file-description" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
          <VSkeletonLoader v-else-if="pendingState.fetchingReservedMeals" type="card" />
          <div v-else class="text-center">
            <VChip color="error">
              رزروی برای نمایش وجود ندارد
            </VChip>
          </div>
        </div>
      </VCol>
    </VRow>
  </VContainer>

  <!-- Reserved Meal Detail Dialog -->
  <VDialog
    v-if="selectedReservedMeal"
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isDetailsDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="uiState.isDetailsDialogVisible = false" />

    <VCard>
      <VCardTitle class="text-h6">
        جزئیات
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p>
              <strong>رزرو کننده:</strong>
              <VChip color="orange" size="small">
                {{ selectedReservedMeal.created_by ? `${selectedReservedMeal.created_by.first_name} ${selectedReservedMeal.created_by.last_name}` : '—' }}
              </VChip>
            </p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>کد پرسنلی:</strong>
              <VChip color="orange" size="small">
                {{ selectedReservedMeal.created_by ? `${selectedReservedMeal.created_by.personnel_code}` : '—' }}
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <strong>کد تحویل:</strong>
            <VChip color="primary" size="small">
              {{ selectedReservedMeal.delivery_code }}
            </VChip>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>وعده:</strong>
              <VChip color="primary" size="small">
                {{ selectedReservedMeal.meal?.name }}
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <p>
              <strong>وضعیت:</strong>
              <VChip :color="selectedReservedMeal.status ? 'success' : 'error'" size="small">
                {{ selectedReservedMeal.status ? 'تحویل شده' : 'تحویل نشده' }}
              </VChip>
            </p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>تاریخ:</strong>
              <VChip size="small">
                {{ selectedReservedMeal.date }}
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <p>
              <strong>تعداد:</strong>
              <VChip size="small">
                {{
                  selectedReservedMeal.details?.reduce(
                    (sum, detail) => sum + (detail.quantity || 0),
                    0,
                  )
                }}
              </VChip>
            </p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>مبلغ:</strong>
              <VChip color="success">
                {{ Number(selectedReservedMeal.details?.reduce(
                  (sum, detail) =>
                    sum + ((detail.quantity || 0) * (detail.food_price || 0)),
                  0,
                )).toLocaleString('fa-IR') }} ریال
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <div>
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>غذا</th>
                <th>قیمت</th>
                <th>تعداد</th>
                <th>مبلغ کل</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(d, index) in (selectedReservedMeal.details)"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <VChip>
                    {{ d.food.name }}
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ Number(d.food_price).toLocaleString('fa-IR') }} ریال
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ d.quantity }}
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ Number(d.quantity * d.food_price).toLocaleString('fa-IR') }} ریال
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <VDivider class="my-3" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
