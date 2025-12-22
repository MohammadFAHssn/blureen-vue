<script setup>
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
const selectedReservedMeal = ref(null)
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

function onClickDelete(reserv) {
  selectedReservedMeal.value = reserv
  uiState.isDeleteDialogVisible = true
}
async function onConfirmDelete() {
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
      if (reservationType.value === 'contractor') {
        reservedMealsForContractor.value = reservedMealsForContractor.value.filter(
          reserv => reserv.id !== selectedReservedMeal.value.id,
        )
      }
      if (reservationType.value === 'guest') {
        reservedMealsForGuest.value = reservedMealsForGuest.value.filter(
          reserv => reserv.id !== selectedReservedMeal.value.id,
        )
      }
    }

    if (!res?.data) {
      setError('نمیتوان رزرو تحویل شده را حذف کرد')
      if (reservationType.value === 'contractor') {
        fetchReservedMealsForContractorOnDate()
      }
      if (reservationType.value === 'guest') {
        fetchReservedMealsForGuestOnDate()
      }
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

// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDetailsDialogVisible = val
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

            <VTable v-if="!pendingState.fetchingReservedMeals && reservationType === 'contractor' && sortedReservedMealsForContractor.length > 0">
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
            <VTable v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'guest' && sortedReservedMealsForGuest.length > 0">
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
                  <th>عملیات</th>
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
                  <td class="py-2">
                    <VTooltip location="top" :disabled="!(item.description?.length > 6)">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="text-truncate"
                          style="max-width: 120px;"
                        >
                          {{ item.description || '—' }}
                        </div>
                      </template>

                      <div style="max-width: 420px; white-space: normal; overflow-wrap: anywhere;">
                        {{ item.description }}
                      </div>
                    </VTooltip>
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

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals && reservationType === 'contractor' && sortedReservedMealsForContractor.length > 0">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsForContractor"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex flex-column w-100">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="font-weight-medium">
                            {{ item.meal?.name }}
                          </span>
                          <VChip size="small">
                            {{ item.date }}
                          </VChip>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <VChip color="success">
                            {{ item.delivery_code }}
                          </VChip>
                          <VChip
                            :color="item.status ? 'success' : 'error'"
                            size="small"
                            label
                          >
                            {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                          </VChip>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <VChip>
                            {{
                              item.details?.[0]?.contractor
                                ? `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                                : '—'
                            }}
                          </VChip>
                        </div>
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
              <VExpansionPanelText v-else-if="!pendingState.fetchingReservedMeals && reservationType === 'guest' && sortedReservedMealsForGuest.length > 0">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in sortedReservedMealsForGuest"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex flex-column w-100">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="font-weight-medium">
                            {{ item.meal?.name }}
                          </span>
                          <VChip size="small">
                            {{ item.date }}
                          </VChip>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <VChip color="success">
                            {{ item.delivery_code }}
                          </VChip>
                          <VChip
                            :color="item.status ? 'success' : 'error'"
                            size="small"
                            label
                          >
                            {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                          </VChip>
                        </div>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
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
                        <div class="mb-2 d-flex justify-space-between align-start">
                          <strong class="me-2">توضیحات:</strong>
                          <div
                            style="
                              max-width: 100%;
                              white-space: normal;
                              overflow-wrap: anywhere;
                              word-break: break-word;
                              text-align: right;
                              flex: 1;
                            "
                          >
                            {{ item.description || '—' }}
                          </div>
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

          <VDivider class="my-3" />

          <VCol cols="12" sm="6">
            <p>
              <strong>نوع رزرو:</strong>
              <VChip color="cyan" size="small">
                {{
                  {
                    personnel: 'پرسنل',
                    contractor: 'پیمانکار',
                    guest: 'مهمان',
                  }[selectedReservedMeal.reserve_type] || ''
                }}
              </VChip>
            </p>
          </VCol>

          <VCol v-if="selectedReservedMeal.details?.[0]?.contractor" cols="12" sm="6">
            <p>
              <strong>پیمانکار:</strong>
              <VChip color="cyan" size="small">
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
                {{
                  {
                    serve_in_kitchen: 'سرو در آشپزخانه',
                    deliver: 'تحویل',
                  }[selectedReservedMeal.serve_place] || ''
                }}
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

        <VRow>
          <VCol v-if="selectedReservedMeal.description" cols="12" sm="12">
            <p style="white-space: normal; overflow-wrap: anywhere;">
              <strong>توضیحات:</strong> {{ selectedReservedMeal.description }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
