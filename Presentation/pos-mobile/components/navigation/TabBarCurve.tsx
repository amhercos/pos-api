import React, { memo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

export const TabBarCurve = memo((): React.JSX.Element => {
  // useWindowDimensions makes the component re-render on rotation
  const { width } = useWindowDimensions();

  const line = `
    M 0 0
    L ${width / 2 - 45} 0
    C ${width / 2 - 30} 0, ${width / 2 - 25} 35, ${width / 2} 35
    C ${width / 2 + 25} 35, ${width / 2 + 30} 0, ${width / 2 + 45} 0
    L ${width} 0
    L ${width} 80
    L 0 80
    Z
  `;

  return (
    <View style={[styles.container, { width }]} pointerEvents="none">
      <Svg width={width} height={80}>
        <Path d={line} fill="white" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent",
  },
});

TabBarCurve.displayName = "TabBarCurve";
