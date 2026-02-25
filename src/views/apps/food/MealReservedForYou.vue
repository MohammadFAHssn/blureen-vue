<script setup>
import jalaali from 'jalaali-js'

const uiState = reactive({ hasError: false, errorMessage: '' })
const pendingState = reactive({ fetching: false })

const reserveDates = ref([])
const reserved = ref([])

function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

async function fetchData() {
  pendingState.fetching = true
  uiState.hasError = false
  try {
    const res = await $api('/food/meal-reservation/get-for-user-on-date', {
      method: 'GET',
      params: { 'date[]': reserveDates.value },
    })
    reserved.value = (res.data || []).flat()
  }
  catch (e) {
    console.error(e)
    setError('خطا در دریافت رزروها')
    reserved.value = []
  }
  finally {
    pendingState.fetching = false
  }
}

const items = computed(() =>
  [...reserved.value].sort((a, b) =>
    String(a.reservation?.date || '').localeCompare(String(b.reservation?.date || '')),
  ),
)

const statusText = s => (s ? 'تحویل شده' : 'تحویل نشده')
const statusColor = s => (s ? 'success' : 'error')

onMounted(async () => {
  const d = new Date()
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  reserveDates.value = [`${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`]
  await fetchData()
})
</script>

<template>
  <VSnackbar v-model="uiState.hasError" :timeout="2000" location="center" variant="flat" color="error">
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VRow dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display:none" />
      <PersianDatetimePicker
        v-model="reserveDates"
        format="jYYYY/jMM/jDD"
        inline
        multiple
        custom-input="#custom-input"
        @change="fetchData"
      />
    </VCol>

    <VCol cols="12" md="8">
      <VCard class="pa-4 ma-3 overflow-auto">
        <label class="font-weight-medium mb-4 d-block text-center">
          رزروهای تاریخ‌های انتخاب شده
        </label>

        <VSkeletonLoader v-if="pendingState.fetching" type="card" />

        <div v-else-if="!items.length" class="text-center">
          <VChip color="error">
            رزروی برای نمایش وجود ندارد
          </VChip>
        </div>

        <!-- Desktop table -->
        <VTable v-else class="d-none d-md-table w-100">
          <thead>
            <tr>
              <th>ردیف</th>
              <th>وعده</th>
              <th>تاریخ</th>
              <th>رزرو شده توسط</th>
              <th>کد پرسنلی</th>
              <th>کد تحویل</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.reservation?.mealName }}</td>
              <td><VChip>{{ item.reservation?.date }}</VChip></td>
              <td>
                <VChip color="primary">
                  {{ item.createdBy }}
                </VChip>
              </td>
              <td><VChip>{{ item.personnelCode }}</VChip></td>
              <td><VChip>{{ item.deliveryCode }}</VChip></td>
              <td>
                <VChip :color="statusColor(item.deliveryStatus)" size="small">
                  {{ statusText(item.deliveryStatus) }}
                </VChip>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Mobile accordion -->
        <div class="d-md-none">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel v-for="(item, index) in items" :key="index" class="mb-2">
              <VExpansionPanelTitle>
                <div class="d-flex flex-column w-100">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span>{{ item.reservation?.mealName }}</span>
                    <VChip :color="statusColor(item.deliveryStatus)" size="small">
                      {{ statusText(item.deliveryStatus) }}
                    </VChip>
                  </div>
                  <div class="d-flex justify-space-between align-center">
                    <VChip color="success">
                      {{ item.deliveryCode }}
                    </VChip>
                    <VChip>{{ item.reservation?.date }}</VChip>
                  </div>
                </div>
              </VExpansionPanelTitle>

              <VExpansionPanelText>
                <div class="pa-2">
                  <div>
                    <strong>رزرو کننده:</strong>
                    <VChip color="primary">
                      {{ item.createdBy }}
                    </VChip>
                  </div>
                  <div>
                    <strong>کد پرسنلی:</strong>
                    <VChip color="primary">
                      {{ item.personnelCode }}
                    </VChip>
                  </div>
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>
