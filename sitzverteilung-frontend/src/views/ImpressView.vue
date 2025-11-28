<template>
  <v-container>
    <v-row>
      <v-col>
        <markdown-renderer markdown-file-name="impress" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import MarkdownRenderer from "@/components/common/MarkdownRenderer.vue";
</script>
