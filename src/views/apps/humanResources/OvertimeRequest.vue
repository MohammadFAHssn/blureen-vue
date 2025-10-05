<script setup>
const overtimeDate = ref(null)
const startTime = ref('')
const endTime = ref('')
const description = ref('')
const todayRequests = ref([
  { from: '12:00', to: '13:00', status: 'تایید شده' },
  { from: '14:00', to: '15:00', status: 'در انتظار تایید' },
])
const attendanceLogs = ref([
  { in: '07:25', out: '09:27' },
])
</script>

<template>
  <div>
    <VBtn variant="text" prepend-icon="tabler-arrow-right" class="mb-4" @click="$emit('back')">
      صفحه اصلی
    </VBtn>
  </div>
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      ثبت مجوز اضافه کار
    </h2>
  </div>

  <VRow class="pa-2" dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="overtimeDate"
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
          <VCol cols="12">
            <VTextarea
              v-model="description"
              label="توضیحات"
              auto-grow
              variant="outlined"
              rows="3"
              placeholder="توضیحات اضافه کار را وارد کنید..."
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

      <VCard>
        <label class="font-weight-medium mb-2 mt-2 d-block text-center">
          درخواست‌های ثبت شده
        </label>
        <div class="ma-3 overflow-auto">
          <table class="requests-table w-100">
            <thead>
              <tr>
                <th>ساعت شروع</th>
                <th>ساعت پایان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in todayRequests" :key="index">
                <td>{{ item.from }}</td>
                <td>{{ item.to }}</td>
                <td>{{ item.status }}</td>
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
        </div>
      </VCard>
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
