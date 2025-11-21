<template>
  <div
    class="markdown"
    v-html="htmlContent"
  />
</template>

<script setup lang="ts">
import { Marked } from "marked";
import { computed, ref, watch } from "vue";

const marked = new Marked({
  breaks: true,
});

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

<style>
.markdown > p {
  margin-bottom: 10px;
}

.markdown > h1,
.markdown > h2,
.markdown > h3,
.markdown > h4,
.markdown > h5,
.markdown > h6 {
  margin-bottom: 15px;
}

.markdown > ul {
  margin-left: 20px;
  margin-bottom: 15px;
}
</style>
