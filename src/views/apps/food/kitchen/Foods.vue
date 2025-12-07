<script setup>
import { ref } from 'vue'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

// emit
const emit = defineEmits(['back'])

const current = ref('root')

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isCreateFoodDialogVisible: false,
  isEditFoodDialogVisible: false,
  isDeleteFoodDialogVisible: false,
})
const pendingState = reactive({
  fetchingFoods: false,
  createFood: false,
  editFood: false,
  deleteFood: false,
})

// data
const _allStatus = ref([
  { label: 'فعال', value: 1 },
  { label: 'غیرفعال', value: 0 },
])
const foods = ref([])

// choose
const selectedFoods = ref([])
const selectedFood = ref([])

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

  pendingState.createFood = true

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
    pendingState.createFood = false
  }
}
// function onClickDelete(food) {
//   selectedFood.value = food
//   uiState.isDeleteFoodDialogVisible = true
// }
async function onConfirmDelete() {
  pendingState.deleteFood = true
  try {
    await $api(`/food/food/${selectedFood.value.id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        pendingState.deleteFood = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف غذا'
      },
    })

    pendingState.deleteFood = false
    uiState.isDeleteFoodDialogVisible = false
    foods.value = foods.value.filter(
      food => food.id !== selectedFood.value.id,
    )
  }
  catch (err) {
    console.error(err)
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
  uiState.isCreateFoodDialogVisible = val
  uiState.isEditFoodDialogVisible = val
  onResetForm()
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
      {{ current === 'root' ? 'صفحه اصلی' : 'آشپزخانه' }}
    </VBtn>
  </div>

  <div>
    <div class="d-flex justify-end gap-3 mb-3">
      <VBtn color="primary" @click="uiState.isCreateFoodDialogVisible = true;">
        <VIcon
          icon="tabler-plus"
          size="24"
          style="cursor: pointer"
        />
      </VBtn>
    </div>
    <VCard v-if="pendingState.fetchingFoods" class="text-center">
      <VCardText>
        <VProgressCircular indeterminate color="primary" />
      </VCardText>
    </VCard>
    <div v-else>
      <VTable v-if="foods.length > 0">
        <thead>
          <tr>
            <th />
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
            <td>
              <VCheckbox v-model="selectedFoods" :value="food.id" hide-details />
            </td>

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
              <VIcon :disabled="food.id === 1" icon="tabler-power" :color="food.status ? 'red' : 'green'" size="24" @click="onChangeStatus(food)" />
              <VIcon :disabled="food.id === 1" icon="tabler-edit" color="primary" size="24" @click="onClickEdit(food)" />
              <!-- <VIcon icon="tabler-trash" color="red" size="24" @click="onClickDelete(food)" /> -->
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-else class="text-center">
        غذایی برای نمایش وجود ندارد
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
          ویرایش قیمت: {{ selectedFood.name }}
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onConfirmEditFood">
          <VRow>
            <!-- Name -->
            <!-- <VCol cols="12" md="6">
              <VInput :disabled="pendingState.createFood">
                <VTextField
                  v-model="foodName"
                  :rules="[requiredValidator]"
                  :disabled="pendingState.createFood"
                  simple
                  label="نام"
                />
              </VInput>
            </VCol> -->

            <!-- Price -->
            <VCol cols="12" md="12">
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

  <!-- Delete Food Dialog -->
  <AreYouSureDialog
    v-if="uiState.isDeleteFoodDialogVisible"
    v-model:is-dialog-visible="uiState.isDeleteFoodDialogVisible"
    title="آیا از حذف این غذا اطمینان دارید؟"
    :loading="pendingState.deleteFood"
    @confirm="onConfirmDelete"
  />
</template>
