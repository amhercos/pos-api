import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { createRef, RefObject } from "react";

/**
 * Define exactly what the ref needs to support.
 * This satisfies both the Drawer trigger and Expo Router's navigation.
 */
export interface NavigationBridge {
  dispatch: DrawerNavigationProp<ParamListBase>["dispatch"];
  navigate: (name: string, params?: object) => void;
  closeDrawer: () => void;
}

export const drawerNavigationRef: RefObject<NavigationBridge | null> =
  createRef<NavigationBridge | null>();

/**
 * Strictly typed setter to sync the layout navigation with our global ref.
 */
export const setDrawerNavigation = (nav: NavigationBridge | null): void => {
  type Writeable<T> = { -readonly [P in keyof T]: T[P] };
  (drawerNavigationRef as Writeable<typeof drawerNavigationRef>).current = nav;
};
