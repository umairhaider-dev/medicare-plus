import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { appointmentsAPI } from '../../api/appointments.api';
import { patientsAPI }     from '../../api/patients.api';
import { authAPI }         from '../../api/auth.api';
import { COLORS, VISIT_TYPES } from '../../constants';

const TIMES = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
];

export default function AddAppointmentScreen({ route, navigation }) {
  const prePatient = route.params?.patient;

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [patSearch,    setPatSearch]    = useState(
    prePatient ? `${prePatient.firstName} ${prePatient.lastName}` : ''
  );
  const [showPats,     setShowPats]     = useState(false);
  const [loadingData,  setLoadingData]  = useState(true);
  const [loading,      setLoading]      = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    patientId: prePatient?.id || null,
    doctorId:  null,
    date:      today,
    time:      '09:00',
    visitType: 'OPD',
    fee:       '',
    notes:     '',
  });

  useEffect(() => {
    Promise.all([authAPI.getDoctors(), patientsAPI.getAll({})])
      .then(([docRes, patRes]) => {
        setDoctors(docRes.data.doctors || []);
        setPatients(patRes.data.patients || []);
      })
      .catch(() => Alert.alert('Error', 'Failed to load doctors / patients'))
      .finally(() => setLoadingData(false));
  }, []);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const filteredPats = patSearch.length > 1
    ? patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patSearch.toLowerCase()) ||
        (p.phone || '').includes(patSearch)
      ).slice(0, 6)
    : [];

  const selectPatient = (p) => {
    set('patientId')(p.id);
    setPatSearch(`${p.firstName} ${p.lastName}`);
    setShowPats(false);
  };

  const handleSave = async () => {
    if (!form.patientId) { Alert.alert('Required', 'Select a patient'); return; }
    if (!form.doctorId)  { Alert.alert('Required', 'Select a doctor');  return; }
    if (!form.date)      { Alert.alert('Required', 'Enter a date');     return; }

    setLoading(true);
    try {
      await appointmentsAPI.create({
        patientId: form.patientId,
        doctorId:  form.doctorId,
        date:      form.date,
        time:      form.time,
        visitType: form.visitType,
        notes:     form.notes || undefined,
        fee:       form.fee ? parseFloat(form.fee) : undefined,
      });
      Alert.alert('Booked', 'Appointment scheduled successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Book Appointment</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* Patient */}
        <Text style={styles.section}>Patient *</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={patSearch}
            onChangeText={(t) => { setPatSearch(t); setShowPats(true); set('patientId')(null); }}
            placeholder="Search by name or phone..."
            placeholderTextColor={COLORS.muted}
          />
        </View>
        {showPats && filteredPats.length > 0 && (
          <View style={styles.dropdown}>
            {filteredPats.map(p => (
              <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => selectPatient(p)}>
                <Text style={styles.dropName}>{p.firstName} {p.lastName}</Text>
                <Text style={styles.dropSub}>{p.phone} · MR-{p.mrNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {form.patientId && (
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>✓ Patient selected</Text>
          </View>
        )}

        {/* Doctor */}
        <Text style={styles.section}>Doctor *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {doctors.map(doc => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.docCard, form.doctorId === doc.id && styles.docCardActive]}
              onPress={() => set('doctorId')(doc.id)}
            >
              <Text style={[styles.docName, form.doctorId === doc.id && { color: '#fff' }]}>
                {doc.user?.name}
              </Text>
              <Text style={[styles.docSpec, form.doctorId === doc.id && { color: 'rgba(255,255,255,0.75)' }]}>
                {doc.specialization}
              </Text>
              <Text style={[styles.docFee, form.doctorId === doc.id && { color: '#fff' }]}>
                Rs {doc.fee}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date */}
        <Text style={styles.section}>Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          value={form.date}
          onChangeText={set('date')}
          placeholder="2026-04-30"
          placeholderTextColor={COLORS.muted}
          keyboardType="numbers-and-punctuation"
        />

        {/* Time */}
        <Text style={styles.section}>Time *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {TIMES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.timeBtn, form.time === t && styles.timeBtnActive]}
              onPress={() => set('time')(t)}
            >
              <Text style={[styles.timeText, form.time === t && styles.timeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Visit type */}
        <Text style={styles.section}>Visit Type</Text>
        <View style={styles.chips}>
          {VISIT_TYPES.map(vt => (
            <TouchableOpacity
              key={vt}
              style={[styles.chip, form.visitType === vt && styles.chipActive]}
              onPress={() => set('visitType')(vt)}
            >
              <Text style={[styles.chipText, form.visitType === vt && styles.chipTextActive]}>{vt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fee */}
        <Text style={styles.section}>Fee Override (optional)</Text>
        <TextInput
          style={styles.input}
          value={form.fee}
          onChangeText={set('fee')}
          placeholder="Leave blank to use doctor's default"
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
        />

        {/* Notes */}
        <Text style={styles.section}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.notes}
          onChangeText={set('notes')}
          placeholder="Chief complaint, reason for visit..."
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Book Appointment</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.navy,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
  },
  backBtn:  { width: 60 },
  backText: { color: '#94a3b8', fontSize: 14 },
  heading:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  form:     { padding: 16 },
  section: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16,
  },
  searchBox: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 4,
  },
  searchInput: { paddingVertical: 11, fontSize: 14, color: COLORS.text },
  dropdown: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, marginBottom: 8, overflow: 'hidden',
  },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dropSub:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  selectedTag: {
    backgroundColor: '#f0fdf4', borderRadius: 8,
    padding: 8, marginBottom: 4,
  },
  selectedTagText: { color: COLORS.green, fontWeight: '600', fontSize: 13 },

  docCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 12,
    marginRight: 10, borderWidth: 1, borderColor: COLORS.border, minWidth: 130,
  },
  docCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  docName:  { fontSize: 13, fontWeight: '700', color: COLORS.text },
  docSpec:  { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  docFee:   { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 6 },

  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
  },
  textArea: { height: 80 },

  timeBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white, marginRight: 8,
  },
  timeBtnActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText:       { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  timeTextActive: { color: '#fff', fontWeight: '700' },

  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
