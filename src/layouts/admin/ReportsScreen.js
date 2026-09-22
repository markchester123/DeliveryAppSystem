import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Pill from '../components/Pill';
import Button from '../components/Button';
import { Chip, ChipRow, TextField } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { PageTitle } from './parts';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { timeText } from '../../utils/format';

const LABEL = { open: 'Open', progress: 'In progress', resolved: 'Resolved' };

function ReportRow({ r, hasChat, onChat }) {
  const { actions } = useStore();
  const toast = useToast();
  const [note, setNote] = useState('');
  return (
    <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Text style={type.heading}>{r.category}</Text>
        <Pill status={r.status} label={LABEL[r.status]} />
      </View>
      <Text style={type.small}>{r.id} · {r.order} · {r.by} · {timeText(r.t)}</Text>
      <Text style={type.body}>{r.message}</Text>
      {r.note ? <Text style={[type.body, { color: colors.primary }]}>✓ {r.note}</Text> : null}
      {r.status !== 'resolved' ? (
        <View style={{ marginTop: 6 }}>
          <TextField value={note} onChangeText={setNote} placeholder="Note (optional)" style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {r.status === 'open' ? <Button small title="Start" onPress={() => actions.startReport(r.id)} /> : null}
            <Button small variant="primary" title="Resolve" onPress={() => { actions.resolveReport(r.id, note); toast(`${r.id} resolved`); }} />
            {hasChat ? <Button small icon="message-circle" title="Chat" onPress={onChat} /> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function ReportsScreen({ openChat }) {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const rows = state.reports.filter((r) => filter === 'all' || r.status === filter);
  return (
    <View>
      <PageTitle>Reports</PageTitle>
      <ChipRow style={{ marginBottom: 4 }}>{[['all', 'All'], ['open', 'Open'], ['progress', 'In progress'], ['resolved', 'Resolved']].map(([k, l]) => <Chip key={k} label={l} selected={filter === k} onPress={() => setFilter(k)} />)}</ChipRow>
      {rows.map((r) => <ReportRow key={r.id} r={r} hasChat={!!state.chats[r.order]} onChat={() => openChat(r.order)} />)}
      {!rows.length ? <EmptyState>No reports.</EmptyState> : null}
    </View>
  );
}
