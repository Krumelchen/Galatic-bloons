import Foundation

// MARK: - Tower Type

enum TowerType: String, Codable, CaseIterable {
    case laserCannon
    case plasmaAoE
    case ionSlow
    case empPulse
    case missileSilo
    case nanobotRepair
    case quantumDisruptor
    case solarCollector

    var displayName: String {
        switch self {
        case .laserCannon:      return "Laser Cannon"
        case .plasmaAoE:        return "Plasma AoE"
        case .ionSlow:          return "Ion Slowfield"
        case .empPulse:         return "EMP Pulse"
        case .missileSilo:      return "Missile Silo"
        case .nanobotRepair:    return "Nanobot Repair"
        case .quantumDisruptor: return "Quantum Disruptor"
        case .solarCollector:   return "Solar Collector"
        }
    }

    var baseCost: Int {
        switch self {
        case .laserCannon:      return 100
        case .plasmaAoE:        return 150
        case .ionSlow:          return 120
        case .empPulse:         return 200
        case .missileSilo:      return 250
        case .nanobotRepair:    return 180
        case .quantumDisruptor: return 300
        case .solarCollector:   return 200
        }
    }
}

// MARK: - Tower Stats per Level

struct TowerStats {
    let damage: Double
    let range: Double       // in screen points
    let fireRate: Double    // shots per second
    let upgradeCost: Int
}

// MARK: - Tower Model

struct Tower: Identifiable {
    let id: UUID
    let type: TowerType
    var upgradeLevel: Int       // 1, 2, or 3
    var gridCol: Int
    var gridRow: Int

    init(type: TowerType, gridCol: Int, gridRow: Int) {
        self.id = UUID()
        self.type = type
        self.upgradeLevel = 1
        self.gridCol = gridCol
        self.gridRow = gridRow
    }

    var stats: TowerStats {
        Tower.stats(for: type, level: upgradeLevel)
    }

    var sellValue: Int {
        let totalSpent = type.baseCost + (1..<upgradeLevel).reduce(0) { sum, lvl in
            sum + Tower.stats(for: type, level: lvl).upgradeCost
        }
        return Int(Double(totalSpent) * 0.6)
    }

    var canUpgrade: Bool { upgradeLevel < 3 }

    var upgradeCost: Int {
        canUpgrade ? Tower.stats(for: type, level: upgradeLevel).upgradeCost : 0
    }

    // MARK: - Stats table

    static func stats(for type: TowerType, level: Int) -> TowerStats {
        switch type {
        case .laserCannon:
            let table: [TowerStats] = [
                TowerStats(damage: 10, range: 160, fireRate: 1.0, upgradeCost: 80),
                TowerStats(damage: 18, range: 180, fireRate: 1.4, upgradeCost: 120),
                TowerStats(damage: 30, range: 200, fireRate: 1.8, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .plasmaAoE:
            let table: [TowerStats] = [
                TowerStats(damage: 8,  range: 140, fireRate: 0.5, upgradeCost: 120),
                TowerStats(damage: 14, range: 160, fireRate: 0.7, upgradeCost: 180),
                TowerStats(damage: 22, range: 180, fireRate: 0.9, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .ionSlow:
            let table: [TowerStats] = [
                TowerStats(damage: 3,  range: 150, fireRate: 1.5, upgradeCost: 100),
                TowerStats(damage: 5,  range: 170, fireRate: 2.0, upgradeCost: 140),
                TowerStats(damage: 8,  range: 190, fireRate: 2.5, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .empPulse:
            let table: [TowerStats] = [
                TowerStats(damage: 5,  range: 180, fireRate: 0.3, upgradeCost: 160),
                TowerStats(damage: 8,  range: 200, fireRate: 0.5, upgradeCost: 240),
                TowerStats(damage: 12, range: 220, fireRate: 0.7, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .missileSilo:
            let table: [TowerStats] = [
                TowerStats(damage: 40, range: 240, fireRate: 0.4, upgradeCost: 200),
                TowerStats(damage: 65, range: 260, fireRate: 0.6, upgradeCost: 280),
                TowerStats(damage: 100, range:280, fireRate: 0.8, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .nanobotRepair:
            let table: [TowerStats] = [
                TowerStats(damage: 0,  range: 150, fireRate: 1.0, upgradeCost: 140),
                TowerStats(damage: 0,  range: 170, fireRate: 1.5, upgradeCost: 200),
                TowerStats(damage: 0,  range: 190, fireRate: 2.0, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .quantumDisruptor:
            let table: [TowerStats] = [
                TowerStats(damage: 0,  range: 160, fireRate: 0.2, upgradeCost: 240),
                TowerStats(damage: 0,  range: 180, fireRate: 0.3, upgradeCost: 320),
                TowerStats(damage: 0,  range: 200, fireRate: 0.4, upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        case .solarCollector:
            let table: [TowerStats] = [
                TowerStats(damage: 0,  range: 0,   fireRate: 0,   upgradeCost: 160),
                TowerStats(damage: 0,  range: 0,   fireRate: 0,   upgradeCost: 220),
                TowerStats(damage: 0,  range: 0,   fireRate: 0,   upgradeCost: 0)
            ]
            return table[min(level - 1, 2)]
        }
    }
}
