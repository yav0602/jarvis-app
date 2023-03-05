import { View, Image, ImageSourcePropType, Platform } from "react-native";
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withTiming,
} from "react-native-reanimated";

export interface EmojiStickerProps {
  imageSize: number;
  stickerSource: ImageSourcePropType;
}

if (Platform.OS === "web") {
  // @ts-ignore
  window._frameTimestamp = null;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function EmojiSticker({
  imageSize,
  stickerSource,
}: EmojiStickerProps) {
  const scaleImage = useSharedValue<number>(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleDoubleTap =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
      onActive() {
        if (scaleImage.value) {
          scaleImage.value = scaleImage.value * 2;
        }
      },
    });

  const handleDrag = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { translateX: number; translateY: number }
  >({
    onStart(_, context) {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive(event, context) {
      translateX.value = event.translationX + context.translateX;
      translateY.value = event.translationY + context.translateY;
    },
  });

  const imageStyle = useAnimatedStyle(() => ({
    width: withTiming(scaleImage.value),
    height: withTiming(scaleImage.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      {
        translateY: translateY.value,
      },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={handleDrag}>
      <AnimatedView style={[containerStyle, { top: -350 }]}>
        <TapGestureHandler onGestureEvent={handleDoubleTap} numberOfTaps={2}>
          <AnimatedImage
            source={stickerSource}
            resizeMode="contain"
            style={[{ width: imageSize, height: imageSize }, imageStyle]}
          />
        </TapGestureHandler>
      </AnimatedView>
    </PanGestureHandler>
  );
}
