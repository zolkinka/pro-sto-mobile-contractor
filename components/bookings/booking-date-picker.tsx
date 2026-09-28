import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { theme } from '@/constants/theme';
import { startOfDay } from '@/utils/booking-date';

interface BookingDatePickerProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

export function BookingDatePicker({
  visible,
  selectedDate,
  onClose,
  onConfirm,
}: BookingDatePickerProps) {
  const [draftDate, setDraftDate] = useState(startOfDay(selectedDate));

  useEffect(() => {
    if (visible) {
      setDraftDate(startOfDay(selectedDate));
    }
  }, [visible, selectedDate]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      onClose();
    }

    if (event.type === 'dismissed' || !date) {
      return;
    }

    const normalized = startOfDay(date);
    setDraftDate(normalized);

    if (Platform.OS === 'android') {
      onConfirm(normalized);
    }
  };

  const handleConfirm = () => {
    onConfirm(draftDate);
    onClose();
  };

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }

    return (
      <DateTimePicker
        value={draftDate}
        mode="date"
        display="default"
        onChange={handleChange}
        locale="ru-RU"
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <AppText weight="semiBold" style={styles.title}>
            Выберите дату
          </AppText>

          <DateTimePicker
            value={draftDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            locale="ru-RU"
            themeVariant="light"
            style={styles.picker}
          />

          <View style={styles.actions}>
            <AppButton
              label="Отмена"
              variant="secondary"
              size="medium"
              onPress={onClose}
              style={styles.actionButton}
            />
            <AppButton
              label="Готово"
              size="medium"
              onPress={handleConfirm}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(48, 47, 45, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.gray[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    fontSize: 17,
    color: theme.colors.gray[900],
    textAlign: 'center',
  },
  picker: {
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
