import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

export const Empty = ({
  icon       = '📭',
  title      = 'Nothing here',
  message    = '',
  action     = null,
  actionLabel= 'Add New'
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {message
      ? <Text style={styles.message}>{message}</Text>
      : null
    }
    {action && (
      <TouchableOpacity
        style={styles.btn}
        onPress={action}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical:60,
    paddingHorizontal:24,
  },
  icon:    { fontSize: 52, marginBottom: 16 },
  title: {
    fontSize:   18,
    fontWeight: '700',
    color:      COLORS.text,
    marginBottom:8,
  },
  message: {
    fontSize:   14,
    color:      COLORS.muted,
    textAlign:  'center',
    lineHeight: 22,
  },
  btn: {
    marginTop:        16,
    backgroundColor:  COLORS.primary,
    paddingVertical:  10,
    paddingHorizontal:20,
    borderRadius:     10,
  },
  btnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   14,
  },
});