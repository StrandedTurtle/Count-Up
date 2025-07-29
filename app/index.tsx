import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Dialog, Portal, Button, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple duration formatting
function formatDuration(ms: number) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function Index() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const loadStartTime = async () => {
      const storedStartTime = await AsyncStorage.getItem('startTime');
      if (storedStartTime) {
        const loadedStartTime = new Date(parseInt(storedStartTime, 10));
        setStartTime(loadedStartTime);
        setElapsedTime(new Date().getTime() - loadedStartTime.getTime());
      } else {
        const now = new Date();
        setStartTime(now);
        await AsyncStorage.setItem('startTime', now.getTime().toString());
      }
    };

    loadStartTime();
  }, []);

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      setElapsedTime(new Date().getTime() - startTime.getTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  const handleReset = async () => {
    const now = new Date();
    setStartTime(now);
    await AsyncStorage.setItem('startTime', now.getTime().toString());
    hideDialog();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      <Pressable onLongPress={showDialog} style={styles.pressable}>
        <Text variant="displayLarge" style={{ color: theme.colors.primary }}>
          {formatDuration(elapsedTime).split(' ')[0]}
        </Text>
        <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
          {formatDuration(elapsedTime).substring(formatDuration(elapsedTime).indexOf(' ') + 1)}
        </Text>
      </Pressable>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Reset Timer</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to reset the timer?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleReset}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});