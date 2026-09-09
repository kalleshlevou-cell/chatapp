import React from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor } from '../utils/colors';

const OnlineScreen = ({ navigation }) => {
  const { user }        = useAuth();
  const { onlineUsers, currentRoom } = useChat();

  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.username) }]}>
        <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>{item.username}</Text>
          {item.username === user?.username && (
            <Text style={styles.youBadge}> (you)</Text>
          )}
        </View>
        {item.isGuest && (
          <View style={styles.guestTag}>
            <Text style={styles.guestTagText}>Guest</Text>
          </View>
        )}
      </View>
      <View style={styles.onlineDot} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.onlineDotSmall} />
          <Text style={styles.headerTitle}>ONLINE — {onlineUsers.length}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Room label */}
      {!!currentRoom && (
        <View style={styles.roomLabel}>
          <Text style={styles.roomLabelText}># {currentRoom}</Text>
        </View>
      )}

      <FlatList
        data={onlineUsers}
        keyExtractor={(item) => item.socketId || item.username}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users online in this room</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header:       {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.bgSecondary, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn:      { width: 60 },
  backText:     { color: COLORS.accentLight, fontSize: 16, fontWeight: '600' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  onlineDotSmall:{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  headerTitle:  { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8 },

  roomLabel:     { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  roomLabelText: { color: COLORS.textSecondary, fontSize: 14 },

  userItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  avatar:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: COLORS.white, fontWeight: '700', fontSize: 17 },
  userInfo:    { flex: 1 },
  nameRow:     { flexDirection: 'row', alignItems: 'center' },
  username:    { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  youBadge:    { color: COLORS.textMuted, fontSize: 13 },
  guestTag:    { marginTop: 3, backgroundColor: 'rgba(250,166,26,0.12)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' },
  guestTagText:{ color: COLORS.yellow, fontSize: 11, fontWeight: '600' },
  onlineDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  emptyText:   { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },
});

export default OnlineScreen;
