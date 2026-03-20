declare module '*.mp4' {
    const src: string;
    export default src;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
    readonly [key: string]: string | boolean | undefined;
}
