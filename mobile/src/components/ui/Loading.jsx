import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const Loading = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

export const LoadingOverlay = ({ message = 'Please wait...' }) => (
  <View style={styles.overlay}>
    <View style={styles.box}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.boxText}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  text: {
    fontSize:  14,
    color:     COLORS.muted,
    marginTop: 12,
  },
  overlay: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  box: {
    backgroundColor: COLORS.white,
    borderRadius:    16,
    padding:         28,
    alignItems:      'center',
    minWidth:        160,
  },
  boxText: {
    fontSize:   14,
    color:      COLORS.text,
    fontWeight: '600',
    marginTop:  12,
  },
});