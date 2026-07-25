import SpriteKit

// MARK: - Tower Node

/// Visual representation of a placed tower.
/// Each tower type has a distinct color scheme and barrel shape.
/// Phase 2: all 8 types with special effect callbacks.

final class TowerNode: SKNode {

    // MARK: - Properties

    var tower: Tower {
        didSet { updateVisuals() }
    }

    private var lastFireTime: TimeInterval = 0
    private var lastSolarTick: TimeInterval = 0
    private let solarTickInterval: TimeInterval = 5.0
    private let solarCreditPerTick: Int = 15

    // Visual components
    private let baseShape: SKShapeNode
    private let gunBarrel: SKShapeNode
    private let rangeIndicator: SKShapeNode
    private let levelLabel: SKLabelNode
    private let iconLabel: SKLabelNode

    // Callbacks
    var onFireProjectile: ((_ from: CGPoint, _ to: EnemyNode, _ damage: Double, _ type: TowerType) -> Void)?
    var onSpecialEffect: ((_ type: TowerType, _ target: EnemyNode) -> Void)?   // slow, stun, teleport
    var onGenerateCredits: ((_ amount: Int) -> Void)?                           // solar collector
    var onHealCore: ((_ amount: Int) -> Void)?                                  // nanobot repair

    // MARK: - Init

    init(tower: Tower) {
        self.tower = tower
        let colors = TowerNode.colors(for: tower.type)

        // Base: isometric diamond
        let baseW: CGFloat = 60
        let baseH: CGFloat = 30
        let basePath = CGMutablePath()
        basePath.move(to: CGPoint(x: 0,        y: baseH/2))
        basePath.addLine(to: CGPoint(x: baseW/2,  y: 0))
        basePath.addLine(to: CGPoint(x: 0,        y: -baseH/2))
        basePath.addLine(to: CGPoint(x: -baseW/2, y: 0))
        basePath.closeSubpath()
        baseShape = SKShapeNode(path: basePath)
        baseShape.fillColor = colors.fill
        baseShape.strokeColor = colors.stroke
        baseShape.lineWidth = 2
        baseShape.zPosition = 1

        // Gun barrel (shape varies by type)
        let barrelPath = TowerNode.barrelPath(for: tower.type)
        gunBarrel = SKShapeNode(path: barrelPath)
        gunBarrel.fillColor = colors.stroke
        gunBarrel.strokeColor = .white
        gunBarrel.lineWidth = 1
        gunBarrel.position = CGPoint(x: 0, y: baseH / 2)
        gunBarrel.zPosition = 2

        // Range indicator (hidden by default)
        rangeIndicator = SKShapeNode(circleOfRadius: tower.stats.range)
        rangeIndicator.fillColor = colors.stroke.withAlphaComponent(0.05)
        rangeIndicator.strokeColor = colors.stroke.withAlphaComponent(0.5)
        rangeIndicator.lineWidth = 1
        rangeIndicator.isHidden = true
        rangeIndicator.zPosition = 0

        // Level label
        levelLabel = SKLabelNode(text: "Lv1")
        levelLabel.fontSize = 10
        levelLabel.fontColor = .yellow
        levelLabel.fontName = "AvenirNext-Bold"
        levelLabel.position = CGPoint(x: 0, y: baseH/2 + 30)
        levelLabel.zPosition = 3

        // Tower type icon
        iconLabel = SKLabelNode(text: TowerNode.icon(for: tower.type))
        iconLabel.fontSize = 14
        iconLabel.verticalAlignmentMode = .center
        iconLabel.position = CGPoint(x: 0, y: 2)
        iconLabel.zPosition = 4

        super.init()
        addChild(baseShape)
        addChild(gunBarrel)
        addChild(rangeIndicator)
        addChild(levelLabel)
        addChild(iconLabel)
        isUserInteractionEnabled = false

        // Solar collector: animated spinning ring
        if tower.type == .solarCollector {
            let ring = SKShapeNode(circleOfRadius: 22)
            ring.fillColor = .clear
            ring.strokeColor = UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 0.7)
            ring.lineWidth = 2
            ring.zPosition = 1.5
            ring.run(SKAction.repeatForever(SKAction.rotate(byAngle: .pi * 2, duration: 3.0)))
            addChild(ring)
            gunBarrel.isHidden = true
        }

        // Nanobot repair: orbiting particles
        if tower.type == .nanobotRepair {
            for i in 0..<3 {
                let bot = SKShapeNode(circleOfRadius: 3)
                bot.fillColor = UIColor(red: 0.4, green: 1.0, blue: 0.6, alpha: 1)
                bot.strokeColor = .clear
                bot.zPosition = 1.5
                let orbit = SKNode()
                orbit.addChild(bot)
                bot.position = CGPoint(x: 18, y: 0)
                orbit.run(SKAction.repeatForever(
                    SKAction.rotate(byAngle: .pi * 2, duration: 2.0 + Double(i) * 0.4)))
                addChild(orbit)
            }
        }
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Update (called every frame by GameScene)

    func update(currentTime: TimeInterval, enemies: [EnemyNode]) {
        handleSolarIncome(currentTime: currentTime)

        let stats = tower.stats
        guard stats.fireRate > 0 else { return }   // passive towers (solar) don't fire
        let fireInterval = 1.0 / stats.fireRate
        guard currentTime - lastFireTime >= fireInterval else { return }

        switch tower.type {
        case .empPulse:
            // AoE stun: all enemies within range
            let inRange = enemies.filter { !$0.isDead && position.distance(to: $0.position) <= stats.range }
            if !inRange.isEmpty {
                inRange.forEach { onSpecialEffect?(.empPulse, $0) }
                showEMPPulse()
                lastFireTime = currentTime
            }
        case .nanobotRepair:
            // Heal the planet core a little
            onHealCore?(Int(stats.fireRate * 2))
            lastFireTime = currentTime
        default:
            if let target = nearestEnemy(enemies: enemies, range: stats.range) {
                fire(at: target, damage: stats.damage)
                lastFireTime = currentTime
            }
        }
    }

    // MARK: - Range Indicator

    func showRange() {
        rangeIndicator.isHidden = false
        rangeIndicator.run(SKAction.fadeIn(withDuration: 0.15))
    }

    func hideRange() {
        rangeIndicator.run(SKAction.fadeOut(withDuration: 0.15)) {
            self.rangeIndicator.isHidden = true
        }
    }

    // MARK: - Private

    private func nearestEnemy(enemies: [EnemyNode], range: Double) -> EnemyNode? {
        enemies
            .filter { !$0.isDead }
            .filter { position.distance(to: $0.position) <= range }
            .min { position.distance(to: $0.position) < position.distance(to: $1.position) }
    }

    private func fire(at target: EnemyNode, damage: Double) {
        let dx = target.position.x - position.x
        let dy = target.position.y - position.y
        let angle = atan2(dy, dx) - .pi / 2
        gunBarrel.run(SKAction.rotate(toAngle: angle, duration: 0.05))
        onFireProjectile?(position, target, damage, tower.type)
        // Post-fire special effects
        onSpecialEffect?(tower.type, target)
    }

    private func handleSolarIncome(currentTime: TimeInterval) {
        guard tower.type == .solarCollector else { return }
        let income = solarCreditPerTick * tower.upgradeLevel
        if currentTime - lastSolarTick >= solarTickInterval {
            onGenerateCredits?(income)
            lastSolarTick = currentTime
            // Credit pop label
            let pop = SKLabelNode(text: "+\(income)💰")
            pop.fontName = "AvenirNext-Bold"
            pop.fontSize = 12
            pop.fontColor = .yellow
            pop.position = CGPoint(x: 0, y: 30)
            pop.zPosition = 10
            addChild(pop)
            pop.run(SKAction.sequence([
                SKAction.group([
                    SKAction.moveBy(x: 0, y: 20, duration: 0.8),
                    SKAction.fadeOut(withDuration: 0.8)
                ]),
                SKAction.removeFromParent()
            ]))
        }
    }

    private func showEMPPulse() {
        let pulse = SKShapeNode(circleOfRadius: tower.stats.range)
        pulse.fillColor = UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 0.15)
        pulse.strokeColor = UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 0.8)
        pulse.lineWidth = 2
        pulse.zPosition = 5
        addChild(pulse)
        pulse.run(SKAction.sequence([
            SKAction.group([
                SKAction.scale(to: 1.3, duration: 0.3),
                SKAction.fadeOut(withDuration: 0.3)
            ]),
            SKAction.removeFromParent()
        ]))
    }

    private func updateVisuals() {
        let lvl = tower.upgradeLevel
        levelLabel.text = "Lv\(lvl)"
        let colors = TowerNode.colors(for: tower.type)
        // Brighten with upgrade level
        let mult = CGFloat(0.7 + Double(lvl - 1) * 0.15)
        baseShape.fillColor = colors.fill.withBrightness(mult)
        baseShape.strokeColor = colors.stroke
        rangeIndicator.path = CGPath(ellipseIn: CGRect(
            x: -tower.stats.range, y: -tower.stats.range,
            width: tower.stats.range * 2, height: tower.stats.range * 2), transform: nil)
        rangeIndicator.strokeColor = colors.stroke.withAlphaComponent(0.5)
    }

    // MARK: - Type-specific visuals

    private static func colors(for type: TowerType) -> (fill: UIColor, stroke: UIColor) {
        switch type {
        case .laserCannon:      return (UIColor(red:0.1,green:0.4,blue:0.9,alpha:1), .cyan)
        case .plasmaAoE:        return (UIColor(red:0.5,green:0.1,blue:0.8,alpha:1), UIColor(red:0.8,green:0.4,blue:1,alpha:1))
        case .ionSlow:          return (UIColor(red:0.0,green:0.5,blue:0.7,alpha:1), UIColor(red:0.3,green:0.9,blue:1,alpha:1))
        case .empPulse:         return (UIColor(red:0.6,green:0.6,blue:0.1,alpha:1), .yellow)
        case .missileSilo:      return (UIColor(red:0.6,green:0.2,blue:0.1,alpha:1), UIColor(red:1,green:0.4,blue:0.2,alpha:1))
        case .nanobotRepair:    return (UIColor(red:0.1,green:0.5,blue:0.2,alpha:1), UIColor(red:0.4,green:1,blue:0.5,alpha:1))
        case .quantumDisruptor: return (UIColor(red:0.4,green:0.0,blue:0.5,alpha:1), UIColor(red:0.8,green:0.2,blue:1,alpha:1))
        case .solarCollector:   return (UIColor(red:0.5,green:0.4,blue:0.0,alpha:1), UIColor(red:1,green:0.9,blue:0,alpha:1))
        }
    }

    private static func barrelPath(for type: TowerType) -> CGPath {
        let path = CGMutablePath()
        switch type {
        case .missileSilo:
            path.addRect(CGRect(x: -6, y: 0, width: 12, height: 35))
        case .plasmaAoE:
            path.addEllipse(in: CGRect(x: -8, y: 0, width: 16, height: 16))
        case .empPulse:
            // Antenna style: two small rectangles
            path.addRect(CGRect(x: -7, y: 0, width: 5, height: 22))
            path.addRect(CGRect(x: 2,  y: 0, width: 5, height: 22))
        default:
            path.addRect(CGRect(x: -4, y: 0, width: 8, height: 28))
        }
        return path
    }

    private static func icon(for type: TowerType) -> String {
        switch type {
        case .laserCannon:      return "⚡"
        case .plasmaAoE:        return "💥"
        case .ionSlow:          return "❄️"
        case .empPulse:         return "🌀"
        case .missileSilo:      return "🚀"
        case .nanobotRepair:    return "🔧"
        case .quantumDisruptor: return "🌀"
        case .solarCollector:   return "☀️"
        }
    }
}

// MARK: - CGPoint & UIColor helpers

private extension CGPoint {
    func distance(to other: CGPoint) -> Double {
        let dx = x - other.x; let dy = y - other.y
        return sqrt(Double(dx * dx + dy * dy))
    }
}

private extension UIColor {
    func withBrightness(_ factor: CGFloat) -> UIColor {
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getHue(&h, saturation: &s, brightness: &b, alpha: &a)
        return UIColor(hue: h, saturation: s, brightness: min(b * factor, 1.0), alpha: a)
    }
}

