import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OrdensScreen from '../screens/OrdensScreen';
import DetalhesScreen from '../screens/DetalhesScreen';
import { Button, colors, styles } from '../components/ui';

const Stack = createNativeStackNavigator();
export default function AppNavigator({ logado, setLogado, repositorio }) {
  return <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg } }}>
        {!logado ? <Stack.Screen name="Login" options={{ headerShown: false }}>{() => <SafeAreaView style={styles.page}><LoginScreen onLogin={() => setLogado(true)} /></SafeAreaView>}</Stack.Screen> : <>
          <Stack.Screen name="Ordens" options={{ title: 'GaMa Mobile', headerRight: () => <Button secondary title="Sair" onPress={() => setLogado(false)} /> }}>{props => <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.page}><OrdensScreen {...props} repositorio={repositorio} /></SafeAreaView>}</Stack.Screen>
          <Stack.Screen name="Historico" options={{ title: 'Histórico' }}>{props => <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.page}><OrdensScreen {...props} historico repositorio={repositorio} /></SafeAreaView>}</Stack.Screen>
          <Stack.Screen name="Detalhes" options={{ title: 'Atendimento' }}>{props => <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.page}><DetalhesScreen {...props} repositorio={repositorio} /></SafeAreaView>}</Stack.Screen>
        </>}
      </Stack.Navigator>
    </NavigationContainer>;
}
