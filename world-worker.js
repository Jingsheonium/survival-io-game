
// Background Worker for World Data
// Handles fetching chunks and basic processing to keep Main Thread freeze-free.

const SERVER_URL = 'http://localhost:25565';
const CHUNK_SIZE = 16;

self.onmessage = async function (e) {
    const { type, cx, cy } = e.data;

    if (type === 'fetchChunk') {
        try {
            const res = await fetch(`${SERVER_URL}/chunk?x=${cx}&y=${cy}`);
            if (res.ok) {
                const dataStr = await res.text();

                // Parse Data String (010101...) into generic array
                // We send back a flat array or 2D array? 
                // Transferable objects (Int8Array) are faster.
                // Let's send a flat Int8Array.

                const buffer = new Int8Array(CHUNK_SIZE * CHUNK_SIZE);
                for (let i = 0; i < buffer.length; i++) {
                    buffer[i] = parseInt(dataStr[i] || '0');
                }

                // Send back to Main Thread
                // Mark as Transferable for zero-copy if possible (though small size doesn't matter much)
                self.postMessage({
                    type: 'chunkData',
                    cx, cy,
                    data: buffer
                }, [buffer.buffer]);
            } else {
                self.postMessage({ type: 'chunkError', cx, cy });
            }
        } catch (err) {
            self.postMessage({ type: 'chunkError', cx, cy, error: err.message });
        }
    }
};
