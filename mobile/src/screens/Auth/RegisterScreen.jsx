import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native';
import { authAPI } from '../../api/auth.api';
import { COLORS }  from '../../constants';

export default function RegisterScreen({ navigation }) {
  const [clinicName, setClinicName] = useState('');
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleRegister = async () => {
    if (!clinicName || !name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({ clinicName, name, email, password });
      Alert.alert('Success', 'Clinic registered! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.title}>Register Clinic</Text>
          <Text style={styles.subtitle}>Create your MediCare Plus account</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'CLINIC NAME', value: clinicName, set: setClinicName, placeholder: 'City Health Clinic' },
            { label: 'YOUR NAME',   value: name,       set: setName,       placeholder: 'Dr. Admin' },
            { label: 'EMAIL',       value: email,      set: setEmail,      placeholder: 'admin@clinic.pk', keyboard: 'email-address' },
            { label: 'PASSWORD',    value: password,   set: setPassword,   placeholder: 'Min 6 characters', secure: true },
          ].map(({ label, value, set, placeholder, keyboard, secure }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={set}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={keyboard || 'default'}
                  autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={!!secure}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  content:   { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  header:    { alignItems: 'center', marginBottom: 32 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(13,148,136,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoEmoji: { fontSize: 32 },
  title:     { fontSize: 26, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  subtitle:  { fontSize: 12, color: '#94a3b8', marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' },
  form:      { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, marginBottom: 24 },
  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  inputWrap: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    backgroundColor: COLORS.white, paddingHorizontal: 12, marginBottom: 16,
  },
  input: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.text },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  link:     { alignItems: 'center', marginTop: 16 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
