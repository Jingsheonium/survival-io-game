# tyls.io

A Minecraft-inspired 2D survival game built with PixiJS.

## Controls
- **WASD / Arrows**: Move player
- **Mouse**: Aim
- **Left Click**: Mine dirt / Remove block
- **Right Click**: Place grass / Add block
- **Scroll Wheel**: Zoom (in Frelook mode)
- **Alt**: Toggle Freelook Mode
- **G**: Toggle Debug Grid

## Game Mechanics
- **Infinite Terrain**: Procedurally generated with Perlin noise
- **Dual Grid System**: Grass tiles are generated on the intersections of the dirt grid for smoother terrain transitions
- **Chunk System**: World is divided into 16x16 chunks for efficient rendering
- **LOD (Level of Detail)**: Zooming out switches to simplified chunk rendering for performance

## Known Issues
- **Mining Lag**: Breaking or placing blocks may cause a momentary stutter. This is because the entire chunk (and potentially neighbors) needs to be re-rendered to update the terrain transitions. This is a known optimization target for future updates.
- **Visual Glitches**: Some tile transitions at chunk boundaries might appear cut off or misaligned in certain browser resolutions and tiles images are cut off by anchoring.
- things dont update like block placed and hihglighjt area unlessm y mosue is moved or pressed.