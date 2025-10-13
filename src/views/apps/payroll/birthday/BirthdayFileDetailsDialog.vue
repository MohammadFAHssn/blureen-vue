<script setup>
const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits([
  'update:isDialogVisible',
  'update:selectedBirthdayFile-users',
])

// Local reactive copy of birthday file users
const localUsers = ref([...props.file.users])

// Multi-select
const selectedNewUsers = ref([])

// Check-box
const selectedUsers = ref([])

const users = ref([])
const altUsers = ref([])

// Actions
async function addNewUser() {
  try {
    const res = await $api('/birthday/user/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthday_file_id: props.file.id,
        codes: selectedNewUsers.value,
      }),
    })

    const createdItems
      = res?.created?.filter(item => !item.skipped)?.map(item => item.data)
        || []

    localUsers.value = [
      ...localUsers.value,
      ...createdItems.map(data => ({
        id: data.id,
        status: data.status ? 1 : 0,
        gift: data.gift,
        user: altUsers.value.find(u => u.id === data.userId),
      })),
    ]

    emit('update:selectedBirthdayFile-users', localUsers.value)

    selectedNewUsers.value = []
  }
  catch (err) {
    console.error('Error adding users:', err)
  }
}

async function downloadStatisticsFile() {
  const file = props.file
  try {
    const res = await $api('/birthday/file/statistics', {
      method: 'GET',
      params: { id: file.id },
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `آمار-کاربران-${file.year}.${file.month}.xlsx`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  catch (e) {
    console.error('Error fetching statistics file:', e)
  }
}

async function deleteUser() {
  try {
    await $api('/birthday/user/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: selectedUsers.value }),
    })

    localUsers.value = localUsers.value.filter(
      user => !selectedUsers.value.includes(user.id),
    )

    emit('update:selectedBirthdayFile-users', localUsers.value)

    selectedUsers.value = []
  }
  catch (err) {
    console.error('Error deleting user:', err)
  }
}

async function toggleUserStatus(u) {
  try {
    const res = await $api('/birthday/user/status', {
      method: 'POST',
      body: {
        codes: [u.id],
      },
      onResponseError({ response }) {
        console.error('Failed to toggle user status:', response._data?.message)
      },
    })

    if (res?.data?.length) {
      u.status = res.data[0].status
      console.log(`User ${u.user.fullName} status updated to: ${u.status}`)
    }
  }
  catch (err) {
    console.error('Error toggling user status:', err)
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
await fetchUsers()
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard>
      <VCardTitle class="text-h6">
        جزئیات فایل هدیه: {{ props.file.name }}
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>ماه:</strong> {{ props.file.month }}</p>
            <p><strong>سال:</strong> {{ props.file.year }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>وضعیت:</strong>
              {{ props.file.status === 1 ? 'فعال' : 'غیرفعال' }}
            </p>
            <p>
              <strong>تعداد کاربران:</strong>
              {{ localUsers?.length || 0 }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <!-- Buttons -->
        <div class="d-flex justify-end gap-3 mb-3">
          <VBtn variant="outlined" color="primary" @click="downloadStatisticsFile">
            دانلود فایل آمار
          </VBtn>
          <VBtn
            v-if="selectedNewUsers.length"
            variant="outlined"
            color="success"
            @click="addNewUser"
          >
            افزودن به لیست
          </VBtn>
          <VBtn
            v-if="selectedUsers.length"
            variant="outlined"
            color="error"
            @click="deleteUser"
          >
            حذف
          </VBtn>
        </div>

        <!-- Multi-select users -->
        <VCol cols="12" class="mb-3">
          <VSelect
            v-model="selectedNewUsers"
            :items="users"
            item-title="fullName"
            item-value="personnel_code"
            label="افزودن کاربر جدید"
            multiple
            chips
            clearable
            variant="outlined"
          />
        </VCol>

        <!-- Users table -->
        <div v-if="localUsers?.length">
          <VTable density="comfortable">
            <thead>
              <tr>
                <th />
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>وضعیت</th>
                <th>هدیه</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, index) in localUsers" :key="u.id">
                <td>
                  <VCheckbox
                    v-model="selectedUsers"
                    :value="u.id"
                    hide-details
                  />
                </td>
                <td>{{ index + 1 }}</td>
                <td>{{ u.user?.fullName }}</td>
                <td>{{ u.user?.username }}</td>
                <td>
                  <VChip
                    :color="u.status ? 'success' : 'error'"
                    :label="false"
                    size="small"
                  >
                    {{ u.status ? 'فعال' : 'غیرفعال' }}
                  </VChip>
                </td>
                <td>
                  {{
                    u.gift ? `${u.gift.name} - ${u.gift.code}` : 'انتخاب نکرده'
                  }}
                </td>
                <td class="text-center">
                  <VIcon
                    icon="tabler-power"
                    :color="u.status ? 'red' : 'green'"
                    size="24"
                    style="cursor: pointer"
                    @click="toggleUserStatus(u)"
                  />
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <div v-else class="text-center text-medium-emphasis mt-3">
          هیچ کاربری یافت نشد.
        </div>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn
          color="primary"
          text
          @click="emit('update:isDialogVisible', false)"
        >
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
