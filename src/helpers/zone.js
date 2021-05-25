export default class Zone{
    constructor(scene){
        this.renderZone = (x, y) => {
            let dropZone = scene.add.zone(x, y, 64, 64).setRectangleDropZone(64, 64);
            dropZone.setData({
                used:  false,
                cant: 0
            });
            return dropZone;
        }

        this.renderZoneT = (x, y, wx, wy) => {
            let dropZone = scene.add.zone(x, y, wx, wy).setRectangleDropZone(wx, wy);
            dropZone.setData({
                used:  false,
                cant: 0
            });
            return dropZone;
        }

        this.renderOutline = (dropZone) => {
            let dropZoneOutline = scene.add.graphics();
            dropZoneOutline.lineStyle(4, 0xff69b4);
            dropZoneOutline.strokeRect(dropZone.x - dropZone.input.hitArea.width/2, dropZone.y - dropZone.input.hitArea.height/2, dropZone.input.hitArea.width, dropZone.input.hitArea.height)
        }

    }
}