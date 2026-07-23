import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PermissionFooter } from '@/components/permissions/permission-footer';
import { PermissionHeader } from '@/components/permissions/permission-header';
import { AppText } from '@/components/ui/app-text';
import { PERMISSIONS_CONTENT_WIDTH } from '@/constants/permissions';
import { theme } from '@/constants/theme';

interface PermissionScreenLayoutProps {
  titleLine1: string;
  titleLine2: string;
  step: string;
  subtitle: string;
  image: ImageSourcePropType;
  onBackPress?: () => void;
  onRequest: () => void;
  onLater: () => void;
  isRequesting?: boolean;
}

export function PermissionScreenLayout({
  titleLine1,
  titleLine2,
  step,
  subtitle,
  image,
  onBackPress,
  onRequest,
  onLater,
  isRequesting = false,
}: PermissionScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <PermissionHeader onBackPress={onBackPress} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.textBlock}>
              <AppText weight="medium" style={styles.title}>
                {titleLine1}
                {'\n'}
                {titleLine2}{' '}
                <AppText weight="medium" style={styles.step}>
                  {step}
                </AppText>
              </AppText>
              <AppText style={styles.subtitle}>{subtitle}</AppText>
            </View>

            <Image source={image} style={styles.image} resizeMode="cover" />
          </View>
        </ScrollView>

        <PermissionFooter
          onRequest={onRequest}
          onLater={onLater}
          isRequesting={isRequesting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  page: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scroll: {
    flex: 1,
    width: PERMISSIONS_CONTENT_WIDTH,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingTop: 24,
    gap: 24,
    flex: 1,
  },
  textBlock: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 28.8,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  step: {
    fontSize: 24,
    lineHeight: 28.8,
    color: theme.colors.gray[600],
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 19.2,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
  },
});
