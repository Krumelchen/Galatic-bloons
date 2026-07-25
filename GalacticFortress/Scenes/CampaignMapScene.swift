import SpriteKit

// MARK: - Campaign Map Scene

/// Shows a star-map with selectable planets/levels.
/// Phase 1: only Level 1 "Alpha Centauri" is available.

final class CampaignMapScene: SKScene {

    // Planet definitions: (name, position relative to scene center, unlocked)
    private let planets: [(name: String, subtitle: String, pos: CGPoint, unlocked: Bool)] = [
        ("Alpha Centauri", "Level 1 · Ice Planet", CGPoint(x: -80, y:  40), true),
        ("Proxima",        "Level 2 · Desert",     CGPoint(x:  90, y:  80), false),
        ("Tau Ceti",       "Level 3 · Volcanic",   CGPoint(x:  40, y: -60), false),
        ("Kepler-22",      "Level 4 · Jungle",     CGPoint(x: -40, y: -100), false),
    ]

    override func didMove(to view: SKView) {
        backgroundColor = UIColor(red: 0.02, green: 0.03, blue: 0.1, alpha: 1)
        addStarfield()
        addTitle()
        addConnectionLines()
        addPlanets()
        addBackButton()
    }

    // MARK: - UI

    private func addTitle() {
        let lbl = SKLabelNode(text: "CAMPAIGN")
        lbl.fontName = "AvenirNext-Heavy"
        lbl.fontSize = 32
        lbl.fontColor = .white
        lbl.position = CGPoint(x: 0, y: size.height / 2 - 60)
        addChild(lbl)

        let sub = SKLabelNode(text: "Choose your battleground")
        sub.fontName = "AvenirNext-Regular"
        sub.fontSize = 14
        sub.fontColor = UIColor(white: 0.6, alpha: 1)
        sub.position = CGPoint(x: 0, y: size.height / 2 - 88)
        addChild(sub)
    }

    private func addConnectionLines() {
        // Draw dotted lines between planets for the star-map feel
        guard planets.count > 1 else { return }
        for i in 0..<planets.count - 1 {
            let path = CGMutablePath()
            path.move(to: planets[i].pos)
            path.addLine(to: planets[i+1].pos)
            let line = SKShapeNode(path: path)
            line.strokeColor = UIColor(white: 0.3, alpha: 1)
            line.lineWidth = 1
            line.lineDashPattern = [6, 4]
            line.zPosition = -1
            addChild(line)
        }
    }

    private func addPlanets() {
        for (idx, planet) in planets.enumerated() {
            let radius: CGFloat = 28
            let circle = SKShapeNode(circleOfRadius: radius)
            circle.fillColor = planet.unlocked
                ? UIColor(red: 0.2, green: 0.5, blue: 0.9, alpha: 1)   // blue = ice
                : UIColor(white: 0.3, alpha: 1)
            circle.strokeColor = planet.unlocked ? .cyan : UIColor(white: 0.4, alpha: 1)
            circle.lineWidth = 2
            circle.position = planet.pos
            circle.name = planet.unlocked ? "planet_\(idx)" : nil
            circle.zPosition = 1

            if planet.unlocked {
                // Pulse + glow for unlocked planets
                circle.glowWidth = 6
                circle.run(SKAction.repeatForever(SKAction.sequence([
                    SKAction.scale(to: 1.06, duration: 1.0),
                    SKAction.scale(to: 1.00, duration: 1.0)
                ])))
            }

            let nameLabel = SKLabelNode(text: planet.name)
            nameLabel.fontName = "AvenirNext-Bold"
            nameLabel.fontSize = 13
            nameLabel.fontColor = planet.unlocked ? .white : UIColor(white: 0.4, alpha: 1)
            nameLabel.position = CGPoint(x: planet.pos.x, y: planet.pos.y + radius + 10)
            nameLabel.name = planet.unlocked ? "planet_\(idx)" : nil

            let subLabel = SKLabelNode(text: planet.subtitle)
            subLabel.fontName = "AvenirNext-Regular"
            subLabel.fontSize = 10
            subLabel.fontColor = planet.unlocked
                ? UIColor(red: 0.5, green: 0.8, blue: 1.0, alpha: 1)
                : UIColor(white: 0.3, alpha: 1)
            subLabel.position = CGPoint(x: planet.pos.x, y: planet.pos.y + radius + 24)
            subLabel.name = planet.unlocked ? "planet_\(idx)" : nil

            if !planet.unlocked {
                let lockLabel = SKLabelNode(text: "🔒")
                lockLabel.fontSize = 18
                lockLabel.position = planet.pos
                lockLabel.verticalAlignmentMode = .center
                addChild(lockLabel)
            }

            addChild(circle)
            addChild(nameLabel)
            addChild(subLabel)
        }
    }

    private func addBackButton() {
        let btn = SKLabelNode(text: "← Back")
        btn.fontName = "AvenirNext-Bold"
        btn.fontSize = 16
        btn.fontColor = UIColor(white: 0.7, alpha: 1)
        btn.position = CGPoint(x: -size.width / 2 + 50, y: -size.height / 2 + 40)
        btn.name = "backBtn"
        addChild(btn)
    }

    private func addStarfield() {
        for _ in 0..<100 {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.5...1.5))
            star.fillColor = UIColor(white: CGFloat.random(in: 0.4...1.0), alpha: 1)
            star.strokeColor = .clear
            star.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2)
            )
            star.zPosition = -10
            addChild(star)
        }
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let tappedNodes = nodes(at: touch.location(in: self))

        for node in tappedNodes {
            if node.name == "planet_0" {
                let scene = GameScene(size: size)
                scene.scaleMode = .aspectFill
                view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.6))
                return
            }
            if node.name == "backBtn" {
                let scene = MainMenuScene(size: size)
                scene.scaleMode = .aspectFill
                view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.4))
                return
            }
        }
    }
}
