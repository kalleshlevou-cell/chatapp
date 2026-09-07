import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator, Alert,
  StatusBar, SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS } from '../utils/colors';

const DEFAULT_ROOMS = ['General', 'Tech', 'Random'];

const RoomsScreen = ({ navigation }) => {
  const { user, logout }              = useAuth();
  const { rooms, fetchRooms, createRoom, joinRoom, connected } = useChat();
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [creating, setCreating]       = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleJoin = (roomName) => {
    joinRoom(roomName);
    navigation.navigate('Chat', { room: roomName });
  };

  const handleCreate = async () => {
    if (newName.trim().length < 3) {
      Alert.alert('Error', 'Room name must be at least 3 characters');
      return;
    }
    setCreating(true);
    try {
      const room = await createRoom(newName.trim(), newDesc.trim());
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      handleJoin(room.name);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => handleJoin(item.name)}
      activeOpacity={0.75}
    >
      <View style={styles.roomIcon}>
        <Text style={styles.roomHash}>#</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.roomDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
      </View>
      <Text style={styles.roomArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />

      {/* User bar */}
      <View style={styles.userBar}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.username?.[0]?.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.usernameText}>{user?.username}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.connDot, { backgroundColor: connected ? COLORS.green : COLORS.red }]} />
            <Text style={styles.statusText}>{connected ? 'Connected' : 'Connecting...'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Default rooms */}
      <Text style={styles.sectionHeader}>DEFAULT ROOMS</Text>
      <View style={styles.defaultRooms}>
        {DEFAULT_ROOMS.map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.defaultRoom}
            onPress={() => handleJoin(name)}
            activeOpacity={0.8}
          >
            <Text style={styles.defaultRoomText}># {name.toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom rooms */}
      <View style={styles.roomsHeader}>
        <Text style={styles.sectionHeader}>ROOMS ({rooms.length})</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderRoom}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search ? 'No rooms found' : 'No rooms yet. Create one!'}
          </Text>
        }
      />

      {/* Create Room Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
            <Text style={styles.modalTitle}>Create a Room</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>ROOM NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. design-talk"
                placeholderTextColor={COLORS.textMuted}
                value={newName}
                onChangeText={setNewName}
                maxLength={30}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>DESCRIPTION (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="What's this room about?"
                placeholderTextColor={COLORS.textMuted}
                value={newDesc}
                onChangeText={setNewDesc}
                maxLength={100}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.submitText}>Create</Text>
                }
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },

  userBar:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary },
  userAvatar:    { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  userAvatarText:{ color: COLORS.white, fontWeight: '700', fontSize: 16 },
  usernameText:  { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  statusRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  connDot:       { width: 7, height: 7, borderRadius: 4 },
  statusText:    { color: COLORS.textMuted, fontSize: 12 },
  logoutBtn:     { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: COLORS.bgHover, borderRadius: 8 },
  logoutText:    { color: COLORS.red, fontWeight: '600', fontSize: 13 },

  searchWrap:    { padding: 12, paddingBottom: 6 },
  searchInput:   { backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, color: COLORS.textPrimary, fontSize: 14 },

  sectionHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },

  defaultRooms:  { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginBottom: 4 },
  defaultRoom:   { backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  defaultRoomText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },

  roomsHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  createBtn:     { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  createBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  list:          { flex: 1 },
  roomItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: COLORS.border, gap: 12 },
  roomIcon:      { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  roomHash:      { color: COLORS.accent, fontWeight: '700', fontSize: 18 },
  roomInfo:      { flex: 1 },
  roomName:      { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  roomDesc:      { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  roomArrow:     { color: COLORS.textMuted, fontSize: 22, fontWeight: '300' },
  emptyText:     { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  modalCard:     { backgroundColor: COLORS.bgSecondary, borderRadius: 14, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 18 },
  formGroup:     { marginBottom: 14 },
  label:         { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.8, marginBottom: 6 },
  input:         { backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, color: COLORS.textPrimary, fontSize: 15 },
  modalActions:  { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:     { flex: 1, backgroundColor: COLORS.bgHover, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelText:    { color: COLORS.textSecondary, fontWeight: '600' },
  submitBtn:     { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, padding: 12, alignItems: 'center' },
  submitText:    { color: COLORS.white, fontWeight: '700' },
});

export default RoomsScreen;
