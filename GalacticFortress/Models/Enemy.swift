import Foundation

// MARK: - Enemy Type

enum EnemyType: String, Codable, CaseIterable {
    case xarrScout
    case xarrTank
    case xarrSwarm
    case xarrStealth
    case xarrArmored
    case xarrBoss

    var displayName: String {
        switch self {
        case .xarrScout:    return "Xarr Scout"
        case .xarrTank:     return "Xarr Tank"
        case .xarrSwarm:    return "Xarr Swarm"
        case .xarrStealth:  return "Xarr Stealth"
        case .xarrArmored:  return "Xarr Armored"
        case .xarrBoss:     return "Xarr Boss"
        }
    }

    // Base stats
    var baseHP: Int {
        switch self {
        case .xarrScout:    return 50
        case .xarrTank:     return 200
        case .xarrSwarm:    return 25
        case .xarrStealth:  return 80
        case .xarrArmored:  return 150
        case .xarrBoss:     return 1000
        }
    }

    /// Movement speed in screen points per second
    var speed: Double {
        switch self {
        case .xarrScout:    return 80.0
        case .xarrTank:     return 30.0
        case .xarrSwarm:    return 100.0
        case .xarrStealth:  return 60.0
        case .xarrArmored:  return 40.0
        case .xarrBoss:     return 20.0
        }
    }

    /// Credits rewarded on kill
    var reward: Int {
        switch self {
        case .xarrScout:    return 10
        case .xarrTank:     return 30
        case .xarrSwarm:    return 5
        case .xarrStealth:  return 20
        case .xarrArmored:  return 25
        case .xarrBoss:     return 200
        }
    }

    /// Damage dealt to the planet core when reaching it
    var coreDamage: Int {
        switch self {
        case .xarrScout:    return 5
        case .xarrTank:     return 20
        case .xarrSwarm:    return 3
        case .xarrStealth:  return 8
        case .xarrArmored:  return 15
        case .xarrBoss:     return 100
        }
    }

    /// Armor value reduces incoming damage (as a multiplier, 0.0 = full damage, 1.0 = immune)
    var armorReduction: Double {
        switch self {
        case .xarrArmored:  return 0.4
        case .xarrBoss:     return 0.2
        default:            return 0.0
        }
    }

    var isStealth: Bool { self == .xarrStealth }
}

// MARK: - Enemy Runtime Model

/// Mutable runtime state for a single enemy instance on the battlefield.
class Enemy {
    let id: UUID
    let type: EnemyType
    var hp: Int
    let maxHp: Int
    var currentPathIndex: Int   // index into the screen-space path array
    var isAlive: Bool

    init(type: EnemyType) {
        self.id = UUID()
        self.type = type
        self.hp = type.baseHP
        self.maxHp = type.baseHP
        self.currentPathIndex = 0
        self.isAlive = true
    }

    /// Apply damage respecting armor. Returns actual damage dealt.
    @discardableResult
    func takeDamage(_ rawDamage: Double) -> Double {
        let reduction = type.armorReduction
        let actual = rawDamage * (1.0 - reduction)
        hp -= Int(actual)
        if hp <= 0 {
            hp = 0
            isAlive = false
        }
        return actual
    }

    var hpFraction: Double {
        guard maxHp > 0 else { return 0 }
        return Double(hp) / Double(maxHp)
    }
}
