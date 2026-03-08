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
  fetchingContractors: false,
  reserveMeal: false,
  deleteReservedMeal: false,
  switchingPersonnel: false,
})

const reserveDates = ref([])
const maxDate = ref('')
const todayKey = ref(null)

const users = ref([])
const contractors = ref([])
const meals = ref([])
const reservedMealsByUser = ref([])
const reservedMealsForUser = ref([])

const selectedPersonnel = ref([])
const selectedContractor = ref(null)
const selectedMeal = ref(null)
const selectedReservedMeal = ref(null)

const quantity = ref(null)
const description = ref(null)
const serveType = ref('deliver')
const attendanceHour = ref(null)

const reservationType = ref('personnel')
const reservationBy = ref('byYou')

function calcTotalQty(details) {
  return (details || []).reduce((sum, d) => sum + (d?.quantity || 0), 0)
}
function totalQtyOf(item) {
  return calcTotalQty(item?.details)
}
const selectedTotalQty = computed(() =>
  calcTotalQty(selectedReservedMeal.value?.details),
)

// Switch Personnel
const requestNewPersonnel = ref(null)
const switchRowId = ref(false)
function startSwitch(d) {
  switchRowId.value = d.id
  const found = users.value.find(
    user => user.personnel_code === d.personnel.personnel_code,
  )
  requestNewPersonnel.value = found?.id ?? null
}
function cancelSwitch() {
  switchRowId.value = null
}
async function confirmSwitch(id) {
  await switchPersonnel(id)
  cancelSwitch()
}

// helpers
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
const reserveTypeLabel = {
  personnel: 'پرسنل',
  contractor: 'پیمانکار',
  guest: 'مهمان',
  repairman: 'تعمیرکار',
}
const servePlaceLabel = {
  serve_in_kitchen: 'سرو در رستوران',
  deliver: 'تحویل(بیرون‌بر)',
}
const statusLabel = s => (s ? 'تحویل شده' : 'تحویل نشده')
const statusColor = s => (s ? 'success' : 'error')

// methods
async function submit() {
  const selectedDates = getSelectedDatesArray()

  if (!selectedDates.length) return setError('لطفاً حداقل یک تاریخ برای رزرو انتخاب کنید.')
  if (!selectedMeal.value) return setError('لطفاً وعده را انتخاب کنید.')
  if (reservationType.value === 'personnel' && !selectedPersonnel.value?.length) return setError('لطفاً حداقل یک نفر را انتخاب کنید.')
  if (reservationType.value === 'contractor' && !selectedContractor.value) return setError('لطفاً پیمانکار را انتخاب کنید.')
  if (reservationType.value !== 'personnel' && !quantity.value) return setError('لطفاً تعداد را وارد کنید.')
  if (reservationType.value !== 'personnel' && reservationType.value !== 'contractor' && !description.value) return setError('لطفاً توضیحات را وارد کنید.')
  if (reservationType.value === 'guest' && serveType.value === 'serve_in_kitchen' && !attendanceHour.value) return setError('لطفا ساعت حضور در رستوران را تعیین کنید.')

  for (const dateStr of selectedDates) {
    const [year, month, day] = String(dateStr).split('/').map(Number)
    const selectedKey = year * 10000 + month * 100 + day
    if (selectedKey < todayKey.value) {
      setError('امکان رزرو غذا فقط برای زمان حال و آینده وجود دارد.')
      return
    }
  }

  pendingState.reserveMeal = true
  const userId = useCookie('userData')?.value?.id

  let payload = {
    date: reserveDates.value,
    meal_id: selectedMeal.value,
    reserve_type: reservationType.value,
    supervisor_id: userId,
  }
  if (reservationType.value === 'personnel') {
    payload = {
      ...payload,
      personnel: selectedPersonnel.value,
    }
  }
  else if (reservationType.value === 'contractor') {
    payload = {
      ...payload,
      contractor: selectedContractor.value,
      quantity: quantity.value,
    }
  }
  else if (reservationType.value === 'guest') {
    payload = {
      ...payload,
      quantity: quantity.value,
      description: description.value,
      serve_place: serveType.value,
      ...(attendanceHour.value ? { attendance_hour: attendanceHour.value } : {}),
    }
  }
  else if (reservationType.value === 'repairman') {
    payload = {
      ...payload,
      quantity: quantity.value,
      description: description.value,
    }
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

    if (reservationBy.value === 'byYou')
      fetchReservedMealsByUserOnDate()
    else
      fetchReservedMealsForUserOnDate()
    resetForm()
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
      reservedMealsByUser.value = reservedMealsByUser.value.filter(
        reserv => reserv.id !== selectedReservedMeal.value.id,
      )
    }
    else {
      setError('نمیتوان رزرو تحویل شده را حذف کرد')
      fetchReservedMealsByUserOnDate()
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

async function fetchReservedMealsByUserOnDate() {
  reservedMealsByUser.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-by-user-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    // res.data is [ [reservation], [reservation], ... ]
    reservedMealsByUser.value = (res.data || []).flat()
    return reservedMealsByUser.value
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
    return []
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchReservedMealsForUserOnDate() {
  reservedMealsForUser.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-for-user-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
      },
    })

    reservedMealsForUser.value = (res.data || []).flat()
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
    const { data } = await $api('/base/user/subordinates', {
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

function resetForm() {
  selectedPersonnel.value = []
  selectedContractor.value = null
  selectedMeal.value = null
  quantity.value = null
  description.value = null
  attendanceHour.value = null
  serveType.value = 'deliver'
}

function onByChange() {
  if (reservationBy.value === 'byYou')
    fetchReservedMealsByUserOnDate()
  else
    fetchReservedMealsForUserOnDate()
}

// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDetailsDialogVisible = val
  if (!val) {
    selectedReservedMeal.value = null
    requestNewPersonnel.value = null
    cancelSwitch()
  }
}

async function deletePersonnel(id) {
  if (selectedTotalQty.value < 2) return setError('نمیتوان تمام کاربران درخواست را حذف کرد')
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
      fetchReservedMealsByUserOnDate()
    }
  }
  catch (err) {
    console.error(err)
  }
}

async function switchPersonnel(id) {
  pendingState.switchingPersonnel = true
  const payload = {
    id,
    new_personnel: requestNewPersonnel.value,
    date: selectedReservedMeal.value.date,
    status: selectedReservedMeal.value.status,
    reserved_meal_id: selectedReservedMeal.value.id,
  }
  try {
    const _res = await $api('/food/meal-reservation-detail/switch', {
      method: 'POST',
      body: JSON.stringify(payload),
      onResponseError({ response }) {
        setError(response._data?.error || 'خطا در جابه‌جایی')
      },
    })
    const list = await fetchReservedMealsByUserOnDate()
    const updated = list.find(r => r.id === selectedReservedMeal.value?.id)
    if (updated) selectedReservedMeal.value = updated
    requestNewPersonnel.value = null
    pendingState.switchingPersonnel = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.switchingPersonnel = false
  }
}

const sortedReservedMealsByUser = computed(() =>
  [...reservedMealsByUser.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  ),
)

const sortedReservedMealsForUser = computed(() =>
  [...reservedMealsForUser.value].sort((a, b) =>
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

  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  todayKey.value = jToday.jy * 10000 + jToday.jm * 100 + jToday.jd
  reserveDates.value = [fmt(jToday)]
  maxDate.value = fmt(jMax)
  await Promise.all([fetchMeals(), fetchUsers(), fetchContractors(), fetchReservedMealsByUserOnDate()])
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
        @change="onByChange()"
      />
    </VCol>

    <VCol cols="12" md="8">
      <VCard v-if="can('read', 'Reserve-Food')" class="mb-4">
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
          <VRadioGroup
            v-model="reservationType"
            class="mt-2"
            inline
            @change="resetForm"
          >
            <VRadio label="پرسنل" value="personnel" />
            <VRadio label="پیمانکار" value="contractor" />
            <VRadio label="میهمان" value="guest" />
            <VRadio label="تعمیرکار" value="repairman" />
          </VRadioGroup>
          <VCol v-if="reservationType === 'personnel'" cols="12" class="mb-3">
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
          <VCol v-else-if="reservationType === 'guest'" cols="12" class="mb-3">
            <VTextField
              v-model="quantity"
              label="تعداد"
              type="number"
              variant="outlined"
            />
            <VTextField
              v-model="description"
              label="توضیحات"
              variant="outlined"
            />
            <VRadioGroup
              v-model="serveType"
              class="mt-2"
              inline
              @change="attendanceHour = null"
            >
              <VRadio label="سرو در رستوران" value="serve_in_kitchen" />
              <VRadio label="تحویل(بیرون‌بر)" value="deliver" />
            </VRadioGroup>
            <VCol v-if="serveType === 'serve_in_kitchen'" cols="12" md="12">
              <PersianDatetimePicker
                v-model="attendanceHour"
                type="time"
                label="حضور"
                append-to="body"
              />
            </VCol>
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
            />
            <VTextField
              v-model="quantity"
              label="تعداد"
              type="number"
              variant="outlined"
            />
          </VCol>
          <VCol v-else-if="reservationType === 'repairman'" cols="12" class="mb-3">
            <VTextField
              v-model="quantity"
              label="تعداد"
              type="number"
              variant="outlined"
            />
            <VTextField
              v-model="description"
              label="توضیحات"
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
            v-model="reservationBy"
            class="mt-2"
            inline
            @change="onByChange"
          >
            <VRadio label="توسط شما" value="byYou" />
            <VRadio label="برای شما" value="forYou" />
          </VRadioGroup>

          <VTable v-if="!pendingState.fetchingReservedMeals && reservationBy === 'byYou' && sortedReservedMealsByUser.length > 0">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>وعده</th>
                <th>کد تحویل</th>
                <th>نوع رزرو</th>
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

                <td><VChip>{{ reserveTypeLabel[item.reserve_type] || '' }}</VChip></td>

                <td>
                  <VChip :color="statusColor(item.status)" size="small">
                    {{ statusLabel(item.status) }}
                  </VChip>
                </td>

                <td>
                  <VChip>
                    {{ item.date }}
                  </VChip>
                </td>

                <td>
                  {{ totalQtyOf(item) }}
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
          <VTable v-else-if="!pendingState.fetchingReservedMeals && reservationBy === 'forYou' && sortedReservedMealsForUser.length > 0">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>وعده</th>
                <th>تاریخ</th>
                <th>رزرو شده توسط</th>
                <th>کد پرسنلی</th>
                <th>کد تحویل</th>
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
                  <VChip>
                    {{ item.deliveryCode }}
                  </VChip>
                </td>
                <td>
                  <VChip :color="statusColor(item.deliveryStatus)" size="small">
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
              v-model="reservationBy"
              class="mt-2"
              inline
              @change="onByChange"
            >
              <VRadio label="توسط شما" value="byYou" />
              <VRadio label="برای شما" value="forYou" />
            </VRadioGroup>

            <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals && reservationBy === 'byYou' && sortedReservedMealsByUser.length > 0">
              <VExpansionPanels variant="accordion">
                <VExpansionPanel
                  v-for="(item) in sortedReservedMealsByUser"
                  :key="item.id"
                  class="mb-2"
                >
                  <VExpansionPanelTitle>
                    <div class="d-flex flex-column w-100">
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span>{{ item.meal?.name }}</span>
                        <VChip :color="statusColor(item.status)" size="small">
                          {{ statusLabel(item.status) }}
                        </VChip>
                      </div>
                      <div class="d-flex justify-space-between align-center mb-1">
                        <VChip color="success">
                          {{ item.delivery_code }}
                        </VChip>
                        <VChip>{{ reserveTypeLabel[item.reserve_type] || '' }}</VChip>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <VChip>
                          {{ item.date }}
                        </VChip>
                        <span>تعداد:
                          {{ totalQtyOf(item) }}</span>
                      </div>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="pa-2">
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
            <VExpansionPanelText v-else-if="!pendingState.fetchingReservedMeals && reservationBy === 'forYou' && sortedReservedMealsForUser.length > 0">
              <VExpansionPanels variant="accordion">
                <VExpansionPanel
                  v-for="(item, index) in sortedReservedMealsForUser"
                  :key="index"
                  class="mb-2"
                >
                  <VExpansionPanelTitle>
                    <div class="d-flex flex-column w-100">
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span>{{ item.reservation.mealName }}</span>
                        <VChip :color="statusColor(item.deliveryStatus)" size="small">
                          {{ item.deliveryStatus ? 'تحویل شده' : 'تحویل نشده' }}
                        </VChip>
                      </div>
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span><VChip color="success">
                          {{ item.deliveryCode }}
                        </VChip></span>
                        <VChip>
                          {{ item.reservation.date }}
                        </VChip>
                      </div>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="pa-2">
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

          <VDivider class="my-3" />

          <VCol cols="12" sm="6">
            <p>
              <strong>نوع رزرو:</strong>
              <VChip size="small">
                {{ reserveTypeLabel[selectedReservedMeal.reserve_type] || '' }}
              </VChip>
            </p>
          </VCol>

          <VCol v-if="selectedReservedMeal.details?.[0]?.contractor" cols="12" sm="6">
            <p>
              <strong>پیمانکار:</strong>
              <VChip size="small">
                {{
                  `${selectedReservedMeal.details[0].contractor.first_name} ${selectedReservedMeal.details[0].contractor.last_name}`
                }}
              </VChip>
            </p>
          </VCol>

          <VCol v-if="selectedReservedMeal.reserve_type === 'guest'" cols="12" sm="6">
            <p>
              <strong>نوع سرو:</strong>
              <VChip color="cyan" size="small">
                {{ servePlaceLabel[selectedReservedMeal.serve_place] || '' }}
              </VChip>
              <VChip v-if="selectedReservedMeal.serve_place === 'serve_in_kitchen'" size="small">
                ساعت حضور: {{ selectedReservedMeal.attendance_hour }}
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <p>
              <strong>وضعیت:</strong>
              <VChip :color="statusColor(selectedReservedMeal.status)" size="small">
                {{ statusLabel(selectedReservedMeal.status) }}
              </VChip>
            </p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>تعداد:</strong>
              <VChip size="small">
                {{ totalQtyOf(selectedReservedMeal) }}
              </VChip>
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol v-if="selectedReservedMeal.description" cols="12" sm="12">
            <p style="white-space: normal; overflow-wrap: anywhere;">
              <strong>توضیحات:</strong> {{ selectedReservedMeal.description }}
            </p>
          </VCol>
        </VRow>

        <div v-if="selectedReservedMeal.reserve_type === 'personnel'">
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(d, index) in (selectedReservedMeal.details || []).filter(x => x.personnel)"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <VChip v-show="switchRowId !== d.id">
                    {{ `${d.personnel.first_name} ${d.personnel.last_name}` }}
                  </VChip>
                  <VAutocomplete
                    v-show="switchRowId === d.id"
                    v-model="requestNewPersonnel"
                    :items="users"
                    :item-title="item => `${item.first_name} ${item.last_name} - ${item.personnel_code}`"
                    item-value="id"
                    label="فرد"
                    chips=""
                    variant="outlined"
                  />
                </td>
                <td>
                  <VChip>
                    {{ d.personnel.personnel_code }}
                  </VChip>
                </td>
                <td>
                  <VChip :color="statusColor(d.delivery_status)" size="small">
                    {{ d.delivery_status ? 'تحویل شده' : 'تحویل نشده' }}
                  </VChip>
                </td>
                <td>
                  <VBtn
                    v-if="!d.delivery_status"
                    color="red"
                    variant="text"
                    size="small"
                    @click="deletePersonnel(d.id)"
                  >
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>

                  <VBtn
                    v-if="switchRowId !== d.id"
                    color="orange"
                    variant="text"
                    size="small"
                    @click="startSwitch(d)"
                  >
                    <VIcon icon="tabler-switch-horizontal" size="20" />
                  </VBtn>

                  <VBtn
                    v-if="switchRowId === d.id"
                    :disabled="pendingState.switchingPersonnel"
                    color="success"
                    variant="text"
                    size="small"
                    @click="confirmSwitch(d.id)"
                  >
                    <VIcon icon="tabler-check" size="20" />
                  </VBtn>

                  <VBtn
                    v-if="switchRowId === d.id"
                    :disabled="pendingState.switchingPersonnel"
                    color="red"
                    variant="text"
                    size="small"
                    @click="cancelSwitch"
                  >
                    <VIcon icon="tabler-x" size="20" />
                  </VBtn>
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
