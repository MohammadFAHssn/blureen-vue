<script setup>
import OrgChart from '@balkangraph/orgchart.js'

definePage({
  meta: {
    action: 'read',
    subject: 'Organization-Chart',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const orgChartNodes = ref([])
const orgChartRef = ref(null)

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
}

function drawOrgChart(orgChartRef, orgChartNodes) {
  designOrgChart()

  const orgChartObj = new OrgChart(orgChartRef, {
    nodes: orgChartNodes,
    nodeBinding: {
      field_0: 'orgUnit',
      field_1: 'orgPosition',
    },
  })
}

await fetchOrgChartNodes()

onMounted(() => {
  drawOrgChart(orgChartRef.value, orgChartNodes.value)
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

  <div ref="orgChartRef" />
</template>

<style lang="scss" scoped></style>
