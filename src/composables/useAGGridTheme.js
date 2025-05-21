import { useTheme } from "vuetify"

import {
  colorSchemeDarkBlue,
  colorSchemeLight,
  themeQuartz,
} from "ag-grid-community"

export const useAGGridTheme = () => {
  const { global } = useTheme()

  const persianThemeQuartz = themeQuartz.withParams({
    fontFamily: "Shabnam",
  })

  const customTheme = computed(() =>
    global.name.value === "light"
      ? persianThemeQuartz.withPart(colorSchemeLight)
      : persianThemeQuartz.withPart(colorSchemeDarkBlue),
  )

  return { customTheme }
}
