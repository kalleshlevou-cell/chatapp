import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor, formatTime } from '../utils/colors';

/* ─── Message Bubble ──────────────────────────────────────── */
const MessageBubble = React.memo(({ message, isOwn }) => {
  if (message.messageType === 'system') {
    return (
      <View style={styles.systemMsg}>
        <Text style={styles.systemMsgText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
      {!isOwn && (
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(message.sender) }]}>
          <Text style={styles.avatarText}>{message.sender?.[0]?.toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.msgContent}>
        {!isOwn && (
          <Text style={[styles.senderName, { color: getAvatarColor(message.sender) }]}>
            {message.sender}
          </Text>
        )}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>{message.content}</Text>
          <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
      {isOwn && (
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(message.sender) }]}>
          <Text style={styles.avatarText}>{message.sender?.[0]?.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
});

/* ─── Typing Indicator ────────────────────────────────────── */
const TypingIndicator = ({ typingUsers, currentUser }) => {
  const others = typingUsers.filter((u) => u !== currentUser);
  if (!others.length) return null;
  const label = others.length === 1
    ? `${others[0]} is typing...`
    : `${others[0]} and ${others.length - 1} more are typing...`;
  return (
    <View style={styles.typingWrap}>
      <Text style={styles.typingText}>{label}</Text>
    </View>
  );
};

/* ─── Chat Screen ─────────────────────────────────────────── */
const ChatScreen = ({ route, navigation }) => {
  const { room } = route.params;
  const { user }                     = useAuth();
  const { messages, onlineUsers, typingUsers, sendMessage, emitTyping } = useChat();
  const [text, setText]              = useState('');
  const flatListRef                  = useRef(null);
  const typingRef                    = useRef(false);

  // Set header right button for online users
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Online', { room })}
          style={{ marginRight: 14 }}
        >
          <Text style={{ color: COLORS.accentLight, fontSize: 13, fontWeight: '600' }}>
            👥 {onlineUsers.length}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, onlineUsers.length, room]);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    typingRef.current = false;
    emitTyping(false);
  }, [text, sendMessage, emitTyping]);

  const handleTextChange = (val) => {
    setText(val);
    if (!typingRef.current && val.length > 0) {
      typingRef.current = true;
      emitTyping(true);
    } else if (typingRef.current && val.length === 0) {
      typingRef.current = false;
      emitTyping(false);
    }
  };

  const renderItem = useCallback(({ item, index }) => (
    <MessageBubble
      key={item._id || index}
      message={item}
      isOwn={item.sender === user?.username}
    />
  ), [user?.username]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, i) => item._id || String(i)}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} currentUser={user?.username} />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`Message #${room}`}
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  flex:          { flex: 1 },
  messagesList:  { padding: 14, paddingBottom: 6, flexGrow: 1, justifyContent: 'flex-end' },

  /* Message rows */
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8, maxWidth: '82%' },
  msgRowOwn:    { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowOther:  { alignSelf: 'flex-start' },

  avatar:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: COLORS.white, fontWeight: '700', fontSize: 12 },

  msgContent:   { maxWidth: '100%' },
  senderName:   { fontSize: 12, fontWeight: '600', marginBottom: 3, marginLeft: 2 },

  bubble:       { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleOwn:    { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleOther:  { backgroundColor: COLORS.bgSecondary, borderBottomLeftRadius: 4 },

  msgText:      { fontSize: 14, color: COLORS.textPrimary, flexShrink: 1, lineHeight: 20 },
  msgTextOwn:   { color: COLORS.white },
  msgTime:      { fontSize: 10, color: COLORS.textSecondary, alignSelf: 'flex-end', flexShrink: 0 },
  msgTimeOwn:   { color: 'rgba(255,255,255,0.6)' },

  systemMsg:    { alignSelf: 'center', marginVertical: 6 },
  systemMsgText:{ color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },

  /* Typing */
  typingWrap:   { paddingHorizontal: 16, paddingBottom: 4, minHeight: 20 },
  typingText:   { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },

  /* Input */
  inputBar:     {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    gap: 8,
  },
  input:        {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn:      {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.bgHover },
  sendIcon:        { color: COLORS.white, fontSize: 18 },

  /* Empty */
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 40, marginBottom: 10 },
  emptyText:    { color: COLORS.textMuted, fontSize: 15 },
});

export default ChatScreen;
