<script setup>
import * as d3 from 'd3'
import { OrgChart } from 'd3-org-chart'
import { useTheme } from 'vuetify'
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

<style lang="scss" scoped src="./organization-chart.scss"></style>
