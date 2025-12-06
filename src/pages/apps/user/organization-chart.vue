<script setup>
import OrgChart from '@balkangraph/orgchart.js'
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
      designOrgChart()
      orgChartInstance.value.draw()
    }
  },
  { deep: true },
)

async function fetchOrgChartNodes() {
  try {
    const { data, error } = await useApi(createUrl('/base/org-chart-node'))

    if (error.value) throw error.value

    orgChartNodes.value = data.value.data.map((orgChartNode) => {
      return {
        id: orgChartNode.id,
        pid: orgChartNode.parent_id,
        orgPositionName: orgChartNode.org_position.name,
        orgUnitName: orgChartNode.org_unit.name,
        users: orgChartNode.users, // {id, personnel_code, first_name, last_name, avatar_url}
        tags: [`position-id-${orgChartNode.org_position.id}`],
      }
    })
  }
  catch (e) {
    console.error('Error fetching org chart nodes:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت چارت سازمانی'
  }
}

async function fetchOrgPositions() {
  try {
    const { data, error } = await useApi(createUrl('/base/org-position'))

    if (error.value) throw error.value

    orgPositions.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching org positions:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت سمت‌های سازمانی'
  }
}

function designOrgChart() {
  const vuetifyColors = vuetifyTheme.current.value.colors

  // Create custom Vuetify-style template
  OrgChart.templates.vuetify = Object.assign({}, OrgChart.templates.ana)

  // Node size - card-like dimensions
  OrgChart.templates.vuetify.size = [220, 136]

  // Field 0 - orgPosition (top rectangle)
  OrgChart.templates.vuetify.field_0 = `
    <text data-width="200" style="font-size: 13px; font-weight: 500; font-family: Shabnam, Tahoma, sans-serif;" fill="${vuetifyColors['on-primary']}" x="110" y="24" text-anchor="middle">{val}</text>
  `

  // Field 1 - orgUnit (middle rectangle)
  OrgChart.templates.vuetify.field_1 = `
    <text data-width="200" style="font-size: 13px; font-weight: 500; font-family: Shabnam, Tahoma, sans-serif;" fill="${vuetifyColors['on-primary']}" x="110" y="60" text-anchor="middle">{val}</text>
  `

  // Link style
  OrgChart.templates.vuetify.link = `
    <path stroke-linejoin="round" stroke="${vuetifyColors.primary}" stroke-opacity="0.5" stroke-width="2px" fill="none" d="{rounded}" />
  `

  // Plus/Expand button
  OrgChart.templates.vuetify.plus = `
    <circle cx="15" cy="15" r="15" fill="${vuetifyColors.surface}" stroke="${vuetifyColors.primary}" stroke-width="2"></circle>
    <line x1="8" y1="15" x2="22" y2="15" stroke-width="2" stroke="${vuetifyColors.primary}"></line>
    <line x1="15" y1="8" x2="15" y2="22" stroke-width="2" stroke="${vuetifyColors.primary}"></line>
  `

  // Minus/Collapse button
  OrgChart.templates.vuetify.minus = `
    <circle cx="15" cy="15" r="15" fill="${vuetifyColors.surface}" stroke="${vuetifyColors.primary}" stroke-width="2"></circle>
    <line x1="8" y1="15" x2="22" y2="15" stroke-width="2" stroke="${vuetifyColors.primary}"></line>
  `

  // Ripple effect color
  OrgChart.templates.vuetify.ripple = {
    radius: 0,
    color: vuetifyColors.primary,
    rect: null,
  }

  // Edit form header color
  OrgChart.templates.vuetify.editFormHeaderColor = vuetifyColors.primary

  // Main node - Vuetify card style with elevation shadow
  designOrgChartNodes()
}

function designOrgChartNodes() {
  const vuetifyColors = vuetifyTheme.current.value.colors

  orgPositions.value.forEach((position) => {
    OrgChart.templates[`position-id-${position.id}`] = Object.assign({}, OrgChart.templates.vuetify)

    OrgChart.templates[`position-id-${position.id}`].node = `
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
      </filter>
    </defs>

    <!-- Main card background with rounded corners -->
    <rect x="0" y="0" height="{h}" width="{w}" fill="${vuetifyColors.surface}" rx="8" ry="8" filter="url(#shadow)"></rect>
    
    <!-- OrgPosition (top) - rounded top corners only -->
    <rect x="0" y="0" height="36" width="{w}" fill="${ORG_POSITION_COLORS[position.id]}" rx="8" ry="8"></rect>
    <rect x="0" y="28" height="8" width="{w}" fill="${ORG_POSITION_COLORS[position.id]}"></rect>
    
    <!-- OrgUnit (middle) - no rounded corners -->
    <rect x="0" y="36" height="36" width="{w}" fill="${vuetifyColors.primary}"></rect>
  `
  })
}

function drawOrgChart(orgChartRef, orgChartNodes) {
  designOrgChart()

  const tags = {}

  orgPositions.value.forEach((position) => {
    tags[`position-id-${position.id}`] = {
      template: `position-id-${position.id}`,
    }
  })

  orgChartInstance.value = new OrgChart(orgChartRef, {
    template: 'vuetify',
    nodes: orgChartNodes,
    nodeBinding: {
      field_0: 'orgPositionName',
      field_1: 'orgUnitName',
    },
    scaleInitial: OrgChart.match.boundary,
    enableSearch: false,
    tags,
  })
}

fetchOrgChartNodes()
await fetchOrgPositions()

onMounted(async () => {
  await nextTick()
  if (orgChartRef.value && orgChartNodes.value.length > 0) {
    drawOrgChart(orgChartRef.value, orgChartNodes.value)
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

  <div ref="orgChartRef" class="org-chart-container" />
</template>

<style lang="scss" scoped>
.org-chart-container {
  background-color: rgb(var(--v-theme-background));
  block-size: 100%;
  inline-size: 100%;
}
</style>
