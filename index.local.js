console.log( 'Running Node locally...' );

import dotenv from 'dotenv/config';
import app from './dist/app.js';

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.info(`Agentic Profile Node Service listening on http://localhost:${port}`);
});