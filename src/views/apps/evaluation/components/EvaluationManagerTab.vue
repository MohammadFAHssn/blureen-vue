<script setup>
import { mgrQualitativeItems, rankColor } from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  result: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VRow class="ma-1">
    <VCol
      v-if="result.mgr_final_rank"
      cols="12"
      sm="6"
      md="6"
      lg="6"
      xl="3"
      xxl="3"
    >
      <VCard
        flat
        border
      >
        <VCardText>
          <div class="d-flex align-center gap-3">
            <VAvatar
              variant="tonal"
              :color="rankColor(result.mgr_final_rank)"
              size="50"
              rounded
            >
              <VIcon size="30" icon="tabler-chart-bar-popular" />
            </VAvatar>
            <div>
              <span class="text-body-2 text-medium-emphasis">رتبه نهایی مدیر</span>
              <h6 class="text-h6">
                {{ result.mgr_final_rank }}
              </h6>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      v-if="result.mgr_unit_rank"
      cols="12"
      sm="6"
      md="6"
      lg="6"
      xl="3"
      xxl="3"
    >
      <VCard
        flat
        border
      >
        <VCardText>
          <div class="d-flex align-center gap-3">
            <VAvatar
              variant="tonal"
              :color="rankColor(result.mgr_unit_rank)"
              size="50"
              rounded
            >
              <VIcon size="30" icon="tabler-user-star" />
            </VAvatar>
            <div>
              <span class="text-body-2 text-medium-emphasis">وضعیت در واحد</span>
              <h6 class="text-h6">
                {{ result.mgr_unit_rank }}
              </h6>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VRow class="ma-0">
    <VCol class="pa-0">
      <VExpansionPanels class="py-1 px-4">
        <VExpansionPanel title="شاخص‌های ارزیابی مدیر">
          <VExpansionPanelText>
            <VTable density="comfortable">
              <thead>
                <tr>
                  <th>شاخص</th>
                  <th>نتیجه</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in mgrQualitativeItems"
                  :key="item.key"
                >
                  <td>{{ item.label }}</td>
                  <td>
                    <VChip
                      v-if="result[item.key]"
                      :color="rankColor(result[item.key])"
                      variant="tonal"
                      size="small"
                      label
                    >
                      {{ result[item.key] }}
                    </VChip>
                    <span
                      v-else
                      class="text-medium-emphasis"
                    >-</span>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCol>
  </VRow>
</template>
