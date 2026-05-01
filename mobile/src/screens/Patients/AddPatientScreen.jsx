import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { patientsAPI } from '../../api/patients.api';
import { COLORS }      from '../../constants';

const GENDERS      = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Field = ({ label, value, onChangeText, placeholder, keyboard, multiline }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={COLORS.muted}
      keyboardType={keyboard || 'default'}
      autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
      multiline={!!multiline}
      numberOfLines={multiline ? 3 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const Chips = ({ label, options, value, onChange }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.chips}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(value === opt ? '' : opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function AddPatientScreen({ route, navigation }) {
  const existing = route.params?.patient;
  const isEdit   = !!existing;

  const [form, setForm] = useState({
    firstName:             existing?.firstName             || '',
    lastName:              existing?.lastName              || '',
    phone:                 existing?.phone                 || '',
    email:                 existing?.email                 || '',
    gender:                existing?.gender                || '',
    bloodGroup:            existing?.bloodGroup            || '',
    address:               existing?.address               || '',
    allergies:             existing?.allergies             || '',
    emergencyContactName:  existing?.emergencyContactName  || '',
    emergencyContactPhone: existing?.emergencyContactPhone || '',
    notes:                 existing?.notes                 || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Required', 'First name and last name are required');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await patientsAPI.update(existing.id, form);
        Alert.alert('Updated', 'Patient record updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await patientsAPI.create(form);
        Alert.alert('Registered', 'New patient registered successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{isEdit ? 'Edit Patient' : 'New Patient'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Basic Info</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="First Name *" value={form.firstName} onChangeText={set('firstName')} />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Last Name *" value={form.lastName} onChangeText={set('lastName')} />
          </View>
        </View>

        <Field label="Phone"   value={form.phone}   onChangeText={set('phone')}   keyboard="phone-pad" />
        <Field label="Email"   value={form.email}   onChangeText={set('email')}   keyboard="email-address" />
        <Field label="Address" value={form.address} onChangeText={set('address')} multiline />

        <Chips label="Gender"      options={GENDERS}      value={form.gender}     onChange={set('gender')} />
        <Chips label="Blood Group" options={BLOOD_GROUPS} value={form.bloodGroup} onChange={set('bloodGroup')} />

        <Text style={styles.section}>Medical Info</Text>
        <Field label="Known Allergies" value={form.allergies} onChangeText={set('allergies')} multiline />
        <Field label="Notes"           value={form.notes}     onChangeText={set('notes')}     multiline />

        <Text style={styles.section}>Emergency Contact</Text>
        <Field label="Contact Name"  value={form.emergencyContactName}  onChangeText={set('emergencyContactName')} />
        <Field label="Contact Phone" value={form.emergencyContactPhone} onChangeText={set('emergencyContactPhone')} keyboard="phone-pad" />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Update Patient' : 'Register Patient'}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
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
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10, marginTop: 14,
  },
  row:       { flexDirection: 'row' },
  fieldWrap: { marginBottom: 12 },
  label:     { fontSize: 12, fontWeight: '600', color: COLORS.slate, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
  },
  textArea: { height: 80 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
