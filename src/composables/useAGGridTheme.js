import {
  colorSchemeDarkBlue,
  colorSchemeLight,
  themeQuartz,
} from 'ag-grid-community'

import { useTheme } from 'vuetify'

export function useAGGridTheme() {
  const { global } = useTheme()

  const persianThemeQuartz = themeQuartz.withParams({
    fontFamily: 'Shabnam',
  })

  const theme = computed(() =>
    global.name.value === 'light'
      ? persianThemeQuartz.withPart(colorSchemeLight)
      : persianThemeQuartz.withPart(colorSchemeDarkBlue),
  )

  return { theme }
}
