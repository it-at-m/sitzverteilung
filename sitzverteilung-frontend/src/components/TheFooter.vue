<template>
  <v-footer
    class="flex-column ga-1 py-4"
    color="surface-light"
  >
    <v-btn
      text="Impressum und Datenschutz"
      variant="text"
      to="/impress"
    />

    <v-divider
      class="my-2"
      thickness="2"
      width="50"
    />

    <div>
      {{ new Date().getFullYear() }} —
      <strong>Landeshauptstadt München - it@M</strong>
    </div>
  </v-footer>
</template>
