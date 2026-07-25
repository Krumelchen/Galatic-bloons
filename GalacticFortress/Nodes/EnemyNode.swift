import SpriteKit

// MARK: - Enemy Node

/// Visual node for a single enemy walking along the screen-space path.
/// Supports slow, stun, stealth, and quantum-teleport effects.

final class EnemyNode: SKNode {

    // MARK: - Properties

    let enemy: Enemy
    private let screenPath: [CGPoint]

    var isDead: Bool { !enemy.isAlive }

    // Status effects
    private(set) var isSlowed: Bool = false
    private(set) var isStunned: Bool = false
    private var currentSpeedMultiplier: Double = 1.0
    private var statusTimers: [DispatchWorkItem] = []

    // Stealth icon
    private let stealthOverlay: SKShapeNode?

    // Callbacks set by GameScene
    var onReachedCore: (() -> Void)?
    var onDied: ((_ reward: Int) -> Void)?

    // Visual components
    private let bodyShape: SKShapeNode
    private let hpBarBg: SKShapeNode
    private let hpBarFg: SKShapeNode
    private let typeLabel: SKLabelNode     // shows enemy type abbreviation

    // MARK: - Init

    init(enemy: Enemy, screenPath: [CGPoint]) {
        self.enemy = enemy
        self.screenPath = screenPath

        // Body radius scales with enemy type
        let radius: CGFloat
        switch enemy.type {
        case .xarrTank:     radius = 20
        case .xarrBoss:     radius = 28
        case .xarrSwarm:    radius = 10
        default:            radius = 14
        }

        bodyShape = SKShapeNode(circleOfRadius: radius)
        bodyShape.fillColor = EnemyNode.color(for: enemy.type)
        bodyShape.strokeColor = .white
        bodyShape.lineWidth = enemy.type == .xarrBoss ? 3 : 1.5
        bodyShape.zPosition = 1

        // Stealth: dashed stroke overlay for stealth enemies
        if enemy.type.isStealth {
            let overlay = SKShapeNode(circleOfRadius: radius + 3)
            overlay.fillColor = .clear
            overlay.strokeColor = UIColor.white.withAlphaComponent(0.4)
            overlay.lineWidth = 1
            overlay.lineDashPattern = [4, 4]
            overlay.zPosition = 1.5
            stealthOverlay = overlay
        } else {
            stealthOverlay = nil
        }

        // HP bar background
        let barW: CGFloat = radius * 3
        hpBarBg = SKShapeNode(rect: CGRect(x: -barW/2, y: radius + 6, width: barW, height: 5),
                              cornerRadius: 2)
        hpBarBg.fillColor = UIColor(white: 0.2, alpha: 0.8)
        hpBarBg.strokeColor = .clear
        hpBarBg.zPosition = 2

        // HP bar foreground
        hpBarFg = SKShapeNode(rect: CGRect(x: -barW/2, y: radius + 6, width: barW, height: 5),
                              cornerRadius: 2)
        hpBarFg.fillColor = .green
        hpBarFg.strokeColor = .clear
        hpBarFg.zPosition = 3

        // Type abbreviation
        typeLabel = SKLabelNode(text: EnemyNode.abbreviation(for: enemy.type))
        typeLabel.fontName = "AvenirNext-Bold"
        typeLabel.fontSize = enemy.type == .xarrBoss ? 14 : 9
        typeLabel.fontColor = .white
        typeLabel.verticalAlignmentMode = .center
        typeLabel.zPosition = 4

        super.init()
        addChild(bodyShape)
        if let overlay = stealthOverlay { addChild(overlay) }
        addChild(hpBarBg)
        addChild(hpBarFg)
        addChild(typeLabel)
        isUserInteractionEnabled = false

        // Stealth enemies appear semi-transparent
        if enemy.type.isStealth { alpha = 0.35 }

        // Boss: pulsing glow
        if enemy.type == .xarrBoss {
            bodyShape.glowWidth = 8
            bodyShape.run(SKAction.repeatForever(SKAction.sequence([
                SKAction.scale(to: 1.06, duration: 0.5),
                SKAction.scale(to: 1.00, duration: 0.5)
            ])))
        }

        if let start = screenPath.first { position = start }
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Movement

    /// Starts moving the enemy along the path using the enemy's current speed.
    func startMoving() {
        guard screenPath.count > 1 else { return }
        rebuildMovementSequence(fromIndex: 0)
    }

    /// Rebuild movement actions starting from the nearest waypoint ahead of current position.
    private func rebuildMovementSequence(fromIndex startIdx: Int) {
        removeAction(forKey: "movement")
        guard startIdx < screenPath.count else {
            reachedCore()
            return
        }

        var actions: [SKAction] = []
        let speed = enemy.type.speed * currentSpeedMultiplier

        // First segment: move from current position to next waypoint
        for i in startIdx..<screenPath.count {
            let dest = screenPath[i]
            let dist = i == startIdx
                ? position.distance(to: dest)
                : screenPath[i-1].distance(to: dest)
            let duration = max(0.01, dist / speed)
            actions.append(SKAction.move(to: dest, duration: duration))
        }

        actions.append(SKAction.run { [weak self] in self?.reachedCore() })
        run(SKAction.sequence(actions), withKey: "movement")
    }

    // MARK: - Status Effects

    /// Slow the enemy to `factor` of normal speed for `duration` seconds.
    func applySlowEffect(factor: Double, duration: TimeInterval) {
        guard !isDead, !isStunned else { return }
        let newMultiplier = min(currentSpeedMultiplier, factor)
        if newMultiplier == currentSpeedMultiplier && isSlowed { return }

        isSlowed = true
        currentSpeedMultiplier = newMultiplier
        bodyShape.run(SKAction.colorize(with: .cyan, colorBlendFactor: 0.5, duration: 0.1))
        rebuildMovementSequence(fromIndex: nearestWaypointIndex())

        cancelStatusTimer(key: "slow")
        let item = DispatchWorkItem { [weak self] in
            self?.removeSlow()
        }
        statusTimers.append(item)
        DispatchQueue.main.asyncAfter(deadline: .now() + duration, execute: item)
    }

    private func removeSlow() {
        isSlowed = false
        currentSpeedMultiplier = 1.0
        bodyShape.run(SKAction.colorize(with: EnemyNode.color(for: enemy.type),
                                        colorBlendFactor: 1.0, duration: 0.1))
        if !isStunned { rebuildMovementSequence(fromIndex: nearestWaypointIndex()) }
    }

    /// Stun the enemy (pause movement) for `duration` seconds.
    func applyStun(duration: TimeInterval) {
        guard !isDead else { return }
        isStunned = true
        removeAction(forKey: "movement")
        bodyShape.run(SKAction.colorize(with: UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1),
                                        colorBlendFactor: 0.7, duration: 0.1))
        // Spark effect
        let spark = SKShapeNode(circleOfRadius: 20)
        spark.fillColor = .clear
        spark.strokeColor = .yellow
        spark.lineWidth = 2
        spark.alpha = 0.8
        addChild(spark)
        spark.run(SKAction.sequence([
            SKAction.scale(to: 2.0, duration: 0.15),
            SKAction.fadeOut(withDuration: 0.2),
            SKAction.removeFromParent()
        ]))

        cancelStatusTimer(key: "stun")
        let item = DispatchWorkItem { [weak self] in
            self?.removeStun()
        }
        statusTimers.append(item)
        DispatchQueue.main.asyncAfter(deadline: .now() + duration, execute: item)
    }

    private func removeStun() {
        isStunned = false
        bodyShape.run(SKAction.colorize(with: EnemyNode.color(for: enemy.type),
                                        colorBlendFactor: 1.0, duration: 0.1))
        rebuildMovementSequence(fromIndex: nearestWaypointIndex())
    }

    /// Teleport enemy back to path start (Quantum Disruptor effect).
    func teleportToStart() {
        guard !isDead else { return }
        isStunned = false
        isSlowed = false
        currentSpeedMultiplier = 1.0
        cancelAllStatusTimers()

        // Visual teleport flash
        let flash = SKAction.sequence([
            SKAction.fadeOut(withDuration: 0.1),
            SKAction.run { [weak self] in
                guard let self else { return }
                self.position = self.screenPath.first ?? self.position
            },
            SKAction.fadeIn(withDuration: 0.2)
        ])
        run(flash) { [weak self] in
            self?.rebuildMovementSequence(fromIndex: 0)
        }
    }

    // MARK: - Damage

    func takeDamage(_ rawDamage: Double) {
        guard !isDead else { return }
        enemy.takeDamage(rawDamage)
        updateHPBar()

        // Stealth enemy becomes visible when hit
        if enemy.type.isStealth && alpha < 1.0 {
            run(SKAction.fadeAlpha(to: 0.9, duration: 0.1))
        }

        bodyShape.run(SKAction.sequence([
            SKAction.colorize(with: .red, colorBlendFactor: 0.9, duration: 0.04),
            SKAction.colorize(with: EnemyNode.color(for: enemy.type),
                              colorBlendFactor: isSlowed ? 0.5 : 1.0, duration: 0.1)
        ]))

        if isDead { die() }
    }

    // MARK: - Private Helpers

    private func nearestWaypointIndex() -> Int {
        var best = 0
        var bestDist = Double.infinity
        for (i, pt) in screenPath.enumerated() {
            let d = position.distance(to: pt)
            if d < bestDist { bestDist = d; best = i }
        }
        return min(best + 1, screenPath.count - 1)
    }

    private func cancelStatusTimer(key: String) { }   // placeholder; items are cancelled by creating new ones

    private func cancelAllStatusTimers() {
        statusTimers.forEach { $0.cancel() }
        statusTimers.removeAll()
    }

    private func reachedCore() {
        guard !isDead else { return }
        cancelAllStatusTimers()
        removeAllActions()
        removeFromParent()
        onReachedCore?()
    }

    private func die() {
        cancelAllStatusTimers()
        removeAllActions()
        let reward = enemy.type.reward

        // Death particle burst (simple shapes)
        if let parentNode = parent {
            for _ in 0..<8 {
                let shard = SKShapeNode(circleOfRadius: CGFloat.random(in: 2...5))
                shard.fillColor = EnemyNode.color(for: enemy.type)
                shard.strokeColor = .clear
                shard.position = position
                shard.zPosition = zPosition + 1
                parentNode.addChild(shard)
                let angle = CGFloat.random(in: 0...(2 * .pi))
                let dist = CGFloat.random(in: 20...50)
                shard.run(SKAction.sequence([
                    SKAction.group([
                        SKAction.move(by: CGVector(dx: cos(angle) * dist, dy: sin(angle) * dist),
                                      duration: 0.3),
                        SKAction.fadeOut(withDuration: 0.3)
                    ]),
                    SKAction.removeFromParent()
                ]))
            }
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
        case .xarrStealth:  return UIColor(red: 0.4, green: 0.4, blue: 0.8, alpha: 1)
        case .xarrArmored:  return UIColor(red: 0.3, green: 0.7, blue: 0.4, alpha: 1)
        case .xarrBoss:     return UIColor(red: 1.0, green: 0.1, blue: 0.5, alpha: 1)
        }
    }

    private static func abbreviation(for type: EnemyType) -> String {
        switch type {
        case .xarrScout:    return "S"
        case .xarrTank:     return "T"
        case .xarrSwarm:    return "SW"
        case .xarrStealth:  return "ST"
        case .xarrArmored:  return "A"
        case .xarrBoss:     return "BOSS"
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

