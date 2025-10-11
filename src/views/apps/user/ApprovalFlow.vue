<script setup>
const props = defineProps({
  requesters: {
    required: true,
  },

  approvalFlow: {
    type: Array,
    required: true,
  },

  mode: {
    type: String,
    required: true,
  },

  loading: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <VCard class="mb-3" :color="mode === 'edit' ? 'yellow-lighten-4' : ''">
    <VCardTitle class="text-wrap">
      رده تأییدیه‌های
      <v-chip v-for="requester in props.requesters" :key="requester.id" variant="outlined" color="info" class="ml-3 mb-3">
        {{ requester.data?.firstName }} {{ requester.data?.lastName }} {{ requester.groupValue?.name }}
      </v-chip>
    </VCardTitle>

    <VCardText class="d-flex align-center pa-5">
      <div v-for="(approver, index) in props.approvalFlow" :key="index">
        <v-chip color="primary">
          {{ approver.data?.firstName }} {{ approver.data?.lastName }} {{ approver.groupValue?.name }}
        </v-chip>
        <v-chip
          v-if="index !== props.approvalFlow.length - 1"
          variant="text"
          color="primary"
        >
          <v-icon icon="tabler-chevron-left" />
        </v-chip>
      </div>
    </VCardText>

    <VCardActions>
      <VBtn v-if="mode === 'edit'" color="success" :loading="loading" @click="$emit('save')">
        ذخیره
      </VBtn>
      <VBtn v-if="mode === 'edit'" color="error" :disabled="loading" @click="$emit('cancel')">
        بستن
      </VBtn>

      <VBtn v-if="mode === 'view'" color="warning" @click="$emit('edit')">
        ویرایش
      </VBtn>
    </VCardActions>
  </VCard>
</template>
