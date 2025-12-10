<script setup>
import jalaali from 'jalaali-js'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const pendingState = reactive({
  fetchingReservedMeals: true,
  editReservedMeal: false,
  deleteReservedMeal: false,
})

const reserveDates = ref([])

const reservedMeals = ref([])

// helper methods
// error showcase
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
async function fetchAllReservedMealsForDate() {
  reservedMeals.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/meal-reservation/get-reservations-for-personnel-by-user-on-date', {
      method: 'GET',
      params: {
        'date[]': reserveDates.value,
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

function onChange() {
  fetchAllReservedMealsForDate()
}

const sortedReservedMeals = computed(() =>
  [...reservedMeals.value].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
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

onMounted(async () => {
  const today = new Date()

  const [jToday] = [today].map(d =>
    jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()),
  )

  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  reserveDates.value = [fmt(jToday)]

  await fetchAllReservedMealsForDate()
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
          custom-input="#custom-input"
          @change="onChange"
        />
      </VCol>

      <VCol cols="12" md="8">
        <!-- دسکتاپ -->
        <div class="ma-3 overflow-auto d-none d-md-block">
          <VCard class="pa-4">
            <label class="font-weight-medium mb-2 d-block text-center">
              رزروهای تاریخ انتخاب شده
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
            </div>

            <VTable
              v-if="
                !pendingState.fetchingReservedMeals
                  && sortedReservedMeals.length > 0
              "
            >
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>رزرو کننده</th>
                  <th>کد پرسنلی</th>
                  <!-- <th>کد تحویل</th> -->
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>تعداد</th>
                  <!-- <th>عملیات</th> -->
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in sortedReservedMeals" :key="item.id">
                  <td>{{ index + 1 }}</td>

                  <td>{{ item.meal?.name }}</td>

                  <td>
                    <VChip>
                      {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                    </VChip>
                  </td>

                  <td>
                    <VChip>
                      {{ item.created_by ? `${item.created_by.personnel_code}` : '—' }}
                    </VChip>
                  </td>

                  <!-- <td>
                    <VChip color="success">
                      {{ item.delivery_code }}
                    </VChip>
                  </td> -->

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

                  <!-- <td>
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                    <VBtn color="red" variant="text" size="small">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                    <VBtn color="primary" variant="text" size="small">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td> -->
                </tr>
              </tbody>
            </VTable>

            <VSkeletonLoader
              v-else-if="pendingState.fetchingReservedMeals"
              type="card"
            />

            <div v-else class="text-center">
              <VChip color="error">
                رزروی برای نمایش وجود ندارد
              </VChip>
            </div>
          </VCard>
        </div>

        <!-- موبایل -->
        <div class="d-md-none pa-3">
          <VCard class="pa-3">
            <div class="text-center mb-3 font-weight-medium">
              رزروهای تاریخ انتخاب شده
            </div>

            <div
              v-if="sortedReservedMeals.length"
              class="text-center mb-3"
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
            </div>

            <VSkeletonLoader
              v-if="pendingState.fetchingReservedMeals"
              type="card"
            />

            <div
              v-else-if="sortedReservedMeals.length === 0"
              class="text-center"
            >
              <VChip color="error">
                رزروی برای نمایش وجود ندارد
              </VChip>
            </div>

            <VExpansionPanels
              v-else
              variant="accordion"
            >
              <VExpansionPanel
                v-for="(item, index) in sortedReservedMeals"
                :key="item.id ?? index"
                class="mb-2"
              >
                <VExpansionPanelTitle>
                  <div class="d-flex flex-column w-100">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="font-weight-medium">
                        {{ item.meal?.name }}
                      </span>
                      <VChip
                        :color="item.status ? 'success' : 'error'"
                        size="small"
                        label
                      >
                        {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                      </VChip>
                    </div>
                    <div class="d-flex justify-space-between align-center">
                      <VChip size="small">
                        {{ item.date }}
                      </VChip>
                      <!-- <VChip size="small" color="success">
                        {{ item.delivery_code }}
                      </VChip> -->
                    </div>
                  </div>
                </VExpansionPanelTitle>

                <VExpansionPanelText>
                  <div class="pa-2">
                    <div class="mb-2 d-flex justify-space-between">
                      <!-- <span><strong>رزرو شده توسط:</strong></span> -->
                      <VChip size="small">
                        {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                      </VChip>
                    </div>

                    <div class="mb-2 d-flex justify-space-between">
                      <span><strong>کد پرسنلی:</strong></span>
                      <VChip size="small">
                        {{ item.created_by ? `${item.created_by.personnel_code}` : '—' }}
                      </VChip>
                    </div>

                    <div class="mb-2 d-flex justify-space-between">
                      <span><strong>تعداد:</strong></span>
                      <span>
                        {{
                          item.details?.reduce(
                            (sum, detail) => sum + (detail.quantity || 0),
                            0,
                          )
                        }}
                      </span>
                    </div>

                    <!-- <div class="mt-3 text-center">
                      <VBtn color="orange" variant="text" size="small">
                        <VIcon icon="tabler-edit" size="20" />
                      </VBtn>
                      <VBtn color="red" variant="text" size="small">
                        <VIcon icon="tabler-trash" size="20" />
                      </VBtn>
                      <VBtn color="primary" variant="text" size="small">
                        <VIcon icon="tabler-file-description" size="20" />
                      </VBtn>
                    </div> -->
                  </div>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCard>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>
