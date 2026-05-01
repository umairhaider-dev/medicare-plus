import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import { useAuthStore }    from '../../store/auth.store';
import { reportsAPI }      from '../../api/reports.api';
import { appointmentsAPI } from '../../api/appointments.api';
import { COLORS }          from '../../constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH   = (SCREEN_WIDTH - 48) / 2;

export default function DashboardScreen({ navigation }) {
  const { user, clinic, logout } = useAuthStore();

  const handleAvatarPress = () => {
    Alert.alert(
      user?.name || 'Account',
      `${user?.role || ''} · ${clinic?.name || ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };
  const [dashboard,  setDashboard]  = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [dashRes, apptRes] = await Promise.all([
        reportsAPI.getDashboard(),
        appointmentsAPI.getToday()
      ]);
      setDashboard(dashRes.data.dashboard);
      setTodayAppts(apptRes.data.appointments || []);
    } catch (err) {
      console.log('Dashboard error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const statusColor = (status) => {
    const map = {
      SCHEDULED: '#3b82f6',
      WAITING:   '#f59e0b',
      IN_ROOM:   '#8b5cf6',
      COMPLETED: '#22c55e',
      CANCELLED: '#ef4444',
    };
    return map[status] || '#64748b';
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const stats = [
    {
      icon:   '👥',
      num:    dashboard?.patients?.total || 0,
      label:  'Total Patients',
      color:  COLORS.primary,
      screen: 'Patients',
    },
    {
      icon:   '📅',
      num:    dashboard?.appointments?.today || 0,
      label:  'Today Appts',
      color:  '#7c3aed',
      screen: 'Appointments',
    },
    {
      icon:   '💰',
      num:    'Rs ' + (((dashboard?.revenue?.today || 0) / 1000).toFixed(0)) + 'k',
      label:  'Today Revenue',
      color:  '#d97706',
      screen: 'Pharmacy',
    },
    {
      icon:   '⚠️',
      num:    dashboard?.pharmacy?.lowStock || 0,
      label:  'Low Stock',
      color:  '#dc2626',
      screen: 'Pharmacy',
    },
  ];

  const quickActions = [
    { icon:'👤', label:'New Patient',  sub:'Register',  screen:'Patients'     },
    { icon:'📅', label:'Book Appt',    sub:'Schedule',  screen:'Appointments' },
    { icon:'💊', label:'Pharmacy',     sub:'POS Sale',  screen:'Pharmacy'     },
    { icon:'📊', label:'Reports',      sub:'Analytics', screen:'Reports'      },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Top Bar */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.clinicName}>
            {clinic?.name || 'MediCare Plus'}
          </Text>
          <Text style={styles.clinicSub}>Clinic & Pharmacy</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleAvatarPress} activeOpacity={0.8}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Date */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day:     'numeric',
            month:   'long',
            year:    'numeric',
          })}
        </Text>

        {/* Stat Cards */}
        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            {stats.slice(0, 2).map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.statCard, { backgroundColor: s.color, width: CARD_WIDTH }]}
                onPress={() => navigation.navigate(s.screen)}
                activeOpacity={0.85}
              >
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statNum}>{String(s.num)}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.statRow}>
            {stats.slice(2, 4).map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.statCard, { backgroundColor: s.color, width: CARD_WIDTH }]}
                onPress={() => navigation.navigate(s.screen)}
                activeOpacity={0.85}
              >
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statNum}>{String(s.num)}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today Appointments */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.card}>
          {todayAppts.length === 0 ? (
            <Text style={styles.emptyText}>No appointments today</Text>
          ) : (
            todayAppts.slice(0, 5).map((appt, i) => (
              <View
                key={appt.id}
                style={[
                  styles.apptRow,
                  i < Math.min(todayAppts.length, 5) - 1
                    && styles.apptBorder
                ]}
              >
                <View style={styles.timePill}>
                  <Text style={styles.timeText}>{appt.time}</Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptName}>
                    {appt.patient?.firstName} {appt.patient?.lastName}
                  </Text>
                  <Text style={styles.apptSub}>
                    {appt.doctor?.user?.name} • {appt.visitType}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor(appt.status) + '22' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: statusColor(appt.status) }
                  ]}>
                    {appt.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            {quickActions.slice(0, 2).map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.qaCard, { width: CARD_WIDTH }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.qaIcon}>{item.icon}</Text>
                <Text style={styles.qaLabel}>{item.label}</Text>
                <Text style={styles.qaSub}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.statRow}>
            {quickActions.slice(2, 4).map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.qaCard, { width: CARD_WIDTH }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.qaIcon}>{item.icon}</Text>
                <Text style={styles.qaLabel}>{item.label}</Text>
                <Text style={styles.qaSub}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Month Summary */}
        {dashboard && (
          <>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.card}>
              <View style={styles.monthRow}>
                <View style={styles.monthItem}>
                  <Text style={styles.monthNum}>
                    {dashboard.appointments?.month || 0}
                  </Text>
                  <Text style={styles.monthLbl}>Appointments</Text>
                </View>
                <View style={styles.monthDivider} />
                <View style={styles.monthItem}>
                  <Text style={styles.monthNum}>
                    {dashboard.patients?.newMonth || 0}
                  </Text>
                  <Text style={styles.monthLbl}>New Patients</Text>
                </View>
                <View style={styles.monthDivider} />
                <View style={styles.monthItem}>
                  <Text style={[styles.monthNum, { color: COLORS.primary }]}>
                    {'Rs ' + (((dashboard.revenue?.month || 0) / 1000).toFixed(0)) + 'k'}
                  </Text>
                  <Text style={styles.monthLbl}>Revenue</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  loadingWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:  { fontSize: 16, color: COLORS.muted },
  topbar: {
    backgroundColor:  COLORS.navy,
    paddingHorizontal:20,
    paddingTop:       52,
    paddingBottom:    20,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
  },
  clinicName: {
    fontSize:     20,
    fontWeight:   '800',
    color:        '#fff',
    letterSpacing:-0.3,
  },
  clinicSub: {
    fontSize:      10,
    color:         '#94a3b8',
    marginTop:     2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  avatarBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  content:      { padding: 16 },
  dateText:     { fontSize: 13, color: COLORS.muted, marginBottom: 14 },
  statGrid:     { marginBottom: 16 },
  statRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  statCard: {
    borderRadius:  16,
    padding:       16,
    overflow:      'hidden',
  },
  statIcon:     { fontSize: 20, opacity: 0.4, marginBottom: 8 },
  statNum:      { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLbl:      { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '500' },
  sectionTitle: {
    fontSize:      13,
    fontWeight:    '700',
    color:         COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  10,
    marginTop:     6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         16,
    marginBottom:    12,
  },
  emptyText:    { color: COLORS.muted, textAlign: 'center', padding: 20 },
  apptRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical:10,
  },
  apptBorder:   { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  timePill: {
    backgroundColor:  COLORS.navy,
    borderRadius:     8,
    paddingHorizontal:8,
    paddingVertical:  5,
    minWidth:         52,
    alignItems:       'center',
    marginRight:      10,
  },
  timeText:     { fontSize: 12, fontWeight: '700', color: '#fff' },
  apptInfo:     { flex: 1 },
  apptName:     { fontSize: 14, fontWeight: '600', color: COLORS.text },
  apptSub:      { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      20,
  },
  statusText:   { fontSize: 10, fontWeight: '700' },
  qaCard: {
    backgroundColor: COLORS.white,
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  qaIcon:       { fontSize: 24, marginBottom: 6 },
  qaLabel:      { fontSize: 13, fontWeight: '700', color: COLORS.text },
  qaSub:        { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  monthRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  monthItem:    { flex: 1, alignItems: 'center', paddingVertical: 8 },
  monthNum:     { fontSize: 20, fontWeight: '800', color: COLORS.text },
  monthLbl:     { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  monthDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
});