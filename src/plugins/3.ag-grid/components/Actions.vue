<script setup>
const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})

const pendingState = reactive({
  save: false,
  activityChange: false,
})

const isPending = computed(
  () => pendingState.save || pendingState.activityChange,
)

function onActivityChange(event) {
  pendingState.activityChange = true
  props.params.onActivityChange(props.params.node, event)
}

function onSaveClick() {
  pendingState.save = true

  props.params.onSaveClick(props.params.node)
}

function onCancelClick() {
  props.params.node.setDataValue('actions', {
    ...props.params.node.data.actions,
    editable: {
      ...props.params.node.data.actions.editable,
      mode: 'view',
    },
  })

  props.params.onCancelClick()
}
</script>

<template>
  <div class="d-flex gap-1">
    <IconBtn v-if="params.value.addImage" @click="params.onAddImageClick(params.node)">
      <VIcon icon="tabler-photo-plus" />
    </IconBtn>

    <IconBtn v-if="params.value.status" @click="params.onStatusClick(params.node)">
      <VIcon icon="tabler-power" />
    </IconBtn>

    <div v-if="params.value.editable?.status">
      <IconBtn
        v-if="params.value.editable.mode === 'view'"
        :disabled="isPending"
        @click="params.onEditClick(params.node)"
      >
        <VIcon icon="tabler-edit" />
      </IconBtn>

      <div class="border-thin rounded-xl">
        <IconBtn
          v-if="params.value.editable.mode === 'edit'"
          :disabled="isPending"
          :loading="pendingState.save"
          @click="onSaveClick(params.node)"
        >
          <VIcon icon="tabler-check" />
        </IconBtn>

        <IconBtn
          v-if="params.value.editable.mode === 'edit'"
          :disabled="isPending"
          @click="onCancelClick(params.node)"
        >
          <VIcon icon="tabler-x" />
        </IconBtn>
      </div>
    </div>

    <IconBtn
      v-if="params.value.deletable"
      :disabled="isPending"
      @click="params.onDeleteClick(params.node)"
    >
      <VIcon icon="tabler-trash" />
    </IconBtn>

    <IconBtn v-if="params.value.detailsable" @click="params.onDetailsClick(params.node)">
      <VIcon icon="tabler-file-description" />
    </IconBtn>

    <v-switch
      v-if="params.value.activable"
      :model-value="Boolean(params.data.active)"
      :disabled="isPending"
      :loading="pendingState.activityChange"
      @input="onActivityChange($event)"
    />
  </div>
</template>
