import SpriteKit

// MARK: - Campaign Map Scene

/// Star-map showing all 5 solar systems (20 levels).
/// Phase 2: Solar systems 1 & 2 fully populated, 3-5 coming in Phase 3.

final class CampaignMapScene: SKScene {

    // MARK: - Solar System Data

    struct SolarSystem {
        let name: String
        let color: UIColor
        let centerPos: CGPoint
        let planets: [(name: String, levelFile: String, unlocked: Bool)]
    }

    private var solarSystems: [SolarSystem] {
        [
            SolarSystem(
                name: "Alpha Centauri System", color: .cyan,
                centerPos: CGPoint(x: -180, y: 40),
                planets: [
                    ("Nova Prime",    "level_01", true),
                    ("Frost Reach",   "level_02", true),
                    ("Frost Citadel", "level_03", true),
                    ("Polar Fortress","level_04", true)
                ]
            ),
            SolarSystem(
                name: "Proxima System", color: UIColor(red:1,green:0.7,blue:0.2,alpha:1),
                centerPos: CGPoint(x: 0, y: 40),
                planets: [
                    ("Saharan Dunes",  "level_05", true),
                    ("Dune Labyrinth", "level_06", true),
                    ("Volcanic Reach", "level_07", true),
                    ("Lava Bastion",   "level_08", true)
                ]
            ),
            SolarSystem(
                name: "Tau Ceti System", color: UIColor(red:1,green:0.4,blue:0.1,alpha:1),
                centerPos: CGPoint(x: 180, y: 40),
                planets: [
                    ("Jungle Canopy",  "level_09", false),
                    ("Vine Maze",      "level_10", false),
                    ("Root Fortress",  "level_11", false),
                    ("Overgrowth",     "level_12", false)
                ]
            ),
            SolarSystem(
                name: "Kepler-22 System", color: UIColor(red:0.5,green:1,blue:0.3,alpha:1),
                centerPos: CGPoint(x: -90, y: -80),
                planets: [
                    ("Crystal Plains", "level_13", false),
                    ("Gemstone Rift",  "level_14", false),
                    ("Diamond Core",   "level_15", false),
                    ("Prism Citadel",  "level_16", false)
                ]
            ),
            SolarSystem(
                name: "Void System", color: UIColor(red:0.8,green:0.2,blue:1,alpha:1),
                centerPos: CGPoint(x: 90, y: -80),
                planets: [
                    ("Dark Nebula",   "level_17", false),
                    ("Void Gate",     "level_18", false),
                    ("Event Horizon", "level_19", false),
                    ("Xarr Homeworld","level_20", false)
                ]
            )
        ]
    }

    // MARK: - didMove

    override func didMove(to view: SKView) {
        backgroundColor = UIColor(red: 0.02, green: 0.03, blue: 0.1, alpha: 1)
        addStarfield()
        addTitle()
        for system in solarSystems { addSolarSystem(system) }
        addBackButton()
    }

    // MARK: - UI Building

    private func addTitle() {
        let lbl = SKLabelNode(text: "CAMPAIGN")
        lbl.fontName = "AvenirNext-Heavy"
        lbl.fontSize = 30
        lbl.fontColor = .white
        lbl.position = CGPoint(x: 0, y: size.height/2 - 50)
        addChild(lbl)

        let sub = SKLabelNode(text: "5 Solar Systems · 20 Planets")
        sub.fontName = "AvenirNext-Regular"
        sub.fontSize = 13
        sub.fontColor = UIColor(white: 0.55, alpha: 1)
        sub.position = CGPoint(x: 0, y: size.height/2 - 74)
        addChild(sub)
    }

    private func addSolarSystem(_ system: SolarSystem) {
        let center = system.centerPos

        // System name
        let nameLabel = SKLabelNode(text: system.name)
        nameLabel.fontName = "AvenirNext-Bold"
        nameLabel.fontSize = 11
        nameLabel.fontColor = system.color
        nameLabel.position = CGPoint(x: center.x, y: center.y + 55)
        addChild(nameLabel)

        // Central star
        let star = SKShapeNode(circleOfRadius: 10)
        star.fillColor = system.color
        star.strokeColor = .white
        star.lineWidth = 1
        star.glowWidth = 6
        star.position = center
        addChild(star)
        star.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.scale(to: 1.2, duration: 1.0),
            SKAction.scale(to: 1.0, duration: 1.0)
        ])))

        // Planets arranged in a ring around the star
        let angles: [CGFloat] = [.pi*0.2, .pi*0.8, .pi*1.2, .pi*1.8]
        let orbitR: CGFloat = 40

        for (i, planet) in system.planets.enumerated() {
            let angle = angles[i]
            let pPos = CGPoint(x: center.x + cos(angle) * orbitR,
                               y: center.y + sin(angle) * orbitR * 0.5)

            // Orbit line
            let orbit = SKShapeNode(ellipseIn: CGRect(
                x: center.x - orbitR, y: center.y - orbitR * 0.5,
                width: orbitR * 2, height: orbitR))
            orbit.fillColor = .clear
            orbit.strokeColor = system.color.withAlphaComponent(0.15)
            orbit.lineWidth = 0.5
            orbit.zPosition = -1
            addChild(orbit)

            // Planet circle
            let pRadius: CGFloat = planet.unlocked ? 9 : 7
            let p = SKShapeNode(circleOfRadius: pRadius)
            p.fillColor = planet.unlocked
                ? system.color.withAlphaComponent(0.85)
                : UIColor(white: 0.25, alpha: 1)
            p.strokeColor = planet.unlocked ? .white : UIColor(white: 0.4, alpha: 1)
            p.lineWidth = 1
            p.position = pPos
            p.zPosition = 1
            p.name = planet.unlocked ? "level_\(planet.levelFile)" : nil
            if planet.unlocked { p.glowWidth = 3 }
            addChild(p)

            // Planet name
            let pLabel = SKLabelNode(text: planet.name)
            pLabel.fontName = "AvenirNext-Regular"
            pLabel.fontSize = 8
            pLabel.fontColor = planet.unlocked ? .white : UIColor(white: 0.35, alpha: 1)
            pLabel.position = CGPoint(x: pPos.x, y: pPos.y + pRadius + 5)
            pLabel.name = p.name
            addChild(pLabel)

            if !planet.unlocked {
                let lock = SKLabelNode(text: "🔒")
                lock.fontSize = 8
                lock.position = pPos
                lock.verticalAlignmentMode = .center
                addChild(lock)
            }
        }
    }

    private func addBackButton() {
        let btn = SKLabelNode(text: "← Back")
        btn.fontName = "AvenirNext-Bold"
        btn.fontSize = 16
        btn.fontColor = UIColor(white: 0.7, alpha: 1)
        btn.position = CGPoint(x: -size.width/2 + 50, y: -size.height/2 + 40)
        btn.name = "backBtn"
        addChild(btn)
    }

    private func addStarfield() {
        for _ in 0..<120 {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.3...1.5))
            star.fillColor = UIColor(white: CGFloat.random(in: 0.3...1.0), alpha: 1)
            star.strokeColor = .clear
            star.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2))
            star.zPosition = -10
            addChild(star)
        }
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let tapped = nodes(at: touch.location(in: self))

        for node in tapped {
            guard let name = node.name else { continue }

            if name == "backBtn" {
                let scene = MainMenuScene(size: size)
                scene.scaleMode = .aspectFill
                view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.4))
                return
            }

            if name.hasPrefix("level_") {
                let levelFile = String(name.dropFirst("level_".count))
                let scene = GameScene(size: size)
                scene.levelName = levelFile
                scene.scaleMode = .aspectFill
                view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.6))
                return
            }
        }
    }
}

