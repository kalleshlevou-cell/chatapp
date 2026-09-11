import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import AuthScreen   from '../screens/AuthScreen';
import RoomsScreen  from '../screens/RoomsScreen';
import ChatScreen   from '../screens/ChatScreen';
import OnlineScreen from '../screens/OnlineScreen';
import { COLORS }   from '../utils/colors';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <ChatProvider>
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: COLORS.bgSecondary },
        headerTintColor:  COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        cardStyle:        { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="Rooms"  component={RoomsScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="Chat"   component={ChatScreen}   options={({ route }) => ({ title: `# ${route.params?.room}` })} />
      <Stack.Screen name="Online" component={OnlineScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </ChatProvider>
);

const AppNavigator = () => {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
