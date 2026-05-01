import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, View
} from 'react-native';
import { COLORS } from '../../constants';

export const Button = ({
  title,
  onPress,
  loading  = false,
  disabled = false,
  variant  = 'primary',
  size     = 'md',
  style,
  textStyle
}) => {
  const variants = {
    primary: { bg: COLORS.primary, text: '#fff' },
    outline: { bg: 'transparent',  text: COLORS.primary },
    danger:  { bg: COLORS.red,     text: '#fff' },
    ghost:   { bg: COLORS.primaryLight, text: COLORS.primary },
    navy:    { bg: COLORS.navy,    text: '#fff' },
  };

  const sizes = {
    sm: { py: 8,  px: 14, fontSize: 13 },
    md: { py: 13, px: 20, fontSize: 15 },
    lg: { py: 16, px: 24, fontSize: 16 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size]       || sizes.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor:   v.bg,
          paddingVertical:   s.py,
          paddingHorizontal: s.px,
          opacity: (disabled || loading) ? 0.6 : 1,
          borderWidth:  variant === 'outline' ? 1 : 0,
          borderColor:  variant === 'outline' ? COLORS.primary : 'transparent',
        },
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { color: v.text, fontSize: s.fontSize },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight:    '700',
    letterSpacing:  0.2,
  },
});