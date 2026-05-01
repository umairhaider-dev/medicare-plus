import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { reportsAPI } from '../../api/reports.api';
import { COLORS }     from '../../constants';

const StatRow = ({ label, value, color }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
  </View>
);

export default function ReportsScreen() {
  const [dashboard,  setDashboard]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await reportsAPI.getDashboard();
      setDashboard(res.data.dashboard);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const d = dashboard || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.topbar}>
        <Text style={styles.heading}>Reports</Text>
        <Text style={styles.sub}>Analytics Overview</Text>
      </View>

      <View style={styles.content}>

        {/* Patients */}
        <Text style={styles.sectionTitle}>Patients</Text>
        <View style={styles.card}>
          <StatRow label="Total Patients"     value={d.patients?.total    || 0} />
          <View style={styles.divider} />
          <StatRow label="New This Month"     value={d.patients?.newMonth || 0} color={COLORS.primary} />
          <View style={styles.divider} />
          <StatRow label="New Today"          value={d.patients?.newToday || 0} color={COLORS.green} />
        </View>

        {/* Appointments */}
        <Text style={styles.sectionTitle}>Appointments</Text>
        <View style={styles.card}>
          <StatRow label="Today"        value={d.appointments?.today || 0} />
          <View style={styles.divider} />
          <StatRow label="This Month"   value={d.appointments?.month || 0} color={COLORS.primary} />
          <View style={styles.divider} />
          <StatRow label="Completed"    value={d.appointments?.completed || 0} color={COLORS.green} />
          <View style={styles.divider} />
          <StatRow label="Cancelled"    value={d.appointments?.cancelled || 0} color={COLORS.red} />
        </View>

        {/* Revenue */}
        <Text style={styles.sectionTitle}>Revenue</Text>
        <View style={styles.card}>
          <StatRow
            label="Today"
            value={'Rs ' + (d.revenue?.today || 0).toLocaleString()}
            color={COLORS.primary}
          />
          <View style={styles.divider} />
          <StatRow
            label="This Month"
            value={'Rs ' + (d.revenue?.month || 0).toLocaleString()}
            color={COLORS.green}
          />
        </View>

        {/* Pharmacy */}
        <Text style={styles.sectionTitle}>Pharmacy</Text>
        <View style={styles.card}>
          <StatRow label="Total Medicines" value={d.pharmacy?.totalMedicines || 0} />
          <View style={styles.divider} />
          <StatRow label="Low Stock"       value={d.pharmacy?.lowStock || 0} color={COLORS.amber} />
          <View style={styles.divider} />
          <StatRow label="Expiring Soon"   value={d.pharmacy?.expiringSoon || 0} color={COLORS.red} />
        </View>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topbar: {
    backgroundColor: COLORS.navy, paddingTop: 52, paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heading: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:     { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
  },
  statLabel: { fontSize: 14, color: COLORS.slate, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  divider:   { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
});
