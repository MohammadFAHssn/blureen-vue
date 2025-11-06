<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible'])

function dialogVisibleUpdate(val) {
  emit('update:isDialogVisible', val)
}

const injectedUsers = inject('users', ref([]))

const userItems = computed(() =>
  (injectedUsers?.value || [])
    .filter(user => user.active)
    .map(user => ({
      title: `${user.first_name} ${user.last_name} (${user.personnel_code})`,
      value: user.id,
    })),
)
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    width="500"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard>
      <VCardTitle>
        لطفاً کاربر مورد نظر خود را برای این سمت انتخاب کنید
      </VCardTitle>

      <VCardText>
        <v-autocomplete label="کاربر" :items="userItems" />
      </VCardText>
      <VCardActions>
        <VBtn @click="dialogVisibleUpdate(false)">
          تأیید
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
