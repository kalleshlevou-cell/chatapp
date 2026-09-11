import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, StatusBar, RefreshControl, Modal, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor } from '../utils/colors';

const DEFAULT_ROOMS = ['General', 'Tech', 'Random'];

export default function RoomsScreen({ navigation }) {
  const { user, logout }                           = useAuth();
  const { rooms, fetchRooms, joinRoom, connected, createRoom } = useChat();
  const [search, setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [newName, setNewName]       = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [creating, setCreating]     = useState(false);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleJoin = (roomName) => { joinRoom(roomName); navigation.navigate('Chat', { room: roomName }); };
  const handleRefresh = async () => { setRefreshing(true); await fetchRooms(); setRefreshing(false); };

  const handleCreate = async () => {
    if (newName.trim().length < 3) { Alert.alert('Error', 'Room name must be at least 3 characters'); return; }
    setCreating(true);
    try {
      const room = await createRoom(newName.trim(), newDesc.trim());
      setShowModal(false); setNewName(''); setNewDesc('');
      handleJoin(room.name);
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to create room'); }
    finally { setCreating(false); }
  };

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />
      {/* Header */}
      <View style={s.header}>
        <Text style={s.brand}>💬 ChatApp</Text>
        <View style={[s.dot, { backgroundColor: connected ? COLORS.green : COLORS.red }]} />
      </View>
      {/* User bar */}
      <View style={s.userBar}>
        <View style={[s.avatar, { backgroundColor: getAvatarColor(user?.username) }]}>
          <Text style={s.avatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.username}>{user?.username}{user?.isGuest ? '  (Guest)' : ''}</Text>
          <Text style={s.status}>{connected ? '🟢 Online' : '🔴 Connecting...'}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}><Text style={s.logoutText}>Sign Out</Text></TouchableOpacity>
      </View>
      {/* Search */}
      <View style={{ padding: 12, paddingBottom: 6 }}>
        <TextInput style={s.search} placeholder="Search rooms..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
      </View>
      {/* Default rooms */}
      <Text style={s.sectionHeader}>DEFAULT</Text>
      <View style={s.chips}>
        {DEFAULT_ROOMS.map(n => (
          <TouchableOpacity key={n} style={s.chip} onPress={() => handleJoin(n)} activeOpacity={0.8}>
            <Text style={s.chipText}># {n.toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Rooms list */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 }}>
        <Text style={s.sectionHeader}>ROOMS ({rooms.length})</Text>
        <TouchableOpacity style={s.createBtn} onPress={() => setShowModal(true)}><Text style={s.createBtnText}>+ New</Text></TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.roomItem} onPress={() => handleJoin(item.name)} activeOpacity={0.75}>
            <View style={s.roomIcon}><Text style={s.roomHash}>#</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.roomName}>{item.name}</Text>
              {!!item.description && <Text style={s.roomDesc} numberOfLines={1}>{item.description}</Text>}
            </View>
            <Text style={{ color: COLORS.textMuted, fontSize: 22 }}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={s.empty}>{search ? 'No rooms found' : 'No rooms yet. Create one!'}</Text>}
      />
      {/* Create Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />
          <View style={s.card}>
            <Text style={s.cardTitle}>Create a Room</Text>
            <Text style={s.label}>ROOM NAME *</Text>
            <TextInput style={s.input} placeholder="e.g. design-talk" placeholderTextColor={COLORS.textMuted} value={newName} onChangeText={setNewName} maxLength={30} autoFocus />
            <Text style={[s.label, { marginTop: 12 }]}>DESCRIPTION (optional)</Text>
            <TextInput style={s.input} placeholder="What's this room about?" placeholderTextColor={COLORS.textMuted} value={newDesc} onChangeText={setNewDesc} maxLength={100} />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowModal(false)}><Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.submitBtn, creating && { opacity: 0.6 }]} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={{ color: COLORS.white, fontWeight: '700' }}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: COLORS.bgSecondary, borderBottomWidth: 1, borderColor: COLORS.border },
  brand: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  dot: { width: 10, height: 10, borderRadius: 5 },
  userBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSidebar },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  username: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  status: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: COLORS.bgHover, borderRadius: 8 },
  logoutText: { color: COLORS.red, fontWeight: '600', fontSize: 13 },
  search: { backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.textPrimary, fontSize: 14 },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginBottom: 4, flexWrap: 'wrap' },
  chip: { backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { color: COLORS.accentLight, fontWeight: '600', fontSize: 13 },
  createBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  createBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  roomItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  roomIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  roomHash: { color: COLORS.accent, fontWeight: '700', fontSize: 20 },
  roomName: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  roomDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.bgSecondary, borderRadius: 14, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, color: COLORS.textPrimary, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.bgHover, borderRadius: 10, padding: 12, alignItems: 'center' },
  submitBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, padding: 12, alignItems: 'center' },
});
