import { theme } from '@/constants/theme';
import type { BookingStatus } from '@/types/bookings';

/** Content width from Figma (358px on 390px screen with 16px side margins). */
export const BOOKING_CONTENT_WIDTH = 358;

/** Bottom sticky overlay from Figma (390×176 gradient fade). */
export const BOTTOM_OVERLAY_HEIGHT = 176;
export const BOTTOM_OVERLAY_FADE_HEIGHT = 72;
export const BOTTOM_OVERLAY_CONTENT_PADDING = 36;
export const BOTTOM_OVERLAY_CONTENT_GAP = 10;

/** Order details footer: primary 50 + gap 10 + secondary 44. */
export const ORDER_DETAILS_FOOTER_CONTENT_HEIGHT = 104;

/** Muted text/icons for time and box rows in client card (Figma #73716F). */
export const BOOKING_MUTED_COLOR = '#73716F';

/** Figma Direction-left 01 outline stroke color. */
export const ICON_DIRECTION_LEFT_COLOR = '#53514F';

/** Figma CaretUp / CaretDown outline stroke color. */
export const ICON_CARET_COLOR = '#302F2D';

/** Lower value = higher in list (pending first). */
export const BOOKING_STATUS_SORT_ORDER: Record<BookingStatus, number> = {
  pending_confirmation: 0,
  confirmed: 1,
  completed: 2,
  cancelled: 3,
};

/** Card background colors aligned with HomeScreenStub mock and service-admin status semantics. */
export const BOOKING_STATUS_CARD_COLORS: Record<BookingStatus, string> = {
  pending_confirmation: '#E8E4FF',
  confirmed: '#DDF4E8',
  completed: theme.colors.gray[100],
  cancelled: theme.colors.gray[100],
};

export function getBookingCardBackgroundColor(status: BookingStatus): string {
  return BOOKING_STATUS_CARD_COLORS[status] ?? theme.colors.gray[100];
}
