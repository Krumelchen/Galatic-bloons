import SpriteKit

// MARK: - Tower Node

/// Visual representation of a placed tower on the isometric map.
/// Handles targeting, firing, and upgrade visuals.

final class TowerNode: SKNode {

    // MARK: - Properties

    var tower: Tower {
        didSet { updateVisuals() }
    }

    private var lastFireTime: TimeInterval = 0
    private weak var currentTarget: EnemyNode?

    // Visual components
    private let baseShape: SKShapeNode
    private let gunBarrel: SKShapeNode
    private let rangeIndicator: SKShapeNode
    private let levelLabel: SKLabelNode

    // Callbacks
    var onFireProjectile: ((_ from: CGPoint, _ to: SKNode, _ damage: Double, _ type: TowerType) -> Void)?

    // MARK: - Init

    init(tower: Tower) {
        self.tower = tower

        // Base: isometric diamond shape (smaller than tile)
        let baseW: CGFloat = 60
        let baseH: CGFloat = 30
        let basePath = CGMutablePath()
        basePath.move(to: CGPoint(x: 0,        y: baseH/2))
        basePath.addLine(to: CGPoint(x: baseW/2,  y: 0))
        basePath.addLine(to: CGPoint(x: 0,        y: -baseH/2))
        basePath.addLine(to: CGPoint(x: -baseW/2, y: 0))
        basePath.closeSubpath()
        baseShape = SKShapeNode(path: basePath)
        baseShape.fillColor = UIColor(red: 0.2, green: 0.5, blue: 1.0, alpha: 1)
        baseShape.strokeColor = .cyan
        baseShape.lineWidth = 2
        baseShape.zPosition = 1

        // Gun barrel: a small rectangle sticking up from base
        let barrelPath = CGMutablePath()
        barrelPath.addRect(CGRect(x: -4, y: 0, width: 8, height: 28))
        gunBarrel = SKShapeNode(path: barrelPath)
        gunBarrel.fillColor = UIColor(red: 0.5, green: 0.8, blue: 1.0, alpha: 1)
        gunBarrel.strokeColor = .white
        gunBarrel.lineWidth = 1
        gunBarrel.position = CGPoint(x: 0, y: baseH/2)
        gunBarrel.zPosition = 2

        // Range indicator circle (hidden by default)
        let range = tower.stats.range
        rangeIndicator = SKShapeNode(circleOfRadius: range)
        rangeIndicator.fillColor = UIColor.cyan.withAlphaComponent(0.05)
        rangeIndicator.strokeColor = UIColor.cyan.withAlphaComponent(0.4)
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

        super.init()
        addChild(baseShape)
        addChild(gunBarrel)
        addChild(rangeIndicator)
        addChild(levelLabel)
        isUserInteractionEnabled = false    // touch handled by IsometricMapNode
        updateVisuals()
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Update (called every frame by GameScene)

    func update(currentTime: TimeInterval, enemies: [EnemyNode]) {
        let stats = tower.stats
        let fireInterval = 1.0 / stats.fireRate

        guard currentTime - lastFireTime >= fireInterval else { return }

        // Find nearest living enemy within range
        if let target = nearestEnemy(enemies: enemies, range: stats.range) {
            fire(at: target, damage: stats.damage)
            lastFireTime = currentTime
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
        let myPos = position  // already in scene coordinates (set by GameScene)
        return enemies
            .filter { !$0.isDead }
            .filter { myPos.distance(to: $0.position) <= range }
            .min { myPos.distance(to: $0.position) < myPos.distance(to: $1.position) }
    }

    private func fire(at target: EnemyNode, damage: Double) {
        // Rotate gun barrel toward target (approximate, isometric is fake-3D)
        let dx = target.position.x - position.x
        let dy = target.position.y - position.y
        let angle = atan2(dy, dx) - .pi / 2
        gunBarrel.run(SKAction.rotate(toAngle: angle, duration: 0.05))

        onFireProjectile?(position, target, damage, tower.type)
    }

    private func updateVisuals() {
        let lvl = tower.upgradeLevel
        levelLabel.text = "Lv\(lvl)"

        // Color intensifies with upgrade level
        let intensity = 0.4 + Double(lvl - 1) * 0.2
        baseShape.fillColor = UIColor(red: CGFloat(0.2 * intensity), 
                                      green: CGFloat(0.5 * intensity),
                                      blue: 1.0, alpha: 1)

        // Update range indicator radius
        rangeIndicator.path = CGPath(ellipseIn: CGRect(
            x: -tower.stats.range, y: -tower.stats.range,
            width: tower.stats.range * 2, height: tower.stats.range * 2), transform: nil)
    }
}

// MARK: - CGPoint distance helper

private extension CGPoint {
    func distance(to other: CGPoint) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return sqrt(Double(dx * dx + dy * dy))
    }
}
