import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import BottomNavBar from "./BottomNavBar/BottomNavBar";
import { LOCAL_URL } from '../backend/configs/config';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TravelCostScreen = () => {
  const [travelData, setTravelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoiY2hva3VuOTYyQGdtYWlsLmNvbSIsImlhdCI6MTc0NTE1MTQzNywiZXhwIjoxNzQ1MTU1MDM3fQ.tPYIG6OoX4C2dnJHKGrm9I7v_XSeNxzq8NRopFe1zFk";
  
        if (!token) {
          console.error("No token found! Please log in.");
          setError("No token found! Please log in.");
          setLoading(false);
          return;
        }
  
        console.log("Token:", token);
  
        const url = __DEV__ ? LOCAL_URL : API_URL;
  
        const response = await fetch(`${url}/api/travel`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Response Data:", data);
        setTravelData(data);
      } catch (error) {
        console.error("Error fetching travel data:", error);
        setError(error.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(fetchTravelData, 5000);
    fetchTravelData();
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>เกิดข้อผิดพลาด: {error}</Text>
        <BottomNavBar />
      </View>
    );
  }

  if (!travelData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ไม่สามารถโหลดข้อมูลได้</Text>
        <BottomNavBar />
      </View>
    );
  }

  const { travelHistory } = travelData || {};
  const { fromStation, toStation, price } = travelHistory || {};

  if (!fromStation || !toStation || !price) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ข้อมูลการเดินทางไม่ครบถ้วน</Text>
        <BottomNavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={[styles.sectionPadding, styles.headerRow]}>
          <Ionicons name="arrow-back" size={28} color="black" />
          <Text style={styles.header}>คำนวณค่าเดินทาง</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={[styles.subHeader, styles.sectionPadding]}>
          ผลการค้นหาเส้นทาง
        </Text>

        <View style={[styles.routeContainer, styles.sectionPadding]}>
          <View style={styles.routeItem}>
            <Text style={styles.label}>จาก</Text>
            <Text style={styles.station}>{fromStation?.name}</Text>
            <Text style={styles.btsTag}>BTS N{fromStation?.position}</Text>
          </View>
          <View style={styles.routeItem}>
            <Text style={styles.label}>ถึง</Text>
            <Text style={styles.station}>{toStation?.name}</Text>
            <Text style={styles.btsTag}>BTS N{toStation?.position}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionPadding]}>
          ข้อมูลการเดินทาง
        </Text>
        <View style={[styles.infoContainer, styles.sectionPadding]}>
          <View style={[styles.infoBox, { backgroundColor: "#2E7D32" }]}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="white" />
            <Text style={styles.infoValue}>{price}</Text>
            <Text style={styles.infoText}>บาท</Text>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#AED581" }]}>
            <FontAwesome5 name="subway" size={24} color="black" />
            <Text style={[styles.infoValue, { color: "black" }]}>
              {Math.abs(fromStation?.position - toStation?.position)}
            </Text>
            <Text style={[styles.infoText, { color: "black" }]}>สถานี</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionPadding]}>
          ขบวนรถไฟฟ้า
        </Text>
        <View style={[styles.trainBox, styles.sectionPadding]}>
          <MaterialCommunityIcons name="train" size={28} color="black" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text>Train {travelHistory.id}</Text>
            <Text>ปลายทาง: {toStation?.name}</Text>
          </View>
          <Text style={styles.timeText}>
            {Math.abs(fromStation?.position - toStation?.position)} นาที
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionPadding: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    marginVertical: 10,
  },
  routeContainer: {
    marginVertical: 10,
  },
  routeItem: {
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  station: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  btsTag: {
    fontSize: 12,
    color: '#999',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#333',
  },
  trainBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContainer: {
    paddingBottom: 60,
  },
});

export default TravelCostScreen;
