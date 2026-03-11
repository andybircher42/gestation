import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Patient } from "@/storage";

import AddPatientScreen from "../screens/AddPatientScreen";
import HomeScreen from "../screens/HomeScreen";
import LaunchScreen from "../screens/LaunchScreen";
import OnboardingScreen from "../screens/OnboardingScreen";

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  AddPatient: { patientCount?: number } | undefined;
  Home: { newPatient?: Patient } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 *
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Launch"
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#f0f1d6" },
        }}
      >
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
