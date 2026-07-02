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
