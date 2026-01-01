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

// Drag and Drop state
const dragEnabled = ref(false)
const dragNode = ref(null)
const dropNode = ref(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const isDragStarting = ref(false)

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
      orgPositions.value = data.sort((a, b) => a.level - b.level)
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
    .nodeEnter(function () {
      d3.select(this).call(
        d3
          .drag()
          .filter(function () {
            return dragEnabled.value && this.classList.contains('draggable')
          })
          .on('start', function (event, node) {
            onDragStart(this, event, node)
          })
          .on('drag', function (event) {
            onDrag(this, event)
          })
          .on('end', function (event) {
            onDragEnd(this, event)
          }),
      )
    })
    .nodeUpdate(function (d) {
      // Root node is not draggable
      if (!d.parent) {
        d3.select(this).classed('draggable', false)
      }
      else {
        d3.select(this).classed('draggable', true)
      }
      // All nodes are droppable except the dragging node itself
      d3.select(this).classed('droppable', true)
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
    id: `${Date.now()}-${Math.random()}`,
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

// Drag and Drop handlers
function onDragStart(element, event, node) {
  dragNode.value = node
  const width = event.subject.width
  const half = width / 2
  const x = event.x - half
  dragStartX.value = x
  dragStartY.value = Number.parseFloat(event.y)
  isDragStarting.value = true

  d3.select(element).classed('dragging', true)
}

function onDrag(element, event) {
  if (!dragNode.value) return

  const state = orgChartInstance.value.getChartState()
  const g = d3.select(element)

  if (isDragStarting.value) {
    isDragStarting.value = false
    orgChartRef.value.classList.add('dragging-active')
    g.raise()

    const descendants = event.subject.descendants()
    const linksToRemove = [...(descendants || []), event.subject]
    const nodesToRemove = descendants.filter(x => x.data.id !== event.subject.data.id)

    state.linksWrapper
      .selectAll('path.link')
      .data(linksToRemove, d => state.nodeId(d))
      .remove()

    if (nodesToRemove) {
      state.nodesWrapper
        .selectAll('g.node')
        .data(nodesToRemove, d => state.nodeId(d))
        .remove()
    }
  }

  dropNode.value = null
  const cP = {
    width: event.subject.width,
    height: event.subject.height,
    left: event.x,
    right: event.x + event.subject.width,
    top: event.y,
    bottom: event.y + event.subject.height,
    midX: event.x + event.subject.width / 2,
    midY: event.y + event.subject.height / 2,
  }

  const allNodes = d3.selectAll('g.node:not(.dragging)')
  allNodes.select('rect').attr('fill', 'none')

  allNodes
    .filter(function (d2) {
      const cPInner = {
        left: d2.x,
        right: d2.x + d2.width,
        top: d2.y,
        bottom: d2.y + d2.height,
      }

      if (
        cP.midX > cPInner.left
        && cP.midX < cPInner.right
        && cP.midY > cPInner.top
        && cP.midY < cPInner.bottom
        && this.classList.contains('droppable')
      ) {
        dropNode.value = d2
        return d2
      }
    })
    .select('rect')
    .attr('fill', 'rgba(var(--v-theme-success), 0.2)')

  dragStartX.value += Number.parseFloat(event.dx)
  dragStartY.value += Number.parseFloat(event.dy)
  g.attr('transform', `translate(${dragStartX.value},${dragStartY.value})`)
}

function onDragEnd(element, event) {
  orgChartRef.value?.classList.remove('dragging-active')

  if (!dragNode.value) return

  d3.select(element).classed('dragging', false)

  if (!dropNode.value) {
    orgChartInstance.value.render()
    return
  }

  if (event.subject.parent?.data.id === dropNode.value.data.id) {
    orgChartInstance.value.render()
    return
  }

  // Prevent dropping a node onto itself or its descendants
  const descendants = event.subject.descendants()
  if (descendants.some(d => d.data.id === dropNode.value.data.id)) {
    orgChartInstance.value.render()
    return
  }

  d3.select(element).remove()

  const data = orgChartInstance.value.getChartState().data
  const node = data?.find(x => String(x.id) === String(event.subject.data.id))
  node.parentId = dropNode.value.data.id

  dropNode.value = null
  dragNode.value = null
  orgChartInstance.value.render()
}

function filterChart(searchQuery) {
  searchQuery = toComparisonKey(searchQuery)

  if (!orgChartInstance.value) return

  // Clear previous highlighting
  orgChartInstance.value.clearHighlighting()

  // Get chart data
  const data = orgChartInstance.value.data()

  // If search value is empty, render and fit and return
  if (searchQuery === '') {
    orgChartInstance.value.data(data).render().fit()
    return
  }

  // Find matching nodes
  const matchingNodes = data.filter(d =>
    toComparisonKey(d.orgUnit.name).includes(searchQuery),
  )

  // Mark matching nodes as highlighted and expand their ancestors
  matchingNodes.forEach((matchingNode) => {
    matchingNode._highlighted = true
    matchingNode._expanded = true

    // Expand all ancestors of this node
    let currentNode = matchingNode
    while (currentNode.parentId) {
      const parent = data.find(d => String(d.id) === String(currentNode.parentId))
      if (parent) {
        parent._expanded = true
        currentNode = parent
      }
      else {
        break
      }
    }
  })

  // Update data and rerender graph
  orgChartInstance.value.data(data).render()

  if (matchingNodes.length !== 0) {
    orgChartInstance.value.setCentered(matchingNodes[0].id).render()
  }
}

function enableDrag() {
  dragEnabled.value = true
  orgChartRef.value?.classList.add('drag-enabled')
}

function disableDrag() {
  dragEnabled.value = false
  orgChartRef.value?.classList.remove('drag-enabled')
}

async function reload() {
  fetchOrgChartNodes()
  await fetchOrgUnits()

  await nextTick()
  drawOrgChart()
}

function toComparisonKey(str) {
  return (str || '').toString().replace(/[\s\u200C]+/g, '')
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

  <div class="d-flex flex-column justify-space-between">
    <!-- Drag and Drop Controls -->
    <div class="org-chart-controls d-flex gap-4">
      <VTextField
        placeholder="جستجو بر اساس واحد..."
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 300px;"
        @update:model-value="filterChart"
      />

      <VBtn
        v-if="!dragEnabled"
        color="secondary"
        variant="tonal"
        @click="enableDrag"
      >
        <VIcon start icon="tabler-arrows-move" />
        سازماندهی
      </VBtn>

      <VBtn
        v-else
        color="success"
        variant="tonal"
        @click="disableDrag"
      >
        <VIcon start icon="tabler-check" />
        تایید
      </VBtn>
    </div>

    <div ref="orgChartRef" class="org-chart-container" />

    <IconBtn
      size="x-large"
      variant="elevated"
      color="primary"
      :loading="pendingState.updateOrganizationChart"
      @click="updateOrganizationChart"
    >
      <VIcon icon="tabler-device-floppy" size="35" />
    </IconBtn>
  </div>

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
</template>

<style lang="scss" scoped src="./organization-chart.scss"></style>
