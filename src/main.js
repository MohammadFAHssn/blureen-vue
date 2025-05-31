import App from "@/App.vue"
import { registerPlugins } from "@core/utils/plugins"
import { createApp } from "vue"

// Styles
import "@core/scss/template/index.scss"
import "@styles/styles.scss"

import { ModuleRegistry } from "ag-grid-community"
import { AllEnterpriseModule, LicenseManager } from "ag-grid-enterprise"

ModuleRegistry.registerModules([AllEnterpriseModule])

LicenseManager.setLicenseKey(
  "DownloadDevTools_COM_NDEwMjM0NTgwMDAwMA==59158b5225400879a12a96634544f5b6",
)

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount("#app")
