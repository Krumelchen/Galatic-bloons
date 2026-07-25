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

    // Phase 2: all 8 towers available
    private let availableTowers: [TowerType] = TowerType.allCases

    // MARK: - Init

    override init() {
        super.init()
        isUserInteractionEnabled = true
        zPosition = 200
    }

    required init?(coder aDecoder: NSCoder) { fatalError() }

    // MARK: - Show

    /// Show the build menu at a given build spot — 2-column grid layout for 8 towers.
    func showBuildMenu(at col: Int, row: Int, credits: Int, scenePosition: CGPoint) {
        removeAllChildren()
        buttons.removeAll()
        gridCol = col
        gridRow = row
        existingTower = nil

        let rows = Int(ceil(Double(availableTowers.count) / 2.0))
        let bgW: CGFloat = 240
        let bgH: CGFloat = CGFloat(rows) * 54 + 60
        let bg = SKShapeNode(rect: CGRect(x: -bgW/2, y: -8, width: bgW, height: bgH), cornerRadius: 12)
        bg.fillColor = UIColor(red: 0.04, green: 0.08, blue: 0.18, alpha: 0.96)
        bg.strokeColor = UIColor.cyan.withAlphaComponent(0.5)
        bg.lineWidth = 1.5
        addChild(bg)

        // Header label
        let header = SKLabelNode(text: "Place Tower")
        header.fontName = "AvenirNext-Bold"
        header.fontSize = 13
        header.fontColor = .cyan
        header.position = CGPoint(x: 0, y: bgH - 24)
        header.zPosition = 1
        addChild(header)

        // 2-column grid
        for (i, towerType) in availableTowers.enumerated() {
            let cost = towerType.baseCost
            let canAfford = credits >= cost
            let col2 = i % 2        // 0 = left, 1 = right
            let row2 = i / 2
            let x: CGFloat = col2 == 0 ? -60 : 60
            let y: CGFloat = CGFloat(row2) * 54 + 18
            let btn = makeGridButton(
                icon: towerIcon(towerType),
                name: towerType.displayName,
                cost: cost,
                enabled: canAfford,
                tag: "build_\(towerType.rawValue)",
                position: CGPoint(x: x, y: y)
            )
            addChild(btn)
            buttons.append(btn)
        }

        // Cancel button
        let cancelBtn = makeButton(title: "✕ Cancel", index: 0, enabled: true, tag: "dismiss")
        cancelBtn.fillColor = UIColor(red: 0.3, green: 0.1, blue: 0.1, alpha: 0.9)
        cancelBtn.strokeColor = UIColor.red.withAlphaComponent(0.6)
        // Position below the grid
        let cancelY: CGFloat = -2
        cancelBtn.position = CGPoint(x: 0, y: cancelY)
        // Override the default index-based positioning
        if let lbl = cancelBtn.children.first as? SKLabelNode {
            lbl.position = CGPoint(x: 0, y: cancelY + 17)
        }
        addChild(cancelBtn)
        buttons.append(cancelBtn)

        position = scenePosition + CGPoint(x: 0, y: 70)
    }

    private func towerIcon(_ type: TowerType) -> String {
        switch type {
        case .laserCannon:      return "⚡"
        case .plasmaAoE:        return "💥"
        case .ionSlow:          return "❄️"
        case .empPulse:         return "🌀"
        case .missileSilo:      return "🚀"
        case .nanobotRepair:    return "🔧"
        case .quantumDisruptor: return "🔮"
        case .solarCollector:   return "☀️"
        }
    }

    private func makeGridButton(icon: String, name: String, cost: Int,
                                enabled: Bool, tag: String, position pos: CGPoint) -> SKShapeNode {
        let w: CGFloat = 106
        let h: CGFloat = 48
        let btn = SKShapeNode(rect: CGRect(x: -w/2, y: -h/2, width: w, height: h), cornerRadius: 8)
        btn.fillColor = enabled
            ? UIColor(red: 0.1, green: 0.25, blue: 0.45, alpha: 0.95)
            : UIColor(white: 0.15, alpha: 0.7)
        btn.strokeColor = enabled ? UIColor.cyan.withAlphaComponent(0.6) : UIColor(white: 0.3, alpha: 1)
        btn.lineWidth = 1
        btn.position = pos
        btn.name = tag
        btn.zPosition = 1

        let iconLabel = SKLabelNode(text: icon)
        iconLabel.fontSize = 16
        iconLabel.verticalAlignmentMode = .center
        iconLabel.position = CGPoint(x: -28, y: 4)
        iconLabel.name = tag

        let nameLabel = SKLabelNode(text: name.components(separatedBy: " ").last ?? name)
        nameLabel.fontName = "AvenirNext-Bold"
        nameLabel.fontSize = 9
        nameLabel.fontColor = enabled ? .white : UIColor(white: 0.4, alpha: 1)
        nameLabel.horizontalAlignmentMode = .left
        nameLabel.position = CGPoint(x: -14, y: 8)
        nameLabel.name = tag

        let costLabel = SKLabelNode(text: "\(cost)💰")
        costLabel.fontName = "AvenirNext-Regular"
        costLabel.fontSize = 9
        costLabel.fontColor = enabled ? .yellow : UIColor(white: 0.4, alpha: 1)
        costLabel.horizontalAlignmentMode = .left
        costLabel.position = CGPoint(x: -14, y: -6)
        costLabel.name = tag

        btn.addChild(iconLabel)
        btn.addChild(nameLabel)
        btn.addChild(costLabel)
        return btn
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
