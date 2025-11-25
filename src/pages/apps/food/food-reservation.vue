<script setup>
import { can } from '@layouts/plugins/casl'
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
const users = ref([])
const altUsers = ref([])
const meals = ref([
  { label: 'ناهار', value: 1 },
  { label: 'شام', value: 2 },
])
const fakeReservedMeals = ref([
  { id: 1, mealName: 'ناهار', deliveryCode: '1000001', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 1, fullName: 'امیر کریمی', personnelCode: 9876 }, reservedFor: [{ id: 1, fullName: 'محمد امامی', personnelCode: 8766 }, { id: 2, fullName: 'محمد حسنی', personnelCode: 7687 }] },
  { id: 2, mealName: 'شام', deliveryCode: '1000002', status: { label: 'تایید شده', color: 'green', value: 2 }, count: 1, reservedBy: { id: 2, fullName: 'سارا احمدی', personnelCode: 5543 }, reservedFor: [{ id: 3, fullName: 'نیما رضایی', personnelCode: 6654 }] },
  { id: 3, mealName: 'صبحانه', deliveryCode: '1000003', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 2, reservedBy: { id: 3, fullName: 'رضا مرادی', personnelCode: 1122 }, reservedFor: [{ id: 4, fullName: 'حسین شریفی', personnelCode: 3344 }, { id: 5, fullName: 'الهام نظری', personnelCode: 5566 }] },
  { id: 4, mealName: 'ناهار', deliveryCode: '1000004', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 4, fullName: 'مریم سادات', personnelCode: 7788 }, reservedFor: [{ id: 6, fullName: 'حمید عباسی', personnelCode: 9090 }] },
  { id: 5, mealName: 'شام', deliveryCode: '1000005', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 2, reservedBy: { id: 5, fullName: 'ابوالفضل رنجبر', personnelCode: 1920 }, reservedFor: [{ id: 7, fullName: 'یونس قربانی', personnelCode: 2080 }] },
  { id: 6, mealName: 'صبحانه', deliveryCode: '1000006', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 3, reservedBy: { id: 6, fullName: 'حامد عسگری', personnelCode: 3001 }, reservedFor: [{ id: 8, fullName: 'هادی نوری', personnelCode: 3221 }, { id: 9, fullName: 'مهدی طاهری', personnelCode: 3443 }] },
  { id: 7, mealName: 'ناهار', deliveryCode: '1000007', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 1, reservedBy: { id: 7, fullName: 'فاطمه ابراهیمی', personnelCode: 4554 }, reservedFor: [{ id: 10, fullName: 'سجاد واعظی', personnelCode: 4776 }] },
  { id: 8, mealName: 'شام', deliveryCode: '1000008', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 2, reservedBy: { id: 8, fullName: 'بهار شفیعی', personnelCode: 5002 }, reservedFor: [{ id: 11, fullName: 'یاسین لطیفی', personnelCode: 5102 }] },
  { id: 9, mealName: 'صبحانه', deliveryCode: '1000009', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 1, reservedBy: { id: 9, fullName: 'سام رحیمی', personnelCode: 6011 }, reservedFor: [{ id: 12, fullName: 'مهسا طاهرپور', personnelCode: 6200 }] },
  { id: 10, mealName: 'ناهار', deliveryCode: '1000010', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 3, reservedBy: { id: 10, fullName: 'مونا یزدی', personnelCode: 7020 }, reservedFor: [{ id: 13, fullName: 'شایان نامداری', personnelCode: 7120 }, { id: 14, fullName: 'نوید صفری', personnelCode: 7220 }] },

  { id: 11, mealName: 'شام', deliveryCode: '1000011', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 1, reservedBy: { id: 11, fullName: 'کیانا توکلی', personnelCode: 7333 }, reservedFor: [{ id: 15, fullName: 'سینا جباری', personnelCode: 7444 }] },
  { id: 12, mealName: 'صبحانه', deliveryCode: '1000012', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 2, reservedBy: { id: 12, fullName: 'حسین نوروزی', personnelCode: 7555 }, reservedFor: [{ id: 16, fullName: 'پریسا واحدی', personnelCode: 7666 }] },
  { id: 13, mealName: 'ناهار', deliveryCode: '1000013', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 3, reservedBy: { id: 13, fullName: 'سیاوش مردانی', personnelCode: 7777 }, reservedFor: [{ id: 17, fullName: 'کاظم خطیبی', personnelCode: 7888 }] },
  { id: 14, mealName: 'شام', deliveryCode: '1000014', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 2, reservedBy: { id: 14, fullName: 'سهیل قربان‌پور', personnelCode: 7999 }, reservedFor: [{ id: 18, fullName: 'طاهر محسنی', personnelCode: 8001 }] },
  { id: 15, mealName: 'صبحانه', deliveryCode: '1000015', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 1, reservedBy: { id: 15, fullName: 'آرزو کامیاب', personnelCode: 8112 }, reservedFor: [{ id: 19, fullName: 'نگین جوان', personnelCode: 8223 }] },

  { id: 16, mealName: 'ناهار', deliveryCode: '1000016', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 2, reservedBy: { id: 16, fullName: 'امین السادات', personnelCode: 8334 }, reservedFor: [{ id: 20, fullName: 'هادی خانی', personnelCode: 8445 }] },
  { id: 17, mealName: 'شام', deliveryCode: '1000017', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 17, fullName: 'سجاد قاسمی', personnelCode: 8556 }, reservedFor: [{ id: 21, fullName: 'علی تکمیل', personnelCode: 8667 }] },
  { id: 18, mealName: 'صبحانه', deliveryCode: '1000018', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 18, fullName: 'زهرا شریفی', personnelCode: 8778 }, reservedFor: [{ id: 22, fullName: 'وحید طاهری', personnelCode: 8889 }] },
  { id: 19, mealName: 'ناهار', deliveryCode: '1000019', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 19, fullName: 'احسان ملکی', personnelCode: 8991 }, reservedFor: [{ id: 23, fullName: 'آرین بهمنی', personnelCode: 9002 }] },
  { id: 20, mealName: 'شام', deliveryCode: '1000020', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 2, reservedBy: { id: 20, fullName: 'پوریا احمدی', personnelCode: 9113 }, reservedFor: [{ id: 24, fullName: 'نادر ناصری', personnelCode: 9224 }] },

  { id: 21, mealName: 'صبحانه', deliveryCode: '1000021', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 21, fullName: 'یاسمن قنبری', personnelCode: 9335 }, reservedFor: [{ id: 25, fullName: 'شهروز کریمی', personnelCode: 9446 }] },
  { id: 22, mealName: 'ناهار', deliveryCode: '1000022', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 2, reservedBy: { id: 22, fullName: 'پیمان نیک‌سرشت', personnelCode: 9557 }, reservedFor: [{ id: 26, fullName: 'هومن نیری', personnelCode: 9668 }] },
  { id: 23, mealName: 'شام', deliveryCode: '1000023', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 3, reservedBy: { id: 23, fullName: 'الهام ولی‌پور', personnelCode: 9779 }, reservedFor: [{ id: 27, fullName: 'حسین ابراهیمی', personnelCode: 9880 }] },
  { id: 24, mealName: 'صبحانه', deliveryCode: '1000024', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 1, reservedBy: { id: 24, fullName: 'آریا نامور', personnelCode: 9990 }, reservedFor: [{ id: 28, fullName: 'نوید پناهی', personnelCode: 10001 }] },
  { id: 25, mealName: 'ناهار', deliveryCode: '1000025', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 2, reservedBy: { id: 25, fullName: 'شهاب مقیمی', personnelCode: 10110 }, reservedFor: [{ id: 29, fullName: 'عرفان خلیلی', personnelCode: 10220 }] },

  { id: 26, mealName: 'شام', deliveryCode: '1000026', status: { label: 'تایید نشده', color: 'red', value: 3 }, count: 1, reservedBy: { id: 26, fullName: 'رامین غضنفری', personnelCode: 10330 }, reservedFor: [{ id: 30, fullName: 'پدرام توفیقی', personnelCode: 10440 }] },
  { id: 27, mealName: 'صبحانه', deliveryCode: '1000027', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 27, fullName: 'رویا همتی', personnelCode: 10550 }, reservedFor: [{ id: 31, fullName: 'حامد درستکار', personnelCode: 10660 }] },
  { id: 28, mealName: 'ناهار', deliveryCode: '1000028', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 2, reservedBy: { id: 28, fullName: 'مهدیس کرمانی', personnelCode: 10770 }, reservedFor: [{ id: 32, fullName: 'فرهاد آقایی', personnelCode: 10880 }] },
  { id: 29, mealName: 'شام', deliveryCode: '1000029', status: { label: 'تحویل گرفته شده', color: 'primary', value: 4 }, count: 1, reservedBy: { id: 29, fullName: 'وحیده میرزایی', personnelCode: 10990 }, reservedFor: [{ id: 33, fullName: 'حمیدرضا سعیدی', personnelCode: 11001 }] },
  { id: 30, mealName: 'صبحانه', deliveryCode: '1000030', status: { label: 'در انتظار تایید', color: 'orange', value: 1 }, count: 3, reservedBy: { id: 30, fullName: 'سعید شیری', personnelCode: 11111 }, reservedFor: [{ id: 34, fullName: 'بیژن قاسمی', personnelCode: 11222 }] },
])
const altFakeReservedMeals = ref([])
const selectedPersonnel = ref([])
const selectedMeal = ref([])

async function submit() {
  if (!reserveDate.value || !selectedMeal.value || !selectedPersonnel.value) {
    return
  }
  ReservedMealsLoading.value = true
  const [year, month, day] = reserveDate.value.split('/').map(Number)
  const date = { year, month, day }
  const payload = {
    meal: selectedMeal.value,
    personnel: selectedPersonnel.value,
    date,
    user_id: useCookie('userData').value.id,
  }

  try {
    const _res = await $api('/food/reserve/testPost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    altFakeReservedMeals.value = fakeReservedMeals.value
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
  }
  finally {
    ReservedMealsLoading.value = false
  }
}

async function getReservedMealsForDate(data) {
  altFakeReservedMeals.value = []
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
    altFakeReservedMeals.value = fakeReservedMeals.value
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
  await fetchUsers()
  const d = new Date()
  const jdate = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  const date = [jdate.jy, jdate.jm, jdate.jd]
  await getReservedMealsForDate(date)
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
    <VCol cols="12" md="12" sm="12">
      <VCard class="mb-4 pa-8 text-center">
        <VRow align="center" justify="center" class="gap-4">
          <VCol v-if="!can('use', 'reserve-for-others')" cols="auto">
            <div class="text-h6 font-weight-bold text-primary-darken-3">
              رزرو غذا
            </div>
          </VCol>

          <template v-else>
            <VBtn density="default">
              رزرو غذا
            </VBtn>

            <VBtn density="default">
              رزرو غذای میهمان/ پیمانکار
            </VBtn>
          </template>
        </VRow>
      </VCard>
    </VCol>
  </VRow>

  <VRow dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="reserveDate"
        format="jYYYY/jMM/jDD"
        inline
        custom-input="#custom-input"
        @change="getReservedMealsForDate"
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
          <VCol cols="12" class="mb-3">
            <v-autocomplete
              v-model="selectedPersonnel"
              :items="users"
              item-title="fullName"
              item-value="personnel_code"
              label="افراد"
              multiple
              chips
              clearable
              variant="outlined"
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
      <div class="ma-3 overflow-auto d-none d-md-block">
        <VCard class="pa-4">
          <label class="font-weight-medium mb-4 d-block text-center">
            رزروهای تاریخ انتخاب شده
          </label>

          <VTable v-if="!ReservedMealsLoading" density="comfortable">
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
              <tr v-for="(item, index) in altFakeReservedMeals" :key="index">
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

            <VExpansionPanelText v-if="!ReservedMealsLoading">
              <VExpansionPanels variant="accordion">
                <VExpansionPanel
                  v-for="(item, index) in altFakeReservedMeals"
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
            <VSkeletonLoader v-else type="card" />
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </VCol>
  </VRow>
</template>
