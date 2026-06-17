// src/utils/agentClient.js
// Create an axios instance with baseURL: process.env.AGENT_SERVICE_URL 
// and a 60s timeout (agent pipeline can be slow). Export it. 
// All controllers that call FastAPI use this instead of raw axios to keep the base URL in one place.
import axios from 'axios';

const agentClient = axios.create({
    baseURL: process.env.AGENT_SERVICE_URL,
    timeout: 60000,
})

export default agentClient;