import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Animated, Easing } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, getAvatarColor, formatTime } from '../utils/colors';

// ── Message Bubble ────────────────────────────────────────────
const MessageBubble = React.memo(({ message, isOwn }) => {
  if (message.messageType === 'system') {
    return <View style={ms.sysWrap}><Text style={ms.sysText}>{message.content}</Text></View>;
  }
  const color   = getAvatarColor(message.sender);
  const initial = message.sender?.[0]?.toUpperCase();
  return (
    <View style={[ms.row, isOwn ? ms.rowOwn : ms.rowOther]}>
      {!isOwn && <View style={[ms.av, { backgroundColor: color }]}><Text style={ms.avText}>{initial}</Text></View>}
      <View style={[ms.wrap, isOwn && ms.wrapOwn]}>
        {!isOwn && <Text style={[ms.sender, { color }]}>{message.sender}</Text>}
        <View style={[ms.bubble, isOwn ? ms.bubbleOwn : ms.bubbleOther]}>
          <Text style={[ms.text, isOwn && ms.textOwn]}>{message.content}</Text>
          <Text style={[ms.time, isOwn && ms.timeOwn]}>{formatTime(message.createdAt)}</Text>
        </View>
      </View>
      {isOwn && <View style={[ms.av, { backgroundColor: color }]}><Text style={ms.avText}>{initial}</Text></View>}
    </View>
  );
});

// ── Typing Indicator ──────────────────────────────────────────
const TypingIndicator = React.memo(({ typingUsers, currentUser }) => {
  const others = typingUsers.filter(u => u !== currentUser);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!others.length) return;
    const anim = (d, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(d, { toValue: -5, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(d, { toValue: 0,  duration: 300, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.delay(600),
      ])
    );
    const a1 = anim(dot1, 0); const a2 = anim(dot2, 200); const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [others.length]);

  if (!others.length) return <View style={{ height: 22 }} />;
  const label = others.length === 1 ? `${others[0]} is typing...` : `${others[0]} and ${others.length - 1} more are typing...`;
  return (
    <View style={ti.wrap}>
      <View style={ti.dots}>
        {[dot1, dot2, dot3].map((d, i) => <Animated.View key={i} style={[ti.dot, { transform: [{ translateY: d }] }]} />)}
      </View>
      <Text style={ti.label}>{label}</Text>
    </View>
  );
});

// ── Message Input ─────────────────────────────────────────────
const MessageInput = React.memo(({ room }) => {
  const { sendMessage, emitTyping } = useChat();
  const [text, setText] = useState('');
  const typing = useRef(false);

  const handleChange = v => {
    setText(v);
    if (!typing.current && v.length > 0) { typing.current = true; emitTyping(true); }
    else if (typing.current && v.length === 0) { typing.current = false; emitTyping(false); }
  };

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text); setText('');
    typing.current = false; emitTyping(false);
  }, [text, sendMessage, emitTyping]);

  return (
    <View style={inp.wrap}>
      <View style={inp.row}>
        <TextInput style={inp.input} placeholder={`Message #${room}`} placeholderTextColor={COLORS.textMuted} value={text} onChangeText={handleChange} multiline maxLength={1000} onBlur={() => { if (typing.current) { typing.current = false; emitTyping(false); } }} />
        <TouchableOpacity style={[inp.btn, !text.trim() && inp.btnDis]} onPress={handleSend} disabled={!text.trim()} activeOpacity={0.8}>
          <Text style={inp.icon}>➤</Text>
        </TouchableOpacity>
      </View>
      <Text style={inp.count}>{text.length}/1000</Text>
    </View>
  );
});

// ── Chat Screen ───────────────────────────────────────────────
export default function ChatScreen({ route, navigation }) {
  const { room }                             = route.params;
  const { user }                             = useAuth();
  const { messages, onlineUsers, typingUsers } = useChat();
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 14 }} onPress={() => navigation.navigate('Online', { room })} activeOpacity={0.8}>
          <Text style={{ color: COLORS.accentLight, fontSize: 14, fontWeight: '600' }}>👥 {onlineUsers.length}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, onlineUsers.length, room]);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const renderItem = useCallback(({ item, index }) => (
    <MessageBubble key={item._id || index} message={item} isOwn={item.sender === user?.username} />
  ), [user?.username]);

  return (
    <SafeAreaView style={cs.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSecondary} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Room bar */}
        <View style={cs.roomBar}>
          <Text style={cs.roomHash}>#</Text>
          <Text style={cs.roomName}>{room}</Text>
          <View style={cs.badge}><Text style={cs.badgeText}>{onlineUsers.length} online</Text></View>
        </View>
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, i) => item._id || String(i)}
          contentContainerStyle={cs.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={cs.emptyWrap}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
              <Text style={cs.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
        <TypingIndicator typingUsers={typingUsers} currentUser={user?.username} />
        <MessageInput room={room} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ms = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8, maxWidth: '82%' },
  rowOwn:    { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  rowOther:  { alignSelf: 'flex-start' },
  av:        { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avText:    { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  wrap:      { maxWidth: '100%' },
  wrapOwn:   { alignItems: 'flex-end' },
  sender:    { fontSize: 12, fontWeight: '600', marginBottom: 3, marginLeft: 2 },
  bubble:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleOwn: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleOther:{ backgroundColor: COLORS.bgSecondary, borderBottomLeftRadius: 4 },
  text:      { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, flexShrink: 1 },
  textOwn:   { color: COLORS.white },
  time:      { fontSize: 10, color: COLORS.textSecondary, alignSelf: 'flex-end' },
  timeOwn:   { color: 'rgba(255,255,255,0.6)' },
  sysWrap:   { alignSelf: 'center', marginVertical: 6 },
  sysText:   { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
});

const ti = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, height: 24, paddingBottom: 4 },
  dots:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted },
  label: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
});

const inp = StyleSheet.create({
  wrap:   { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary },
  row:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input:  { flex: 1, backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.textPrimary, fontSize: 14, maxHeight: 120 },
  btn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  btnDis: { backgroundColor: COLORS.bgHover },
  icon:   { color: COLORS.white, fontSize: 18 },
  count:  { textAlign: 'right', fontSize: 11, color: COLORS.textMuted, marginTop: 4, paddingRight: 4 },
});

const cs = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  roomBar:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary },
  roomHash:  { fontSize: 22, color: COLORS.textMuted, fontWeight: '600' },
  roomName:  { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  badge:     { backgroundColor: COLORS.bgHover, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { fontSize: 12, color: COLORS.textMuted },
  list:      { padding: 14, paddingBottom: 6, flexGrow: 1, justifyContent: 'flex-end' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
