import { AG_GRID_LOCALE_IR as AG_GRID_LOCALE_IR_BASE } from '@ag-grid-community/locale'
import { AgGridVue as CoreAgGridVue } from 'ag-grid-vue3'
import { defineComponent, h } from 'vue'

const AG_GRID_LOCALE_IR = {
  ...AG_GRID_LOCALE_IR_BASE,
  january: 'فروردین',
  february: 'اردیبهشت',
  march: 'خرداد',
  april: 'تیر',
  may: 'مرداد',
  june: 'شهریور',
  july: 'مهر',
  august: 'آبان',
  september: 'آذر',
  october: 'دی',
  november: 'بهمن',
  december: 'اسفند',
}

// اگر در فایل‌های دیگر خواستید استفاده کنید
export { AG_GRID_LOCALE_IR }

export default function (app) {
  app.component(
    'AgGridVue',
    defineComponent({
      name: 'AgGridVue',
      inheritAttrs: false,
      props: {
        ...CoreAgGridVue.props,
        noGlobalMenuItem: { type: Boolean, default: false },
        noGlobalContextMenu: { type: Boolean, default: false },
        noGlobalDefaultColDef: { type: Boolean, default: false },
        noGlobalCellRenderers: { type: Boolean, default: false },
        noGlobalLocale: { type: Boolean, default: false },
        globalDefaultColDef: {
          type: Object,
          default: () => ({
            filter: true,
            sortable: true,
            resizable: true,
            flex: 1,
          }),
        },
      },
      setup(props, { attrs, slots }) {
        function buildMergedGetMainMenuItems(userProvidedFn) {
          return (params) => {
            let baseItems = userProvidedFn
              ? userProvidedFn(params)
              : params.defaultItems

            if (!Array.isArray(baseItems))
              baseItems = params.defaultItems || []

            if (props.noGlobalMenuItem)
              return baseItems

            const already = baseItems.some(
              i => typeof i === 'object' && i?.id === 'reset-filters-main-menu-item',
            )
            if (already)
              return baseItems

            const resetFilters = {
              id: 'reset-filters-main-menu-item',
              name: 'پاک کردن فیلترها',
              icon: '<i class="tabler tabler-filter-off" style="font-size:16px;"></i>',
              action: () => {
                window.dispatchEvent(
                  new CustomEvent('ag-grid:global-column-menu', {
                    detail: params,
                  }),
                )
                try {
                  params.api.setFilterModel(null)
                }
                catch {
                  // silent
                }
              },
            }

            return [resetFilters, 'separator', ...baseItems]
            // return [...baseItems]
          }
        }

        function buildMergedGetContextMenuItems(userProvidedFn) {
          return (params) => {
            let baseItems = userProvidedFn
              ? userProvidedFn(params)
              : params.defaultItems

            if (!Array.isArray(baseItems))
              baseItems = params.defaultItems || []

            if (props.noGlobalContextMenu)
              return baseItems

            const exists = baseItems.some(
              i => typeof i === 'object' && i?.id === 'global-row-info',
            )
            if (exists)
              return baseItems

            // const extra = {
            //   id: 'global-row-info',
            //   name: 'اطلاعات سطر',
            //   icon: '<i class="tabler tabler-info-circle" style="font-size:16px;line-height:1"></i>',
            //   action: () => {
            //     try {
            //       window.dispatchEvent(
            //         new CustomEvent('ag-grid:context-row-info', {
            //           detail: {
            //             data: params.node?.data,
            //             column: params.column,
            //           },
            //         }),
            //       )
            //       console.debug('[AG Grid] Row info:', params.node?.data)
            //     }
            //     catch {
            //       /* silent */
            //     }
            //   },
            // }

            // return [extra, ...baseItems]
            return [...baseItems]
          }
        }

        let globalCellRenderers = {}
        if (!props.noGlobalCellRenderers) {
          const modules = import.meta.glob('..//3.ag-grid//components//*.vue', {
            eager: true,
          })
          for (const path in modules) {
            const mod = modules[path]
            const name = path
              .split('/')
              .pop()
              .replace(/\.vue$/, '')
            if (mod?.default)
              globalCellRenderers[name] = mod.default
          }
        }

        return () => {
          const {
            getMainMenuItems,
            getContextMenuItems,
            noGlobalMenuItem,
            noGlobalContextMenu,
            noGlobalDefaultColDef,
            noGlobalCellRenderers,
            globalDefaultColDef,
            defaultColDef,
            components,
            localeText,
            ...passThroughProps
          } = props

          const merged = buildMergedGetMainMenuItems(getMainMenuItems)
          const mergedContext
            = buildMergedGetContextMenuItems(getContextMenuItems)

          const mergedDefaultColDef = noGlobalDefaultColDef
            ? defaultColDef
            : { ...(globalDefaultColDef || {}), ...(defaultColDef || {}) }

          if (noGlobalCellRenderers)
            globalCellRenderers = {}

          const mergedComponents = {
            ...globalCellRenderers,
            ...(components || {}),
          }

          return h(
            CoreAgGridVue,
            {
              ...attrs,
              ...passThroughProps,
              getMainMenuItems: merged,
              getContextMenuItems: mergedContext,
              defaultColDef: mergedDefaultColDef,
              components: mergedComponents,
              localeText: props.noGlobalLocale
                ? localeText || passThroughProps.localeText
                : localeText
                  || passThroughProps.localeText
                  || AG_GRID_LOCALE_IR,
            },
            slots,
          )
        }
      },
    }),
  )
}
