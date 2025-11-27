<script setup>
import jalaali from 'jalaali-js'
import { ref } from 'vue'

const ReservedMealsLoading = ref(false)
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})

const reserveDate = ref('')
const jdate = ref({ jy: null, jm: null, jd: null })

const users = ref([])
const altUsers = ref([])

const meals = ref([
  { label: 'ناهار', value: 1 },
  { label: 'شام', value: 2 },
])

const fakeReservedMealsForGuest = ref([
  { id: 1, mealName: 'ناهار', deliveryCode: '1000001', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 1, fullName: 'امیر کریمی', personnelCode: 9876 }, reservedFor: [{ id: 1, fullName: 'محمد امامی', personnelCode: 8766 }, { id: 2, fullName: 'محمد حسنی', personnelCode: 7687 }] },
  { id: 2, mealName: 'شام', deliveryCode: '1000002', status: { label: 'تایید شده', color: 'green', value: 2 }, count: 1, reservedBy: { id: 2, fullName: 'سارا احمدی', personnelCode: 5543 }, reservedFor: [{ id: 3, fullName: 'نیما رضایی', personnelCode: 6654 }] },
  { id: 3, mealName: 'صبحانه', deliveryCode: '1000003', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 2, reservedBy: { id: 3, fullName: 'رضا مرادی', personnelCode: 1122 }, reservedFor: [{ id: 4, fullName: 'حسین شریفی', personnelCode: 3344 }, { id: 5, fullName: 'الهام نظری', personnelCode: 5566 }] },
  { id: 4, mealName: 'ناهار', deliveryCode: '1000004', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 4, fullName: 'مریم سادات', personnelCode: 7788 }, reservedFor: [{ id: 6, fullName: 'حمید عباسی', personnelCode: 9090 }] },
  { id: 5, mealName: 'شام', deliveryCode: '1000005', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 2, reservedBy: { id: 5, fullName: 'ابوالفضل رنجبر', personnelCode: 1920 }, reservedFor: [{ id: 7, fullName: 'یونس قربانی', personnelCode: 2080 }] },
  { id: 6, mealName: 'صبحانه', deliveryCode: '1000006', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 3, reservedBy: { id: 6, fullName: 'حامد عسگری', personnelCode: 3001 }, reservedFor: [{ id: 8, fullName: 'هادی نوری', personnelCode: 3221 }, { id: 9, fullName: 'مهدی طاهری', personnelCode: 3443 }] },
  { id: 7, mealName: 'ناهار', deliveryCode: '1000007', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 1, reservedBy: { id: 7, fullName: 'فاطمه ابراهیمی', personnelCode: 4554 }, reservedFor: [{ id: 10, fullName: 'سجاد واعظی', personnelCode: 4776 }] },
])
const fakeReservedMealsForContractor = ref([
  { id: 1, mealName: 'ناهار', deliveryCode: '1000001', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 1, fullName: 'امیر کریمی', personnelCode: 9876 }, reservedFor: [{ id: 1, fullName: 'محمد امامی', personnelCode: 8766 }] },
  { id: 2, mealName: 'شام', deliveryCode: '1000002', status: { label: 'تایید شده', color: 'green', value: 2 }, count: 1, reservedBy: { id: 2, fullName: 'سارا احمدی', personnelCode: 5543 }, reservedFor: [{ id: 3, fullName: 'نیما رضایی', personnelCode: 6654 }] },
  { id: 3, mealName: 'صبحانه', deliveryCode: '1000003', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 2, reservedBy: { id: 3, fullName: 'رضا مرادی', personnelCode: 1122 }, reservedFor: [{ id: 4, fullName: 'حسین شریفی', personnelCode: 3344 }] },
])
const altFakeReservedMealsForGuest = ref([])
const altFakeReservedMealsForContractor = ref([])

const selectedContractor = ref([])
const selectedMeal = ref([])

const reservationType = ref(null)
const reserveCount = ref(null)

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

// methods
async function submit() {
  ReservedMealsLoading.value = true

  try {
    const [year, month, day] = reserveDate.value.split('/').map(Number)
    const date = { year, month, day }

    const selectedKey = year * 10000 + month * 100 + day
    const todayKey = jdate.value.jy * 10000 + jdate.value.jm * 100 + jdate.value.jd

    if (selectedKey < todayKey) {
      uiState.hasError = true
      uiState.errorMessage = 'لطفا تاریخ درست انتخاب کنید.'
      return
    }

    const basePayload = {
      meal: selectedMeal.value,
      date,
      user_id: useCookie('userData').value.id,
    }

    const payload
      = reservationType.value === 'guest'
        ? {
            ...basePayload,
            reservationType: 'guest',
            count: reserveCount.value,
          }
        : {
            ...basePayload,
            reservationType: 'contractor',
            contractor: selectedContractor.value,
            count: reserveCount.value,
          }

    const res = await $api('/food/reserve/testPost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    altFakeReservedMealsForGuest.value = fakeReservedMealsForGuest.value
    altFakeReservedMealsForContractor.value = fakeReservedMealsForContractor.value

    return res
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    throw err
  }
  finally {
    ReservedMealsLoading.value = false
    selectedContractor.value = null
    selectedMeal.value = null
    reserveDate.value = null
    reserveCount.value = null
  }
}

async function fetchReservedMealsForDate(data) {
  altFakeReservedMealsForGuest.value = []
  altFakeReservedMealsForContractor.value = []
  ReservedMealsLoading.value = true

  let payload

  if (reserveDate.value) {
    const [year, month, day] = reserveDate.value.split('/').map(Number)
    payload = { year, month, day }
  }
  else {
    const [year, month, day] = data
    payload = { year, month, day }
  }

  const query = new URLSearchParams(payload).toString()

  try {
    const _res = await $api(`/food/reserve/testFetch?${query}`, {
      method: 'GET',
    })

    // replace with real data later
    altFakeReservedMealsForGuest.value = fakeReservedMealsForGuest.value
    altFakeReservedMealsForContractor.value = fakeReservedMealsForContractor.value
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
  }
  finally {
    ReservedMealsLoading.value = false
  }
}

async function fetchUsers() {
  try {
    const { data, error } = await useApi(createUrl('/base/user'))
    if (error.value) {
      uiState.hasError = true
      uiState.errorMessage = 'خطا در دریافت کاربران'
      throw error.value
    }

    if (data.value.data) {
      users.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
      altUsers.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name}`,
      }))
    }
  }
  catch (e) {
    console.error('Unexpected error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطای غیرمنتظره در دریافت کاربران'
  }
}

onMounted(async () => {
  reservationType.value = 'contractor'
  await fetchUsers()
  const d = new Date()
  const temp = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())

  jdate.value = temp

  const date = [temp.jy, temp.jm, temp.jd]
  await fetchReservedMealsForDate(date)
})

watch(reservationType, () => {
  reserveCount.value = null
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
          v-model="reserveDate"
          format="jYYYY/jMM/jDD"
          inline
          custom-input="#custom-input"
          @change="fetchReservedMealsForDate"
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
                v-model="reserveDate"
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
                item-title="label"
                item-value="value"
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
                v-model="reserveCount"
                label="تعداد"
                variant="outlined"
                :rules="[requiredValidator, ...countInputRules]"
              />
            </VCol>
            <VCol v-else-if="reservationType === 'contractor'" cols="12" sm="12" md="12">
              <v-autocomplete
                v-model="selectedContractor"
                :items="users"
                item-title="fullName"
                item-value="personnel_code"
                label="پیمانکار"
                chips
                clearable
                variant="outlined"
                :rules="[requiredValidator]"
              />
              <VTextField
                v-model="reserveCount"
                label="تعداد"
                variant="outlined"
                :rules="[requiredValidator, ...countInputRules]"
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
        <div class="ma-3 overflow-auto d-none d-md-block">
          <VCard class="pa-4">
            <label class="font-weight-medium mb-4 d-block text-center">
              رزروهای تاریخ انتخاب شده
            </label>

            <VTable v-if="!ReservedMealsLoading && reservationType === 'guest'" density="comfortable">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>کد تحویل</th>
                  <th>وضعیت</th>
                  <th>تعداد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in altFakeReservedMealsForGuest" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.mealName }}</td>
                  <td>{{ item.deliveryCode }}</td>
                  <td>
                    <VChip :color="item.status.color" dark>
                      {{ item.status.label }}
                    </VChip>
                  </td>
                  <td>{{ item.count }}</td>
                  <td>
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                    <VBtn color="red" variant="text" size="small">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                    <VBtn color="primary" variant="text" size="small">
                      <VIcon icon="tabler-file-description" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VTable v-else-if="!ReservedMealsLoading && reservationType === 'contractor'" density="comfortable">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>پیمانکار</th>
                  <th>کد تحویل</th>
                  <th>وضعیت</th>
                  <th>تعداد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in altFakeReservedMealsForContractor" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.mealName }}</td>
                  <td>{{ item.reservedFor[0]?.fullName }}</td>
                  <td>{{ item.deliveryCode }}</td>
                  <td>
                    <VChip :color="item.status.color" dark>
                      {{ item.status.label }}
                    </VChip>
                  </td>
                  <td>{{ item.count }}</td>
                  <td>
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                    <VBtn color="red" variant="text" size="small">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VSkeletonLoader v-else type="card" />
          </VCard>
        </div>

        <!-- برای موبایل -->
        <div class="d-md-none pa-3">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                رزروهای تاریخ انتخاب شده
              </VExpansionPanelTitle>

              <VExpansionPanelText v-if="!ReservedMealsLoading && reservationType === 'guest'">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in altFakeReservedMealsForGuest"
                    :key="index"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.mealName }}</span>
                        <VChip
                          :color="item.status.color"
                          size="small"
                          label
                        >
                          {{ item.status.label }}
                        </VChip>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div><strong>کد تحویل:</strong> {{ item.deliveryCode }}</div>
                        <div><strong>تعداد:</strong> {{ item.count }}</div>
                        <div class="mt-2 text-center">
                          <VBtn color="orange" variant="text" size="small">
                            <VIcon icon="tabler-edit" size="20" />
                          </VBtn>
                          <VBtn color="red" variant="text" size="small">
                            <VIcon icon="tabler-trash" size="20" />
                          </VBtn>
                          <VBtn color="primary" variant="text" size="small">
                            <VIcon icon="tabler-file-description" size="20" />
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>
              <VExpansionPanelText v-else-if="!ReservedMealsLoading && reservationType === 'contractor'">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="(item, index) in altFakeReservedMealsForContractor"
                    :key="index"
                    clawss="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex justify-space-between w-100 align-center">
                        <span>{{ item.mealName }}</span>
                        <VChip
                          :color="item.status.color"
                          size="small"
                          label
                        >
                          {{ item.status.label }}
                        </VChip>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div><strong>پیمانکار:</strong> {{ item.reservedFor[0]?.fullName }}</div>
                        <div><strong>کد تحویل:</strong> {{ item.deliveryCode }}</div>
                        <div><strong>تعداد:</strong> {{ item.count }}</div>
                        <div class="mt-2 text-center">
                          <VBtn color="orange" variant="text" size="small">
                            <VIcon icon="tabler-edit" size="20" />
                          </VBtn>
                          <VBtn color="red" variant="text" size="small">
                            <VIcon icon="tabler-trash" size="20" />
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
