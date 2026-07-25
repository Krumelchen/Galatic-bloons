import SpriteKit

// MARK: - Enemy Node

/// Visual node for a single enemy walking along the screen-space path.
/// Health bar, sprite placeholder, and movement via SKAction sequence.

final class EnemyNode: SKNode {

    // MARK: - Properties

    let enemy: Enemy
    private let screenPath: [CGPoint]

    var isDead: Bool { enemy.isAlive == false }

    // Callbacks set by GameScene
    var onReachedCore: (() -> Void)?
    var onDied: ((_ reward: Int) -> Void)?

    // Visual components
    private let bodyShape: SKShapeNode
    private let hpBarBg: SKShapeNode
    private let hpBarFg: SKShapeNode

    private let hpBarWidth: CGFloat = 40
    private let hpBarHeight: CGFloat = 5

    // MARK: - Init

    init(enemy: Enemy, screenPath: [CGPoint]) {
        self.enemy = enemy
        self.screenPath = screenPath

        // Body placeholder: colored circle
        let radius: CGFloat = enemy.type == .xarrTank ? 20 : 14
        bodyShape = SKShapeNode(circleOfRadius: radius)
        bodyShape.fillColor = EnemyNode.color(for: enemy.type)
        bodyShape.strokeColor = .white
        bodyShape.lineWidth = 1.5
        bodyShape.zPosition = 1

        // HP bar background
        hpBarBg = SKShapeNode(rect: CGRect(x: -20, y: radius + 6,
                                           width: 40, height: 5), cornerRadius: 2)
        hpBarBg.fillColor = UIColor(white: 0.2, alpha: 0.8)
        hpBarBg.strokeColor = .clear
        hpBarBg.zPosition = 2

        // HP bar foreground (green → red)
        hpBarFg = SKShapeNode(rect: CGRect(x: -20, y: radius + 6,
                                           width: 40, height: 5), cornerRadius: 2)
        hpBarFg.fillColor = .green
        hpBarFg.strokeColor = .clear
        hpBarFg.zPosition = 3

        super.init()
        addChild(bodyShape)
        addChild(hpBarBg)
        addChild(hpBarFg)
        isUserInteractionEnabled = false

        // Start at spawn position
        if let start = screenPath.first {
            position = start
        }
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Movement

    /// Starts moving the enemy along the path. Call once after adding to the scene.
    func startMoving() {
        guard screenPath.count > 1 else { return }

        var actions: [SKAction] = []
        let speed = enemy.type.speed   // points per second

        for i in 1..<screenPath.count {
            let dest = screenPath[i]
            let dist = position.distance(to: dest)
            let duration = dist / speed
            actions.append(SKAction.move(to: dest, duration: duration))
        }

        // After last waypoint → reached core
        let coreAction = SKAction.run { [weak self] in
            self?.reachedCore()
        }
        actions.append(coreAction)

        run(SKAction.sequence(actions), withKey: "movement")
    }

    // MARK: - Damage

    func takeDamage(_ rawDamage: Double) {
        guard !isDead else { return }
        enemy.takeDamage(rawDamage)
        updateHPBar()

        // Flash red on hit
        bodyShape.run(SKAction.sequence([
            SKAction.colorize(with: .red, colorBlendFactor: 0.8, duration: 0.05),
            SKAction.colorize(with: EnemyNode.color(for: enemy.type), colorBlendFactor: 1.0, duration: 0.1)
        ]))

        if isDead { die() }
    }

    // MARK: - Private

    private func reachedCore() {
        guard !isDead else { return }
        removeAllActions()
        removeFromParent()
        onReachedCore?()
    }

    private func die() {
        removeAllActions()
        let reward = enemy.type.reward
        // Death explosion
        let explosion = SKEmitterNode()
        explosion.particleBirthRate = 60
        explosion.numParticlesToEmit = 20
        explosion.particleLifetime = 0.3
        explosion.particleSpeed = 60
        explosion.particleSpeedRange = 40
        explosion.particleColor = EnemyNode.color(for: enemy.type)
        explosion.particleScale = 0.3
        explosion.emissionAngleRange = .pi * 2
        if let parent = parent {
            explosion.position = position
            parent.addChild(explosion)
            explosion.run(SKAction.sequence([
                SKAction.wait(forDuration: 0.4),
                SKAction.removeFromParent()
            ]))
        }
        removeFromParent()
        onDied?(reward)
    }

    private func updateHPBar() {
        let fraction = max(0, CGFloat(enemy.hpFraction))
        hpBarFg.xScale = fraction
        hpBarFg.fillColor = fraction > 0.5 ? .green : (fraction > 0.25 ? .yellow : .red)
    }

    private static func color(for type: EnemyType) -> UIColor {
        switch type {
        case .xarrScout:    return UIColor(red: 1.0, green: 0.3, blue: 0.3, alpha: 1)
        case .xarrTank:     return UIColor(red: 0.6, green: 0.2, blue: 0.8, alpha: 1)
        case .xarrSwarm:    return UIColor(red: 1.0, green: 0.7, blue: 0.0, alpha: 1)
        case .xarrStealth:  return UIColor(red: 0.4, green: 0.4, blue: 0.6, alpha: 0.6)
        case .xarrArmored:  return UIColor(red: 0.3, green: 0.7, blue: 0.4, alpha: 1)
        case .xarrBoss:     return UIColor(red: 1.0, green: 0.1, blue: 0.5, alpha: 1)
        }
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
