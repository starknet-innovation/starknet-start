# @starknetfoundation/starknet-start-vue

Vue composables and plugin to connect Starknet wallets using the same primitives as `@starknetfoundation/starknet-start-react`.

```ts
import { createApp } from "vue";
import { mainnet } from "@starknetfoundation/starknet-start-chains";
import { publicProvider } from "@starknetfoundation/starknet-start-providers";
import { createStarknetVue } from "@starknetfoundation/starknet-start-vue";

const app = createApp(App);

const starknet = createStarknetVue({
  chains: [mainnet],
  provider: publicProvider(),
});

app.use(starknet);
app.mount("#app");
```

## Migration notes

`useNetwork`, `useProvider`, and `useConnect` return computed refs for values that change after connect or chain switch. In `<script setup>`, use `.value` when reading them outside templates:

```ts
const { chain } = useNetwork();
const { provider } = useProvider();

watch(
  () => chain.value.id,
  (chainId) => {
    /* ... */
  },
);
```

In templates, refs auto-unwrap (`{{ chain.name }}` works as before).
