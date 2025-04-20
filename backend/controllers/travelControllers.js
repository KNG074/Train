const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const { getNextTrainInfo } = require('../services/trainService'); // import ฟังก์ชันคำนวณเวลา
//หน้าเก็บประวัติการเดินทาง และก็คำนวณค่าใ้ชจ่าย

// POST /api/travel
exports.addTravelHistory = async (req, res) => {
  const { fromStationId, toStationId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
  }

  try {
    const fromStation = await prisma.station.findUnique({ where: { id: fromStationId } });
    const toStation = await prisma.station.findUnique({ where: { id: toStationId } });

    if (!fromStation || !toStation) {
      return res.status(404).json({ message: "สถานีไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" });
    }

    //คำนวณค่าใช้จ่ายของสถานีรถไฟ
    const stationDiff = Math.abs(fromStation.position - toStation.position);
    const price = 15 * stationDiff;

    await prisma.travelHistory.create({
      data: {
        userId,
        fromStationId,
        toStationId,
        price,
      },
    });

    res.status(201).json({ message: "เลือกสถานีสำเร็จ" });

  } catch (error) {
    console.error("Error creating travel history:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดขณะบันทึกข้อมูล", error: error.message });
  }
};

// GET /api/travel
exports.getLatestTravelHistory = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ message: "กรุณาเข้าสู่ระบบเพื่อดูประวัติ" });
  }

  try {
    const latestHistory = await prisma.travelHistory.findFirst({
      where: { userId },
      orderBy: { traveledAt: 'desc' },
      include: {
        fromStation: true,
        toStation: true,
      },
    }); 

    if (!latestHistory) {
      return res.status(404).json({ message: "ไม่พบประวัติการเดินทาง" });
    }

    const trainInfo = await getNextTrainInfo(
      latestHistory.fromStation.name,
      latestHistory.toStation.name
    );

    res.status(200).json({
      message: "ดึงข้อมูลการเดินทางล่าสุดสำเร็จ",
      travelHistory: latestHistory,
      trainInfo,
    });

  } catch (error) {
    console.error("Error fetching travel history:", error);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้", error: error.message });
  }
};



  exports.getTravelHistory = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const history = await prisma.travelHistory.findMany({
        where: { userId: parseInt(userId) },
        include: {
          fromStation: true,
          toStation: true,
        },
        orderBy: {
          traveledAt: 'desc',
        },
      });

  
      res.json(history);
    } catch (error) {
      console.error("Error getting travel history:", error);
      res.status(500).json({ message: "Failed to get travel history." });
    }
  };


  