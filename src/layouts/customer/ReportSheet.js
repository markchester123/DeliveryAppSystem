import React, { useState } from 'react';
import { Text } from 'react-native';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import { TextField, Chip, ChipRow } from '../components/Inputs';
import { useToast } from '../components/Feedback';
import { type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { REPORT_CATEGORIES } from '../../data/constants';

export default function ReportSheet({ visible, onClose }) {
  const { actions } = useStore();
  const toast = useToast();
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [message, setMessage] = useState('');

  const send = () => {
    if (!message.trim()) { toast('Tell us what happened'); return; }
    actions.createReport(category, message.trim());
    setMessage(''); setCategory(REPORT_CATEGORIES[0]);
    onClose();
    toast('Report sent');
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Report a problem">
      <ChipRow style={{ marginBottom: 16 }}>{REPORT_CATEGORIES.map((c) => <Chip key={c} label={c} selected={c === category} onPress={() => setCategory(c)} />)}</ChipRow>
      <TextField label="What happened?" value={message} onChangeText={setMessage} multiline />
      <Button title="Send" variant="primary" block onPress={send} />
    </Sheet>
  );
}
