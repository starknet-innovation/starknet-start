import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

enableAutoUnmount(afterEach);

afterEach(() => {
  localStorage.clear();
});
