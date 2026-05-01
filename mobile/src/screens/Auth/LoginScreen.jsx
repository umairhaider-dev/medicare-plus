import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { authAPI }      from '../../api/auth.api';
import { COLORS }       from '../../constants';

export default function LoginScreen({ navigation }) {
  const { login }   = useAuthStore();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user, clinic, doctor } = res.data;
      await login(token, user, clinic, doctor);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your connection.';
      Alert.alert('Login Failed', msg);
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.title}>MediCare Plus</Text>
          <Text style={styles.subtitle}>Clinic & Pharmacy System</Text>
        </View>

        {/* Form Card */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSub}>Sign in to your clinic account</Text>

          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@clinic.pk"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              <Text style={{ fontSize: 16 }}>
                {showPass ? '👁️' : '🔒'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              New clinic? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          MediCare Plus v1.0 — Digital Health System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.navy,
  },
  content: {
    flexGrow:         1,
    justifyContent:   'center',
    paddingHorizontal:24,
    paddingVertical:  40,
  },
  header: {
    alignItems:   'center',
    marginBottom: 36,
  },
  logoWrap: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(13,148,136,0.2)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
  },
  logoEmoji:   { fontSize: 36 },
  title: {
    fontSize:     28,
    fontWeight:   '800',
    color:        COLORS.white,
    letterSpacing:-0.5,
  },
  subtitle: {
    fontSize:      13,
    color:         '#94a3b8',
    marginTop:     4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius:    24,
    padding:         24,
    marginBottom:    24,
  },
  formTitle: {
    fontSize:     22,
    fontWeight:   '800',
    color:        COLORS.navy,
    marginBottom: 4,
    letterSpacing:-0.3,
  },
  formSub: {
    fontSize:     14,
    color:        COLORS.muted,
    marginBottom: 24,
  },
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
    marginBottom:     16,
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
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    12,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       8,
  },
  loginBtnText: {
    color:        '#fff',
    fontSize:     16,
    fontWeight:   '700',
    letterSpacing:0.3,
  },
  registerLink: {
    alignItems: 'center',
    marginTop:  16,
  },
  registerLinkText: {
    fontSize:  14,
    color:     COLORS.muted,
  },
  footer: {
    textAlign: 'center',
    color:     '#475569',
    fontSize:  12,
  },
});