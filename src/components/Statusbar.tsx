import {StatusBar} from 'react-native';
import {COLORS} from '../assets';

const Statusbar = (props: any) => {
  return <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.white} />;
};

export default Statusbar;
