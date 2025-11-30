<script setup>
// تعریف emit
const emit = defineEmits(['back'])

const current = ref('root')

function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}
</script>

<template>
  <div>
    <VBtn
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      {{ current === 'root' ? 'صفحه اصلی' : 'آشپزخانه' }}
    </VBtn>

    <div v-if="current === 'root'">
      <VRow>
        <h2>
          تحویل غذا
        </h2>
      </VRow>
    </div>
  </div>
</template>
