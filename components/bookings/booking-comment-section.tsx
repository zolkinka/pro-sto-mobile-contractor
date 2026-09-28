import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BOOKING_CONTENT_WIDTH, BOOKING_MUTED_COLOR } from '@/constants/bookings';
import { theme } from '@/constants/theme';

interface BookingCommentSectionProps {
  comment: string | null | undefined;
}

export function BookingCommentSection({ comment }: BookingCommentSectionProps) {
  const trimmed = comment?.trim();
  const hasComment = Boolean(trimmed);

  return (
    <View style={styles.card}>
      <AppText weight="semiBold" style={styles.sectionTitle}>
        Комментарий:
      </AppText>
      <AppText style={[styles.commentText, !hasComment && styles.commentPlaceholder]}>
        {hasComment ? trimmed : 'Комментарий не указан'}
      </AppText>
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
  commentText: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[900],
  },
  commentPlaceholder: {
    color: BOOKING_MUTED_COLOR,
  },
});
