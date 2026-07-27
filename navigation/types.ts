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
  UiShowcase: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Permissions: undefined;
  Main: undefined;
};
