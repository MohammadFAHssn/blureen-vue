<script setup>
import * as d3 from 'd3'
import { OrgChart } from 'd3-org-chart'
import { useTheme } from 'vuetify'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

import AddNodeDialog from '@/views/apps/user/AddNodeDialog.vue'
import EditNodeDialog from '@/views/apps/user/EditNodeDialog.vue'

import { getNodeContent } from './org-chart-utils'

definePage({
  meta: {
    action: 'read',
    subject: 'Organization-Chart',
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isDeleteNodeDialogOpen: false,
  isAddNodeDialogOpen: false,
  isEditNodeDialogOpen: false,
})

const pendingState = reactive({
  updateOrganizationChart: false,
})

const orgChartNodes = ref([])
const orgChartRef = ref(null)
const orgChartInstance = ref(null)
const orgPositions = ref([])
const orgUnits = ref([])
const users = ref([])

const selectedNodeId = ref(null)
const selectedNode = ref(null)

const vuetifyTheme = useTheme()

watch(
  () => vuetifyTheme.current.value.colors,
  async () => {
    if (orgChartInstance.value && orgChartNodes.value.length > 0) {
      orgChartInstance.value.render()
    }
  },
  { deep: true },
)

async function fetchOrgChartNodes() {
  await axiosInstance
    .get('/base/org-chart-node')
    .then(({ data: { data } }) => {
      orgChartNodes.value = data.map((orgChartNode) => {
        return {
          id: orgChartNode.id,
          parentId: orgChartNode.parent_id,
          orgPosition: orgChartNode.org_position,
          orgUnit: orgChartNode.org_unit,
          users: orgChartNode.users,
        }
      })
    })
    .catch((error) => {
      console.error('Error fetching org chart nodes:', error)
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در دریافت چارت سازمانی'
    })
}

async function fetchOrgPositions() {
  await axiosInstance
    .get('/base/org-position')
    .then(({ data: { data } }) => {
      orgPositions.value = data
    })
    .catch((error) => {
      console.error('Error fetching org positions:', error)
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در دریافت سمت‌های سازمانی'
    })
}

async function fetchOrgUnits() {
  await axiosInstance
    .get('/base/org-unit')
    .then(({ data: { data } }) => {
      orgUnits.value = data
    })
    .catch((error) => {
      console.error('Error fetching org units:', error)
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در دریافت واحدهای سازمانی'
    })
}

async function fetchUsers() {
  await axiosInstance
    .get('/base/user/details',
    )
    .then(({ data: { data } }) => {
      users.value = data
    })
    .catch((error) => {
      console.error('Error fetching users:', error)
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در دریافت کاربران'
    })
}

async function updateOrganizationChart() {
  pendingState.updateOrganizationChart = true

  const chartState = orgChartInstance.value.getChartState()
  orgChartNodes.value = chartState.allNodes.map(node => node.data)

  await axiosInstance
    .put('/base/org-chart-node/update', {
      orgChartNodes: orgChartNodes.value,
    })
    .then(() => {
      reload()
    })
    .catch((error) => {
      console.error('Error updating organization chart:', error)
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در بروزرسانی چارت سازمانی'
    })
    .finally(() => {
      pendingState.updateOrganizationChart = false
    })
}

function drawOrgChart() {
  if (!orgChartRef.value || orgChartNodes.value.length === 0) return

  orgChartInstance.value = new OrgChart()
    .container(orgChartRef.value)
    .data(orgChartNodes.value)
    .nodeWidth(() => 220)
    // TODO
    .nodeHeight(() => 90)
    .childrenMargin(() => 50)
    .compactMarginBetween(() => 35)
    .compactMarginPair(() => 30)
    .neighbourMargin(() => 20)
    .siblingsMargin(() => 30)
    .nodeContent(d => getNodeContent(d))
    .linkUpdate(function () {
      d3.select(this)
        .attr('stroke', 'rgb(var(--v-theme-secondary))')
        .attr('stroke-opacity', 0.38)
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
    })
    .buttonContent(({ node }) => {
      return `
        <div class="org-expand-btn">
          ${node.children ? '▲' : '▼'} ${node.data._directSubordinates || ''}
        </div>
      `
    })
    .render()

  // Add event listeners for action buttons
  setupNodeActionButtons()
}

function setupNodeActionButtons() {
  if (!orgChartRef.value) return

  orgChartRef.value.addEventListener('click', (event) => {
    const button = event.target.closest('.node-action-btn')
    if (!button) return

    event.stopPropagation()

    const action = button.dataset.action
    const nodeId = button.dataset.nodeId

    switch (action) {
      case 'edit':
        onEditNode(nodeId)
        break
      case 'add':
        onAddNode(nodeId)
        break
      case 'delete':
        onDeleteNode(nodeId)
        break
    }
  })
}

function onEditNode(nodeId) {
  const chartState = orgChartInstance.value.getChartState()
  const node = chartState.allNodes.find(
    node => String(node.data.id) === String(nodeId),
  )
  selectedNode.value = node.data
  uiState.isEditNodeDialogOpen = true
}

function handleEditNode({ id, parentId, orgPosition, orgUnit, users }) {
  orgChartNodes.value = orgChartNodes.value.filter(node => String(node.id) !== String(id))
  orgChartNodes.value.push({ id, parentId, orgPosition, orgUnit, users })
  orgChartInstance.value.data(orgChartNodes.value).render()
}

function onAddNode(nodeId) {
  selectedNodeId.value = nodeId
  uiState.isAddNodeDialogOpen = true
}

function handleAddNode({ orgPosition, orgUnit, users }) {
  orgChartInstance.value.addNode({
    // TODO: Use a better ID generation strategy
    id: Math.floor(Math.random() * (1000000 - 100 + 1)) + 100,
    parentId: selectedNodeId.value,
    orgPosition,
    orgUnit,
    users,
  })
}

function onDeleteNode(nodeId) {
  selectedNodeId.value = nodeId
  uiState.isDeleteNodeDialogOpen = true
}

function handleDeleteNode() {
  orgChartInstance.value.removeNode(selectedNodeId.value)
  uiState.isDeleteNodeDialogOpen = false
}

async function reload() {
  fetchOrgChartNodes()
  await fetchOrgUnits()

  await nextTick()
  drawOrgChart()
}

fetchOrgChartNodes()
fetchOrgPositions()
fetchOrgUnits()
await fetchUsers()

onMounted(async () => {
  await nextTick()
  drawOrgChart()
})
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <div ref="orgChartRef" class="org-chart-container" />

  <AreYouSureDialog
    v-model:is-dialog-visible="uiState.isDeleteNodeDialogOpen"
    title="آیا از حذف این مورد اطمینان دارید؟"
    :loading="false"
    @confirm="handleDeleteNode"
  />

  <AddNodeDialog
    v-model:is-dialog-visible="uiState.isAddNodeDialogOpen"
    :org-positions="orgPositions"
    :org-units="orgUnits"
    :users="users"
    @add="handleAddNode"
  />

  <EditNodeDialog
    v-model:is-dialog-visible="uiState.isEditNodeDialogOpen"
    :org-positions="orgPositions"
    :org-units="orgUnits"
    :users="users"
    :node="selectedNode"
    @edit="handleEditNode"
  />

  <IconBtn
    size="x-large"
    variant="elevated"
    color="primary"
    :loading="pendingState.updateOrganizationChart"
    @click="updateOrganizationChart"
  >
    <VIcon icon="tabler-device-floppy" size="35" />
  </IconBtn>
</template>

<style lang="scss" scoped src="./organization-chart.scss"></style>
