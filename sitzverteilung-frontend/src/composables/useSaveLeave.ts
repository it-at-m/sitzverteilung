import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

import type { Ref } from "vue";
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

export function useSaveLeave(isDirty: Ref<boolean>) {
    const saveLeaveDialogTitle = ref<string>("Ungespeicherte Änderungen");
    const saveLeaveDialogText = ref<string>(
        "Es sind ungespeicherte Änderungen vorhanden. Wollen Sie die Seite verlassen?"
    );
    const saveLeaveDialog = ref<boolean>(false);
    const isSave = ref(false);

    const nextRoute = ref<NavigationGuardNext | null>(null);

    onBeforeRouteLeave(
        (
            to: RouteLocationNormalized,
            from: RouteLocationNormalized,
            next: NavigationGuardNext
        ) => {
            if (isDirty.value && !isSave.value) {
                saveLeaveDialog.value = true;
                nextRoute.value = next;
            } else {
                saveLeaveDialog.value = false;
                next();
            }
        }
    );

    function cancel(): void {
        saveLeaveDialog.value = false;
        if (nextRoute.value != null) {
            nextRoute.value(false);
        }
    }

    function leave(): void {
        if (nextRoute.value != null) {
            nextRoute.value();
        }
    }

    return {
        saveLeaveDialogTitle,
        saveLeaveDialogText,
        saveLeaveDialog,
        isSave,
        nextRoute,
        cancel,
        leave,
    };
}