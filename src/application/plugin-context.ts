import type SRPlugin from "src/main";

let plugin: SRPlugin;

export function setPluginContext(p: SRPlugin) {
    plugin = p;
}

export function getPluginContext(): SRPlugin {
    return plugin;
}
