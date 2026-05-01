import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { patientsAPI } from '../../api/patients.api';
import { COLORS }      from '../../constants';

export default function PatientListScreen({ navigation }) {
  const [patients,   setPatients]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (q = search) => {
    try {
      const res = await patientsAPI.getAll(q ? { search: q } : {});
      setPatients(res.data.patients || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (text) => { setSearch(text); load(text); };
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [search]);

  const initials = (p) =>
    ((p.firstName?.[0] || '') + (p.lastName?.[0] || '')).toUpperCase();

  const renderItem = ({ item: p }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PatientDetail', { patientId: p.id })}
      activeOpacity={0.75}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{initials(p)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{p.firstName} {p.lastName}</Text>
        <Text style={styles.sub}>
          {[p.phone, p.gender, p.bloodGroup].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={styles.mrBadge}>
        <Text style={styles.mrText}>MR-{p.mrNumber}</Text>
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
          <Text style={styles.heading}>Patients</Text>
          <Text style={styles.subHeading}>{patients.length} records</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddPatient')}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder="Search by name, MR or phone..."
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={patients}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {search ? 'No patients match your search' : 'No patients yet'}
            </Text>
            {!search && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddPatient')}>
                <Text style={styles.emptyBtnText}>Register First Patient</Text>
              </TouchableOpacity>
            )}
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, margin: 16, borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.text },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarTxt: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sub:       { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  mrBadge:   { backgroundColor: COLORS.navy, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mrText:    { fontSize: 11, fontWeight: '700', color: '#fff' },

  emptyText:    { fontSize: 15, color: COLORS.muted, marginBottom: 16 },
  emptyBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
});
