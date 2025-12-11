import { ORG_POSITION_COLORS } from '@/utils/constants'

export function getNodeContent(d) {
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
