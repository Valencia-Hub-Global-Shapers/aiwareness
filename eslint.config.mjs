import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // One-time mount effects reading localStorage/sessionStorage to
      // hydrate client state can't avoid setState-in-effect; downgrade
      // instead of restructuring working initialization code.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
