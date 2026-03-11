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
  const { patients, load, add, update, remove } = usePatients();
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
      navigation.setParams({ newPatient: undefined });
    }
  }, [route.params?.newPatient, isLoaded, add, navigation]);

  // Handle updated patient from edit flow
  useEffect(() => {
    const updatedPatient = route.params?.updatedPatient;
    if (updatedPatient && isLoaded) {
      update(updatedPatient);
      navigation.setParams({ updatedPatient: undefined });
    }
  }, [route.params?.updatedPatient, isLoaded, update, navigation]);

  // Handle removed patient from ViewPatient
  useEffect(() => {
    const removedId = route.params?.removedPatientId;
    if (removedId && isLoaded) {
      remove(removedId);
      navigation.setParams({ removedPatientId: undefined } as never);
    }
  }, [route.params?.removedPatientId, isLoaded, remove, navigation]);

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
        onPress={(p, origin) =>
          navigation.navigate("ViewPatient", {
            patient: p,
            allPatients: patients,
            tileOrigin: origin,
          })
        }
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
    gap: 12,
    marginBottom: 12,
  },
  addCard: {
    width: 175,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addIcon: {
    fontSize: 64,
    lineHeight: 64,
    color: "#391b59",
    fontWeight: "300",
  },
  addText: {
    fontFamily: "DMSans-Bold",
    fontSize: 12,
    color: "#391b59",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#b2b2b2",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tabActive: {
    borderBottomColor: "#303030",
  },
  tabText: {
    fontFamily: "DMSans-Regular",
    fontSize: 16,
    color: "#767676",
  },
  tabTextActive: {
    color: "#303030",
  },
});
