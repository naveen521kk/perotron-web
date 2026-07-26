interface ImportMetaEnv {
    readonly PUBLIC_POSTHOG_PROJECT_TOKEN: string
    readonly PUBLIC_POSTHOG_HOST: string
    readonly POSTHOG_PROJECT_ID: string
    readonly POSTHOG_API_KEY: string
    readonly POSTHOG_HOST: string
    readonly PUBLIC_E2E_TEST: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
