import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SessionStatus } from '@/types/session';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function SessionStatusBadge({ status, size = 'md' }: SessionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Sedang Berlangsung':
        return {
          label: 'Sedang Berlangsung',
          bg: '#ECFDF5',
          border: '#10B981',
          text: '#065F46',
          dotBg: '#10B981',
          iconSymbol: '●',
        };
      case 'Belum Dibuka':
        return {
          label: 'Belum Dibuka',
          bg: '#FFFBEB',
          border: '#F59E0B',
          text: '#92400E',
          dotBg: '#F59E0B',
          iconSymbol: '○',
        };
      case 'Selesai':
      default:
        return {
          label: 'Selesai',
          bg: '#F1F5F9',
          border: '#64748B',
          text: '#334155',
          dotBg: '#64748B',
          iconSymbol: '✓',
        };
    }
  };

  const config = getStatusConfig();

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : isLarge ? 8 : 5,
          paddingHorizontal: isSmall ? 8 : isLarge ? 16 : 12,
          borderRadius: isLarge ? 12 : 8,
        },
      ]}>
      {status === 'Sedang Berlangsung' ? (
        <View style={styles.pulseContainer}>
          <View style={[styles.pulseDot, { backgroundColor: config.dotBg }]} />
        </View>
      ) : (
        <Text style={[styles.symbolText, { color: config.text, fontSize: isSmall ? 10 : 12 }]}>
          {config.iconSymbol}
        </Text>
      )}

      <Text
        style={[
          styles.labelText,
          {
            color: config.text,
            fontSize: isSmall ? 11 : isLarge ? 14 : 12,
            fontWeight: isLarge ? '700' : '600',
          },
        ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  symbolText: {
    fontWeight: '700',
    lineHeight: 14,
  },
  labelText: {
    letterSpacing: 0.2,
  },
});
