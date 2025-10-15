<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible'])

const storageBase = import.meta.env.VITE_STORAGE_BASE_URL
const localDialog = ref(props.isDialogVisible)

watch(() => props.isDialogVisible, val => (localDialog.value = val))
watch(localDialog, val => emit('update:isDialogVisible', val))
</script>

<template>
  <VDialog v-model="localDialog" max-width="480">
    <VCard class="pa-4">
      <VCardTitle class="text-h6 font-weight-medium mb-2">
        جزئیات هدیه تولد
      </VCardTitle>

      <VDivider class="mb-4" />

      <div v-if="props.file" class="space-y-4">
        <VImg
          v-if="props.file.image"
          :src="`${storageBase}/${props.file.image}`"
          aspect-ratio="16/9"
          cover
          class="rounded-lg mb-4"
        />

        <VTable density="compact" class="text-body-2">
          <tbody>
            <tr
              v-for="(value, label) in {
                'نام': props.file?.name || '--',
                'کد': props.file?.code || '--',
                'وضعیت': '',
                'موجودی': props.file?.amount ?? '--',
                'ایجاد شده توسط': props.file?.createdBy?.fullName || '--',
                'آخرین ویرایش توسط': props.file?.editedBy?.fullName || '--',
              }"
              :key="label"
            >
              <td class="font-weight-medium text-no-wrap" style="width: 40%;">
                {{ label }}
              </td>
              <td v-if="label !== 'وضعیت'">
                {{ value }}
              </td>
              <td v-else>
                <VChip
                  :color="props.file?.status ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ props.file?.status ? 'فعال' : 'غیرفعال' }}
                </VChip>
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>

      <VCardActions class="justify-end mt-4">
        <VBtn color="primary" variant="text" @click="localDialog = false">
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
