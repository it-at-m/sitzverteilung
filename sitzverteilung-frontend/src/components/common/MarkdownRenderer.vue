<template>
  <div v-html="htmlContent" />
</template>

<script setup lang="ts">
import { Marked } from "marked";
import markedAlert from "marked-alert";
import { computed, ref, watch } from "vue";

const marked = new Marked({
  breaks: true,
}).use(
  markedAlert({
    className:
      "v-alert v-theme--light v-alert--density-default v-alert--variant-flat v-alert__content",
  })
);

const markdownContent = ref("");
const htmlContent = computed(() => marked.parse(markdownContent.value));

const { markdownFileName } = defineProps<{
  markdownFileName: string;
}>();

const importMarkdown = async (path: string) => {
  const markdownFile = await import(`@/assets/${path}.md?raw`);
  markdownContent.value = markdownFile.default;
};

watch(
  () => markdownFileName,
  (path) => {
    importMarkdown(path);
  },
  { immediate: true }
);
</script>
