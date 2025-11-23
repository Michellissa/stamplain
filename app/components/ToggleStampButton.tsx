import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ToggleStampButtonProps {
  onStamp: (type: "IN" | "OUT") => void;
}

export default function ToggleStampButton({ onStamp }: ToggleStampButtonProps) {
  const [stampedIn, setStampedIn] = useState(false);

  const handlePress = () => {
    const type = stampedIn ? "OUT" : "IN";
    setStampedIn(!stampedIn);
    onStamp(type);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.circleButton, { backgroundColor: stampedIn ? "red" : "green" }]}
    >
      <Text style={styles.buttonText}>{stampedIn ? "Stämpla UT" : "Stämpla IN"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
