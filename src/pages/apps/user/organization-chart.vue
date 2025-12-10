<script setup>
import * as d3 from 'd3'
import { OrgChart } from 'd3-org-chart'
import { useTheme } from 'vuetify'

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
})

const orgChartNodes = ref([])
const orgChartRef = ref(null)
const orgChartInstance = ref(null)
const orgPositions = ref([])

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
          orgPositionId: orgChartNode.org_position.id,
          orgPositionName: orgChartNode.org_position.name,
          orgUnitName: orgChartNode.org_unit.name,
          users: orgChartNode.users, // {id, personnel_code, first_name, last_name, avatar_url}
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

function getNodeContent(d) {
  const orgPositionColor
    = ORG_POSITION_COLORS[d.data.orgPositionId]
      || 'rgb(var(--v-theme-on-primary))'

  return `
    <div class="org-chart-node" style="width: ${d.width}px; height: ${d.height}px;">
      <!-- Node Card -->
      <div class="org-chart-card">
        <!-- Action Buttons -->
        <div class="org-chart-action-bar">
          <button 
            class="node-action-btn" 
            data-action="edit" 
            data-node-id="${d.data.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <button 
            class="node-action-btn" 
            data-action="add" 
            data-node-id="${d.data.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </button>
          <button 
            class="node-action-btn" 
            data-action="delete" 
            data-node-id="${d.data.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
        <!-- OrgPosition (top) -->
        <div class="org-position" style="background-color: ${orgPositionColor};">
          ${d.data.orgPositionName}
        </div>
        <!-- OrgUnit (middle) -->
        <div class="org-unit">
          ${d.data.orgUnitName}
        </div>
      </div>
    </div>
  `
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
        .attr('stroke', 'rgb(var(--v-theme-primary))')
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
        handleEditNode(nodeId)
        break
      case 'add':
        handleAddNode(nodeId)
        break
      case 'delete':
        handleDeleteNode(nodeId)
        break
    }
  })
}

function handleEditNode(nodeId) {
  console.log('Edit node:', nodeId)
}

function handleAddNode(nodeId) {
  console.log('Add child to node:', nodeId)
}

function handleDeleteNode(nodeId) {
  console.log('Delete node:', nodeId)
}

fetchOrgChartNodes()
await fetchOrgPositions()

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
</template>

<style lang="scss" scoped>
.org-chart-container {
  overflow: hidden !important;

  :deep(.org-chart-card) {
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    block-size: 100%;
  }

  :deep(.org-chart-action-bar) {
    position: absolute;
    z-index: 10;
    display: flex;
    border: thin solid rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-primary));
    border-radius: 20px;
    background-color: rgb(var(--v-theme-surface));
    inset-block-start: -14px;
    inset-inline-end: -14px;
  }

  :deep(.node-action-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    block-size: 26px;
    cursor: pointer;
    inline-size: 26px;

    &:hover {
      /* stylelint-disable */
      background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
      /* stylelint-enable */
    }

    &[data-action='edit']:hover {
      color: rgb(var(--v-theme-warning));
    }

    &[data-action='add']:hover {
      color: rgb(var(--v-theme-success));
    }

    &[data-action='delete']:hover {
      color: rgb(var(--v-theme-error));
    }
  }

  :deep(.org-position) {
    border-start-start-radius: 6px;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    padding-block: 8px;
    text-align: center;
  }

  :deep(.org-unit) {
    background-color: rgb(var(--v-theme-primary));
    block-size: 55px;
    border-end-end-radius: 6px;
    border-end-start-radius: 6px;
    color: rgb(var(--v-theme-on-primary));
    font-size: 0.875rem;
    font-weight: 500;
    padding-block: 8px;
    text-align: center;
  }

  :deep(.org-expand-btn) {
    border: thin solid rgb(var(--v-theme-primary));
    border-radius: 6px;
    background-color: rgb(var(--v-theme-surface));
    block-size: fit-content;
    color: rgb(var(--v-theme-primary));
    font-weight: 500;
    padding-block: 4px;
    padding-inline: 8px;
    white-space: nowrap;
  }
}
</style>
