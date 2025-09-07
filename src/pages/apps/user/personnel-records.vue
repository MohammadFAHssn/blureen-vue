<script setup>
import AssessmentRecord from '@/views/apps/personnelRecord/AssessmentRecord.vue'
import BirthdayGiftRecord from '@/views/apps/personnelRecord/BirthdayGiftRecord.vue'
import EducationRecord from '@/views/apps/personnelRecord/EducationRecord.vue'
import FoodReservationRecord from '@/views/apps/personnelRecord/FoodReservationRecord.vue'
import PayrollRecord from '@/views/apps/personnelRecord/PayrollRecord.vue'
import ProductivityRecord from '@/views/apps/personnelRecord/ProductivityRecord.vue'
import ReassignmentRecord from '@/views/apps/personnelRecord/ReassignmentRecord.vue'
import UserInfo from '@/views/apps/personnelRecord/UserInfo.vue'

const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const users = ref([])

const selectedUser = ref([])

const userData = {
  personnel_code: '6927',
  full_name: 'امیرحسین کریمی',
  unit: 'واحد برنامه نویسی',
  job_position: 'کارمند دفتری (اداری)',
  introduced_date: '1403/10/02',
  recruitment_date: '1403/10/02',
}

const educationData = {
  employment: [
    {
      unit_training: [
        { date: '', title: 'آموزش 1', type: 1, validation: 3 },
        { date: '', title: 'آموزش 2', type: 1, validation: 5 },
        { date: '', title: 'آموزش 3', type: 2, validation: 1 },
      ],
      hse_training: [
        { date: '', title: 'آموزش های بدو استخدام' },
        { date: '', title: 'آموزش های بدو استخدام2' },
      ],
    },
  ],
  reassignment: [
    {
      unit_training: [
        { date: '', title: 'آموزش 1', type: 1, validation: 3 },
        { date: '', title: 'آموزش 2', type: 1, validation: 5 },
        { date: '', title: 'آموزش 3', type: 2, validation: 1 },
      ],
      hse_training: [
        { date: '', title: 'آموزش های بدو استخدام' },
        { date: '', title: 'آموزش های بدو استخدام2' },
      ],
    },
    {
      unit_training: [
        { date: '', title: 'آموزش 1', type: 1, validation: 3 },
        { date: '', title: 'آموزش 2', type: 1, validation: 5 },
        { date: '', title: 'آموزش 3', type: 2, validation: 1 },
      ],
      hse_training: [
        { date: '', title: 'آموزش های بدو استخدام' },
        { date: '', title: 'آموزش های بدو استخدام2' },
      ],
    },
    {
      unit_training: [
        { date: '', title: 'آموزش 1', type: 1, validation: 3 },
        { date: '', title: 'آموزش 2', type: 1, validation: 5 },
        { date: '', title: 'آموزش 3', type: 2, validation: 1 },
      ],
      hse_training: [
        { date: '', title: 'آموزش های بدو استخدام' },
        { date: '', title: 'آموزش های بدو استخدام2' },
      ],
    },
  ],
}

const reassignmentData = [
  {
    personnel_code: 6013,
    old_unit: 'واحد تولید آیینه',
    workplace: 'فلوت مرکزی',
    work_aria: 'انبار غیرمحصول',
    new_unit: 'انبار قطعات',
  },
  {
    personnel_code: 6927,
    old_unit: 'واحد اداری',
    workplace: 'ساختمان مرکزی',
    work_aria: 'بخش بایگانی',
    new_unit: 'واحد برنامه‌نویسی',
  },
]

const assessmentData = [
  {
    personnel_code: '6927',
    assessment_period: 'هجدهم',
    assessment_month: '04',
    assessment_year: '1404',
    personnel_rank_status: 'عادی',
    manager_assessment_score: '35',
    manager_assessment_result: 'عالی',
    attendance_score: '10',
    disciplinary_score: '10',
    hse_score: '10',
    security_score: '5',
    final_score: '99.33',
    final_result: 'بسیار خوب',
  },
]

const payrollData = {
  1404: {
    1: 1,
    2: 1,
    3: 0,
    4: 1,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 1,
    11: 1,
    12: 0,
  },
  1403: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1,
    7: 1,
    8: 0,
    9: 1,
    10: 1,
    11: 1,
    12: 0,
  },
}

const foodData = {
  personnel_code: 6927,
  total_reserves: 60,
  normal_reserves: 50,
  compulsive_reserves: 10,
  years: {
    1404: { months: [0, 14, 15, 2, 0, 1, 0, 0, 0, 0, 0, 0], year_total: 32 },
    1403: { months: [2, 5, 7, 4, 3, 6, 1, 0, 0, 0, 0, 0], year_total: 28 },
    1402: { months: [8, 3, 10, 4, 3, 6, 1, 5, 0, 4, 0, 0], year_total: 43 },
  },
}

const birthdayGifts = [
  { year: '1404', month: '03', gift: 'پنکه پایه بلند مدل 4060r' },
  { year: '1403', month: '05', gift: 'کارت هدیه 500 هزار تومانی' },
]

const productivityData = [
  {
    personnel_code: 6341,
    month: 4,
    year: 1403,
    penalty_title: 'تخلف اداری (تاخیر)',
    penalty_type: 'اداری',
    date_of_occurrence: '2024-06-14 07:02:00',
  },
  {
    personnel_code: 6341,
    month: 6,
    year: 1404,
    penalty_title: 'عدم استفاده از تجهیزات حفاظت فردی',
    penalty_type: 'ایمنی (HSE)',
    date_of_occurrence: '2025-08-25 21:30:00',
  },
  {
    personnel_code: 6341,
    month: 5,
    year: 1404,
    penalty_title: 'عدم استفاده از تجهیزات حفاظت فردی',
    penalty_type: 'ایمنی (HSE)',
    date_of_occurrence: '2025-08-25 21:30:00',
  },
  {
    personnel_code: 6341,
    month: 5,
    year: 1404,
    penalty_title: 'عدم استفاده از تجهیزات حفاظت فردی',
    penalty_type: 'ایمنی (HSE)',
    date_of_occurrence: '2025-08-25 21:30:00',
  },
  {
    personnel_code: 6341,
    month: 5,
    year: 1404,
    penalty_title: 'عدم استفاده از تجهیزات حفاظت فردی',
    penalty_type: 'مدیریت',
    date_of_occurrence: '2025-08-25 21:30:00',
  },
  {
    personnel_code: 6341,
    month: 5,
    year: 1404,
    penalty_title: 'عدم استفاده از تجهیزات حفاظت فردی',
    penalty_type: 'مدیریت',
    date_of_occurrence: '2025-08-25 21:30:00',
  },
]

const birthdayGiftData = ref([])

const foodReserveData = ref([])

async function onUserSelected(personnelCode) {
  if (personnelCode) {
    try {
      const { data, error } = await useApi(
        createUrl(
          `/personnel-records/get-by-personnel_code?personnel_code=${personnelCode}`,
        ),
      )
      if (error.value) {
        console.log(error.value)
      }
      if (data.value.data) {
        const arr = data.value.data
        const result = Object.assign({}, ...arr)

        educationData.value = ref(result.education_data || null)
        // introductionData.value = ref(result.introduction_data || [])
        reassignmentData.value = ref(result.reassignment_data || [])
        productivityData.value = ref(result.productivity_data || [])
        assessmentData.value = ref(result.assessment_data || [])
        payrollData.value = ref(result.payroll_data || [])
        birthdayGiftData.value = ref(result.birthday_gift_data || [])
        foodReserveData.value = ref(result.food_reserve_data || {})

        console.log(educationData.value.employment)
      }
    }
    catch (e) {
      uiState.hasError = true
      uiState.errorMessage = e.message || 'خطا در دریافت سوابق پرسنلی'
    }
  }
}
async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user?fields[roles]=name&include=roles'),
    )

    if (error.value) {
      console.error('Error fetching users:', error.value)
      uiState.hasError = true
      uiState.errorMessage = 'خطا در دریافت کاربران'
      return
    }

    if (data.value.data) {
      users.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
    }
  }
  catch (e) {
    console.error('Unexpected error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطای غیرمنتظره در دریافت کاربران'
  }
}

await fetchUsers()
</script>

<template>
  <VRow>
    <VCol>
      <h2>
        سوابق پرسنلی
      </h2>
    </VCol>
  </VRow>
  <VRow justify="center" align="center">
    <VCol cols="12" sm="12" md="10" lg="8" xl="6">
      <VCard>
        <div class="d-flex align-center justify-space-between">
          <v-autocomplete
            v-model="selectedUser"
            clearable
            label="جستجوی پرسنل"
            :items="users"
            item-title="fullName"
            item-value="personnel_code"
            variant="solo-filled"
            @update:model-value="onUserSelected"
          />
        </div>
      </VCard>
    </VCol>
  </VRow>
  <UserInfo :user-data="userData" class="mb-3" />

  <VExpansionPanels multiple>
    <!-- آموزش بدو استخدام -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        📘 سامانه آموزش / بدو استخدام
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <EducationRecord :education-data="educationData.employment" type="employment" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- سوابق جابجایی -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        ♻️ سامانه کارگزینی / سوابق جابجایی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <ReassignmentRecord :reassignment-data="reassignmentData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- آموزش پس از جابجایی -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        📘 سامانه آموزش / جابجایی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <EducationRecord :education-data="educationData.reassignment" type="reassignment" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- ارزیابی عملکرد -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        📊سامانه ارزیابی عملکرد
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <AssessmentRecord :assessment-data="assessmentData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- فیش حقوقی -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        💰سامانه فیش حقوقی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <PayrollRecord :payroll-data="payrollData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- رزرو غذا -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        🍴سامانه رزرو غذا
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <FoodReservationRecord :food-data="foodData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- تخلفات -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        ⚠️سامانه بهره وری / تخلفات
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <ProductivityRecord :productivity-data="productivityData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <!-- هدیه تولد -->
    <VExpansionPanel>
      <VExpansionPanelTitle>
        🎁سامانه هدایای تولد
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <BirthdayGiftRecord :birthday-gifts="birthdayGifts" />
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style scoped lang="scss">
</style>
