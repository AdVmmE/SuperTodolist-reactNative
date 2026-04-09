// ===================================================
// LoginScreen.js - Clean modern login
// ===================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { getUser, setToken } from '../services/storageService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    let valid = true;
    setEmailError(''); setPasswordError(''); setLoginError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email.'); valid = false; }
    if (password.length < 6) { setPasswordError('Min 6 characters.'); valid = false; }
    if (!valid) return;

    setIsLoading(true);
    setTimeout(async () => {
      try {
        const storedUser = await getUser();
        if (storedUser && storedUser.email === email.toLowerCase().trim() && storedUser.password === password) {
          await setToken('token-' + storedUser.id);
          setIsLoading(false);
          navigation.replace('MainTabs');
        } else if (email.toLowerCase() === 'test@gmail.com' && password === '123456') {
          await setToken('dummy-token');
          setIsLoading(false);
          navigation.replace('MainTabs');
        } else {
          setIsLoading(false);
          setLoginError('Incorrect email or password.');
        }
      } catch (e) {
        setIsLoading(false);
        setLoginError('Login failed.');
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>Smart ToDo</Text>
          <Text style={styles.brandText}>by ADVXM</Text>
          <Text style={styles.subtitleText}>Welcome back. Sign in to continue.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor="#6E7681"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(t) => { setEmail(t); setEmailError(''); setLoginError(''); }}
            value={email}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#6E7681"
              secureTextEntry={!showPassword}
              onChangeText={(t) => { setPassword(t); setPasswordError(''); setLoginError(''); }}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {loginError ? <Text style={styles.mainError}>{loginError}</Text> : null}

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.demoHint}>
          <Text style={styles.demoText}>Demo: test@gmail.com / 123456</Text>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>No account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Create one</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', paddingHorizontal: 24 },
  formContainer: {
    backgroundColor: '#141419', borderRadius: 20, padding: 30,
    borderWidth: 1, borderColor: '#1E1E2A',
  },
  headerContainer: { marginBottom: 32, alignItems: 'center' },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  brandText: { fontSize: 12, color: '#6C5CE7', fontWeight: '600', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  subtitleText: { fontSize: 14, color: '#6E7681' },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#6E7681', letterSpacing: 1.5, marginBottom: 6 },
  input: {
    backgroundColor: '#1C1C26', color: '#E6EDF3', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    borderWidth: 1, borderColor: '#2A2A3A',
  },
  inputError: { borderColor: '#FF6B6B' },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C26',
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2A3A',
  },
  passwordInput: { flex: 1, color: '#E6EDF3', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  toggleBtn: { paddingHorizontal: 14 },
  toggleText: { color: '#6C5CE7', fontWeight: '600', fontSize: 13 },
  errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
  mainError: { color: '#FF6B6B', fontSize: 14, textAlign: 'center', marginBottom: 14, fontWeight: '500' },
  loginBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  demoHint: { alignItems: 'center', marginBottom: 18 },
  demoText: { color: '#3D3D50', fontSize: 11 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { color: '#6E7681', fontSize: 14 },
  signupLink: { color: '#6C5CE7', fontSize: 14, fontWeight: '600' },
});
