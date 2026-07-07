import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { defaultConnector } from "./devnet";

afterEach(() => {
  cleanup();
  // The default connector is a module-level singleton shared across every test
  // in a file. Reset it after each case so mutated options, chain, or
  // connection state do not leak into the next test.
  defaultConnector.reset();
});
