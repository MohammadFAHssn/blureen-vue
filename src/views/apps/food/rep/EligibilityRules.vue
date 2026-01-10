<script setup>
// emit
const emit = defineEmits(['back'])

const current = ref('root')

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isCreateDialogVisible: false,
  isEditDialogVisible: false,
  isDeleteDialogVisible: false,
})
const pendingState = reactive({
  fetchingEligibilityRules: true,
  createEligibilityRule: false,
  editEligibilityRule: false,
  deleteEligibilityRule: false,
})

// data
const eligibilityRules = ref([])
const meals = ref([])

// choose
const selectedEligibilityRule = ref(null)

// form
const refVForm = ref()
const selectedMeal = ref(null)
const time = ref(null)

// methods
// error showcase
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}
async function fetchEligibilityRules() {
  pendingState.fetchingEligibilityRules = true
  try {
    const res = await $api('/food/eligibility', { method: 'GET' })

    eligibilityRules.value = res?.data.mealReservationEligibilityRules || []
  }
  catch (e) {
    console.error('Error fetching eligibilitys:', e)
    setError(e.message || 'خطا در دریافت محدودیت‌ها')
  }
  finally {
    pendingState.fetchingEligibilityRules = false
  }
}
async function onCreateRule() {
  if (!time.value) {
    setError('لطفا زمان را انتخاب کنید')
    return
  }
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.createEligibilityRule = true

  const formData = new FormData()
  formData.append('meal_id', selectedMeal.value)
  formData.append('time', time.value)

  try {
    await $api('/food/eligibility/', {
      method: 'POST',
      body: formData,
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

    if (!uiState.hasError) {
      uiState.isCreateDialogVisible = false
      onResetForm()
      fetchEligibilityRules()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createEligibilityRule = false
  }
}
function onClickEdit(eligibilityRule) {
  selectedEligibilityRule.value = eligibilityRule
  time.value = eligibilityRule.time
  uiState.isEditDialogVisible = true
}
async function onConfirmEdit() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.editEligibilityRule = true

  const formData = new FormData()
  formData.append('time', time.value)

  try {
    const res = await $api(`/food/eligibility/${selectedEligibilityRule.value.id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ویرایش'
        }
      },
    })
    const updatedEligibilityRule = res.data
    if (!uiState.hasError && updatedEligibilityRule) {
      eligibilityRules.value = eligibilityRules.value.map(eligibilityRule =>
        eligibilityRule.id === updatedEligibilityRule.id
          ? updatedEligibilityRule
          : eligibilityRule,
      )

      uiState.isEditDialogVisible = false
      onResetForm()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editEligibilityRule = false
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
function onResetForm() {
  selectedMeal.value = null
  time.value = null
}
function dialogModelValueUpdate(val) {
  if (!val) {
    uiState.isCreateDialogVisible = false
    uiState.isEditDialogVisible = false
    onResetForm()
  }
}
onMounted(async () => {
  await Promise.all([fetchMeals(), fetchEligibilityRules()])
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
  <div>
    <VBtn
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      {{ current === 'root' ? 'گزارش' : 'صفحه قبل' }}
    </VBtn>
  </div>

  <div>
    <div class="d-flex justify-end gap-3 mb-3">
      <VBtn color="primary" @click="uiState.isCreateDialogVisible = true;">
        <VIcon
          icon="tabler-plus"
          size="24"
          style="cursor: pointer"
        />
      </VBtn>
    </div>
    <div>
      <VTable v-if="!pendingState.fetchingEligibilityRules && eligibilityRules.length > 0">
        <thead>
          <tr>
            <th>وعده</th>
            <th>زمان</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(eligibilityRule) in eligibilityRules" :key="eligibilityRule.id">
            <td>{{ eligibilityRule.meal.name }}</td>

            <td>
              <VChip color="primary">
                {{ eligibilityRule.time }}
              </vchip>
            </td>

            <td>
              <VIcon icon="tabler-edit" color="primary" size="24" @click="onClickEdit(eligibilityRule)" />
            </td>
          </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else-if="pendingState.fetchingEligibilityRules" type="card" />
      <div v-else class="text-center">
        <VChip color="error">
          محدودیتی برای نمایش وجود ندارد
        </VChip>
      </div>
    </div>
  </div>

  <!-- Create Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isCreateDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          افزودن محدودیت
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onCreateRule">
          <VRow>
            <!-- Meal -->
            <VCol cols="12" md="6">
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

            <!-- Time -->
            <VCol cols="12" md="6">
              <PersianDatetimePicker
                v-model="time"
                type="time"
              />
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.createEligibilityRule" :loading="pendingState.createEligibilityRule">
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

  <!-- Edit Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="uiState.isEditDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش محدودیت: {{ selectedEligibilityRule?.meal.name }}
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onConfirmEdit">
          <VRow>
            <!-- Time -->
            <VCol cols="12" md="12">
              <PersianDatetimePicker
                v-model="time"
                type="time"
              />
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.editEligibilityRule" :loading="pendingState.editEligibilityRule">
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
