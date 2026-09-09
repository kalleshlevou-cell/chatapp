import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useChat } from '../context/ChatContext';
import { COLORS } from '../utils/colors';

const CreateRoomModal = ({ visible, onClose, onJoin }) => {
  const { createRoom, fetchRooms } = useChat();
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const reset = () => { setName(''); setDesc(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (name.trim().length < 3) {
      setError('Room name must be at least 3 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await createRoom(name.trim(), description.trim());
      await fetchRooms();
      reset();
      onClose();
      onJoin(room.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create a Room</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Room Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ROOM NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. design-talk"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              maxLength={30}
              autoFocus
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>DESCRIPTION (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="What's this room about?"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDesc}
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.submitText}>Create Room</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:   { flex: 1, justifyContent: 'center', padding: 24 },
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  card:      {
    backgroundColor: COLORS.bgSecondary, borderRadius: 14,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title:     { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  closeBtn:  { padding: 4 },
  closeText: { color: COLORS.textMuted, fontSize: 18 },

  formGroup: { marginBottom: 14 },
  label:     { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8, marginBottom: 6 },
  input:     {
    backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 10, padding: 12, color: COLORS.textPrimary, fontSize: 15,
  },

  errorBox:  { backgroundColor: 'rgba(237,66,69,0.12)', borderWidth: 1, borderColor: 'rgba(237,66,69,0.4)', borderRadius: 8, padding: 10, marginBottom: 10 },
  errorText: { color: '#f87171', fontSize: 14 },

  actions:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:  { flex: 1, backgroundColor: COLORS.bgHover, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
  submitBtn:  { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, padding: 12, alignItems: 'center' },
  submitText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

export default CreateRoomModal;
