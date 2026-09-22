import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import Screen from '../components/Screen';
import Frame from '../components/Frame';
import AppHeader, { IconButton } from '../components/AppHeader';
import BottomTabs from '../components/BottomTabs';
import AccountSheet from '../components/AccountSheet';
import JobsScreen from './JobsScreen';
import DeliveryScreen from './DeliveryScreen';
import DriverChatScreen from './DriverChatScreen';
import { colors } from '../theme';

const TABS = [
  { key: 'jobs', label: 'Jobs', icon: 'list' },
  { key: 'delivery', label: 'Delivery', icon: 'truck' },
  { key: 'chat', label: 'Chat', icon: 'message-circle' },
];

export default function DriverLayout() {
  const [tab, setTab] = useState('jobs');
  const [online, setOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Screen background="#EFEAE2">
      <Frame>
        <AppHeader
          title={TABS.find((t) => t.key === tab).label}
          right={<>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>{online ? 'Online' : 'Offline'}</Text>
              <Switch value={online} onValueChange={setOnline} trackColor={{ false: '#CFC8BD', true: colors.primary }} thumbColor="#FFFFFF" activeThumbColor="#FFFFFF" accessibilityLabel="Online" />
            </View>
            <IconButton icon="menu" label="Account" onPress={() => setMenuOpen(true)} />
          </>}
        />
        {tab === 'jobs' && <JobsScreen online={online} onAccepted={() => setTab('delivery')} />}
        {tab === 'delivery' && <DeliveryScreen onMessage={() => setTab('chat')} onDone={() => setTab('jobs')} />}
        {tab === 'chat' && <DriverChatScreen />}
        <BottomTabs tabs={TABS} current={tab} onChange={setTab} />
      </Frame>
      <AccountSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </Screen>
  );
}
