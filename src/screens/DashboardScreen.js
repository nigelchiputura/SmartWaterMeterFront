import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { LineChart } from "react-native-chart-kit";

import { signOut } from "firebase/auth";

import { auth, db, ref, onValue } from "../services/firebase";

import StatusCard from "../components/StatusCard";

import StatCard from "../components/StatCard";

import colors from "../constants/colors";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen({ isGuest, onLogout }) {
  const [data, setData] = useState([]);

  const [lastStatus, setLastStatus] = useState(null);

  const getColor = (status) => {
    if (status === "Safe") return colors.success;

    if (status === "Unsafe") return colors.danger;

    return colors.warning;
  };

  useEffect(() => {
    const user = auth.currentUser;

    const path = isGuest ? "guest_data" : `users/${user.uid}/water_data`;

    const waterRef = ref(db, path);

    const unsubscribe = onValue(waterRef, (snapshot) => {
      const val = snapshot.val();

      if (val) {
        const list = Object.values(val).reverse().slice(0, 20);

        setData(list);

        const latest = list[0];

        if (latest && latest.status !== lastStatus) {
          setLastStatus(latest.status);

          if (latest.status === "Unsafe") {
            Alert.alert("Warning", "Unsafe water detected!");
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const latest = data[0];

  const safeCount = data.filter((item) => item.status === "Safe").length;

  const unsafeCount = data.filter((item) => item.status === "Unsafe").length;

  const avgTemp =
    data.length > 0
      ? (
          data.reduce((acc, item) => acc + item.temperature, 0) / data.length
        ).toFixed(1)
      : 0;

  const avgTDS =
    data.length > 0
      ? (data.reduce((acc, item) => acc + item.tds, 0) / data.length).toFixed(0)
      : 0;

  const handleLogout = async () => {
    if (!isGuest) {
      await signOut(auth);
    }

    onLogout();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Water Dashboard</Text>

          <Text style={styles.subtitle}>
            {isGuest ? "Guest Mode" : "Premium User"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN STATUS */}
      {latest && (
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>Current Water Status</Text>

          <Text
            style={[
              styles.status,
              {
                color: getColor(latest.status),
              },
            ]}
          >
            {latest.status}
          </Text>

          <Text style={styles.timestamp}>
            Updated: {new Date(latest.timestamp).toLocaleString()}
          </Text>
        </View>
      )}

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatCard title="Safe" value={safeCount} color={colors.success} />

        <StatCard title="Unsafe" value={unsafeCount} color={colors.danger} />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Avg Temp"
          value={`${avgTemp}°C`}
          color={colors.secondary}
        />

        <StatCard
          title="Avg TDS"
          value={`${avgTDS} ppm`}
          color={colors.accent}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard title="Records" value={data.length} color={colors.primary} />
      </View>

      {/* PREMIUM */}
      <>
        <Text style={styles.sectionTitle}>Water Analytics</Text>

        {data.length > 0 && (
          <LineChart
            data={{
              labels: data
                .slice(0, 5)
                .reverse()
                .map((_, i) => `${i + 1}`),

              datasets: [
                {
                  data: data
                    .slice(0, 5)
                    .reverse()
                    .map((item) => item.temperature),
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: colors.primary,

              backgroundGradientFrom: colors.primary,

              backgroundGradientTo: colors.secondary,

              decimalPlaces: 1,

              color: (opacity = 1) => `rgba(255,255,255,${opacity})`,

              labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        )}
      </>

      {/* HISTORY */}
      <Text style={styles.sectionTitle}>Recent Readings</Text>

      {data.slice(0, isGuest ? 3 : 10).map((item, index) => (
        <StatusCard key={index} data={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.background,

    padding: 20,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  title: {
    fontSize: 30,

    fontFamily: "Nunito_700Bold",

    color: colors.textPrimary,
  },

  subtitle: {
    fontFamily: "Nunito_400Regular",

    color: colors.textSecondary,
  },

  logoutButton: {
    backgroundColor: colors.danger,

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 12,
  },

  logoutText: {
    color: "#fff",

    fontFamily: "Nunito_700Bold",
  },

  mainCard: {
    backgroundColor: colors.surface,

    padding: 24,

    borderRadius: 20,

    marginBottom: 20,

    elevation: 4,
  },

  mainTitle: {
    fontFamily: "Nunito_400Regular",

    color: colors.textSecondary,

    marginBottom: 10,
  },

  status: {
    fontSize: 40,

    fontFamily: "Nunito_700Bold",
  },

  timestamp: {
    marginTop: 10,

    color: colors.textSecondary,

    fontFamily: "Nunito_400Regular",
  },

  statsRow: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 22,

    marginTop: 20,

    marginBottom: 14,

    color: colors.textPrimary,

    fontFamily: "Nunito_700Bold",
  },

  chart: {
    borderRadius: 20,
  },

  premiumBanner: {
    backgroundColor: colors.primary,

    padding: 24,

    borderRadius: 20,

    marginTop: 10,
  },

  premiumTitle: {
    color: "#fff",

    fontSize: 22,

    marginBottom: 10,

    fontFamily: "Nunito_700Bold",
  },

  premiumText: {
    color: "#fff",

    fontFamily: "Nunito_400Regular",

    lineHeight: 22,
  },
});
