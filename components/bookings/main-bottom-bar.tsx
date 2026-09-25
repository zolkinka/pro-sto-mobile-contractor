import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { theme } from '@/constants/theme';

export type MainBottomTab = 'profile' | 'bookings' | 'qr';

interface MainBottomBarProps {
  activeTab?: MainBottomTab;
  onTabPress?: (tab: MainBottomTab) => void;
}

interface TabConfig {
  id: MainBottomTab;
  icon: IconName;
}

const TABS: TabConfig[] = [
  { id: 'profile', icon: 'user-gear' },
  { id: 'bookings', icon: 'notification' },
  { id: 'qr', icon: 'qr-code-outline' },
];

const BAR_WIDTH = 198;
const BAR_HEIGHT = 56;
const BAR_PADDING_H = 35;
const BAR_GAP = 28;
const TAB_WIDTH = 24;
const TAB_ICON_SIZE = 22;
const ACTIVE_INDICATOR_GAP = 10;
const INDICATOR_WIDTH = 10;
const INDICATOR_HEIGHT = 1;
const ICON_SHIFT_UP = (ACTIVE_INDICATOR_GAP + INDICATOR_HEIGHT) / 2;

const TAB_INDICATOR_LEFTS = TABS.map((_, index) => {
  const centerX = BAR_PADDING_H + index * (TAB_WIDTH + BAR_GAP) + TAB_WIDTH / 2;
  return centerX - INDICATOR_WIDTH / 2;
});

const INDICATOR_TOP =
  (BAR_HEIGHT - TAB_ICON_SIZE - ACTIVE_INDICATOR_GAP - INDICATOR_HEIGHT) / 2 +
  TAB_ICON_SIZE +
  ACTIVE_INDICATOR_GAP;

const ANIMATION_CONFIG = {
  duration: 250,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

function getTabIndex(tab: MainBottomTab): number {
  return TABS.findIndex((item) => item.id === tab);
}

interface BottomTabButtonProps {
  tab: TabConfig;
  index: number;
  activeIndex: SharedValue<number>;
  isSelected: boolean;
  onPress: (tab: MainBottomTab) => void;
}

function BottomTabButton({
  tab,
  index,
  activeIndex,
  isSelected,
  onPress,
}: BottomTabButtonProps) {
  const iconStyle = useAnimatedStyle(() => {
    const progress = 1 - Math.min(1, Math.abs(activeIndex.value - index));

    return {
      transform: [{ translateY: -ICON_SHIFT_UP * progress }],
    };
  });

  return (
    <Pressable
      onPress={() => onPress(tab.id)}
      style={styles.bottomButton}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}>
      <Animated.View style={iconStyle}>
        <Icon name={tab.icon} size={TAB_ICON_SIZE} color={theme.colors.gray[50]} />
      </Animated.View>
    </Pressable>
  );
}

export function MainBottomBar({
  activeTab = 'bookings',
  onTabPress,
}: MainBottomBarProps) {
  const [selectedTab, setSelectedTab] = useState<MainBottomTab>(activeTab);
  const activeIndex = useSharedValue(getTabIndex(activeTab));

  useEffect(() => {
    setSelectedTab(activeTab);
    activeIndex.value = withTiming(getTabIndex(activeTab), ANIMATION_CONFIG);
  }, [activeTab, activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          activeIndex.value,
          TABS.map((_, index) => index),
          TAB_INDICATOR_LEFTS,
        ),
      },
    ],
  }));

  const handlePress = (tab: MainBottomTab) => {
    setSelectedTab(tab);
    activeIndex.value = withTiming(getTabIndex(tab), ANIMATION_CONFIG);
    onTabPress?.(tab);
  };

  return (
    <View style={styles.bottomBar}>
      {TABS.map((tab, index) => (
        <BottomTabButton
          key={tab.id}
          tab={tab}
          index={index}
          activeIndex={activeIndex}
          isSelected={tab.id === selectedTab}
          onPress={handlePress}
        />
      ))}

      <Animated.View
        pointerEvents="none"
        style={[styles.activeIndicator, indicatorStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    backgroundColor: theme.colors.gray[900],
    borderRadius: 24,
    paddingHorizontal: BAR_PADDING_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: BAR_GAP,
  },
  bottomButton: {
    width: TAB_WIDTH,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: INDICATOR_TOP,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 0,
    borderTopWidth: INDICATOR_HEIGHT,
    borderTopColor: '#FFFFFF',
  },
});
