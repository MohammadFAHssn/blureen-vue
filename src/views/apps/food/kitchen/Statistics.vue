<script setup>
// emit
const emit = defineEmits(['back'])

const current = ref('root')

// methods
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isDetailsDialogVisible: false,
})

const pendingState = reactive({
  fetchingReservedMeals: false,
})

const reservedMeals = ref([])
const dates = ref(null)
const selectedReservedMeal = ref(null)

// helper methods
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDetailsDialogVisible = val
  if (!val)
    selectedReservedMeal.value = null
}

function onClickDetail(reserv) {
  selectedReservedMeal.value = reserv
  uiState.isDetailsDialogVisible = true
}
async function fetchReservedMealsOnDateRange() {
  if (!dates.value) {
    setError('تاریخ را انتخاب کنید.')
    return
  }
  if (!dates.value[1]) {
    setError('تاریخ باید به صورت بازه‌ای باشد.')
    return
  }

  reservedMeals.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-in-date-range', {
      method: 'GET',
      params: {
        'date[]': dates.value,
      },
    })

    reservedMeals.value = (res?.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروهای بازه')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

const sortedReservedMeals = computed(() =>
  [...reservedMeals.value].sort((a, b) =>
    String(a?.meal?.name || '').localeCompare(String(b?.meal?.name || '')),
  ),
)

const mealTotals = computed(() => {
  const totalsByMeal = {}

  for (const item of reservedMeals.value) {
    const mealName = item.meal?.name || 'نامشخص'

    const itemTotal
      = item.details?.reduce(
        (sum, detail) => sum + (detail.quantity || 0),
        0,
      ) || 0

    if (!totalsByMeal[mealName])
      totalsByMeal[mealName] = 0

    totalsByMeal[mealName] += itemTotal
  }

  return Object.entries(totalsByMeal).map(([name, total]) => ({ name, total }))
})

const undeliveredMealTotals = computed(() => {
  const totalsByMeal = {}

  for (const item of reservedMeals.value) {
    const mealName = `${item.meal?.name || 'نامشخص'} تحویل نشده`

    const itemTotal
      = item.details?.reduce(
        (sum, detail) =>
          sum + (!detail.delivery_status ? (detail.quantity || 0) : 0),
        0,
      ) ?? 0

    if (!totalsByMeal[mealName])
      totalsByMeal[mealName] = 0

    totalsByMeal[mealName] += itemTotal
  }

  return Object.entries(totalsByMeal).map(([name, total]) => ({ name, total }))
})
</script>

<template>
  <div>
    <VBtn
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      {{ current === 'root' ? 'آشپزخانه' : 'صفحه قبل' }}
    </VBtn>
  </div>
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
    <VCol>
      <VCol class="d-flex justify-center">
        <PersianDatetimePicker
          v-model="dates"
          format="jYYYY/jMM/jDD"
          range
        />
      </VCol>
      <VCol class="d-flex justify-center">
        <VBtn
          color="primary"
          :loading="pendingState.fetchingReservedMeals"
          :disabled="pendingState.fetchingReservedMeals"
          @click="fetchReservedMealsOnDateRange"
        >
          جستجو
        </VBtn>
      </VCol>

      <div class="overflow-auto d-md-block">
        <VCol v-if="!pendingState.fetchingReservedMeals && sortedReservedMeals.length > 0" cols="12" md="12">
          <label class="font-weight-medium mb-4 d-block text-center">
            رزروهای بازه
          </label>
          <div
            v-if="sortedReservedMeals.length"
            class="text-center mb-4"
          >
            <VChip
              v-for="meal in mealTotals"
              :key="meal.name"
              class="ma-1"
              color="primary"
              size="small"
              variant="outlined"
            >
              {{ meal.name }}: {{ meal.total }}
            </VChip>
            <VChip
              v-for="meal in undeliveredMealTotals"
              :key="meal.name"
              class="ma-1"
              color="primary"
              size="small"
              variant="outlined"
            >
              {{ meal.name }}: {{ meal.total }}
            </VChip>
          </div>

          <VTable>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>وعده</th>
                <th>رزرو کننده</th>
                <th>کد پرسنلی</th>
                <th>تاریخ</th>
                <th>کد تحویل</th>
                <th>نوع رزرو</th>
                <th>وضعیت</th>
                <th>پیمانکار</th>
                <th>تعداد</th>
                <th>توضیحات</th>
                <th>جزئیات</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in sortedReservedMeals"
                :key="item.id"
              >
                <td>{{ index + 1 }}</td>

                <td>{{ item.meal?.name }}</td>

                <td>
                  <VChip color="primary">
                    {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                  </VChip>
                </td>

                <td>
                  <VChip>
                    {{ item.created_by ? `${item.created_by.personnel_code}` : '—' }}
                  </VChip>
                </td>

                <td>
                  <VChip>
                    {{ item.date }}
                  </VChip>
                </td>

                <td>
                  <VChip color="success">
                    {{ item.delivery_code }}
                  </VChip>
                </td>

                <td>
                  <VChip color="orange">
                    {{
                      {
                        personnel: 'پرسنل',
                        contractor: 'پیمانکار',
                        guest: 'مهمان',
                      }[item.reserve_type] || ''
                    }}
                  </VChip>
                </td>

                <td>
                  <VChip :color="item.status ? 'success' : 'error'" size="small">
                    {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                  </VChip>
                </td>

                <td>
                  <VChip v-if="item.details?.[0]?.contractor">
                    {{
                      `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                    }}
                  </VChip>
                  <span v-else>—</span>
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
                  <VBtn color="primary" variant="text" size="small" @click="onClickDetail(item)">
                    <VIcon icon="tabler-file-description" size="20" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
        <VSkeletonLoader v-else-if="pendingState.fetchingReservedMeals" type="card" />
        <div v-else class="text-center">
          <VChip color="error">
            رزروی برای نمایش وجود ندارد
          </VChip>
        </div>
      </div>
    </VCol>
  </VRow>

  <!-- Reserved Meal Details Dialog -->
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
              <VChip>
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
              <VChip>
                {{
                  `${selectedReservedMeal.details[0].contractor.first_name} ${selectedReservedMeal.details[0].contractor.last_name}`
                }}
              </VChip>
            </p>
          </VCol>

          <VCol v-if="selectedReservedMeal.reserve_type === 'guest'" cols="12" sm="6">
            <p>
              <strong>نوع سرو:</strong>
              <VChip>
                {{
                  {
                    serve_in_kitchen: 'سرو در رستوران',
                    deliver: 'تحویل(بیرون‌بر)',
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

        <!-- Show personnel list for personnel reservation -->
        <div v-if="selectedReservedMeal.reserve_type === 'personnel'">
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>وضعیت</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(d, index) in (selectedReservedMeal.details || []).filter(x => x.personnel)"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ `${d.personnel.first_name} ${d.personnel.last_name}` }}</td>
                <td>{{ d.personnel.personnel_code }}</td>
                <td>
                  <VChip :color="d.delivery_status ? 'success' : 'error'" size="small">
                    {{ d.delivery_status ? 'تحویل شده' : 'تحویل نشده' }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <!-- Show contractor details for contractor reservation -->
        <div v-if="selectedReservedMeal.reserve_type === 'contractor'">
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
                v-for="(d, index) in selectedReservedMeal.details"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <VChip>
                    {{ d.food?.name }}
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ Number(d.food_price || 0).toLocaleString('fa-IR') }} ریال
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ d.quantity }}
                  </VChip>
                </td>
                <td>
                  <VChip>
                    {{ Number((d.quantity || 0) * (d.food_price || 0)).toLocaleString('fa-IR') }} ریال
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <VDivider v-if="selectedReservedMeal.reserve_type !== 'guest' && (selectedReservedMeal.reserve_type === 'contractor' && !selectedReservedMeal.status)" class="my-3" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
