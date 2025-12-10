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
  fetchingMeals: false,
  fetchingContractors: false,
  reserveMeal: false,
  editReservedMeal: false,
  deleteReservedMeal: false,
})

const reserveDates = ref([])
const maxDate = ref('')
const todayKey = ref(null)

const meals = ref([])
const contractors = ref([])
const reservedMealsForContractor = ref([])
const reservedMealsForGuest = ref([])

const selectedContractor = ref(null)
const selectedMeal = ref(null)
const quantity = ref(null)
const description = ref(null)
const serveType = ref(null)

const reservationType = ref(null)

// rules
const countInputRules = [
  (value) => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    const isInteger = /^\d+$/.test(String(value))

    if (!isInteger) {
      return 'فقط باید عدد باشد!'
    }

    return true
  },
]

// helper methods
// computed string just for showing in text field
const reserveDatesDisplay = computed(() => {
  if (!reserveDates.value || reserveDates.value.length === 0) return ''
  if (Array.isArray(reserveDates.value))
    return reserveDates.value.join(' - ')
  return reserveDates.value
})
// always get an array of date strings
function getSelectedDatesArray() {
  if (Array.isArray(reserveDates.value))
    return reserveDates.value.filter(Boolean)

  return reserveDates.value ? [reserveDates.value] : []
}
// error showcase
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
async function submit() {
  const selectedDates = getSelectedDatesArray()

  if (!selectedDates.length) {
    setError('لطفاً حداقل یک تاریخ برای رزرو انتخاب کنید.')
    return
  }

  for (const dateStr of selectedDates) {
    const [year, month, day] = dateStr.split('/').map(Number)
    const selectedKey = year * 10000 + month * 100 + day
    if (selectedKey < todayKey.value) {
      setError('امکان رزرو غذا فقط برای زمان حال و آینده وجود دارد.')
      return
    }
  }

  pendingState.reserveMeal = true

  let payload

  if (reservationType.value === 'contractor') {
    payload = {
      date: reserveDates.value,
      meal_id: selectedMeal.value,
      reserve_type: 'contractor',
      supervisor_id: useCookie('userData').value.id,
      contractor: selectedContractor.value,
      quantity: quantity.value,
    }
  }
  else {
    payload = {
      date: reserveDates.value,
      meal_id: selectedMeal.value,
      reserve_type: 'guest',
      supervisor_id: useCookie('userData').value.id,
      quantity: quantity.value,
      description: description.value,
      serve_place: serveType.value,
    }
  }

  try {
    const _res = await $api('/food/meal-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد'
        }
      },
    })

    uiState.success = true
    uiState.successMessage = 'رزرو با موفقیت انجام شد.'

    if (reservationType.value === 'contractor') {
      fetchReservedMealsForContractorOnDate()
    }
    else {
      fetchReservedMealsForGuestOnDate()
    }
    selectedContractor.value = null
    selectedMeal.value = null
    quantity.value = null
    description.value = null
  }
  catch (err) {
    console.error('Error submitting reservation:', err)
  }
  finally {
    pendingState.reserveMeal = false
  }
}

async function fetchReservedMealsForContractorOnDate() {
  reservedMealsForContractor.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-contractor-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    // res.data is [ [reservation], [reservation], ... ]
    reservedMealsForContractor.value = (res.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchReservedMealsForGuestOnDate() {
  reservedMealsForGuest.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-guest-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    // res.data is [ [reservation], [reservation], ... ]
    reservedMealsForGuest.value = (res.data || []).flat()
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

async function fetchMeals() {
  pendingState.fetchingMeals = true
  try {
    const res = await $api('/food/meal/get-actives', { method: 'GET' })
    meals.value = res?.data.meals || []
  }
  catch (e) {
    console.error('Error fetching meals:', e)
    setError(e.message || 'خطا در دریافت وعده‌ها')
  }
  finally {
    pendingState.fetchingMeals = false
  }
}

function onChange() {
  if (reservationType.value === 'contractor') {
    fetchReservedMealsForContractorOnDate()
  }
  else {
    fetchReservedMealsForGuestOnDate()
  }
}

const sortedReservedMealsForContractor = computed(() =>
  [...reservedMealsForContractor.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

const sortedReservedMealsForGuest = computed(() =>
  [...reservedMealsForGuest.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

onMounted(async () => {
  reservationType.value = 'contractor'
  serveType.value = 'deliver'

  await Promise.all([fetchMeals(), fetchContractors()])

  const today = new Date()

  const maxDateG = new Date(today)
  maxDateG.setDate(maxDateG.getDate() + 30)

  const [jToday, jMax] = [today, maxDateG].map(d =>
    jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()),
  )

  todayKey.value = jToday.jy * 10000 + jToday.jm * 100 + jToday.jd

  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  reserveDates.value = [fmt(jToday)]
  maxDate.value = fmt(jMax)

  await fetchReservedMealsForContractorOnDate()
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
          v-model="reserveDates"
          format="jYYYY/jMM/jDD"
          inline
          multiple
          :max="maxDate"
          custom-input="#custom-input"
          @change="onChange"
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
                label="تاریخ رزرو"
                variant="outlined"
                readonly
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12" md="12">
              <VSelect
                v-model="selectedMeal"
                :items="meals"
                item-title="name"
                item-value="id"
                label="وعده"
                variant="outlined"
                clearable
                :rules="[requiredValidator]"
              />
            </VCol>
            <VRadioGroup
              v-model="reservationType"
              :rules="[requiredValidator]"
              class="mt-2"
              inline
              @change="onChange"
            >
              <VRadio
                label="پیمانکار"
                value="contractor"
              />
              <VRadio
                label="میهمان"
                value="guest"
              />
            </VRadioGroup>
            <VCol v-if="reservationType === 'guest'" cols="12" class="mb-3">
              <VTextField
                v-model="quantity"
                label="تعداد"
                variant="outlined"
                :rules="[requiredValidator, ...countInputRules]"
              />
              <VTextField
                v-model="description"
                label="توضیحات"
                variant="outlined"
                :rules="[requiredValidator]"
              />
              <VRadioGroup
                v-model="serveType"
                :rules="[requiredValidator]"
                class="mt-2"
                inline
              >
                <VRadio
                  label="سرو در آشپزخانه"
                  value="serve_in_kitchen"
                />
                <VRadio
                  label="تحویل"
                  value="deliver"
                />
              </VRadioGroup>
            </VCol>
            <VCol v-else-if="reservationType === 'contractor'" cols="12" sm="12" md="12">
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
              <VTextField
                v-model="quantity"
                label="تعداد"
                variant="outlined"
                :rules="[requiredValidator, ...countInputRules]"
              />
            </VCol>
          </VRow>
          <VRow justify="center" class="mb-4">
            <VCol cols="auto">
              <VBtn
                color="primary"
                :loading="pendingState.reserveMeal"
                :disabled="pendingState.reserveMeal"
                @click="submit"
              >
                ثبت
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

            <VTable v-if="!pendingState.fetchingReservedMeals && reservationType === 'contractor'">
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
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                    <VBtn color="red" variant="text" size="small">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                    <VBtn color="primary" variant="text" size="small">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VTable v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'guest'">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>کد تحویل</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>رزرو شده توسط</th>
                  <th>سرو غذا</th>
                  <th>تعداد</th>
                  <th>توضیحات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sortedReservedMealsForGuest" :key="index">
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
                      {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                    </VChip>
                  </td>
                  <td>
                    <VChip size="small">
                      {{ item.serve_place === 'serve_in_kitchen' ? 'سرو در آشپزخانه' : 'تحویل' }}
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
                    <VChip>
                      {{ item.description }}
                    </VChip>
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

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals && reservationType === 'contractor'">
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
                          <VBtn color="orange" variant="text" size="small">
                            <VIcon icon="tabler-edit" size="20" />
                          </VBtn>
                          <VBtn color="red" variant="text" size="small">
                            <VIcon icon="tabler-trash" size="20" />
                          </VBtn>
                          <VBtn color="primary" variant="text" size="small">
                            <VIcon icon="tabler-file-description" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
              <VExpansionPanelText v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'guest'">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsForGuest"
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
                          <strong>رزرو شده توسط:</strong>
                          <VChip>
                            {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                          </VChip>
                        </div>
                        <div>
                          <strong>سرو غذا:</strong> <VChip size="small">
                            {{ item.serve_place === 'serve_in_kitchen' ? 'سرو در آشپزخانه' : 'تحویل' }}
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
                        <div>
                          <strong>توضیحات:</strong> <VChip>
                            {{ item.description }}
                          </VChip>
                        </div>
                        <div class="mt-2 text-center">
                          <VBtn color="orange" variant="text" size="small">
                            <VIcon icon="tabler-edit" size="20" />
                          </VBtn>
                          <VBtn color="red" variant="text" size="small">
                            <VIcon icon="tabler-trash" size="20" />
                          </VBtn>
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
