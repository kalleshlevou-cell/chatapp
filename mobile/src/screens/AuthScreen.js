import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

const MODES = ['Login', 'Register', 'Guest'];

export default function AuthScreen() {
  const { login, register, guestLogin } = useAuth();
  const [mode, setMode]   = useState('Login');
  const [form, setForm]   = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const switchMode = (m) => { setMode(m); setForm({ username: '', email: '', password: '' }); setError(''); };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      if (mode === 'Login') {
        if (!form.email || !form.password) return setError('Email and password required');
        await login(form.email.trim(), form.password);
      } else if (mode === 'Register') {
        if (!form.username || !form.email || !form.password) return setError('All fields required');
        await register(form.username.trim(), form.email.trim(), form.password);
      } else {
        if (!form.username || form.username.trim().length < 2) return setError('Username min 2 characters');
        await guestLogin(form.username.trim());
      }
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.brand}>
          <Text style={s.brandIcon}>💬</Text>
          <Text style={s.brandTitle}>ChatApp</Text>
          <Text style={s.brandSub}>Connect and chat in real time</Text>
        </View>
        <View style={s.tabs}>
          {MODES.map(m => (
            <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabActive]} onPress={() => switchMode(m)} activeOpacity={0.85}>
              <Text style={[s.tabText, mode === m && s.tabTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.form}>
          {(mode === 'Register' || mode === 'Guest') && (
            <View style={s.fg}>
              <Text style={s.label}>USERNAME</Text>
              <TextInput style={s.input} placeholder="Enter username" placeholderTextColor={COLORS.textMuted} value={form.username} onChangeText={v => update('username', v)} autoCapitalize="none" maxLength={20} />
            </View>
          )}
          {(mode === 'Login' || mode === 'Register') && (
            <View style={s.fg}>
              <Text style={s.label}>EMAIL</Text>
              <TextInput style={s.input} placeholder="Enter email" placeholderTextColor={COLORS.textMuted} value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
            </View>
          )}
          {(mode === 'Login' || mode === 'Register') && (
            <View style={s.fg}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput style={s.input} placeholder="Enter password" placeholderTextColor={COLORS.textMuted} value={form.password} onChangeText={v => update('password', v)} secureTextEntry onSubmitEditing={handleSubmit} />
            </View>
          )}
          {!!error && <View style={s.errBox}><Text style={s.errText}>{error}</Text></View>}
          <TouchableOpacity style={[s.btn, loading && s.btnDis]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={s.btnText}>{mode === 'Login' ? 'Sign In' : mode === 'Register' ? 'Create Account' : 'Join as Guest'}</Text>}
          </TouchableOpacity>
          {mode === 'Guest' && <Text style={s.note}>No registration needed. Chat history preserved.</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  brandIcon: { fontSize: 56, marginBottom: 8 },
  brandTitle: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  brandSub: { fontSize: 14, color: COLORS.textSecondary },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.bgSecondary, borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: COLORS.white },
  form: { gap: 14 },
  fg: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8 },
  input: { backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 13, color: COLORS.textPrimary, fontSize: 15 },
  errBox: { backgroundColor: 'rgba(237,66,69,0.12)', borderWidth: 1, borderColor: 'rgba(237,66,69,0.4)', borderRadius: 8, padding: 12 },
  errText: { color: '#f87171', fontSize: 14 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  btnDis: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  note: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13 },
});
