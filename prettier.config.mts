import type { Config } from 'prettier'

const prettierConfig = {
  semi: false,
  singleQuote: true,
} as const satisfies Config

export default prettierConfig
