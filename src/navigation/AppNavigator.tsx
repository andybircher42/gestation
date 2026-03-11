import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Patient } from "@/storage";

import AddPatientScreen from "../screens/AddPatientScreen";
import HomeScreen from "../screens/HomeScreen";
import LaunchScreen from "../screens/LaunchScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ViewPatientScreen from "../screens/ViewPatientScreen";

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  AddPatient: { patientCount?: number; editPatient?: Patient } | undefined;
  Home:
    | {
        newPatient?: Patient;
        updatedPatient?: Patient;
        removedPatientId?: string;
      }
    | undefined;
  ViewPatient: {
    patient: Patient;
    allPatients: Patient[];
    tileOrigin?: { x: number; y: number; width: number; height: number };
  };
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
        <Stack.Screen
          name="ViewPatient"
          component={ViewPatientScreen}
          options={{ animation: "none" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
