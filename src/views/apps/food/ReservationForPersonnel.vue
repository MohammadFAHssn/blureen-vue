<script setup>
import { can } from '@layouts/plugins/casl'
import jalaali from 'jalaali-js'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isDeleteDialogVisible: false,
  isDetailsDialogVisible: false,
})
const pendingState = reactive({
  fetchingReservedMeals: true,
  fetchingMeals: false,
  reserveMeal: false,
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
const selectedReservedMeal = ref(null)

const reservationType = ref(null)

const userData = useCookie('userData')
const canReserveFood = computed(() => !!can('use', 'reserve-food'))
const datesKey = computed(() => {
  const v = reserveDates.value
  const arr = Array.isArray(v) ? v : (v ? [v] : [])
  return arr.filter(Boolean).join('|')
})
const loadedForReserveFood = ref(false)

// helper methods
// computed string just for showing in text field
const reserveDatesDisplay = computed(() => {
  if (!reserveDates.value || reserveDates.value.length === 0)
    return ''
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
  if (!selectedMeal.value) return setError('لطفاً وعده را انتخاب کنید.')
  if (!selectedPersonnel.value?.length) return setError('لطفاً حداقل یک نفر را انتخاب کنید.')

  for (const dateStr of selectedDates) {
    const [year, month, day] = String(dateStr).split('/').map(Number)
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
    supervisor_id: useCookie('userData')?.value?.id,
    personnel: selectedPersonnel.value,
  }

  try {
    const res = await $api('/food/meal-reservation', {
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

    const skipped = (res?.data || []).flatMap(item => item?.skippedPersonnel || [])
    const createdCounts = (res?.data || []).reduce((sum, item) => sum + ((item?.createdPersonnel || []).length), 0)

    const skippedMap = new Map()
    for (const s of skipped) {
      const name = s?.full_name
      const date = s?.date
      if (!name || !date)
        continue

      const normalizedDate = String(date).replaceAll('\\/', '/')
      if (!skippedMap.has(name))
        skippedMap.set(name, new Set())
      skippedMap.get(name).add(normalizedDate)
    }

    const skippedLines = Array.from(skippedMap.entries()).map(([name, dateSet]) => {
      const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b))
      return `برای ${name}: در: ${dates.join(' و ')}`
    })

    if (skippedLines.length) {
      // if nothing created at all, make it clear
      if (createdCounts === 0)
        setError(`هیچ رزروی ایجاد نشد. ${skippedLines.join(' | ')}  - رزرو وجود دارد`)
      else
        setError(`برای بعضی از پرسنل رزرو انجام نشد: ${skippedLines.join(' | ')} - رزرو وجود دارد`)
    }
    else {
      uiState.success = true
      uiState.successMessage = res?.message || 'رزرو با موفقیت انجام شد.'
    }

    if (reservationType.value === 'byYou')
      fetchReservedMealsForDateByUser()
    else
      fetchReservedMealsForDateForUser()
    selectedPersonnel.value = []
    selectedMeal.value = null
  }
  catch (err) {
    console.error('Error submitting reservation:', err)
  }
  finally {
    pendingState.reserveMeal = false
  }
}

function onClickDelete(reserv) {
  selectedReservedMeal.value = reserv
  uiState.isDeleteDialogVisible = true
}
async function onConfirmDelete() {
  if (!selectedReservedMeal.value)
    return

  pendingState.deleteReservedMeal = true

  try {
    const res = await $api(`/food/meal-reservation/${selectedReservedMeal.value.id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        setError(response._data?.message || 'خطا در حذف رزرو')
      },
    })

    if (uiState.hasError)
      return

    uiState.isDeleteDialogVisible = false

    if (res?.data) {
      reservedMealsByYou.value = reservedMealsByYou.value.filter(
        reserv => reserv.id !== selectedReservedMeal.value.id,
      )
    }
    else {
      setError('نمیتوان رزرو تحویل شده را حذف کرد')
      fetchReservedMealsForDateByUser()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.deleteReservedMeal = false
  }
}

function onClickDetail(reserv) {
  selectedReservedMeal.value = reserv
  uiState.isDetailsDialogVisible = true
}

async function fetchReservedMealsForDateByUser() {
  reservedMealsByYou.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-personnel-by-user-on-date', {
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
    const res = await $api('/food/meal-reservation/get-for-user-by-others-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    reservedMealsForYou.value = (res.data || []).flat()
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
    const { data } = await $api('/base/org-chart-node/user-subordinates', {
      method: 'GET',
      params: { user_id: useCookie('userData')?.value?.id },
    })
    users.value = (data || []).flat()
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
  if (reservationType.value === 'byYou')
    fetchReservedMealsForDateByUser()
  else
    fetchReservedMealsForDateForUser()
}

// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDetailsDialogVisible = val
  if (!val)
    selectedReservedMeal.value = null
}

async function deletePersonnel(id) {
  try {
    const res = await $api(`/food/meal-reservation-detail/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        setError(response._data?.message || 'خطا در حذف')
      },
    })

    if (res?.data) {
      selectedReservedMeal.value.details = selectedReservedMeal.value.details.filter(
        detail => detail.id !== id,
      )
    }
    else {
      setError('نمیتوان پرسنل رزرو تحویل شده را حذف کرد')
      uiState.isDetailsDialogVisible = false
      fetchReservedMealsForDateByUser()
    }
  }
  catch (err) {
    console.error(err)
  }
}

watch(
  () => [userData.value?.id, canReserveFood.value],
  async ([id, allowed]) => {
    if (!id) return

    if (!allowed) {
      loadedForReserveFood.value = false
      users.value = []
      meals.value = []
      selectedPersonnel.value = []
      selectedMeal.value = null
      return
    }

    if (loadedForReserveFood.value) return
    loadedForReserveFood.value = true

    await Promise.all([fetchMeals(), fetchUsers()])
  },
  { immediate: true },
)

let lastReservationKey = ''

watch(
  () => [userData.value?.id, canReserveFood.value, datesKey.value],
  async ([id, allowed, dk]) => {
    if (!id || !dk) return

    const key = `${id}|${allowed}|${dk}`
    if (key === lastReservationKey) return
    lastReservationKey = key

    reservationType.value = allowed ? 'byYou' : 'forYou'

    if (allowed) await fetchReservedMealsForDateByUser()
    else await fetchReservedMealsForDateForUser()
  },
  { immediate: true },
)

const sortedReservedMealsByUser = computed(() =>
  [...reservedMealsByYou.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

const sortedReservedMealsForUser = computed(() =>
  [...reservedMealsForYou.value].sort((a, b) =>
    String(a.reservation?.date || '').localeCompare(String(b.reservation?.date || '')),
  ),
)

onMounted(async () => {
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
        />
      </VCol>

      <VCol cols="12" md="8">
        <VCard v-if="can('read', 'Reserve-Meal')" class="mb-4">
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
              />
            </VCol>
            <VCol cols="12" class="mb-3">
              <VAutocomplete
                v-model="selectedPersonnel"
                :items="users"
                :item-title="item => `${item.first_name} ${item.last_name} - ${item.personnel_code}`"
                item-value="id"
                label="افراد"
                multiple
                chips
                clearable
                variant="outlined"
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
              v-if="can('read', 'Reserve-Meal')"
              v-model="reservationType"
              class="mt-2"
              inline
              @change="onChange"
            >
              <VRadio label="توسط شما" value="byYou" />
              <VRadio label="برای شما" value="forYou" />
            </VRadioGroup>

            <VTable v-if="!pendingState.fetchingReservedMeals && reservationType === 'byYou' && sortedReservedMealsByUser.length > 0">
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
                    <VBtn v-if="!item.status" color="red" variant="plain" size="small" @click="onClickDelete(item)">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                    <VBtn color="primary" variant="plain" size="small" @click="onClickDetail(item)">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VTable v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'forYou' && sortedReservedMealsForUser.length > 0">
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
            <VSkeletonLoader v-else-if="pendingState.fetchingReservedMeals" type="card" />
            <div v-else class="text-center">
              <VChip color="error">
                رزروی برای نمایش وجود ندارد
              </VChip>
            </div>
          </VCard>
        </div>

        <!-- برای موبایل -->
        <div class="d-md-none pa-3">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                رزروهای تاریخ‌های انتخاب شده
              </VExpansionPanelTitle>
              <VRadioGroup
                v-if="can('read', 'Reserve-Meal')"
                v-model="reservationType"
                class="mt-2"
                inline
                @change="onChange"
              >
                <VRadio label="توسط شما" value="byYou" />
                <VRadio label="برای شما" value="forYou" />
              </VRadioGroup>

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals && reservationType === 'byYou' && sortedReservedMealsByUser.length > 0">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item) in sortedReservedMealsByUser"
                    :key="item.id"
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
                          <strong>کد تحویل:</strong>
                          <VChip color="success">
                            {{ item.delivery_code }}
                          </VChip>
                        </div>
                        <div>
                          <strong>تاریخ:</strong>
                          <VChip>
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
                          <VBtn v-if="!item.status" color="red" variant="plain" size="small" @click="onClickDelete(item)">
                            <VIcon icon="tabler-trash" size="20" />
                          </VBtn>
                          <VBtn color="primary" variant="plain" size="small" @click="onClickDetail(item)">
                            <VIcon icon="tabler-file-description" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
              <VExpansionPanelText v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'forYou' && sortedReservedMealsForUser.length > 0">
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
                          <strong>تاریخ:</strong>
                          <VChip>
                            {{ item.reservation.date }}
                          </VChip>
                        </div>
                        <div>
                          <strong>رزرو شده توسط:</strong>
                          <VChip color="primary">
                            {{ item.createdBy }}
                          </VChip>
                        </div>
                        <div>
                          <strong>کد پرسنلی:</strong>
                          <VChip color="primary">
                            {{ item.personnelCode }}
                          </VChip>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
              <VSkeletonLoader v-else-if="pendingState.fetchingReservedMeals" type="card" />
              <div v-else class="text-center">
                <VChip color="error">
                  رزروی برای نمایش وجود ندارد
                </VChip>
              </div>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </VCol>
    </VRow>
  </VContainer>

  <!-- Delete Meal Reservation Dialog -->
  <AreYouSureDialog
    v-if="uiState.isDeleteDialogVisible"
    v-model:is-dialog-visible="uiState.isDeleteDialogVisible"
    title="آیا از حذف این رزرو اطمینان دارید؟"
    :loading="pendingState.deleteReservedMeal"
    @confirm="onConfirmDelete"
  />

  <!-- Reserved Meal Detail Dialog -->
  <VDialog
    v-if="selectedReservedMeal"
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isDetailsDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

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
        </VRow>

        <VDivider class="my-3" />

        <div>
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th
                  v-if="!selectedReservedMeal.status && (selectedReservedMeal.details?.reduce(
                    (sum, detail) => sum + (detail.quantity || 0),
                    0,
                  ) || 0) > 1"
                >
                  عملیات
                </th>
                <th v-if="selectedReservedMeal.status">
                  وضعیت
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(d, index) in (selectedReservedMeal.details || []).filter(x => x.personnel)"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <VChip>
                    {{ `${d.personnel.first_name} ${d.personnel.last_name}` }}
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ d.personnel.personnel_code }}
                  </VChip>
                </td>
                <td
                  v-if="!selectedReservedMeal.status && (selectedReservedMeal.details?.reduce(
                    (sum, detail) => sum + (detail.quantity || 0),
                    0,
                  ) || 0) > 1"
                >
                  <VBtn color="red" variant="text" size="small" @click="deletePersonnel(d.id)">
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>
                </td>
                <td v-if="selectedReservedMeal.status">
                  <VChip :color="d.delivery_status ? 'success' : 'error'" size="small">
                    {{ d.delivery_status ? 'تحویل شده' : 'تحویل نشده' }}
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
