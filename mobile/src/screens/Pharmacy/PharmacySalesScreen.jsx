import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { pharmacyAPI } from '../../api/pharmacy.api';
import { salesAPI }    from '../../api/sales.api';
import { patientsAPI } from '../../api/patients.api';
import { COLORS, PAYMENT_MODES } from '../../constants';

export default function PharmacySalesScreen({ navigation }) {
  const [patients,     setPatients]     = useState([]);
  const [medicines,    setMedicines]    = useState([]);
  const [cart,         setCart]         = useState([]);
  const [patSearch,    setPatSearch]    = useState('');
  const [medSearch,    setMedSearch]    = useState('');
  const [showPats,     setShowPats]     = useState(false);
  const [patientId,    setPatientId]    = useState(null);
  const [payMode,      setPayMode]      = useState('CASH');
  const [discount,     setDiscount]     = useState('0');
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    patientsAPI.getAll({})
      .then(r => setPatients(r.data.patients || []))
      .catch(() => {});
  }, []);

  const searchMed = async (q) => {
    setMedSearch(q);
    if (q.length < 2) { setMedicines([]); return; }
    try {
      const res = await pharmacyAPI.search(q);
      setMedicines(res.data.medicines || []);
    } catch {}
  };

  const addToCart = (med) => {
    if (med.quantity <= 0) { Alert.alert('Out of Stock', `${med.name} is out of stock`); return; }
    setCart(prev => {
      const exists = prev.find(c => c.medicineId === med.id);
      if (exists) return prev.map(c => c.medicineId === med.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { medicineId: med.id, name: med.name, price: med.salePrice, qty: 1, stock: med.quantity }];
    });
    setMedSearch('');
    setMedicines([]);
  };

  const removeFromCart = (medicineId) => setCart(prev => prev.filter(c => c.medicineId !== medicineId));

  const changeQty = (medicineId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.medicineId !== medicineId) return c;
      const newQty = c.qty + delta;
      if (newQty <= 0) return null;
      if (newQty > c.stock) { Alert.alert('Stock limit', `Only ${c.stock} in stock`); return c; }
      return { ...c, qty: newQty };
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const disc     = parseFloat(discount) || 0;
  const total    = Math.max(0, subtotal - disc);

  const filteredPats = patSearch.length > 1
    ? patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patSearch.toLowerCase()) ||
        (p.phone || '').includes(patSearch)
      ).slice(0, 5)
    : [];

  const handleSale = async () => {
    if (cart.length === 0) { Alert.alert('Empty cart', 'Add medicines to the cart first'); return; }
    setLoading(true);
    try {
      await salesAPI.create({
        patientId:   patientId || undefined,
        items:       cart.map(c => ({ medicineId: c.medicineId, quantity: c.qty, salePrice: c.price })),
        paymentMode: payMode,
        discount:    disc,
        total,
      });
      Alert.alert('Sale Complete', `Total: Rs ${total.toLocaleString()}`, [
        {
          text: 'New Sale',
          onPress: () => { setCart([]); setPatientId(null); setPatSearch(''); setDiscount('0'); },
        },
        { text: 'Close', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Sale failed');
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
        <Text style={styles.heading}>Pharmacy POS</Text>
        <Text style={styles.cartCount}>{cart.length} items</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Patient (optional) */}
        <Text style={styles.section}>Patient (optional)</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={patSearch}
            onChangeText={(t) => { setPatSearch(t); setShowPats(true); setPatientId(null); }}
            placeholder="Search patient name..."
            placeholderTextColor={COLORS.muted}
          />
          {patientId && <Text style={styles.tick}>✓</Text>}
        </View>
        {showPats && filteredPats.length > 0 && (
          <View style={styles.dropdown}>
            {filteredPats.map(p => (
              <TouchableOpacity
                key={p.id} style={styles.dropItem}
                onPress={() => { setPatientId(p.id); setPatSearch(`${p.firstName} ${p.lastName}`); setShowPats(false); }}
              >
                <Text style={styles.dropName}>{p.firstName} {p.lastName}</Text>
                <Text style={styles.dropSub}>{p.phone} · MR-{p.mrNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Medicine search */}
        <Text style={styles.section}>Add Medicine</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={medSearch}
            onChangeText={searchMed}
            placeholder="Type medicine name..."
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />
        </View>
        {medicines.length > 0 && (
          <View style={styles.dropdown}>
            {medicines.map(m => (
              <TouchableOpacity key={m.id} style={styles.dropItem} onPress={() => addToCart(m)}>
                <Text style={styles.dropName}>{m.name}</Text>
                <Text style={styles.dropSub}>
                  Rs {m.salePrice} · Stock: {m.quantity} {m.unit || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Cart */}
        {cart.length > 0 && (
          <>
            <Text style={styles.section}>Cart</Text>
            <View style={styles.card}>
              {cart.map((item, i) => (
                <View key={item.medicineId} style={[styles.cartRow, i > 0 && styles.borderTop]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartName}>{item.name}</Text>
                    <Text style={styles.cartUnit}>Rs {item.price} × {item.qty}</Text>
                  </View>
                  <View style={styles.qtyCtrl}>
                    <TouchableOpacity onPress={() => changeQty(item.medicineId, -1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnTxt}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => changeQty(item.medicineId, +1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnTxt}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.lineTotal}>Rs {(item.price * item.qty).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.medicineId)}>
                      <Text style={styles.removeText}>remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Discount */}
            <Text style={styles.section}>Discount (Rs)</Text>
            <TextInput
              style={styles.input}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.muted}
            />

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>Rs {subtotal.toLocaleString()}</Text>
              </View>
              {disc > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryVal, { color: COLORS.red }]}>− Rs {disc}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 }]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalVal}>Rs {total.toLocaleString()}</Text>
              </View>
            </View>

            {/* Payment mode */}
            <Text style={styles.section}>Payment Method</Text>
            <View style={styles.chips}>
              {PAYMENT_MODES.map(pm => (
                <TouchableOpacity
                  key={pm}
                  style={[styles.chip, payMode === pm && styles.chipActive]}
                  onPress={() => setPayMode(pm)}
                >
                  <Text style={[styles.chipText, payMode === pm && styles.chipTextActive]}>{pm}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saleBtn, loading && { opacity: 0.7 }]}
              onPress={handleSale}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saleBtnText}>Complete Sale · Rs {total.toLocaleString()}</Text>
              }
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.navy,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
  },
  backBtn:   { width: 60 },
  backText:  { color: '#94a3b8', fontSize: 14 },
  heading:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  cartCount: { fontSize: 13, color: COLORS.primary, fontWeight: '700', width: 60, textAlign: 'right' },

  content: { padding: 16 },
  section: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 4,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.text },
  tick:        { fontSize: 16, color: COLORS.green, fontWeight: '700' },
  dropdown: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, marginBottom: 8, overflow: 'hidden',
  },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dropSub:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden',
  },
  cartRow:   { flexDirection: 'row', alignItems: 'center', padding: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
  cartName:  { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cartUnit:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  qtyCtrl:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnTxt:  { fontSize: 16, fontWeight: '700', color: COLORS.text },
  qtyNum:     { fontSize: 15, fontWeight: '700', color: COLORS.text, marginHorizontal: 10 },
  lineTotal:  { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  removeText: { fontSize: 11, color: COLORS.red, marginTop: 4 },

  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
  },
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12,
  },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryVal:   { fontSize: 14, fontWeight: '600', color: COLORS.text },
  totalLabel:   { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalVal:     { fontSize: 22, fontWeight: '800', color: COLORS.primary },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  saleBtn: {
    backgroundColor: COLORS.green, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
  },
  saleBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
