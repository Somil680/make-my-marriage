import { clientEnv } from "@/config/env.client";

export const appConfig = {
  name: "Make My Marriage",
  url: clientEnv.NEXT_PUBLIC_APP_URL,
} as const;
