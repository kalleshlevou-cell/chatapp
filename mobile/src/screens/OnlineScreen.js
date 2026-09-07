import React from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor } from '../utils/colors';

const OnlineScreen = () => {
  const { user }        = useAuth();
  const { onlineUsers } = useChat();

  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.username) }]}>
        <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>
          {item.username}
          {item.username === user?.username ? ' (you)' : ''}
        </Text>
        {item.isGuest && <Text style={styles.guestTag}>Guest</Text>}
      </View>
      {/* Green online dot */}
      <View style={styles.onlineDot} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />

      <View style={styles.header}>
        <View style={styles.onlineDotSmall} />
        <Text style={styles.headerTitle}>ONLINE USERS — {onlineUsers.length}</Text>
      </View>

      <FlatList
        data={onlineUsers}
        keyExtractor={(item) => item.socketId || item.username}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users online in this room</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  header:        {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
  },
  onlineDotSmall:{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  headerTitle:   { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8 },

  userItem:      {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  avatar:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  userInfo:      { flex: 1 },
  username:      { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  guestTag:      {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.yellow,
    backgroundColor: 'rgba(250,166,26,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  onlineDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  emptyText:     { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },
});

export default OnlineScreen;
