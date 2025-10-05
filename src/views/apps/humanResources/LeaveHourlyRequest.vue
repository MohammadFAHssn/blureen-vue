<script setup>
const leaveDate = ref(null)
const startTime = ref('')
const endTime = ref('')
const attendanceLogs = ref([
  { in: '07:25', out: '09:27' },
  { in: '11:08', out: '15:00' },
])
const todayRequests = ref([
  { date: '1404/07/03', from: '12:00', to: '13:00', status: 'تایید شده' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
  { date: '1404/07/06', from: '14:00', to: '15:00', status: 'در انتظار تایید' },
])
</script>

<template>
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      درخواست مرخصی ساعتی
    </h2>
  </div>

  <VRow dense>
    <VCol cols="12" md="12" sm="12">
      <VCard color="primary" variant="tonal" class="mb-4 pa-4 text-center">
        <VRow align="center" justify="center">
          <VCol cols="auto">
            <VAvatar color="primary" size="56" variant="flat">
              <VIcon icon="tabler-calendar-stats" size="32" />
            </VAvatar>
          </VCol>
          <VCol cols="auto">
            <div class="text-h6 font-weight-bold text-primary-darken-3">
              مانده مرخصی شما
            </div>
            <div class="text-h5 font-weight-bold text-success">
              ۵ روز
            </div>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>

  <VRow dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="leaveDate"
        format="jYYYY/jMM/jDD"
        inline
        custom-input="#custom-input"
      />
    </VCol>

    <VCol cols="12" md="8">
      <VCard class="mb-4">
        <label class="font-weight-medium mb-4 mt-2 d-block text-center">
          ترددهای روز
        </label>
        <VRow justify="center" dense>
          <template v-if="attendanceLogs.length">
            <template v-for="(log, i) in attendanceLogs" :key="`pair-${i}`">
              <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
                <div class="mb-1 font-weight-medium">
                  ورود {{ i + 1 }}
                </div>
                <div class="text-error">
                  {{ log.in || '-' }}
                </div>
              </VCol>
              <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
                <div class="mb-1 font-weight-medium">
                  خروج {{ i + 1 }}
                </div>
                <div class="text-error">
                  {{ log.out || '-' }}
                </div>
              </VCol>
            </template>
          </template>
          <VCol v-else cols="12" class="text-center text-error">
            -
          </VCol>
        </VRow>
      </VCard>

      <VCard class="mb-4">
        <label class="font-weight-medium mb-2 mt-2 d-block text-center">
          جزئیات درخواست
        </label>
        <VRow class="mb-4 px-4">
          <VCol cols="12" sm="6">
            <VTextField
              v-model="startTime"
              label="ساعت شروع"
              type="time"
              density="compact"
              variant="outlined"
              step="60"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="endTime"
              label="ساعت پایان"
              type="time"
              density="compact"
              variant="outlined"
              step="60"
            />
          </VCol>
        </VRow>
        <VRow justify="center" class="mb-4">
          <VCol cols="auto">
            <VBtn color="primary">
              ثبت درخواست
            </VBtn>
          </VCol>
        </VRow>
      </VCard>

      <!-- برای دسکتاپ -->
      <div class="ma-3 overflow-auto d-none d-md-block">
        <VCard class="pa-4">
          <label class="font-weight-medium mb-4 d-block text-center">
            مرخصی‌های ساعتی ماه جاری
          </label>

          <table class="requests-table w-100">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>ساعت شروع</th>
                <th>ساعت پایان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in todayRequests" :key="index">
                <td>{{ item.date }}</td>
                <td>{{ item.from }}</td>
                <td>{{ item.to }}</td>
                <td>
                  <VChip
                    :color="
                      item.status === 'تایید شده'
                        ? 'success'
                        : item.status === 'رد شده'
                          ? 'error'
                          : 'warning'
                    "
                    size="small"
                    label
                  >
                    {{ item.status }}
                  </VChip>
                </td>
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
          </table>
        </VCard>
      </div>

      <!-- برای موبایل -->
      <div class="d-md-none pa-3">
        <VExpansionPanels variant="accordion">
          <!-- کشوی اصلی مربوط به "مرخصی‌های ماه جاری" -->
          <VExpansionPanel>
            <VExpansionPanelTitle class="font-weight-bold">
              مرخصی‌های ساعتی ماه جاری
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <!-- کشوهای داخلی برای هر مرخصی -->
              <VExpansionPanels variant="accordion">
                <VExpansionPanel
                  v-for="(item, index) in todayRequests"
                  :key="index"
                  class="mb-2"
                >
                  <VExpansionPanelTitle>
                    <div class="d-flex justify-space-between w-100 align-center">
                      <span>{{ item.date }}</span>
                      <VChip
                        :color="
                          item.status === 'تایید شده'
                            ? 'success'
                            : item.status === 'رد شده'
                              ? 'error'
                              : 'warning'
                        "
                        size="small"
                        label
                      >
                        {{ item.status }}
                      </VChip>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="pa-2">
                      <div><strong>ساعت شروع:</strong> {{ item.from }}</div>
                      <div><strong>ساعت پایان:</strong> {{ item.to }}</div>
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
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </VCol>
  </VRow>
</template>

<style scoped>
.requests-table {
  width: 100%;
  border-collapse: collapse;
}
.requests-table th,
.requests-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.requests-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
