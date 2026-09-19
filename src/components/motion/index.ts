/**
 * 动效组件（Motion）
 *
 * 与 `ui/` 里「跟随全局过渡设置」的组件不同，这一组是**独立动效组件**：
 * 各自带参数、各自决定入场时机，不读 `html[data-anim]`。
 *
 * 命名约定：直接说清「它是什么」，不加 Base* / Animated* 这类前缀。
 */
export { default as MaskedHeading } from './masked-heading/MaskedHeading.vue'
export type { MaskedHeadingReveal, MaskedHeadingTrigger } from './masked-heading/MaskedHeading.vue'
export { default as ParticleText } from './particle-text/ParticleText.vue'
export type { ParticleTextTrigger } from './particle-text/ParticleText.vue'
