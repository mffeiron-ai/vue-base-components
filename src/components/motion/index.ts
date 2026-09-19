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
export { default as SplitFlapText } from './split-flap-text/SplitFlapText.vue'
export { default as StrokeText } from './stroke-text/StrokeText.vue'
export type { StrokeTextFillMode, StrokeTextTrigger } from './stroke-text/StrokeText.vue'
export { default as FoldText } from './fold-text/FoldText.vue'
export type { FoldTextHinge, FoldTextSplitBy, FoldTextTrigger } from './fold-text/FoldText.vue'
export { default as EchoText } from './echo-text/EchoText.vue'
export type { EchoTextDirection, EchoTextEase, EchoTextMode } from './echo-text/EchoText.vue'
export { default as SplitText } from './split-text/SplitText.vue'
export type { SplitTextTag, SplitTextType, SplitTextVars } from './split-text/SplitText.vue'
export { default as BlurText } from './blur-text/BlurText.vue'
export type {
  BlurTextAnimateBy,
  BlurTextDirection,
  BlurTextEasing,
  BlurTextVars,
} from './blur-text/BlurText.vue'
export { default as TextType } from './text-type/TextType.vue'
export type { TextTypeTag, TextTypeVariableSpeed } from './text-type/TextType.vue'
export { default as Shuffle } from './shuffle/Shuffle.vue'
export type { ShuffleAnimationMode, ShuffleDirection, ShuffleTag } from './shuffle/Shuffle.vue'
export { default as ShinyText } from './shiny-text/ShinyText.vue'
export { default as TextPressure } from './text-pressure/TextPressure.vue'
export type { TextPressurePoint } from './text-pressure/TextPressure.vue'
export { default as FuzzyText } from './fuzzy-text/FuzzyText.vue'
export type { FuzzyTextDirection } from './fuzzy-text/FuzzyText.vue'
export { default as GradientText } from './gradient-text/GradientText.vue'
export type { GradientTextDirection } from './gradient-text/GradientText.vue'
export { default as FallingText } from './falling-text/FallingText.vue'
export type { FallingTextTrigger } from './falling-text/FallingText.vue'
export { default as DecryptedText } from './decrypted-text/DecryptedText.vue'
export type {
  DecryptedTextAnimateOn,
  DecryptedTextClickMode,
  DecryptedTextRevealDirection,
} from './decrypted-text/DecryptedText.vue'
export { default as TrueFocus } from './true-focus/TrueFocus.vue'
export { default as ScrollFloat } from './scroll-float/ScrollFloat.vue'
export { default as ScrollReveal } from './scroll-reveal/ScrollReveal.vue'
export { default as AsciiText } from './ascii-text/AsciiText.vue'
export { AsciiScene, DEFAULT_CHARSET } from './ascii-text/ascii-renderer'
export type { AsciiFrame, AsciiSceneOptions } from './ascii-text/ascii-renderer'
export { default as ScrambledText } from './scrambled-text/ScrambledText.vue'
export { default as RotatingText } from './rotating-text/RotatingText.vue'
export type { RotatingTextStaggerFrom, RotatingTextTarget } from './rotating-text/RotatingText.vue'
export { default as GlitchText } from './glitch-text/GlitchText.vue'
export { default as VariableProximity } from './variable-proximity/VariableProximity.vue'
export type { VariableProximityFalloff } from './variable-proximity/VariableProximity.vue'
export { springDuration, springEasing, springProgress, supportsLinearEasing } from './spring-ease'
export type { SpringOptions } from './spring-ease'
export { resolveEase, resolveEaseFn } from './gsap-ease'
