<template>
  <div class="d-flex gap-1">
    <IconBtn v-if="params.value.editable" @click="params.onEditClick">
      <VIcon icon="tabler-edit" />
    </IconBtn>
    <IconBtn v-if="params.value.deletable" @click="params.onDeleteClick">
      <VIcon icon="tabler-trash" />
    </IconBtn>
  </div>
</template>
