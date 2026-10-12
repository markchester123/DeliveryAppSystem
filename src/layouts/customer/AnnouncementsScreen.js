import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Image, Pressable, Modal, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Button from '../components/Button';
import { TextField } from '../components/Inputs';
import Icon from '../components/Icon';
import { EmptyState, useToast } from '../components/Feedback';
import { colors, type, radius } from '../theme';
import { useAuth, can } from '../../users';
import { useStore } from '../../data/StoreContext';

const when = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

// Shrink a picked photo to ~640px wide JPEG so it fits inside a Firestore document. Returns base64.
async function shrink(uri) {
  const M = ImageManipulator;
  if (M.ImageManipulator && M.ImageManipulator.manipulate) {
    const ctx = M.ImageManipulator.manipulate(uri);
    ctx.resize({ width: 640 });
    const ref = await ctx.renderAsync();
    const out = await ref.saveAsync({ format: M.SaveFormat.JPEG, compress: 0.6, base64: true });
    return out.base64;
  }
  const out = await M.manipulateAsync(uri, [{ resize: { width: 640 } }], { compress: 0.6, format: M.SaveFormat.JPEG, base64: true });
  return out.base64;
}

// Full view of one announcement: whole photo, date and the complete message.
function AnnouncementDetail({ item, onClose }) {
  return (
    <Modal visible={!!item} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={{ maxHeight: '90%', backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: 18 }}>
          {item ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[type.small, { fontWeight: '700', flex: 1 }]}>{when(item.date)}</Text>
                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={22} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[type.title, { marginBottom: 10 }]}>{item.title}</Text>
                {item.image ? <Image source={{ uri: item.image }} style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.line, marginBottom: 12 }} resizeMode="contain" /> : null}
                {item.body ? <Text style={type.body}>{item.body}</Text> : null}
                <View style={{ height: 16 }} />
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Composer() {
  const { actions } = useStore();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets || !res.assets.length) return;
      const b64 = await shrink(res.assets[0].uri);
      if (!b64 || b64.length > 700000) { toast('That photo is too large. Try another one.'); return; }
      setImage(`data:image/jpeg;base64,${b64}`);
    } catch (e) {
      toast('Could not load that photo');
    }
  };

  const post = async () => {
    if (!title.trim()) { toast('Add a title first'); return; }
    setBusy(true);
    try {
      await actions.postAnnouncement({ title, body, image });
      setTitle(''); setBody(''); setImage(null);
      toast('Announcement posted');
    } catch (e) {
      toast('Could not post. Check your connection.');
    }
    setBusy(false);
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 16 }}>
      <Text style={[type.heading, { marginBottom: 10 }]}>New announcement</Text>
      <TextField label="Title" value={title} onChangeText={setTitle} maxLength={80} />
      <TextField label="Message" value={body} onChangeText={setBody} multiline maxLength={600} />
      {image ? <Image source={{ uri: image }} style={{ width: '100%', height: 180, borderRadius: radius.md, marginBottom: 12, backgroundColor: colors.line }} resizeMode="cover" /> : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Button icon="image" title={image ? 'Change photo' : 'Add photo'} onPress={pick} /></View>
        {image ? <View style={{ flex: 1 }}><Button icon="x" title="Remove photo" onPress={() => setImage(null)} /></View> : null}
      </View>
      <View style={{ marginTop: 10 }}>
        <Button variant="primary" block disabled={busy} title={busy ? 'Posting…' : 'Post announcement'} onPress={post} />
      </View>
    </View>
  );
}

export default function AnnouncementsScreen({ scroll = true }) {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const canPost = can(user, 'announce.post');
  const [openId, setOpenId] = useState(null);
  const opened = state.announcements.find((a) => a.id === openId) || null;

  // Remember which posts were new when this screen opened, so they can wear a "NEW" tag.
  const fresh = useRef(new Set());
  if (state.seenLoaded) state.announcements.forEach((a) => { if (!state.seen.includes(a.id)) fresh.current.add(a.id); });

  // Opening this screen counts as reading everything on it.
  useEffect(() => {
    if (state.seenLoaded) actions.markAnnouncementsSeen();
  }, [state.announcements, state.seenLoaded]);

  const content = (
    <View>
      {canPost ? <Composer /> : null}
      {state.announcements.length ? state.announcements.map((a) => (
        <View key={a.id} style={{ marginBottom: 16 }}>
          <Text style={[type.small, { fontWeight: '700', marginBottom: 6 }]}>{when(a.date)}</Text>
          <Pressable onPress={() => setOpenId(a.id)} accessibilityRole="button" accessibilityLabel={`Open announcement: ${a.title}`} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: fresh.current.has(a.id) ? colors.primary : colors.line, overflow: 'hidden' }}>
            {a.image ? <Image source={{ uri: a.image }} style={{ width: '100%', height: 200, backgroundColor: colors.line }} resizeMode="cover" /> : null}
            <View style={{ padding: 14, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[type.heading, { flex: 1 }]}>{a.title}</Text>
                {fresh.current.has(a.id) ? (
                  <View style={{ backgroundColor: colors.danger, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>NEW</Text>
                  </View>
                ) : null}
              </View>
              {a.body ? <Text numberOfLines={3} style={type.body}>{a.body}</Text> : null}
              <Text style={[type.small, { color: colors.primary, fontWeight: '600' }]}>Tap to read more</Text>
            </View>
          </Pressable>
        </View>
      )) : <EmptyState>No announcements yet.</EmptyState>}
      <AnnouncementDetail item={opened} onClose={() => setOpenId(null)} />
    </View>
  );

  return scroll
    ? <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">{content}</ScrollView>
    : content;
}