import { onMounted, onUnmounted } from "vue";

export function useArrowNavigation() {
  const getFocusableElements = () => {
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    const elements = getFocusableElements();

    if (!elements.length) {
      return;
    }

    const current = document.activeElement as HTMLElement;
    const currentIndex = elements.indexOf(current);

    if (currentIndex === -1) {
      elements[0].focus();
      return;
    }

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < elements.length) {
      event.preventDefault();
      elements[nextIndex].focus();
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}
