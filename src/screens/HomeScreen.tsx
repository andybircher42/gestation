import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { CalendarView, Header, PatientCard } from "@/components";
import { usePatients } from "@/hooks";
import { Patient } from "@/storage";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type Tab = "patients" | "calendar";

/**
 *
 */
export default function HomeScreen({ navigation, route }: Props) {
  const { patients, load, add, remove } = usePatients();
  const [activeTab, setActiveTab] = useState<Tab>("patients");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    load()
      .then(() => setIsLoaded(true))
      .catch(console.error);
  }, [load]);

  // Handle new patient from AddPatient screen
  useEffect(() => {
    const newPatient = route.params?.newPatient;
    if (newPatient && isLoaded) {
      add({
        name: newPatient.name,
        edd: newPatient.edd,
        birthstone: newPatient.birthstone,
      });
      // Clear the param so it doesn't re-add on re-render
      navigation.setParams({ newPatient: undefined });
    }
  }, [route.params?.newPatient, isLoaded, add, navigation]);

  const handleAddPatient = () => {
    navigation.navigate("AddPatient", { patientCount: patients.length });
  };

  const handleDeletePatient = (patient: Patient) => {
    Alert.alert("Remove Patient", `Remove ${patient.name} from your list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => remove(patient.id),
      },
    ]);
  };

  const renderPatientItem = ({ item }: { item: Patient | "add" }) => {
    if (item === "add") {
      return (
        <Pressable style={styles.addCard} onPress={handleAddPatient}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Add a patient</Text>
        </Pressable>
      );
    }
    return (
      <PatientCard
        patient={item}
        onPress={() => {}}
        onLongPress={() => handleDeletePatient(item)}
      />
    );
  };

  // Data for the grid: patients + "add" button
  const gridData: (Patient | "add")[] = useMemo(
    () => [...patients, "add" as const],
    [patients],
  );

  return (
    <View style={styles.container}>
      <Header patientCount={patients.length} />

      <View style={styles.body}>
        {activeTab === "patients" ? (
          <FlatList
            data={gridData}
            renderItem={renderPatientItem}
            keyExtractor={(item) =>
              typeof item === "string" ? "add-btn" : item.id
            }
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
          />
        ) : (
          <CalendarView patients={patients} />
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "patients" && styles.tabActive]}
          onPress={() => setActiveTab("patients")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "patients" && styles.tabTextActive,
            ]}
          >
            Patients
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "calendar" && styles.tabActive]}
          onPress={() => setActiveTab("calendar")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "calendar" && styles.tabTextActive,
            ]}
          >
            Calendar
          </Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f1d6",
  },
  body: {
    flex: 1,
  },
  grid: {
    padding: 16,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addCard: {
    width: 175,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#391b59",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addIcon: {
    fontSize: 32,
    color: "#391b59",
    fontWeight: "300",
  },
  addText: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#391b59",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 20, // safe area
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#391b59",
  },
  tabText: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#999",
  },
  tabTextActive: {
    fontFamily: "DMSans-Bold",
    color: "#391b59",
  },
});
