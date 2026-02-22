import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';

enableScreens(false);

import App from './App';

registerRootComponent(App);