import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { pharmacyAPI } from '../../api/pharmacy.api';
import { COLORS }      from '../../constants';

const TABS = [
  { key: 'ALL',       label: 'All' },
  { key: 'LOW_STOCK', label: '⚠️ Low' },
  { key: 'EXPIRING',  label: '📅 Expiring' },
];

export default function PharmacyScreen({ navigation }) {
  const [medicines,  setMedicines]  = useState([]);
  const [search,     setSearch]     = useState('');
  const [tab,        setTab]        = useState('ALL');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (q = search, t = tab) => {
    try {
      let res;
      if (t === 'LOW_STOCK')    res = await pharmacyAPI.getLowStock();
      else if (t === 'EXPIRING') res = await pharmacyAPI.getExpiring();
      else res = await pharmacyAPI.getAll(q ? { search: q } : {});
      setMedicines(res.data.medicines || res.data.data || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load medicines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(search, tab); }, [tab]);

  // Refresh when coming back from Add/Edit screen
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation, search, tab]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [search, tab]);
  const onSearch  = (text) => { setSearch(text); load(text, tab); };

  const confirmDelete = (med) => {
    Alert.alert(
      'Delete Medicine',
      `Remove "${med.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await pharmacyAPI.remove(med.id);
              setMedicines(prev => prev.filter(m => m.id !== med.id));
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const stockColor = (qty) => {
    if (qty <= 0)  return COLORS.red;
    if (qty <= 10) return COLORS.amber;
    return COLORS.green;
  };

  const renderItem = ({ item: m }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('AddMedicine', { medicine: m })}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>💊</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.medName}>{m.name}</Text>
        <Text style={styles.medSub}>{[m.category, m.unit].filter(Boolean).join(' · ')}</Text>
        <Text style={styles.medPrice}>Sale: Rs {m.salePrice || 0}</Text>
        {m.expiryDate && (
          <Text style={styles.medExpiry}>
            Exp: {new Date(m.expiryDate).toLocaleDateString('en-GB')}
          </Text>
        )}
      </View>
      <View style={styles.stockCol}>
        <Text style={[styles.stockNum, { color: stockColor(m.quantity) }]}>{m.quantity}</Text>
        <Text style={styles.stockLabel}>in stock</Text>
        {m.quantity <= 0 && (
          <View style={[styles.tag, { backgroundColor: '#fef2f2' }]}>
            <Text style={[styles.tagText, { color: COLORS.red }]}>OUT</Text>
          </View>
        )}
        {m.quantity > 0 && m.quantity <= 10 && (
          <View style={[styles.tag, { backgroundColor: '#fffbeb' }]}>
            <Text style={[styles.tagText, { color: COLORS.amber }]}>LOW</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(m)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.heading}>Pharmacy</Text>
          <Text style={styles.subHeading}>{medicines.length} items</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMedicine', {})}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.salesBtn}
            onPress={() => navigation.navigate('PharmacySales')}
          >
            <Text style={styles.salesBtnText}>🛒 POS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search (ALL tab only) */}
      {tab === 'ALL' && (
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearch}
            placeholder="Search medicines..."
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')}>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={medicines}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No medicines found</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddMedicine', {})}
            >
              <Text style={styles.emptyBtnText}>Add First Medicine</Text>
            </TouchableOpacity>
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
  topActions: { flexDirection: 'row', gap: 8 },
  addBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  salesBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  salesBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginRight: 8, backgroundColor: COLORS.bg,
  },
  tabBtnActive:  { backgroundColor: COLORS.primary },
  tabText:       { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: '#fff' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, margin: 16, borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.text },

  list: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  icon:      { fontSize: 20 },
  info:      { flex: 1 },
  medName:   { fontSize: 15, fontWeight: '700', color: COLORS.text },
  medSub:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  medPrice:  { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  medExpiry: { fontSize: 11, color: COLORS.amber, marginTop: 1 },

  stockCol:    { alignItems: 'center', minWidth: 54 },
  stockNum:    { fontSize: 20, fontWeight: '800' },
  stockLabel:  { fontSize: 10, color: COLORS.muted },
  tag:         { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  tagText:     { fontSize: 9, fontWeight: '800' },
  deleteBtn:   { marginTop: 8 },
  deleteBtnText: { fontSize: 16 },

  emptyText:    { fontSize: 15, color: COLORS.muted, marginBottom: 16 },
  emptyBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
});
