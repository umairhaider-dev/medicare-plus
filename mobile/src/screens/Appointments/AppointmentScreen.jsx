import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { appointmentsAPI }                      from '../../api/appointments.api';
import { COLORS, STATUS_COLORS, APPOINTMENT_STATUS } from '../../constants';

const FILTERS = ['ALL', 'WAITING', 'IN_ROOM', 'SCHEDULED', 'COMPLETED'];

export default function AppointmentScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filter,       setFilter]       = useState('ALL');
  const [mode,         setMode]         = useState('today');   // 'today' | 'all'
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const load = async () => {
    try {
      const res = mode === 'today'
        ? await appointmentsAPI.getToday()
        : await appointmentsAPI.getAll({});
      setAppointments(res.data.appointments || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [mode]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [mode]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      Alert.alert('Error', 'Could not update status');
    }
  };

  const cancelAppt = (id) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsAPI.cancel(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
          } catch {
            Alert.alert('Error', 'Could not cancel appointment');
          }
        },
      },
    ]);
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const renderItem = ({ item: appt }) => {
    const color = STATUS_COLORS[appt.status] || COLORS.muted;
    return (
      <View style={styles.card}>
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{appt.time || '—'}</Text>
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.patName}>
            {appt.patient?.firstName} {appt.patient?.lastName}
          </Text>
          <Text style={styles.docText}>
            {appt.doctor?.user?.name || '—'} · {appt.visitType}
          </Text>
          {mode === 'all' && (
            <Text style={styles.dateText}>
              {new Date(appt.date).toLocaleDateString('en-GB')}
            </Text>
          )}
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.badgeText, { color }]}>{appt.status}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {appt.status === APPOINTMENT_STATUS.WAITING && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => updateStatus(appt.id, APPOINTMENT_STATUS.IN_ROOM)}
            >
              <Text style={styles.actionBtnText}>In Room</Text>
            </TouchableOpacity>
          )}
          {appt.status === APPOINTMENT_STATUS.IN_ROOM && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.green }]}
              onPress={() => updateStatus(appt.id, APPOINTMENT_STATUS.COMPLETED)}
            >
              <Text style={styles.actionBtnText}>Done</Text>
            </TouchableOpacity>
          )}
          {(appt.status === APPOINTMENT_STATUS.SCHEDULED || appt.status === APPOINTMENT_STATUS.WAITING) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#fef2f2', marginTop: 4 }]}
              onPress={() => cancelAppt(appt.id)}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.red }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.heading}>Appointments</Text>
          <Text style={styles.subHeading}>{filtered.length} shown</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddAppointment')}
        >
          <Text style={styles.addBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      {/* Today / All toggle */}
      <View style={styles.modeRow}>
        {['today', 'all'].map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeTxt, mode === m && styles.modeTxtActive]}>
              {m === 'today' ? "Today's" : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => String(a.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No appointments found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },

  topbar: {
    backgroundColor: COLORS.navy,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  heading:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  subHeading: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  modeRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modeBtn: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    marginRight: 8, backgroundColor: COLORS.bg,
  },
  modeBtnActive: { backgroundColor: COLORS.navy },
  modeTxt:       { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  modeTxtActive: { color: '#fff' },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, marginRight: 6, backgroundColor: COLORS.bg,
  },
  filterTabActive:  { backgroundColor: COLORS.primary },
  filterText:       { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  filterTextActive: { color: '#fff' },

  list: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: COLORS.border,
  },
  timeCol: { alignItems: 'center', marginRight: 12, width: 52 },
  timeText: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  dot:      { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  infoCol:  { flex: 1 },
  patName:  { fontSize: 15, fontWeight: '700', color: COLORS.text },
  docText:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  dateText: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  badge:    { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  actions:  { marginLeft: 8, alignItems: 'flex-end' },
  actionBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyText:     { fontSize: 15, color: COLORS.muted },
});
