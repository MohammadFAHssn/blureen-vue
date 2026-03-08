import Fuse from 'fuse.js'
import { computed, ref } from 'vue'

/**
 * Composable for fuzzy searching users with Fuse.js
 * @param {import('vue').Ref<Array>} usersRef - Reactive reference to users array
 */
export function useUserSearch(usersRef) {
  const searchQuery = ref('')

  const fuse = computed(() => {
    const usersWithSearchFields = usersRef.value.map(user => ({
      ...user,
      full_name: normalizeForFuse([user.first_name, user.last_name]),
      work_area_cost_center: normalizeForFuse([
        user.profile?.work_area?.name,
        user.profile?.cost_center?.name,
      ]),
      last_name_work_area_cost_center: normalizeForFuse([
        user.last_name,
        user.profile?.work_area?.name,
        user.profile?.cost_center?.name,
      ]),
    }))

    return new Fuse(usersWithSearchFields, {
      keys: [
        { name: 'personnel_code', weight: 2.0 },
        { name: 'full_name', weight: 1.5 },
        { name: 'work_area_cost_center', weight: 1.5 },
        { name: 'last_name_work_area_cost_center', weight: 1.5 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true,
      includeScore: true,
      findAllMatches: true,
      minMatchCharLength: 1,
    })
  })

  const filteredUsers = computed(() => {
    const query = searchQuery.value?.trim()
    if (!query)
      return usersRef.value

    const results = fuse.value.search(query)

    return results.map(r => r.item)
  })

  function normalizeForFuse(parts) {
    return parts
      .filter(Boolean)
      .join(' ')
      .replace(/[\s\u200C]+/g, '')
  }

  /**
   * Guard backspace to prevent clearing selection when search is empty
   */
  function guardBackspace(e) {
    if (e.key === 'Backspace' && !searchQuery.value) {
      e.stopPropagation()
    }
  }

  function resetSearch() {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    filteredUsers,
    guardBackspace,
    resetSearch,
  }
}
