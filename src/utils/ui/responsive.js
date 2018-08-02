const XXS_BREAKPOINT_MAX = 440;

const isXXS = () => window.innerWidth < XXS_BREAKPOINT_MAX;

export {
  isXXS
}