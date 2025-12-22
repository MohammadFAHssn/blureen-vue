<script setup>
// emit
const emit = defineEmits(['back'])

const current = ref('root')

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isCreateMealDialogVisible: false,
  isEditMealDialogVisible: false,
})
const pendingState = reactive({
  fetchingMeals: true,
  createMeal: false,
  editMeal: false,
})

// data
const meals = ref([])

// choose
const selectedMeal = ref(null)

// form
const refVForm = ref()
const mealName = ref(null)

// methods
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}
async function onCreateMeal() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.createMeal = true

  const formData = new FormData()
  formData.append('name', mealName.value)

  try {
    await $api('/food/meal/', {
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
      uiState.isCreateMealDialogVisible = false
      onResetForm()
      fetchMeals()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createMeal = false
  }
}
async function onChangeStatus(meal) {
  try {
    const res = await $api(`/food/meal/status/${meal.id}`, {
      method: 'POST',
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در تغییر وضعیت'
      },
    })

    const updatedMeal = res.data
    if (!uiState.hasError && updatedMeal) {
      meals.value = meals.value.map(meal =>
        meal.id === updatedMeal.id
          ? updatedMeal
          : meal,
      )

      uiState.isEditMealDialogVisible = false
      onResetForm()
    }
  }
  catch (err) {
    console.error(err)
  }
}
function onClickEdit(meal) {
  selectedMeal.value = meal
  mealName.value = meal.name
  uiState.isEditMealDialogVisible = true
}
async function onConfirmEditMeal() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.editMeal = true

  const formData = new FormData()
  formData.append('name', mealName.value)

  try {
    const res = await $api(`/food/meal/${selectedMeal.value.id}`, {
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
    const updatedMeal = res.data
    if (!uiState.hasError && updatedMeal) {
      meals.value = meals.value.map(meal =>
        meal.id === updatedMeal.id
          ? updatedMeal
          : meal,
      )

      uiState.isEditMealDialogVisible = false
      onResetForm()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editMeal = false
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
await fetchMeals()

function onResetForm() {
  mealName.value = null
}
function dialogModelValueUpdate(val) {
  if (!val) {
    uiState.isCreateMealDialogVisible = false
    uiState.isEditMealDialogVisible = false
    onResetForm()
  }
}
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
      {{ current === 'root' ? 'آشپزخانه' : 'صفحه قبل' }}
    </VBtn>
  </div>

  <div>
    <div class="d-flex justify-end gap-3 mb-3">
      <VBtn color="primary" @click="uiState.isCreateMealDialogVisible = true;">
        <VIcon
          icon="tabler-plus"
          size="24"
          style="cursor: pointer"
        />
      </VBtn>
    </div>
    <VCard v-if="pendingState.fetchingMeals" class="text-center">
      <VCardText>
        <VProgressCircular indeterminate color="primary" />
      </VCardText>
    </VCard>
    <div v-else>
      <VTable v-if="meals.length > 0">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام</th>
            <th>وضعیت</th>
            <th>ایجاد شده توسط</th>
            <th>آخرین ویرایش توسط</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(meal, index) in meals" :key="meal.id">
            <td>{{ index + 1 }}</td>

            <td>{{ meal.name }}</td>

            <td>
              <VChip :color="meal.status ? 'success' : 'error'" size="small">
                {{ meal.status ? 'فعال' : 'غیرفعال' }}
              </VChip>
            </td>

            <td>
              <VChip>
                {{ meal.createdBy ? `${meal.createdBy.fullName} - ${meal.createdBy.username}` : '—' }}
              </VChip>
            </td>

            <td>
              <VChip>
                {{ meal.editedBy ? `${meal.editedBy.fullName} - ${meal.editedBy.username}` : '—' }}
              </VChip>
            </td>

            <td>
              <VIcon icon="tabler-power" :color="meal.status ? 'red' : 'green'" size="24" @click="onChangeStatus(meal)" />
              <VIcon icon="tabler-edit" color="primary" size="24" @click="onClickEdit(meal)" />
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-else class="text-center">
        وعده‌ای برای نمایش وجود ندارد
      </div>
    </div>
  </div>

  <!-- Create New Meal Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="uiState.isCreateMealDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          افزودن وعده
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onCreateMeal">
          <VRow>
            <!-- Name -->
            <VCol cols="12" md="12">
              <VInput :disabled="pendingState.createMeal">
                <VTextField
                  v-model="mealName"
                  :rules="[requiredValidator]"
                  :disabled="pendingState.createMeal"
                  simple
                  label="نام"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.createMeal" :loading="pendingState.createMeal">
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

  <!-- Edit Meal Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="uiState.isEditMealDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش وعده: {{ selectedMeal?.name }}
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onConfirmEditMeal">
          <VRow>
            <!-- Name -->
            <VCol cols="12" md="12">
              <VInput :disabled="pendingState.editMeal">
                <VTextField
                  v-model="mealName"
                  :rules="[requiredValidator]"
                  :disabled="pendingState.editMeal"
                  simple
                  label="نام"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.editMeal" :loading="pendingState.editMeal">
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
