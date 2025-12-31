// ...existing code from animora-ai/backend/controllers/chatController.js...
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Disease from "../models/diseaseModel.js";
import { fileURLToPath } from 'url';
import { getAIResponse } from '../utils/aiAgent.js';
// ...rest of the code as previously read...
