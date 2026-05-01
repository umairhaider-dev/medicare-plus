import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VARIANTS = {
  green:  { bg: '#dcfce7', text: '#15803d' },
  amber:  { bg: '#fef3c7', text: '#92400e' },
  red:    { bg: '#fee2e2', text: '#991b1b' },
  blue:   { bg: '#dbeafe', text: '#1d4ed8' },
  purple: { bg: '#ede9fe', text: '#6d28d9' },
  teal:   { bg: '#ccfbf1', text: '#0f766e' },
  pink:   { bg: '#fce7f3', text: '#be185d' },
  gray:   { bg: '#f1f5f9', text: '#475569' },
};

export const Badge = ({ label, variant = 'teal', style }) => {
  const v = VARIANTS[variant] || VARIANTS.teal;
  return (
    <View style={[
      styles.badge,
      { backgroundColor: v.bg },
      style
    ]}>
      <Text style={[styles.text, { color: v.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical:    3,
    borderRadius:      20,
    alignSelf:         'flex-start',
  },
  text: {
    fontSize:     11,
    fontWeight:   '700',
    letterSpacing:0.2,
  },
});