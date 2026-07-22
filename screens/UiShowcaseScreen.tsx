import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  AppButton,
  AppCardContainer,
  AppChip,
  AppDrawer,
  AppInput,
  AppRadio,
  AppSlider,
  AppSwitch,
  AppToast,
  Collapsible,
  ColorPicker,
  LoadingDots,
  OnboardingIndicators,
  Skeleton,
} from '@/components';
import { theme } from '@/constants/theme';

export function UiShowcaseScreen() {
  const [inputValue, setInputValue] = useState('');
  const [selectedChip, setSelectedChip] = useState('wash');
  const [radioValue, setRadioValue] = useState('option-a');
  const [switchEnabled, setSwitchEnabled] = useState(true);
  const [sliderValue, setSliderValue] = useState(1500);
  const [selectedColor, setSelectedColor] = useState<string | null>('red');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Pro-Sto Contractors UI</ThemedText>
        <ThemedText style={styles.subtitle}>
          Переиспользуемые компоненты из pro-sto-mobile-client
        </ThemedText>

        <Section title="Кнопки">
          <AppButton label="Primary" onPress={() => {}} />
          <View style={styles.gap} />
          <AppButton label="Secondary" variant="secondary" onPress={() => {}} />
          <View style={styles.gap} />
          <AppButton label="Disabled" disabled onPress={() => {}} />
        </Section>

        <Section title="Поля ввода">
          <AppInput
            label="Телефон"
            placeholder="+7 (___) ___-__-__"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <View style={styles.gap} />
          <AppInput
            label="Email"
            placeholder="email@example.com"
            error="Некорректный email"
          />
        </Section>

        <Section title="Chips">
          <View style={styles.row}>
            <AppChip
              label="Мойка"
              active={selectedChip === 'wash'}
              onPress={() => setSelectedChip('wash')}
            />
            <AppChip
              label="Шиномонтаж"
              active={selectedChip === 'tire'}
              onPress={() => setSelectedChip('tire')}
            />
          </View>
        </Section>

        <Section title="Radio">
          <View style={styles.radioRow}>
            <AppRadio
              selected={radioValue === 'option-a'}
              onPress={() => setRadioValue('option-a')}
            />
            <AppText style={styles.radioLabel}>Вариант A</AppText>
          </View>
          <View style={styles.radioRow}>
            <AppRadio
              selected={radioValue === 'option-b'}
              onPress={() => setRadioValue('option-b')}
            />
            <AppText style={styles.radioLabel}>Вариант B</AppText>
          </View>
        </Section>

        <Section title="Switch">
          <View style={styles.radioRow}>
            <AppSwitch value={switchEnabled} onValueChange={setSwitchEnabled} />
            <AppText style={styles.radioLabel}>Уведомления</AppText>
          </View>
        </Section>

        <Section title="Slider">
          <AppSlider
            min={500}
            max={5000}
            step={100}
            value={sliderValue}
            onChange={setSliderValue}
            formatValue={(value) => `${value} ₽`}
          />
        </Section>

        <Section title="Color picker">
          <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />
        </Section>

        <Section title="Skeleton">
          <Skeleton width="100%" height={16} />
          <View style={styles.gap} />
          <Skeleton width="70%" height={16} />
          <View style={styles.gap} />
          <Skeleton width="100%" height={80} borderRadius={16} />
        </Section>

        <Section title="Toast">
          <AppButton label="Показать toast" onPress={() => setToastVisible(true)} />
        </Section>

        <Section title="Onboarding">
          <OnboardingIndicators total={4} current={onboardingStep} />
          <View style={styles.row}>
            <AppButton
              label="Назад"
              size="small"
              variant="secondary"
              onPress={() => setOnboardingStep((step) => Math.max(0, step - 1))}
            />
            <AppButton
              label="Далее"
              size="small"
              onPress={() => setOnboardingStep((step) => Math.min(3, step + 1))}
            />
          </View>
        </Section>

        <Section title="Loading">
          <LoadingDots />
        </Section>

        <Section title="Card">
          <AppCardContainer>
            <AppText style={styles.cardTitle}>Карточка контрагента</AppText>
            <AppText style={styles.cardText}>Пример контента внутри AppCardContainer</AppText>
          </AppCardContainer>
        </Section>

        <Section title="Collapsible">
          <Collapsible title="Дополнительная информация">
            <ThemedText>Скрытый контент, который можно раскрыть.</ThemedText>
          </Collapsible>
        </Section>

        <Section title="Drawer">
          <AppButton label="Открыть drawer" onPress={() => setDrawerVisible(true)} />
        </Section>
      </ScrollView>

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Пример drawer"
        footer={<AppButton label="Закрыть" onPress={() => setDrawerVisible(false)} />}>
        <ThemedText>
          Bottom sheet из клиентского приложения. Подходит для форм и деталей заказа.
        </ThemedText>
      </AppDrawer>

      <AppToast
        visible={toastVisible}
        message="Изменения сохранены"
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 8,
    color: theme.colors.gray[600],
  },
  section: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[900],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioLabel: {
    fontSize: 16,
    color: theme.colors.gray[800],
  },
  gap: {
    height: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
});
