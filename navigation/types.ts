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
  OrderDetails: {
    bookingUuid: string;
    postOrderNumber?: number | null;
  };
  QrScan: {
    bookingUuid?: string;
  };
  BookingCode: {
    bookingUuid?: string;
  };
  BookingPhone: {
    bookingUuid: string;
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
