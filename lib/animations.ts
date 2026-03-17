import { Variants } from "framer-motion";

// Standard animation durations
export const DURATIONS = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
};

// Standard easing curves (cubic bezier format for Framer Motion)
export const EASINGS = {
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.slow, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeIn },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.slow, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeIn },
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

// Slide animations
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item (for use inside staggerContainer)
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

// Card hover animation
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  tap: { scale: 0.98 },
};

// Button tap animation
export const buttonTap = {
  tap: { scale: 0.95 },
};

// Page transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.slow, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeIn },
  },
};

// Modal/dialog animation
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
  exit: { opacity: 0, transition: { duration: DURATIONS.fast } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

// List item animation (for filtering/sorting lists)
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};
