import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RouteSearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { startLocation } = route.params || {};

  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // To track which input is active

  useEffect(() => {
    fetch('http://192.168.1.155:5000/api/stations')
      .then(res => res.json())
      .then(data => {
        setStations(data);
        setFilteredStations(data);
      })
      .catch(error => {
        console.error('Error fetching stations:', error);
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลสถานีได้');
      });
  }, []);

  useEffect(() => {
    if (startLocation) {
      findNearestStation(startLocation.latitude, startLocation.longitude, 'start');
    }
  }, [startLocation]);

  useEffect(() => {
    if (startText) {
      filterStationsBySearch(startText);
    } else {
      setFilteredStations(stations);
    }
  }, [startText]);

  useEffect(() => {
    if (endText) {
      filterStationsByEndSearch(endText);
    } else {
      setFilteredStations(stations);
    }
  }, [endText]);

  const filterStationsBySearch = (text) => {
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(text.toLowerCase()) ||
      station.line.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStations(filtered);
  };

  const filterStationsByEndSearch = (text) => {
    const filtered = stations
      .filter(station =>
        station.name.toLowerCase().includes(text.toLowerCase()) ||
        station.line.toLowerCase().includes(text.toLowerCase())
      )
      .map(station => ({
        ...station,
        distance: getDistance(startStation?.lat || 0, startStation?.lon || 0, station.lat, station.lon),
      }))
      .sort((a, b) => a.distance - b.distance);

    setFilteredStations(filtered);
  };

  const findNearestStation = (lat, lon, type) => {
    const nearestStation = [...stations]
      .map(station => ({
        ...station,
        distance: getDistance(lat, lon, station.lat, station.lon),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (type === 'start') setStartStation(nearestStation);
    else setEndStation(nearestStation);
  };

  const handleStartTextChange = (text) => {
    setStartText(text);
    if (text === '') setStartStation(null);
  };

  const handleEndTextChange = (text) => {
    setEndText(text);
    if (text === '') setEndStation(null);
  };

  const onPress = async () => {
    if (startStation && endStation) {
      try {
        // ใส่ token ที่ได้จาก Postman ตรงนี้
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoiY2hva3VuOTYyQGdtYWlsLmNvbSIsImlhdCI6MTc0NTE1MTQzNywiZXhwIjoxNzQ1MTU1MDM3fQ.tPYIG6OoX4C2dnJHKGrm9I7v_XSeNxzq8NRopFe1zFk';
  
        const requestBody = {
          fromStationId: startStation.id,
          toStationId: endStation.id,
        };
  
        console.log('🔐 Token ที่จะส่ง:', token);
        console.log('📦 ข้อมูลที่จะส่ง:', requestBody);
  
        const response = await fetch('http://192.168.1.155:5000/api/travel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
  
        const data = await response.json();
  
        console.log('✅ Response:', data);
  
        if (response.ok) {
          navigation.navigate('TravelCost', { startStation, endStation, travelData: data });
        } else {
          Alert.alert('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถคำนวณค่าใช้จ่ายได้');
        }
      } catch (error) {
        console.error('Error posting data:', error);
        Alert.alert('Error', 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } else {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกสถานีต้นทางและสถานีปลายทาง');
    }
  };
  

  const isStationSelected = (station) => {
    return station.id === startStation?.id || station.id === endStation?.id;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ค้นหาเส้นทาง</Text>
      </View>

      <TextInput
        style={[styles.input, activeInput === 'start' && styles.activeInput]} // Apply active style for start
        placeholder="เลือกสถานที่ต้นทาง"
        placeholderTextColor="#666"
        value={startText || (startStation ? startStation.name : '')}
        onChangeText={handleStartTextChange}
        onFocus={() => setActiveInput('start')}
        onBlur={() => setActiveInput(null)}
      />

      <TextInput
        style={[styles.input, activeInput === 'end' && styles.activeInput]} // Apply active style for end
        placeholder="เลือกสถานที่ปลายทาง"
        placeholderTextColor="#666"
        value={endText || (endStation ? endStation.name : '')}
        onChangeText={handleEndTextChange}
        onFocus={() => setActiveInput('end')}
        onBlur={() => setActiveInput(null)}
      />
      <TouchableOpacity style={styles.searchButton} onPress={onPress}>
        <Text style={styles.buttonText}>ยืนยันการเลือก</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredStations}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.stationItem, isStationSelected(item) && { backgroundColor: '#e0e0e0' }]} // Add style for selected station
            onPress={() => {
              if (isStationSelected(item)) return; // Do nothing if the station is already selected
              if (!startStation) {
                setStartStation(item);
                setStartText(item.name);
              } else if (!endStation) {
                setEndStation(item);
                setEndText(item.name);
              } else {
                setStartStation(item);
                setStartText(item.name);
                setEndStation(null);
                setEndText('');
                Alert.alert('ระบบได้รีเซ็ตการเลือก', 'เลือกสถานีต้นทางใหม่แล้ว กรุณาเลือกสถานีปลายทางอีกครั้ง');
              }
            }}
          >
            <View style={styles.stationIcon}>
              <Text style={styles.stationText}>{item.id}</Text>
            </View>
            <View>
              <Text style={styles.stationName}>{item.name}</Text>
              <Text style={styles.stationEnglish}>{item.line}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    padding: 20 
  },
  header: { 
    backgroundColor: '#ffffff', 
    paddingVertical: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingLeft: 0,
    borderRadius: 10 
  },
  headerTitle: { 
    color: 'black', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginLeft: 10 
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 12, 
    fontSize: 18, 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    marginTop: 15 
  },
  activeInput: {
    borderColor: 'green',
    borderWidth: 2,
  },
  searchButton: { 
    marginTop: 20, 
    borderRadius: 10, 
    overflow: 'hidden',
    backgroundColor: '#337F5B',
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  stationIcon: {
    backgroundColor: '#7ED957',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  stationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stationEnglish: {
    fontSize: 14,
    color: '#555',
  },
});

export default RouteSearchScreen;
