// ===================================================
// RegisterScreen.js - Clean registration
// ===================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
  ScrollView, Alert,
} from 'react-native';
import { saveUser, setToken } from '../services/storageService';
import { generateId } from '../utils/helpers';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirmPassword) e.confirm = 'Passwords don\'t match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const user = { id: generateId(), name: name.trim(), email: email.toLowerCase().trim(), password };
        await saveUser(user);
        await setToken('token-' + user.id);
        setIsLoading(false);
        navigation.replace('MainTabs');
      } catch (e) {
        setIsLoading(false);
        Alert.alert('Error', 'Registration failed.');
      }
    }, 1000);
  };

  const renderField = (label, placeholder, value, onChange, key, opts = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, errors[key] && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#6E7681"
        value={value}
        onChangeText={(t) => { onChange(t); setErrors((p) => ({ ...p, [key]: undefined })); }}
        autoCapitalize={opts.autoCapitalize || 'none'}
        keyboardType={opts.keyboardType || 'default'}
        secureTextEntry={opts.secure && !showPassword}
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>Smart ToDo</Text>
            <Text style={styles.brandText}>by ADVXM</Text>
            <Text style={styles.subtitleText}>Create your account to get started.</Text>
          </View>

          {renderField('FULL NAME', 'John Doe', name, setName, 'name', { autoCapitalize: 'words' })}
          {renderField('EMAIL', 'you@example.com', email, setEmail, 'email', { keyboardType: 'email-address' })}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min 6 characters"
                placeholderTextColor="#6E7681"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((p) => ({ ...p, password: undefined })); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {renderField('CONFIRM PASSWORD', '••••••••', confirmPassword, setConfirmPassword, 'confirm', { secure: true })}

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  formContainer: { backgroundColor: '#141419', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: '#1E1E2A' },
  headerContainer: { marginBottom: 28, alignItems: 'center' },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 1, marginBottom: 4 },
  brandText: { fontSize: 12, color: '#6C5CE7', fontWeight: '600', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  subtitleText: { fontSize: 14, color: '#6E7681' },
  inputGroup: { marginBottom: 16 },
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
  registerBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    marginTop: 8, marginBottom: 20,
  },
  registerBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginPrompt: { color: '#6E7681', fontSize: 14 },
  loginLink: { color: '#6C5CE7', fontSize: 14, fontWeight: '600' },
});
