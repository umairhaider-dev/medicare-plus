import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { patientsAPI }     from '../../api/patients.api';
import { COLORS, STATUS_COLORS } from '../../constants';

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

export default function PatientDetailScreen({ route, navigation }) {
  const { patientId } = route.params;
  const [patient,    setPatient]    = useState(null);
  const [history,    setHistory]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [patRes, histRes] = await Promise.all([
        patientsAPI.getOne(patientId),
        patientsAPI.getHistory(patientId),
      ]);
      setPatient(patRes.data.patient);
      setHistory(histRes.data);
    } catch {
      Alert.alert('Error', 'Failed to load patient details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  const handleDelete = () => {
    Alert.alert('Delete Patient', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await patientsAPI.remove(patientId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete patient');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!patient) {
    return <View style={styles.center}><Text style={styles.emptyText}>Patient not found</Text></View>;
  }

  const initials = (patient.firstName?.[0] || '') + (patient.lastName?.[0] || '');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddPatient', { patient })}
          style={styles.editBtn}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initials.toUpperCase()}</Text>
        </View>
        <Text style={styles.fullName}>{patient.firstName} {patient.lastName}</Text>
        <View style={styles.mrBadge}>
          <Text style={styles.mrText}>MR-{patient.mrNumber}</Text>
        </View>
        <Text style={styles.metaText}>
          {[patient.gender, patient.bloodGroup, patient.phone].filter(Boolean).join(' • ')}
        </Text>
      </View>

      <View style={styles.content}>

        {/* Personal info */}
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.card}>
          <InfoRow label="Email"             value={patient.email} />
          <InfoRow label="Phone"             value={patient.phone} />
          <InfoRow label="Date of Birth"     value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : null} />
          <InfoRow label="Address"           value={patient.address} />
          <InfoRow label="Blood Group"       value={patient.bloodGroup} />
          <InfoRow label="Allergies"         value={patient.allergies} />
          <InfoRow label="Emergency Contact" value={patient.emergencyContactName} />
          <InfoRow label="Emergency Phone"   value={patient.emergencyContactPhone} />
          <InfoRow label="Notes"             value={patient.notes} />
        </View>

        {/* Appointments history */}
        {history?.appointments?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Appointments ({history.appointments.length})
            </Text>
            <View style={styles.card}>
              {history.appointments.slice(0, 6).map((appt, i) => {
                const color = STATUS_COLORS[appt.status] || COLORS.muted;
                return (
                  <View key={appt.id} style={[styles.histRow, i > 0 && styles.borderTop]}>
                    <View style={styles.histLeft}>
                      <Text style={styles.histDate}>
                        {new Date(appt.date).toLocaleDateString('en-GB')}
                      </Text>
                      <Text style={styles.histSub}>
                        {appt.doctor?.user?.name || '—'} · {appt.visitType}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                      <Text style={[styles.badgeText, { color }]}>{appt.status}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Prescriptions history */}
        {history?.prescriptions?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Prescriptions ({history.prescriptions.length})
            </Text>
            <View style={styles.card}>
              {history.prescriptions.slice(0, 4).map((rx, i) => (
                <View key={rx.id} style={[styles.histRow, i > 0 && styles.borderTop]}>
                  <View style={styles.histLeft}>
                    <Text style={styles.histDate}>
                      {new Date(rx.createdAt).toLocaleDateString('en-GB')}
                    </Text>
                    <Text style={styles.histSub}>{rx.doctor?.user?.name || '—'}</Text>
                  </View>
                  <View style={styles.rxPill}>
                    <Text style={styles.rxPillText}>{rx.items?.length || 0} items</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.apptBtn}
          onPress={() =>
            navigation.navigate('Appointments', {
              screen: 'AddAppointment',
              params: { patient },
            })
          }
        >
          <Text style={styles.apptBtnText}>📅  Book Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Patient</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:   { fontSize: 15, color: COLORS.muted },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.navy,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
  },
  backBtn:  { paddingVertical: 4, paddingRight: 16 },
  backText: { color: '#94a3b8', fontSize: 14 },
  editBtn:  {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
  },
  editText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  profileCard: {
    backgroundColor: COLORS.navy, paddingBottom: 28,
    alignItems: 'center', paddingHorizontal: 20,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(13,148,136,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarTxt: { fontSize: 26, fontWeight: '800', color: '#fff' },
  fullName:  { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  mrBadge: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8,
  },
  mrText:   { fontSize: 12, fontWeight: '700', color: '#fff' },
  metaText: { fontSize: 13, color: '#94a3b8' },

  content:      { padding: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 13, color: COLORS.muted, fontWeight: '500', width: 140 },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '600', flex: 1, textAlign: 'right' },

  histRow:  {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
  },
  borderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
  histLeft:  { flex: 1 },
  histDate:  { fontSize: 14, fontWeight: '600', color: COLORS.text },
  histSub:   { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  rxPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  rxPillText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  apptBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  apptBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  deleteBtnText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
