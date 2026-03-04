import nextConfig from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

const config = [
  ...nextConfig,
  prettier,
  {
    ignores: [
      ".clerk/**",
      ".next/**",
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "convex/_generated/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
