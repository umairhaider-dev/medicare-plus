import React, { useEffect } from 'react';
import { NavigationContainer }       from '@react-navigation/native';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { COLORS }       from '../constants';

// Auth
import LoginScreen    from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Dashboard
import DashboardScreen from '../screens/Dashboard/DashboardScreen';

// Patients
import PatientListScreen   from '../screens/Patients/PatientListScreen';
import PatientDetailScreen from '../screens/Patients/PatientDetailScreen';
import AddPatientScreen    from '../screens/Patients/AddPatientScreen';

// Appointments
import AppointmentScreen    from '../screens/Appointments/AppointmentScreen';
import AddAppointmentScreen from '../screens/Appointments/AddAppointmentScreen';

// Pharmacy
import PharmacyScreen      from '../screens/Pharmacy/PharmacyScreen';
import PharmacySalesScreen from '../screens/Pharmacy/PharmacySalesScreen';
import AddMedicineScreen   from '../screens/Pharmacy/AddMedicineScreen';

// Reports
import ReportsScreen from '../screens/Reports/ReportsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ emoji, label, focused }) => (
  <View style={styles.tabIcon}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text
      style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.muted }]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login"    component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const PatientsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PatientList"   component={PatientListScreen} />
    <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    <Stack.Screen name="AddPatient"    component={AddPatientScreen} />
  </Stack.Navigator>
);

const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AppointmentList" component={AppointmentScreen} />
    <Stack.Screen name="AddAppointment"  component={AddAppointmentScreen} />
  </Stack.Navigator>
);

const PharmacyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PharmacyInventory" component={PharmacyScreen} />
    <Stack.Screen name="PharmacySales"     component={PharmacySalesScreen} />
    <Stack.Screen name="AddMedicine"       component={AddMedicineScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown:     false,
      tabBarShowLabel: false,
      tabBarStyle:     styles.tabBar,
    }}
  >
    <Tab.Screen name="Dashboard"   component={DashboardScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home"     focused={focused} /> }} />
    <Tab.Screen name="Patients"    component={PatientsStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Patients"  focused={focused} /> }} />
    <Tab.Screen name="Appointments" component={AppointmentsStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Schedule"  focused={focused} /> }} />
    <Tab.Screen name="Pharmacy"    component={PharmacyStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💊" label="Pharmacy"  focused={focused} /> }} />
    <Tab.Screen name="Reports"     component={ReportsScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Reports"   focused={focused} /> }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { token, isLoading, init } = useAuthStore();

  useEffect(() => { init(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading MediCare Plus...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 62, borderTopColor: COLORS.border,
    backgroundColor: COLORS.white, paddingBottom: 6, paddingTop: 4,
  },
  tabIcon:  { alignItems: 'center', gap: 2, width: 60 },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0, textAlign: 'center' },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white, gap: 12,
  },
  loadingText: { fontSize: 14, color: COLORS.muted, marginTop: 8 },
});
