import SpriteKit

// MARK: - Isometric Map Node

/// Renders the isometric tile grid: ground, path tiles, build spots, and the planet core.
/// Also handles touch events for tile selection and routes them to the delegate.

protocol IsometricMapNodeDelegate: AnyObject {
    func isometricMap(_ map: IsometricMapNode, didTapBuildSpot col: Int, row: Int)
    func isometricMap(_ map: IsometricMapNode, didTapTower col: Int, row: Int)
}

final class IsometricMapNode: SKNode {

    // MARK: - Properties

    weak var delegate: IsometricMapNodeDelegate?

    let levelData: LevelData

    private var tileNodes: [[SKShapeNode?]]     // [col][row]
    private var highlightedTile: (col: Int, row: Int)?

    // Convenience references
    private let cols: Int
    private let rows: Int

    // MARK: - Init

    init(levelData: LevelData) {
        self.levelData = levelData
        self.cols = levelData.gridSize.cols
        self.rows = levelData.gridSize.rows
        self.tileNodes = Array(repeating: Array(repeating: nil, count: levelData.gridSize.rows),
                               count: levelData.gridSize.cols)
        super.init()
        isUserInteractionEnabled = true
        buildTileMap()
    }

    required init?(coder aDecoder: NSCoder) { fatalError("init(coder:) not implemented") }

    // MARK: - Build

    private func buildTileMap() {
        let pathSet   = Set(levelData.path.map       { GridCoord(col: $0[0], row: $0[1]) })
        let buildSet  = Set(levelData.buildSpots.map { GridCoord(col: $0[0], row: $0[1]) })
        let coreCoord = GridCoord(col: levelData.corePoint[0],  row: levelData.corePoint[1])
        let spawnCoord = GridCoord(col: levelData.spawnPoint[0], row: levelData.spawnPoint[1])

        for col in 0..<cols {
            for row in 0..<rows {
                let coord = GridCoord(col: col, row: row)
                let tile = makeTile(at: col, row: row)

                if coord == coreCoord {
                    tile.fillColor = UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1)   // gold
                    tile.strokeColor = UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1)
                } else if coord == spawnCoord {
                    tile.fillColor = UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1)   // red
                    tile.strokeColor = .red
                } else if pathSet.contains(coord) {
                    tile.fillColor = UIColor(red: 0.35, green: 0.35, blue: 0.55, alpha: 1) // blue-gray
                    tile.strokeColor = UIColor(red: 0.5, green: 0.5, blue: 0.7, alpha: 1)
                } else if buildSet.contains(coord) {
                    tile.fillColor = UIColor(red: 0.15, green: 0.4, blue: 0.2, alpha: 1)   // green
                    tile.strokeColor = UIColor(red: 0.3, green: 0.6, blue: 0.3, alpha: 1)
                } else {
                    tile.fillColor = UIColor(red: 0.1, green: 0.12, blue: 0.2, alpha: 1)   // dark space
                    tile.strokeColor = UIColor(red: 0.2, green: 0.22, blue: 0.35, alpha: 1)
                }

                // Isometric depth: higher row = drawn first (behind lower rows)
                tile.zPosition = CGFloat(cols + rows - col - row)

                tileNodes[col][row] = tile
                addChild(tile)
            }
        }
    }

    private func makeTile(at col: Int, row: Int) -> SKShapeNode {
        let center = PathfindingManager.screenPosition(col: col, row: row)
        let w = PathfindingManager.tileWidth
        let h = PathfindingManager.tileHeight

        // Diamond (rhombus) shape for isometric tile
        let path = CGMutablePath()
        path.move(to: CGPoint(x: center.x,       y: center.y + h/2))   // top
        path.addLine(to: CGPoint(x: center.x + w/2, y: center.y))      // right
        path.addLine(to: CGPoint(x: center.x,       y: center.y - h/2)) // bottom
        path.addLine(to: CGPoint(x: center.x - w/2, y: center.y))      // left
        path.closeSubpath()

        let tile = SKShapeNode(path: path)
        tile.lineWidth = 1
        tile.name = "tile_\(col)_\(row)"
        return tile
    }

    // MARK: - Public API

    /// Visually highlight a build spot (e.g., when hovering or selecting).
    func highlight(col: Int, row: Int) {
        clearHighlight()
        highlightedTile = (col, row)
        tileNodes[col][row]?.strokeColor = .white
        tileNodes[col][row]?.lineWidth = 2
    }

    func clearHighlight() {
        if let prev = highlightedTile {
            tileNodes[prev.col][prev.row]?.strokeColor = UIColor(white: 0.4, alpha: 1)
            tileNodes[prev.col][prev.row]?.lineWidth = 1
        }
        highlightedTile = nil
    }

    /// Updates tile appearance to show a placed tower (changes fill color).
    func markTowerPlaced(col: Int, row: Int) {
        tileNodes[col][row]?.fillColor = UIColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 1) // cyan-blue
    }

    func markTowerRemoved(col: Int, row: Int) {
        // Restore green build-spot color
        tileNodes[col][row]?.fillColor = UIColor(red: 0.15, green: 0.4, blue: 0.2, alpha: 1)
    }

    // MARK: - Touch Handling

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let localPoint = touch.location(in: self)
        guard let (col, row) = PathfindingManager.gridPosition(
            screenPoint: localPoint, cols: cols, rows: rows) else { return }

        // Check if a tower is already here
        if isBuildSpot(col: col, row: row) {
            if hasTower(col: col, row: row) {
                delegate?.isometricMap(self, didTapTower: col, row: row)
            } else {
                delegate?.isometricMap(self, didTapBuildSpot: col, row: row)
            }
        }
    }

    // MARK: - Helpers

    func isBuildSpot(col: Int, row: Int) -> Bool {
        levelData.buildSpots.contains { $0[0] == col && $0[1] == row }
    }

    private func hasTower(col: Int, row: Int) -> Bool {
        // Ask the tile color as a proxy (GameScene keeps authoritative state)
        tileNodes[col][row]?.fillColor == UIColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 1)
    }
}

// MARK: - GridCoord (Hashable helper)

private struct GridCoord: Hashable {
    let col: Int
    let row: Int
}
