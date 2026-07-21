import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Icon, IconName } from './icon';

/**
 * Компонент для демонстрации всех доступных иконок
 * Используйте для тестирования и выбора нужных иконок
 */
export const IconShowcase: React.FC = () => {
  const icons: IconName[] = [
    'home',
    'search',
    'map',
    'car',
    'calendar',
    'user',
    'settings',
    'location',
    'phone',
    'email',
    'check',
    'close',
    'arrow-left',
    'arrow-right',
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Доступные иконки</Text>
      <View style={styles.grid}>
        {icons.map((iconName) => (
          <View key={iconName} style={styles.iconItem}>
            <Icon name={iconName} size={32} color="#007AFF" />
            <Text style={styles.iconName}>{iconName}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Разные размеры</Text>
      <View style={styles.row}>
        <Icon name="car" size={16} color="#007AFF" />
        <Icon name="car" size={24} color="#007AFF" />
        <Icon name="car" size={32} color="#007AFF" />
        <Icon name="car" size={48} color="#007AFF" />
      </View>

      <Text style={styles.sectionTitle}>Разные цвета</Text>
      <View style={styles.row}>
        <Icon name="location" size={32} color="#007AFF" />
        <Icon name="location" size={32} color="#34C759" />
        <Icon name="location" size={32} color="#FF3B30" />
        <Icon name="location" size={32} color="#FF9500" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconItem: {
    alignItems: 'center',
    width: 80,
  },
  iconName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
