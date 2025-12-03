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
    const { data, error } = await useApi(
      createUrl('/base/org-chart-node'),
    )

    if (error.value) throw error.value

    orgChartNodes.value = data.value.data.map((orgChartNode) => {
      return {
        id: orgChartNode.id,
        pid: orgChartNode.parent_id,
        orgPosition: orgChartNode.org_position.name,
        orgUnit: orgChartNode.org_unit.name,
      }
    })
  }
  catch (e) {
    console.error('Error fetching org chart nodes:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت چارت سازمانی'
  }
}

function designOrgChart() {
  const colors = vuetifyTheme.current.value.colors

  // Create custom Vuetify-style template
  OrgChart.templates.vuetify = Object.assign({}, OrgChart.templates.ana)

  // Node size - card-like dimensions
  OrgChart.templates.vuetify.size = [220, 100]

  // Main node - Vuetify card style with elevation shadow
  OrgChart.templates.vuetify.node = `
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect x="0" y="0" height="{h}" width="{w}" fill="${colors.surface}" stroke="${colors.primary}" stroke-width="0" rx="8" ry="8" filter="url(#shadow)"></rect>
    <rect x="0" y="0" height="36" width="{w}" fill="${colors.primary}" rx="8" ry="8"></rect>
    <rect x="0" y="20" height="16" width="{w}" fill="${colors.primary}"></rect>
  `

  // Field 0 - Unit name (in primary header)
  OrgChart.templates.vuetify.field_0 = `
    <text data-width="200" style="font-size: 13px; font-weight: 500; font-family: Shabnam, Tahoma, sans-serif;" fill="${colors['on-primary']}" x="110" y="24" text-anchor="middle">{val}</text>
  `

  // Field 1 - Position name (in card body)
  OrgChart.templates.vuetify.field_1 = `
    <text data-width="200" style="font-size: 14px; font-weight: 400; font-family: Shabnam, Tahoma, sans-serif;" fill="${colors['on-surface']}" x="110" y="70" text-anchor="middle">{val}</text>
  `

  // Link style
  OrgChart.templates.vuetify.link = `
    <path stroke-linejoin="round" stroke="${colors.primary}" stroke-opacity="0.5" stroke-width="2px" fill="none" d="{rounded}" />
  `

  // Plus/Expand button
  OrgChart.templates.vuetify.plus = `
    <circle cx="15" cy="15" r="15" fill="${colors.surface}" stroke="${colors.primary}" stroke-width="2"></circle>
    <line x1="8" y1="15" x2="22" y2="15" stroke-width="2" stroke="${colors.primary}"></line>
    <line x1="15" y1="8" x2="15" y2="22" stroke-width="2" stroke="${colors.primary}"></line>
  `

  // Minus/Collapse button
  OrgChart.templates.vuetify.minus = `
    <circle cx="15" cy="15" r="15" fill="${colors.surface}" stroke="${colors.primary}" stroke-width="2"></circle>
    <line x1="8" y1="15" x2="22" y2="15" stroke-width="2" stroke="${colors.primary}"></line>
  `

  // Ripple effect color
  OrgChart.templates.vuetify.ripple = {
    radius: 50,
    color: colors.primary,
    rect: null,
  }

  // Edit form header color
  OrgChart.templates.vuetify.editFormHeaderColor = colors.primary
}

function drawOrgChart(orgChartRef, orgChartNodes) {
  designOrgChart()

  orgChartInstance.value = new OrgChart(orgChartRef, {
    template: 'vuetify',
    nodes: orgChartNodes,
    nodeBinding: {
      field_0: 'orgPosition',
      field_1: 'orgUnit',
    },
    scaleInitial: OrgChart.match.boundary,
    enableSearch: false,
  })
}

await fetchOrgChartNodes()

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

  <div
    ref="orgChartRef"
    class="org-chart-container"
  />
</template>

<style lang="scss" scoped>
.org-chart-container {
  background-color: rgb(var(--v-theme-background));
  block-size: 100%;
  inline-size: 100%;
}
</style>
