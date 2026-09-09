import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor } from '../utils/colors';
import CreateRoomModal from '../components/CreateRoomModal';

const DEFAULT_ROOMS = ['General', 'Tech', 'Random'];

const RoomsScreen = ({ navigation }) => {
  const { user, logout }                               = useAuth();
  const { rooms, fetchRooms, joinRoom, connected }     = useChat();
  const [search, setSearch]                            = useState('');
  const [showModal, setShowModal]                      = useState(false);
  const [refreshing, setRefreshing]                    = useState(false);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleJoin = (roomName) => {
    joinRoom(roomName);
    navigation.navigate('Chat', { room: roomName });
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
        {!!item.description && (
          <Text style={styles.roomDesc} numberOfLines={1}>{item.description}</Text>
        )}
      </View>
      <Text style={styles.roomArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />

      {/* ── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brand}>💬 ChatApp</Text>
        <View style={[styles.connDot, { backgroundColor: connected ? COLORS.green : COLORS.red }]} />
      </View>

      {/* ── User bar ───────────────────────────── */}
      <View style={styles.userBar}>
        <View style={[styles.userAvatar, { backgroundColor: getAvatarColor(user?.username) }]}>
          <Text style={styles.userAvatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.username}>{user?.username}</Text>
            {user?.isGuest && <View style={styles.guestBadge}><Text style={styles.guestBadgeText}>Guest</Text></View>}
          </View>
          <Text style={styles.statusText}>{connected ? '🟢 Online' : '🔴 Connecting...'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────────── */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Default rooms ──────────────────────── */}
      <Text style={styles.sectionHeader}>DEFAULT</Text>
      <View style={styles.defaultRooms}>
        {DEFAULT_ROOMS.map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.defaultChip}
            onPress={() => handleJoin(name)}
            activeOpacity={0.8}
          >
            <Text style={styles.defaultChipText}># {name.toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Rooms list ─────────────────────────── */}
      <View style={styles.roomsHeader}>
        <Text style={styles.sectionHeader}>ROOMS ({rooms.length})</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.createBtnText}>+ New Room</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderRoom}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search ? 'No rooms found' : 'No rooms yet. Create one!'}
          </Text>
        }
      />

      <CreateRoomModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onJoin={handleJoin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  brand:    { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  connDot:  { width: 10, height: 10, borderRadius: 5 },

  userBar:  {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderBottomWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSidebar,
  },
  userAvatar:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  userInfo:       { flex: 1 },
  userNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username:       { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  guestBadge:     { backgroundColor: 'rgba(250,166,26,0.15)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  guestBadgeText: { color: COLORS.yellow, fontSize: 11, fontWeight: '600' },
  statusText:     { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  logoutBtn:      { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: COLORS.bgHover, borderRadius: 8 },
  logoutText:     { color: COLORS.red, fontWeight: '600', fontSize: 13 },

  searchWrap:  { padding: 12, paddingBottom: 8 },
  searchInput: {
    backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: COLORS.textPrimary, fontSize: 14,
  },

  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6,
  },

  defaultRooms: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginBottom: 4, flexWrap: 'wrap' },
  defaultChip:  {
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  defaultChipText: { color: COLORS.accentLight, fontWeight: '600', fontSize: 13 },

  roomsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  createBtn:   { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  createBtnText:{ color: COLORS.white, fontWeight: '700', fontSize: 13 },

  list: { flex: 1 },
  roomItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  roomIcon:  { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  roomHash:  { color: COLORS.accent, fontWeight: '700', fontSize: 20 },
  roomInfo:  { flex: 1 },
  roomName:  { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  roomDesc:  { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  roomArrow: { color: COLORS.textMuted, fontSize: 24 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },
});

export default RoomsScreen;
