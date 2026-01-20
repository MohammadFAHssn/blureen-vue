<script setup>
import { ref } from 'vue'
import AssessmentRecord from '@/views/apps/personnelRecord/AssessmentRecord.vue'
import BirthdayGiftRecord from '@/views/apps/personnelRecord/BirthdayGiftRecord.vue'
import EducationRecord from '@/views/apps/personnelRecord/EducationRecord.vue'
import FoodReservationRecord from '@/views/apps/personnelRecord/FoodReservationRecord.vue'
import PayrollRecord from '@/views/apps/personnelRecord/PayrollRecord.vue'
import ProductivityRecord from '@/views/apps/personnelRecord/ProductivityRecord.vue'
import ReassignmentRecord from '@/views/apps/personnelRecord/ReassignmentRecord.vue'
import UserInfo from '@/views/apps/personnelRecord/UserInfo.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'Personnel-Records',
  },
})

const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const isLoading = ref(false)

const activePanel = ref(null)

const users = ref([])

const selectedUser = ref([])

const userData = ref(null)

const educationEmploymentData = ref(null)

const educationReassignmentData = ref(null)

const reassignmentData = ref(null)

const assessmentData = ref(null)

const payrollData = ref(null)

const foodReserveData = ref(null)

const productivityData = ref(null)

const birthdayGiftData = ref(null)

async function onUserSelected(personnelCode) {
  isLoading.value = true
  if (personnelCode) {
    activePanel.value = null
    try {
      const { data, error } = await useApi(
        createUrl(
          `/personnel-records/get-by-personnel_code?personnel_code=${personnelCode}`,
        ),
      )
      isLoading.value = false
      if (error.value) {
        uiState.hasError = true
        throw error.value
      }
      if (data.value.data) {
        const result = data.value.data

        userData.value = result.user_data
        educationEmploymentData.value = result.education_data.employment
        educationReassignmentData.value = result.education_data.reassignment
        reassignmentData.value = result.reassignment_data
        productivityData.value = result.productivity_data
        assessmentData.value = result.assessment_data
        payrollData.value = result.payroll_data
        birthdayGiftData.value = result.birthday_gift_data
        foodReserveData.value = result.food_reserve_data
      }
    }
    catch (e) {
      isLoading.value = false
      uiState.hasError = true
      uiState.errorMessage = e.message || 'خطا در دریافت سوابق پرسنلی'
    }
  }
}

async function fetchUsers() {
  try {
    const { data } = await axiosInstance.get('/base/user')

    if (data.data) {
      users.value = data.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
    }
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  fetchUsers()
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

  <VRow>
    <VCol>
      <h2>سوابق پرسنلی</h2>
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
  <UserInfo :user-data="userData" :is-loading="isLoading" class="mb-3" />

  <VExpansionPanels v-model="activePanel" multiple>
    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        📘 آموزش / بدو استخدام
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <EducationRecord
          v-if="educationEmploymentData"
          :education-data="educationEmploymentData"
          type="employment"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        ♻️ کارگزینی / سوابق جابجایی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <ReassignmentRecord
          v-if="reassignmentData"
          :reassignment-data="reassignmentData"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        📘 آموزش / جابجایی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <EducationRecord
          v-if="educationReassignmentData"
          :education-data="educationReassignmentData"
          type="reassignment"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        📊 ارزیابی عملکرد
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <AssessmentRecord
          v-if="assessmentData"
          :assessment-data="assessmentData"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        💰 فیش حقوقی
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <PayrollRecord v-if="payrollData" :payroll-data="payrollData" />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        🍴 رزرو غذا
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <FoodReservationRecord
          v-if="foodReserveData"
          :food-data="foodReserveData"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        ⚠️ بهره وری / تخلفات
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <ProductivityRecord
          v-if="productivityData"
          :productivity-data="productivityData"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VExpansionPanel>
      <VSkeletonLoader v-if="isLoading" type="list-item" />
      <VExpansionPanelTitle v-else>
        🎁 هدایای تولد
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <BirthdayGiftRecord
          v-if="birthdayGiftData"
          :birthday-gifts="birthdayGiftData"
        />
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style scoped lang="scss"></style>
