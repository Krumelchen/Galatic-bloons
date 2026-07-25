import SpriteKit

// MARK: - Projectile Node

/// A small fast-moving projectile fired by a tower toward an enemy.
/// Moves to the target's position at the moment of firing; calls onHit when it arrives.

final class ProjectileNode: SKShapeNode {

    var onHit: (() -> Void)?

    // MARK: - Init

    init(from startPos: CGPoint, to targetNode: SKNode, type: TowerType) {
        super.init()

        // Projectile appearance varies by tower type
        let radius: CGFloat
        let color: UIColor

        switch type {
        case .laserCannon:
            radius = 4
            color = UIColor(red: 1.0, green: 0.9, blue: 0.2, alpha: 1)   // yellow laser
        case .plasmaAoE:
            radius = 8
            color = UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1)   // purple plasma
        case .missileSilo:
            radius = 6
            color = UIColor(red: 1.0, green: 0.4, blue: 0.0, alpha: 1)   // orange missile
        default:
            radius = 4
            color = UIColor(red: 0.4, green: 0.9, blue: 1.0, alpha: 1)   // cyan default
        }

        self.path = CGPath(ellipseIn: CGRect(x: -radius, y: -radius,
                                             width: radius * 2, height: radius * 2), transform: nil)
        self.fillColor = color
        self.strokeColor = color.withAlphaComponent(0.5)
        self.lineWidth = 1
        self.zPosition = 50     // always on top of map and enemies
        self.position = startPos
        self.glowWidth = 3
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Fire

    /// Animate movement to target's current position, call onHit, then remove self.
    func fire(to destination: CGPoint, speed: CGFloat = 400) {
        let dx = destination.x - position.x
        let dy = destination.y - position.y
        let dist = sqrt(dx * dx + dy * dy)
        let duration = TimeInterval(dist / speed)

        let moveAction   = SKAction.move(to: destination, duration: duration)
        let hitAction    = SKAction.run { [weak self] in self?.onHit?() }
        let removeAction = SKAction.removeFromParent()

        run(SKAction.sequence([moveAction, hitAction, removeAction]))
    }
}
