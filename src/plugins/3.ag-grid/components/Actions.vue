<template>
  <div class="d-flex gap-1">
    <IconBtn v-if="params.value.editable" @click="params.onEditClick(params.node)">
      <VIcon icon="tabler-edit" />
    </IconBtn>
    <IconBtn v-if="params.value.deletable" @click="params.onDeleteClick(params.node)">
      <VIcon icon="tabler-trash" />
    </IconBtn>
  </div>
</template>
