<script setup>
import jalaali from 'jalaali-js'
import { ref } from 'vue'

// تعریف emit
const emit = defineEmits(['back'])

const current = ref('root')
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const pendingState = reactive({
  fetchingPlans: false,
  fetchingMeals: false,
  fetchingFoods: false,
  createPlan: false,
  editPlan: false,
  deletePlan: false,
})

// data
const plans = ref([])
const meals = ref([])
const foods = ref([])
const planDate = ref('')
const jdate = ref({ jy: null, jm: null, jd: null })

// choose
const selectedMeal = ref([])
const selectedFood = ref([])

// methods
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

async function submit() {
  pendingState.createPlan = true
  let pDate = null
  try {
    const [year, month, day] = planDate.value.split('/').map(Number)
    pDate = { year, month, day }

    const selectedKey = year * 10000 + month * 100 + day
    const todayKey = jdate.value.jy * 10000 + jdate.value.jm * 100 + jdate.value.jd

    if (selectedKey < todayKey) {
      uiState.hasError = true
      uiState.errorMessage = 'لطفا تاریخ درست انتخاب کنید.'
      return
    }

    const payload = {
      year,
      month,
      day,
      meal_id: selectedMeal.value,
      food_id: selectedFood.value,
    }

    const res = await $api('/food/meal-plan', {
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

    if (pDate) {
      await fetchPlansForDate(pDate)
    }

    return res
  }
  catch (err) {
    console.error('Error create plan:', err)
  }
  finally {
    pendingState.createPlan = false
    selectedFood.value = null
    selectedMeal.value = null
    // planDate.value = null
  }
}

async function fetchPlansForDate(date) {
  plans.value = []
  pendingState.fetchingPlans = true

  let payload

  if (planDate.value) {
    const [year, month, day] = planDate.value.split('/').map(Number)
    payload = { year, month, day }
  }
  else {
    const [year, month, day] = date
    payload = { year, month, day }
  }

  const query = new URLSearchParams(payload).toString()

  try {
    const res = await $api(`/food/meal-plan/get-for-date?${query}`, {
      method: 'GET',
    })

    plans.value = res?.data.mealPlans || []
  }
  catch (err) {
    console.error('Error fetching meal plans:', err)
  }
  finally {
    pendingState.fetchingPlans = false
  }
}

async function fetchMeals() {
  pendingState.fetchingMeals = true
  try {
    const res = await $api('/food/meal/', { method: 'GET' })

    meals.value = res?.data.meals || []
  }
  catch (e) {
    console.error('Error fetching meals:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت وعده‌ها'
  }
  finally {
    pendingState.fetchingMeals = false
  }
}

async function fetchFoods() {
  pendingState.fetchingFoods = true
  try {
    const res = await $api('/food/food/', { method: 'GET' })

    foods.value = res?.data.foods || []
  }
  catch (e) {
    console.error('Error fetching foods:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت غذاها'
  }
  finally {
    pendingState.fetchingFoods = false
  }
}

onMounted(async () => {
  await fetchMeals()
  await fetchFoods()
  const d = new Date()
  const temp = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())

  jdate.value = temp

  const date = [temp.jy, temp.jm, temp.jd]
  await fetchPlansForDate(date)
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
      {{ current === 'root' ? 'صفحه اصلی' : 'آشپزخانه' }}
    </VBtn>
  </div>
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
          v-model="planDate"
          format="jYYYY/jMM/jDD"
          inline
          custom-input="#custom-input"
          @change="fetchPlansForDate"
        />
      </VCol>

      <VCol cols="12" md="8">
        <VCard class="mb-4">
          <label class="font-weight-medium mb-2 mt-2 d-block text-center">
            برنامه غذایی
          </label>
          <VRow class="mb-4 px-4">
            <VCol cols="12" sm="12" md="12">
              <VTextField
                v-model="planDate"
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
            <VCol cols="12" md="12">
              <VSelect
                v-model="selectedFood"
                :items="foods"
                item-title="name"
                item-value="id"
                label="غذا"
                variant="outlined"
                clearable
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow justify="center" class="mb-4">
            <VCol cols="auto">
              <VBtn color="primary" @click="submit">
                ثبت
              </VBtn>
            </VCol>
          </VRow>
        </VCard>

        <!-- برای دسکتاپ -->
        <!-- <div class="ma-3 overflow-auto d-none d-md-block">
          <VCard class="pa-4">
            <label class="font-weight-medium mb-4 d-block text-center">
              برنامه غذایی تاریخ انتخاب شده
            </label>

            <VTable v-if="!pendingState.fetchingPlans">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>غذا</th>
                  <th>ایجاد شده توسط</th>
                  <th>آخرین ویرایش توسط</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in plans" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <VChip dark>
                      {{ item.meal.name }}
                    </VChip>
                  </td>
                  <td>
                    <VChip dark>
                      {{ item.food.name }}
                    </VChip>
                  </td>
                  <td>
                    <VChip>
                      {{ item.createdBy ? `${item.createdBy.fullName} - ${item.createdBy.username}` : '—' }}
                    </VChip>
                  </td>
                  <td>
                    <VChip>
                      {{ item.editedBy ? `${item.editedBy.fullName} - ${item.editedBy.username}` : '—' }}
                    </VChip>
                  </td>
                  <td>
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VSkeletonLoader v-else type="card" />
          </VCard>
        </div> -->

        <!-- برای موبایل -->
        <div class="pa-3">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                برنامه غذایی تاریخ انتخاب شده
              </VExpansionPanelTitle>

              <VExpansionPanelText v-if="!pendingState.fetchingPlans">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in plans"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.meal.name }}</span>
                        <VChip>
                          {{ item.food.name }}
                        </VChip>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div><strong>ایجاد شده توسط:</strong> {{ item.createdBy ? `${item.createdBy.fullName} - ${item.createdBy.username}` : '—' }}</div>
                        <div><strong>آخرین ویرایش توسط:</strong> {{ item.editedBy ? `${item.editedBy.fullName} - ${item.editedBy.username}` : '—' }}</div>
                        <div class="mt-2 text-center">
                          <VBtn color="orange" variant="text" size="small">
                            <VIcon icon="tabler-edit" size="20" />
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
