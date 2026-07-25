import Foundation
import CoreGraphics

// MARK: - Isometric Coordinate Math

/// Converts between isometric grid coordinates and screen (SpriteKit scene) coordinates.
///
/// Standard isometric projection:
///   screen_x = (col - row) * tileWidth  / 2
///   screen_y = (col + row) * tileHeight / 2
///
/// The origin (col=0, row=0) maps to CGPoint.zero in the node's local coordinate space.
/// The caller (IsometricMapNode) offsets the whole map so it appears centered on screen.

enum PathfindingManager {

    static let tileWidth: CGFloat  = 128
    static let tileHeight: CGFloat = 64

    // MARK: - Grid → Screen

    /// Returns the center of the isometric tile at (col, row) in local map coordinates.
    static func screenPosition(col: Int, row: Int) -> CGPoint {
        let x = CGFloat(col - row) * tileWidth  / 2
        let y = CGFloat(col + row) * tileHeight / 2
        return CGPoint(x: x, y: y)
    }

    // MARK: - Screen → Grid

    /// Inverse of screenPosition. Returns nil if the point doesn't fall inside a valid tile.
    static func gridPosition(screenPoint: CGPoint, cols: Int, rows: Int) -> (col: Int, row: Int)? {
        // Invert the isometric projection:
        //   col = (x / (tileWidth/2)  + y / (tileHeight/2)) / 2
        //   row = (y / (tileHeight/2) - x / (tileWidth/2))  / 2
        let halfW = tileWidth  / 2
        let halfH = tileHeight / 2
        let col = Int(((screenPoint.x / halfW) + (screenPoint.y / halfH)) / 2)
        let row = Int(((screenPoint.y / halfH) - (screenPoint.x / halfW)) / 2)
        guard col >= 0, row >= 0, col < cols, row < rows else { return nil }
        return (col, row)
    }

    // MARK: - Path Conversion

    /// Converts an array of [col, row] waypoints (from level JSON) to screen-space CGPoints.
    static func pathInScreenCoordinates(waypoints: [[Int]]) -> [CGPoint] {
        waypoints.compactMap { pair -> CGPoint? in
            guard pair.count == 2 else { return nil }
            return screenPosition(col: pair[0], row: pair[1])
        }
    }

    // MARK: - Map Offset

    /// Returns the offset needed to center an (cols × rows) map within a scene of the given size.
    static func mapOffset(cols: Int, rows: Int, in sceneSize: CGSize) -> CGPoint {
        // Extent of the grid:
        // rightmost tile: col = cols-1, row = 0  →  x_max = (cols-1) * tileWidth/2
        // leftmost tile:  col = 0,      row = rows-1 → x_min = -(rows-1) * tileWidth/2
        // topmost tile:   col = cols-1, row = rows-1 → y_max = (cols+rows-2) * tileHeight/2
        let mapWidth  = CGFloat(cols + rows - 2) * tileWidth  / 2
        let mapHeight = CGFloat(cols + rows - 2) * tileHeight / 2
        // Center the map in the scene (SpriteKit: y=0 is bottom of scene)
        let offsetX = -CGFloat(rows - 1) * tileWidth  / 2      // shift so col=0,row=0 isn't at left edge
        let offsetY = (sceneSize.height - mapHeight) / 2        // vertical center
        return CGPoint(x: offsetX, y: offsetY)
    }
}
