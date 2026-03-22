// ============================================================
// data.js — Mock data + localStorage management
// ZappFit Performance Tracker
// ============================================================

const STORAGE_KEY = 'zappfit_elo_data';
const ELO_FLOOR = 800;
const ELO_START = 1200;

// ─── Seed Data ───────────────────────────────────────────────
const SEED_CLIENTS = [
  // === ESTABLISHED (15–100+ classes) ===
  {
    id: 'c01',
    name: 'Marcus Webb',
    initials: 'MW',
    location: 'Downtown',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2023-06-15',
    avatarColor: '#39B54A',
  },
  {
    id: 'c02',
    name: 'Sofia Reyes',
    initials: 'SR',
    location: 'Westside',
    classType: 'Strength',
    isYou: false,
    joinDate: '2023-04-10',
    avatarColor: '#E63946',
  },
  {
    id: 'c03',
    name: 'Jordan Blake',
    initials: 'JB',
    location: 'Downtown',
    classType: 'CrossFit',
    isYou: true,
    joinDate: '2023-07-01',
    avatarColor: '#457B9D',
  },
  {
    id: 'c04',
    name: 'Priya Sharma',
    initials: 'PS',
    location: 'Northgate',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2023-05-20',
    avatarColor: '#F4A261',
  },
  {
    id: 'c05',
    name: 'Devon Carter',
    initials: 'DC',
    location: 'Westside',
    classType: 'CrossFit',
    isYou: false,
    joinDate: '2022-11-08',
    avatarColor: '#A8DADC',
  },
  {
    id: 'c06',
    name: 'Leila Hassan',
    initials: 'LH',
    location: 'Downtown',
    classType: 'Strength',
    isYou: false,
    joinDate: '2022-09-14',
    avatarColor: '#C77DFF',
  },
  {
    id: 'c07',
    name: 'Tomás Rivera',
    initials: 'TR',
    location: 'Northgate',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2023-01-22',
    avatarColor: '#FFB703',
  },
  {
    id: 'c08',
    name: 'Aisha Okonkwo',
    initials: 'AO',
    location: 'Westside',
    classType: 'CrossFit',
    isYou: false,
    joinDate: '2023-03-05',
    avatarColor: '#06D6A0',
  },
  // === PROVISIONAL (5–14 classes) ===
  {
    id: 'c09',
    name: 'Ryan Cho',
    initials: 'RC',
    location: 'Downtown',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2024-11-01',
    avatarColor: '#FB8500',
  },
  {
    id: 'c10',
    name: 'Natalie Cruz',
    initials: 'NC',
    location: 'Northgate',
    classType: 'Strength',
    isYou: false,
    joinDate: '2024-10-15',
    avatarColor: '#8338EC',
  },
  {
    id: 'c11',
    name: 'Eli Thornton',
    initials: 'ET',
    location: 'Westside',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2024-12-03',
    avatarColor: '#3A86FF',
  },
  {
    id: 'c12',
    name: 'Mei-Ling Park',
    initials: 'MP',
    location: 'Downtown',
    classType: 'CrossFit',
    isYou: false,
    joinDate: '2024-11-20',
    avatarColor: '#FF006E',
  },
  // === NEW (< 5 classes, not on leaderboard) ===
  {
    id: 'c13',
    name: 'Zara Osei',
    initials: 'ZO',
    location: 'Northgate',
    classType: 'Strength',
    isYou: false,
    joinDate: '2025-02-10',
    avatarColor: '#FFBE0B',
  },
  {
    id: 'c14',
    name: 'Caleb Nguyen',
    initials: 'CN',
    location: 'Westside',
    classType: 'CrossFit',
    isYou: false,
    joinDate: '2025-03-01',
    avatarColor: '#2EC4B6',
  },
  {
    id: 'c15',
    name: 'Isla Mercer',
    initials: 'IM',
    location: 'Downtown',
    classType: 'HIIT',
    isYou: false,
    joinDate: '2025-03-10',
    avatarColor: '#E9C46A',
  },
];

// Pre-computed ELO history for established clients
// Each entry: { date, elo, delta, sessionId, rank, composite }
function generateHistory(clientId) {
  const histories = {
    c01: [
      { date: '2024-09-05', elo: 1200, delta: 0,   sessionId: 's001', rank: 3, composite: 0.52 },
      { date: '2024-09-12', elo: 1218, delta: +18,  sessionId: 's002', rank: 1, composite: 0.78 },
      { date: '2024-09-19', elo: 1232, delta: +14,  sessionId: 's003', rank: 2, composite: 0.71 },
      { date: '2024-09-26', elo: 1225, delta: -7,   sessionId: 's004', rank: 4, composite: 0.41 },
      { date: '2024-10-03', elo: 1241, delta: +16,  sessionId: 's005', rank: 1, composite: 0.83 },
      { date: '2024-10-10', elo: 1258, delta: +17,  sessionId: 's006', rank: 1, composite: 0.87 },
      { date: '2024-10-17', elo: 1249, delta: -9,   sessionId: 's007', rank: 3, composite: 0.44 },
      { date: '2024-10-24', elo: 1263, delta: +14,  sessionId: 's008', rank: 2, composite: 0.69 },
      { date: '2024-10-31', elo: 1279, delta: +16,  sessionId: 's009', rank: 1, composite: 0.88 },
      { date: '2024-11-07', elo: 1271, delta: -8,   sessionId: 's010', rank: 3, composite: 0.40 },
      { date: '2024-11-14', elo: 1288, delta: +17,  sessionId: 's011', rank: 1, composite: 0.86 },
      { date: '2024-11-21', elo: 1302, delta: +14,  sessionId: 's012', rank: 2, composite: 0.68 },
      { date: '2024-12-05', elo: 1315, delta: +13,  sessionId: 's013', rank: 2, composite: 0.70 },
      { date: '2024-12-19', elo: 1328, delta: +13,  sessionId: 's014', rank: 2, composite: 0.72 },
      { date: '2025-01-09', elo: 1341, delta: +13,  sessionId: 's015', rank: 1, composite: 0.81 },
      { date: '2025-01-23', elo: 1354, delta: +13,  sessionId: 's016', rank: 1, composite: 0.84 },
      { date: '2025-02-06', elo: 1342, delta: -12,  sessionId: 's017', rank: 3, composite: 0.39 },
      { date: '2025-02-20', elo: 1356, delta: +14,  sessionId: 's018', rank: 2, composite: 0.73 },
      { date: '2025-03-06', elo: 1371, delta: +15,  sessionId: 's019', rank: 1, composite: 0.90 },
      { date: '2025-03-13', elo: 1384, delta: +13,  sessionId: 's020', rank: 2, composite: 0.75 },
    ],
    c02: [
      { date: '2024-08-15', elo: 1200, delta: 0,   sessionId: 's101', rank: 2, composite: 0.60 },
      { date: '2024-08-22', elo: 1219, delta: +19,  sessionId: 's102', rank: 1, composite: 0.82 },
      { date: '2024-08-29', elo: 1237, delta: +18,  sessionId: 's103', rank: 1, composite: 0.85 },
      { date: '2024-09-05', elo: 1222, delta: -15,  sessionId: 's104', rank: 4, composite: 0.30 },
      { date: '2024-09-12', elo: 1244, delta: +22,  sessionId: 's105', rank: 1, composite: 0.92 },
      { date: '2024-09-19', elo: 1263, delta: +19,  sessionId: 's106', rank: 1, composite: 0.89 },
      { date: '2024-09-26', elo: 1248, delta: -15,  sessionId: 's107', rank: 4, composite: 0.28 },
      { date: '2024-10-03', elo: 1271, delta: +23,  sessionId: 's108', rank: 1, composite: 0.94 },
      { date: '2024-10-10', elo: 1290, delta: +19,  sessionId: 's109', rank: 1, composite: 0.88 },
      { date: '2024-10-17', elo: 1308, delta: +18,  sessionId: 's110', rank: 1, composite: 0.90 },
      { date: '2024-10-24', elo: 1325, delta: +17,  sessionId: 's111', rank: 1, composite: 0.87 },
      { date: '2024-11-07', elo: 1311, delta: -14,  sessionId: 's112', rank: 3, composite: 0.35 },
      { date: '2024-11-14', elo: 1331, delta: +20,  sessionId: 's113', rank: 1, composite: 0.91 },
      { date: '2024-11-28', elo: 1350, delta: +19,  sessionId: 's114', rank: 1, composite: 0.89 },
      { date: '2024-12-12', elo: 1368, delta: +18,  sessionId: 's115', rank: 1, composite: 0.86 },
      { date: '2025-01-09', elo: 1385, delta: +17,  sessionId: 's116', rank: 1, composite: 0.88 },
      { date: '2025-01-23', elo: 1401, delta: +16,  sessionId: 's117', rank: 1, composite: 0.87 },
      { date: '2025-02-13', elo: 1418, delta: +17,  sessionId: 's118', rank: 1, composite: 0.90 },
      { date: '2025-03-06', elo: 1404, delta: -14,  sessionId: 's119', rank: 3, composite: 0.33 },
      { date: '2025-03-13', elo: 1421, delta: +17,  sessionId: 's120', rank: 1, composite: 0.89 },
    ],
    c03: [ // Jordan Blake — "you"
      { date: '2024-09-10', elo: 1200, delta: 0,   sessionId: 's201', rank: 3, composite: 0.48 },
      { date: '2024-09-17', elo: 1185, delta: -15,  sessionId: 's202', rank: 5, composite: 0.22 },
      { date: '2024-09-24', elo: 1201, delta: +16,  sessionId: 's203', rank: 2, composite: 0.65 },
      { date: '2024-10-01', elo: 1218, delta: +17,  sessionId: 's204', rank: 1, composite: 0.80 },
      { date: '2024-10-08', elo: 1208, delta: -10,  sessionId: 's205', rank: 3, composite: 0.42 },
      { date: '2024-10-15', elo: 1226, delta: +18,  sessionId: 's206', rank: 1, composite: 0.83 },
      { date: '2024-10-22', elo: 1212, delta: -14,  sessionId: 's207', rank: 4, composite: 0.31 },
      { date: '2024-10-29', elo: 1230, delta: +18,  sessionId: 's208', rank: 1, composite: 0.82 },
      { date: '2024-11-05', elo: 1247, delta: +17,  sessionId: 's209', rank: 2, composite: 0.71 },
      { date: '2024-11-12', elo: 1262, delta: +15,  sessionId: 's210', rank: 2, composite: 0.68 },
      { date: '2024-11-19', elo: 1276, delta: +14,  sessionId: 's211', rank: 2, composite: 0.66 },
      { date: '2024-12-03', elo: 1265, delta: -11,  sessionId: 's212', rank: 3, composite: 0.37 },
      { date: '2024-12-17', elo: 1281, delta: +16,  sessionId: 's213', rank: 2, composite: 0.74 },
      { date: '2025-01-07', elo: 1295, delta: +14,  sessionId: 's214', rank: 2, composite: 0.69 },
      { date: '2025-01-21', elo: 1310, delta: +15,  sessionId: 's215', rank: 2, composite: 0.72 },
      { date: '2025-02-04', elo: 1326, delta: +16,  sessionId: 's216', rank: 1, composite: 0.85 },
      { date: '2025-02-18', elo: 1314, delta: -12,  sessionId: 's217', rank: 3, composite: 0.38 },
      { date: '2025-03-04', elo: 1329, delta: +15,  sessionId: 's218', rank: 2, composite: 0.71 },
      { date: '2025-03-11', elo: 1344, delta: +15,  sessionId: 's219', rank: 2, composite: 0.73 },
      { date: '2025-03-18', elo: 1358, delta: +14,  sessionId: 's220', rank: 2, composite: 0.70 },
    ],
    c04: [
      { date: '2024-10-01', elo: 1200, delta: 0,   sessionId: 's301', rank: 3, composite: 0.50 },
      { date: '2024-10-08', elo: 1182, delta: -18,  sessionId: 's302', rank: 5, composite: 0.20 },
      { date: '2024-10-15', elo: 1165, delta: -17,  sessionId: 's303', rank: 5, composite: 0.18 },
      { date: '2024-10-22', elo: 1184, delta: +19,  sessionId: 's304', rank: 1, composite: 0.86 },
      { date: '2024-10-29', elo: 1168, delta: -16,  sessionId: 's305', rank: 4, composite: 0.25 },
      { date: '2024-11-05', elo: 1152, delta: -16,  sessionId: 's306', rank: 4, composite: 0.27 },
      { date: '2024-11-12', elo: 1172, delta: +20,  sessionId: 's307', rank: 1, composite: 0.90 },
      { date: '2024-11-19', elo: 1157, delta: -15,  sessionId: 's308', rank: 4, composite: 0.26 },
      { date: '2024-11-26', elo: 1175, delta: +18,  sessionId: 's309', rank: 2, composite: 0.75 },
      { date: '2024-12-03', elo: 1162, delta: -13,  sessionId: 's310', rank: 3, composite: 0.40 },
      { date: '2024-12-10', elo: 1180, delta: +18,  sessionId: 's311', rank: 2, composite: 0.78 },
      { date: '2024-12-17', elo: 1166, delta: -14,  sessionId: 's312', rank: 4, composite: 0.29 },
      { date: '2025-01-07', elo: 1184, delta: +18,  sessionId: 's313', rank: 2, composite: 0.77 },
      { date: '2025-01-21', elo: 1169, delta: -15,  sessionId: 's314', rank: 4, composite: 0.28 },
      { date: '2025-02-04', elo: 1188, delta: +19,  sessionId: 's315', rank: 1, composite: 0.88 },
      { date: '2025-02-18', elo: 1174, delta: -14,  sessionId: 's316', rank: 3, composite: 0.36 },
    ],
    c05: [
      { date: '2023-11-01', elo: 1200, delta: 0,   sessionId: 's401', rank: 2, composite: 0.62 },
      { date: '2023-11-08', elo: 1221, delta: +21,  sessionId: 's402', rank: 1, composite: 0.88 },
      { date: '2023-11-15', elo: 1239, delta: +18,  sessionId: 's403', rank: 1, composite: 0.85 },
      { date: '2023-11-22', elo: 1258, delta: +19,  sessionId: 's404', rank: 1, composite: 0.87 },
      { date: '2023-12-06', elo: 1242, delta: -16,  sessionId: 's405', rank: 4, composite: 0.28 },
      { date: '2023-12-13', elo: 1261, delta: +19,  sessionId: 's406', rank: 1, composite: 0.89 },
      { date: '2024-01-10', elo: 1279, delta: +18,  sessionId: 's407', rank: 1, composite: 0.86 },
      { date: '2024-01-17', elo: 1295, delta: +16,  sessionId: 's408', rank: 2, composite: 0.73 },
      { date: '2024-02-07', elo: 1310, delta: +15,  sessionId: 's409', rank: 2, composite: 0.71 },
      { date: '2024-02-14', elo: 1298, delta: -12,  sessionId: 's410', rank: 3, composite: 0.38 },
      { date: '2024-03-06', elo: 1313, delta: +15,  sessionId: 's411', rank: 2, composite: 0.70 },
      { date: '2024-04-10', elo: 1329, delta: +16,  sessionId: 's412', rank: 1, composite: 0.84 },
      { date: '2024-05-08', elo: 1345, delta: +16,  sessionId: 's413', rank: 1, composite: 0.83 },
      { date: '2024-06-12', elo: 1360, delta: +15,  sessionId: 's414', rank: 2, composite: 0.72 },
      { date: '2024-08-07', elo: 1374, delta: +14,  sessionId: 's415', rank: 2, composite: 0.70 },
      { date: '2024-10-02', elo: 1388, delta: +14,  sessionId: 's416', rank: 2, composite: 0.69 },
      { date: '2024-12-04', elo: 1401, delta: +13,  sessionId: 's417', rank: 2, composite: 0.68 },
      { date: '2025-01-15', elo: 1414, delta: +13,  sessionId: 's418', rank: 2, composite: 0.67 },
    ],
    c06: [
      { date: '2023-09-14', elo: 1200, delta: 0,   sessionId: 's501', rank: 1, composite: 0.75 },
      { date: '2023-09-21', elo: 1222, delta: +22,  sessionId: 's502', rank: 1, composite: 0.91 },
      { date: '2023-09-28', elo: 1244, delta: +22,  sessionId: 's503', rank: 1, composite: 0.93 },
      { date: '2023-10-05', elo: 1263, delta: +19,  sessionId: 's504', rank: 1, composite: 0.88 },
      { date: '2023-10-12', elo: 1280, delta: +17,  sessionId: 's505', rank: 2, composite: 0.76 },
      { date: '2023-10-19', elo: 1265, delta: -15,  sessionId: 's506', rank: 4, composite: 0.29 },
      { date: '2023-11-02', elo: 1283, delta: +18,  sessionId: 's507', rank: 1, composite: 0.87 },
      { date: '2023-11-09', elo: 1300, delta: +17,  sessionId: 's508', rank: 1, composite: 0.85 },
      { date: '2023-11-16', elo: 1317, delta: +17,  sessionId: 's509', rank: 1, composite: 0.84 },
      { date: '2023-12-07', elo: 1334, delta: +17,  sessionId: 's510', rank: 1, composite: 0.83 },
      { date: '2024-01-11', elo: 1350, delta: +16,  sessionId: 's511', rank: 1, composite: 0.82 },
      { date: '2024-02-08', elo: 1365, delta: +15,  sessionId: 's512', rank: 2, composite: 0.73 },
      { date: '2024-03-14', elo: 1380, delta: +15,  sessionId: 's513', rank: 2, composite: 0.71 },
      { date: '2024-04-11', elo: 1395, delta: +15,  sessionId: 's514', rank: 2, composite: 0.70 },
      { date: '2024-06-13', elo: 1409, delta: +14,  sessionId: 's515', rank: 2, composite: 0.69 },
      { date: '2024-08-08', elo: 1423, delta: +14,  sessionId: 's516', rank: 2, composite: 0.68 },
      { date: '2024-10-10', elo: 1436, delta: +13,  sessionId: 's517', rank: 2, composite: 0.67 },
      { date: '2024-12-05', elo: 1449, delta: +13,  sessionId: 's518', rank: 2, composite: 0.66 },
      { date: '2025-01-16', elo: 1462, delta: +13,  sessionId: 's519', rank: 1, composite: 0.80 },
      { date: '2025-03-06', elo: 1474, delta: +12,  sessionId: 's520', rank: 2, composite: 0.65 },
    ],
    c07: [
      { date: '2024-01-25', elo: 1200, delta: 0,   sessionId: 's601', rank: 3, composite: 0.50 },
      { date: '2024-02-01', elo: 1216, delta: +16,  sessionId: 's602', rank: 2, composite: 0.68 },
      { date: '2024-02-08', elo: 1200, delta: -16,  sessionId: 's603', rank: 4, composite: 0.28 },
      { date: '2024-02-15', elo: 1218, delta: +18,  sessionId: 's604', rank: 1, composite: 0.82 },
      { date: '2024-02-22', elo: 1205, delta: -13,  sessionId: 's605', rank: 3, composite: 0.41 },
      { date: '2024-03-07', elo: 1222, delta: +17,  sessionId: 's606', rank: 2, composite: 0.74 },
      { date: '2024-03-14', elo: 1237, delta: +15,  sessionId: 's607', rank: 2, composite: 0.69 },
      { date: '2024-03-21', elo: 1222, delta: -15,  sessionId: 's608', rank: 4, composite: 0.27 },
      { date: '2024-04-04', elo: 1240, delta: +18,  sessionId: 's609', rank: 1, composite: 0.85 },
      { date: '2024-04-11', elo: 1255, delta: +15,  sessionId: 's610', rank: 2, composite: 0.70 },
      { date: '2024-05-09', elo: 1242, delta: -13,  sessionId: 's611', rank: 3, composite: 0.39 },
      { date: '2024-06-06', elo: 1257, delta: +15,  sessionId: 's612', rank: 2, composite: 0.71 },
      { date: '2024-07-11', elo: 1271, delta: +14,  sessionId: 's613', rank: 2, composite: 0.69 },
      { date: '2024-09-05', elo: 1257, delta: -14,  sessionId: 's614', rank: 3, composite: 0.37 },
      { date: '2024-11-07', elo: 1271, delta: +14,  sessionId: 's615', rank: 2, composite: 0.68 },
      { date: '2025-01-09', elo: 1284, delta: +13,  sessionId: 's616', rank: 2, composite: 0.66 },
    ],
    c08: [
      { date: '2024-03-07', elo: 1200, delta: 0,   sessionId: 's701', rank: 2, composite: 0.58 },
      { date: '2024-03-14', elo: 1217, delta: +17,  sessionId: 's702', rank: 1, composite: 0.80 },
      { date: '2024-03-21', elo: 1200, delta: -17,  sessionId: 's703', rank: 4, composite: 0.26 },
      { date: '2024-03-28', elo: 1219, delta: +19,  sessionId: 's704', rank: 1, composite: 0.87 },
      { date: '2024-04-04', elo: 1237, delta: +18,  sessionId: 's705', rank: 1, composite: 0.84 },
      { date: '2024-04-11', elo: 1252, delta: +15,  sessionId: 's706', rank: 2, composite: 0.71 },
      { date: '2024-04-18', elo: 1267, delta: +15,  sessionId: 's707', rank: 2, composite: 0.72 },
      { date: '2024-04-25', elo: 1253, delta: -14,  sessionId: 's708', rank: 3, composite: 0.36 },
      { date: '2024-05-09', elo: 1268, delta: +15,  sessionId: 's709', rank: 2, composite: 0.70 },
      { date: '2024-05-23', elo: 1282, delta: +14,  sessionId: 's710', rank: 2, composite: 0.68 },
      { date: '2024-06-06', elo: 1295, delta: +13,  sessionId: 's711', rank: 2, composite: 0.67 },
      { date: '2024-07-11', elo: 1309, delta: +14,  sessionId: 's712', rank: 1, composite: 0.81 },
      { date: '2024-08-08', elo: 1295, delta: -14,  sessionId: 's713', rank: 3, composite: 0.35 },
      { date: '2024-09-12', elo: 1309, delta: +14,  sessionId: 's714', rank: 2, composite: 0.69 },
      { date: '2024-11-14', elo: 1322, delta: +13,  sessionId: 's715', rank: 2, composite: 0.67 },
      { date: '2025-01-16', elo: 1335, delta: +13,  sessionId: 's716', rank: 2, composite: 0.66 },
    ],
    // PROVISIONAL
    c09: [
      { date: '2025-01-10', elo: 1200, delta: 0,   sessionId: 's801', rank: 2, composite: 0.60 },
      { date: '2025-01-17', elo: 1224, delta: +24,  sessionId: 's802', rank: 1, composite: 0.85 },
      { date: '2025-01-24', elo: 1206, delta: -18,  sessionId: 's803', rank: 4, composite: 0.24 },
      { date: '2025-01-31', elo: 1232, delta: +26,  sessionId: 's804', rank: 1, composite: 0.90 },
      { date: '2025-02-07', elo: 1212, delta: -20,  sessionId: 's805', rank: 5, composite: 0.15 },
      { date: '2025-02-14', elo: 1238, delta: +26,  sessionId: 's806', rank: 1, composite: 0.88 },
      { date: '2025-02-21', elo: 1262, delta: +24,  sessionId: 's807', rank: 1, composite: 0.91 },
    ],
    c10: [
      { date: '2025-01-20', elo: 1200, delta: 0,   sessionId: 's901', rank: 3, composite: 0.48 },
      { date: '2025-01-27', elo: 1178, delta: -22,  sessionId: 's902', rank: 5, composite: 0.18 },
      { date: '2025-02-03', elo: 1200, delta: +22,  sessionId: 's903', rank: 1, composite: 0.86 },
      { date: '2025-02-10', elo: 1182, delta: -18,  sessionId: 's904', rank: 4, composite: 0.22 },
      { date: '2025-02-17', elo: 1204, delta: +22,  sessionId: 's905', rank: 1, composite: 0.87 },
      { date: '2025-02-24', elo: 1183, delta: -21,  sessionId: 's906', rank: 4, composite: 0.21 },
    ],
    c11: [
      { date: '2025-02-06', elo: 1200, delta: 0,   sessionId: 'sa01', rank: 2, composite: 0.58 },
      { date: '2025-02-13', elo: 1222, delta: +22,  sessionId: 'sa02', rank: 1, composite: 0.84 },
      { date: '2025-02-20', elo: 1204, delta: -18,  sessionId: 'sa03', rank: 4, composite: 0.23 },
      { date: '2025-02-27', elo: 1228, delta: +24,  sessionId: 'sa04', rank: 1, composite: 0.88 },
      { date: '2025-03-06', elo: 1208, delta: -20,  sessionId: 'sa05', rank: 4, composite: 0.22 },
      { date: '2025-03-13', elo: 1232, delta: +24,  sessionId: 'sa06', rank: 1, composite: 0.89 },
      { date: '2025-03-20', elo: 1214, delta: -18,  sessionId: 'sa07', rank: 3, composite: 0.35 },
    ],
    c12: [
      { date: '2025-01-23', elo: 1200, delta: 0,   sessionId: 'sb01', rank: 2, composite: 0.62 },
      { date: '2025-01-30', elo: 1224, delta: +24,  sessionId: 'sb02', rank: 1, composite: 0.87 },
      { date: '2025-02-06', elo: 1246, delta: +22,  sessionId: 'sb03', rank: 1, composite: 0.90 },
      { date: '2025-02-13', elo: 1268, delta: +22,  sessionId: 'sb04', rank: 1, composite: 0.92 },
      { date: '2025-02-20', elo: 1247, delta: -21,  sessionId: 'sb05', rank: 4, composite: 0.20 },
      { date: '2025-02-27', elo: 1269, delta: +22,  sessionId: 'sb06', rank: 1, composite: 0.89 },
    ],
    // NEW (< 5 classes)
    c13: [
      { date: '2025-03-06', elo: 1200, delta: 0,   sessionId: 'sc01', rank: 3, composite: 0.50 },
      { date: '2025-03-13', elo: 1180, delta: -20,  sessionId: 'sc02', rank: 4, composite: 0.25 },
      { date: '2025-03-20', elo: 1204, delta: +24,  sessionId: 'sc03', rank: 1, composite: 0.88 },
    ],
    c14: [
      { date: '2025-03-08', elo: 1200, delta: 0,   sessionId: 'sd01', rank: 2, composite: 0.58 },
      { date: '2025-03-15', elo: 1224, delta: +24,  sessionId: 'sd02', rank: 1, composite: 0.86 },
    ],
    c15: [
      { date: '2025-03-12', elo: 1200, delta: 0,   sessionId: 'se01', rank: 2, composite: 0.55 },
      { date: '2025-03-19', elo: 1178, delta: -22,  sessionId: 'se02', rank: 4, composite: 0.22 },
      { date: '2025-03-22', elo: 1200, delta: +22,  sessionId: 'se03', rank: 1, composite: 0.85 },
    ],
  };
  return histories[clientId] || [];
}

// ─── Build complete client objects ────────────────────────────
function buildSeedData() {
  return SEED_CLIENTS.map(base => {
    const history = generateHistory(base.id);
    const currentElo = history.length > 0 ? history[history.length - 1].elo : ELO_START;
    const prevElo = history.length > 1 ? history[history.length - 2].elo : currentElo;
    const totalClasses = history.length;

    // Personal records
    const maxComposite = history.reduce((max, h) => Math.max(max, h.composite || 0), 0);
    const bestRank = history.reduce((best, h) => Math.min(best, h.rank || 99), 99);

    // Streak: count consecutive most-recent sessions where rank <= 2
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].rank <= 2) streak++;
      else break;
    }

    // Last active
    const lastActive = history.length > 0 ? history[history.length - 1].date : base.joinDate;

    // K factor
    let kFactor = 40;
    if (totalClasses >= 100) kFactor = 10;
    else if (totalClasses >= 15) kFactor = 20;

    // Leaderboard status
    let status = 'new'; // < 5 classes
    if (totalClasses >= 15) status = 'established';
    else if (totalClasses >= 5) status = 'provisional';

    return {
      ...base,
      elo: currentElo,
      prevElo,
      history,
      totalClasses,
      kFactor,
      status,
      lastActive,
      bestRank,
      maxComposite: Math.round(maxComposite * 100) / 100,
      streak,
    };
  });
}

// ─── localStorage helpers ─────────────────────────────────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with seed to pick up any new seed fields
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage, using seed data.', e);
  }
  return buildSeedData();
}

function saveData(clients) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.warn('Failed to save to localStorage.', e);
  }
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return buildSeedData();
}

// ─── Client helpers ────────────────────────────────────────────
function getClientById(clients, id) {
  return clients.find(c => c.id === id) || null;
}

function getSortedLeaderboard(clients) {
  // Only show clients with >= 5 classes
  return clients
    .filter(c => c.totalClasses >= 5)
    .sort((a, b) => b.elo - a.elo);
}

function updateClientAfterSession(client, newElo, composite, rankInClass) {
  const prevElo = client.elo;
  const delta = Math.round(newElo - prevElo);
  const date = new Date().toISOString().split('T')[0];

  const sessionEntry = {
    date,
    elo: Math.round(newElo),
    delta,
    sessionId: 'sim_' + Date.now() + '_' + client.id,
    rank: rankInClass,
    composite: Math.round(composite * 1000) / 1000,
  };

  client.history.push(sessionEntry);
  client.prevElo = prevElo;
  client.elo = Math.round(newElo);
  client.totalClasses = client.history.length;
  client.lastActive = date;

  // Update k-factor
  if (client.totalClasses >= 100) client.kFactor = 10;
  else if (client.totalClasses >= 15) client.kFactor = 20;
  else client.kFactor = 40;

  // Update status
  if (client.totalClasses >= 15) client.status = 'established';
  else if (client.totalClasses >= 5) client.status = 'provisional';
  else client.status = 'new';

  // Update best rank
  if (rankInClass < client.bestRank) client.bestRank = rankInClass;

  // Update max composite
  if (composite > client.maxComposite) client.maxComposite = Math.round(composite * 100) / 100;

  // Streak
  let streak = 0;
  for (let i = client.history.length - 1; i >= 0; i--) {
    if (client.history[i].rank <= 2) streak++;
    else break;
  }
  client.streak = streak;

  return client;
}

// Export to global scope
window.ZappData = {
  STORAGE_KEY,
  ELO_FLOOR,
  ELO_START,
  loadData,
  saveData,
  resetData,
  getClientById,
  getSortedLeaderboard,
  updateClientAfterSession,
  buildSeedData,
};
