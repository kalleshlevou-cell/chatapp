import React, {
  useEffect, useRef, useState, useCallback, useMemo,
} from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
  StatusBar, Animated, Easing,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor, formatTime } from '../utils/colors';

// ─────────────────────────────────────────────────────────────
// MessageItem — exact match of web MessageItem.js
// ─────────────────────────────────────────────────────────────
const MessageItem = React.memo(({ message, isOwn }) => {
  if (message.messageType === 'system') {
    return (
      <View style={msg.systemWrap}>
        <Text style={msg.systemText}>{message.content}</Text>
      </View>
    );
  }

  const avatarColor = getAvatarColor(message.sender);
  const initial = message.sender?.[0]?.toUpperCase();

  return (
    <View style={[msg.row, isOwn ? msg.rowOwn : msg.rowOther]}>
      {/* Avatar — other side */}
      {!isOwn && (
        <View style={[msg.avatar, { backgroundColor: avatarColor }]}>
          <Text style={msg.avatarText}>{initial}</Text>
        </View>
      )}

      <View style={[msg.contentWrap, isOwn && msg.contentWrapOwn]}>
        {/* Sender name — only for others */}
        {!isOwn && (
          <Text style={[msg.senderName, { color: avatarColor }]}>{message.sender}</Text>
        )}

        {/* Bubble */}
        <View style={[msg.bubble, isOwn ? msg.bubbleOwn : msg.bubbleOther]}>
          <Text style={[msg.text, isOwn && msg.textOwn]}>{message.content}</Text>
          <Text style={[msg.time, isOwn && msg.timeOwn]}>{formatTime(message.createdAt)}</Text>
        </View>
      </View>

      {/* Avatar — own side */}
      {isOwn && (
        <View style={[msg.avatar, { backgroundColor: avatarColor }]}>
          <Text style={msg.avatarText}>{initial}</Text>
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// TypingIndicator — animated 3 dots, exact match of web
// ─────────────────────────────────────────────────────────────
const TypingIndicator = React.memo(({ typingUsers, currentUser }) => {
  const others = typingUsers.filter((u) => u !== currentUser);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (others.length === 0) return;
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
          Animated.delay(600),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); dot1.setValue(0); dot2.setValue(0); dot3.setValue(0); };
  }, [others.length]);

  if (others.length === 0) return <View style={ti.wrap} />;

  const label =
    others.length === 1
      ? `${others[0]} is typing`
      : others.length === 2
      ? `${others[0]} and ${others[1]} are typing`
      : `${others[0]} and ${others.length - 1} others are typing`;

  return (
    <View style={ti.wrap}>
      <View style={ti.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[ti.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
      <Text style={ti.label}>{label}...</Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// MessageInput — exact match of web MessageInput.js
// ─────────────────────────────────────────────────────────────
const MessageInput = React.memo(({ room }) => {
  const { sendMessage, emitTyping } = useChat();
  const [text, setText]             = useState('');
  const typingRef                   = useRef(false);

  const handleChange = (val) => {
    setText(val);
    if (!typingRef.current && val.length > 0) {
      typingRef.current = true;
      emitTyping(true);
    } else if (typingRef.current && val.length === 0) {
      typingRef.current = false;
      emitTyping(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    typingRef.current = false;
    emitTyping(false);
  }, [text, sendMessage, emitTyping]);

  const canSend = text.trim().length > 0;

  return (
    <View style={inp.container}>
      <View style={inp.row}>
        <TextInput
          style={inp.input}
          placeholder={`Message #${room}`}
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={handleChange}
          multiline
          maxLength={1000}
          onBlur={() => {
            if (typingRef.current) { typingRef.current = false; emitTyping(false); }
          }}
        />
        <TouchableOpacity
          style={[inp.sendBtn, !canSend && inp.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Text style={inp.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
      <Text style={inp.charCount}>{text.length}/1000</Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// ChatScreen
// ─────────────────────────────────────────────────────────────
const ChatScreen = ({ route, navigation }) => {
  const { room }                          = route.params;
  const { user }                          = useAuth();
  const { messages, onlineUsers, typingUsers } = useChat();
  const listRef                           = useRef(null);

  // Header right — online users count button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 14 }}
          onPress={() => navigation.navigate('Online', { room })}
          activeOpacity={0.8}
        >
          <Text style={{ color: COLORS.accentLight, fontSize: 14, fontWeight: '600' }}>
            👥 {onlineUsers.length}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, onlineUsers.length, room]);

  // Auto-scroll on new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const renderItem = useCallback(({ item, index }) => (
    <MessageItem
      key={item._id || index}
      message={item}
      isOwn={item.sender === user?.username}
    />
  ), [user?.username]);

  const keyExtractor = useCallback((item, i) => item._id || String(i), []);

  return (
    <SafeAreaView style={cs.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />
      <KeyboardAvoidingView
        style={cs.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Room info bar */}
        <View style={cs.roomBar}>
          <Text style={cs.roomHash}>#</Text>
          <Text style={cs.roomName}>{room}</Text>
          <View style={cs.memberBadge}>
            <Text style={cs.memberCount}>{onlineUsers.length} online</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={cs.messagesList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={cs.emptyWrap}>
              <Text style={cs.emptyIcon}>🎉</Text>
              <Text style={cs.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} currentUser={user?.username} />

        {/* Input */}
        <MessageInput room={room} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

// MessageItem styles
const msg = StyleSheet.create({
  row:          { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8, maxWidth: '82%' },
  rowOwn:       { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  rowOther:     { alignSelf: 'flex-start' },
  avatar:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  contentWrap:  { maxWidth: '100%' },
  contentWrapOwn:{ alignItems: 'flex-end' },
  senderName:   { fontSize: 12, fontWeight: '600', marginBottom: 3, marginLeft: 2 },
  bubble:       { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-end', gap: 8, flexShrink: 1 },
  bubbleOwn:    { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleOther:  { backgroundColor: COLORS.bgSecondary, borderBottomLeftRadius: 4 },
  text:         { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, flexShrink: 1 },
  textOwn:      { color: COLORS.white },
  time:         { fontSize: 10, color: COLORS.textSecondary, alignSelf: 'flex-end', flexShrink: 0 },
  timeOwn:      { color: 'rgba(255,255,255,0.6)' },
  systemWrap:   { alignSelf: 'center', marginVertical: 6 },
  systemText:   { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
});

// TypingIndicator styles
const ti = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, minHeight: 24, paddingBottom: 4 },
  dots:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted },
  label: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
});

// MessageInput styles
const inp = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary },
  row:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input:     {
    flex: 1, backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    color: COLORS.textPrimary, fontSize: 14, maxHeight: 120,
  },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.bgHover },
  sendIcon:        { color: COLORS.white, fontSize: 18 },
  charCount:       { textAlign: 'right', fontSize: 11, color: COLORS.textMuted, marginTop: 4, paddingRight: 4 },
});

// ChatScreen styles
const cs = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  flex:         { flex: 1 },
  roomBar:      {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
  },
  roomHash:     { fontSize: 22, color: COLORS.textMuted, fontWeight: '600' },
  roomName:     { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  memberBadge:  { backgroundColor: COLORS.bgHover, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  memberCount:  { fontSize: 12, color: COLORS.textMuted },
  messagesList: { padding: 14, paddingBottom: 6, flexGrow: 1, justifyContent: 'flex-end' },
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:    { fontSize: 40, marginBottom: 10 },
  emptyText:    { color: COLORS.textMuted, fontSize: 15 },
});

export default ChatScreen;
