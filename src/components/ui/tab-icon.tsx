import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type IconName =
  | 'dashboard'
  | 'calendar'
  | 'sesi'
  | 'presensi'
  | 'history'
  | 'arrow-left';

interface TabIconProps {
  name: IconName;
  color?: string;
  size?: number;
}

export function TabIcon({ name, color = '#FFFFFF', size = 24 }: TabIconProps) {
  switch (name) {
    case 'dashboard':
      return <MaterialIcons name="dashboard" size={size} color={color} />;
    case 'calendar':
      return <FontAwesome5 name="calendar-alt" size={size} color={color} />;
    case 'sesi':
      return <FontAwesome name="check-square-o" size={size} color={color} />;
    case 'presensi':
      return <Feather name="user-check" size={size} color={color} />;
    case 'history':
      return <FontAwesome5 name="history" size={size} color={color} />;
    case 'arrow-left':
    default:
      return <Feather name="arrow-left" size={size} color={color} />;
  }
}
