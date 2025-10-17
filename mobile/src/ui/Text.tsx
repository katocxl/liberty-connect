import type { PropsWithChildren } from 'react';
import { Text as RNText, TextProps } from 'react-native';

export const Text = ({ children, ...rest }: PropsWithChildren<TextProps>): JSX.Element => (
  <RNText {...rest}>{children}</RNText>
);
