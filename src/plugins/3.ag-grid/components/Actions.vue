<template>
  <div class="d-flex gap-1">
    <IconBtn v-if="params.value.editable" @click="params.onEditClick(params.data.id)">
      <VIcon icon="tabler-edit" />
    </IconBtn>
    <IconBtn v-if="params.value.deletable" @click="params.onDeleteClick(params.data.id)">
      <VIcon icon="tabler-trash" />
    </IconBtn>
  </div>
</template>
