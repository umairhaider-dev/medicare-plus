import React, { useState } from 'react';
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { COLORS } from '../../constants';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType    = 'default',
  multiline       = false,
  numberOfLines   = 1,
  error,
  required        = false,
  editable        = true,
  style,
}) => {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required
            ? <Text style={{ color: COLORS.red }}> *</Text>
            : null
          }
        </Text>
      )}
      <View style={[
        styles.inputWrap,
        focused   && styles.focused,
        !!error   && styles.errorBorder,
        !editable && styles.disabled,
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          style={[
            styles.input,
            multiline && {
              height:           numberOfLines * 40,
              textAlignVertical:'top',
            },
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            style={styles.eyeBtn}
          >
            <Text style={{ fontSize: 16 }}>
              {showPass ? '👁️' : '🔒'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error
        ? <Text style={styles.errorText}>{error}</Text>
        : null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:    { marginBottom: 14 },
  label: {
    fontSize:      11,
    fontWeight:    '700',
    color:         COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  6,
  },
  inputWrap: {
    flexDirection:    'row',
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      COLORS.border,
    borderRadius:     10,
    backgroundColor:  COLORS.white,
    paddingHorizontal:12,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.red,
  },
  disabled: {
    backgroundColor: COLORS.bg,
    opacity:         0.7,
  },
  input: {
    flex:           1,
    paddingVertical:11,
    fontSize:       14,
    color:          COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 6,
    paddingVertical:   8,
  },
  errorText: {
    fontSize:  12,
    color:     COLORS.red,
    marginTop: 4,
  },
});