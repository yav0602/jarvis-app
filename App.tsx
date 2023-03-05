import { useCallback, useState, useMemo, useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import domtoimage from "dom-to-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import Button from "./components/Button";
import ImageViewer from "./components/ImageViewer";
import IconButton from "./components/IconButton";
import CircleButton from "./components/CircleButton";
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from "./components/EmojiList";
import EmojiSticker from "./components/EmojiSticker";

const PlaceholderImage = require("./assets/images/background-image.png");

const pickImageAsync = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    return result;
  } else {
    throw new Error("You canceled action");
  }
};

export default function App() {
  const [pickedEmoji, setPickedEmoji] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [status, requestPermissions] = MediaLibrary.usePermissions();

  const imageRef = useRef<View>(null);

  useMemo(() => {
    if (status === null) {
      requestPermissions();
    }
  }, [status]);

  const pickImage = useCallback(() => {
    pickImageAsync()
      .then((result) => {
        setShowAppOptions(true);
        setSelectedImage(result.assets[0].uri);
      })
      .catch(console.log);
  }, []);

  const onReset = () => {
    setPickedEmoji(null);
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      domtoimage
        .toJpeg(imageRef.current as unknown as Node, {
          quality: 0.95,
          width: 320,
          height: 440,
        })
        .then((dataUrl) => {
          let link = document.createElement("a");
          link.download = "sticker-smash.jpeg";
          link.href = dataUrl;
          link.click();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View ref={imageRef} style={styles.imageContainer}>
        <ImageViewer
          placeholderImageSource={PlaceholderImage}
          selectedImage={selectedImage}
        />
        {pickedEmoji ? (
          <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
        ) : null}
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button label="Choose a photo" theme="primary" onPress={pickImage} />
          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onCloseModal={onModalClose} onSelect={setPickedEmoji} />
      </EmojiPicker>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
