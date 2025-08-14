/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Futuristic theme colors
const primaryColor = '#00E5FF'; // Bright cyan for primary actions
const accentColor = '#7B42F6';  // Purple for accents
const successColor = '#00F5B4'; // Neon green for success states
const warningColor = '#FF9E00'; // Orange for warnings
const errorColor = '#FF3D71';   // Bright red for errors

// Gradient colors for backgrounds
const gradientDark = ['#0A0E17', '#1A1F35', '#252B48']; // Dark blue-black gradient
const gradientLight = ['#F5F7FA', '#E4E7EB', '#CBD2D9']; // Light gradient

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F7FA',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    gradient: gradientLight,
    card: '#FFFFFF',
    cardBorder: '#E4E7EB',
    buttonBackground: primaryColor,
    buttonText: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0A0E17',
    tint: primaryColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    gradient: gradientDark,
    card: '#1A1F35',
    cardBorder: '#252B48',
    buttonBackground: primaryColor,
    buttonText: '#0A0E17',
  },
};
