<script setup>
import jalaali from 'jalaali-js'

// تعریف emit
const emit = defineEmits(['back'])

const current = ref('root')
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditDialogVisible: false,
})
const pendingState = reactive({
  fetchingPlans: true,
  fetchingMeals: false,
  fetchingFoods: false,
  createPlan: false,
  editPlan: false,
})

// data
const plans = ref([])
const meals = ref([])
const foods = ref([])
const planDate = ref('')
const jdate = ref({ jy: null, jm: null, jd: null })

// choose
const selectedMeal = ref(null)
const selectedFood = ref(null)
const selectedFoodEdit = ref(null)
const selectedMealPlan = ref(null)

// form
const refVForm = ref()

// helper methods
// error showcase
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

function dialogModelValueUpdate(val) {
  uiState.isEditDialogVisible = val
  onResetForm()
}

function onResetForm() {
  selectedMealPlan.value = null
  selectedFood.value = null
  selectedFoodEdit.value = null
}

async function submit() {
  if (!planDate.value) return setError('تاریخ را انتخاب کنید.')
  if (!selectedMeal.value) return setError('وعده را انتخاب کنید.')
  if (!selectedFood.value) return setError('غذا را انتخاب کنید.')
  pendingState.createPlan = true
  try {
    const [year, month, day] = String(planDate.value).split('/').map(Number)

    const selectedKey = year * 10000 + month * 100 + day
    const todayKey = jdate.value.jy * 10000 + jdate.value.jm * 100 + jdate.value.jd

    if (selectedKey < todayKey) return setError('نمیتوان برای گذشته برنامه غذایی ثبت کرد.')

    const payload = {
      date: planDate.value,
      meal_id: selectedMeal.value,
      food_id: selectedFood.value,
    }

    const res = await $api('/food/meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      onResponseError({ response }) {
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          setError(errors || 'خطا در ایجاد.')
        }
        else {
          setError(response._data?.message || 'خطا در ایجاد')
        }
      },
    })

    await fetchPlansForDate()

    return res
  }
  catch (err) {
    console.error('Error create plan:', err)
  }
  finally {
    pendingState.createPlan = false
    selectedFood.value = null
    selectedMeal.value = null
  }
}

function onClickEdit(mealPlan) {
  const [year, month, day] = String(planDate.value).split('/').map(Number)
  const selectedKey = year * 10000 + month * 100 + day
  const todayKey = jdate.value.jy * 10000 + jdate.value.jm * 100 + jdate.value.jd

  if (selectedKey < todayKey) {
    setError('نمیتوان برنامه غذایی گذشته را ویرایش کرد.')
    uiState.isEditDialogVisible = false
    return
  }
  selectedMealPlan.value = mealPlan
  selectedFoodEdit.value = mealPlan.food.id
  uiState.isEditDialogVisible = true
}
async function onConfirmEditMeal() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.editPlan = true

  const formData = new FormData()
  formData.append('food_id', selectedFoodEdit.value)
  formData.append('date', planDate.value)

  try {
    const res = await $api(`/food/meal-plan/${selectedMealPlan.value.id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          setError(errors || 'خطا در ویرایش')
        }
        else {
          setError(response._data?.message || 'خطا در ویرایش')
        }
      },
    })
    const updatedMealPlan = res.data
    if (!uiState.hasError && updatedMealPlan) {
      uiState.isEditDialogVisible = false
      onResetForm()
      fetchPlansForDate()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editPlan = false
  }
}

async function fetchPlansForDate() {
  plans.value = []
  pendingState.fetchingPlans = true

  const queryDate = planDate.value

  try {
    const res = await $api('/food/meal-plan/get-for-date', {
      method: 'GET',
      params: {
        date: queryDate,
      },
    })

    plans.value = res?.data?.mealPlans || []
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

async function fetchFoods() {
  pendingState.fetchingFoods = true
  try {
    const res = await $api('/food/food/get-actives', { method: 'GET' })

    foods.value = res?.data.foods || []
  }
  catch (e) {
    console.error('Error fetching foods:', e)
    setError(e.message || 'خطا در دریافت غذاها')
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

  planDate.value = `${temp.jy}/${temp.jm}/${temp.jd}`
  await fetchPlansForDate()
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
                label="تاریخ"
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
            <VCol cols="12" md="12">
              <VSelect
                v-model="selectedFood"
                :items="foods"
                item-title="name"
                item-value="id"
                label="غذا"
                variant="outlined"
                clearable
              />
            </VCol>
          </VRow>
          <VRow justify="center" class="mb-4">
            <VCol cols="auto">
              <VBtn color="primary" :disabled="pendingState.createPlan" :loading="pendingState.createPlan" @click="submit">
                ثبت
              </VBtn>
            </VCol>
          </VRow>
        </VCard>

        <div class="pa-3">
          <VExpansionPanels v-if="!pendingState.fetchingPlans && plans.length > 0" variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                برنامه غذایی تاریخ انتخاب شده
              </VExpansionPanelTitle>

              <VExpansionPanelText>
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
                          <VBtn color="orange" variant="text" size="small" @click="onClickEdit(item)">
                            <VIcon icon="tabler-edit" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
          <VSkeletonLoader v-else-if="pendingState.fetchingPlans" type="card" />
          <div v-else class="text-center">
            <VChip color="error">
              برنامه غذایی برای نمایش وجود ندارد
            </VChip>
          </div>
        </div>
      </VCol>
    </VRow>
  </VContainer>

  <!-- Edit Meal Plan Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="uiState.isEditDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش برنامه غذایی:
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onConfirmEditMeal">
          <VRow>
            <!-- Food -->
            <VCol cols="12" md="12">
              <VInput :disabled="pendingState.editPlan">
                <VSelect
                  v-model="selectedFoodEdit"
                  :items="foods"
                  item-title="name"
                  item-value="id"
                  label="غذا"
                  variant="outlined"
                  clearable
                  :rules="[requiredValidator]"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.editPlan" :loading="pendingState.editPlan">
                ذخیره
              </VBtn>

              <VBtn color="secondary" variant="tonal" @click="dialogModelValueUpdate(false)">
                انصراف
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
