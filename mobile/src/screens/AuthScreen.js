import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

const MODES = ['Login', 'Register', 'Guest'];

const AuthScreen = () => {
  const { login, register, guestLogin } = useAuth();
  const [mode, setMode]       = useState('Login');
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'Login') {
        if (!form.email.trim() || !form.password)
          return setError('Email and password are required');
        await login(form.email.trim(), form.password);
      } else if (mode === 'Register') {
        if (!form.username.trim() || !form.email.trim() || !form.password)
          return setError('All fields are required');
        if (form.username.trim().length < 3)
          return setError('Username must be at least 3 characters');
        if (form.password.length < 6)
          return setError('Password must be at least 6 characters');
        await register(form.username.trim(), form.email.trim(), form.password);
      } else {
        if (!form.username.trim() || form.username.trim().length < 2)
          return setError('Username must be at least 2 characters');
        await guestLogin(form.username.trim());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand ─────────────────────────────────── */}
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>💬</Text>
          <Text style={styles.brandTitle}>ChatApp</Text>
          <Text style={styles.brandSub}>Connect and chat in real time</Text>
        </View>

        {/* ── Tabs ──────────────────────────────────── */}
        <View style={styles.tabs}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => switchMode(m)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Form ──────────────────────────────────── */}
        <View style={styles.form}>

          {/* Username — Register + Guest */}
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
                autoFocus
                maxLength={20}
                returnKeyType="next"
              />
            </View>
          )}

          {/* Email — Login + Register */}
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
                autoFocus={mode === 'Login'}
                returnKeyType="next"
              />
            </View>
          )}

          {/* Password — Login + Register */}
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
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          {/* Error box */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} size="small" />
              : <Text style={styles.submitText}>
                  {mode === 'Login'
                    ? 'Sign In'
                    : mode === 'Register'
                    ? 'Create Account'
                    : 'Join as Guest'}
                </Text>
            }
          </TouchableOpacity>

          {/* Guest note */}
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
  flex:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  // Brand
  brand:      { alignItems: 'center', marginBottom: 32 },
  brandIcon:  { fontSize: 56, marginBottom: 8 },
  brandTitle: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  brandSub:   { fontSize: 14, color: COLORS.textSecondary },

  // Tabs
  tabs:         { flexDirection: 'row', backgroundColor: COLORS.bgSecondary, borderRadius: 10, padding: 4, marginBottom: 24, gap: 2 },
  tab:          { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive:    { backgroundColor: COLORS.accent },
  tabText:      { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive:{ color: COLORS.white },

  // Form
  form:      { gap: 16 },
  formGroup: { gap: 6 },
  label:     { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8 },
  input:     {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 13,
    color: COLORS.textPrimary,
    fontSize: 15,
  },

  // Error
  errorBox:  {
    backgroundColor: 'rgba(237,66,69,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(237,66,69,0.4)',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 14 },

  // Submit
  submitBtn:     {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitDisabled:{ opacity: 0.6 },
  submitText:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  guestNote: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
});

export default AuthScreen;
