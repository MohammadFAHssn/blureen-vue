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
    = ORG_POSITION_COLORS[d.data.orgPositionId] || 'rgb(var(--v-theme-on-primary))'

  return `
    <div style="
      font-family: Shabnam, Tahoma, sans-serif;
      width: ${d.width}px;
      height: ${d.height}px;
      background-color: rgb(var(--v-theme-surface));
      border-radius: 6px;
      box-shadow: 0 4px 14px rgba(var(--v-shadow-key-umbra-color), var(--v-shadow-sm-opacity));
      overflow: hidden;
      direction: rtl;
      border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    ">
      <!-- OrgPosition (top) -->
      <div style="
        background-color: ${orgPositionColor};
        color: #fff;
        padding: 8px 12px;
        font-size: 0.875rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.375rem;
        height: 35px;
      ">
        ${d.data.orgPositionName}
      </div>
      
      <!-- OrgUnit (middle) -->
      <div style="
        background-color: rgb(var(--v-theme-primary));
        color: rgb(var(--v-theme-on-primary));
        padding: 8px 12px;
        font-size: 0.875rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.375rem;
        height: 55px;
      ">
        ${d.data.orgUnitName}
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
        <div style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: thin solid rgb(var(--v-theme-primary));
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.75rem;
          background-color: rgb(var(--v-theme-surface));
          color: rgb(var(--v-theme-primary));
          font-weight: 500;
          font-family: Shabnam, Tahoma, sans-serif;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 4px rgba(var(--v-shadow-key-umbra-color), var(--v-shadow-xs-opacity));
          white-space: nowrap;
          width: fit-content;
          height: fit-content;
        ">
          ${node.children ? '▲' : '▼'} ${node.data._directSubordinates || ''}
        </div>
      `
    })
    .render()
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
}
</style>
