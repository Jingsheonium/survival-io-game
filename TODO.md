# tyls.io Development TODO

## 🐛 Known Issues
- [ ] **Mouse Update Lag**: Game elements (highlight, placed blocks) don't seem to update visually unless the mouse is moved. (Suspect render/input loop issue).
- [ ] **Mining Lag**: Breaking/placng blocks causes stutter due to full chunk re-rendering. SAME FOR GRID RENDERING
- [ ] **Visual Glitches**: Tile transitions at chunk boundaries can appear cut off or misaligned. half and quarter tiles.

## 🔮 Future Features
- [ ] **Smooth Interaction**: Better dragging/continuous mining.
- [ ] **UI System**: Hotbar, Settings, Inventory.
- [ ] **Height System**: Add terrain depth/elevation.
- [ ] **Performance**: Optimize chunk updates (partial updates instead of full rebuild).
