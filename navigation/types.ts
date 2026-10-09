export type AuthStackParamList = {
  Phone: undefined;
  Code: undefined;
};

export type PermissionStackParamList = {
  Camera: undefined;
  Notifications: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Support: undefined;
  ContactSupport: undefined;
  NotificationSettings: undefined;
  OrderDetails: {
    bookingUuid: string;
    postOrderNumber?: number | null;
  };
  QrScan: {
    bookingUuid?: string;
    fromMenu?: boolean;
  };
  BookingCode: {
    bookingUuid?: string;
    fromMenu?: boolean;
  };
  BookingConfirmed: {
    bookingUuid: string;
  };
  UiShowcase: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Permissions: undefined;
  Main: undefined;
};
