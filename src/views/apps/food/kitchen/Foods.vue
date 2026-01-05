<script setup>
import { can } from '@layouts/plugins/casl'
// emit
const emit = defineEmits(['back'])

const current = ref('root')

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isCreateFoodDialogVisible: false,
  isEditFoodDialogVisible: false,
})
const pendingState = reactive({
  fetchingFoods: true,
  createFood: false,
  editFood: false,
})

// data
const foods = ref([])

// choose
const selectedFood = ref(null)

// form
const refVForm = ref()
const foodName = ref(null)
const foodPrice = ref(null)

// rules
const countInputRules = [
  (value) => {
    const isInteger = /^\d+$/.test(String(value))

    if (!isInteger) {
      return 'فقط باید عدد باشد!'
    }

    return true
  },
]

// methods
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}
async function onCreateFood() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.createFood = true

  const formData = new FormData()
  formData.append('name', foodName.value)
  formData.append('price', Number(foodPrice.value || 0))

  try {
    await $api('/food/food/', {
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
      uiState.isCreateFoodDialogVisible = false
      onResetForm()
      fetchFoods()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createFood = false
  }
}
async function onChangeStatus(food) {
  try {
    const res = await $api(`/food/food/status/${food.id}`, {
      method: 'POST',
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در تغییر وضعیت'
      },
    })

    const updatedFood = res.data
    if (!uiState.hasError && updatedFood) {
      foods.value = foods.value.map(food =>
        food.id === updatedFood.id
          ? updatedFood
          : food,
      )

      uiState.isEditFoodDialogVisible = false
      onResetForm()
    }
  }
  catch (err) {
    console.error(err)
  }
}
function onClickEdit(food) {
  selectedFood.value = food
  foodName.value = food.name
  foodPrice.value = food.price
  uiState.isEditFoodDialogVisible = true
}
async function onConfirmEditFood() {
  const result = await refVForm.value?.validate()
  const isValid = result?.valid
  if (!isValid)
    return

  pendingState.editFood = true

  const formData = new FormData()
  formData.append('name', foodName.value)
  formData.append('price', Number(foodPrice.value || 0))

  try {
    const res = await $api(`/food/food/${selectedFood.value.id}`, {
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
    const updatedFood = res.data
    if (!uiState.hasError && updatedFood) {
      foods.value = foods.value.map(food =>
        food.id === updatedFood.id
          ? updatedFood
          : food,
      )

      uiState.isEditFoodDialogVisible = false
      onResetForm()
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editFood = false
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
await fetchFoods()

function onResetForm() {
  foodName.value = null
  foodPrice.value = null
}
function dialogModelValueUpdate(val) {
  if (!val) {
    uiState.isCreateFoodDialogVisible = false
    uiState.isEditFoodDialogVisible = false
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
      <VBtn v-if="can('read', 'kitchen')" color="primary" @click="uiState.isCreateFoodDialogVisible = true;">
        <VIcon
          icon="tabler-plus"
          size="24"
          style="cursor: pointer"
        />
      </VBtn>
    </div>
    <div>
      <VTable v-if="!pendingState.fetchingFoods && foods.length > 0">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام</th>
            <th>وضعیت</th>
            <th>قیمت</th>
            <th>ایجاد شده توسط</th>
            <th>آخرین ویرایش توسط</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(food, index) in foods" :key="food.id">
            <td>{{ index + 1 }}</td>

            <td>{{ food.name }}</td>

            <td v-if="food.id !== 1">
              <VChip :color="food.status ? 'success' : 'error'" size="small">
                {{ food.status ? 'فعال' : 'غیرفعال' }}
              </VChip>
            </td>

            <td v-if="food.id === 1">
              <VChip color="success" size="small">
                فعال
              </VChip>
            </td>

            <td>
              <VChip color="primary">
                {{ Number(food.price).toLocaleString('fa-IR') }}
              </VChip>
            </td>

            <td>
              <VChip>
                {{ food.createdBy ? `${food.createdBy.fullName} - ${food.createdBy.username}` : '—' }}
              </VChip>
            </td>

            <td>
              <VChip>
                {{ food.editedBy ? `${food.editedBy.fullName} - ${food.editedBy.username}` : '—' }}
              </VChip>
            </td>

            <td>
              <VIcon
                v-if="can('edit', 'Food-Status')"
                :disabled="food.id === 1"
                icon="tabler-power"
                :color="food.status ? 'red' : 'green'"
                size="24"
                @click="onChangeStatus(food)"
              />
              <VIcon
                v-if="can('edit', 'Food-Price')"
                :disabled="food.id === 1"
                icon="tabler-edit"
                color="primary"
                size="24"
                @click="onClickEdit(food)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else-if="pendingState.fetchingFoods" type="card" />
      <div v-else class="text-center">
        <VChip color="error">
          غذایی برای نمایش وجود ندارد
        </VChip>
      </div>
    </div>
  </div>

  <!-- Create New Food Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isCreateFoodDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          افزودن غذا
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onCreateFood">
          <VRow>
            <!-- Name -->
            <VCol cols="12" md="6">
              <VInput :disabled="pendingState.createFood">
                <VTextField
                  v-model="foodName"
                  :rules="[requiredValidator]"
                  :disabled="pendingState.createFood"
                  simple
                  label="نام"
                />
              </VInput>
            </VCol>

            <!-- Price -->
            <VCol cols="12" md="6">
              <VInput>
                <VTextField
                  v-model="foodPrice"
                  :rules="[requiredValidator, ...countInputRules]"
                  :disabled="pendingState.createFood"
                  simple
                  label="قیمت"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.createFood" :loading="pendingState.createFood">
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

  <!-- Edit Food Dialog -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="uiState.isEditFoodDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش قیمت: {{ selectedFood?.name }}
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onConfirmEditFood">
          <VRow>
            <!-- Price -->
            <VCol cols="12" md="12">
              <VInput>
                <VTextField
                  v-model="foodPrice"
                  :rules="[requiredValidator, ...countInputRules]"
                  :disabled="pendingState.editFood"
                  simple
                  label="قیمت"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="pendingState.editFood" :loading="pendingState.editFood">
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
