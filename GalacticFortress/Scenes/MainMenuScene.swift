import SpriteKit

// MARK: - Main Menu Scene

final class MainMenuScene: SKScene {

    override func didMove(to view: SKView) {
        backgroundColor = UIColor(red: 0.03, green: 0.04, blue: 0.1, alpha: 1)
        addStarfield()
        addTitle()
        addPlayButton()
        addSubtitle()
    }

    // MARK: - UI

    private func addTitle() {
        let title = SKLabelNode(text: "GALACTIC")
        title.fontName = "AvenirNext-Heavy"
        title.fontSize = 52
        title.fontColor = .white
        title.position = CGPoint(x: 0, y: 80)

        let subtitle = SKLabelNode(text: "FORTRESS")
        subtitle.fontName = "AvenirNext-Heavy"
        subtitle.fontSize = 52
        subtitle.fontColor = UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1)
        subtitle.position = CGPoint(x: 0, y: 20)

        // Glow effect on FORTRESS
        subtitle.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.fadeAlpha(to: 0.7, duration: 1.2),
            SKAction.fadeAlpha(to: 1.0, duration: 1.2)
        ])))

        addChild(title)
        addChild(subtitle)
    }

    private func addPlayButton() {
        let btnW: CGFloat = 200
        let btnH: CGFloat = 56
        let btn = SKShapeNode(rect: CGRect(x: -btnW/2, y: -btnH/2, width: btnW, height: btnH),
                              cornerRadius: 14)
        btn.fillColor = UIColor(red: 0.1, green: 0.6, blue: 0.3, alpha: 1)
        btn.strokeColor = .green
        btn.lineWidth = 2
        btn.position = CGPoint(x: 0, y: -60)
        btn.name = "playBtn"

        let label = SKLabelNode(text: "▶  PLAY")
        label.fontName = "AvenirNext-Bold"
        label.fontSize = 24
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        label.name = "playBtn"

        btn.addChild(label)
        addChild(btn)

        // Pulse animation
        btn.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.scale(to: 1.04, duration: 0.7),
            SKAction.scale(to: 1.00, duration: 0.7)
        ])))
    }

    private func addSubtitle() {
        let lbl = SKLabelNode(text: "Defend the last human colonies")
        lbl.fontName = "AvenirNext-Regular"
        lbl.fontSize = 15
        lbl.fontColor = UIColor(white: 0.6, alpha: 1)
        lbl.position = CGPoint(x: 0, y: -120)
        addChild(lbl)
    }

    private func addStarfield() {
        for _ in 0..<150 {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.5...2.5))
            star.fillColor = UIColor(white: CGFloat.random(in: 0.3...1.0), alpha: 1)
            star.strokeColor = .clear
            star.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2)
            )
            star.zPosition = -10

            // Subtle twinkle
            let delay = TimeInterval.random(in: 0...3)
            star.run(SKAction.repeatForever(SKAction.sequence([
                SKAction.wait(forDuration: delay),
                SKAction.fadeAlpha(to: 0.3, duration: TimeInterval.random(in: 0.8...2.0)),
                SKAction.fadeAlpha(to: 1.0, duration: TimeInterval.random(in: 0.8...2.0))
            ])))

            addChild(star)
        }
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let nodes = self.nodes(at: touch.location(in: self))
        if nodes.contains(where: { $0.name == "playBtn" }) {
            let scene = CampaignMapScene(size: size)
            scene.scaleMode = .aspectFill
            view?.presentScene(scene, transition: SKTransition.doorsOpenVertical(withDuration: 0.5))
        }
    }
}
