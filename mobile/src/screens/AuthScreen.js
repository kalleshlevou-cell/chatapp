import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

const MODES = ['Login', 'Register', 'Guest'];

const AuthScreen = () => {
  const { login, register, guestLogin } = useAuth();
  const [mode, setMode]     = useState('Login');
  const [form, setForm]     = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'Login') {
        if (!form.email || !form.password)
          return Alert.alert('Error', 'Email and password are required');
        await login(form.email.trim(), form.password);
      } else if (mode === 'Register') {
        if (!form.username || !form.email || !form.password)
          return Alert.alert('Error', 'All fields are required');
        await register(form.username.trim(), form.email.trim(), form.password);
      } else {
        if (!form.username || form.username.trim().length < 2)
          return Alert.alert('Error', 'Username must be at least 2 characters');
        await guestLogin(form.username.trim());
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>💬</Text>
          <Text style={styles.brandTitle}>ChatApp</Text>
          <Text style={styles.brandSub}>Connect and chat in real time</Text>
        </View>

        {/* Mode tabs */}
        <View style={styles.tabs}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => { setMode(m); setForm({ username: '', email: '', password: '' }); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {(mode === 'Register' || mode === 'Guest') && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={COLORS.textMuted}
                value={form.username}
                onChangeText={(v) => update('username', v)}
                autoCapitalize="none"
                maxLength={20}
              />
            </View>
          )}

          {(mode === 'Login' || mode === 'Register') && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textMuted}
                value={form.email}
                onChangeText={(v) => update('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {(mode === 'Login' || mode === 'Register') && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textMuted}
                value={form.password}
                onChangeText={(v) => update('password', v)}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>
                  {mode === 'Login' ? 'Sign In' : mode === 'Register' ? 'Create Account' : 'Join as Guest'}
                </Text>
            }
          </TouchableOpacity>

          {mode === 'Guest' && (
            <Text style={styles.guestNote}>
              No registration needed. Your chat history is preserved.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: COLORS.bg },
  container:   { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand:       { alignItems: 'center', marginBottom: 32 },
  brandIcon:   { fontSize: 56, marginBottom: 8 },
  brandTitle:  { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  brandSub:    { fontSize: 14, color: COLORS.textSecondary },

  tabs:        { flexDirection: 'row', backgroundColor: COLORS.bgSecondary, borderRadius: 10, padding: 4, marginBottom: 24 },
  tab:         { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive:   { backgroundColor: COLORS.accent },
  tabText:     { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: COLORS.white },

  form:        { gap: 16 },
  formGroup:   { gap: 6 },
  label:       { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8 },
  input:       {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
  },

  submitBtn:     {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText:     { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  guestNote:      { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginTop: 8 },
});

export default AuthScreen;
