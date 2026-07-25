import SpriteKit

// MARK: - Tower Menu

/// Popup that appears when the player taps a build spot or a placed tower.
/// Offers tower placement options or upgrade/sell actions.

protocol TowerMenuDelegate: AnyObject {
    func towerMenu(_ menu: TowerMenu, didSelectPlace type: TowerType, at col: Int, row: Int)
    func towerMenu(_ menu: TowerMenu, didSelectUpgrade towerID: UUID)
    func towerMenu(_ menu: TowerMenu, didSelectSell towerID: UUID)
    func towerMenuDidDismiss(_ menu: TowerMenu)
}

final class TowerMenu: SKNode {

    weak var delegate: TowerMenuDelegate?

    private var gridCol: Int = 0
    private var gridRow: Int = 0
    private var existingTower: Tower?

    private var buttons: [SKShapeNode] = []

    // Phase 1: only Laser Cannon available
    private let availableTowers: [TowerType] = [.laserCannon]

    // MARK: - Init

    override init() {
        super.init()
        isUserInteractionEnabled = true
        zPosition = 200
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Show

    /// Show the build menu at a given build spot.
    func showBuildMenu(at col: Int, row: Int, credits: Int, scenePosition: CGPoint) {
        removeAllChildren()
        buttons.removeAll()
        gridCol = col
        gridRow = row
        existingTower = nil

        let bg = makeBackground(rows: availableTowers.count)
        addChild(bg)

        for (i, towerType) in availableTowers.enumerated() {
            let cost = towerType.baseCost
            let canAfford = credits >= cost
            let btn = makeButton(
                title: "\(towerType.displayName)  \(cost)💰",
                index: i,
                enabled: canAfford,
                tag: "build_\(towerType.rawValue)"
            )
            addChild(btn)
            buttons.append(btn)
        }

        addDismissButton(index: availableTowers.count)
        position = scenePosition + CGPoint(x: 0, y: 60)
    }

    /// Show the upgrade/sell menu for an existing tower.
    func showTowerMenu(for tower: Tower, credits: Int, scenePosition: CGPoint) {
        removeAllChildren()
        buttons.removeAll()
        gridCol = tower.gridCol
        gridRow = tower.gridRow
        existingTower = tower

        let rows = tower.canUpgrade ? 3 : 2
        let bg = makeBackground(rows: rows)
        addChild(bg)

        var idx = 0

        // Info label
        let infoLabel = SKLabelNode(text: "\(tower.type.displayName) Lv\(tower.upgradeLevel)")
        infoLabel.fontName = "AvenirNext-Bold"
        infoLabel.fontSize = 13
        infoLabel.fontColor = .cyan
        infoLabel.position = CGPoint(x: 0, y: CGFloat(rows) * 36 - 18)
        infoLabel.zPosition = 1
        addChild(infoLabel)

        if tower.canUpgrade {
            let upgBtn = makeButton(
                title: "⬆ Upgrade  \(tower.upgradeCost)💰",
                index: idx,
                enabled: credits >= tower.upgradeCost,
                tag: "upgrade"
            )
            addChild(upgBtn)
            buttons.append(upgBtn)
            idx += 1
        }

        let sellBtn = makeButton(
            title: "💸 Sell  +\(tower.sellValue)💰",
            index: idx,
            enabled: true,
            tag: "sell"
        )
        addChild(sellBtn)
        buttons.append(sellBtn)
        idx += 1

        addDismissButton(index: idx)
        position = scenePosition + CGPoint(x: 0, y: 60)
    }

    func dismiss() {
        removeFromParent()
        delegate?.towerMenuDidDismiss(self)
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let loc = touch.location(in: self)

        for btn in buttons {
            if btn.contains(loc), let tag = btn.name {
                handleTap(tag: tag)
                return
            }
        }
        // Tap on background → dismiss
        dismiss()
    }

    private func handleTap(tag: String) {
        if tag == "dismiss" {
            dismiss()
        } else if tag == "upgrade", let t = existingTower {
            dismiss()
            delegate?.towerMenu(self, didSelectUpgrade: t.id)
        } else if tag == "sell", let t = existingTower {
            dismiss()
            delegate?.towerMenu(self, didSelectSell: t.id)
        } else if tag.hasPrefix("build_") {
            let rawValue = String(tag.dropFirst("build_".count))
            if let type = TowerType(rawValue: rawValue) {
                dismiss()
                delegate?.towerMenu(self, didSelectPlace: type, at: gridCol, row: gridRow)
            }
        }
    }

    // MARK: - Factory Helpers

    private func makeBackground(rows: Int) -> SKShapeNode {
        let w: CGFloat = 200
        let h: CGFloat = CGFloat(rows + 1) * 40 + 16
        let bg = SKShapeNode(rect: CGRect(x: -w/2, y: -16, width: w, height: h), cornerRadius: 12)
        bg.fillColor = UIColor(red: 0.05, green: 0.1, blue: 0.2, alpha: 0.95)
        bg.strokeColor = UIColor.cyan.withAlphaComponent(0.6)
        bg.lineWidth = 1.5
        return bg
    }

    private func makeButton(title: String, index: Int, enabled: Bool, tag: String) -> SKShapeNode {
        let w: CGFloat = 180
        let h: CGFloat = 34
        let y = CGFloat(index) * 40 + 4

        let btn = SKShapeNode(rect: CGRect(x: -w/2, y: y, width: w, height: h), cornerRadius: 8)
        btn.fillColor = enabled
            ? UIColor(red: 0.1, green: 0.3, blue: 0.5, alpha: 0.9)
            : UIColor(white: 0.2, alpha: 0.5)
        btn.strokeColor = enabled ? .cyan : UIColor(white: 0.4, alpha: 1)
        btn.lineWidth = 1
        btn.name = tag
        btn.zPosition = 1

        let label = SKLabelNode(text: title)
        label.fontName = "AvenirNext-Bold"
        label.fontSize = 12
        label.fontColor = enabled ? .white : UIColor(white: 0.5, alpha: 1)
        label.verticalAlignmentMode = .center
        label.position = CGPoint(x: 0, y: y + h / 2)
        label.zPosition = 2
        label.name = tag
        btn.addChild(label)

        return btn
    }

    private func addDismissButton(index: Int) {
        let btn = makeButton(title: "✕ Cancel", index: index, enabled: true, tag: "dismiss")
        btn.fillColor = UIColor(red: 0.3, green: 0.1, blue: 0.1, alpha: 0.9)
        btn.strokeColor = UIColor.red.withAlphaComponent(0.6)
        addChild(btn)
        buttons.append(btn)
    }
}

// MARK: - CGPoint addition

private func + (lhs: CGPoint, rhs: CGPoint) -> CGPoint {
    CGPoint(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
}
