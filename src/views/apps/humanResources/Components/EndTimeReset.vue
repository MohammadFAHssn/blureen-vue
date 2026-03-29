<script setup></script>

<template>
  <div class="d-flex align-center ga-2">
<!--    <VBtn size="x-small" variant="flat" color="success" title="بروزرسانی زمان">
      <VIcon
        icon="tabler-refresh"
        @click="params.onUpdateTimeClick('end', params.node.data.currentItem)"
      />
    </VBtn>-->
    <span>{{ params.node.data.currentItem.end_time }}</span>
  </div>
</template>
