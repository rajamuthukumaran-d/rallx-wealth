export const Theme = {
  secondary: {
    50: '#f9e4ff',
    100: '#e5b3ff',
    200: '#d282fd',
    300: '#c051fb',
    400: '#ad21f9',
    500: '#950bdf',
    600: '#7406ae',
    700: '#53037d',
    800: '#32014c',
    900: '#13001d',
  },
  primary: {
    50: '#fee9fb',
    100: '#edc6e7',
    200: '#dda2d4',
    300: '#ce7dc2',
    400: '#bf59af',
    500: '#a64096',
    600: '#823175',
    700: '#5e2255',
    800: '#3a1333',
    900: '#180415',
  },
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: Theme.primary[800],
    background: 'rgb(0,0,0)',
    card: 'rgb(18, 18, 18)',
    text: Theme.primary[400],
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
};

export const LightTheme = {
  dark: false,
  colors: {
    primary: Theme.primary[700],
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: Theme.primary[600],
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
};
