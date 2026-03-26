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
  deleteOrgChartNode: false,
  organizeOrgChart: false,
  reloadChart: false,
})

const orgChartNodes = ref([])
const orgChartRef = ref(null)
const orgChartInstance = ref(null)
const orgPositions = ref([])
const orgUnits = ref([])
const users = ref([])
const requestTypes = ref([])

const selectedNodeId = ref(null)
const selectedNode = ref(null)

// Drag and Drop state
const dragEnabled = ref(false)
const dragNode = ref(null)
const dropNode = ref(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const isDragStarting = ref(false)

// Expand level control
const expandLevel = ref(1)
const maxDepth = ref(0)

// Event listener reference for cleanup
let nodeActionClickHandler = null

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
    .get('/base/org-chart-node/by-role')
    .then(({ data: { data } }) => {
      orgChartNodes.value = data.map((orgChartNode) => {
        // Group deputy_users by user id, collecting their deputy_types
        const deputiesMap = new Map()

        for (const deputyUser of orgChartNode.deputy_users || []) {
          if (!deputiesMap.has(deputyUser.id)) {
            deputiesMap.set(deputyUser.id, { ...deputyUser, deputyTypes: [] })
          }
          if (deputyUser.pivot?.deputy_type) {
            deputiesMap.get(deputyUser.id).deputyTypes.push(deputyUser.pivot.deputy_type)
          }
        }

        return {
          id: orgChartNode.id,
          parentId: orgChartNode.parent_id,
          orgPosition: orgChartNode.org_position,
          orgUnit: orgChartNode.org_unit,
          users: orgChartNode.users,
          deputies: [...deputiesMap.values()],
          liaison: orgChartNode.org_unit.liaisons[0],
        }
      })
    })
    .catch((error) => {
      console.error('Error fetching org chart nodes:', error)
      uiState.hasError = true
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در دریافت چارت سازمانی'
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
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در دریافت سمت‌های سازمانی'
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
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در دریافت واحدهای سازمانی'
    })
}

async function fetchUsers() {
  await axiosInstance
    .get('/base/user/details')
    .then(({ data: { data } }) => {
      users.value = data
    })
    .catch((error) => {
      console.error('Error fetching users:', error)
      uiState.hasError = true
      uiState.errorMessage = error.response?.data?.message || 'خطا در دریافت کاربران'
    })
}

function drawOrgChart() {
  if (!orgChartRef.value || orgChartNodes.value.length === 0) return

  orgChartRef.value.innerHTML = ''

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

  calculateMaxDepth()
}

function calculateMaxDepth() {
  if (!orgChartInstance.value) return

  const chartState = orgChartInstance.value.getChartState()

  maxDepth.value = Math.max(...chartState.allNodes.map(node => node.depth))
}

function setupNodeActionButtons() {
  if (!orgChartRef.value) return

  // Remove previous event listener if exists
  if (nodeActionClickHandler) {
    orgChartRef.value.removeEventListener('click', nodeActionClickHandler)
  }

  nodeActionClickHandler = (event) => {
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
  }

  orgChartRef.value.addEventListener('click', nodeActionClickHandler)
}

function onEditNode(nodeId) {
  const chartState = orgChartInstance.value.getChartState()
  const node = chartState.allNodes.find(
    node => String(node.data.id) === String(nodeId),
  )
  selectedNode.value = node.data
  uiState.isEditNodeDialogOpen = true
}

async function handleEditNode({ id, parentId, orgPosition, orgUnit, users, deputies, liaison }) {
  const nodeIndex = orgChartNodes.value.findIndex(
    node => String(node.id) === String(id),
  )

  if (nodeIndex !== -1) {
    orgChartNodes.value[nodeIndex] = { id, parentId, orgPosition, orgUnit, users, deputies, liaison }
  }

  // Reload and center on the edited node
  pendingState.reloadChart = true
  try {
    await reloadAndCenter(id)
  }
  finally {
    pendingState.reloadChart = false
    uiState.isEditNodeDialogOpen = false
  }
}

function onAddNode(nodeId) {
  selectedNodeId.value = nodeId
  uiState.isAddNodeDialogOpen = true
}

async function handleAddNode({ id, orgPosition, orgUnit, users, deputies, liaison }) {
  orgChartNodes.value.push({
    id,
    parentId: selectedNodeId.value,
    orgPosition,
    orgUnit,
    users,
    deputies,
    liaison,
  })

  // Reload and center on the new node
  pendingState.reloadChart = true
  try {
    await reloadAndCenter(id)
  }
  finally {
    pendingState.reloadChart = false
    uiState.isAddNodeDialogOpen = false
  }
}

function onDeleteNode(nodeId) {
  selectedNodeId.value = nodeId
  uiState.isDeleteNodeDialogOpen = true
}

async function handleDeleteNode() {
  pendingState.deleteOrgChartNode = true

  const nodeToDelete = orgChartNodes.value.find(
    node => String(node.id) === String(selectedNodeId.value),
  )
  const parentIdToCenter = nodeToDelete?.parentId

  await axiosInstance
    .delete('/base/org-chart-node', { params: {
      id: selectedNodeId.value,
    } })
    .then(() => {
      uiState.isDeleteNodeDialogOpen = false

      orgChartNodes.value = orgChartNodes.value.filter(
        node => String(node.id) !== String(selectedNodeId.value),
      )

      reloadAndCenter(parentIdToCenter)
    })
    .catch((error) => {
      console.error('Error deleting organization chart node:', error)
      uiState.hasError = true
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در حذف گره چارت سازمانی'
    })
    .finally(() => {
      pendingState.deleteOrgChartNode = false
    })
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
    const nodesToRemove = descendants.filter(
      x => x.data.id !== event.subject.data.id,
    )

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

        return true
      }

      return false
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
  const matchingNodes = data.filter(
    d =>
      toComparisonKey(d.orgUnit.name).includes(searchQuery)
      || d.users.some(
        user => toComparisonKey(user.personnel_code) === searchQuery,
      ),
  )

  // Mark matching nodes as highlighted and expand their ancestors
  matchingNodes.forEach((matchingNode) => {
    matchingNode._highlighted = true
    matchingNode._expanded = true

    // Expand all ancestors of this node
    let currentNode = matchingNode
    while (currentNode.parentId) {
      const parent = data.find(
        d => String(d.id) === String(currentNode.parentId),
      )
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

async function onOrganize() {
  pendingState.organizeOrgChart = true

  const chartState = orgChartInstance.value.getChartState()
  orgChartNodes.value = chartState.allNodes.map(node => node.data)

  await axiosInstance
    .put('/base/org-chart-node/organize', {
      orgChartNodes: orgChartNodes.value,
    })
    .then(() => {
      dragEnabled.value = false
      orgChartRef.value?.classList.remove('drag-enabled')

      reload()
    })
    .catch((error) => {
      console.error('Error updating organization chart:', error)
      uiState.hasError = true
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در بروزرسانی چارت سازمانی'
    })
    .finally(() => {
      pendingState.organizeOrgChart = false
    })
}

function updateExpandLevel(level) {
  if (!orgChartInstance.value) return

  const data = orgChartInstance.value.data()
  const root = orgChartInstance.value.getChartState().generateRoot(data)
  const allNodes = root.descendants()

  // Update _expanded property based on depth
  allNodes.forEach((node) => {
    node.data._expanded = node.depth <= level
  })

  orgChartInstance.value.data(data).render().fit()
}

async function reloadAndCenter(centerNodeId = null) {
  // Save expanded state before reload
  const chartState = orgChartInstance.value?.getChartState()
  if (!chartState?.allNodes) return

  const expandedNodesMap = {}
  chartState.allNodes.forEach((node) => {
    expandedNodesMap[node.data.id] = node.data._expanded
  })

  // Fetch fresh data from server
  await fetchOrgChartNodes()
  await fetchOrgUnits()

  // Restore expanded state to the new data
  orgChartNodes.value.forEach((node) => {
    if (expandedNodesMap[node.id] !== undefined) {
      node._expanded = expandedNodesMap[node.id]
    }
  })

  // Ensure the path to centered node is expanded
  if (centerNodeId) {
    expandPathToNode(centerNodeId)
  }

  await nextTick()
  drawOrgChart()

  // Center on the specified node with animation
  await nextTick()
  if (centerNodeId && orgChartInstance.value) {
    // Use setTimeout to ensure the chart is fully rendered
    setTimeout(() => {
      orgChartInstance.value.setCentered(centerNodeId).render()
    }, 100)
  }
}

function expandPathToNode(nodeId) {
  const nodeMap = new Map(orgChartNodes.value.map(n => [String(n.id), n]))
  let currentNode = nodeMap.get(String(nodeId))

  while (currentNode) {
    currentNode._expanded = true
    if (currentNode.parentId) {
      currentNode = nodeMap.get(String(currentNode.parentId))
    }
    else {
      break
    }
  }
}

async function reload() {
  // Save current state before reload
  const chartState = orgChartInstance.value?.getChartState()
  const savedTransform = chartState?.lastTransform

  if (!chartState?.allNodes) return

  // Save expanded state of each node
  const expandedNodesMap = {}
  chartState.allNodes.forEach((node) => {
    expandedNodesMap[node.data.id] = node.data._expanded
  })

  await fetchOrgChartNodes()
  await fetchOrgUnits()

  // Restore expanded state to the new data
  orgChartNodes.value.forEach((node) => {
    if (expandedNodesMap[node.id] !== undefined) {
      node._expanded = expandedNodesMap[node.id]
    }
  })

  await nextTick()
  drawOrgChart()

  // Restore transform after reload
  await nextTick()
  if (savedTransform && orgChartInstance.value) {
    const { svg, zoomBehavior } = orgChartInstance.value.getChartState()
    const transform = d3.zoomIdentity
      .translate(savedTransform.x, savedTransform.y)
      .scale(savedTransform.k)

    svg.call(zoomBehavior.transform, transform)
  }
}

function toComparisonKey(str) {
  return (str || '').toString().replace(/[\s\u200C]+/g, '')
}

async function fetchRequestTypes() {
  await axiosInstance
    .get('/base/request-type')
    .then(({ data: { data } }) => {
      requestTypes.value = data
    })
    .catch((error) => {
      console.error('Error fetching request types:', error)
    })
}

await Promise.all([
  fetchOrgChartNodes(),
  fetchOrgPositions(),
  fetchOrgUnits(),
  fetchUsers(),
  fetchRequestTypes(),
])

onMounted(() => {
  drawOrgChart()
})

onUnmounted(() => {
  // Cleanup event listener
  if (orgChartRef.value && nodeActionClickHandler) {
    orgChartRef.value.removeEventListener('click', nodeActionClickHandler)
    nodeActionClickHandler = null
  }

  // Cleanup chart instance
  if (orgChartInstance.value) {
    orgChartInstance.value = null
  }
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
    <!-- Org Chart Controls -->
    <div class="org-chart-controls d-flex justify-space-between flex-wrap">
      <VTextField
        placeholder="جستجو بر اساس واحد یا کد پرسنلی ..."
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 300px;"
        @update:model-value="filterChart"
      />

      <!-- Expand Level Slider -->
      <div style="inline-size: 350px;">
        <VSlider
          v-model="expandLevel"
          :min="0"
          :max="maxDepth"
          :step="1"
          :thumb-label="false"
          color="primary"
          @update:model-value="updateExpandLevel"
        >
          <template #prepend>
            <VTooltip location="top">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon="tabler-fold"
                  size="small"
                  variant="text"
                  color="secondary"
                  :disabled="expandLevel <= 0"
                  @click="expandLevel = 0; updateExpandLevel(0)"
                />
              </template>
              <span>بستن همه</span>
            </VTooltip>
          </template>
          <template #append>
            <VTooltip location="top">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon="tabler-fold-down"
                  size="small"
                  variant="text"
                  color="secondary"
                  :disabled="expandLevel >= maxDepth"
                  @click="expandLevel = maxDepth; updateExpandLevel(maxDepth)"
                />
              </template>
              <span>باز کردن همه</span>
            </VTooltip>
          </template>
        </VSlider>
      </div>

      <VBtn
        v-if="!dragEnabled"
        color="secondary"
        variant="tonal"
        @click="enableDrag"
      >
        <VIcon start icon="tabler-arrows-move" />
        سازماندهی
      </VBtn>

      <VBtn v-else color="success" variant="tonal" :loading="pendingState.organizeOrgChart" @click="onOrganize">
        <VIcon start icon="tabler-check" />
        تایید
      </VBtn>
    </div>

    <div ref="orgChartRef" class="org-chart-container" />
  </div>

  <AreYouSureDialog
    v-model:is-dialog-visible="uiState.isDeleteNodeDialogOpen"
    title="آیا از حذف این مورد اطمینان دارید؟"
    :loading="pendingState.deleteOrgChartNode"
    @confirm="handleDeleteNode"
  />

  <AddNodeDialog
    v-model:is-dialog-visible="uiState.isAddNodeDialogOpen"
    :selected-node-id="selectedNodeId"
    :org-positions="orgPositions"
    :org-units="orgUnits"
    :users="users"
    :request-types="requestTypes"
    :reloading="pendingState.reloadChart"
    @add="handleAddNode"
  />

  <EditNodeDialog
    v-model:is-dialog-visible="uiState.isEditNodeDialogOpen"
    :org-positions="orgPositions"
    :org-units="orgUnits"
    :users="users"
    :request-types="requestTypes"
    :node="selectedNode"
    :reloading="pendingState.reloadChart"
    @edit="handleEditNode"
  />
</template>

<style lang="scss" scoped src="./organization-chart.scss"></style>
