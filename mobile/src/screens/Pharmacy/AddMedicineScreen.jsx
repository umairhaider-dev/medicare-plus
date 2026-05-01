import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { pharmacyAPI } from '../../api/pharmacy.api';
import { COLORS } from '../../constants';

const CATEGORIES = ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Inhaler', 'Other'];
const UNITS      = ['Tablets', 'ml', 'mg', 'g', 'Pieces', 'Strips', 'Bottles'];

export default function AddMedicineScreen({ route, navigation }) {
  const existing = route.params?.medicine;
  const isEdit   = !!existing;

  const [form, setForm] = useState({
    name:          existing?.name          || '',
    category:      existing?.category      || '',
    unit:          existing?.unit          || '',
    manufacturer:  existing?.manufacturer  || '',
    purchasePrice: existing?.purchasePrice != null ? String(existing.purchasePrice) : '',
    salePrice:     existing?.salePrice     != null ? String(existing.salePrice)     : '',
    quantity:      existing?.quantity      != null ? String(existing.quantity)      : '',
    reorderLevel:  existing?.reorderLevel  != null ? String(existing.reorderLevel)  : '10',
    expiryDate:    existing?.expiryDate    ? existing.expiryDate.split('T')[0]      : '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim())    { Alert.alert('Required', 'Medicine name is required'); return; }
    if (!form.salePrice)      { Alert.alert('Required', 'Sale price is required');    return; }
    if (!form.quantity && !isEdit) { Alert.alert('Required', 'Quantity is required'); return; }

    const payload = {
      name:          form.name.trim(),
      category:      form.category  || undefined,
      unit:          form.unit      || undefined,
      manufacturer:  form.manufacturer.trim() || undefined,
      purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
      salePrice:     parseFloat(form.salePrice),
      quantity:      form.quantity  ? parseInt(form.quantity, 10)  : undefined,
      reorderLevel:  form.reorderLevel ? parseInt(form.reorderLevel, 10) : undefined,
      expiryDate:    form.expiryDate || undefined,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await pharmacyAPI.update(existing.id, payload);
        Alert.alert('Updated', `${form.name} updated successfully`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await pharmacyAPI.create(payload);
        Alert.alert('Added', `${form.name} added to inventory`, [
          { text: 'Add Another', onPress: () => setForm({ name:'', category:'', unit:'', manufacturer:'', purchasePrice:'', salePrice:'', quantity:'', reorderLevel:'10', expiryDate:'' }) },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save medicine');
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
        <Text style={styles.heading}>{isEdit ? 'Edit Medicine' : 'Add Medicine'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Text style={styles.label}>Medicine Name *</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={set('name')}
          placeholder="e.g. Paracetamol 500mg"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="words"
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.category === c && styles.chipActive]}
              onPress={() => set('category')(form.category === c ? '' : c)}
            >
              <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Unit */}
        <Text style={styles.label}>Unit</Text>
        <View style={styles.chips}>
          {UNITS.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.chip, form.unit === u && styles.chipActive]}
              onPress={() => set('unit')(form.unit === u ? '' : u)}
            >
              <Text style={[styles.chipText, form.unit === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manufacturer */}
        <Text style={styles.label}>Manufacturer</Text>
        <TextInput
          style={styles.input}
          value={form.manufacturer}
          onChangeText={set('manufacturer')}
          placeholder="e.g. PharmaCo Ltd"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="words"
        />

        {/* Prices */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Purchase Price (Rs)</Text>
            <TextInput
              style={styles.input}
              value={form.purchasePrice}
              onChangeText={set('purchasePrice')}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Sale Price (Rs) *</Text>
            <TextInput
              style={styles.input}
              value={form.salePrice}
              onChangeText={set('salePrice')}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Quantity & Reorder */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Quantity {!isEdit && '*'}</Text>
            <TextInput
              style={styles.input}
              value={form.quantity}
              onChangeText={set('quantity')}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Reorder Level</Text>
            <TextInput
              style={styles.input}
              value={form.reorderLevel}
              onChangeText={set('reorderLevel')}
              placeholder="10"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Expiry Date */}
        <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={form.expiryDate}
          onChangeText={set('expiryDate')}
          placeholder="2027-12-31"
          placeholderTextColor={COLORS.muted}
          keyboardType="numbers-and-punctuation"
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add to Inventory'}</Text>
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

  form:  { padding: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
  },
  row:  { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
