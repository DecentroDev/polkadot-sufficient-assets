<template>
  <!-- Reference the dialog component with ref -->
  <psa-dialog
    v-if="dialogWidgetLoaded"
    :config.prop="libConfig"
    :theme.prop="appTheme"
    :open.prop="open"
    :handleClose.prop="closeDialog"
  />
  <button @click="openDialog">Open Dialog</button>

  <div
    style="
      max-width: 450px;
      margin: 0 auto;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    "
  >
    <div style="width: 100%">
      <psa-form
        v-if="formWidgetLoaded"
        :config.prop="libConfig"
        :theme.prop="appTheme"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { loadDialogWidget, loadFormWidget } from "polkadot-sufficient-assets";
import { defineComponent, onMounted, ref } from "vue";
import { libConfig, libTheme } from "./lib/lib-config";

export default defineComponent({
  name: "App",
  setup() {
    // Define TypeScript types for the refs
    const formWidgetLoaded = ref(false); // Track if the form widget is loaded
    const dialogWidgetLoaded = ref(false); // Track if the form widget is loaded

    const appConfig = ref(libConfig);
    const appTheme = ref(libTheme);

    const open = ref(false);

    // Lifecycle hook: onMounted is similar to Angular's ngAfterViewInit
    onMounted(async () => {
      await loadFormWidget().then(() => {
        formWidgetLoaded.value = true;
      });

      await loadDialogWidget().then(() => {
        dialogWidgetLoaded.value = true;
      });
    });

    const openDialog = () => {
      open.value = true;
    };
    const closeDialog = () => {
      open.value = false;
    };

    return {
      libConfig,
      appConfig,
      appTheme,
      formWidgetLoaded,
      dialogWidgetLoaded,
      openDialog,
      closeDialog,
      open,
    };
  },
});
</script>
