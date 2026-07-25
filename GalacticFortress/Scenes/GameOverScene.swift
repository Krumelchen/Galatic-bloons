import SpriteKit

// MARK: - Game Over Scene

final class GameOverScene: SKScene {

    private let victory: Bool
    private let wavesCompleted: Int
    private let creditsRemaining: Int

    init(size: CGSize, victory: Bool, wave: Int, credits: Int) {
        self.victory = victory
        self.wavesCompleted = wave
        self.creditsRemaining = credits
        super.init(size: size)
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    override func didMove(to view: SKView) {
        backgroundColor = UIColor(red: 0.03, green: 0.04, blue: 0.1, alpha: 1)
        addStarfield()
        addOutcome()
        addStats()
        addButtons()
    }

    // MARK: - UI

    private func addOutcome() {
        let emoji = victory ? "🏆" : "💥"
        let title = victory ? "VICTORY!" : "DEFEAT"
        let color: UIColor = victory
            ? UIColor(red: 1.0, green: 0.85, blue: 0.0, alpha: 1)
            : UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1)

        let emojiLabel = SKLabelNode(text: emoji)
        emojiLabel.fontSize = 72
        emojiLabel.position = CGPoint(x: 0, y: 100)
        addChild(emojiLabel)

        let titleLabel = SKLabelNode(text: title)
        titleLabel.fontName = "AvenirNext-Heavy"
        titleLabel.fontSize = 48
        titleLabel.fontColor = color
        titleLabel.position = CGPoint(x: 0, y: 40)

        // Animate in
        titleLabel.setScale(0.5)
        titleLabel.run(SKAction.scale(to: 1.0, duration: 0.4))

        if victory {
            titleLabel.run(SKAction.repeatForever(SKAction.sequence([
                SKAction.fadeAlpha(to: 0.7, duration: 0.8),
                SKAction.fadeAlpha(to: 1.0, duration: 0.8)
            ])))
        }
        addChild(titleLabel)
    }

    private func addStats() {
        let statsY: CGFloat = -20
        let lines: [(String, String)] = [
            ("Waves Completed", "\(wavesCompleted)"),
            ("Credits Remaining", "\(creditsRemaining)💰"),
        ]

        for (i, (key, value)) in lines.enumerated() {
            let y = statsY - CGFloat(i) * 28

            let keyLabel = SKLabelNode(text: key)
            keyLabel.fontName = "AvenirNext-Regular"
            keyLabel.fontSize = 16
            keyLabel.fontColor = UIColor(white: 0.7, alpha: 1)
            keyLabel.horizontalAlignmentMode = .left
            keyLabel.position = CGPoint(x: -140, y: y)
            addChild(keyLabel)

            let valLabel = SKLabelNode(text: value)
            valLabel.fontName = "AvenirNext-Bold"
            valLabel.fontSize = 16
            valLabel.fontColor = .white
            valLabel.horizontalAlignmentMode = .right
            valLabel.position = CGPoint(x: 140, y: y)
            addChild(valLabel)
        }
    }

    private func addButtons() {
        let btnY: CGFloat = -120

        // Retry
        let retryBtn = makeButton(title: "🔄  Retry", x: -80, y: btnY, color: UIColor(red: 0.1, green: 0.4, blue: 0.8, alpha: 1))
        retryBtn.name = "retryBtn"
        addChild(retryBtn)

        // Menu
        let menuBtn = makeButton(title: "🏠  Menu", x: 80, y: btnY, color: UIColor(red: 0.2, green: 0.2, blue: 0.3, alpha: 1))
        menuBtn.name = "menuBtn"
        addChild(menuBtn)
    }

    private func makeButton(title: String, x: CGFloat, y: CGFloat, color: UIColor) -> SKShapeNode {
        let w: CGFloat = 140
        let h: CGFloat = 48
        let btn = SKShapeNode(rect: CGRect(x: -w/2, y: -h/2, width: w, height: h), cornerRadius: 12)
        btn.fillColor = color
        btn.strokeColor = .white
        btn.lineWidth = 1.5
        btn.position = CGPoint(x: x, y: y)

        let lbl = SKLabelNode(text: title)
        lbl.fontName = "AvenirNext-Bold"
        lbl.fontSize = 16
        lbl.fontColor = .white
        lbl.verticalAlignmentMode = .center
        lbl.name = btn.name
        btn.addChild(lbl)

        return btn
    }

    private func addStarfield() {
        for _ in 0..<80 {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.5...2))
            star.fillColor = UIColor(white: CGFloat.random(in: 0.3...1.0), alpha: 1)
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
        let tapped = nodes(at: touch.location(in: self))

        if tapped.contains(where: { $0.name == "retryBtn" }) {
            let scene = GameScene(size: size)
            scene.scaleMode = .aspectFill
            view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.5))
        } else if tapped.contains(where: { $0.name == "menuBtn" }) {
            let scene = MainMenuScene(size: size)
            scene.scaleMode = .aspectFill
            view?.presentScene(scene, transition: SKTransition.fade(withDuration: 0.5))
        }
    }
}
