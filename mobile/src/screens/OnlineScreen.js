import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor } from '../utils/colors';

export default function OnlineScreen({ navigation }) {
  const { user }                   = useAuth();
  const { onlineUsers, currentRoom } = useChat();

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View style={s.greenDot} />
          <Text style={s.headerTitle}>ONLINE — {onlineUsers.length}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>
      {!!currentRoom && (
        <View style={s.roomLabel}>
          <Text style={s.roomLabelText}># {currentRoom}</Text>
        </View>
      )}
      <FlatList
        data={onlineUsers}
        keyExtractor={item => item.socketId || item.username}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={[s.av, { backgroundColor: getAvatarColor(item.username) }]}>
              <Text style={s.avText}>{item.username?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={s.username}>{item.username}</Text>
                {item.username === user?.username && <Text style={s.you}> (you)</Text>}
              </View>
              {item.isGuest && <View style={s.guestTag}><Text style={s.guestText}>Guest</Text></View>}
            </View>
            <View style={s.onlineDot} />
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No users online in this room</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bgSecondary, borderBottomWidth: 1, borderColor: COLORS.border },
  back:         { color: COLORS.accentLight, fontSize: 16, fontWeight: '600' },
  greenDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  headerTitle:  { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8 },
  roomLabel:    { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  roomLabelText:{ color: COLORS.textSecondary, fontSize: 14 },
  item:         { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: COLORS.border, gap: 12 },
  av:           { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avText:       { color: COLORS.white, fontWeight: '700', fontSize: 17 },
  username:     { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },
  you:          { color: COLORS.textMuted, fontSize: 13 },
  guestTag:     { marginTop: 3, backgroundColor: 'rgba(250,166,26,0.12)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' },
  guestText:    { color: COLORS.yellow, fontSize: 11, fontWeight: '600' },
  onlineDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  empty:        { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14, fontStyle: 'italic' },
});
