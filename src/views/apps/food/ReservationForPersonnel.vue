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
  reserveMeal: false,
  editReservedMeal: false,
  deleteReservedMeal: false,
})

const reserveDates = ref([])
const maxDate = ref('')
const todayKey = ref(null)

const users = ref([])
const meals = ref([])
const reservedMealsByYou = ref([])
const reservedMealsForYou = ref([])

const selectedPersonnel = ref([])
const selectedMeal = ref(null)

const reservationType = ref(null)

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

  const payload = {
    date: reserveDates.value,
    meal_id: selectedMeal.value,
    reserve_type: 'personnel',
    supervisor_id: useCookie('userData').value.id,
    personnel: selectedPersonnel.value,
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

    if (reservationType.value === 'byYou') {
      fetchReservedMealsForDateByUser()
    }
    else {
      fetchReservedMealsForDateForUser()
    }
    selectedPersonnel.value = null
    selectedMeal.value = null
  }
  catch (err) {
    console.error('Error submitting reservation:', err)
  }
  finally {
    pendingState.reserveMeal = false
  }
}

async function fetchReservedMealsForDateByUser() {
  reservedMealsByYou.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-reservations-for-personnel-by-user-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    // res.data is [ [reservation], [reservation], ... ]
    reservedMealsByYou.value = (res.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchReservedMealsForDateForUser() {
  reservedMealsForYou.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-reservations-for-user-by-others-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    reservedMealsForYou.value = res.data || []
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchUsers() {
  try {
    const { data, error } = await useApi(createUrl('/base/user'))
    if (error.value) {
      setError('خطا در دریافت کاربران')
      throw error.value
    }

    if (data.value.data) {
      users.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
    }
  }
  catch (e) {
    console.error('Unexpected error fetching users:', e)
    setError('خطای غیرمنتظره در دریافت کاربران')
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
  if (reservationType.value === 'byYou') {
    fetchReservedMealsForDateByUser()
  }
  else {
    fetchReservedMealsForDateForUser()
  }
}

const sortedReservedMealsByUser = computed(() =>
  [...reservedMealsByYou.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

const sortedReservedMealsForUser = computed(() =>
  [...reservedMealsForYou.value].sort((a, b) =>
    String(a.reservation.date).localeCompare(String(b.reservation.date)),
  ),
)

onMounted(async () => {
  reservationType.value = 'byYou'

  await Promise.all([fetchMeals(), fetchUsers()])

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

  await fetchReservedMealsForDateByUser()
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
            <VCol cols="12" class="mb-3">
              <VAutocomplete
                v-model="selectedPersonnel"
                :items="users"
                item-title="fullName"
                item-value="id"
                label="افراد"
                multiple
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

            <VRadioGroup
              v-model="reservationType"
              :rules="[requiredValidator]"
              class="mt-2"
              inline
              @change="onChange"
            >
              <VRadio
                label="توسط شما"
                value="byYou"
              />
              <VRadio
                label="برای شما"
                value="forYou"
              />
            </VRadioGroup>

            <VTable v-if="!pendingState.fetchingReservedMeals && reservationType === 'byYou'">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>کد تحویل</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>تعداد</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in sortedReservedMealsByUser" :key="item.id">
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
            <VTable v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'forYou'">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>تاریخ</th>
                  <th>رزرو شده توسط</th>
                  <th>کد پرسنلی</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sortedReservedMealsForUser" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.reservation.mealName }}</td>
                  <td>
                    <VChip>
                      {{ item.reservation.date }}
                    </VChip>
                  </td>
                  <td>
                    <VChip color="primary">
                      {{ item.createdBy }}
                    </VChip>
                  </td>
                  <td>
                    <VChip>
                      {{ item.personnelCode }}
                    </VChip>
                  </td>
                  <td>
                    <VChip :color="item.deliveryStatus ? 'success' : 'error'" size="small">
                      {{ item.deliveryStatus ? 'تحویل شده' : 'تحویل نشده' }}
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

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals && reservationType === 'byYou'">
                <VRadioGroup
                  v-model="reservationType"
                  :rules="[requiredValidator]"
                  class="mt-2"
                  inline
                  @change="onChange"
                >
                  <VRadio
                    label="توسط شما"
                    value="byYou"
                  />
                  <VRadio
                    label="برای شما"
                    value="forYou"
                  />
                </VRadioGroup>
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsByUser"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.meal?.name }}</span>
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
                          <strong>تاریخ:</strong> <VChip>
                            {{ item.date }}
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
              <VExpansionPanelText v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'forYou'">
                <VRadioGroup
                  v-model="reservationType"
                  :rules="[requiredValidator]"
                  class="mt-2"
                  inline
                  @change="onChange"
                >
                  <VRadio
                    label="توسط شما"
                    value="byYou"
                  />
                  <VRadio
                    label="برای شما"
                    value="forYou"
                  />
                </VRadioGroup>
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsForUser"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.reservation.mealName }}</span>
                        <VChip :color="item.deliveryStatus ? 'success' : 'error'" size="small">
                          {{ item.deliveryStatus ? 'تحویل شده' : 'تحویل نشده' }}
                        </VChip>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div>
                          <strong>تاریخ:</strong> <VChip>
                            {{ item.reservation.date }}
                          </VChip>
                        </div>
                        <div>
                          <strong>رزرو شده توسط:</strong> <VChip color="primary">
                            {{ item.createdBy }}
                          </VChip>
                        </div>
                        <div>
                          <strong>کد پرسنلی:</strong> <VChip color="primary">
                            {{ item.personnelCode }}
                          </VChip>
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
