import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { BOOKING_CONTENT_WIDTH, BOOKING_MUTED_COLOR, ICON_CARET_COLOR } from '@/constants/bookings';
import { theme } from '@/constants/theme';
import type { BookingServiceView } from '@/types/bookings';

interface BookingServicesSectionProps {
  services: BookingServiceView[];
}

export function BookingServicesSection({ services }: BookingServicesSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const serviceIdsKey = services.map((service) => service.uuid).join(',');

  useEffect(() => {
    const firstUuid = serviceIdsKey.split(',')[0];
    setExpandedIds(firstUuid ? new Set([firstUuid]) : new Set());
  }, [serviceIdsKey]);

  const toggleService = (uuid: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <AppText weight="semiBold" style={styles.sectionTitle}>
        Услуги:
      </AppText>
      {services.map((service, index) => {
        const isExpanded = expandedIds.has(service.uuid);
        const isLast = index === services.length - 1;
        const description = service.description?.trim();

        return (
          <View key={service.uuid} style={[styles.item, !isLast && styles.itemDivider]}>
            <Pressable onPress={() => toggleService(service.uuid)} style={styles.itemHeader}>
              <AppText style={styles.itemTitle}>{service.name ?? 'Услуга'}</AppText>
              <Icon
                name={isExpanded ? 'caret-up' : 'caret-down'}
                size={18}
                color={ICON_CARET_COLOR}
              />
            </Pressable>
            {isExpanded ? (
              <AppText style={[styles.itemDescription, !description && styles.itemDescriptionEmpty]}>
                {description || 'Описание не указано'}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: BOOKING_CONTENT_WIDTH,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    paddingTop: 16,
    paddingRight: 24,
    paddingBottom: 20,
    paddingLeft: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: theme.colors.gray[900],
  },
  item: {
    gap: 8,
    paddingBottom: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[900],
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 16.8,
    color: theme.colors.gray[700],
  },
  itemDescriptionEmpty: {
    color: BOOKING_MUTED_COLOR,
  },
});
