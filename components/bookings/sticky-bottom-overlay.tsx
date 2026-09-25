import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FooterFade } from '@/components/bookings/footer-fade';
import {
  BOOKING_CONTENT_WIDTH,
  BOTTOM_OVERLAY_CONTENT_GAP,
  BOTTOM_OVERLAY_CONTENT_PADDING,
  BOTTOM_OVERLAY_FADE_HEIGHT,
  BOTTOM_OVERLAY_HEIGHT,
} from '@/constants/bookings';
import { theme } from '@/constants/theme';

type StickyBottomOverlayVariant = 'floating' | 'solidFooter';

interface StickyBottomOverlayProps {
  children: React.ReactNode;
  /** floating — меню поверх градиента (список). solidFooter — белая панель + кнопки (детали). */
  variant?: StickyBottomOverlayVariant;
  bottomPadding?: number;
  contentGap?: number;
  contentWidth?: number;
  fadeHeight?: number;
  contentHeight?: number;
  style?: ViewStyle;
}

export function StickyBottomOverlay({
  children,
  variant = 'solidFooter',
  bottomPadding = BOTTOM_OVERLAY_CONTENT_PADDING,
  contentGap = BOTTOM_OVERLAY_CONTENT_GAP,
  contentWidth = BOOKING_CONTENT_WIDTH,
  fadeHeight = BOTTOM_OVERLAY_FADE_HEIGHT,
  contentHeight,
  style,
}: StickyBottomOverlayProps) {
  const insets = useSafeAreaInsets();
  const resolvedBottomPadding = Math.max(insets.bottom, bottomPadding);

  if (variant === 'floating') {
    const overlayHeight = BOTTOM_OVERLAY_HEIGHT + resolvedBottomPadding;

    return (
      <View
        pointerEvents="box-none"
        style={[styles.overlay, styles.floatingOverlay, { height: overlayHeight }, style]}>
        <View pointerEvents="none" style={[styles.floatingFade, { height: overlayHeight }]}>
          <FooterFade height={overlayHeight} />
        </View>

        <View
          pointerEvents="box-none"
          style={[styles.floatingContent, { paddingBottom: resolvedBottomPadding }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={[styles.overlay, style]}>
      <View pointerEvents="none" style={[styles.fadeLayer, { height: fadeHeight }]}>
        <FooterFade height={fadeHeight} />
      </View>

      <View
        style={[
          styles.solidPanel,
          {
            paddingBottom: resolvedBottomPadding,
          },
        ]}>
        <View
          style={[
            styles.content,
            {
              width: contentWidth,
              gap: contentGap,
              minHeight: contentHeight,
            },
          ]}>
          {children}
        </View>
      </View>
    </View>
  );
}

export function getBottomOverlayScrollPadding(
  safeAreaBottom = 0,
  contentHeight = 104,
  variant: StickyBottomOverlayVariant = 'solidFooter',
): number {
  const bottomInset = Math.max(safeAreaBottom, BOTTOM_OVERLAY_CONTENT_PADDING);

  if (variant === 'floating') {
    return BOTTOM_OVERLAY_HEIGHT + Math.max(safeAreaBottom, 16) + 8;
  }

  return BOTTOM_OVERLAY_FADE_HEIGHT + contentHeight + bottomInset;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },
  floatingOverlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  floatingFade: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  floatingContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fadeLayer: {
    width: '100%',
  },
  solidPanel: {
    width: '100%',
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
});
