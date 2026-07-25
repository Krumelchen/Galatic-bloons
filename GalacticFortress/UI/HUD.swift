import SpriteKit

// MARK: - HUD

/// Heads-up display overlay anchored to the camera.
/// Shows credits, core HP, wave counter, and a "Start Wave" button.

final class HUD: SKNode {

    // MARK: - Labels

    private let creditsLabel:   SKLabelNode
    private let coreHPLabel:    SKLabelNode
    private let waveLabel:      SKLabelNode
    private let startWaveBtn:   SKShapeNode
    private let startWaveTxt:   SKLabelNode

    var onStartWaveTapped: (() -> Void)?

    // MARK: - Init

    init(sceneSize: CGSize) {
        let safeTop = sceneSize.height / 2 - 40

        // Credits
        creditsLabel = SKLabelNode(text: "💰 300")
        creditsLabel.fontName = "AvenirNext-Bold"
        creditsLabel.fontSize = 18
        creditsLabel.fontColor = .yellow
        creditsLabel.horizontalAlignmentMode = .left
        creditsLabel.position = CGPoint(x: -sceneSize.width / 2 + 20, y: safeTop)
        creditsLabel.zPosition = 100

        // Core HP
        coreHPLabel = SKLabelNode(text: "🛡 100")
        coreHPLabel.fontName = "AvenirNext-Bold"
        coreHPLabel.fontSize = 18
        coreHPLabel.fontColor = .cyan
        coreHPLabel.horizontalAlignmentMode = .center
        coreHPLabel.position = CGPoint(x: 0, y: safeTop)
        coreHPLabel.zPosition = 100

        // Wave counter
        waveLabel = SKLabelNode(text: "Wave 0/5")
        waveLabel.fontName = "AvenirNext-Bold"
        waveLabel.fontSize = 18
        waveLabel.fontColor = .white
        waveLabel.horizontalAlignmentMode = .right
        waveLabel.position = CGPoint(x: sceneSize.width / 2 - 20, y: safeTop)
        waveLabel.zPosition = 100

        // Start Wave button
        let btnW: CGFloat = 160
        let btnH: CGFloat = 44
        let btnY = -sceneSize.height / 2 + 60
        startWaveBtn = SKShapeNode(rect: CGRect(x: -btnW/2, y: -btnH/2, width: btnW, height: btnH),
                                   cornerRadius: 10)
        startWaveBtn.fillColor = UIColor(red: 0.1, green: 0.5, blue: 0.2, alpha: 0.9)
        startWaveBtn.strokeColor = .green
        startWaveBtn.lineWidth = 2
        startWaveBtn.position = CGPoint(x: 0, y: btnY)
        startWaveBtn.zPosition = 100
        startWaveBtn.name = "startWaveBtn"

        startWaveTxt = SKLabelNode(text: "▶ Start Wave")
        startWaveTxt.fontName = "AvenirNext-Bold"
        startWaveTxt.fontSize = 16
        startWaveTxt.fontColor = .green
        startWaveTxt.verticalAlignmentMode = .center
        startWaveTxt.zPosition = 101
        startWaveTxt.name = "startWaveBtn"

        super.init()
        addChild(creditsLabel)
        addChild(coreHPLabel)
        addChild(waveLabel)
        addChild(startWaveBtn)
        startWaveBtn.addChild(startWaveTxt)
        isUserInteractionEnabled = true
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Update Methods

    func updateCredits(_ credits: Int) {
        creditsLabel.text = "💰 \(credits)"
    }

    func updateCoreHP(_ hp: Int, max: Int) {
        coreHPLabel.text = "🛡 \(hp)/\(max)"
        coreHPLabel.fontColor = hp > max / 2 ? .cyan : (hp > max / 4 ? .yellow : .red)
    }

    func updateWave(current: Int, total: Int) {
        waveLabel.text = "Wave \(current)/\(total)"
    }

    func setStartWaveEnabled(_ enabled: Bool) {
        startWaveBtn.alpha = enabled ? 1.0 : 0.4
        startWaveBtn.isUserInteractionEnabled = enabled
    }

    func setStartWaveTitle(_ title: String) {
        startWaveTxt.text = title
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let loc = touch.location(in: self)
        if startWaveBtn.contains(loc) {
            startWaveBtn.run(SKAction.sequence([
                SKAction.scale(to: 0.92, duration: 0.08),
                SKAction.scale(to: 1.00, duration: 0.08)
            ]))
            onStartWaveTapped?()
        }
    }
}
