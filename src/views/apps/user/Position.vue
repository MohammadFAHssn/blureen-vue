<script setup>
const props = defineProps({
  costCenters: {
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
    <VCardTitle>
      <span class="ml-3">
        سمت‌های
      </span>
      <v-chip v-for="costCenter in props.costCenters" :key="costCenter.rayvarz_id" variant="outlined" color="info" class="ml-3 mb-3">
        {{ costCenter.name }}
      </v-chip>
    </VCardTitle>

    <VCardText class="d-flex align-center pa-5">
      !
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

<style>
.v-card-title {
  white-space: normal;
}
</style>
