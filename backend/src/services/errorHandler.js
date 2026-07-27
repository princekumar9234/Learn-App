// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    console.error('🔥 Global Error Handler:', err.message);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).send(`
            <div style="font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto;text-align:center">
                <h2 style="color:#ef4444">📁 File Too Large</h2>
                <p>PDF size limit <strong>50MB</strong> se zyada hai. Choti file use karein.</p>
                <a href="javascript:history.back()" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;background:#6366f1;color:white;border-radius:8px;text-decoration:none">← Go Back</a>
            </div>
        `);
    }

    if (err.status === 413 || err.type === 'entity.too.large') {
        return res.status(413).send(`
            <div style="font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto;text-align:center">
                <h2 style="color:#ef4444">📁 Upload Too Large</h2>
                <p>File 50MB se zyada hai. Choti file use karein.</p>
                <a href="javascript:history.back()" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;background:#6366f1;color:white;border-radius:8px;text-decoration:none">← Go Back</a>
            </div>
        `);
    }

    if (res.headersSent) return next(err);
    res.status(500).send(`
        <div style="font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto;text-align:center">
            <h2 style="color:#ef4444">⚠️ Server Error</h2>
            <p>${err.message || 'Kuch gadbad ho gayi. Please dobara try karein.'}</p>
            <a href="javascript:history.back()" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;background:#6366f1;color:white;border-radius:8px;text-decoration:none">← Go Back</a>
        </div>
    `);
};
